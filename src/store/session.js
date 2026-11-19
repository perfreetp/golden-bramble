import { reactive } from 'vue'

const TOKEN_KEY = 'shotpose.user'

export const session = reactive({
  user: null,
  users: [],
  loading: false,
  error: '',
})

export function loadSavedUser() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (raw) session.user = JSON.parse(raw)
  } catch {
    /* ignore */
  }
}

export function setUser(user) {
  session.user = user
  try {
    if (user) localStorage.setItem(TOKEN_KEY, JSON.stringify(user))
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export async function api(path, { method = 'GET', body, raw } = {}) {
  const headers = {}
  if (session.user) headers['x-user-id'] = session.user.id
  if (body !== undefined && !raw) headers['content-type'] = 'application/json'
  const res = await fetch('/api' + path, {
    method,
    headers,
    body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `请求失败 (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const ROLE_LABEL = {
  admin: '管理员',
  coach: '教练',
  maker: '制作者',
  qc: '质检',
}

export const STATUS_META = {
  pending: { label: '待派单', color: '#e6b95c', chip: 'yellow' },
  in_progress: { label: '制作中', color: '#5ad1ff', chip: 'cyan' },
  review: { label: '质检中', color: '#a98cf0', chip: 'violet' },
  rework: { label: '返工中', color: '#ff5b5b', chip: 'red' },
  done: { label: '已完成', color: '#46c98b', chip: 'green' },
}
