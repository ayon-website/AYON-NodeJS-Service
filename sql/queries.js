const con = require('./connection');

// to show all the channels viewable from a certain location (longitude) 
// (For simplicity, assume the satellites coverage is +/- 10 degrees around the satellite longitude).

// position is in format 159.0°E string in database, take only the numerical part and query on +/- 10 degrees
// change it back to string and query on it

// Query function
const nearestToLocationResult = (longitude, lowerLim, upperLim) => {
    let nearestToLocationQry = 
        'SELECT c.tvChannelName, c.tvChannelLogo, c.tvChannelWebsite, c.tvChannelCountry, position, s.satellite from have h' + 
            'LEFT OUTER JOIN    satellites s    ON h.satellite = s.satellite' +
            'INNER JOIN         channels c      ON c.tvChannelName = h.tvchannel' +
            `WHERE ABS(CAST(SUBSTRING(position, 1, LENGTH(position) - 2) AS DECIMAL) - ${longitude} ) <= 10` +
            `LIMIT ${lowerLim}, ${upperLim};`;
    
    return con.query(nearestToLocationQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}

//Show the top 5 TV Providers by number of channels
const top5ProvidersResult = () => {
    const top5ProvidersQry = 
        'SELECT p.providerName, COUNT(*) AS noOfChannels FROM providers p' +
            'LEFT OUTER JOIN channels c on c.providerName = p.providerName' +
            'GROUP BY p.providerName' +
            'ORDER BY noOfChannels DESC' +
            'LIMIT 5;';
    
    return con.query(top5ProvidersQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}

//and the average number of satellites each of their channel is available on.
const top5ProviderCoverageResult = () => {
    const top5ProviderCoverageQry = 
        'SELECT p.providerName, p.satellite,' +
        '    AVG(sat_count) AS avg_satellites_per_channel' +
        'FROM providers p' +
        'INNER JOIN channels c ON c.providerName = p.providerName' +
        'INNER JOIN have h ON h.tvchannel = c.tvChannelName' +
        'INNER JOIN (' +
        '    SELECT tvChannelName, COUNT(DISTINCT satellite) AS sat_count' +
        '    FROM channels c2' +
        '    INNER JOIN have h ON h.tvchannel = c2.tvChannelName' +
        '    GROUP BY tvChannelName' +
        ') AS channel_satellites ON channel_satellites.tvChannelName = c.tvChannelName' +
        'GROUP BY p.providerName, p.satellite' +
        'ORDER BY avg_satellites_per_channel DESC' +
        'LIMIT 5;';

    return con.query(top5ProviderCoverageQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}


//Show the top 5 rockets in terms of the number of satellites they put in orbit.
const top5LaunchingRocketsResult = () => {
    const top5LaunchingRocketsQry = 
        'SELECT launchRocket, COUNT(*) AS satellite_count' +
        'FROM satellites' +
        'GROUP BY launchRocket' +
        'ORDER BY satellite_count DESC' +
        'LIMIT 5;'

    return con.query(top5LaunchingRocketsQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}

//Show the top 5 growing satellites using the number of channels they host compared to their launch date

const top5GrowingSatellitesResult = () => {
    const top5GrowingSatellitesQry = 
        'SELECT s.satellite, COUNT(*) / (DATEDIFF(CURDATE(), launchDate) / 365) AS channel_count_per_year, launchDate' +
        'FROM satellites s' +
        'INNER JOIN have h ON h.satellite = s.satellite' +
        'GROUP BY s.satellite' +
        'ORDER BY channel_count_per_year DESC, launchDate ASC' +
        'LIMIT 5;';

    return con.query(top5GrowingSatellitesQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}

// Show the top 5 channels for each language by the number of satellites they are hosted on.
// Language is in have table, stored as a string in the form 'EngAraGerFre' etc. 
// each language distinguished by the run of characters after an uppercase letter



const top5ChannelsByLanguageResult = () => {
    let top5ChannelArray = [];
    //TODO: fix this shit and update by a query on the top languages by channels every now and then
    let languages =['Eng',
                    'Spa',
                    'Rus',
                    'Ara',
                    'Por',
                    'Fre',
                    'Hin',
                    'Chi',
                    'Ita',
                    'Ger',
                    'Per',
                    'Tam',
                    'Ind',
                    'Tur',
                    'Tel',
                    'Ben',
                    'Tgl',
                    'Vie',
                    'Mal',
                    'Hun',
                    'Bul',
                    'Rum',
                    'Tha',
                    'Kan',
                    'Urd',
                    'Amh',
                    'Cze',
                    'Ukr',
                    'Gre',
                    'Kor',
                    'Bur',
                    'Mar',
                    'Pan',
                    'Ori',
                    'Dut',
                    'Kur',
                    'Srp',
                    'Jpn',
                    'Mon',
                    'Asm',
                    'Guj',
                    'May',
                    'Slo',
                    'Pol',
                    'Hau',
                    'Swa',
                    'Uzb',
                    'Nep',
                    'Som',
                    'Aze',
                    'Alb',
                    'Bho',
                    'Geo',
                    'Tgk',
                    'Sin',
                    'Bos',
                    'Kaz',
                    'Hrv',
                    'Orm',
                    'Khm',
                    'Arm',
                    'Pus',
                    'Yue',
                    'Kir',
                    'Mac',
                    'Tuk',
                    'Slv',
                    'Heb',
                    'Yor',
                    'Gle',
                    'Lao',
                    'Swe',
                    'Uig',
                    'Tib',
                    'Tir',
                    'Div',
                    'Glg',
                    'Ber',
                    'Syr',
                    'Nor',
                    'Dan',
                    'Ewe',
                    'Tet',
                    'Qaa',
                    'Lah',
                    'Prs',
                    'Ibo',
                    'Bel',
                    'Baq',
                    'Gla',
                    'Afr',
                    'Lit',
                    'Ltz'];

    languages.forEach(language => { 
        let top5ChannelsByLanguageQry =
            'SELECT tvchannel, lang, COUNT(DISTINCT satellite) AS no_of_sat FROM have' +
            `WHERE length(lang) = 3 AND lang = \'${language}\'` +
            'GROUP BY tvchannel' +
            'ORDER BY no_of_sat DESC' +
            'LIMIT 5;' 

        con.query(top5ChannelsByLanguageQry, function (err, result) {
            if (err) console.log(err);
            top5ChannelArray.push(result);
        });
    });

    return top5ChannelArray;
}

//Show the list of channels, filtered by region, satellite, HD/SD and/or language

const filteredChannelsResult = (region, satellite, video, language) => {

    // on null do not append condition for parameter, list of conditions to be appended
    // WHERE c.tvChannelCountry = '' AND s.satellite = '' AND h.video LIKE '' AND lang = '';

    let condition = '';
    if (region) condition += `c.tvChannelCountry = ${region} AND `;
    if (satellite) condition += `s.satellite = ${satellite} AND `;
    if (video) condition += `h.video = ${video} AND `;
    if (language) condition += `lang = ${language} AND `;
    condition = condition.substring(0, condition.length - 5); // remove the last AND

    let filteredChannelsQry = 
    'SELECT c.tvChannelName, c.tvChannelLogo, c.tvChannelWebsite, c.tvChannelCountry, position, s.satellite from have h' +
    'LEFT OUTER JOIN    satellites s    ON h.satellite = s.satellite' +
    'INNER JOIN         channels c      ON c.tvChannelName = h.tvchannel' +
    `WHERE ${condition};`

    return con.query(filteredChannelsQry, function (err, result) {
        if (err) console.log(err);
        return result;
    });
}


module.exports = 
    nearestToLocationResult,
    top5ProvidersResult,
    top5ProviderCoverageResult,
    top5LaunchingRocketsResult,
    top5GrowingSatellitesResult,
    top5ChannelsByLanguageResult,
    filteredChannelsResult;
