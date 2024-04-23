const con = require('./connection');

// to show all the channels viewable from a certain location (longitude) 
// (For simplicity, assume the satellites coverage is +/- 10 degrees around the satellite longitude).

// position is in format 159.0°E string in database, take only the numerical part and query on +/- 10 degrees
// change it back to string and query on it

// Query function
const nearestToLocationResult = async (longitude, lowerLim, upperLim) => {
    try {
        let nearestToLocationQry = 
            'SELECT  c.tvChannelLogo, c.tvChannelName, c.tvChannelWebsite, c.tvChannelCountry, position, s.satellite from have h ' + 
                'LEFT OUTER JOIN    satellites s    ON h.satellite = s.satellite ' +
                'INNER JOIN         channels c      ON c.tvChannelName = h.tvchannel ' +
                `WHERE ABS(CAST(SUBSTRING(position, 1, LENGTH(position) - 2) AS DECIMAL) - ${longitude} ) <= 10 ` +
                `LIMIT ${lowerLim}, ${upperLim};`;

        const [rows, fields] = await con.query(nearestToLocationQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

//Show the top 5 TV Providers by number of channels
const top5ProvidersResult = async () => {
    try {
        const top5ProvidersQry = 
            'SELECT p.providerLogo, p.providerName, COUNT(*) AS noOfChannels FROM providers p ' +
                'LEFT OUTER JOIN channels c on c.providerName = p.providerName ' +
                'GROUP BY 1,2 ' +
                'ORDER BY noOfChannels DESC ' +
                'LIMIT 5;';

        const [rows, fields] = await con.query(top5ProvidersQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

//and the average number of satellites each of their channel is available on.
const top5ProviderCoverageResult = async () => {
    try {
        const top5ProviderCoverageQry = 
            'SELECT p.providerLogo, p.providerName, p.satellite, ' +
            '    AVG(sat_count) AS avg_satellites_per_channel ' +
            'FROM providers p ' +
            'INNER JOIN channels c ON c.providerName = p.providerName ' +
            'INNER JOIN have h ON h.tvchannel = c.tvChannelName ' +
            'INNER JOIN ( ' +
            '    SELECT tvChannelName, COUNT(DISTINCT satellite) AS sat_count ' +
            '    FROM channels c2 ' +
            '    INNER JOIN have h ON h.tvchannel = c2.tvChannelName ' +
            '    GROUP BY tvChannelName ' +
            ') AS channel_satellites ON channel_satellites.tvChannelName = c.tvChannelName ' +
            'GROUP BY 1,2,3 ' +
            'ORDER BY avg_satellites_per_channel DESC ' +
            'LIMIT 5;';

        const [rows, fields] = await con.query(top5ProviderCoverageQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

//Show the top 5 rockets in terms of the number of satellites they put in orbit.
const top5LaunchingRocketsResult = async () => {
    try {
        const top5LaunchingRocketsQry = 
            'SELECT launchRocket, COUNT(*) AS satellite_count ' +
            'FROM satellites ' +
            'GROUP BY launchRocket ' +
            'ORDER BY satellite_count DESC ' +
            'LIMIT 5;'
        
        const [rows, fields] = await con.query(top5LaunchingRocketsQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

//Show the top 5 growing satellites using the number of channels they host compared to their launch date

const top5GrowingSatellitesResult = async () => {
    try {
        const top5GrowingSatellitesQry = 
            'SELECT s.satellite, COUNT(*) / (DATEDIFF(CURDATE(), launchDate) / 365) AS channel_count_per_year, launchDate ' +
            'FROM satellites s ' +
            'INNER JOIN have h ON h.satellite = s.satellite ' +
            'GROUP BY s.satellite ' +
            'ORDER BY channel_count_per_year DESC, launchDate ASC ' +
            'LIMIT 5;';

        const [rows, fields] = await con.query(top5GrowingSatellitesQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getAllLanguages = async () => {
    try { 
        // get all languages
        const languagesQry = 
            'SELECT DISTINCT SUBSTRING(lang, 1, 3) AS lang FROM have ' +
            'WHERE length(lang) = 3;';

        const [languages, fields1] = await con.query(languagesQry);

        return languages;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

// Show the top 5 channels for each language by the number of satellites they are hosted on.
// Language is in have table, stored as a string in the form 'EngAraGerFre' etc. 
// each language distinguished by the run of characters after an uppercase letter

const top5ChannelsByLanguageResult = async (language) => {
    try {
        let top5ChannelArray = [];


        let top5ChannelsByLanguageQry =
            'SELECT c.tvChannelLogo, h.tvchannel, h.lang, COUNT(DISTINCT satellite) AS no_of_sat FROM have h ' +
            'INNER JOIN channels c on c.tvChannelName = h.tvchannel ' +
            `WHERE length(lang) = 3 AND lang = "${language}" ` +
            'GROUP BY 1,2,3 ' +
            'ORDER BY no_of_sat DESC ' +
            'LIMIT 5;';

        console.log(top5ChannelsByLanguageQry);
            
        const [rows, fields] = await con.query(top5ChannelsByLanguageQry);
        top5ChannelArray.push(rows);

        return top5ChannelArray;
    } catch (error) {
        console.error(error);
        return [];
    }
}

//Show the list of channels, filtered by region, satellite, HD/SD and/or language

const filteredChannelsResult = async (region, satellite, video, language) => {
    try {
        // on null do not append condition for parameter, list of conditions to be appended
        // WHERE c.tvChannelCountry = '' AND s.satellite = '' AND h.video LIKE '' AND lang = '';

        let condition = 'WHERE ';
        if (region !== '\"\"') condition += `s.region = ${region} AND `;
        if (satellite !== '\"\"') condition += `s.satellite = ${satellite} AND `;
        if (video !== '\"\"') condition += `h.video = ${video} AND `;
        if (language !== '\"\"') condition += `lang = ${language} AND `;
        // remove last AND if it is not 'WHERE ' else make it ''
        condition = condition === 'WHERE ' ? '' : condition.slice(0, -4);

        let filteredChannelsQry = 
        'SELECT c.tvChannelName, c.tvChannelLogo, c.tvChannelWebsite, c.tvChannelCountry, position, s.satellite from have h ' +
        'LEFT OUTER JOIN    satellites s    ON h.satellite = s.satellite ' +
        'INNER JOIN         channels c      ON c.tvChannelName = h.tvchannel ' +
        `${condition} ` + 
        'LIMIT 20;'

        console.log(filteredChannelsQry);

        const [rows, fields] = await con.query(filteredChannelsQry);
        return rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

module.exports = {
    nearestToLocationResult,
    top5ProvidersResult,
    top5ProviderCoverageResult,
    top5LaunchingRocketsResult,
    top5GrowingSatellitesResult,
    top5ChannelsByLanguageResult,
    filteredChannelsResult,
    getAllLanguages };
