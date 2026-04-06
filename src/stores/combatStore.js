import { defineStore } from 'pinia'
import { getNpcById } from '../data/npcs'
import { getItemById } from '../data/items'
import { resolveCombat, calculateHospitalTime, rollItemDrop } from '../engine/formulas'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { useGameStore } from './gameStore'
import { COMBAT_ENERGY_BASE } from '../data/constants'

export const useCombatStore = defineStore('combat', {
  state: () => ({
    lastFight: null,
    combatHistory: [],
  }),

  getters: {
    combatStats() {
      const wins = this.combatHistory.filter(h => h.won).length
      const total = this.combatHistory.length
      return {
        wins,
        losses: total - wins,
        total,
        winRate: total > 0 ? (wins / total * 100).toFixed(1) : '0',
      }
    },
  },

  actions: {
    startCombat(npcId) {
      const npc = getNpcById(npcId)
      if (!npc) return { error: 'NPC δεν βρέθηκε' }

      const player = usePlayerStore()
      const inventory = useInventoryStore()
      const gameStore = useGameStore()

      if (player.isIncapacitated) {
        return { error: 'Δεν μπορείς να πολεμήσεις τώρα!' }
      }

      if (player.resources.energy.current < npc.energyCost) {
        return { error: 'Δεν έχεις αρκετή Ενέργεια!' }
      }

      // Spend energy
      player.modifyResource('energy', -npc.energyCost)

      // Get equipped weapon/armor data
      const playerWeapon = inventory.equippedWeapon
      const playerArmor = inventory.equippedArmor
      const npcWeapon = npc.equippedWeapon ? getItemById(npc.equippedWeapon) : null

      // Resolve combat
      const result = resolveCombat(
        player.stats,
        player.resources.hp.current,
        npc,
        playerWeapon,
        npcWeapon
      )

      // Apply results
      if (result.winner === 'player') {
        // Win
        const cashReward = npc.rewards.cashMin +
          Math.floor(Math.random() * (npc.rewards.cashMax - npc.rewards.cashMin + 1))

        player.addCash(cashReward)
        player.addXP(npc.rewards.xp)
        player.resources.hp.current = result.playerHPRemaining
        player.addMeson(1) // Combat gives connections

        // Item drop
        const droppedItemId = rollItemDrop(npc.possibleItemDrops)
        let droppedItemName = null
        if (droppedItemId) {
          inventory.addItem(droppedItemId, 1)
          const itemData = getItemById(droppedItemId)
          droppedItemName = itemData ? itemData.name : droppedItemId
        }

        this.lastFight = {
          won: true,
          npcName: npc.name,
          npcIcon: npc.icon,
          cashReward,
          xpReward: npc.rewards.xp,
          itemDrop: droppedItemName,
          turns: result.turns,
          log: result.log,
          playerHPRemaining: result.playerHPRemaining,
        }

        player.logActivity(`⚔️ Νίκη vs ${npc.name}: +€${cashReward}`, 'combat')
        gameStore.addNotification(`Νίκη! +€${cashReward} +${npc.rewards.xp}XP`, 'success')
      } else {
        // Lose - go to hospital
        const hospitalTime = calculateHospitalTime(
          result.playerHPRemaining,
          player.resources.hp.max,
          npc.level
        )
        player.resources.hp.current = 0
        player.setStatus('hospital', hospitalTime)

        this.lastFight = {
          won: false,
          npcName: npc.name,
          npcIcon: npc.icon,
          hospitalTime,
          turns: result.turns,
          log: result.log,
          playerHPRemaining: 0,
        }

        player.logActivity(`⚔️ Ήττα vs ${npc.name} — Νοσοκομείο`, 'danger')
        gameStore.addNotification(`Ήττα! Νοσοκομείο για ${formatTime(hospitalTime)}`, 'hospital')
      }

      this.combatHistory.push({
        npcId,
        won: result.winner === 'player',
        timestamp: Date.now(),
      })

      // Keep history manageable
      if (this.combatHistory.length > 100) {
        this.combatHistory = this.combatHistory.slice(-100)
      }

      gameStore.saveGame()
      return this.lastFight
    },

    clearFight() {
      this.lastFight = null
    },

    getSerializable() {
      return {
        combatHistory: this.combatHistory.slice(-100),
      }
    },

    hydrate(data) {
      if (!data) return
      if (data.combatHistory) this.combatHistory = data.combatHistory
    },
  }
})

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
