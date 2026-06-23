<script setup>
import { ref, computed } from "vue";
import { useMovieStore } from "../stores/movieStore";
import { RouterLink } from "vue-router";

const store = useMovieStore();

const filterQuery = ref('');

const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

const filteredFavorites = computed(() => {
  const q = normalize(filterQuery.value);
  if (!q) return store.favorites;
  return store.favorites.filter((movie) =>
    normalize(movie.title).includes(q) ||
    (movie.original_title && normalize(movie.original_title).includes(q))
  );
});
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>❤️ 나의 찜 목록</h1>
      <p class="sub-title">내가 찜한 영화 {{ store.favorites.length }}편</p>
    </div>

    <!-- 찜 목록이 비어 있을 때 -->
    <div v-if="store.favorites.length === 0" class="empty-state">
      <p class="empty-icon">🎬</p>
      <p class="empty-text">찜 목록이 비어 있습니다.</p>
      <p class="empty-hint">영화 목록에서 마음에 드는 작품의 🤍 버튼을 눌러 찜해보세요!</p>
      <RouterLink to="/movies" class="go-list-btn">전체 영화 목록 보러 가기</RouterLink>
    </div>

    <!-- 찜 목록에 영화가 있을 때 -->
    <template v-else>
      <!-- 찜 목록 전용 검색 필터 -->
      <div class="filter-bar">
        <input
          v-model="filterQuery"
          type="text"
          placeholder="찜 목록에서 검색..."
          class="filter-input"
        />
        <button v-if="filterQuery" @click="filterQuery = ''" class="filter-clear">✕</button>
      </div>

      <!-- 필터 결과 없을 때 -->
      <div v-if="filteredFavorites.length === 0" class="empty-state">
        <p class="empty-icon">🔍</p>
        <p class="empty-text">찜 목록에서 "<strong>{{ filterQuery }}</strong>"를 찾을 수 없습니다.</p>
        <p class="empty-hint">전체 영화 목록에서 검색하려면 상단 헤더의 검색창을 이용하세요.</p>
        <button @click="filterQuery = ''" class="go-list-btn">필터 초기화</button>
      </div>

      <!-- 찜한 영화 카드 목록 -->
      <div v-else class="movie-list">
        <div
          v-for="movie in filteredFavorites"
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
            <p class="rating">⭐ {{ movie.vote_average?.toFixed(1) }} / 10</p>
            <p class="overview">
              {{
                movie.overview
                  ? movie.overview.substring(0, 60) + "..."
                  : "줄거리 정보가 없습니다."
              }}
            </p>
            <div class="btn-row">
              <RouterLink :to="`/movies/${movie.id}`" class="detail-btn">
                상세 보기
              </RouterLink>
              <button
                @click="store.removeFromFavorites(movie.id)"
                class="remove-btn"
              >
                ❌ 찜 해제
              </button>
            </div>
          </div>
        </div>
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

/* 찜 목록 전용 필터 바 */
.filter-bar {
  position: relative;
  max-width: 420px;
  margin: 0 auto 28px;
}
.filter-input {
  width: 100%;
  height: 46px;
  padding: 0 44px 0 18px;
  border: 2px solid #e0e0e0;
  border-radius: 23px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: white;
}
.filter-input:focus {
  border-color: #ff4757;
}
.filter-clear {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.filter-clear:hover {
  color: #ff4757;
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
  font-size: 20px;
  color: #7f8c8d;
  margin-bottom: 10px;
}
.empty-hint {
  font-size: 14px;
  color: #aab0b8;
  margin-bottom: 24px;
}
.go-list-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #ff4757;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: opacity 0.2s;
}
.go-list-btn:hover {
  opacity: 0.85;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.movie-card {
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
  margin-bottom: 16px;
  flex-grow: 1;
}
.btn-row {
  display: flex;
  gap: 8px;
}
.detail-btn {
  flex: 1;
  padding: 10px;
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.2s;
}
.detail-btn:hover {
  opacity: 0.85;
}
.remove-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.remove-btn:hover {
  opacity: 0.85;
}
</style>
