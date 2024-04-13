const express = require('express');
const cors = require('cors');
const con = require('./sql/connection');
const { top5ProvidersResult,      
        nearestToLocationResult,
        top5ProviderCoverageResult,
        top5LaunchingRocketsResult,
        top5GrowingSatellitesResult,
        top5ChannelsByLanguageResult,
        filteredChannelsResult } = require('./sql/queries'); 

require('dotenv').config();

// Create an instance of Express
const app = express();
app.use(cors());

// Define routes
app.get('/', (req, res) => {
    res.send('You are Connected');
});

// TODO: change all these to query here, query string constants in queries.js only
app.get('/top5Providers', async (req, res) => {
  res.json(await top5ProvidersResult());
});

app.get('/nearestToLocation', async (req, res) => { 
  const { longitude, lowerLim, upperLim } = req.query;
  res.json(await nearestToLocationResult(longitude, lowerLim, upperLim));
});

app.get('/top5ProviderCoverage', async (req, res) => {
  res.json(await top5ProviderCoverageResult());
});

app.get('/top5LaunchingRockets', async (req, res) => {
  res.json(await top5LaunchingRocketsResult());
});

app.get('/top5GrowingSatellites', async (req, res) => {
  res.send(await top5GrowingSatellitesResult());
});

app.get('/top5ChannelsByLanguage', async (req, res) => { 
  res.send(await top5ChannelsByLanguageResult());
});

app.get('/filteredChannels', async (req, res) => {
  const { region, satellite, video, language } = req.query;
  const filteredChannels = await filteredChannelsResult(region, satellite, video, language);
  res.send(filteredChannels);
});

// Start the server
const port = process.env.LISTENING_PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});