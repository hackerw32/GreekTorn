<template>
  <div class="kontres-page">
    <h2 class="page-title">🏎️ Κόντρες</h2>

    <!-- ── Tab Bar ── -->
    <div class="tab-bar">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════════ -->
    <!-- TAB 1 – ΓΚΑΡΑΖ                               -->
    <!-- ══════════════════════════════════════════════ -->
    <template v-if="activeTab === 'garage'">
      <div v-if="racing.ownedCars.length === 0" class="empty-state card">
        <span class="empty-icon">🚗</span>
        <p>Δεν έχεις κανένα αυτοκίνητο ακόμα.</p>
        <button class="btn btn-primary" @click="activeTab = 'dealer'">
          Πήγαινε στη Μαντρα →
        </button>
      </div>

      <div v-else class="car-grid">
        <div
          v-for="car in racing.ownedCars"
          :key="car.id"
          class="card car-card"
          :class="{ 'car-active': car.id === racing.activeCarId }"
        >
          <div class="car-header">
            <span class="car-icon">{{ car.icon }}</span>
            <div class="car-title">
              <strong>{{ car.name }}</strong>
              <span v-if="car.id === racing.activeCarId" class="badge badge-success active-badge">
                ✓ Ενεργό
              </span>
            </div>
          </div>

          <p class="car-desc text-muted">{{ car.description }}</p>

          <div class="stat-bars">
            <div v-for="(val, key) in car.stats" :key="key" class="stat-row">
              <span class="stat-label">{{ STAT_LABELS[key] }}</span>
              <div class="stat-track">
                <div
                  class="stat-fill"
                  :class="`stat-${key}`"
                  :style="{ width: effectiveStat(car.id, key) + '%' }"
                />
              </div>
              <span class="stat-val text-mono">
                {{ effectiveStat(car.id, key) }}
                <span v-if="upgradeBonus(car.id, key) > 0" class="stat-bonus">
                  (+{{ upgradeBonus(car.id, key) }})
                </span>
              </span>
            </div>
          </div>

          <button
            v-if="car.id !== racing.activeCarId"
            class="btn btn-secondary btn-full"
            @click="racing.setActiveCar(car.id)"
          >
            🔑 Ορισμός ως Ενεργό
          </button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- TAB 2 – ΜΑΝΤΡΑ                               -->
    <!-- ══════════════════════════════════════════════ -->
    <template v-else-if="activeTab === 'dealer'">
      <p class="section-hint text-muted">Αγόρασε αυτοκίνητο — θα προστεθεί στο Γκαράζ σου.</p>

      <div class="dealer-list">
        <div
          v-for="car in CAR_CATALOG"
          :key="car.id"
          class="card dealer-card"
          :class="{ 'dealer-owned': racing.hasCar(car.id) }"
        >
          <div class="dealer-top">
            <span class="car-icon">{{ car.icon }}</span>
            <div class="dealer-info">
              <strong>{{ car.name }}</strong>
              <p class="car-desc text-muted">{{ car.description }}</p>
            </div>
            <div class="dealer-price">
              <span class="price-tag text-mono">€{{ car.price.toLocaleString('el-GR') }}</span>
            </div>
          </div>

          <div class="stat-bars">
            <div v-for="(val, key) in car.stats" :key="key" class="stat-row">
              <span class="stat-label">{{ STAT_LABELS[key] }}</span>
              <div class="stat-track">
                <div class="stat-fill" :class="`stat-${key}`" :style="{ width: val + '%' }" />
              </div>
              <span class="stat-val text-mono">{{ val }}</span>
            </div>
          </div>

          <div class="dealer-action">
            <span v-if="racing.hasCar(car.id)" class="badge badge-success">✓ Αγοράστηκε</span>
            <button
              v-else
              class="btn btn-primary btn-full"
              :disabled="player.cash < car.price"
              @click="handleBuyCar(car.id)"
            >
              {{ player.cash < car.price ? '💸 Λίγα χρήματα' : `🛒 Αγορά €${car.price.toLocaleString('el-GR')}` }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- TAB 3 – ΒΕΛΤΙΩΣΕΙΣ                           -->
    <!-- ══════════════════════════════════════════════ -->
    <template v-else-if="activeTab === 'upgrades'">
      <!-- No active car -->
      <div v-if="!racing.activeCar" class="empty-state card">
        <span class="empty-icon">⚙️</span>
        <p>Δεν έχεις ενεργό αυτοκίνητο.</p>
        <button class="btn btn-primary" @click="activeTab = 'dealer'">Αγόρασε αυτοκίνητο →</button>
      </div>

      <template v-else>
        <!-- Active car badge -->
        <div class="card active-car-banner">
          <span class="car-icon">{{ racing.activeCar.icon }}</span>
          <div>
            <strong>{{ racing.activeCar.name }}</strong>
            <div class="text-muted" style="font-size:var(--font-size-xs)">Ενεργό αυτοκίνητο</div>
          </div>
        </div>

        <!-- Nitro -->
        <div class="card nitro-card">
          <div class="nitro-row">
            <span class="nitro-icon">💨</span>
            <div class="nitro-info">
              <strong>Nitro</strong>
              <div class="text-muted" style="font-size:var(--font-size-xs)">
                Αναλώσιμο — {{ NITRO_CONFIG.usesPerPurchase }} χρήσεις / φιάλα
              </div>
            </div>
            <div class="nitro-count">
              <span class="text-mono nitro-num">{{ racing.nitroCount }}</span>
              <span class="text-muted" style="font-size:var(--font-size-xs)">χρήσεις</span>
            </div>
          </div>
          <button
            class="btn btn-primary btn-full"
            :disabled="player.cash < NITRO_CONFIG.cost"
            @click="handleBuyNitro"
          >
            {{ player.cash < NITRO_CONFIG.cost
              ? '💸 Λίγα χρήματα'
              : `Αγορά ${NITRO_CONFIG.usesPerPurchase} χρήσεων Nitro — €${NITRO_CONFIG.cost.toLocaleString('el-GR')}`
            }}
          </button>
        </div>

        <!-- Upgrades -->
        <p class="section-hint text-muted">Αναβαθμίσεις για {{ racing.activeCar.name }}:</p>

        <div class="upgrades-list">
          <div
            v-for="upg in UPGRADES_CATALOG"
            :key="upg.id"
            class="card upgrade-card"
          >
            <div class="upg-header">
              <span class="upg-icon">{{ upg.icon }}</span>
              <div class="upg-title">
                <strong>{{ upg.name }}</strong>
                <span class="text-muted" style="font-size:var(--font-size-xs)">{{ upg.description }}</span>
              </div>
              <span
                v-if="currentUpgradeLevel(upg.id) >= upg.maxLevel"
                class="badge badge-warning"
              >MAX</span>
              <span v-else class="upg-cost text-mono">
                €{{ nextUpgradeCost(upg).toLocaleString('el-GR') }}
              </span>
            </div>

            <!-- Level pip bar -->
            <div class="level-pips">
              <div
                v-for="n in upg.maxLevel"
                :key="n"
                class="pip"
                :class="{ 'pip-filled': n <= currentUpgradeLevel(upg.id) }"
              />
              <span class="level-label text-muted">
                Επ. {{ currentUpgradeLevel(upg.id) }}/{{ upg.maxLevel }}
              </span>
            </div>

            <button
              v-if="currentUpgradeLevel(upg.id) < upg.maxLevel"
              class="btn btn-secondary btn-full"
              :disabled="player.cash < nextUpgradeCost(upg)"
              @click="handleBuyUpgrade(upg.id)"
            >
              {{ player.cash < nextUpgradeCost(upg)
                ? '💸 Λίγα χρήματα'
                : `⬆️ Αναβάθμιση — €${nextUpgradeCost(upg).toLocaleString('el-GR')}`
              }}
            </button>
          </div>
        </div>
      </template>
    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- TAB 4 – ΚΟΝΤΡΑ                               -->
    <!-- ══════════════════════════════════════════════ -->
    <template v-else-if="activeTab === 'race'">
      <div class="coming-soon card">
        <span class="coming-icon">🏁</span>
        <h3>Ο αγώνας θα προστεθεί στο επόμενο βήμα.</h3>
        <p class="text-muted">
          Εξερεύνησε τα άλλα tabs και ετοίμασε το αυτοκίνητό σου!
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { useRacingStore } from '../stores/racingStore'
import {
  CAR_CATALOG,
  UPGRADES_CATALOG,
  NITRO_CONFIG,
  upgradeCost,
  getUpgradeById,
} from '../data/racing'

const player = usePlayerStore()
const gameStore = useGameStore()
const racing = useRacingStore()

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'garage',   icon: '🏠', label: 'Γκαράζ'     },
  { id: 'dealer',   icon: '🏪', label: 'Μαντρα'      },
  { id: 'upgrades', icon: '⚙️', label: 'Βελτιώσεις'  },
  { id: 'race',     icon: '🏁', label: 'Κόντρα'      },
]
const activeTab = ref('garage')

