import { onBeforeUnmount, onMounted } from 'vue'
import { editor, action } from '../store/project.js'

/**
 * Single authoritative playback clock. Advances editor.frame at the action's
 * fps regardless of which panels are mounted, so preview + stage stay in sync.
 */
export function usePlayback() {
  let raf = 0
  let last = 0
  let acc = 0

  function tick(now) {
    raf = requestAnimationFrame(tick)
    const a = action.value
    if (!a) return
    const dt = Math.min(120, now - last || 16)
    last = now
    if (!editor.playing) {
      acc = 0
      return
    }
    const interval = 1000 / (a.fps || 24)
    acc += dt
    let stepped = 0
    while (acc >= interval && stepped < 4) {
      acc -= interval
      stepped++
    }
    if (stepped) {
      let f = editor.frame + stepped
      if (f > a.length) f = a.loop === false ? a.length : f - (a.length + 1)
      if (f < 0) f = 0
      editor.frame = f
    }
  }

  onMounted(() => {
    last = performance.now()
    raf = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
}
