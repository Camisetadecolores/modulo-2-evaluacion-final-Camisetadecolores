'use strict';

console.log('>> Ready :)');

// CONSTS AND DOMS
const form = document.querySelector('#formSearch');
const inputUser = document.querySelector('#inputUser');
const buttonSearch = document.querySelector('#buttonSearch');
const buttonReset = document.querySelector('#buttonReset');

const containerSearch = document.querySelector('#containerSearch');
const containerFav = document.querySelector('#containerFav'); 

const templateAnimeCard = document.querySelector('#templateAnimeCard');

const noImg = 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png';
const placeHolderImg = './images/no-image.png';
const initialText = '<p>Tu escribe, que yo lo busco :)</p>';

// ACTIONS PREV
containerSearch.innerHTML = initialText;

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
const createAnimeCard = (anime) => {
  const cardFragment = templateAnimeCard.content.cloneNode(true);

  const card = cardFragment.querySelector('.animeCard');
  const animeCardTitle = cardFragment.querySelector('.animeTitle');
  const animeCardImg = cardFragment.querySelector('.animeImg');

  animeCardTitle.textContent = anime.title;

  const animeImgApi = anime.images?.jpg?.image_url;
  animeCardImg.src = (!animeImgApi || animeImgApi === noImg) ? placeHolderImg : animeImgApi;

  animeCardImg.alt = anime.title;

  return cardFragment;
};

// GET RESULTS IN SCREEN
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
}



// LISTENER TO GET THE RESULTS
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = inputUser.value.trim();
  if (query === '') return;

  buttonSearch.disabled = true;

  const safeQuery = encodeURIComponent(query);
  containerSearch.innerHTML = '<p>Miau! tus animes are comming :)</p>';

  const results = await getSearchItem(safeQuery);
  printAnimeCard(results);

  buttonSearch.disabled = false;
});


// RESET THE INPUTS
buttonReset.addEventListener('click', () => {
  inputUser.value = '';
  containerSearch.innerHTML = initialText;

});