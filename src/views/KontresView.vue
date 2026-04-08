<template>
  <div class="kontres-page">
    <h2 class="page-title">🏎️ Κόντρες</h2>

    <!-- ── SELECT OPPONENT ── -->
    <template v-if="phase === 'select'">
      <div class="card player-info-card">
        <div class="pi-row">
          <span class="pi-icon">🏎️</span>
          <div>
            <strong>{{ playerName }}</strong>
            <div class="text-muted" style="font-size:var(--font-size-xs)">Σύνολο stats: {{ Math.round(player.totalStats) }}</div>
          </div>
          <div class="pi-speed">
            <span class="text-mono text-accent">{{ playerMaxSpeed.toFixed(1) }}</span>
            <div class="text-muted" style="font-size:var(--font-size-xs)">Top speed</div>
          </div>
        </div>
      </div>

      <p class="section-label">Επίλεξε αντίπαλο:</p>

      <div class="opponent-list">
        <div
          v-for="opp in raceOpponents"
          :key="opp.id"
          class="card opponent-card"
          @click="selectOpponent(opp)"
        >
          <span class="opp-icon">{{ opp.icon }}</span>
          <div class="opp-info">
            <strong>{{ opp.nickname }}</strong>
            <div class="opp-meta">
              <span class="badge" :class="diffBadge(opp)">{{ diffLabel(opp) }}</span>
              <span class="text-muted" style="font-size:var(--font-size-xs)">top {{ opp.maxSpeed.toFixed(1) }} speed</span>
            </div>
          </div>
          <span class="opp-arrow">›</span>
        </div>
      </div>
    </template>

    <!-- ── WAGER ── -->
    <template v-else-if="phase === 'wager'">
      <div class="card matchup-card">
        <div class="matchup-row">
          <div class="matchup-side">
            <span style="font-size:28px">🏎️</span>
            <span>{{ playerName }}</span>
          </div>
          <span class="vs-badge">VS</span>
          <div class="matchup-side">
            <span style="font-size:28px">{{ selectedOpp.icon }}</span>
            <span>{{ selectedOpp.nickname }}</span>
          </div>
        </div>
      </div>

      <div class="card wager-card">
        <p class="text-muted">Ποντάρισμα:</p>
        <div class="wager-row">
          <span class="wager-prefix">€</span>
          <input
            v-model.number="wagerAmount"
            type="number"
            class="wager-input"
            :min="50"
            :max="maxWager"
            step="50"
          />
        </div>
        <div class="wager-presets">
          <button
            v-for="p in wagerPresets"
            :key="p"
            class="preset-btn"
            :class="{ active: wagerAmount === p }"
            @click="wagerAmount = p"
          >€{{ p.toLocaleString('el-GR') }}</button>
        </div>
        <div class="wager-info">
          <span class="badge badge-info">Κόστος: 10 ⚡</span>
          <span v-if="!canRace" class="badge badge-danger">
            {{ player.resources.energy.current < 10 ? 'Λίγη ενέργεια!' : 'Λίγα χρήματα!' }}
          </span>
        </div>
      </div>

      <div class="action-row">
        <button class="btn btn-secondary" @click="phase = 'select'">← Πίσω</button>
        <button class="btn btn-primary" :disabled="!canRace" @click="startCountdown">🏁 Ξεκίνα Κόντρα!</button>
      </div>
    </template>

    <!-- ── COUNTDOWN + RACE ── -->
    <template v-else-if="phase === 'countdown' || phase === 'racing'">
      <div class="race-wrapper">
        <canvas ref="raceCanvas" class="race-canvas" width="400" height="210" />

        <div v-if="phase === 'countdown'" class="countdown-overlay">
          <span class="countdown-num">{{ countdownNum }}</span>
        </div>

        <div v-if="phase === 'racing'" class="race-controls">
          <button
            class="gas-btn"
            :class="{ 'gas-active': gasActive }"
            @mousedown="gasDown" @mouseup="gasUp" @mouseleave="gasUp"
            @touchstart.prevent="gasDown" @touchend.prevent="gasUp" @touchcancel.prevent="gasUp"
          >
            🔥 GAS!
          </button>
          <div class="speedometer">
            <span class="speed-val text-mono">{{ Math.round(playerSpeedDisplay * 55) }}</span>
            <span class="speed-unit text-muted">km/h</span>
          </div>
        </div>
      </div>

      <!-- Progress bars below canvas -->
      <div v-if="phase === 'racing'" class="progress-section">
        <div class="progress-row">
          <span class="prog-label">🏎️ Εσύ</span>
          <div class="prog-track">
            <div class="prog-fill player-fill" :style="{ width: playerProgress + '%' }" />
          </div>
          <span class="prog-pct text-mono">{{ Math.round(playerProgress) }}%</span>
        </div>
        <div class="progress-row">
          <span class="prog-label">{{ selectedOpp.icon }} Αντίπαλος</span>
          <div class="prog-track">
            <div class="prog-fill opp-fill" :style="{ width: oppProgress + '%' }" />
          </div>
          <span class="prog-pct text-mono">{{ Math.round(oppProgress) }}%</span>
        </div>
      </div>
    </template>

    <!-- ── RESULT ── -->
    <template v-else-if="phase === 'result'">
      <div class="card result-card" :class="raceResult === 'win' ? 'result-win' : 'result-lose'">
        <div class="result-icon-big">{{ raceResult === 'win' ? '🏆' : '💀' }}</div>
        <h3 class="result-title">{{ raceResult === 'win' ? 'Κέρδισες!' : 'Έχασες!' }}</h3>
        <div class="result-amount">
          {{ raceResult === 'win' ? '+' : '-' }}€{{ wagerAmount.toLocaleString('el-GR') }}
        </div>
        <p class="text-muted" style="font-size:var(--font-size-xs); margin-top:4px">
          {{ raceResult === 'win'
            ? `Σκόνισες τον ${selectedOpp.nickname}!`
            : `Ο ${selectedOpp.nickname} σε άφησε στη σκόνη.` }}
        </p>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" @click="resetRace">🔄 Νέα Κόντρα</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { fakeUsers } from '../data/fakeUsers'

