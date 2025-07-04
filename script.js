// Get references to the form and results container
const searchForm = document.getElementById('search-form');
const movieResults = document.getElementById('movie-results');
const watchlist = document.getElementById('watchlist');

// Your OMDb API key (use 'demo' for testing, but replace with your own for real use)
const API_KEY = '39bcb8cf'; // Replace 'demo' with your OMDb API key for more results

// Create an array to store watchlist movie IDs
let watchlistIds = [];
// Create an array to store watchlist movie objects
let watchlistMovies = [];

// Function to save the watchlist to localStorage
function saveWatchlist() {
  localStorage.setItem('watchlistMovies', JSON.stringify(watchlistMovies));
  localStorage.setItem('watchlistIds', JSON.stringify(watchlistIds));
}

// Function to load the watchlist from localStorage
function loadWatchlist() {
  const savedMovies = localStorage.getItem('watchlistMovies');
  const savedIds = localStorage.getItem('watchlistIds');
  if (savedMovies && savedIds) {
    watchlistMovies = JSON.parse(savedMovies);
    watchlistIds = JSON.parse(savedIds);
  } else {
    watchlistMovies = [];
    watchlistIds = [];
  }
}

// Function to create a movie card element (used for both results and watchlist)
function createMovieCard(movie, showAddButton = true) {
  // Use a placeholder image if poster is not available
  const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';

  // Create the card div
  const movieCard = document.createElement('div');
  movieCard.classList.add('movie-card');

  // Set up the card's HTML
  movieCard.innerHTML = `
    <img class="movie-poster" src="${poster}" alt="Poster of ${movie.Title}">
    <div class="movie-info">
      <div class="movie-title">${movie.Title}</div>
      <div class="movie-year">${movie.Year}</div>
      ${
        showAddButton
          ? `<button class="btn add-watchlist-btn" data-movie-id="${movie.imdbID}">Add to Watchlist</button>`
          : `<button class="btn btn-remove remove-watchlist-btn" data-movie-id="${movie.imdbID}">Remove</button>`
      }
    </div>
  `;

  return movieCard;
}

// Listen for form submission
searchForm.addEventListener('submit', async function(event) {
  // Prevent the page from reloading
  event.preventDefault();

  // Get the search term from the input box
  const searchInput = document.getElementById('movie-search');
  const searchTerm = searchInput.value.trim();

  // If the search box is empty, do nothing
  if (!searchTerm) {
    return;
  }

  // Build the OMDb API URL
  const apiUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`;

  // Fetch data from the OMDb API
  const response = await fetch(apiUrl);
  const data = await response.json();

  // Clear previous results
  movieResults.innerHTML = '';

  // Check if movies were found
  if (data.Response === 'True') {
    // Loop through each movie and display it
    data.Search.forEach(movie => {
      // Create a movie card with the "Add to Watchlist" button
      const movieCard = createMovieCard(movie, true);

      // Add the movie card to the results grid
      movieResults.appendChild(movieCard);
    });
  } else {
    // If no movies found, show a message
    movieResults.innerHTML = `<div class="no-results">No movies found. Try another search!</div>`;
  }

  // Clear the search input after submitting
  searchInput.value = '';
});

// Function to display the watchlist
function displayWatchlist() {
  // Clear the watchlist section
  watchlist.innerHTML = '';
  if (watchlistMovies.length === 0) {
    // Show empty message if no movies
    watchlist.innerHTML = 'Your watchlist is empty. Search for movies to add!';
  } else {
    // Show each movie in the watchlist
    watchlistMovies.forEach(movie => {
      const watchlistCard = createMovieCard(movie, false);
      watchlist.appendChild(watchlistCard);
    });
  }
}

// Load and display the watchlist when the page loads
loadWatchlist();
displayWatchlist();

// Listen for clicks on the "Add to Watchlist" buttons
movieResults.addEventListener('click', function(event) {
  // Check if the clicked element is an "Add to Watchlist" button
  if (event.target.classList.contains('add-watchlist-btn')) {
    // Get the movie ID from the button's data attribute
    const movieId = event.target.getAttribute('data-movie-id');

    // Prevent duplicates in the watchlist
    if (!watchlistIds.includes(movieId)) {
      // Find the movie card in the search results
      const movieCard = event.target.closest('.movie-card');
      const title = movieCard.querySelector('.movie-title').textContent;
      const year = movieCard.querySelector('.movie-year').textContent;
      const poster = movieCard.querySelector('.movie-poster').getAttribute('src');

      // Create a movie object
      const movie = {
        imdbID: movieId,
        Title: title,
        Year: year,
        Poster: poster
      };

      // Add the movie to the watchlist arrays
      watchlistIds.push(movieId);
      watchlistMovies.push(movie);

      // Save the updated watchlist to localStorage
      saveWatchlist();

      // Update the watchlist display
      displayWatchlist();
    }
  }
});

// Listen for clicks on the "Remove" buttons in the watchlist
watchlist.addEventListener('click', function(event) {
  // Check if the clicked element is a "Remove" button
  if (event.target.classList.contains('remove-watchlist-btn')) {
    // Get the movie ID from the button's data attribute
    const movieId = event.target.getAttribute('data-movie-id');

    // Remove the movie from the arrays
    watchlistIds = watchlistIds.filter(id => id !== movieId);
    watchlistMovies = watchlistMovies.filter(movie => movie.imdbID !== movieId);

    // Save the updated watchlist to localStorage
    saveWatchlist();

    // Update the watchlist display
    displayWatchlist();
  }
});
