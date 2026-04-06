<template>
  <div class="roulette-game">
    <!-- Result display -->
    <div v-if="result !== null" class="result-ball" :class="`color-${getColor(result)}`">
      <span class="result-num">{{ result }}</span>
      <span class="result-color">{{ getColor(result) === 'red' ? 'Κόκκινο' : getColor(result) === 'black' ? 'Μαύρο' : 'Πράσινο' }}</span>
    </div>
    <div v-else class="result-ball color-none">
      <span class="result-num">?</span>
    </div>

    <!-- Number grid 0-36 -->
    <div class="number-grid">
      <div
        class="num-cell num-zero"
        :class="{ 'cell-result': result === 0 }"
        @click="addStraightBet(0)"
      >0</div>
      <div
        v-for="n in 36"
        :key="n"
        class="num-cell"
        :class="[`color-${getColor(n)}`, { 'cell-result': result === n, 'cell-has-bet': hasStraightBet(n) }]"
        @click="addStraightBet(n)"
      >{{ n }}</div>
    </div>

    <!-- Outside bets -->
    <div class="outside-bets">
      <button v-for="ob in outsideBets" :key="ob.id"
              class="ob-btn"
              :class="{ 'ob-active': hasBet(ob.id), [`ob-${ob.color}`]: ob.color }"
              @click="toggleOutsideBet(ob)">
        {{ ob.label }}<br><small>{{ ob.payout }}:1</small>
      </button>
    </div>

    <!-- Active bets summary -->
    <div v-if="activeBets.length" class="bets-summary">
      <div class="bets-title">Στοιχήματα:</div>
      <div class="bets-list">
        <span v-for="b in activeBets" :key="b.id" class="bet-chip">
          {{ b.label }}: €{{ b.amount }}
          <button class="remove-bet" @click="removeBet(b.id)">✕</button>
        </span>
      </div>
      <div class="bets-total">Σύνολο: €{{ totalBet }}</div>
    </div>

    <!-- Bet amount + spin -->
    <div class="controls">
      <div class="bet-row">
        <span class="text-muted">Ποντάρισμα:</span>
        <button class="btn btn-sm btn-outline" @click="adjustBet(-10)">-10</button>
        <div class="bet-display">€{{ betAmount }}</div>
        <button class="btn btn-sm btn-outline" @click="adjustBet(10)">+10</button>
        <button class="btn btn-sm btn-outline" @click="adjustBet(100)">+100</button>
      </div>
      <div class="action-row">
        <button class="btn btn-outline btn-sm" @click="clearBets">Καθαρισμός</button>
        <button class="btn-spin-roulette" @click="spin" :disabled="!canSpin">
          {{ spinning ? '🎡 Στρίβει...' : '🎡 Στρίψε!' }}
        </button>
      </div>
    </div>

    <!-- Last result detail -->
    <div v-if="lastResultDetail" class="result-detail">
      <div v-for="line in lastResultDetail" :key="line.label" class="result-line"
           :class="line.won ? 'line-win' : 'line-lose'">
        {{ line.label }}: {{ line.won ? `+€${line.payout}` : `-€${line.amount}` }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../../stores/playerStore'
import { useCasinoStore } from '../../stores/casinoStore'

const player = usePlayerStore()
const casino = useCasinoStore()

const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])

function getColor(n) {
  if (n === 0) return 'green'
  return RED_NUMBERS.has(n) ? 'red' : 'black'
}

const betAmount = ref(10)
const activeBets = ref([])  // [{ id, label, type, value, amount, payout }]
const result = ref(null)
const spinning = ref(false)
const lastResultDetail = ref(null)

const outsideBets = [
  { id: 'red',    label: 'Κόκκινο', type: 'color',  value: 'red',   payout: 1, color: 'red'   },
  { id: 'black',  label: 'Μαύρο',   type: 'color',  value: 'black', payout: 1, color: 'black' },
  { id: 'odd',    label: 'Μονό',    type: 'parity', value: 'odd',   payout: 1 },
  { id: 'even',   label: 'Ζυγό',    type: 'parity', value: 'even',  payout: 1 },
  { id: 'low',    label: '1-18',    type: 'range',  value: 'low',   payout: 1 },
  { id: 'high',   label: '19-36',   type: 'range',  value: 'high',  payout: 1 },
  { id: 'd1',     label: '1ο Δωδ.', type: 'dozen',  value: 1,       payout: 2 },
  { id: 'd2',     label: '2ο Δωδ.', type: 'dozen',  value: 2,       payout: 2 },
  { id: 'd3',     label: '3ο Δωδ.', type: 'dozen',  value: 3,       payout: 2 },
]

const totalBet = computed(() => activeBets.value.reduce((s, b) => s + b.amount, 0))

const canSpin = computed(() =>
  !spinning.value && activeBets.value.length > 0 && player.cash >= totalBet.value && !player.isIncapacitated
)

function adjustBet(delta) {
  betAmount.value = Math.max(5, Math.min(5000, betAmount.value + delta))
}

function hasBet(id) { return activeBets.value.some(b => b.id === id) }

function hasStraightBet(n) { return activeBets.value.some(b => b.type === 'straight' && b.value === n) }

