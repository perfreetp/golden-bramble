import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles.css'
import { loadSavedUser } from './store/session.js'
import * as sessionMod from './store/session.js'

import Login from './views/Login.vue'
import Board from './views/Board.vue'
import Editor from './views/Editor.vue'
import Presets from './views/Presets.vue'

loadSavedUser()

const routes = [
  { path: '/', name: 'board', component: Board },
  { path: '/login', name: 'login', component: Login },
  { path: '/editor/:courseId?', name: 'editor', component: Editor },
  { path: '/presets', name: 'presets', component: Presets },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  const { session } = sessionMod
  if (to.name !== 'login' && !session.user) return { name: 'login' }
  if (to.name === 'login' && session.user) return { name: 'board' }
  return true
})

const app = createApp(App).use(router)
app.mount('#app')

// Test hook: expose the rig/animation modules so e2e can inspect real state.
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  Promise.all([
    import('./store/project.js'),
    import('./rig/skeleton.js'),
    import('./rig/renderer.js'),
    import('./store/session.js'),
  ]).then(([project, skeleton, renderer, session]) => {
    window.__sp = { ...project, ...skeleton, ...renderer, session }
  })
}
