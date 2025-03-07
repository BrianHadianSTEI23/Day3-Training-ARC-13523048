const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use("/asset", express.static(path.join(__dirname, "asset")));

const YOUTUBE_API_KEY = "AIzaSyDhn6wjMqQLhRD4ZCUqzAvPWHzd5tVhHsw";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const songsPath = path.join(__dirname, "/asset/songs.json");

// Function to get songs as an array
function getSongs() {
    try {
        const file = fs.readFileSync(songsPath, "utf-8");
        return JSON.parse(file); // Expecting ["Song 1", "Song 2"]
    } catch (error) {
        return [];
    }
}

// Function to save songs as an array
function saveSongs(songs) {
    try {
        fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving songs:", error);
    }
}

// GET list of songs
app.get("/songs", (req, res) => {
    res.json(getSongs());
});

// POST add new song
app.post("/songs", (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    const songs = getSongs();
    if (songs.includes(title)) {
        return res.status(400).json({ error: "Song title already exists" });
    }

    songs.push(title);
    saveSongs(songs);

    res.status(201).json({ title });
});

// DELETE a song
app.delete("/songs", (req, res) => {
    const { title } = req.body
    
    if (!title) return res.status(404).json("Enter valid filename!")

    let songs = getSongs()

    if (!songs.includes(title)) return res.status(404).json("Filename not found!")
    
    songs = songs.filter(song => song !== title)
    
    saveSongs(songs)
    res.status(201).json({ title : " has been deleted"});
})
        
// GET YouTube video
app.get("/youtube", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
        const response = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                part: "snippet",
                q: query,
                key: YOUTUBE_API_KEY,
                maxResults: 1,
                type: "video"
            }
        });

        const video = response.data.items[0];
        if (video) {
            res.json({
                title: video.snippet.title,
                videoId: video.id.videoId
            });
        } else {
            res.status(404).json({ error: "No video found" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch YouTube video" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
