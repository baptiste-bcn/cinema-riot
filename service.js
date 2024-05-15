const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YjJjMGY4MDJjZGE2MmQyNGQ2MjFiZGJhOGE2NzcxYyIsInN1YiI6IjY1ZjVhMTc4Yjk3NDQyMDE3ZGZhYjg5YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PRfg6hWOE58wAQCqJ94qfJeX8wdcaHDEAR0Fh6_YAKI"
const BASE_API_URL = "https://api.themoviedb.org/3";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/original";
const LANGUAGE_CODE = "fr-FR";
const REQUEST_OPTIONS = {
    method: 'GET', headers: {
        accept: 'application/json', Authorization: 'Bearer ' + API_KEY
    }
};

function formatDate(dateString) {
    const options = {year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'};
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat(LANGUAGE_CODE, options);

    return formatter.format(date);
}

async function getGenres(type) {
    const response = await fetch(BASE_API_URL + '/genre/' + type + '/list?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const json = await response.json();
    return json.genres;
}

async function getTrailer(type, id) {
    const response = await fetch(BASE_API_URL + '/' + type + '/' + id + '/videos?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const json = await response.json();
    const trailers = json.results;
    const youtubeTrailer = trailers.find(trailer => trailer.type === "Trailer" && trailer.site === "YouTube");
    return youtubeTrailer || null;
}

async function getTrendingMovies() {
    const response = await fetch(BASE_API_URL + '/trending/movie/week?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const json = await response.json();
    const results = json.results;
    results.forEach(trendingMovie => {
        if (trendingMovie.poster_path) {
            trendingMovie.poster_url = BASE_IMAGE_URL + trendingMovie.poster_path;
        }
        trendingMovie.locale_release_date = formatDate(trendingMovie.release_date);
    });
    return results;
}

async function getMovieDetails(movieId) {
    const response = await fetch(BASE_API_URL + '/movie/' + movieId + '?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const movieDetails = await response.json();
    movieDetails.backdrop_url = null;
    if (movieDetails.poster_path) {
        movieDetails.poster_url = BASE_IMAGE_URL + movieDetails.poster_path;
    }
    movieDetails.formated_runtime = formatRuntime(movieDetails.runtime);
    movieDetails.formated_release_date = formatDate(movieDetails.release_date);
    movieDetails.original_language_to_upper = movieDetails.original_language.toUpperCase();
    const movieImages = await getMovieImages(movieId);
    if (movieImages.backdrops.length !== 0) {
        movieDetails.backdrop_url = BASE_IMAGE_URL + movieImages.backdrops[0].file_path;
    }
    return movieDetails;
}

async function getTvDetails(tvId) {
    const response = await fetch(BASE_API_URL + '/tv/' + tvId + '?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const tvDetails = await response.json();
    tvDetails.formated_first_air_date = formatDate(tvDetails.first_air_date);
    tvDetails.backdrop_url = BASE_IMAGE_URL + tvDetails.backdrop_path;
    if (tvDetails.poster_path) {
        tvDetails.poster_url = BASE_IMAGE_URL + tvDetails.poster_path;
    }
    return tvDetails;
}

function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    return `${hours} h ${minutesLeft} m`;
}

async function getMovieImages(movieId) {
    const response = await fetch(BASE_API_URL + '/movie/' + movieId + '/images?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    return await response.json();
}

async function getCredits(type, id) {
    const response = await fetch(BASE_API_URL + '/' + type + '/' + id + '/credits?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const credits = await response.json();
    credits.cast.forEach(actor => {
        if (actor.profile_path) {
            actor.profile_path_url = BASE_IMAGE_URL + actor.profile_path;
        }
    });
    return credits;
}

async function getPeopleDetails(personId) {
    const response = await fetch(BASE_API_URL + '/person/' + personId + '?language=' + LANGUAGE_CODE, REQUEST_OPTIONS);
    const details = await response.json();
    if (details.profile_path) {
        details.profile_path_url = BASE_IMAGE_URL + details.profile_path;
    }
    return details;
}

async function getMovieList(listName, page) {
    const request = BASE_API_URL + '/movie/' + listName + '?language=' + LANGUAGE_CODE + '&page=' + page;
    const response = await fetch(request, REQUEST_OPTIONS);
    const list = await response.json();
    list.results.forEach(element => {
        if (element.poster_path) {
            element.poster_url = BASE_IMAGE_URL + element.poster_path;
        }
        if (element.release_date) {
            element.locale_release_date = formatDate(element.release_date);
        }
    });
    return list;
}

async function getTvList(listName, page) {
    const request = BASE_API_URL + '/tv/' + listName + '?language=' + LANGUAGE_CODE + '&page=' + page;
    const response = await fetch(request, REQUEST_OPTIONS);
    const list = await response.json();
    list.results.forEach(element => {
        if (element.poster_path) {
            element.poster_url = BASE_IMAGE_URL + element.poster_path;
        }
        if (element.first_air_date) {
            element.locale_first_air_date = formatDate(element.first_air_date);
        }
    });
    return list;
}

async function searchMulti(query, page) {
    const request = BASE_API_URL + '/search/multi?query=' + encodeURIComponent(query) + '&include_adult=false&language=' + LANGUAGE_CODE + '&page=' + page;
    const response = await fetch(request, REQUEST_OPTIONS);
    const results = await response.json();
    results.results.forEach(element => {
        if (element.poster_path) {
            element.poster_url = BASE_IMAGE_URL + element.poster_path;
        } else if (element.profile_path) {
            element.profile_url = BASE_IMAGE_URL + element.profile_path;
        }
    });
    return results;
}