const apiKey = 'e91c154b105769461a1de41c14743bad';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('moviesContainer');
const searchInput = document.getElementById('searchInput');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const closeModal = document.getElementById('closeModal');
const seasonControls = document.getElementById('seasonControls');
const seasonSelect = document.getElementById('seasonSelect');
const episodeList = document.getElementById('episodeList');
const moviesBtn = document.getElementById('moviesBtn');
const tvShowsBtn = document.getElementById('tvShowsBtn');

let currentMode = 'movie';

const bannedWords = ['sex','porn', 'porno', 'erotic', 'lust', 'xxx', 'fetish', 'nsfw'];

const isSafe = (title, overview) => {
  const lowerTitle = title?.toLowerCase() || '';
  const lowerDesc = overview?.toLowerCase() || '';
  return !bannedWords.some(word => lowerTitle.includes(word) || lowerDesc.includes(word));
};

document.addEventListener('DOMContentLoaded', () => {
  fetchMovies();
});

moviesBtn.addEventListener('click', () => {
  currentMode = 'movie';
  fetchMovies();
});

tvShowsBtn.addEventListener('click', () => {
  currentMode = 'tv';
  fetchTVShows();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (!query) {
      currentMode === 'movie' ? fetchMovies() : fetchTVShows();
      return;
    }
    const endpoint = currentMode === 'movie' ? 'search/movie' : 'search/tv';
    fetchItems(`${apiBaseUrl}/${endpoint}?api_key=${apiKey}&include_adult=false&certification_country=US&certification.lte=PG-13&query=${encodeURIComponent(query)}`);
  }
});

function fetchMovies() {
  fetchItems(`${apiBaseUrl}/movie/popular?api_key=${apiKey}&include_adult=false&certification_country=US&certification.lte=PG-13&language=en-US&page=1`);
}

function fetchTVShows() {
  fetchItems(`${apiBaseUrl}/tv/popular?api_key=${apiKey}&include_adult=false&language=en-US&page=1`);
}

async function fetchItems(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      isSafe(item.title || item.name, item.overview)
    );
    displayItems(filtered);
  } catch (err) {
    console.error(err);
    moviesContainer.innerHTML = "<p>Couldn't load items. Try again later.</p>";
  }
}

function displayItems(items) {
  moviesContainer.innerHTML = '';
  if (!items.length) {
    moviesContainer.innerHTML = '<p>No safe results found.</p>';
    return;
  }

  items.forEach(item => {
    const { id, title, name, poster_path } = item;
    const displayTitle = title || name;
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
      <img src="${poster_path ? `${imageBaseUrl}${poster_path}` : 'placeholder.jpg'}" class="movie-poster" alt="${displayTitle}" />
      <div class="movie-title">${displayTitle}</div>
    `;
    card.addEventListener('click', () => {
      currentMode === 'movie' ? openMovieModal(id) : openTVModal(id);
    });
    moviesContainer.appendChild(card);
  });
}

function openMovieModal(tmdbId) {
  videoPlayer.src = `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
  videoModal.style.display = 'flex';
  seasonControls.style.display = 'none';
}

async function openTVModal(tvId) {
  videoModal.style.display = 'flex';
  seasonControls.style.display = 'block';
  videoPlayer.src = '';

  const res = await fetch(`${apiBaseUrl}/tv/${tvId}?api_key=${apiKey}`);
  const data = await res.json();
  renderSeasons(tvId, data.seasons);
}

function renderSeasons(tvId, seasons) {
  seasonSelect.innerHTML = '';
  seasons.forEach(season => {
    const opt = document.createElement('option');
    opt.value = season.season_number;
    opt.textContent = season.name;
    seasonSelect.appendChild(opt);
  });

  seasonSelect.onchange = () => loadEpisodes(tvId, seasonSelect.value);
  loadEpisodes(tvId, seasonSelect.value);
}

async function loadEpisodes(tvId, seasonNumber) {
  const res = await fetch(`${apiBaseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`);
  const data = await res.json();
  episodeList.innerHTML = '';
  data.episodes.forEach(ep => {
    const btn = document.createElement('button');
    btn.textContent = `Ep ${ep.episode_number}: ${ep.name}`;
    btn.classList.add('episode-btn');
    btn.onclick = () => {
      videoPlayer.src = `https://vidsrc.xyz/embed/tv?tmdb=${tvId}&season=${seasonNumber}&episode=${ep.episode_number}`;
    };
    episodeList.appendChild(btn);
  });
}

closeModal.addEventListener('click', () => {
  videoModal.style.display = 'none';
  videoPlayer.src = '';
});