function addStraightBet(n) {
  const id = `straight-${n}`
  if (hasBet(id)) { removeBet(id); return }
  activeBets.value.push({
    id, label: `Αριθμός ${n}`, type: 'straight', value: n,
    amount: betAmount.value, payout: 35,
  })
}

function toggleOutsideBet(ob) {
  if (hasBet(ob.id)) { removeBet(ob.id); return }
  activeBets.value.push({
    id: ob.id, label: ob.label, type: ob.type, value: ob.value,
    amount: betAmount.value, payout: ob.payout,
  })
}

function removeBet(id) {
  activeBets.value = activeBets.value.filter(b => b.id !== id)
}

function clearBets() {
  activeBets.value = []
}

function checkBet(bet, num) {
  switch (bet.type) {
    case 'straight': return bet.value === num
    case 'color':    return num !== 0 && getColor(num) === bet.value
    case 'parity':   return num !== 0 && (bet.value === 'odd' ? num % 2 !== 0 : num % 2 === 0)
    case 'range':    return num !== 0 && (bet.value === 'low' ? num <= 18 : num >= 19)
    case 'dozen':    return num !== 0 && Math.ceil(num / 12) === bet.value
    default:         return false
  }
}

function spin() {
  if (!canSpin.value) return

  // Deduct all bets
  if (!casino.placeBet(totalBet.value)) return

  spinning.value = true
  lastResultDetail.value = null
  result.value = null

  setTimeout(() => {
    const num = Math.floor(Math.random() * 37) // 0-36
    result.value = num

    let totalWin = 0
    const detail = []

    for (const bet of activeBets.value) {
      const won = checkBet(bet, num)
      const payout = won ? bet.amount * (bet.payout + 1) : 0  // payout + stake returned
      if (won) totalWin += payout
      detail.push({ label: bet.label, won, payout: won ? payout : 0, amount: bet.amount })
    }

    lastResultDetail.value = detail

    const totalBetAmount = totalBet.value
    casino.recordResult(totalBetAmount, totalWin)

    spinning.value = false
    clearBets()
  }, 1500)
}
</script>

<style scoped>
.roulette-game {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.result-ball {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  border: 3px solid currentColor;
  transition: all 0.5s;
}

.result-num  { font-size: 1.8rem; font-weight: var(--font-weight-bold); font-family: var(--font-family-mono); }
.result-color { font-size: 10px; }

.color-red   { color: #e74c3c; background: rgba(231,76,60,0.15); }
.color-black { color: #ccc;    background: rgba(200,200,200,0.1); }
.color-green { color: #2ecc71; background: rgba(46,204,113,0.15); }
.color-none  { color: var(--text-secondary); background: var(--bg-surface-raised); }

/* Number grid */
.number-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
}

.num-zero {
  grid-column: 1 / -1;
  background: #1a4a1a;
  color: #2ecc71;
}

.num-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.num-cell:hover { opacity: 0.8; transform: scale(1.1); }

.num-cell.color-red   { background: rgba(231,76,60,0.3); color: #e74c3c; border: 1px solid rgba(231,76,60,0.2); }
.num-cell.color-black { background: rgba(50,50,50,0.8);  color: #ddd;    border: 1px solid rgba(200,200,200,0.1); }

.num-cell.cell-result { outline: 2px solid gold; transform: scale(1.15); z-index: 1; }
.num-cell.cell-has-bet { outline: 2px solid var(--color-accent); }

/* Outside bets */
.outside-bets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.ob-btn {
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-size-xs);
  text-align: center;
  line-height: 1.3;
  transition: all var(--transition-fast);
}
.ob-btn:hover { border-color: var(--color-accent); }
.ob-btn.ob-active { border-color: var(--color-accent); background: rgba(13,94,175,0.15); }
.ob-btn.ob-red   { color: #e74c3c; }
.ob-btn.ob-black { color: #ccc; }

/* Bets summary */
.bets-summary {
  background: var(--bg-surface-raised);
  border-radius: var(--border-radius-md);
  padding: var(--space-sm);
  font-size: var(--font-size-xs);
}
.bets-title { font-weight: var(--font-weight-bold); margin-bottom: 4px; }
.bets-list  { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.bet-chip   {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--bg-base); border-radius: var(--border-radius-full);
  padding: 2px 8px;
}
.remove-bet { background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 10px; }
.bets-total { font-weight: var(--font-weight-bold); color: var(--color-accent); }

/* Controls */
.controls { display: flex; flex-direction: column; gap: var(--space-sm); }
.bet-row   { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.bet-display { min-width: 56px; text-align: center; font-family: var(--font-family-mono); font-weight: var(--font-weight-bold); }
.action-row { display: flex; gap: var(--space-sm); }

.btn-spin-roulette {
  flex: 1;
  padding: var(--space-sm);
  background: linear-gradient(135deg, #1a6b2e, #2ecc71, #1a6b2e);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-spin-roulette:hover:not(:disabled) { opacity: 0.9; }
.btn-spin-roulette:disabled { opacity: 0.4; cursor: not-allowed; }

/* Result detail */
.result-detail { display: flex; flex-direction: column; gap: 4px; }
.result-line {
  display: flex; justify-content: space-between;
  padding: 4px var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}
.line-win  { background: rgba(46,204,113,0.12); color: var(--color-success); }
.line-lose { background: rgba(231,76,60,0.08);  color: var(--color-danger); }
</style>
