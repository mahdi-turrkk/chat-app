import { createApp } from 'vue'
import router from "./router/index";
import App from './App.vue'
import 'primeicons/primeicons.css';
import './style.css'



createApp(App).use(router).mount('#app')