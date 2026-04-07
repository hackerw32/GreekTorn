<template>
  <Teleport to="body">
    <div v-if="open" class="equip-overlay" @click="$emit('close')">
      <div class="equip-modal" @click.stop>

        <!-- Header -->
        <div class="equip-header">
          <h3>⚔️ Εξοπλισμός Μάχης</h3>
          <button class="btn btn-sm btn-outline" @click="$emit('close')">✕</button>
        </div>

        <!-- Currently Equipped -->
        <div class="equip-section">
          <h4 class="section-title">Εξοπλισμένα</h4>
          <div class="equip-slots">
            <div class="equip-slot">
              <span class="slot-label text-muted">Όπλο</span>
              <div v-if="inventory.equippedWeapon" class="slot-item">
                <div class="slot-item-info">
                  <span>{{ inventory.equippedWeapon.icon }} {{ inventory.equippedWeapon.name }}</span>
                  <div class="slot-stats">
                    <span class="badge badge-danger">DMG {{ inventory.equippedWeapon.damage }}</span>
                    <span class="badge badge-info">ACC {{ Math.round(inventory.equippedWeapon.accuracy * 100) }}%</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline" @click="inventory.unequipItem('weapon')">✕</button>
              </div>
              <div v-else class="slot-empty text-disabled">Κενό</div>
            </div>
            <div class="equip-slot">
              <span class="slot-label text-muted">Πανοπλία</span>
              <div v-if="inventory.equippedArmor" class="slot-item">
                <div class="slot-item-info">
                  <span>{{ inventory.equippedArmor.icon }} {{ inventory.equippedArmor.name }}</span>
                  <div class="slot-stats">
                    <span class="badge badge-info">DEF {{ inventory.equippedArmor.defense }}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline" @click="inventory.unequipItem('armor')">✕</button>
              </div>
              <div v-else class="slot-empty text-disabled">Κενό</div>
            </div>
          </div>
        </div>

        <!-- Available Weapons -->
        <div v-if="ownedWeapons.length" class="equip-section">
          <h4 class="section-title">Διαθέσιμα Όπλα</h4>
          <div class="item-scroll-list">
            <div
              v-for="entry in ownedWeapons"
              :key="entry.itemId"
              class="equip-item-row"
              :class="{ 'is-equipped': inventory.equipped.weapon === entry.itemId }"
            >
              <span class="item-icon">{{ entry.data.icon }}</span>
              <div class="item-detail">
                <strong :class="'rarity-' + entry.data.rarity">{{ entry.data.name }}</strong>
                <div class="item-badges">
                  <span class="badge badge-danger">DMG {{ entry.data.damage }}</span>
                  <span class="badge badge-info">ACC {{ Math.round(entry.data.accuracy * 100) }}%</span>
                </div>
              </div>
              <button
                v-if="inventory.equipped.weapon !== entry.itemId"
                class="btn btn-sm btn-primary"
                @click="inventory.equipItem(entry.itemId)"
              >
                Εξόπλισε
              </button>
              <span v-else class="badge badge-success">Ενεργό</span>
            </div>
          </div>
        </div>

        <!-- Available Armor -->
        <div v-if="ownedArmor.length" class="equip-section">
          <h4 class="section-title">Διαθέσιμη Πανοπλία</h4>
          <div class="item-scroll-list">
            <div
              v-for="entry in ownedArmor"
              :key="entry.itemId"
              class="equip-item-row"
              :class="{ 'is-equipped': inventory.equipped.armor === entry.itemId }"
            >
              <span class="item-icon">{{ entry.data.icon }}</span>
              <div class="item-detail">
                <strong :class="'rarity-' + entry.data.rarity">{{ entry.data.name }}</strong>
                <div class="item-badges">
                  <span class="badge badge-info">DEF {{ entry.data.defense }}</span>
                </div>
              </div>
              <button
                v-if="inventory.equipped.armor !== entry.itemId"
                class="btn btn-sm btn-primary"
                @click="inventory.equipItem(entry.itemId)"
              >
                Εξόπλισε
              </button>
              <span v-else class="badge badge-success">Ενεργό</span>
            </div>
          </div>
        </div>

        <!-- Consumables -->
        <div v-if="ownedConsumables.length" class="equip-section">
          <h4 class="section-title">Αναλώσιμα</h4>
          <div class="item-scroll-list">
            <div
              v-for="entry in ownedConsumables"
              :key="entry.itemId"
              class="equip-item-row"
            >
              <span class="item-icon">{{ entry.data.icon }}</span>
              <div class="item-detail">
                <strong :class="'rarity-' + entry.data.rarity">{{ entry.data.name }}</strong>
                <span class="text-muted qty">x{{ entry.quantity }}</span>
                <div class="item-badges">
                  <span v-if="entry.data.healAmount" class="badge badge-success">HP +{{ entry.data.healAmount }}</span>
                  <span v-if="entry.data.energyBoost" class="badge badge-warning">EN +{{ entry.data.energyBoost }}</span>
                  <span v-if="entry.data.happinessBoost" class="badge badge-warning">Κέφι +{{ entry.data.happinessBoost }}</span>
                  <span v-if="entry.data.strengthBoost" class="badge badge-danger">STR +{{ entry.data.strengthBoost }}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-success" @click="inventory.useItem(entry.itemId)">
                Χρήση
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="!ownedWeapons.length && !ownedArmor.length && !ownedConsumables.length"
          class="empty-state text-muted text-center"
        >
          Δεν έχεις αντικείμενα μάχης. Επισκέψου το Κατάστημα!
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'

defineProps({
  open: { type: Boolean, default: false }
})

defineEmits(['close'])

const inventory = useInventoryStore()

const ownedWeapons = computed(() =>
  inventory.sortedItems.filter(i => i.data.type === 'weapon')
)

const ownedArmor = computed(() =>
  inventory.sortedItems.filter(i => i.data.type === 'armor')
)

const ownedConsumables = computed(() =>
  inventory.sortedItems.filter(i => i.data.type === 'medical' || i.data.type === 'drug')
)
</script>

<style scoped>
.equip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.equip-modal {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--bg-surface-overlay);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  box-shadow: var(--shadow-lg);
}

.equip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.equip-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.equip-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-title {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.equip-slots {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.equip-slot {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.slot-label {
  min-width: 65px;
  font-size: var(--font-size-xs);
}

.slot-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-surface-raised);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  gap: var(--space-sm);
}

.slot-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.slot-stats {
  display: flex;
  gap: var(--space-xs);
}

.slot-empty {
  font-size: var(--font-size-sm);
  font-style: italic;
}

.item-scroll-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-height: 180px;
  overflow-y: auto;
}

.equip-item-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.equip-item-row:hover {
  background: var(--bg-surface-raised);
}

.equip-item-row.is-equipped {
  border-color: var(--color-accent);
  background: rgba(79, 195, 247, 0.05);
}

.item-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.item-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-detail strong {
  font-size: var(--font-size-sm);
}

.item-badges {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.qty {
  font-size: var(--font-size-xs);
}

.empty-state {
  padding: var(--space-lg) var(--space-md);
  font-size: var(--font-size-sm);
}

/* Rarity colors */
.rarity-common { color: var(--text-primary); }
.rarity-uncommon { color: #4CAF50; }
.rarity-rare { color: #42A5F5; }
.rarity-epic { color: #AB47BC; }
.rarity-legendary { color: #FFB300; }
</style>
