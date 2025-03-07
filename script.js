const songsList = document.getElementById("songs-list")
const youtubeContainer = document.getElementById("youtube-container")
const inputBar = document.getElementById("input-bar")
const displayButton = document.getElementById("display-button")
const saveButton = document.getElementById("save-button")
const deleteButton = document.getElementById("delete-button")

// function to fetch songs
async function fetchSongs(){
    const response = await fetch("http://localhost:3000/songs");
    console.log(response)
    const songs = await response.json();
    displaySongs(songs);
}

// function to display songs
function displaySongs(songs){
    songsList.innerHTML = ""
    songs.forEach((song) => {
        const element = document.createElement("div")
        element.textContent = song
        element.onclick = () => {
            searchYoutube(song)
        }
        songsList.appendChild(element)
    });
}

// function to display songs
displayButton.addEventListener("click", fetchSongs)

// function to add songs
saveButton.addEventListener("click", saveSong)

// function to delete songs
deleteButton.addEventListener("click", deleteSong)

// function to receive song input and 
async function saveSong() {
    const title = inputBar.value.trim(); // Get input value

    if (!title) {
        alert("Please enter a song title!");
        return;
    }

    const response = await fetch("http://localhost:3000/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });

    if (response.ok) {
        alert("Song added successfully!");
        inputBar.value = ""; // Clear input field
        fetchSongs(); // Refresh the song list
    } else {
        alert("Failed to add song.");
    }
}

async function deleteSong() {
    const title = inputBar.value.trim()
    
    if (!title) {
        alert("there are no such song")
        return;
    }
    
    const response = await fetch("http://localhost:3000/songs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });
    
    if (response.ok) {
        alert("Song deleted successfully!");
        inputBar.value = ""; // Clear input field
        fetchSongs(); // Refresh the song list
    } else {
        alert("Failed to delete song.");
    }
    

}

// function search songs by youtube
async function searchYoutube(query){
    const response = await fetch(`http://localhost:3000/youtube?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.videoId) {
        youtubeContainer.innerHTML = `
            <h3>${data.title}</h3>
            <iframe width="560" height="315" 
                src="https://www.youtube.com/embed/${data.videoId}" 
                frameborder="0" allowfullscreen>
            </iframe>
        `;
    } else {
        youtubeContainer.innerHTML = "<p>No video found.</p>";
    }
}

