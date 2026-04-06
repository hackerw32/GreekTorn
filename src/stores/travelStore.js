import { defineStore } from 'pinia'
import { locations, getLocationById, getTravelTime } from '../data/locations'
import { usePlayerStore } from './playerStore'
import { useGameStore } from './gameStore'

export const useTravelStore = defineStore('travel', {
  state: () => ({
    currentLocation: 'athens',
  }),

  getters: {
    currentLocationData() {
      return getLocationById(this.currentLocation) || locations[0]
    },

    availableDestinations() {
      return locations.filter(l => l.id !== this.currentLocation)
    },

    isTraveling() {
      const player = usePlayerStore()
      return player.activeActivity?.type === 'travel'
    },

    crimeRewardMultiplier() {
      return this.currentLocationData.bonuses.crimeReward
    },

    shopDiscountMultiplier() {
      return this.currentLocationData.bonuses.shopDiscount
    },

    gymBoostMultiplier() {
      return this.currentLocationData.bonuses.gymBoost
    },
  },

  actions: {
    startTravel(destinationId) {
      const player = usePlayerStore()
      const gameStore = useGameStore()

      if (!player.canAct) {
        return { started: false, message: 'Δεν μπορείς να ταξιδέψεις τώρα!' }
      }

      const destination = getLocationById(destinationId)
      if (!destination) {
        return { started: false, message: 'Άγνωστος προορισμός' }
      }

      if (destinationId === this.currentLocation) {
        return { started: false, message: 'Είσαι ήδη εδώ!' }
      }

      const travelTime = getTravelTime(this.currentLocation, destinationId)

      player.startActivity({
        type: 'travel',
        id: destinationId,
        label: `Ταξίδι → ${destination.name}`,
        icon: destination.icon,
        duration: travelTime,
        preRolled: {
          success: true,
          roll: 1,
          targetRoll: 100,
          destinationId,
        },
      })

      gameStore.saveGame()
      return { started: true }
    },

    /**
     * Called when travel activity resolves.
     */
    arriveAtDestination(destinationId) {
      const player = usePlayerStore()
      const gameStore = useGameStore()
      const destination = getLocationById(destinationId)

      this.currentLocation = destinationId
      const name = destination ? destination.name : destinationId

      player.logActivity(`✈️ Έφτασες: ${name}`, 'info')
      gameStore.addNotification(`Καλώς ήρθες στ${getArticle(name)} ${name}!`, 'success')
      gameStore.saveGame()
    },

    getSerializable() {
      return {
        currentLocation: this.currentLocation,
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.currentLocation) this.currentLocation = data.currentLocation
    },
  },
})

function getArticle(name) {
  // Simple Greek article helper for common city names
  const feminineStarts = ['Α', 'Θ', 'Π', 'Κ', 'Σ', 'Μ']
  if (feminineStarts.includes(name.charAt(0))) return 'ην'
  return 'ο'
}
