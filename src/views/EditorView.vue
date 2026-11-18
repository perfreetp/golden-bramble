<template>
  <StageCanvas :id="id" />
</template>

<script setup>
import StageCanvas from '../components/StageCanvas.vue'
defineProps({ id: String })
</script>
