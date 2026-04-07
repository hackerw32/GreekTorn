<template>
  <div class="inventory-page">
    <div class="inv-title-row">
      <h2 class="page-title">🎒 Αντικείμενα</h2>
      <router-link to="/shop" class="btn btn-sm btn-outline">🛒 Κατάστημα</router-link>
    </div>

    <!-- Equipped -->
    <div class="card equipped-section">
      <h3 class="card-title">Εξοπλισμός</h3>
      <div class="equip-slots">
        <div class="equip-slot">
          <span class="slot-label text-muted">Όπλο</span>
          <div v-if="inventory.equippedWeapon" class="slot-item">
            <span>{{ inventory.equippedWeapon.icon }} {{ inventory.equippedWeapon.name }}</span>
            <button class="btn btn-sm btn-outline" @click="inventory.unequipItem('weapon')">✕</button>
          </div>
          <div v-else class="slot-empty text-disabled">Κενό</div>
        </div>
        <div class="equip-slot">
          <span class="slot-label text-muted">Πανοπλία</span>
          <div v-if="inventory.equippedArmor" class="slot-item">
            <span>{{ inventory.equippedArmor.icon }} {{ inventory.equippedArmor.name }}</span>
            <button class="btn btn-sm btn-outline" @click="inventory.unequipItem('armor')">✕</button>
          </div>
          <div v-else class="slot-empty text-disabled">Κενό</div>
        </div>
      </div>
    </div>

    <!-- Tab filters -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Inventory items -->
    <div v-else class="item-list">
      <div v-if="filteredItems.length === 0" class="text-muted text-center mt-lg">
        Δεν έχεις αντικείμενα σε αυτή την κατηγορία.
      </div>
      <div v-for="entry in filteredItems" :key="entry.itemId" class="card item-card">
        <div class="item-header">
          <span class="item-icon">{{ entry.data.icon }}</span>
          <div class="item-info">
            <strong :class="'rarity-' + entry.data.rarity">{{ entry.data.name }}</strong>
            <span class="text-muted" style="font-size: var(--font-size-xs)">x{{ entry.quantity }}</span>
            <div class="item-stats">
              <span v-if="entry.data.damage" class="badge badge-danger">DMG {{ entry.data.damage }}</span>
              <span v-if="entry.data.defense" class="badge badge-info">DEF {{ entry.data.defense }}</span>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button
            v-if="entry.data.type === 'weapon' || entry.data.type === 'armor'"
            class="btn btn-sm btn-primary"
            @click="inventory.equipItem(entry.itemId)"
          >
            Εξοπλισμός
          </button>
          <button
            v-if="entry.data.type === 'medical' || entry.data.type === 'drug'"
            class="btn btn-sm btn-success"
            @click="inventory.useItem(entry.itemId)"
          >
            Χρήση
          </button>
          <button
            v-if="entry.data.sellPrice > 0"
            class="btn btn-sm btn-outline"
            @click="inventory.sellItem(entry.itemId)"
          >
            Πώληση €{{ entry.data.sellPrice }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useInventoryStore } from '../stores/inventoryStore'

const player = usePlayerStore()
const inventory = useInventoryStore()
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'Όλα' },
  { key: 'weapon', label: 'Όπλα' },
  { key: 'armor', label: 'Πανοπλία' },
  { key: 'medical', label: 'Ιατρικά' },
  { key: 'drug', label: 'Ουσίες' },
  { key: 'misc', label: 'Διάφορα' },
]

const filteredItems = computed(() => {
  if (activeTab.value === 'all') return inventory.sortedItems
  return inventory.sortedItems.filter(i => i.data.type === activeTab.value)
})
</script>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.inv-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title { font-size: var(--font-size-2xl); margin: 0; }

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
  min-width: 60px;
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
}

.slot-empty {
  font-size: var(--font-size-sm);
  font-style: italic;
}

.tab-bar {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--space-xs);
}

.tab-btn {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.tab-btn:hover:not(.active) {
  background: var(--bg-surface-raised);
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.item-icon { font-size: 24px; flex-shrink: 0; }

.item-info {
  min-width: 0;
}

.item-info strong { font-size: var(--font-size-sm); }

.item-desc {
  font-size: var(--font-size-xs);
  line-height: 1.3;
}

.item-stats {
  display: flex;
  gap: var(--space-xs);
  margin-top: 2px;
  flex-wrap: wrap;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

/* Rarity colors */
.rarity-common { color: var(--text-primary); }
.rarity-uncommon { color: #4CAF50; }
.rarity-rare { color: #42A5F5; }
.rarity-epic { color: #AB47BC; }
.rarity-legendary { color: #FFB300; }
</style>
