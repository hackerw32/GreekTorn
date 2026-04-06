<template>
  <transition name="fade">
    <div class="dice-overlay" v-if="visible" @click.self="skipAnimation">
      <div class="dice-container" :class="{ 'result-revealed': phase === 'result' }">
        <!-- Header -->
        <div class="dice-header">
          <span class="dice-header-icon">{{ result.icon || '🎲' }}</span>
          <span class="dice-header-label">{{ result.label }}</span>
        </div>

        <!-- Target info -->
        <div class="dice-target">
          Πιθανότητα: <strong class="text-accent">{{ result.targetRoll }}%</strong>
        </div>
        <div class="dice-chance-bar">
          <div class="dice-chance-fill" :style="{ width: result.targetRoll + '%' }" />
          <div class="dice-chance-label">{{ result.targetRoll }}%</div>
        </div>

        <!-- Dice display -->
        <div class="dice-display">
          <div
            class="dice-number"
            :class="{
              spinning: phase === 'spinning',
              landed: phase === 'result',
              'result-success': phase === 'result' && result.success,
              'result-fail': phase === 'result' && !result.success,
            }"
          >
            {{ displayNumber }}
          </div>
        </div>

        <!-- Result text -->
        <transition name="slide-up">
          <div v-if="phase === 'result'" class="dice-result">
            <div class="result-badge" :class="result.success ? 'badge-success' : 'badge-danger'">
              {{ result.success ? 'Επιτυχία!' : 'Αποτυχία!' }}
            </div>

            <!-- Rewards -->
            <div v-if="result.success && result.rewards" class="dice-rewards">
              <div v-for="(reward, i) in rewardLines" :key="i" class="reward-line">
                <span class="reward-icon">{{ reward.icon }}</span>
                <span>{{ reward.text }}</span>
              </div>
            </div>

            <!-- Failure consequence -->
            <div v-if="!result.success && result.consequence" class="dice-consequence">
              <span>{{ result.consequence }}</span>
            </div>

            <button class="btn btn-primary mt-sm" @click="dismiss">Συνέχεια</button>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    default: null,
    // Expected: { success, roll, targetRoll, label, icon, rewards: { cash, xp, crimeXP, items, statGain }, consequence }
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['dismiss'])

const phase = ref('idle') // 'idle' | 'spinning' | 'result'
const displayNumber = ref(0)
let spinInterval = null
let spinTimeout = null

const rewardLines = computed(() => {
  if (!props.result?.rewards) return []
  const r = props.result.rewards
  const lines = []
  if (r.cash) lines.push({ icon: '💰', text: `+€${r.cash.toLocaleString('el-GR')}` })
  if (r.xp) lines.push({ icon: '⭐', text: `+${r.xp} XP` })
  if (r.crimeXP) lines.push({ icon: '🎭', text: `+${r.crimeXP} Crime XP` })
  if (r.statGain) lines.push({ icon: '💪', text: `+${r.statGain.toFixed(2)} ${r.statName || ''}` })
  if (r.filotimo) lines.push({ icon: '⚖️', text: `${r.filotimo > 0 ? '+' : ''}${r.filotimo} Φιλότιμο` })
  if (r.items && r.items.length) {
    for (const item of r.items) {
      lines.push({ icon: '📦', text: item })
    }
  }
  return lines
})

watch(() => props.visible, (val) => {
  if (val && props.result) {
    startAnimation()
  } else {
    cleanup()
    phase.value = 'idle'
  }
})

function startAnimation() {
  phase.value = 'spinning'
  displayNumber.value = Math.floor(Math.random() * 100) + 1

  // Spin rapidly for 2 seconds
  spinInterval = setInterval(() => {
    displayNumber.value = Math.floor(Math.random() * 100) + 1
  }, 60)

  spinTimeout = setTimeout(() => {
    clearInterval(spinInterval)
    spinInterval = null
    // Land on actual roll
    displayNumber.value = props.result.roll
    phase.value = 'result'
  }, 2000)
}

function skipAnimation() {
  if (phase.value === 'spinning') {
    cleanup()
    displayNumber.value = props.result.roll
    phase.value = 'result'
  }
}

function dismiss() {
  cleanup()
  phase.value = 'idle'
  emit('dismiss')
}

function cleanup() {
  if (spinInterval) {
    clearInterval(spinInterval)
    spinInterval = null
  }
  if (spinTimeout) {
    clearTimeout(spinTimeout)
    spinTimeout = null
  }
}

onBeforeUnmount(cleanup)
</script>

<style scoped>
.dice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.dice-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  max-width: 340px;
  width: 100%;
  text-align: center;
}

.dice-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.dice-target {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.dice-chance-bar {
  position: relative;
  height: 8px;
  background: rgba(231, 76, 60, 0.3);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.dice-chance-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: var(--border-radius-full);
  transition: width 0.5s;
}

.dice-chance-label {
  position: absolute;
  top: -1px;
  right: 4px;
  font-size: 8px;
  color: var(--text-secondary);
  line-height: 10px;
}

.dice-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.dice-number {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  border-radius: var(--border-radius-lg);
  border: 3px solid var(--border-color);
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  transition: all 0.3s;
}

.dice-number.spinning {
  animation: diceSpin 0.15s infinite;
  border-color: var(--color-accent);
  box-shadow: 0 0 20px rgba(13, 94, 175, 0.4);
}

.dice-number.landed.result-success {
  border-color: var(--color-success);
  color: var(--color-success);
  box-shadow: 0 0 30px rgba(46, 204, 113, 0.4);
  animation: successPulse 0.6s ease;
}

.dice-number.landed.result-fail {
  border-color: var(--color-danger);
  color: var(--color-danger);
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.4);
  animation: failShake 0.5s ease;
}

@keyframes diceSpin {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(-2deg); }
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes failShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.dice-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.result-badge {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--border-radius-md);
}

.badge-success {
  background: rgba(46, 204, 113, 0.15);
  color: var(--color-success);
}

.badge-danger {
  background: rgba(231, 76, 60, 0.15);
  color: var(--color-danger);
}

.dice-rewards {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.reward-line {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  padding: var(--space-xs);
  background: var(--bg-surface-raised);
  border-radius: var(--border-radius-sm);
}

.reward-icon {
  flex-shrink: 0;
}

.dice-consequence {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(231, 76, 60, 0.1);
  border-radius: var(--border-radius-sm);
  width: 100%;
}

/* Transitions */
.fade-enter-active { transition: opacity 0.2s; }
.fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: all 0.4s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(16px); }
</style>
