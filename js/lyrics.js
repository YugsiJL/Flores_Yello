let currentLyrics = [];
let lyricElement = document.getElementById('lyrics');
let currentLineIndex = -1;
let animationFrameId = null;

const audio = document.getElementById('backgroundAudio');

let currentSongData = null;

function setLyrics(song) {
    currentSongData = song;
    currentLyrics = song.lyrics.sort((a, b) => a.time - b.time);
    currentLineIndex = -1;
    lyricElement.innerHTML = '';
    updateLyrics(audio.currentTime);
}

function getSpanishText(line) {
    // Songs originally in Spanish (lang: "es") → use text directly
    // Songs in other languages → use translation (which is Spanish)
    if (currentSongData && currentSongData.lang === 'es') {
        return line.text;
    }
    return line.translation || line.text;
}

function updateLyrics(currentTime) {
    // Apply offset if defined
    let offset = (currentSongData && currentSongData.offset) ? currentSongData.offset : 0;

    // The adjusted time takes only the shift (offset) into account, exactly 1:1 speed.
    let adjustedTime = currentTime - offset;

    let newIndex = -1;
    for (let i = 0; i < currentLyrics.length; i++) {
        if (adjustedTime >= currentLyrics[i].time) {
            newIndex = i;
        } else {
            break;
        }
    }
    if (newIndex !== currentLineIndex && newIndex !== -1) {
        currentLineIndex = newIndex;
        const line = currentLyrics[newIndex];
        const displayText = getSpanishText(line);
        lyricElement.classList.remove('active-lyric');
        setTimeout(() => {
            lyricElement.innerHTML = displayText;
            lyricElement.classList.add('active-lyric');
        }, 150);
    } else if (newIndex === -1) {
        lyricElement.classList.remove('active-lyric');
        lyricElement.innerHTML = '';
    }
}

function syncLoop() {
    if (audio && !audio.paused && !audio.ended) {
        updateLyrics(audio.currentTime);
    }
    animationFrameId = requestAnimationFrame(syncLoop);
}

window.addEventListener('songChanged', (e) => {
    setLyrics(e.detail.song);
});

syncLoop();

// Hide the toggle button since we only show Spanish
const toggleBtn = document.getElementById('toggleTranslation');
if (toggleBtn) toggleBtn.style.display = 'none';