import { defineStore } from 'pinia'

let toastSeq = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    snapEnabled: true,
    snapModes: { grid: true, vertex: true, midpoint: true, equidistant: true },
    snapThreshold: 12
  }),
  actions: {
    toast(text, kind = 'info', ttl = 2600) {
      const id = ++toastSeq
      this.toasts.push({ id, text, kind })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, ttl)
    }
  }
})
