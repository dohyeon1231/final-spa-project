<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useMovieStore } from "../stores/movieStore";

const route = useRoute();
const store = useMovieStore();

onMounted(async () => {
  if (store.movies.length === 0) {
    await store.fetchMovies();
  }
});

watch(
  () => route.query.q,
  async () => {
    if (store.movies.length === 0) {
      await store.fetchMovies();
    }
    document.title = `"${route.query.q}" 검색 결과 | NETVUE`;
  },
  { immediate: true }
);

const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

const searchResults = computed(() => {
  const q = normalize(route.query.q || '');
  if (!q) return [];
  return store.movies.filter((movie) =>
    normalize(movie.title).includes(q) ||
    (movie.original_title && normalize(movie.original_title).includes(q))
  );
});
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🔍 전체 영화 검색 결과</h1>
      <p class="sub-title">
        전체 영화 목록에서 "<strong>{{ route.query.q }}</strong>" 검색
        <span v-if="!store.isLoading">— 총 {{ searchResults.length }}편 일치</span>
      </p>
    </div>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 데이터를 불러오는 중입니다...
    </div>

    <div
      v-else-if="searchResults.length === 0"
      class="empty-state"
    >
      <p class="empty-icon">🎬</p>
      <p class="empty-text">
        전체 영화 목록에서 "<strong>{{ route.query.q }}</strong>"에 해당하는 영화가 없습니다.
      </p>
      <p class="empty-hint">찜 목록에서 찾으시나요?</p>
      <div class="empty-btns">
        <RouterLink to="/movies" class="go-list-btn">전체 영화 목록</RouterLink>
        <RouterLink to="/favorites" class="go-fav-btn">내 찜 목록</RouterLink>
      </div>
    </div>

    <div v-else class="movie-list">
      <div
        v-for="movie in searchResults"
        :key="movie.id"
        class="movie-card"
      >
        <img
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
          :alt="movie.title"
          class="poster"
        />
        <div v-else class="poster-placeholder">이미지 준비 중</div>
        <div class="card-content">
          <h3 class="title">{{ movie.title }}</h3>
          <p class="release-date" v-if="movie.release_date">
            📅 개봉일: {{ movie.release_date }}
          </p>
          <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
          <p class="overview">
            {{
              movie.overview
                ? movie.overview.substring(0, 60) + "..."
                : "줄거리 정보가 없습니다."
            }}
          </p>
          <button
            @click.stop.prevent="store.toggleFavorite(movie.id)"
            :class="{ active: movie.isFavorite }"
            class="fav-btn"
          >
            {{ movie.isFavorite ? "❤️ 찜 해제" : "🤍 찜하기" }}
          </button>
        </div>
        <RouterLink
          :to="`/movies/${movie.id}`"
          class="stretched-link"
          :aria-label="`${movie.title} 상세 정보 보기`"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.header-section {
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}
.sub-title {
  font-size: 15px;
  color: #7f8c8d;
  margin-top: 6px;
}
.status-message {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding: 20px;
  border-radius: 12px;
}
.loading {
  color: #3498db;
  background-color: #e3f2fd;
}
.empty-state {
  text-align: center;
  padding: 80px 20px;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
.empty-text {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 10px;
}
.empty-hint {
  font-size: 14px;
  color: #aab0b8;
  margin-bottom: 24px;
}
.empty-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.go-list-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #ff4757;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
}
.go-list-btn:hover {
  opacity: 0.85;
}
.go-fav-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
}
.go-fav-btn:hover {
  opacity: 0.85;
}
.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}
.movie-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}
.movie-card:hover {
  transform: translateY(-5px);
}
.poster {
  width: 100%;
  height: 380px;
  object-fit: cover;
}
.poster-placeholder {
  width: 100%;
  height: 380px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-weight: bold;
}
.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.title {
  font-size: 18px;
  color: #333;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}
.release-date {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 10px;
}
.rating {
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 10px;
  font-size: 16px;
}
.overview {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  margin-bottom: 20px;
  flex-grow: 1;
}
.fav-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: 0.3s;
  margin-top: auto;
}
.fav-btn.active {
  background: #ff4757;
  color: white;
}
.stretched-link {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
</style>
