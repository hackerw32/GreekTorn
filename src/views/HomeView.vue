<template>
  <div class="home-page">
    <div class="welcome-section card">
      <h2>Καλώς ήρθες, {{ player.name }}</h2>
      <div class="player-summary">
        <span class="badge badge-info">{{ player.rankTitle }}</span>
        <span class="text-muted">Επίπεδο {{ player.level }}</span>
        <span class="text-muted">·</span>
        <span class="text-muted">Σύνολο Stats: {{ player.totalStats.toFixed(1) }}</span>
      </div>
      <div class="xp-bar mt-sm">
        <div class="xp-label text-muted">
          XP: {{ player.xp }}/{{ player.xpToNextLevel }}
        </div>
        <div class="bar-track" style="background: var(--bg-surface-raised)">
          <div class="bar-fill" :style="{ width: (player.xpProgress * 100) + '%', background: 'var(--color-accent)' }" />
        </div>
      </div>
    </div>

    <!-- Incapacitated warning -->
    <div v-if="player.isIncapacitated" class="card status-warning">
      <div class="status-warning-content">
        <span class="status-icon">{{ player.status === 'hospital' ? '🏥' : '🔒' }}</span>
        <div>
          <strong>{{ player.status === 'hospital' ? 'Νοσοκομείο' : 'Φυλακή' }}</strong>
          <p class="text-muted">{{ formatTime(player.statusTimeRemaining) }} απομένουν</p>
        </div>
        <router-link :to="player.status === 'hospital' ? '/hospital' : '/jail'" class="btn btn-sm btn-outline">
          Δες
        </router-link>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions" v-if="!player.isIncapacitated">
      <router-link to="/crimes" class="action-card card">
        <span class="action-icon">🎭</span>
        <span class="action-label">Έγκλημα</span>
        <span class="action-cost badge badge-purple">{{ player.resources.nerve.current }} Θ</span>
      </router-link>
      <router-link to="/gym" class="action-card card">
        <span class="action-icon">💪</span>
        <span class="action-label">Γυμναστική</span>
        <span class="action-cost badge badge-success">{{ player.resources.energy.current }} Ε</span>
      </router-link>
      <router-link to="/combat" class="action-card card">
        <span class="action-icon">⚔️</span>
        <span class="action-label">Μάχη</span>
        <span class="action-cost badge badge-danger">25 Ε</span>
      </router-link>
      <router-link to="/job" class="action-card card">
        <span class="action-icon">💼</span>
        <span class="action-label">Δουλειά</span>
        <span class="action-cost badge badge-info">1/ημέρα</span>
      </router-link>
    </div>

    <!-- Greek Mechanics Summary -->
    <div class="card greek-stats">
      <h3 class="card-title">Ελληνικά Χαρακτηριστικά</h3>
      <div class="greek-stat-list">
        <div class="greek-stat">
          <span class="greek-icon">⚖️</span>
          <span class="greek-label">Φιλότιμο</span>
          <span class="greek-value text-mono">{{ player.filotimo }}</span>
        </div>
        <div class="greek-stat">
          <span class="greek-icon">🤝</span>
          <span class="greek-label">Μέσον</span>
          <span class="greek-value text-mono">{{ player.meson }}</span>
        </div>
        <div class="greek-stat">
          <span class="greek-icon">€</span>
          <span class="greek-label">Μετρητά</span>
          <span class="greek-value text-mono text-success">{{ formatCash(player.cash) }}</span>
        </div>
      </div>
    </div>

    <!-- Activity Log -->
    <div class="card">
      <h3 class="card-title">Πρόσφατη Δραστηριότητα</h3>
      <div v-if="player.activityLog.length === 0" class="text-muted text-center">
        Δεν υπάρχει δραστηριότητα ακόμα...
      </div>
      <div v-else class="activity-list">
        <div v-for="(entry, i) in player.activityLog.slice(0, 10)" :key="i" class="activity-item">
          <span class="activity-time text-muted">{{ formatTimeAgo(entry.timestamp) }}</span>
          <span class="activity-msg">{{ entry.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '../stores/playerStore'

const player = usePlayerStore()

function formatCash(amount) {
  return new Intl.NumberFormat('el-GR').format(Math.floor(amount))
}

function formatTime(ms) {
  if (ms <= 0) return '0:00'
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'μόλις τώρα'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}λ πριν`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}ω πριν`
  return `${Math.floor(hours / 24)}μ πριν`
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.welcome-section h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-xs);
}

.player-summary {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  flex-wrap: wrap;
}

.xp-label {
  font-size: var(--font-size-xs);
  margin-bottom: 2px;
}

.bar-track {
  height: 6px;
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width 0.5s ease;
}

.status-warning-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.status-icon {
  font-size: 28px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.action-card:hover {
  background: var(--bg-surface-raised);
  transform: translateY(-1px);
}

.action-icon {
  font-size: 28px;
}

.action-label {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.greek-stats h3 {
  margin-bottom: var(--space-sm);
}

.greek-stat-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.greek-stat {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
}

.greek-icon {
  width: 24px;
  text-align: center;
}

.greek-label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.greek-value {
  font-weight: var(--font-weight-bold);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.activity-item {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
  border-bottom: 1px solid var(--border-color);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  font-size: var(--font-size-xs);
  white-space: nowrap;
  min-width: 60px;
}
</style>
