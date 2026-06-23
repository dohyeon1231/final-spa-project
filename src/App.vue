<script setup>
import { ref, computed } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useMovieStore } from "./stores/movieStore";

const store = useMovieStore();
const router = useRouter();

const searchInput = ref('');

const totalFavoritesCount = computed(() => store.favorites.length);

const averageFavoritesRating = computed(() => {
  if (store.favorites.length === 0) return "0.0";
  const totalRatingSum = store.favorites.reduce(
    (acc, movie) => acc + movie.vote_average, 0
  );
  return (totalRatingSum / store.favorites.length).toFixed(1);
});

const handleSearch = () => {
  const q = searchInput.value.trim();
  if (q) {
    router.push({ name: 'search', query: { q } });
    searchInput.value = '';
  }
};
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <RouterLink to="/" class="logo-zone">
          <span class="logo-icon">🍿</span>
          <h1 class="logo-text">NETVUE</h1>
        </RouterLink>

        <nav class="nav-menu">
          <RouterLink to="/" class="nav-item">홈</RouterLink>
          <RouterLink to="/movies" class="nav-item">영화 목록</RouterLink>
          <RouterLink to="/favorites" class="nav-item">❤️ 찜 목록</RouterLink>
        </nav>

        <!-- [선택 2] 검색창 -->
        <form @submit.prevent="handleSearch" class="search-form">
          <input
            v-model="searchInput"
            type="text"
            placeholder="영화 제목 검색..."
            class="search-input"
          />
          <button type="submit" class="search-btn">🔍</button>
        </form>

        <div class="header-dashboard">
          <RouterLink to="/favorites" class="dashboard-badge favorite-count">
            <span class="badge-label">❤️ 찜한 작품</span>
            <span class="badge-value">{{ totalFavoritesCount }}개</span>
          </RouterLink>
          <div class="dashboard-badge average-rating">
            <span class="badge-label">⭐ 평균 평점</span>
            <span class="badge-value">{{ averageFavoritesRating }} / 10</span>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <KeepAlive include="MoviesView">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <!-- 토스트 알림 -->
    <Transition name="toast">
      <div v-if="store.toastVisible" class="toast-popup">
        {{ store.toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-container {
  font-family: "Noto Sans KR", sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-header {
  background-color: #1e272e;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0 30px;
}
.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.logo-zone {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #ffffff;
  flex-shrink: 0;
}
.logo-icon {
  font-size: 28px;
}
.logo-text {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-menu {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.nav-item {
  color: #ced5e0;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  transition: color 0.2s ease;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
}
.nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}
.router-link-active.nav-item {
  color: #ff4757;
  background-color: rgba(255, 87, 87, 0.1);
}

/* 검색창 */
.search-form {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 300px;
}
.search-input {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  outline: none;
  transition: background 0.2s;
}
.search-input::placeholder {
  color: #a4b0be;
}
.search-input:focus {
  background: rgba(255, 255, 255, 0.2);
}
.search-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.search-btn:hover {
  opacity: 0.85;
}

.header-dashboard {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.dashboard-badge {
  background-color: #2f3542;
  padding: 8px 14px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #3f4656;
}
.badge-label {
  font-size: 12px;
  color: #a4b0be;
  font-weight: 500;
}
.badge-value {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
}
.average-rating .badge-value {
  color: #e1b12c;
}
/* 찜 배지 링크 스타일 초기화 */
a.dashboard-badge {
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}
a.dashboard-badge:hover {
  border-color: #ff4757;
  background-color: rgba(255, 71, 87, 0.15);
}
.main-content {
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}

/* 토스트 알림 */
.toast-popup {
  position: fixed;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 39, 46, 0.92);
  color: #fff;
  padding: 14px 28px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  white-space: nowrap;
  pointer-events: none;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
