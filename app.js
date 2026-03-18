// Web Radio App - Main JavaScript

// Station data with variety mix (news, music, talk)
const stations = [
    {
        id: 'groove-salad',
        name: 'SomaFM Groove Salad',
        genre: 'Electronic / Chill',
        url: 'https://ice4.somafm.com/groovesalad-128-mp3',
        icon: '🎧',
        color: '#6366f1'
    },
    {
        id: 'bbc-world',
        name: 'BBC World Service',
        genre: 'News',
        url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
        icon: '📰',
        color: '#dc2626'
    },
    {
        id: 'npr-news',
        name: 'NPR News',
        genre: 'Talk / News',
        url: 'https://npr-ice.streamguys1.com/live.mp3',
        icon: '🎙️',
        color: '#2563eb'
    },
    {
        id: 'lofi-girl',
        name: 'Lofi Girl',
        genre: 'Study / Chill',
        url: 'https://lofi.stream.lofigirl.com/lofi',
        icon: '📚',
        color: '#7c3aed'
    },
    {
        id: 'classical',
        name: 'Classical Radio',
        genre: 'Classical',
        url: 'https://stream.wqxr.org/wqxr',
        icon: '🎼',
        color: '#059669'
    }
];

// App state
const state = {
    currentStation: null,
    isPlaying: false,
    volume: 70,
    isMuted: false,
    theme: 'light'
};

// DOM Elements
const elements = {
    audioPlayer: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    muteBtn: document.getElementById('muteBtn'),
    stationName: document.getElementById('stationName'),
    stationIndicator: document.getElementById('stationIndicator'),
    stationsList: document.getElementById('stationsList'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.querySelector('.theme-icon')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    renderStations();
    setupEventListeners();
    updateThemeUI();
});

// Load preferences from LocalStorage
function loadPreferences() {
    const savedTheme = localStorage.getItem('webRadio_theme');
    const savedStation = localStorage.getItem('webRadio_station');
    const savedVolume = localStorage.getItem('webRadio_volume');

    if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    if (savedVolume !== null) {
        state.volume = parseInt(savedVolume, 10);
        elements.volumeSlider.value = state.volume;
        elements.volumeValue.textContent = `${state.volume}%`;
        elements.audioPlayer.volume = state.volume / 100;
    }

    if (savedStation) {
        const station = stations.find(s => s.id === savedStation);
        if (station) {
            selectStation(station, false);
        }
    }
}

// Save preferences to LocalStorage
function savePreferences() {
    localStorage.setItem('webRadio_theme', state.theme);
    localStorage.setItem('webRadio_station', state.currentStation?.id || '');
    localStorage.setItem('webRadio_volume', state.volume.toString());
}

// Render stations list
function renderStations() {
    elements.stationsList.innerHTML = stations.map(station => `
        <li class="station-item" data-station-id="${station.id}">
            <div class="station-icon" style="background: ${station.color}20; color: ${station.color}">
                ${station.icon}
            </div>
            <div class="station-details">
                <div class="station-item-name">${station.name}</div>
                <div class="station-item-genre">${station.genre}</div>
            </div>
            <div class="station-status"></div>
        </li>
    `).join('');

    // Add click handlers
    elements.stationsList.querySelectorAll('.station-item').forEach(item => {
        item.addEventListener('click', () => {
            const stationId = item.dataset.stationId;
            const station = stations.find(s => s.id === stationId);
            if (station) {
                selectStation(station);
            }
        });
    });
}

// Select a station
function selectStation(station, autoPlay = true) {
    // Update state
    const wasPlaying = state.isPlaying;
    state.currentStation = station;

    // Update audio source
    elements.audioPlayer.src = station.url;

    // Update UI
    updateStationUI();

    // Play if requested or was already playing
    if (autoPlay || wasPlaying) {
        playAudio();
    }

    savePreferences();
}

// Update station UI
function updateStationUI() {
    // Update station list highlighting
    elements.stationsList.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('active');
        if (state.currentStation && item.dataset.stationId === state.currentStation.id) {
            item.classList.add('active');
        }
    });

    // Update now playing display
    if (state.currentStation) {
        elements.stationName.textContent = state.currentStation.name;
    } else {
        elements.stationName.textContent = 'Select a station';
    }
}

// Play audio
function playAudio() {
    if (!elements.audioPlayer.src) return;

    const playPromise = elements.audioPlayer.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                state.isPlaying = true;
                updatePlayPauseUI();
                savePreferences();
            })
            .catch(error => {
                console.error('Playback failed:', error);
                state.isPlaying = false;
                updatePlayPauseUI();
            });
    }
}

// Pause audio
function pauseAudio() {
    elements.audioPlayer.pause();
    state.isPlaying = false;
    updatePlayPauseUI();
    savePreferences();
}

// Toggle play/pause
function togglePlayPause() {
    if (!state.currentStation) {
        // Select first station if none selected
        selectStation(stations[0]);
        return;
    }

    if (state.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Update play/pause button UI
function updatePlayPauseUI() {
    if (state.isPlaying) {
        elements.playIcon.style.display = 'none';
        elements.pauseIcon.style.display = 'block';
        elements.stationIndicator.classList.add('playing');
        elements.playPauseBtn.setAttribute('aria-label', 'Pause');
    } else {
        elements.playIcon.style.display = 'block';
        elements.pauseIcon.style.display = 'none';
        elements.stationIndicator.classList.remove('playing');
        elements.playPauseBtn.setAttribute('aria-label', 'Play');
    }
}

// Set volume
function setVolume(value) {
    state.volume = value;
    elements.audioPlayer.volume = value / 100;
    elements.volumeValue.textContent = `${value}%`;

    // Update mute state
    if (value > 0 && state.isMuted) {
        state.isMuted = false;
        elements.audioPlayer.muted = false;
    }

    savePreferences();
}

// Toggle mute
function toggleMute() {
    state.isMuted = !state.isMuted;
    elements.audioPlayer.muted = state.isMuted;

    // Update mute button icon
    if (state.isMuted) {
        elements.muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
        `;
    } else {
        elements.muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        `;
    }
}

// Toggle theme
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();
    savePreferences();
}

// Update theme UI
function updateThemeUI() {
    elements.themeIcon.textContent = state.theme === 'light' ? '☀️' : '🌙';
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause button
    elements.playPauseBtn.addEventListener('click', togglePlayPause);

    // Volume slider
    elements.volumeSlider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value, 10));
    });

    // Mute button
    elements.muteBtn.addEventListener('click', toggleMute);

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Audio events
    elements.audioPlayer.addEventListener('ended', () => {
        state.isPlaying = false;
        updatePlayPauseUI();
    });

    elements.audioPlayer.addEventListener('error', () => {
        state.isPlaying = false;
        updatePlayPauseUI();
        console.error('Audio stream error');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to play/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            togglePlayPause();
        }

        // Arrow up/down for volume
        if (e.code === 'ArrowUp') {
            e.preventDefault();
            const newVolume = Math.min(100, state.volume + 5);
            elements.volumeSlider.value = newVolume;
            setVolume(newVolume);
        }

        if (e.code === 'ArrowDown') {
            e.preventDefault();
            const newVolume = Math.max(0, state.volume - 5);
            elements.volumeSlider.value = newVolume;
            setVolume(newVolume);
        }

        // M for mute
        if (e.code === 'KeyM') {
            toggleMute();
        }
    });
}
