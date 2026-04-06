<template>
  <div class="activity-timer" v-if="player.activeActivity" @click="navigateToActivity">
    <div class="activity-info">
      <span class="activity-icon">{{ player.activeActivity.icon }}</span>
      <span class="activity-label">{{ player.activeActivity.label }}</span>
      <span class="activity-time text-mono">{{ formatTime(player.activityTimeRemaining) }}</span>
    </div>
    <div class="activity-bar-track">
      <div
        class="activity-bar-fill"
        :style="{ width: (player.activityProgress * 100) + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '../../stores/playerStore'
import { useRouter } from 'vue-router'

const player = usePlayerStore()
const router = useRouter()

function formatTime(ms) {
  if (ms <= 0) return '0:00'
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function navigateToActivity() {
  if (!player.activeActivity) return
  const type = player.activeActivity.type
  if (type === 'crime') router.push('/crimes')
  else if (type === 'gym') router.push('/gym')
  else if (type === 'travel') router.push('/travel')
  else if (type === 'education') router.push('/education')
}
</script>

<style scoped>
.activity-timer {
  background: var(--bg-surface-raised);
  border: 1px solid var(--color-accent);
  border-radius: var(--border-radius-md);
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.activity-timer:hover {
  background: var(--bg-hover);
}

.activity-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  margin-bottom: 3px;
}

.activity-icon {
  flex-shrink: 0;
}

.activity-label {
  flex: 1;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  flex-shrink: 0;
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.activity-bar-track {
  height: 3px;
  background: var(--bg-base);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.activity-bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--border-radius-full);
  transition: width 0.3s linear;
}
</style>
