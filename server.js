const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');
const yts = require("yt-search");
const ytdl = require('ytdl-core');
const { Tiktok } = require("@xct007/tiktok-scraper");
const swaggerUi = require('swagger-ui-express');
const redoc = require('redoc-express');
const swaggerDocument = JSON.parse(fs.readFileSync('public/swagger.json'))
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function stalkGitHub(username) {
try {
const apiUrl = `https://api.github.com/users/${username}`;
const response = await axios.get(apiUrl);
const userData = response.data;


const followersUrl = userData.followers_url;
const reposUrl = userData.repos_url;

const followersResponse = await axios.get(followersUrl);
const reposResponse = await axios.get(reposUrl);

const followersData = followersResponse.data.map(follower => follower.login);
const numOfRepos = reposResponse.data.length;


const profileData = {
status: 'success',
creator: 'SatganzDevs',
username: userData.login,
name: userData.name,
avatarUrl: userData.avatar_url,
bio: userData.bio,
followers: followersData,
numOfRepos: numOfRepos,
};

return profileData;
} catch (error) {
console.error('Failed to stalk GitHub:', error.message);
const errorData = {
status: 'failed',
error: error.message,
creator: 'SatganzDevs',
};
throw errorData;
}
}


async function downloadTikTokPhotolog(text) {
try {
const url = `https://dlpanda.com/id?url=${text}&token=G7eRpMaa`;
const response = await axios.get(url);
const html = response.data;
const $ = cheerio.load(html);
const imgSrc = [];
$("div.col-md-12 > img").each((index, element) => {
imgSrc.push($(element).attr("src"));
});

return imgSrc;
} catch (error) {
console.error('Failed to download TikTok photolog:', error.message);
throw new Error('Failed to download TikTok photolog');
}
}
async function downloadTikTokVideo(url) {
try {
const tiktokData = await Tiktok(url);
const videoUrl = tiktokData.download.nowm;
const creator = 'SatganzDevs';

return { creator, videoUrl };
} catch (error) {
console.error('Failed to download TikTok video:', error.message);
throw new Error('Failed to download TikTok video');
}
}


function checkAPIKey(req, res, next) {
const apiKey = req.query.apikey;

if (!apiKey || apiKey !== 'SatganzDevs') {
return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
}

next();
}


async function searchYouTubeVideos(query) {
try {
const { videos } = await yts(query);
const searchResults = videos.map(video => ({
title: video.title,
url: video.url,
creator: 'SatganzDevs', 
}));
return searchResults;
} catch (error) {
console.error('Failed to search YouTube videos:', error.message);
throw new Error('Failed to search YouTube videos');
}
}


async function downloadYouTubeVideo(url) {
try {
const info = await ytdl.getInfo(url);
const videoUrl = info.formats[0].url;
const creator = 'SatganzDevs'; 

return { creator, videoUrl };
} catch (error) {
console.error('Failed to download YouTube video:', error.message);
throw new Error('Failed to download YouTube video');
}
}

// Batas Function Dan App. made by ❤️ SatganzDevs
// Github : SatganzDevs
// WhatsApp : 6281316701742
//
//
//
//

app.get('/search/youtube', checkAPIKey, async (req, res) => {
try {
const query = req.query.query;
if (!query) {
return res.status(400).json({ error: 'Query parameter is missing.' });
}

const searchResults = await searchYouTubeVideos(query);
res.json(searchResults);
} catch (error) {
res.status(500).json({ error: error.message });
}
});

app.get('/downloader/youtube', checkAPIKey, async (req, res) => {
try {
const url = req.query.url;
if (!url) {
return res.status(400).json({ error: 'URL parameter is missing.' });
}

const { videoUrl, creator } = await downloadYouTubeVideo(url);

res.json({ videoUrl, creator });
} catch (error) {
res.status(500).json({ error: error.message });
}
});
app.get('/stalk/github', checkAPIKey, async (req, res) => {
try {
const username = req.query.username;
if (!username) {
return res.status(400).json({ error: 'Username parameter is missing.' });
}

const profileData = await stalkGitHub(username);
res.json(profileData);
} catch (error) {
res.status(500).json(error);
}
});

app.get('/downloader/tiktokimage', checkAPIKey, async (req, res) => {
try {
const url = req.query.url;
const imgSrc = await downloadTikTokPhotolog(url);
res.json({ imgSrc });
} catch (error) {
res.status(500).json({ error: error.message });
}
});

app.get('/downloader/tiktok', checkAPIKey, async (req, res) => {
try {
const url = req.query.url;


const { videoUrl, creator } = await downloadTikTokVideo(url);


res.json({ videoUrl, creator });
} catch (error) {
res.status(500).json({ error: error.message });
}
});

app.get('/login', (req, res) => {
res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
res.sendFile(__dirname + '/public/register.html');
});

app.get('/price', (req, res) => {
res.sendFile(__dirname + '/public/price.html');
});
app.get('/public/*', (req, res) => {
const filePath = path.join(__dirname, req.url);
res.sendFile(filePath);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
customCss: `
.swagger-ui .topbar-wrapper .link {
display: none;
}
`,
customSiteTitle: 'SatganzDevs - Api || Docs', 
}));


app.listen(PORT, () => {
const deployedUrl = process.env.VERCEL_URL || `http://localhost:${PORT}`;
  console.log(`Server berjalan di ${deployedUrl}`);
});
