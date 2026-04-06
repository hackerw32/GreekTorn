import { defineStore } from 'pinia'
import { crimes, getCrimeById } from '../data/crimes'
import { calculateCrimeSuccess, calculateCrimeReward, calculateJailTime, rollItemDrop, rollD10 } from '../engine/formulas'
import { usePlayerStore } from './playerStore'
import { useGameStore } from './gameStore'
import { useInventoryStore } from './inventoryStore'
import { getItemById } from '../data/items'
import { useTravelStore } from './travelStore'

export const useCrimeStore = defineStore('crime', {
  state: () => ({
    crimeAttempts: {},  // { crimeId: { total, successes } }
  }),

  getters: {
    availableCrimes() {
      const player = usePlayerStore()
      return crimes.filter(c => player.crimeXP >= c.requiredCrimeXP)
    },

    lockedCrimes() {
      const player = usePlayerStore()
      return crimes.filter(c => player.crimeXP < c.requiredCrimeXP)
    },

    getCrimeSuccessRate() {
      return (crimeId) => {
        const crime = getCrimeById(crimeId)
        if (!crime) return 0
        const player = usePlayerStore()
        return calculateCrimeSuccess(crime, player.stats, player.crimeXP, player.filotimo)
      }
    },
  },

  actions: {
    /**
     * Start a crime — deducts nerve, pre-rolls result, starts activity timer.
     * Returns { started: true } or { started: false, message }
     */
    startCrime(crimeId) {
      const crime = getCrimeById(crimeId)
      if (!crime) return { started: false, message: 'Άγνωστο έγκλημα' }

      const player = usePlayerStore()

      if (!player.canAct) {
        return { started: false, message: 'Δεν μπορείς να κάνεις κάτι τώρα!' }
      }

      if (player.resources.nerve.current < crime.nerveCost) {
        return { started: false, message: 'Δεν έχεις αρκετό Θράσος!' }
      }

      // Spend nerve
      player.modifyResource('nerve', -crime.nerveCost)

      // Track attempts
      if (!this.crimeAttempts[crimeId]) {
        this.crimeAttempts[crimeId] = { total: 0, successes: 0 }
      }
      this.crimeAttempts[crimeId].total++

      // Pre-roll result at start (prevents save-scumming)
      const successRate = calculateCrimeSuccess(crime, player.stats, player.crimeXP, player.filotimo)
      const { roll, targetRoll, success: succeeded } = rollD10(successRate)

      const preRolled = { success: succeeded, roll, targetRoll, successRate }

      if (succeeded) {
        const reward = calculateCrimeReward(crime)
        const travelStore = useTravelStore()
        const locationCash = Math.floor(reward.cash * travelStore.crimeRewardMultiplier)
        const droppedItemId = rollItemDrop(crime.possibleItemDrops)
        preRolled.rewards = {
          cash: locationCash,
          crimeXP: reward.crimeXP,
          xp: reward.xp,
          filotimoChange: crime.filotimoChange,
          droppedItemId,
        }
      } else {
        const goToJail = Math.random() < crime.failure.jailChance
        preRolled.jailed = goToJail
        if (goToJail) {
          preRolled.jailTime = calculateJailTime(crime)
        }
      }

      // Start activity timer
      player.startActivity({
        type: 'crime',
        id: crimeId,
        label: crime.name,
        icon: crime.icon,
        duration: crime.duration,
        preRolled,
      })

      const gameStore = useGameStore()
      gameStore.saveGame()

      return { started: true }
    },

    /**
     * Called when crime activity resolves (timer expired, dice shown).
     * Applies rewards/penalties from the pre-rolled result.
     */
    applyCrimeResult(result) {
      const player = usePlayerStore()
      const gameStore = useGameStore()
      const crime = getCrimeById(result.id)

      if (result.success) {
        const r = result.rewards
        this.crimeAttempts[result.id].successes++
        player.addCash(r.cash)
        player.addCrimeXP(r.crimeXP)
        player.addXP(r.xp)
        player.addFilotimo(r.filotimoChange)

        if (r.droppedItemId) {
          const inventoryStore = useInventoryStore()
          inventoryStore.addItem(r.droppedItemId, 1)
        }

        const label = crime ? crime.name : 'Έγκλημα'
        player.logActivity(`${result.icon} ${label}: +€${r.cash}`, 'crime')
        gameStore.addNotification(`${label}: +€${r.cash}`, 'success')
      } else {
        const label = crime ? crime.name : 'Έγκλημα'
        if (result.jailed) {
          player.setStatus('jail', result.jailTime)
          player.logActivity(`${result.icon} ${label}: Αποτυχία — Φυλακή!`, 'jail')
          gameStore.addNotification(`Σε έπιασαν! Φυλακή για ${formatTime(result.jailTime)}`, 'jail')
        } else {
          player.logActivity(`${result.icon} ${label}: Αποτυχία`, 'danger')
          gameStore.addNotification(`${label}: Αποτυχία!`, 'danger')
        }
      }

      gameStore.saveGame()
    },

    getSerializable() {
      return {
        crimeAttempts: { ...this.crimeAttempts },
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.crimeAttempts) this.crimeAttempts = { ...data.crimeAttempts }
    },
  }
})

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
