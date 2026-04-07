import { defineStore } from 'pinia'
import { missionTemplates, getRandomMissions } from '../data/missions'
import { usePlayerStore } from './playerStore'
import { useGameStore } from './gameStore'

export const useMissionStore = defineStore('mission', {
  state: () => ({
    activeMissions: [],    // [{ ...template, progress: 0, completed: false, claimed: false }]
    lastRefreshDate: null, // 'YYYY-MM-DD'
    totalCompleted: 0,
  }),

  getters: {
    todayStr() {
      return new Date().toISOString().split('T')[0]
    },
    needsRefresh() {
      return this.lastRefreshDate !== this.todayStr
    },
    completedUnclaimed() {
      return this.activeMissions.filter(m => m.completed && !m.claimed).length
    },
  },

  actions: {
    refreshMissions() {
      if (!this.needsRefresh && this.activeMissions.length > 0) return

      const templates = getRandomMissions(3)
      this.activeMissions = templates.map(t => ({
        ...t,
        progress: 0,
        completed: false,
        claimed: false,
      }))
      this.lastRefreshDate = this.todayStr
    },

    // Called when player wins a combat
    onCombatWin(opponentId, difficulty, isPvp) {
      for (const mission of this.activeMissions) {
        if (mission.completed) continue

        if (mission.type === 'combat' && mission.difficulty === difficulty) {
          mission.progress++
        } else if (mission.type === 'combat_any') {
          mission.progress++
        } else if (mission.type === 'pvp' && isPvp) {
          mission.progress++
        }

        if (mission.progress >= mission.target) {
          mission.completed = true
        }
      }
    },

    // Called when player completes a crime
    onCrimeComplete(success) {
      for (const mission of this.activeMissions) {
        if (mission.completed) continue

        if (mission.type === 'crime') {
          mission.progress++
        } else if (mission.type === 'crime_success' && success) {
          mission.progress++
        } else if (mission.type === 'crime_success' && !success) {
          // Reset streak on failure
          mission.progress = 0
        }

        if (mission.progress >= mission.target) {
          mission.completed = true
        }
      }
    },

    // Called when player trains at gym
    onGymTrain() {
      for (const mission of this.activeMissions) {
        if (mission.completed) continue
        if (mission.type === 'gym') {
          mission.progress++
          if (mission.progress >= mission.target) {
            mission.completed = true
          }
        }
      }
    },

    // Called when player earns cash
    onEarnCash(amount) {
      for (const mission of this.activeMissions) {
        if (mission.completed) continue
        if (mission.type === 'earn') {
          mission.progress += amount
          if (mission.progress >= mission.target) {
            mission.completed = true
          }
        }
      }
    },

    claimMission(index) {
      const mission = this.activeMissions[index]
      if (!mission || !mission.completed || mission.claimed) return false

      const player = usePlayerStore()
      const gameStore = useGameStore()

      player.addCash(mission.rewardCash)
      player.addXP(mission.rewardXP)
      mission.claimed = true
      this.totalCompleted++

      gameStore.addNotification(
        `Αποστολή "${mission.title}": +€${mission.rewardCash} +${mission.rewardXP}XP`,
        'success'
      )
      player.logActivity(`📋 ${mission.title}: +€${mission.rewardCash}`, 'cash')
      gameStore.saveGame()
      return true
    },

    getSerializable() {
      return {
        activeMissions: this.activeMissions.map(m => ({ ...m })),
        lastRefreshDate: this.lastRefreshDate,
        totalCompleted: this.totalCompleted,
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.activeMissions) this.activeMissions = data.activeMissions.map(m => ({ ...m }))
      if (data.lastRefreshDate !== undefined) this.lastRefreshDate = data.lastRefreshDate
      if (data.totalCompleted !== undefined) this.totalCompleted = data.totalCompleted
    },
  },
})