const player = usePlayerStore()
const gameStore = useGameStore()

// ── Opponent pool ──────────────────────────────────────────────────────────
const raceOpponents = fakeUsers.slice(0, 10).map(u => {
  const total = u.stats.strength + u.stats.speed + u.stats.dexterity + u.stats.defense
  return { ...u, totalStats: total, maxSpeed: 2.5 + total * 0.05 }
}).sort((a, b) => a.maxSpeed - b.maxSpeed)

// ── Player ─────────────────────────────────────────────────────────────────
const playerName = computed(() => player.nickname || 'Εσύ')
const playerMaxSpeed = computed(() => 3 + player.totalStats * 0.05)

function diffClass(opp) {
  const r = opp.maxSpeed / playerMaxSpeed.value
  return r < 0.85 ? 'easy' : r < 1.15 ? 'medium' : 'hard'
}
function diffBadge(opp) {
  const d = diffClass(opp)
  return d === 'easy' ? 'badge-success' : d === 'medium' ? 'badge-warning' : 'badge-danger'
}
function diffLabel(opp) {
  const d = diffClass(opp)
  return d === 'easy' ? 'Εύκολος' : d === 'medium' ? 'Μέτριος' : 'Δύσκολος'
}

// ── Phase & wager ──────────────────────────────────────────────────────────
const phase = ref('select')
const selectedOpp = ref(null)
const wagerAmount = ref(200)
const maxWager = computed(() => Math.min(player.cash, 100000))
const wagerPresets = computed(() => [100, 500, 1000, 5000].filter(p => p <= maxWager.value))
const canRace = computed(() =>
  player.resources.energy.current >= 10 &&
  player.cash >= wagerAmount.value &&
  wagerAmount.value >= 50
)

function selectOpponent(opp) {
  selectedOpp.value = opp
  phase.value = 'wager'
}

// ── Race engine ────────────────────────────────────────────────────────────
const raceCanvas = ref(null)
const countdownNum = ref(3)
const raceResult = ref(null)
const playerSpeedDisplay = ref(0)
const playerProgress = ref(0)
const oppProgress = ref(0)

