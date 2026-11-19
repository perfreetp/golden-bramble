<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 108 },
  stroke: { type: Number, default: 9 },
  label: { type: String, default: '' },
  color: { type: String, default: 'var(--accent)' },
})
const R = 50
const C = 2 * Math.PI * R
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 120 120" :width="size" :height="size">
      <circle cx="60" cy="60" :r="R" fill="none" stroke="rgba(255,255,255,.07)" :stroke-width="stroke" />
      <circle
        cx="60" cy="60" :r="R" fill="none" :stroke="color" :stroke-width="stroke"
        stroke-linecap="round" :stroke-dasharray="C"
        :stroke-dashoffset="C * (1 - Math.max(0, Math.min(100, value)) / 100)"
        transform="rotate(-90 60 60)"
        style="transition: stroke-dashoffset .5s ease"
      />
    </svg>
    <div class="ring-center">
      <div class="ring-v mono">{{ value }}<span class="pct">%</span></div>
      <div v-if="label" class="ring-l">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.ring { position: relative; display: grid; place-items: center; flex: 0 0 auto; }
.ring svg { position: absolute; inset: 0; }
.ring-center { text-align: center; }
.ring-v { font-size: 19px; font-weight: 700; letter-spacing: -.03em; }
.pct { font-size: 11px; opacity: .6; margin-left: 1px; }
.ring-l { font-size: 10px; color: var(--fg-faint); margin-top: 1px; }
</style>
