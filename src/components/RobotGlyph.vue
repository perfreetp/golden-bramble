<template>
  <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4"
       stroke-linecap="round" stroke-linejoin="round">
    <template v-if="kind === 'biped'">
      <circle cx="24" cy="10" r="4.5" />
      <line x1="24" y1="14.5" x2="24" y2="28" />
      <line x1="24" y1="18" x2="14" y2="24" />
      <line x1="24" y1="18" x2="34" y2="24" />
      <line x1="24" y1="28" x2="17" y2="40" />
      <line x1="24" y1="28" x2="31" y2="40" />
    </template>
    <template v-else-if="kind === 'quadruped'">
      <ellipse cx="25" cy="22" rx="13" ry="7" />
      <circle cx="37" cy="18" r="4" />
      <line x1="17" y1="27" x2="14" y2="39" />
      <line x1="22" y1="28" x2="21" y2="40" />
      <line x1="28" y1="28" x2="29" y2="40" />
      <line x1="33" y1="27" x2="36" y2="39" />
    </template>
    <template v-else-if="kind === 'arm'">
      <rect x="12" y="34" width="24" height="7" rx="2" />
      <line x1="24" y1="34" x2="24" y2="24" />
      <line x1="24" y1="24" x2="34" y2="15" />
      <line x1="34" y1="15" x2="38" y2="8" />
      <circle cx="24" cy="24" r="2.6" />
      <circle cx="34" cy="15" r="2.6" />
    </template>
    <template v-else>
      <rect x="10" y="16" width="28" height="17" rx="5" />
      <circle cx="17" cy="37" r="4" />
      <circle cx="31" cy="37" r="4" />
      <line x1="24" y1="16" x2="24" y2="9" />
      <circle cx="24" cy="7" r="2.4" />
      <circle cx="19" cy="24.5" r="2" fill="currentColor" />
      <circle cx="29" cy="24.5" r="2" fill="currentColor" />
    </template>
  </svg>
</template>

<script setup>
defineProps({ kind: String })
</script>
