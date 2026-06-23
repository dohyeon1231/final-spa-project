import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useMovieStore = defineStore("movie", () => {
  const movies = ref([]);
  const favorites = ref(JSON.parse(localStorage.getItem("favorites")) || []);
  const isLoading = ref(false);
  const errorMessage = ref("");

  
  const selectedMovie = ref(null);

  const sortType = ref('popularity');
  const currentPage = ref(1);
  const ITEMS_PER_PAGE = 5;

  const toastMessage = ref('');
  const toastVisible = ref(false);
  let toastTimer = null;

  const showToast = (message) => {
    toastMessage.value = message;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastVisible.value = false; }, 1800);
  };

  const fetchMovies = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      // API KEY는 보안을 위해, .env.local 파일에서 관리합니다.
      //실행 전 프로젝트 루트의 .env.example 파일을 .env.local로 복사하세요.
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

      const movieParams = {
        api_key: API_KEY,
        language: "ko-KR",
        region: "KR",
        sort_by: "popularity.desc",
        include_adult: false,
        "release_date.gte": "2025-01-01",
        with_release_type: "2|3",
        page: 1,
      };

      const response = await axios.get(
        "https://api.themoviedb.org/3/discover/movie",
        { params: movieParams }
      );

      const fetchedMovies = response.data.results;

      fetchedMovies.forEach((movie) => {
        const isAlreadyFavorite = favorites.value.some(
          (fav) => fav.id === movie.id
        );
        movie.isFavorite = isAlreadyFavorite;
      });

      movies.value = fetchedMovies;
    } catch (error) {
      console.error("API 통신 에러 상세 내역:", error);
      errorMessage.value =
        "영화 데이터를 불러오는 데 실패했습니다. 통신 상태나 API Key를 확인해 주세요.";
    } finally {
      isLoading.value = false;
    }
  };

  
  const fetchMovieDetail = async (movieId) => {
    isLoading.value = true;
    errorMessage.value = "";
    selectedMovie.value = null;

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/movie/${movieId}`;

      const response = await axios.get(url, {
        params: { api_key: API_KEY, language: "ko-KR" },
      });

      selectedMovie.value = response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        errorMessage.value = "존재하지 않거나 삭제된 영화 정보입니다.";
      } else {
        errorMessage.value = "서버 통신 중 에러가 발생했습니다.";
      }
    } finally {
      isLoading.value = false;
    }
  };

  const toggleFavorite = (movieId) => {
    const movie = movies.value.find((m) => m.id === movieId);
    if (movie) {
      movie.isFavorite = !movie.isFavorite;

      if (movie.isFavorite) {
        favorites.value.push(movie);
        showToast('❤️ 찜 목록에 추가됐습니다!');
      } else {
        favorites.value = favorites.value.filter((m) => m.id !== movieId);
        showToast('🤍 찜 목록에서 제거됐습니다');
      }
      localStorage.setItem("favorites", JSON.stringify(favorites.value));
    }
  };

  const removeFromFavorites = (movieId) => {
    favorites.value = favorites.value.filter((m) => m.id !== movieId);
    const movie = movies.value.find((m) => m.id === movieId);
    if (movie) movie.isFavorite = false;
    localStorage.setItem("favorites", JSON.stringify(favorites.value));
    showToast('🤍 찜 목록에서 제거됐습니다');
  };

  const sortedMovies = computed(() => {
    const list = [...movies.value];
    if (sortType.value === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else if (sortType.value === 'date') {
      list.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortType.value === 'rating') {
      list.sort((a, b) => b.vote_average - a.vote_average);
    }
    return list;
  });

  const totalPages = computed(() =>
    Math.ceil(sortedMovies.value.length / ITEMS_PER_PAGE)
  );

  const paginatedMovies = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
    return sortedMovies.value.slice(start, start + ITEMS_PER_PAGE);
  });

  const setSortType = (type) => {
    sortType.value = type;
    currentPage.value = 1;
  };

  const setPage = (page) => {
    currentPage.value = page;
  };

  return {
    movies,
    favorites,
    isLoading,
    errorMessage,
    fetchMovies,
    toggleFavorite,
    removeFromFavorites,
    selectedMovie,
    fetchMovieDetail,
    sortType,
    currentPage,
    totalPages,
    sortedMovies,
    paginatedMovies,
    setSortType,
    setPage,
    toastMessage,
    toastVisible,
  };
});