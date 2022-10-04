import axios from 'axios';
import { Notify } from 'notiflix';

export function fetchImages(searchQuery, page) {
  const searchParams = new URLSearchParams({
    key: '30075505-2d85101d237fc7d98fa57be1d',
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 12,
  });

  const URL = `https://pixabay.com/api/?${searchParams}`;

  return axios
    .get(URL)
    .then(res => res.data)
    .catch(console.log);
}
