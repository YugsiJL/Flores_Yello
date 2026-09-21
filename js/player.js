import { songsData } from './songs-data.js';

const audio = document.getElementById('backgroundAudio');
let currentSongIndex = 0;
let isPlaying = false;

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const songSelect = document.getElementById('songSelect');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const durationDisplay = document.getElementById('durationDisplay');

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function loadSong(index) {
    const song = songsData[index];
    if (!song) return;
    audio.src = song.src;
    audio.load();

    window.dispatchEvent(new CustomEvent('songChanged', { detail: { song } }));
    if (songSelect) songSelect.value = index;
}

function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.textContent = '▶';
    } else {
        audio.play().then(() => {
            isPlaying = true;
            if (playPauseBtn) playPauseBtn.textContent = '⏸';
        }).catch(e => {
            console.log("Auto-play bloqueado:", e);
            isPlaying = false;
            if (playPauseBtn) playPauseBtn.textContent = '▶';
        });
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songsData.length;
    let wasPlaying = isPlaying;
    isPlaying = false; // Reset to allow clean play promise
    loadSong(currentSongIndex);
    if (wasPlaying) {
        togglePlayPause();
    } else {
        if (playPauseBtn) playPauseBtn.textContent = '▶';
    }
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songsData.length) % songsData.length;
    let wasPlaying = isPlaying;
    isPlaying = false;
    loadSong(currentSongIndex);
    if (wasPlaying) {
        togglePlayPause();
    } else {
        if (playPauseBtn) playPauseBtn.textContent = '▶';
    }
}

function populateSongSelect() {
    if (!songSelect) return;
    songsData.forEach((song, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = `${song.title} - ${song.artist}`;
        songSelect.appendChild(option);
    });
}

// Progress Bar Logic
if (audio && progressBar && currentTimeDisplay) {
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (durationDisplay) durationDisplay.textContent = formatTime(audio.duration);
    });

    progressBar.addEventListener('input', () => {
        const seekTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });
}

if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (nextBtn) nextBtn.addEventListener('click', nextSong);
if (prevBtn) prevBtn.addEventListener('click', prevSong);
if (songSelect) {
    songSelect.addEventListener('change', (e) => {
        currentSongIndex = parseInt(e.target.value);
        let wasPlaying = isPlaying;
        isPlaying = false;
        loadSong(currentSongIndex);
        if (wasPlaying) {
            togglePlayPause();
        } else {
            if (playPauseBtn) playPauseBtn.textContent = '▶';
        }
    });
}
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = parseFloat(e.target.value);
    });
}

if (audio) {
    audio.addEventListener('ended', () => {
        nextSong();
    });
}

populateSongSelect();
// Delay loadSong slightly to ensure lyrics.js has attached its event listener first
setTimeout(() => {
    loadSong(0);
    // Check Autoplay Param from URL (e.g., from index.html)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('play') === 'true') {
        setTimeout(() => {
            togglePlayPause();
        }, 500);
    }
}, 100);
if (audio) audio.volume = 0.7;

// --- MODO CINE: Ocultar reproductor por inactividad ---
let timeout;
const playerUI = document.querySelector('.music-player');

function resetTimer() {
    playerUI.style.opacity = '1';
    playerUI.style.transform = 'translateY(0)';
    playerUI.style.pointerEvents = 'all'; // Permite hacer click

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        playerUI.style.opacity = '0';
        playerUI.style.transform = 'translateY(20px)'; // Se hunde un poquito al desaparecer
        playerUI.style.pointerEvents = 'none'; // Evita clicks fantasmas
    }, 3000); // 3.5 segundos de inactividad
}

// Escuchar movimiento y clicks
document.addEventListener('mousemove', resetTimer);
document.addEventListener('click', resetTimer);
document.addEventListener('touchstart', resetTimer); // Para que funcione en su celular