<template>
  <div class="activity-timer" v-if="player.activeActivity">
    <div class="activity-timer-main" @click="navigateToActivity">
      <div class="activity-info">
        <span class="activity-icon">{{ player.activeActivity.icon }}</span>
        <span class="activity-label">{{ player.activeActivity.label }}</span>
        <span v-if="player.activityTimeScale >= 3" class="ff-badge">x3</span>
        <span class="activity-time text-mono">{{ formatTime(player.activityTimeRemaining) }}</span>
      </div>
      <div class="activity-bar-track">
        <div
          class="activity-bar-fill"
          :class="{ 'is-fast': player.activityTimeScale >= 3 }"
          :style="{ width: (player.activityProgress * 100) + '%' }"
        />
      </div>
    </div>
    <button
      type="button"
      class="ff-btn"
      :class="{ active: player.activityTimeScale >= 3 }"
      title="Γρήγορη προώθηση χρόνου (x3) μόνο γι' αυτή τη δραστηριότητα. Πάτα ξανά για κανονικό ρολόι."
      aria-label="Γρήγορη προώθηση χρόνου"
      @click.stop="player.toggleActivityFastForward()"
    >
      >>
    </button>
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
  display: flex;
  align-items: stretch;
  gap: var(--space-xs);
  background: var(--bg-surface-raised);
  border: 1px solid var(--color-accent);
  border-radius: var(--border-radius-md);
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-sm);
}

.activity-timer-main {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.activity-timer-main:hover .activity-label {
  color: var(--color-accent);
}

.ff-btn {
  flex-shrink: 0;
  align-self: center;
  width: 2rem;
  min-height: 2.25rem;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-base);
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.ff-btn:hover {
  background: var(--bg-hover);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.ff-btn.active {
  background: rgba(76, 175, 80, 0.2);
  border-color: var(--color-success);
  color: var(--color-success);
}

.ff-badge {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--color-success);
  color: #fff;
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

.activity-bar-fill.is-fast {
  background: linear-gradient(90deg, var(--color-accent), var(--color-success));
}
</style>
