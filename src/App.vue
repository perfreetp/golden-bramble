<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { session, setUser, ROLE_LABEL } from './store/session.js'
import { toasts } from './store/toast.js'
import Icon from './components/Icon.vue'

const route = useRoute()
const router = useRouter()
const inEditor = computed(() => route.name === 'editor')
const nav = [
  { name: 'board', label: '课件看板', icon: 'board' },
  { name: 'editor', label: '姿势编辑器', icon: 'bone' },
  { name: 'presets', label: '预设库', icon: 'preset' },
]

function go(name) {
  if (name === 'editor') router.push({ name: 'editor', params: { courseId: route.params.courseId || undefined } })
  else router.push({ name })
}
function logout() {
  setUser(null)
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell" :class="{ editor: inEditor }">
    <header v-if="!inEditor" class="topbar">
      <div class="brand" @click="router.push({ name: 'board' })">
        <div class="logo"><Icon name="target" :size="19" /></div>
        <div>
          <div class="brand-name">ShotPose Studio</div>
          <div class="brand-sub">射击姿势课件工坊</div>
        </div>
      </div>
      <nav class="nav">
        <button
          v-for="n in nav" :key="n.name"
          class="nav-btn" :class="{ on: route.name === n.name }"
          @click="go(n.name)"
        >
          <Icon :name="n.icon" :size="15" />{{ n.label }}
        </button>
      </nav>
      <div class="grow" />
      <div v-if="session.user" class="who">
        <div class="avatar" :style="{ background: session.user.color }">{{ session.user.avatar }}</div>
        <div class="who-txt">
          <div>{{ session.user.name }}</div>
          <div class="faint tiny">{{ ROLE_LABEL[session.user.role] }} · {{ session.user.title }}</div>
        </div>
        <button class="btn sm ghost" @click="logout">切换身份</button>
      </div>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <div class="toasts">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
          <span class="dot" />{{ t.message }}
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.app-shell { display: flex; flex-direction: column; height: 100%; }
.app-shell.editor { height: 100%; }
.topbar {
  display: flex; align-items: center; gap: 22px; height: 56px; padding: 0 18px;
  border-bottom: 1px solid var(--line); background: linear-gradient(180deg, #12171e, #0e1319);
  flex: 0 0 auto;
}
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo {
  width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center;
  background: linear-gradient(145deg, var(--accent), #b8551c); color: #180d04;
  box-shadow: 0 2px 10px rgba(224,122,47,.35);
}
.brand-name { font-weight: 700; font-size: 14px; letter-spacing: .01em; }
.brand-sub { font-size: 10.5px; color: var(--fg-faint); letter-spacing: .06em; }
.nav { display: flex; gap: 3px; }
.nav-btn {
  display: flex; align-items: center; gap: 7px; height: 32px; padding: 0 13px;
  background: transparent; border: 1px solid transparent; border-radius: 8px;
  color: var(--fg-dim); font-weight: 500;
}
.nav-btn:hover { color: var(--fg); background: var(--bg-2); }
.nav-btn.on { color: var(--fg); background: var(--bg-3); border-color: var(--line-2); }
.who { display: flex; align-items: center; gap: 9px; }
.avatar {
  width: 29px; height: 29px; border-radius: 50%; display: grid; place-items: center;
  font-weight: 700; color: #0c0f13; font-size: 12px;
}
.who-txt { line-height: 1.25; margin-right: 4px; }
.app-main { flex: 1; min-height: 0; position: relative; }
.app-shell.editor .app-main { display: flex; }

.toasts { position: fixed; right: 18px; bottom: 18px; display: flex; flex-direction: column; gap: 8px; z-index: 9999; }
.toast {
  display: flex; align-items: center; gap: 9px; padding: 10px 14px; min-width: 200px; max-width: 420px;
  background: #1b232c; border: 1px solid var(--line-2); border-radius: 9px;
  box-shadow: 0 12px 32px rgba(0,0,0,.5); font-size: 12.5px;
}
.toast .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); flex: 0 0 auto; }
.toast.ok .dot { background: var(--green); }
.toast.error .dot { background: var(--red); }
.toast.warn .dot { background: var(--yellow); }
.toast-enter-active, .toast-leave-active { transition: all .22s ease; }
.toast-enter-from { opacity: 0; transform: translateX(24px); }
.toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
