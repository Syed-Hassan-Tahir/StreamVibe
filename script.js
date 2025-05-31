const apiKey = 'e91c154b105769461a1de41c14743bad';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('moviesContainer');
const searchInput = document.getElementById('searchInput');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const closeModal = document.getElementById('closeModal');
const downloadLink = document.getElementById('downloadLink');

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchMovies(`${apiBaseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query) {
    fetchMovies(`${apiBaseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}`);
  } else {
    fetchMovies(`${apiBaseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
  }
});

async function fetchMovies(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.error(err);
    moviesContainer.innerHTML = "<p>Couldn't load movies. Try again later.</p>";
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = '';
  if (!movies.length) {
    moviesContainer.innerHTML = '<p>No movies found.</p>';
    return;
  }

  movies.forEach(movie => {
    const { id, title, poster_path } = movie;
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
      <img src="${poster_path ? `${imageBaseUrl}${poster_path}` : 'placeholder.jpg'}" class="movie-poster" alt="${title}" />
      <div class="movie-title">${title}</div>
    `;
    card.addEventListener('click', () => {
      openModal(id);
    });
    moviesContainer.appendChild(card);
  });
}

function openModal(tmdbId) {
  console.log('Opening modal for TMDB ID:', tmdbId);
  const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
  videoPlayer.src = embedUrl;


  videoModal.style.display = 'flex';
}


closeModal.addEventListener('click', () => {
  videoModal.style.display = 'none';
  videoPlayer.src = ''; // Stop playback
});