const RACE_DIST = 400   // abstract units to reach 100%

let gasActive = false
let _playerSpeed = 0
let _oppSpeed = 0
let _playerDist = 0
let _oppDist = 0
let _roadOffset = 0
let animFrame = null

function gasDown() { gasActive = true }
function gasUp()   { gasActive = false }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function startCountdown() {
  if (!canRace.value) return

  player.modifyResource('energy', -10)
  player.removeCash(wagerAmount.value)
  gameStore.saveGame()

  _playerDist = 0
  _oppDist = 0
  _playerSpeed = 0
  _oppSpeed = 0
  _roadOffset = 0
  playerProgress.value = 0
  oppProgress.value = 0
  playerSpeedDisplay.value = 0
  gasActive = false

  phase.value = 'countdown'
  for (let n = 3; n >= 1; n--) {
    countdownNum.value = n
    await sleep(800)
  }

  phase.value = 'racing'
  await nextTick()
  animFrame = requestAnimationFrame(gameLoop)
}

function gameLoop() {
  if (phase.value !== 'racing') return

  const pMax = playerMaxSpeed.value
  const oMax = selectedOpp.value.maxSpeed

  // Player speed: hold gas to accelerate
  if (gasActive) {
    _playerSpeed = Math.min(pMax, _playerSpeed + 0.25)
  } else {
    _playerSpeed = Math.max(0, _playerSpeed - 0.18)
  }

  // Opponent AI: smooth approach to a fluctuating target speed
  const oppTarget = oMax * (0.65 + Math.random() * 0.4)
  _oppSpeed += (oppTarget - _oppSpeed) * 0.07
  _oppSpeed = Math.max(0, Math.min(oMax, _oppSpeed))

  _playerDist += _playerSpeed
  _oppDist    += _oppSpeed
  _roadOffset += Math.max(_playerSpeed, _oppSpeed) * 3.5

  playerSpeedDisplay.value = _playerSpeed
  playerProgress.value = Math.min(100, (_playerDist / RACE_DIST) * 100)
  oppProgress.value    = Math.min(100, (_oppDist    / RACE_DIST) * 100)

  drawRace()

  if (_playerDist >= RACE_DIST || _oppDist >= RACE_DIST) {
    finishRace()
    return
  }

  animFrame = requestAnimationFrame(gameLoop)
}

function drawRace() {
  const c = raceCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const W = c.width, H = c.height

  // ── Sky / background ──
  ctx.fillStyle = '#0d0d1a'
  ctx.fillRect(0, 0, W, H)

  // ── Road (two lanes) ──
  ctx.fillStyle = '#2a2a3e'
  ctx.fillRect(0, H * 0.1, W, H * 0.8)

  // Road edges
  ctx.fillStyle = '#e2b72f'
  ctx.fillRect(0, H * 0.1,     W, 3)
  ctx.fillRect(0, H * 0.9 - 3, W, 3)

  // Lane separator (dashed white)
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.setLineDash([28, 18])
  ctx.lineDashOffset = -(_roadOffset % 46)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.stroke()
  ctx.restore()

  // Roadside markers scrolling
  const markerSpacing = 80
  for (let i = 0; i < 6; i++) {
    const mx = ((i * markerSpacing - (_roadOffset * 1.5) % (markerSpacing * 6)) + W * 2) % (W + markerSpacing) - markerSpacing / 2
    ctx.fillStyle = '#c0392b'
    ctx.fillRect(mx - 2, H * 0.08, 4, 8)
    ctx.fillRect(mx - 2, H * 0.91, 4, 8)
  }

  // ── Finish line (approaches from right) ──
  const leaderPct = Math.max(_playerDist, _oppDist) / RACE_DIST
  const finishX = W * 0.85 + (1 - leaderPct) * W * 1.2
  if (finishX < W + 20) {
    const rows = 8, cols = 3, sq = 10
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = (r + col) % 2 === 0 ? '#fff' : '#111'
        ctx.fillRect(finishX + col * sq, H * 0.1 + r * sq, sq, sq)
      }
    }
  }

  // ── Cars ──
  // Relative X offset between cars based on distance delta
  const delta = (_playerDist - _oppDist) / RACE_DIST
  const baseX = W * 0.38
  const pCarX = baseX + Math.min(60, Math.max(-60, delta * 80))
  const oCarX = baseX - Math.min(60, Math.max(-60, delta * 80))

  drawCar(ctx, oCarX, H * 0.29, '#e74c3c', '#922b21') // opponent — top lane
  drawCar(ctx, pCarX, H * 0.71, '#2980b9', '#1a5276') // player  — bottom lane

  // ── HUD overlay ──
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, W, H * 0.09)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px monospace'
  ctx.fillText(`${selectedOpp.value.icon} ${selectedOpp.value.nickname}`, 8, H * 0.068)
  ctx.fillStyle = '#e74c3c'
  ctx.fillText(`${Math.round(oppProgress.value)}%`, W - 36, H * 0.068)
}

