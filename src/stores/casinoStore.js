import { defineStore } from 'pinia'
import { getCasinoGameById } from '../data/casino'
import { rollD6 } from '../engine/formulas'
import { usePlayerStore } from './playerStore'
import { useGameStore } from './gameStore'

export const useCasinoStore = defineStore('casino', {
  state: () => ({
    stats: {
      totalBets: 0,
      totalWon: 0,
      totalLost: 0,
      gamesPlayed: 0,
    },
  }),

  getters: {
    netProfit() {
      return this.stats.totalWon - this.stats.totalLost
    },
  },

  actions: {
    /**
     * Play a casino game. Instant resolution (no timer).
     * Returns { played, success, roll, winnings, message } or { played: false, message }
     */
    playGame(gameId, betAmount, playerChoice = null) {
      const game = getCasinoGameById(gameId)
      if (!game) return { played: false, message: 'Άγνωστο παιχνίδι' }

      const player = usePlayerStore()
      const gameStore = useGameStore()

      if (player.isIncapacitated) {
        return { played: false, message: 'Δεν μπορείς να παίξεις τώρα!' }
      }

      if (betAmount < game.minBet) {
        return { played: false, message: `Ελάχιστο στοίχημα: €${game.minBet}` }
      }
      if (betAmount > game.maxBet) {
        return { played: false, message: `Μέγιστο στοίχημα: €${game.maxBet}` }
      }
      if (player.cash < betAmount) {
        return { played: false, message: 'Δεν έχεις αρκετά χρήματα!' }
      }

      // Deduct bet
      player.removeCash(betAmount)
      this.stats.gamesPlayed++
      this.stats.totalBets += betAmount

      // Roll
      let roll, targetRoll, success

      if (game.requiresChoice && playerChoice !== null) {
        // Number guessing games — exact match
        const [min, max] = game.choiceRange
        const actualNumber = min + Math.floor(Math.random() * (max - min + 1))
        success = actualNumber === playerChoice
        // Map to d6 visual
        targetRoll = Math.max(1, Math.min(6, 7 - Math.round(game.winChance * 6)))
        if (success) {
          roll = targetRoll + Math.floor(Math.random() * (7 - targetRoll))
        } else {
          roll = targetRoll <= 1 ? 1 : 1 + Math.floor(Math.random() * (targetRoll - 1))
        }
      } else {
        // Probability-based games — use d6
        const result = rollD6(game.winChance)
        roll = result.roll
        targetRoll = result.targetRoll
        success = result.success
      }

      let winnings = 0
      if (success) {
        winnings = Math.floor(betAmount * game.payout)
        player.addCash(winnings)
        this.stats.totalWon += winnings
        player.logActivity(`${game.icon} ${game.name}: +€${winnings}`, 'crime')
        gameStore.addNotification(`${game.name}: Κέρδισες €${winnings}!`, 'success')
      } else {
        this.stats.totalLost += betAmount
        player.logActivity(`${game.icon} ${game.name}: -€${betAmount}`, 'danger')
      }

      gameStore.saveGame()

      return {
        played: true,
        success,
        roll,
        targetRoll,
        winnings,
        betAmount,
        label: game.name,
        icon: game.icon,
      }
    },

    getSerializable() {
      return {
        stats: { ...this.stats },
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.stats) Object.assign(this.stats, data.stats)
    },
  },
})
