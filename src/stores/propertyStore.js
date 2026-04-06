import { defineStore } from 'pinia'
import { getPropertyById } from '../data/properties'
import { usePlayerStore } from './playerStore'
import { useGameStore } from './gameStore'

export const usePropertyStore = defineStore('property', {
  state: () => ({
    ownedPropertyId: null,
    vaultCash: 0,
  }),

  getters: {
    ownedProperty() {
      if (!this.ownedPropertyId) return null
      return getPropertyById(this.ownedPropertyId)
    },

    happinessBonus() {
      return this.ownedProperty?.happinessBonus || 0
    },

    vaultCapacity() {
      return this.ownedProperty?.vaultCapacity || 0
    },
  },

  actions: {
    buyProperty(propertyId) {
      const property = getPropertyById(propertyId)
      if (!property) return false

      const player = usePlayerStore()
      const gameStore = useGameStore()

      if (player.level < property.requirements.level) {
        gameStore.addNotification(`Χρειάζεσαι Επίπεδο ${property.requirements.level}!`, 'danger')
        return false
      }

      const totalCost = property.buyPrice
      if (player.cash < totalCost) {
        gameStore.addNotification('Δεν έχεις αρκετά χρήματα!', 'danger')
        return false
      }

      // Sell old property first
      if (this.ownedPropertyId) {
        this.sellProperty(true) // silent sell
      }

      player.removeCash(totalCost)
      this.ownedPropertyId = propertyId

      gameStore.addNotification(`Αγόρασες: ${property.name}!`, 'success')
      player.logActivity(`🏠 Αγορά ${property.name}`, 'cash')
      gameStore.saveGame()
      return true
    },

    sellProperty(silent = false) {
      const property = this.ownedProperty
      if (!property) return false

      const player = usePlayerStore()
      const gameStore = useGameStore()

      // Return vault cash
      if (this.vaultCash > 0) {
        player.addCash(this.vaultCash)
        this.vaultCash = 0
      }

      player.addCash(property.sellPrice)
      const name = property.name
      this.ownedPropertyId = null

      if (!silent) {
        gameStore.addNotification(`Πούλησες ${name} για €${property.sellPrice}`, 'cash')
        player.logActivity(`🏠 Πώληση ${name}: +€${property.sellPrice}`, 'cash')
        gameStore.saveGame()
      }
      return true
    },

    depositToVault(amount) {
      const player = usePlayerStore()
      const gameStore = useGameStore()

      if (!this.ownedProperty) return false
      amount = Math.min(amount, player.cash, this.vaultCapacity - this.vaultCash)
      if (amount <= 0) return false

      player.removeCash(amount)
      this.vaultCash += amount
      gameStore.addNotification(`Κατάθεση €${amount} στο χρηματοκιβώτιο`, 'info')
      gameStore.saveGame()
      return true
    },

    withdrawFromVault(amount) {
      const player = usePlayerStore()
      const gameStore = useGameStore()

      amount = Math.min(amount, this.vaultCash)
      if (amount <= 0) return false

      this.vaultCash -= amount
      player.addCash(amount)
      gameStore.addNotification(`Ανάληψη €${amount} από χρηματοκιβώτιο`, 'info')
      gameStore.saveGame()
      return true
    },

    getSerializable() {
      return {
        ownedPropertyId: this.ownedPropertyId,
        vaultCash: this.vaultCash,
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.ownedPropertyId !== undefined) this.ownedPropertyId = data.ownedPropertyId
      if (data.vaultCash !== undefined) this.vaultCash = data.vaultCash
    },
  }
})
