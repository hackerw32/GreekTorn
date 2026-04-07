import { defineStore } from 'pinia'
import { dailyRewards } from '../data/dailyRewards'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { useGameStore } from './gameStore'

export const useDailyRewardStore = defineStore('dailyReward', {
  state: () => ({
    lastClaimDate: null,   // 'YYYY-MM-DD' string
    currentStreak: 0,
    maxStreak: 0,
    totalLogins: 0,
    pendingReward: false,  // true when reward is available but not yet claimed
  }),

  getters: {
    todayStr() {
      return new Date().toISOString().split('T')[0]
    },

    canClaim() {
      return this.lastClaimDate !== this.todayStr
    },

    currentDay() {
      // Which day of the 7-day cycle (0-indexed into dailyRewards)
      return this.currentStreak % 7
    },

    nextReward() {
      return dailyRewards[this.currentDay]
    },

    streakDay() {
      return this.currentStreak % 7 + 1
    },
  },

  actions: {
    checkDaily() {
      if (this.canClaim) {
        this.pendingReward = true
      }
    },

    claimReward() {
      if (!this.canClaim) return false

      const player = usePlayerStore()
      const inventory = useInventoryStore()
      const gameStore = useGameStore()

      // Check if streak continues (claimed yesterday)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (this.lastClaimDate === yesterdayStr) {
        this.currentStreak++
      } else if (this.lastClaimDate !== null) {
        // Streak broken
        this.currentStreak = 0
      }

      const reward = dailyRewards[this.currentStreak % 7]

      // Give rewards
      if (reward.cash) player.addCash(reward.cash)
      if (reward.xp) player.addXP(reward.xp)
      if (reward.itemId) inventory.addItem(reward.itemId, 1)

      this.lastClaimDate = this.todayStr
      this.totalLogins++
      this.maxStreak = Math.max(this.maxStreak, this.currentStreak + 1)
      this.pendingReward = false

      gameStore.addNotification(`Ημερήσιο Bonus! ${reward.label}`, 'success')
      player.logActivity(`📅 Ημερήσιο Bonus: ${reward.label}`, 'cash')
      gameStore.saveGame()

      return reward
    },

    getSerializable() {
      return {
        lastClaimDate: this.lastClaimDate,
        currentStreak: this.currentStreak,
        maxStreak: this.maxStreak,
        totalLogins: this.totalLogins,
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.lastClaimDate !== undefined) this.lastClaimDate = data.lastClaimDate
      if (data.currentStreak !== undefined) this.currentStreak = data.currentStreak
      if (data.maxStreak !== undefined) this.maxStreak = data.maxStreak
      if (data.totalLogins !== undefined) this.totalLogins = data.totalLogins
    },
  },
})
