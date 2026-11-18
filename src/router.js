import { createRouter, createWebHashHistory } from 'vue-router'
import ShowListView from './views/ShowListView.vue'
import EditorView from './views/EditorView.vue'
import AssetLibraryView from './views/AssetLibraryView.vue'
import AdminView from './views/AdminView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/shows' },
    { path: '/shows', name: 'shows', component: ShowListView },
    { path: '/editor/:id', name: 'editor', component: EditorView, props: true },
    { path: '/assets', name: 'assets', component: AssetLibraryView },
    { path: '/admin', name: 'admin', component: AdminView }
  ]
})

export default router