// ── Stat display helpers ───────────────────────────────────────────────────
const STAT_LABELS = {
  speed:        'Ταχύτητα',
  acceleration: 'Επιτάχυνση',
  handling:     'Χειρισμός',
}

/** Effective stat value for a specific car including its upgrades. */
function effectiveStat(carId, statKey) {
  const car = CAR_CATALOG.find(c => c.id === carId)
  if (!car) return 0
  const upgrades = racing.carUpgrades[carId] ?? {}
  let val = car.stats[statKey] ?? 0
  for (const upg of UPGRADES_CATALOG) {
    if (upg.stat === statKey) {
      val += upg.bonusPerLevel * (upgrades[upg.id] ?? 0)
    }
  }
  return Math.min(100, val)
}

/** Total upgrade bonus for a stat on a car. */
function upgradeBonus(carId, statKey) {
  const upgrades = racing.carUpgrades[carId] ?? {}
  let bonus = 0
  for (const upg of UPGRADES_CATALOG) {
    if (upg.stat === statKey) {
      bonus += upg.bonusPerLevel * (upgrades[upg.id] ?? 0)
    }
  }
  return bonus
}

// ── Upgrade helpers (active car) ───────────────────────────────────────────
function currentUpgradeLevel(upgradeId) {
  return racing.activeCarUpgrades[upgradeId] ?? 0
}