function drawCar(ctx, cx, cy, body, dark) {
  const w = 40, h = 20

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w, h)

  // Body
  ctx.fillStyle = body
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h)

  // Roof (darker)
  ctx.fillStyle = dark
  ctx.fillRect(cx - w / 2 + 8, cy - h / 2 + 3, w - 20, h - 6)

  // Windshields (light blue-white)
  ctx.fillStyle = 'rgba(180, 220, 255, 0.55)'
  ctx.fillRect(cx - w / 2 + 10, cy - h / 2 + 4, 11, 7)
  ctx.fillRect(cx + 1, cy - h / 2 + 4, 9, 7)

  // Wheels
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(cx - w / 2,     cy - h / 2 - 3, 9, 4)
  ctx.fillRect(cx + w / 2 - 9, cy - h / 2 - 3, 9, 4)
  ctx.fillRect(cx - w / 2,     cy + h / 2 - 1, 9, 4)
  ctx.fillRect(cx + w / 2 - 9, cy + h / 2 - 1, 9, 4)

  // Wheel shine
  ctx.fillStyle = '#555'
  ctx.fillRect(cx - w / 2 + 2, cy - h / 2 - 2, 3, 2)
  ctx.fillRect(cx + w / 2 - 7, cy - h / 2 - 2, 3, 2)
  ctx.fillRect(cx - w / 2 + 2, cy + h / 2,     3, 2)
  ctx.fillRect(cx + w / 2 - 7, cy + h / 2,     3, 2)
}

function finishRace() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
  const won = _playerDist >= _oppDist
  raceResult.value = won ? 'win' : 'lose'

  if (won) {
    player.addCash(wagerAmount.value * 2)
    player.logActivity(`🏎️ Κόντρα vs ${selectedOpp.value.nickname}: Νίκη! +€${wagerAmount.value}`, 'success')
    gameStore.addNotification(`🏆 Νίκη κόντρας! +€${wagerAmount.value.toLocaleString('el-GR')}`, 'success')
  } else {
    player.logActivity(`🏎️ Κόντρα vs ${selectedOpp.value.nickname}: Ήττα! -€${wagerAmount.value}`, 'danger')
    gameStore.addNotification(`💀 Ήττα κόντρας! -€${wagerAmount.value.toLocaleString('el-GR')}`, 'danger')
  }

  gameStore.saveGame()
  phase.value = 'result'
}

function resetRace() {
  phase.value = 'select'
  selectedOpp.value = null
  raceResult.value = null
  _playerSpeed = 0
  _oppSpeed = 0
  playerSpeedDisplay.value = 0
  playerProgress.value = 0
  oppProgress.value = 0
}

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
.kontres-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title {
  font-size: var(--font-size-2xl);
}

/* Player info card */
.player-info-card { }
.pi-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.pi-icon { font-size: 32px; }
.pi-row > div { flex: 1; }
.pi-speed { text-align: right; }
.pi-speed .text-mono { font-size: var(--font-size-xl); }

/* Section label */
.section-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Opponent list */
.opponent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.opponent-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.opponent-card:hover {
  background: var(--bg-surface-raised);
  transform: translateX(3px);
}
.opp-icon { font-size: 28px; flex-shrink: 0; }
.opp-info { flex: 1; }
.opp-info strong { font-size: var(--font-size-sm); display: block; margin-bottom: 4px; }
.opp-meta { display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; }
.opp-arrow { font-size: 22px; color: var(--text-secondary); }

