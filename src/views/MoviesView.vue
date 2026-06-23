<script>
export default { name: 'MoviesView' }
</script>

<script setup>
import { onMounted } from "vue";
import { useMovieStore } from "../stores/movieStore";

const store = useMovieStore();

const sortButtons = [
  { type: 'popularity', label: '인기순' },
  { type: 'title', label: '제목순' },
  { type: 'date', label: '개봉일순' },
  { type: 'rating', label: '평점순' },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const handleSort = (type) => {
  store.setSortType(type);
  scrollToTop();
};

const handlePage = (page) => {
  store.setPage(page);
  scrollToTop();
};

onMounted(() => {
  store.fetchMovies();
  document.title = "🍿 국내 극장 화제작";
});
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🍿 국내 극장 화제작</h1>
      <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
    </div>

    <!-- [선택 1] 정렬 버튼 -->
    <div class="sort-bar">
      <span class="sort-label">정렬 기준:</span>
      <button
        v-for="btn in sortButtons"
        :key="btn.type"
        @click="handleSort(btn.type)"
        :class="['sort-btn', { active: store.sortType === btn.type }]"
      >
        {{ btn.label }}
      </button>
    </div>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
    </div>

    <div v-else-if="store.errorMessage" class="status-message error">
      🚨 {{ store.errorMessage }}
    </div>

    <template v-else>
      <div class="movie-list">
        <div
          v-for="movie in store.paginatedMovies"
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
                  : "국내에 등록된 줄거리 요약 정보가 없습니다."
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

      <!-- [선택 4] 페이지네이션 컨트롤 -->
      <div class="pagination" v-if="store.totalPages > 1">
        <button
          class="page-btn"
          :disabled="store.currentPage === 1"
          @click="handlePage(store.currentPage - 1)"
        >
          ◀
        </button>
        <button
          v-for="page in store.totalPages"
          :key="page"
          @click="handlePage(page)"
          :class="['page-btn', { active: store.currentPage === page }]"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="store.currentPage === store.totalPages"
          @click="handlePage(store.currentPage + 1)"
        >
          ▶
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.header-section {
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
}
.sub-title {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
}

/* 정렬 버튼 바 */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 14px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.sort-label {
  font-size: 14px;
  font-weight: 700;
  color: #7f8c8d;
}
.sort-btn {
  padding: 8px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #555;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sort-btn:hover {
  border-color: #ff4757;
  color: #ff4757;
}
.sort-btn.active {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}

.status-message {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding: 5px;
  border-radius: 12px;
}
.loading {
  color: #3498db;
  background-color: #e3f2fd;
}
.error {
  color: #e74c3c;
  background-color: #fdeaea;
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
  font-weight: 500;
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

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  padding-bottom: 20px;
}
.page-btn {
  min-width: 42px;
  height: 42px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #555;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 10px;
}
.page-btn:hover:not(:disabled) {
  border-color: #ff4757;
  color: #ff4757;
}
.page-btn.active {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
