<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, session, setUser, ROLE_LABEL } from '../store/session.js'
import { toastErr } from '../store/toast.js'
import Icon from '../components/Icon.vue'

const router = useRouter()
const users = ref([])
const loading = ref(true)
const picked = ref(session.user?.id || '')
const busy = ref(false)

const ROLE_DESC = {
  coach: '提交课件需求、查看制作进度、验收成品',
  admin: '派单给制作者、全局进度与统计',
  maker: '导入部件绑定骨骼、制作动画、提交质检',
  qc: '抽检提交的课件，判定通过或打回返工',
}

async function load() {
  try {
    const data = await api('/users')
    users.value = data.users
    if (!picked.value) picked.value = data.users[0]?.id
  } catch (e) {
    toastErr(e.message)
  } finally {
    loading.value = false
  }
}
load()

async function enter() {
  if (!picked.value) return
  busy.value = true
  try {
    const { user } = await api('/session', { method: 'POST', body: { userId: picked.value } })
    setUser(user)
    router.push({ name: 'board' })
  } catch (e) {
    toastErr(e.message)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="grid-bg" />
    <div class="login-card">
      <div class="head">
        <div class="logo"><Icon name="target" :size="24" /></div>
        <h1>ShotPose Studio</h1>
        <p class="muted">射击姿势课件工坊 · 选择身份进入</p>
      </div>

      <div v-if="loading" class="muted tiny">加载中…</div>
      <div v-else class="users">
        <button
          v-for="u in users" :key="u.id"
          class="user" :class="{ on: picked === u.id }" @click="picked = u.id"
        >
          <div class="avatar" :style="{ background: u.color }">{{ u.avatar }}</div>
          <div class="u-txt">
            <div class="u-name">
              {{ u.name }}
              <span class="chip">{{ ROLE_LABEL[u.role] }}</span>
            </div>
            <div class="u-desc">{{ ROLE_DESC[u.role] }}</div>
          </div>
          <Icon v-if="picked === u.id" name="check" :size="17" class="tick" />
        </button>
      </div>

      <button class="btn primary enter" :disabled="busy || !picked" @click="enter">
        进入工作台
        <Icon name="chevronRight" :size="15" />
      </button>
      <p class="foot faint tiny">本地演示环境 · 数据保存在 server/data/db.json</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100%; display: grid; place-items: center; position: relative;
  background: radial-gradient(circle at 50% 18%, #1b2531, #0a0d11 62%);
}
.grid-bg {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.032) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(circle at 50% 40%, #000 10%, transparent 72%);
}
.login-card {
  position: relative; width: 440px; max-height: 90vh; overflow: auto;
  padding: 26px; border-radius: 16px; background: rgba(18,23,30,.93);
  border: 1px solid var(--line-2); box-shadow: 0 26px 70px rgba(0,0,0,.6);
}
.head { text-align: center; margin-bottom: 20px; }
.logo {
  width: 46px; height: 46px; margin: 0 auto 12px; border-radius: 13px;
  display: grid; place-items: center; color: #180d04;
  background: linear-gradient(145deg, var(--accent), #b8551c);
  box-shadow: 0 6px 22px rgba(224,122,47,.4);
}
h1 { font-size: 20px; letter-spacing: -.01em; }
.head p { font-size: 12px; margin-top: 6px; }
.users { display: flex; flex-direction: column; gap: 7px; }
.user {
  display: flex; align-items: center; gap: 11px; text-align: left; width: 100%;
  padding: 10px 12px; border-radius: 10px; background: var(--bg-2);
  border: 1px solid var(--line); transition: .14s;
}
.user:hover { border-color: var(--line-2); background: var(--bg-3); }
.user.on { border-color: var(--accent); background: rgba(224,122,47,.08); }
.avatar {
  width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  font-weight: 700; color: #0c0f13; flex: 0 0 auto; font-size: 13px;
}
.u-txt { flex: 1; min-width: 0; }
.u-name { font-weight: 600; display: flex; align-items: center; gap: 7px; font-size: 13px; }
.u-desc { font-size: 11px; color: var(--fg-faint); margin-top: 2px; }
.tick { color: var(--accent); flex: 0 0 auto; }
.enter { width: 100%; height: 36px; margin-top: 18px; justify-content: center; }
.foot { text-align: center; margin-top: 12px; }
</style>
