import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './fetchImages';
import SimpleLightbox from 'simplelightbox';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const containerEl = document.querySelector('.container');
const galleryEl = document.querySelector('.gallery-cards');

let page = 1;
let imageQuery = '';
let totalHits;
let lightbox;

createLightbox();

function markUpGallery({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card gallery"><a class="gallery-item" href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
      <div class="info">
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Likes:</span> ${likes}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Views:</span> ${views}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Comments:</span> ${comments}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Downloads:</span> ${downloads}</b>
        </p>
      </div></a>
    </div>`;
}

formEl.addEventListener('submit', onInputSubmit);

async function onInputSubmit(e) {
  e.preventDefault();

  if (imageQuery !== e.target.elements.searchQuery.value.trim()) {
    page = 1;
    galleryEl.innerHTML = '';
  }

  imageQuery = e.target.elements.searchQuery.value.trim();

  if (imageQuery === '') {
    Notify.info('Please enter a value to search for');
    return;
  }

  const res = await fetchImages(imageQuery, page);
  const images = res.hits;
  totalHits = res.totalHits;

  if (images.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  galleryEl.insertAdjacentHTML(
    'beforeend',
    images.map(item => markUpGallery(item)).join('')
  );
  getPagination();
  preventDefaultOnLinks();
  refreshLightbox();

  Notify.success(`Hooray! We found ${totalHits} images.`);
}

async function incrementPages(e) {
  page = page + 1;

  const res = await fetchImages(imageQuery, page);
  const images = res.hits;
  const allImagesView = page * 40;

  if (totalHits < allImagesView) {
    Notify.failure(
      'We are sorry, but you ave reached the end of search results.'
    );
    loadMoreBtnEl.classList.add('visually-hidden');

    return;
  }

  galleryEl.insertAdjacentHTML(
    'beforeend',
    images.map(item => markUpGallery(item)).join('')
  );

  preventDefaultOnLinks();
  refreshLightbox();
}

function createLightbox() {
  return (lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionPosition: 'bottom',
    captionDelay: 250,
  }));
}

function refreshLightbox() {
  lightbox.refresh();
}

function preventDefaultOnLinks() {
  const links = document.querySelectorAll('.gallery-item');
  links.forEach(el => el.addEventListener('click', e => e.preventDefault()));
}

async function getPagination() {
  const res = await fetchImages(imageQuery, page);
  const images = res.hits;
  console.log(res);
  // const allImagesView = page * 40;

  const container = document.getElementById('pagination');
  const options = {
    totalItems: res.totalHits,
    itemsPerPage: 12,
    visiblePages: 3,
    page: page,
    centerAlign: false,
    firstItemClassName: 'tui-first-child',
    lastItemClassName: 'tui-last-child',
    template: {
      page: '<a href="#" class="tui-page-btn">{{page}}</a>',
      currentPage:
        '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
      moveButton:
        '<a href="#" class="tui-page-btn tui-{{type}}">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</a>',
      disabledMoveButton:
        '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</span>',
      moreButton:
        '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
        '<span class="tui-ico-ellip">...</span>' +
        '</a>',
    },
  };
  const pagination = new Pagination(container, options);
}