/* Badge variants */
.badge { padding: 2px 8px; border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
.badge-success { background: rgba(46,204,113,0.15); color: var(--color-success); }
.badge-warning { background: rgba(243,156,18,0.15); color: var(--color-warning); }
.badge-danger  { background: rgba(231,76,60,0.15);  color: var(--color-danger); }
.badge-info    { background: rgba(52,152,219,0.15);  color: var(--color-accent); }

/* Matchup card */
.matchup-card { }
.matchup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}
.matchup-side { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: var(--font-size-sm); }
.vs-badge {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning);
  background: rgba(243,156,18,0.1);
  padding: 4px 12px;
  border-radius: var(--border-radius-md);
}

/* Wager */
.wager-card { display: flex; flex-direction: column; gap: var(--space-sm); }
.wager-row {
  display: flex;
  align-items: center;
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 0 var(--space-sm);
}
.wager-prefix { color: var(--color-success); font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); padding-right: 4px; }
.wager-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-family: var(--font-family-mono);
  padding: var(--space-sm) 0;
}
.wager-presets { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.preset-btn {
  padding: 4px 10px;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.preset-btn:hover, .preset-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.wager-info { display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center; }

/* Action row */
.action-row {
  display: flex;
  gap: var(--space-sm);
}
.action-row .btn { flex: 1; }

/* Race */
.race-wrapper { position: relative; border-radius: var(--border-radius-lg); overflow: hidden; }

.race-canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-md);
  border: 2px solid rgba(255,255,255,0.08);
}

.countdown-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.55);
  border-radius: var(--border-radius-md);
}
.countdown-num {
  font-size: 80px;
  font-weight: 900;
  color: #e2b72f;
  text-shadow: 0 0 30px rgba(226,183,47,0.8);
  animation: countPop 0.4s ease;
}
@keyframes countPop {
  from { transform: scale(1.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.race-controls {
  display: flex;
  gap: var(--space-md);
  align-items: stretch;
  margin-top: var(--space-sm);
}

.gas-btn {
  flex: 1;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-danger);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background var(--transition-fast), transform 0.08s;
  box-shadow: 0 4px 14px rgba(231,76,60,0.45);
  animation: gasPulse 1.5s infinite;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.gas-btn:active, .gas-btn.gas-active {
  background: #922b21;
  transform: scale(0.97);
  animation: none;
  box-shadow: 0 2px 8px rgba(231,76,60,0.3);
}
@keyframes gasPulse {
  0%, 100% { box-shadow: 0 4px 14px rgba(231,76,60,0.45); }
  50%       { box-shadow: 0 4px 26px rgba(231,76,60,0.75); }
}

.speedometer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--space-sm) var(--space-md);
  min-width: 70px;
}
.speed-val { font-size: var(--font-size-2xl); color: var(--color-accent); }
.speed-unit { font-size: var(--font-size-xs); }

/* Progress bars */
.progress-section { display: flex; flex-direction: column; gap: var(--space-sm); }
.progress-row { display: flex; align-items: center; gap: var(--space-sm); }
.prog-label { font-size: var(--font-size-xs); min-width: 90px; }
.prog-track {
  flex: 1;
  height: 12px;
  background: var(--bg-base);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.prog-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width 0.12s linear;
}
.player-fill { background: #2980b9; box-shadow: 0 0 6px rgba(41,128,185,0.6); }
.opp-fill    { background: #e74c3c; box-shadow: 0 0 6px rgba(231,76,60,0.6); }
.prog-pct { font-size: var(--font-size-xs); min-width: 36px; text-align: right; }

/* Result */
.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl);
  text-align: center;
}
.result-win  { border-left: 4px solid var(--color-success); }
.result-lose { border-left: 4px solid var(--color-danger); }
.result-icon-big { font-size: 52px; }
.result-title { font-size: var(--font-size-2xl); margin: 0; }
.result-amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
}
.result-win  .result-amount { color: var(--color-success); }
.result-lose .result-amount { color: var(--color-danger); }
</style>
