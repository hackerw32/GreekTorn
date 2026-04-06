<template>
  <div class="combat-page">
    <h2 class="page-title">⚔️ Μάχη</h2>

    <!-- Combat stats -->
    <div class="card flex flex-between" style="font-size: var(--font-size-sm)">
      <span>Νίκες: <strong class="text-success">{{ combatStore.combatStats.wins }}</strong></span>
      <span>Ήττες: <strong class="text-danger">{{ combatStore.combatStats.losses }}</strong></span>
      <span>Win Rate: <strong class="text-accent">{{ combatStore.combatStats.winRate }}%</strong></span>
    </div>

    <!-- Fight result -->
    <Transition name="slide-up">
      <div v-if="combatStore.lastFight" class="card result-card" :class="combatStore.lastFight.won ? 'result-success' : 'result-fail'">
        <div class="result-header">
          <span class="result-icon">{{ combatStore.lastFight.won ? '🏆' : '💀' }}</span>
          <div>
            <strong>{{ combatStore.lastFight.won ? 'Νίκη!' : 'Ήττα...' }} vs {{ combatStore.lastFight.npcName }}</strong>
            <span class="text-muted" style="font-size: var(--font-size-xs)"> ({{ combatStore.lastFight.turns }} γύροι)</span>
          </div>
        </div>
        <div v-if="combatStore.lastFight.won" class="result-details">
          <span class="badge badge-success">+€{{ combatStore.lastFight.cashReward }}</span>
          <span class="badge badge-info">+{{ combatStore.lastFight.xpReward }} XP</span>
          <span v-if="combatStore.lastFight.itemDrop" class="badge badge-warning">{{ combatStore.lastFight.itemDrop }}!</span>
        </div>

        <!-- Combat log toggle -->
        <button class="btn btn-sm btn-outline mt-sm" @click="showLog = !showLog">
          {{ showLog ? 'Κρύψε' : 'Δες' }} Αναφορά Μάχης
        </button>
        <div v-if="showLog" class="combat-log mt-sm">
          <div v-for="(entry, i) in combatStore.lastFight.log" :key="i" class="log-entry">
            <span class="text-muted">{{ entry.turn }}.</span>
            <span :class="entry.actor === 'player' ? 'text-accent' : 'text-danger'">
              {{ entry.actor === 'player' ? 'Εσύ' : combatStore.lastFight.npcName }}
            </span>
            <span v-if="entry.action === 'hit'"> χτύπησε για <strong>{{ entry.damage }}</strong> ζημιά</span>
            <span v-else class="text-muted"> αστόχησε</span>
          </div>
        </div>

        <button class="btn btn-sm btn-outline mt-sm" @click="combatStore.clearFight()">✕ Κλείσε</button>
      </div>
    </Transition>

    <!-- NPC List by difficulty -->
    <div v-for="diff in difficulties" :key="diff.key" class="difficulty-section">
      <h3 class="difficulty-title">
        <span :class="'badge ' + diff.color">{{ diff.label }}</span>
      </h3>
      <div class="npc-list">
        <div
          v-for="npc in getNpcsByDiff(diff.key)"
          :key="npc.id"
          class="card npc-card"
          :class="{ disabled: !canFight(npc) }"
          @click="fight(npc)"
        >
          <div class="npc-header">
            <span class="npc-icon">{{ npc.icon }}</span>
            <div class="npc-info">
              <strong>{{ npc.name }}</strong>
              <p class="text-muted" style="font-size: var(--font-size-xs)">{{ npc.description }}</p>
            </div>
          </div>
          <div class="npc-stats">
            <span class="badge badge-info">Επ. {{ npc.level }}</span>
            <span class="text-muted text-mono" style="font-size: var(--font-size-xs)">
              €{{ npc.rewards.cashMin }}-{{ npc.rewards.cashMax }}
            </span>
            <span class="badge badge-success" style="font-size: 10px">{{ npc.energyCost }} ⚡</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/playerStore'
import { useCombatStore } from '../stores/combatStore'
import { npcs, difficultyLabels } from '../data/npcs'

const player = usePlayerStore()
const combatStore = useCombatStore()
const router = useRouter()
const showLog = ref(false)

const difficulties = [
  { key: 'easy', ...difficultyLabels.easy },
  { key: 'medium', ...difficultyLabels.medium },
  { key: 'hard', ...difficultyLabels.hard },
  { key: 'very_hard', ...difficultyLabels.very_hard },
  { key: 'boss', ...difficultyLabels.boss },
]

function getNpcsByDiff(difficulty) {
  return npcs.filter(n => n.difficulty === difficulty)
}

function canFight(npc) {
  return player.resources.energy.current >= npc.energyCost && !player.isIncapacitated
}

function fight(npc) {
  if (!canFight(npc)) return
  showLog.value = false
  const result = combatStore.startCombat(npc.id)
  if (result && !result.won) {
    setTimeout(() => router.push('/hospital'), 1500)
  }
}
</script>

<style scoped>
.combat-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title { font-size: var(--font-size-2xl); }

.result-card { border-left: 3px solid; }
.result-success { border-left-color: var(--color-success); }
.result-fail { border-left-color: var(--color-danger); }
.result-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs); }
.result-icon { font-size: 28px; }
.result-details { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

.combat-log {
  max-height: 200px;
  overflow-y: auto;
  font-size: var(--font-size-xs);
  line-height: 1.6;
  background: var(--bg-base);
  padding: var(--space-sm);
  border-radius: var(--border-radius-md);
}

.log-entry { display: flex; gap: var(--space-xs); }

.difficulty-section { margin-bottom: var(--space-sm); }
.difficulty-title { margin-bottom: var(--space-sm); }

.npc-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.npc-card {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.npc-card:hover:not(.disabled) {
  background: var(--bg-surface-raised);
  transform: translateX(2px);
}

.npc-card.disabled { opacity: 0.5; cursor: not-allowed; }

.npc-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.npc-icon { font-size: 28px; flex-shrink: 0; }
.npc-info { flex: 1; min-width: 0; }
.npc-info strong { font-size: var(--font-size-sm); }

.npc-stats {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
</style>
