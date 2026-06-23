import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MoviesView from '../views/MoviesView.vue';
import MovieDetailView from '../views/MovieDetailView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import SearchResultView from '../views/SearchResultView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/movies', name: 'movies', component: MoviesView },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetailView },
    { path: '/favorites', name: 'favorites', component: FavoritesView },
    { path: '/search', name: 'search', component: SearchResultView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
});

export default router;
