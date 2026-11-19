import { reactive } from 'vue'

let seq = 0
export const toasts = reactive([])

export function toast(message, type = 'info', ms = 3000) {
  const id = ++seq
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, ms)
  return id
}

export const toastOk = (m) => toast(m, 'ok')
export const toastErr = (m) => toast(m, 'error')
export const toastWarn = (m) => toast(m, 'warn')
