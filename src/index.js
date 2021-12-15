import './css/styles.css';
import Notiflix from 'notiflix';
// Описан в документации
import SimpleLightbox from "simplelightbox";
// Дополнительный импорт стилей
import "simplelightbox/dist/simple-lightbox.min.css";
import ApiService from './js/api';

const apiService = new ApiService();

const refs = {
    formEl: document.querySelector('#search-form'),
    galleryEl: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
};

refs.formEl.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

refs.loadMoreBtn.style.visibility = 'hidden';

function onSearch(e) {
    e.preventDefault();
    apiService.query = e.currentTarget.elements.searchQuery.value.trim();
    refs.galleryEl.innerHTML = '';
    refs.formEl.reset();
    apiService.resetPage();

    refs.loadMoreBtn.style.visibility = 'visible';

    apiService.fetchImages().then(({ hits, total }) => {

        if (apiService.query === '') {
            refs.loadMoreBtn.style.visibility = 'hidden';
            Notiflix.Notify.failure(`Please, enter your query!`);
            return;
        }
        if (total < apiService.perPage) {
            refs.loadMoreBtn.style.visibility = 'hidden';
        }
        if (total === 0) {
            Notiflix.Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
            return;
        }
        Notiflix.Notify.success(`Hooray! We found ${total} images.`);

        markupGallery(hits);
        lightbox();
    })
}

function onLoadMore() {
    apiService.fetchImages().then(({ hits }) => {
        markupGallery(hits);

        lightbox();
        if (hits.length < 40) {
            refs.loadMoreBtn.style.visibility = 'hidden';
            Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
        }
    })
}

function markupGallery(hits) {
    const markup = hits
        .map(image => {
            return `
        <a class="gallery__item" href="${image.largeImageURL}">
          <div class="photo-card">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                ${image.likes}
              </p>
              <p class="info-item">
                <b>Views</b>
                ${image.views}
              </p>
              <p class="info-item">
                <b>Comments</b>
                ${image.comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>
                ${image.downloads}
              </p>
            </div>
          </div>
        </a>`;
        })
        .join('');

    refs.galleryEl.insertAdjacentHTML('beforeend', markup);

    //let lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
    //lightbox.refresh()

}

function lightbox() {
    const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
    lightbox.refresh();
}