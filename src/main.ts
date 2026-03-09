import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from './router'

const ZenPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f9f6f1',
          100: '#f3efe8',
          200: '#e8e2d9',
          300: '#d5ccc0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0D1E2B',
        },
        primary: {
          color: '#0D1E2B',
          contrastColor: '#ffffff',
          hoverColor: '#162a3a',
          activeColor: '#0a1620',
        },
        highlight: {
          background: '#f9f6f1',
          focusBackground: '#f3efe8',
          color: '#0D1E2B',
          focusColor: '#0D1E2B',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: ZenPreset,
    options: {
      darkModeSelector: false,
      cssLayer: false,
    },
  },
})

app.mount('#app')
