import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Pinia 불러오기
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia()); // 중앙 금고(Pinia) 장착
app.use(router);
app.mount('#app');