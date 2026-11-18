<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand"><span class="logo">R</span>机器人剧场走位编排</div>
      <button class="nav-btn" :class="{ 'router-link-active': $route.path.startsWith('/shows') }"
              @click="$router.push('/shows')">剧目列表</button>
      <button class="nav-btn" :class="{ 'router-link-active': $route.path.startsWith('/editor') }"
              @click="goEditor">走位画布</button>
      <button class="nav-btn" :class="{ 'router-link-active': $route.path.startsWith('/assets') }"
              @click="$router.push('/assets')">素材库</button>
      <button class="nav-btn" :class="{ 'router-link-active': $route.path.startsWith('/admin') }"
              @click="$router.push('/admin')">后台</button>
      <div class="spacer"></div>
      <span class="tag" v-if="store.currentShow">{{ store.currentShow.name }}</span>
    </header>
    <main class="page">
      <router-view />
    </main>
    <div class="toast-wrap">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.kind">{{ t.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useShowStore } from './store/show.js'
import { useUiStore } from './store/ui.js'

const router = useRouter()
const store = useShowStore()
const ui = useUiStore()

function goEditor() {
  if (store.currentShow) router.push(`/editor/${store.currentShow.id}`)
  else router.push('/shows')
}
</script>
