const express = require('express');
const cors = require('cors');
const con = require('./sql/connection');
const { top5ProvidersResult,      
        nearestToLocationResult,
        top5ProviderCoverageResult,
        top5LaunchingRocketsResult,
        top5GrowingSatellitesResult,
        top5ChannelsByLanguageResult,
        filteredChannelsResult } = require('./sql/sideTabFilter'); 

require('dotenv').config();

// Create an instance of Express
const app = express();
app.use(cors());

// Define routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/top5Providers', (req, res) => {
  const top5Providers = top5ProvidersResult();
  res.send(top5Providers);
});

app.get('/nearestToLocation', (req, res) => { 
  const { longitude, lowerLim, upperLim } = req.query;
  const nearestToLocation = nearestToLocationResult(longitude, lowerLim, upperLim);
  res.send(nearestToLocation);
});

app.get('/top5ProviderCoverage', (req, res) => {
  const top5ProviderCoverage = top5ProviderCoverageResult();
  res.send(top5ProviderCoverage);
});

app.get('/top5LaunchingRockets', (req, res) => {
  const top5LaunchingRockets = top5LaunchingRocketsResult();
  res.send(top5LaunchingRockets);
});

app.get('/top5GrowingSatellites', (req, res) => {
  const top5GrowingSatellites = top5GrowingSatellitesResult();
  res.send(top5GrowingSatellites);
});

app.get('/top5ChannelsByLanguage', (req, res) => { 
  const top5ChannelsByLanguage = top5ChannelsByLanguageResult();
  res.send(top5ChannelsByLanguage);
});

app.get('/filteredChannels', (req, res) => {
  const { region, satellite, video, language } = req.query;
  const filteredChannels = filteredChannelsResult(region, satellite, video, language);
  res.send(filteredChannels);
});

// Start the server
const port = process.env.LISTENING_PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

con.query("SELECT * FROM providers LIMIT 5;").on("result", function (row) {
  console.log(row);
});