function nextUpgradeCost(upg) {
  const current = currentUpgradeLevel(upg.id)
  return upgradeCost(upg, current)
}

// ── Actions ────────────────────────────────────────────────────────────────
function handleBuyCar(carId) {
  const result = racing.buyCar(carId)
  if (!result.ok) {
    gameStore.addNotification(result.message, 'danger')
  } else {
    const car = CAR_CATALOG.find(c => c.id === carId)
    gameStore.addNotification(`🚗 Αγόρασες ${car.name}!`, 'success')
  }
}

function handleBuyNitro() {
  const result = racing.buyNitro()
  if (!result.ok) {
    gameStore.addNotification(result.message, 'danger')
  } else {
    gameStore.addNotification(`💨 +${NITRO_CONFIG.usesPerPurchase} χρήσεις Nitro!`, 'success')
  }
}

function handleBuyUpgrade(upgradeId) {
  const result = racing.buyUpgrade(upgradeId)
  if (!result.ok) {
    gameStore.addNotification(result.message, 'danger')
  } else {
    const upg = getUpgradeById(upgradeId)
    gameStore.addNotification(`⚙️ ${upg.name} αναβαθμίστηκε!`, 'success')
  }
}
</script>

<style scoped>
.kontres-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title {
  font-size: var(--font-size-2xl);
  margin: 0;
}

