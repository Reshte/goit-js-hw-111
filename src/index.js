import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '19287883-8248a4cfa378b2f4de664e52e';
let searchQuery;
let page = 1;
const simpleLightbox = new SimpleLightbox('.gallery a', {
  captionPosition: 'bottom',
  captionDelay: 250,
  enableKeyboard: true,
});

const refs = {
  form: document.querySelector('#search-form'),
  gallary: document.querySelector('.gallery'),
  searchBtn: document.querySelector('.js-submitBtn'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', loadMore);
refs.loadMoreBtn.classList.add('hidden');

async function onSearch(event) {
  event.preventDefault();
  refs.gallary.innerHTML = '';
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    refs.loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.warning('Enter data for search');
    return;
  }

  const cards = await requestApi1(page, searchQuery);
  try {
    if (cards.data.hits.length > 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${cards.data.totalHits} images.`
      );
      refs.gallary.insertAdjacentHTML(
        'beforeend',
        createMarkup(cards.data.hits)
      );
      refs.loadMoreBtn.classList.remove('hidden');
      simpleLightbox.refresh();
    } else {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function requestApi1(page = 1, searchQuery) {
  const options = {
    params: {
      key: `${API_KEY}`,
      q: `${searchQuery}`,
      per_page: 40,
      page: `${page}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
    },
  };

  try {
    const response = await axios.get(`${BASE_URL}`, options);
    return response;
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
       <a class="gallery-link" href="${largeImageURL}">
          <div class="gallery-item">
            <img class="gallery-item-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${likes}</p>
              <p class="info-item"><b>Views</b>${views}</p>
              <p class="info-item"><b>Comments</b>${comments}</p>
              <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a> `
    )
    .join('');
  return markup;
}

async function loadMore() {
  page += 1;
  refs.loadMoreBtn.classList.add('hidden');
  const cards = await requestApi1(page, searchQuery);
  try {
    if (cards.data.totalHits >= page) {
      refs.gallary.insertAdjacentHTML(
        'beforeend',
        createMarkup(cards.data.hits)
      );
      refs.loadMoreBtn.classList.remove('hidden');
      simpleLightbox.refresh();
    } else {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (err) {
    console.log(err.message);
  }
}
