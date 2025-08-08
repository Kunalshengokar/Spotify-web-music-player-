console.log("Welcome to the spotify music player");
let currentSong = new Audio();
let songs;
let currFolder;
//get all songs

function secondsTOMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
        <img src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Kunal</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    `;
        songUL.appendChild(li);
    }


    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => { // Applied Array.from to the HTMLCollection
        element.addEventListener("click", () => {
            playMusic(element.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs

}



const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    // currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0])

            // Get the metadeta of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="play">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 100 100"> <circle cx="50" cy="50" r="48" fill="#1DB954" stroke="#1ED760" stroke-width="4" />
        <polygon points="42,33 42,67 68,50" fill="white" />
        </svg>
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
        </div>`
        }

        //Load the playlist whenever card ias clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        });

    }
}

//Main function
async function main() {
    //Get the List of all the Songs
    songs = await getsongs("songs/ncs")
    playMusic(songs[0], true)

    //display all the songs in the page
    displayAlbums()

    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play(); // <- You forgot this
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })


    //Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsTOMinutesSeconds(currentSong.currentTime)}/${secondsTOMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });



    //Add event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent * 100 + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })



    //Add event listner for hamburger
    document.querySelector(".hamburgercontainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })




    //Add event listner to previous song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })



    //Add event listner to next song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })




    //add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })




}

main()