import { createApp } from 'vue'
import './style.scss'
import './style2.css'
import App from './App.vue'
import router from './router/index'
import ElementPlus  from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app
.use(router)
.use(ElementPlus)

app.mount('#app')
