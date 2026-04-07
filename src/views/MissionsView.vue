<template>
  <div class="missions-page">
    <h2 class="page-title">📋 Αποστολές</h2>

    <div class="card missions-header">
      <div class="missions-info">
        <span class="text-muted">Ολοκληρωμένες</span>
        <span class="text-mono text-success">{{ missionStore.totalCompleted }}</span>
      </div>
      <div class="missions-info">
        <span class="text-muted">Σήμερα</span>
        <span class="text-mono">{{ completedToday }} / {{ missionStore.activeMissions.length }}</span>
      </div>
    </div>

    <div v-if="missionStore.activeMissions.length === 0" class="card text-center text-muted">
      Δεν υπάρχουν αποστολές. Θα ανανεωθούν αύριο!
    </div>

    <div class="mission-list">
      <div
        v-for="(mission, index) in missionStore.activeMissions"
        :key="index"
        class="card mission-card"
        :class="{ completed: mission.completed, claimed: mission.claimed }"
      >
        <div class="mission-icon">{{ mission.icon }}</div>
        <div class="mission-info">
          <strong>{{ mission.title }}</strong>
          <p class="text-muted mission-desc">{{ mission.description }}</p>

          <!-- Progress bar -->
          <div class="mission-progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: progressPercent(mission) + '%' }"
                :class="{ 'fill-done': mission.completed }"
              ></div>
            </div>
            <span class="progress-text text-mono">
              {{ Math.min(mission.progress, mission.target) }} / {{ mission.target }}
            </span>
          </div>

          <div class="mission-rewards">
            <span class="badge badge-success">€{{ mission.rewardCash }}</span>
            <span class="badge badge-info">{{ mission.rewardXP }} XP</span>
          </div>
        </div>
        <div class="mission-action">
          <button
            v-if="mission.completed && !mission.claimed"
            class="btn btn-sm btn-success"
            @click="missionStore.claimMission(index)"
          >
            Πάρε
          </button>
          <span v-else-if="mission.claimed" class="badge badge-info">✅</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMissionStore } from '../stores/missionStore'

const missionStore = useMissionStore()

const completedToday = computed(() =>
  missionStore.activeMissions.filter(m => m.completed).length
)

function progressPercent(mission) {
  if (mission.target === 0) return 100
  return Math.min(100, Math.round(mission.progress / mission.target * 100))
}
</script>

<style scoped>
.missions-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-title { font-size: var(--font-size-2xl); }

.missions-header {
  display: flex;
  justify-content: space-around;
}

.missions-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
}

.mission-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mission-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.mission-card.completed {
  border-color: var(--color-success);
}

.mission-card.claimed {
  opacity: 0.6;
  border-color: var(--border-color);
}

.mission-icon { font-size: 28px; flex-shrink: 0; padding-top: 2px; }

.mission-info { flex: 1; min-width: 0; }
.mission-info strong { font-size: var(--font-size-sm); }
.mission-desc { font-size: var(--font-size-xs); margin: 2px 0 var(--space-xs); }

.mission-progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.progress-track {
  flex: 1;
  height: 6px;
  background: var(--bg-surface);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--border-radius-full);
  transition: width var(--transition-normal);
}

.progress-fill.fill-done {
  background: var(--color-success);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.mission-rewards {
  display: flex;
  gap: var(--space-xs);
}

.mission-action { flex-shrink: 0; padding-top: var(--space-xs); }
</style>
