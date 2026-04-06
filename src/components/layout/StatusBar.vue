<template>
  <header class="status-bar">
    <div class="status-bar-inner">
      <div class="status-top">
        <div class="player-info">
          <span class="player-name">{{ player.name }}</span>
          <span class="player-level badge badge-info">Επ. {{ player.level }}</span>
        </div>
        <div class="player-cash">
          <span class="cash-icon">€</span>
          <span class="cash-amount">{{ formatCash(player.cash) }}</span>
        </div>
      </div>
      <div class="status-bars">
        <ResourceBar
          label="Ζωή"
          :current="player.resources.hp.current"
          :max="player.resources.hp.max"
          color="var(--color-hp)"
          bg-color="var(--color-hp-bg)"
          icon="❤️"
        />
        <ResourceBar
          label="Ενέργεια"
          :current="player.resources.energy.current"
          :max="player.resources.energy.max"
          color="var(--color-energy)"
          bg-color="var(--color-energy-bg)"
          icon="⚡"
        />
        <ResourceBar
          label="Θράσος"
          :current="player.resources.nerve.current"
          :max="player.resources.nerve.max"
          color="var(--color-nerve)"
          bg-color="var(--color-nerve-bg)"
          icon="🎭"
        />
        <ResourceBar
          label="Κέφι"
          :current="player.resources.happiness.current"
          :max="player.resources.happiness.max"
          color="var(--color-happiness)"
          bg-color="var(--color-happiness-bg)"
          icon="😄"
        />
      </div>
      <ActivityTimer />
    </div>
  </header>
</template>

<script setup>
import { usePlayerStore } from '../../stores/playerStore'
import ResourceBar from '../ui/ResourceBar.vue'
import ActivityTimer from '../ui/ActivityTimer.vue'

const player = usePlayerStore()

function formatCash(amount) {
  return new Intl.NumberFormat('el-GR').format(Math.floor(amount))
}
</script>

<style scoped>
.status-bar {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-sm) var(--space-md);
  z-index: var(--z-sticky);
  flex-shrink: 0;
}

.status-bar-inner {
  max-width: 800px;
  margin: 0 auto;
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.player-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.player-cash {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.cash-icon {
  font-weight: var(--font-weight-bold);
}

.status-bars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

@media (min-width: 768px) {
  .status-bars {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
