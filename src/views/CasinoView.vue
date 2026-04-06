<template>
  <div class="casino-page">
    <h2 class="page-title">🎰 Καζίνο / Στοίχημα</h2>

    <!-- Casino stats -->
    <div class="card stats-row">
      <div class="stat-pair">
        <span class="text-muted">Παιχνίδια</span>
        <span class="text-mono">{{ casinoStore.stats.gamesPlayed }}</span>
      </div>
      <div class="stat-pair">
        <span class="text-muted">Κέρδη / Ζημίες</span>
        <span class="text-mono" :class="casinoStore.netProfit >= 0 ? 'text-success' : 'text-danger'">
          {{ casinoStore.netProfit >= 0 ? '+' : '' }}€{{ casinoStore.netProfit.toLocaleString('el-GR') }}
        </span>
      </div>
    </div>

    <!-- Games -->
    <div class="game-list">
      <div v-for="game in casinoGames" :key="game.id" class="card game-card">
        <div class="game-header">
          <span class="game-icon">{{ game.icon }}</span>
          <div class="game-info">
            <strong>{{ game.name }}</strong>
            <p class="text-muted game-desc">{{ game.description }}</p>
          </div>
        </div>

        <div class="game-meta">
          <span class="badge badge-info">x{{ game.payout }}</span>
          <span class="badge badge-muted">{{ (game.winChance * 100).toFixed(0) }}% πιθ.</span>
          <span class="text-muted" style="font-size: var(--font-size-xs)">
            €{{ game.minBet }} - €{{ game.maxBet.toLocaleString('el-GR') }}
          </span>
        </div>

        <!-- Bet controls -->
        <div class="bet-controls mt-sm">
          <div class="bet-input-row">
            <button class="btn btn-sm btn-outline" @click="adjustBet(game.id, -100)">-100</button>
            <button class="btn btn-sm btn-outline" @click="adjustBet(game.id, -10)">-10</button>
            <input
              type="number"
              class="bet-input"
              :min="game.minBet"
              :max="game.maxBet"
              v-model.number="bets[game.id]"
            />
            <button class="btn btn-sm btn-outline" @click="adjustBet(game.id, 10)">+10</button>
            <button class="btn btn-sm btn-outline" @click="adjustBet(game.id, 100)">+100</button>
          </div>

          <!-- Number choice for special games -->
          <div v-if="game.requiresChoice" class="choice-row mt-xs">
            <span class="text-muted" style="font-size: var(--font-size-xs)">Αριθμός:</span>
            <input
              type="number"
              class="choice-input"
              :min="game.choiceRange[0]"
              :max="game.choiceRange[1]"
              v-model.number="choices[game.id]"
            />
          </div>

          <button
            class="btn btn-primary btn-block btn-sm mt-xs"
            :disabled="!canPlay(game)"
            @click="play(game)"
          >
            Παίξε €{{ (bets[game.id] || game.minBet).toLocaleString('el-GR') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Dice Roll Animation -->
    <DiceRoll
      :visible="showDice"
      :result="diceResult"
      @dismiss="onDiceDismiss"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useCasinoStore } from '../stores/casinoStore'
import { useGameStore } from '../stores/gameStore'
import { casinoGames } from '../data/casino'
import DiceRoll from '../components/ui/DiceRoll.vue'

const player = usePlayerStore()
const casinoStore = useCasinoStore()
const gameStore = useGameStore()

const showDice = ref(false)
const diceResult = ref(null)

// Initialize bets and choices for each game
const bets = reactive({})
const choices = reactive({})
for (const game of casinoGames) {
  bets[game.id] = game.minBet
  if (game.requiresChoice) {
    choices[game.id] = game.choiceRange[0]
  }
}

function adjustBet(gameId, delta) {
  const game = casinoGames.find(g => g.id === gameId)
  if (!game) return
  const current = bets[gameId] || game.minBet
  bets[gameId] = Math.min(game.maxBet, Math.max(game.minBet, current + delta))
}

function canPlay(game) {
  const bet = bets[game.id] || game.minBet
  return !player.isIncapacitated && player.cash >= bet && bet >= game.minBet
}

function play(game) {
  if (!canPlay(game)) return

  const bet = bets[game.id] || game.minBet
  const choice = game.requiresChoice ? (choices[game.id] || game.choiceRange[0]) : null

  const result = casinoStore.playGame(game.id, bet, choice)
  if (!result.played) {
    gameStore.addNotification(result.message, 'danger')
    return
  }

  // Show dice animation
  diceResult.value = {
    success: result.success,
    roll: result.roll,
    targetRoll: result.targetRoll,
    label: result.label,
    icon: result.icon,
    rewards: result.success ? { cash: result.winnings } : null,
    consequence: result.success ? null : `Έχασες €${result.betAmount.toLocaleString('el-GR')}`,
  }
  showDice.value = true
}

function onDiceDismiss() {
  showDice.value = false
  diceResult.value = null
}
</script>

<style scoped>
.casino-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title {
  font-size: var(--font-size-2xl);
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.game-card {
  transition: all var(--transition-fast);
}

.game-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.game-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
}

.game-info strong {
  font-size: var(--font-size-sm);
}

.game-desc {
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

.game-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.badge-muted {
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.bet-controls {
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-sm);
}

.bet-input-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.bet-input {
  flex: 1;
  text-align: center;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  padding: var(--space-xs);
  min-width: 0;
}

.bet-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.choice-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.choice-input {
  width: 60px;
  text-align: center;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  padding: var(--space-xs);
}

.choice-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

/* Remove spinner from number inputs */
.bet-input::-webkit-inner-spin-button,
.bet-input::-webkit-outer-spin-button,
.choice-input::-webkit-inner-spin-button,
.choice-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bet-input[type="number"],
.choice-input[type="number"] {
  -moz-appearance: textfield;
}
</style>
