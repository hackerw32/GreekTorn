<template>
  <div class="daily-page">
    <h2 class="page-title">📅 Ημερήσιο Bonus</h2>

    <div class="card streak-info">
      <div class="streak-row">
        <div class="streak-stat">
          <span class="text-muted">Σερί</span>
          <span class="text-mono text-accent">{{ dailyStore.currentStreak }}</span>
        </div>
        <div class="streak-stat">
          <span class="text-muted">Ρεκόρ</span>
          <span class="text-mono text-success">{{ dailyStore.maxStreak }}</span>
        </div>
        <div class="streak-stat">
          <span class="text-muted">Συνδέσεις</span>
          <span class="text-mono">{{ dailyStore.totalLogins }}</span>
        </div>
      </div>
    </div>

    <div class="rewards-grid">
      <div
        v-for="(reward, index) in rewards"
        :key="index"
        class="card reward-card"
        :class="{
          'is-today': index === currentDayIndex,
          'is-claimed': index < currentDayIndex || (index === currentDayIndex && !dailyStore.canClaim),
          'is-future': index > currentDayIndex
        }"
      >
        <div class="reward-day">Ημέρα {{ reward.day }}</div>
        <div class="reward-icon">{{ index === 6 ? '🎁' : '📦' }}</div>
        <div class="reward-label">{{ reward.label }}</div>
        <div v-if="index < currentDayIndex || (index === currentDayIndex && !dailyStore.canClaim)" class="reward-check">✅</div>
      </div>
    </div>

    <button
      v-if="dailyStore.canClaim"
      class="btn btn-primary btn-lg btn-block claim-btn"
      @click="claim"
    >
      🎁 Πάρε το Bonus Ημέρας {{ dailyStore.streakDay }}!
    </button>
    <div v-else class="card text-center text-muted claimed-msg">
      ✅ Πήρες το bonus σου σήμερα! Έλα πάλι αύριο.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDailyRewardStore } from '../stores/dailyRewardStore'
import { dailyRewards } from '../data/dailyRewards'

const dailyStore = useDailyRewardStore()
const rewards = dailyRewards

const currentDayIndex = computed(() => dailyStore.currentStreak % 7)
const lastClaimed = ref(null)

function claim() {
  const reward = dailyStore.claimReward()
  if (reward) {
    lastClaimed.value = reward
  }
}
</script>

<style scoped>
.daily-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title { font-size: var(--font-size-2xl); }

.streak-row {
  display: flex;
  justify-content: space-around;
}

.streak-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
}

.reward-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  text-align: center;
  position: relative;
  transition: all var(--transition-fast);
}

.reward-card.is-today {
  border-color: var(--color-accent);
  background: rgba(79, 195, 247, 0.08);
  box-shadow: 0 0 12px rgba(79, 195, 247, 0.2);
}

.reward-card.is-claimed {
  opacity: 0.5;
}

.reward-card.is-future {
  opacity: 0.6;
}

.reward-day {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.reward-icon {
  font-size: 2rem;
}

.reward-label {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  line-height: 1.3;
}

.reward-check {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  font-size: 14px;
}

.claim-btn {
  margin-top: var(--space-sm);
  font-size: var(--font-size-lg);
  padding: var(--space-md);
}

.claimed-msg {
  padding: var(--space-md);
  font-size: var(--font-size-sm);
}
</style>
