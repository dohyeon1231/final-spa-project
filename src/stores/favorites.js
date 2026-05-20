import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useFavoritesStore = defineStore('favorites', () => {
  // 1. State: 로컬 스토리지에 저장된 데이터가 있으면 파싱해서 가져오고, 없으면 빈 배열로 초기화
  const savedFavorites = JSON.parse(localStorage.getItem('favorite_movies')) || [];
  const favoriteMovies = ref(savedFavorites);

  // 2. Getters: 상태 데이터를 가공해서 보여주는 안내원들
  // 2-1. 찜한 영화의 총 개수
  const totalFavorites = computed(() => favoriteMovies.value.length);

  // 2-2. 찜한 영화들의 평균 평점 계산
  const averageRating = computed(() => {
    if (favoriteMovies.value.length === 0) return 0;
    const sum = favoriteMovies.value.reduce((acc, movie) => acc + movie.rating, 0);
    return (sum / favoriteMovies.value.length).toFixed(1); // 소수점 1자리까지 반환
  });

  // 3. Actions: 상태(State) 데이터를 수정할 수 있는 유일한 함수들
  // 3-1. 찜하기 토글 (목록에 없으면 추가, 있으면 제거)
  const toggleFavorite = (movie) => {
    const index = favoriteMovies.value.findIndex((m) => m.id === movie.id);
    if (index === -1) {
      favoriteMovies.value.push(movie); // 목록에 없으면 새롭게 추가
    } else {
      favoriteMovies.value.splice(index, 1); // 이미 목록에 있으면 제거 (찜 취소)
    }
  };

  // 3-2. 찜 목록 전체 비우기
  const clearAllFavorites = () => {
    favoriteMovies.value = [];
  };

  // 4. Watch를 이용한 영구 저장 로직
  // favoriteMovies 배열에 깊은 변화(deep: true)가 생길 때마다 로컬 스토리지에 덮어씁니다.
  watch(
    favoriteMovies,
    (newVal) => {
      localStorage.setItem('favorite_movies', JSON.stringify(newVal));
    },
    { deep: true }
  );

  // 컴포넌트에서 사용할 수 있도록 모두 외부로 반환
  return { 
    favoriteMovies, 
    totalFavorites, 
    averageRating, 
    toggleFavorite, 
    clearAllFavorites 
  };
});