/* ── Tab Bar ──────────────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 2px;
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm) var(--space-xs);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.tab-btn:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.tab-icon { font-size: 18px; line-height: 1; }
.tab-label { font-weight: var(--font-weight-medium); white-space: nowrap; }

/* ── Section hint ─────────────────────────────────────────────────────────── */
.section-hint {
  margin: 0;
  font-size: var(--font-size-sm);
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-secondary);
}
.empty-icon { font-size: 48px; }

/* ── Car grid (Garage) ────────────────────────────────────────────────────── */
.car-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.car-card {
  border-left: 3px solid transparent;
  transition: border-color var(--transition-fast);
}

.car-active {
  border-left-color: var(--color-success);
}

.car-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.car-icon { font-size: 32px; flex-shrink: 0; }

.car-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.active-badge { font-size: var(--font-size-xs); }

.car-desc {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-xs);
}

/* ── Stat bars (shared) ───────────────────────────────────────────────────── */
.stat-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-sm);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  min-width: 80px;
}

.stat-track {
  flex: 1;
  height: 8px;
  background: var(--bg-base);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.stat-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width var(--transition-normal);
}

.stat-speed        { background: #2980b9; box-shadow: 0 0 5px rgba(41,128,185,0.5); }
.stat-acceleration { background: #e67e22; box-shadow: 0 0 5px rgba(230,126,34,0.5); }
.stat-handling     { background: #27ae60; box-shadow: 0 0 5px rgba(39,174,96,0.5); }

.stat-val {
  font-size: var(--font-size-xs);
  min-width: 44px;
  text-align: right;
  color: var(--text-secondary);
}

.stat-bonus {
  color: var(--color-success);
  font-size: var(--font-size-xs);
}

/* ── Dealer ───────────────────────────────────────────────────────────────── */
.dealer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.dealer-card {
  opacity: 1;
  transition: opacity var(--transition-fast);
}

.dealer-owned {
  opacity: 0.65;
}

.dealer-top {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.dealer-info { flex: 1; }
.dealer-info strong { display: block; margin-bottom: 2px; }

.dealer-price { flex-shrink: 0; }
.price-tag {
  font-size: var(--font-size-lg);
  color: var(--color-warning);
  font-weight: var(--font-weight-bold);
}

.dealer-action { margin-top: var(--space-sm); }

/* ── Upgrades ─────────────────────────────────────────────────────────────── */
.active-car-banner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: rgba(13,94,175,0.12);
  border-left: 3px solid var(--color-primary);
}

/* Nitro card */
.nitro-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.nitro-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nitro-icon { font-size: 28px; }
.nitro-info { flex: 1; }
.nitro-count { text-align: right; }
.nitro-num {
  font-size: var(--font-size-2xl);
  color: var(--color-accent);
  display: block;
}

/* Upgrade cards */
.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.upgrade-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.upg-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.upg-icon { font-size: 24px; flex-shrink: 0; }

.upg-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upg-cost {
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

/* Level pip bar */
.level-pips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pip {
  width: 28px;
  height: 8px;
  border-radius: var(--border-radius-full);
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  transition: background var(--transition-fast);
}

.pip-filled {
  background: var(--color-primary);
  border-color: var(--color-primary-light);
}

.level-label {
  font-size: var(--font-size-xs);
  margin-left: var(--space-xs);
}

/* ── Badge helpers (not globally scoped in this component) ────────────────── */
.badge {
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
.badge-success { background: rgba(76,175,80,0.15); color: var(--color-success); }
.badge-warning { background: rgba(255,167,38,0.15); color: var(--color-warning); }

/* ── Utility ──────────────────────────────────────────────────────────────── */
.btn-full { width: 100%; justify-content: center; }

/* ── Coming Soon (Κόντρα tab) ─────────────────────────────────────────────── */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl) var(--space-xl);
  text-align: center;
}

.coming-icon { font-size: 56px; }

.coming-soon h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}
</style>
