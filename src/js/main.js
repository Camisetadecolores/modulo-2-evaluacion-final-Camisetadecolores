'use strict';

console.log('>> Ready :)');

// CONSTS AND DOMS
const form = document.querySelector('#formSearch');
const inputUser = document.querySelector('#inputUser');
const buttonSearch = document.querySelector('#buttonSearch');
const buttonReset = document.querySelector('#buttonReset');
const buttonFav = document.querySelector('#favoriteButton');
const buttonResetFav = document.querySelector('#buttonResetFav');

const containerSearch = document.querySelector('#containerSearch');
const containerFav = document.querySelector('#containerFav');

const templateAnimeCard = document.querySelector('#templateAnimeCard');

const noImg = 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png';
const placeHolderImg = './images/no-image.png';
const initialText = '<p>Tu escribe, que yo lo busco :)</p>';
const initialFavText = '<p>No tienes favoritos...aún :(</p>';

let saveResults = [];
let arrayFav = [];

// CALL API TO GET RESULTS
const getSearchItem = async (value) => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${value}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.info(`Se encontraron ${data.data.length} resultados.`);
    return data.data;
  } catch (ex) {
    console.error('Error al buscar:', ex);
    return [];
  }
};

// CREATE CARD FROM TEMPLATE
function createAnimeCard(anime) {
  const cardFragment = templateAnimeCard.content.cloneNode(true);

  const card = cardFragment.querySelector('.animeCard');
  const animeCardTitle = cardFragment.querySelector('.animeTitle');
  const animeCardImg = cardFragment.querySelector('.animeImg');
  const animedataId = anime.mal_id;

  animeCardTitle.textContent = anime.title;

  const animeImgApi = anime.images?.jpg?.image_url;
  animeCardImg.src = (!animeImgApi || animeImgApi === noImg) ? placeHolderImg : animeImgApi;

  animeCardImg.alt = anime.title;
  card.dataset.id = animedataId;

  return cardFragment;
}

// PRINT SEARCH RESULTS
const printAnimeCard = (animeList) => {
  containerSearch.innerHTML = '';

  if (animeList.length === 0) {
    containerSearch.innerHTML = '<p>No hay resultados...sorry :(</p>';
    return;
  }

  for (let anime of animeList) {
    const animeCard = createAnimeCard(anime);
    containerSearch.appendChild(animeCard);
  }
};

// PRINT FAVS
function printFavs() {
  const titleFav = containerFav.querySelector('h2');
  const fixedText = containerFav.querySelector('p'); 
  const clearBtn = containerFav.querySelector('#buttonResetFav'); 

  containerFav.innerHTML = '';

  if (titleFav) containerFav.appendChild(titleFav);
  if (fixedText) containerFav.appendChild(fixedText);
  if (clearBtn) containerFav.appendChild(clearBtn);

  if (arrayFav.length === 0) {
    containerFav.insertAdjacentHTML('beforeend', initialFavText);
    return;
  }

  for (let anime of arrayFav) {
    const animeFavCard = createAnimeCard(anime);
    containerFav.appendChild(animeFavCard);
  }
}

// ADD TO FAVORITES AND SAVE IN LOCAL STORAGE
const addToFavorites = (anime) => {
  let exists = false;

  for (let item of arrayFav) {
    if (item.mal_id === anime.mal_id) {
      exists = true;
      break;
    }
  }

  if (exists) return;
  arrayFav.push(anime);
  localStorage.setItem('favorites', JSON.stringify(arrayFav));
  printFavs();
};

// REMOVE FROM FAVORITES
const removeFromFavorites = (animeId) => {
  const index = arrayFav.findIndex(anime => anime.mal_id === animeId);
  if (index === -1) return;

  arrayFav.splice(index, 1);
  localStorage.setItem('favorites', JSON.stringify(arrayFav));
  printFavs();
};

// REMOVE ALL FAVORITES
const resetFavorites = () => {
  arrayFav = [];
  localStorage.removeItem('favorites');
  printFavs();
};

// LISTENER TO GET THE RESULTS
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = inputUser.value.trim();
  if (query === '') return;

  buttonSearch.disabled = true;

  const safeQuery = encodeURIComponent(query);
  containerSearch.innerHTML = '<p>Miau! tus animes are comming :)</p>';

  const results = await getSearchItem(safeQuery);
  saveResults = results;
  printAnimeCard(results);

  buttonSearch.disabled = false;
});

// RESET THE INPUTS
buttonReset.addEventListener('click', () => {
  inputUser.value = '';
  containerSearch.innerHTML = initialText;
});

// CLICK TO ADD FAV
containerSearch.addEventListener('click', (e) => {
  const card = e.target.closest('.animeCard');
  if (!card) return;

  const animeId = Number(card.dataset.id);

  let clickAnime = null;

  for (let anime of saveResults) {
    if (anime.mal_id === animeId) {
      clickAnime = anime;
      break;
    }
  }

  if (!clickAnime) return;

  addToFavorites(clickAnime);

  console.log(arrayFav);
});

// CLICK TO REMOVE FAV
containerFav.addEventListener('click', (e) => {
  if (e.target.closest('#buttonResetFav')) return;

  const cardFav = e.target.closest('.animeCard');
  if (!cardFav) return;

  const animeIdFav = Number(cardFav.dataset.id);
  removeFromFavorites(animeIdFav);
});

// CLICK TO REMOVE ALL FAV
buttonResetFav.addEventListener('click', () => {
  const confirmDelete = confirm('¿Seguro que quieres borrar todos tus favoritos?');
  if (!confirmDelete) return;

  resetFavorites(); 
});

// ACTIONS 
arrayFav = JSON.parse(localStorage.getItem('favorites')) ?? [];
printFavs();
containerSearch.innerHTML = initialText;