<template>
  <div class="property-page">
    <h2 class="page-title">🏘️ Ακίνητα</h2>
    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'mine' }" @click="activeTab = 'mine'">Τα Ακίνητά μου</button>
      <button class="tab-btn" :class="{ active: activeTab === 'market' }" @click="activeTab = 'market'">Μεσιτικό Γραφείο</button>
    </div>

    <div v-if="activeTab === 'market'" class="property-list">
      <div v-for="prop in allProperties" :key="prop.id" class="card property-card">
        <div class="property-header">
          <span class="property-icon">{{ prop.icon }}</span>
          <div class="property-info">
            <strong>{{ getPropertyName(prop, travelStore.currentLocation) }}</strong>
            <p class="text-muted">{{ prop.description }}</p>
          </div>
        </div>
        <div class="property-stats">
          <span class="badge badge-warning">+{{ prop.happinessBonus }} Κέφι</span>
          <span class="badge badge-info">Επ. {{ prop.requirements.level }}+</span>
          <span class="badge badge-secondary">Αποθήκη {{ prop.itemCapacity }}</span>
          <span class="text-mono text-success">Αγορά: €{{ formatCash(prop.buyPrice) }}</span>
          <span class="text-mono text-info">Ενοίκιο: €{{ formatCash(prop.rentPrice) }}/ημ.</span>
        </div>
        <div class="actions">
          <button
            class="btn btn-sm btn-primary"
            :disabled="player.level < prop.requirements.level || player.cash < prop.buyPrice"
            @click="buyInCurrentLocation(prop.id)"
          >
            Αγορά
          </button>
          <button
            class="btn btn-sm btn-outline"
            :disabled="player.level < prop.requirements.level || player.cash < prop.rentPrice"
            @click="rentInCurrentLocation(prop.id)"
          >
            Ενοικίαση
          </button>
        </div>
      </div>
    </div>

    <div v-else class="property-list">
      <div v-if="!propertyStore.properties.length" class="card">
        <p class="text-muted">Δεν έχεις ακόμα ακίνητα. Πήγαινε στο Μεσιτικό Γραφείο.</p>
      </div>

      <div
        v-for="instance in propertyStore.properties"
        :key="instance.instanceId"
        class="card property-card"
        :class="{ active: propertyStore.activeInstanceId === instance.instanceId }"
      >
        <div class="property-header">
          <span class="property-icon">{{ propertyMeta(instance).icon }}</span>
          <div class="property-info">
            <strong>{{ propertyName(instance) }}</strong>
            <p class="text-muted">{{ propertyMeta(instance).description }}</p>
          </div>
          <div class="badges">
            <span v-if="instance.isRented" class="badge badge-info">Ενοικιαζόμενο</span>
            <span v-else class="badge badge-success">Ιδιόκτητο</span>
            <span v-if="propertyStore.activeInstanceId === instance.instanceId" class="badge badge-warning">Active</span>
          </div>
        </div>

        <div class="property-stats">
          <span class="text-mono">Vault: €{{ formatCash(instance.vaultCash) }} / €{{ formatCash(propertyMeta(instance).vaultCapacity) }}</span>
          <span class="text-mono">Items: {{ stashUsage(instance) }}/{{ propertyMeta(instance).itemCapacity }}</span>
          <span class="text-muted">Τοποθεσία: {{ locationName(instance.locationId) }}</span>
        </div>

        <div class="actions">
          <button class="btn btn-sm btn-primary" @click="propertyStore.setActiveInstance(instance.instanceId)" :disabled="propertyStore.activeInstanceId === instance.instanceId">
            Μετακόμιση εδώ
          </button>
          <button v-if="instance.isRented" class="btn btn-sm btn-outline" @click="endLease(instance.instanceId)">Λήξη Ενοικίασης</button>
          <button v-else class="btn btn-sm btn-outline" @click="sellProperty(instance.instanceId, propertyMeta(instance).name)">
            Πώληση (75%)
          </button>
        </div>

        <details class="manage-panel">
          <summary>Διαχείριση Vault / Stash / Μεταφορική</summary>

          <div class="section">
            <h4>🔐 Vault</h4>
            <div class="inline-row">
              <input v-model.number="vaultInputs[instance.instanceId]" type="number" class="input" min="1" placeholder="Ποσό..." />
              <button class="btn btn-sm btn-primary" @click="depositVault(instance.instanceId)">Κατάθεση</button>
              <button class="btn btn-sm btn-outline" @click="withdrawVault(instance.instanceId)">Ανάληψη</button>
            </div>
          </div>

          <div class="section">
            <h4>📦 Stash</h4>
            <div class="inline-row">
              <select v-model="stashItemInputs[instance.instanceId]" class="input">
                <option disabled value="">Επίλεξε item...</option>
                <option v-for="it in pocketItems" :key="it.itemId" :value="it.itemId">
                  {{ itemLabel(it.itemId) }} (Pocket: {{ it.quantity }})
                </option>
              </select>
              <input v-model.number="stashQtyInputs[instance.instanceId]" type="number" class="input" min="1" placeholder="Ποσότητα..." />
              <button class="btn btn-sm btn-primary" @click="depositStash(instance.instanceId)">Κατάθεση σε Stash</button>
            </div>

            <div class="stash-list">
              <div v-for="entry in stashEntries(instance)" :key="`${instance.instanceId}_${entry.itemId}`" class="stash-row">
                <span>{{ itemLabel(entry.itemId) }} x{{ entry.qty }}</span>
                <div class="inline-row">
                  <input v-model.number="withdrawQtyInputs[`${instance.instanceId}_${entry.itemId}`]" type="number" class="input small" min="1" :max="entry.qty" placeholder="Qty" />
                  <button class="btn btn-sm btn-outline" @click="withdrawStash(instance.instanceId, entry.itemId)">Ανάληψη στην Τσέπη</button>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h4>🚚 Μεταφορική</h4>
            <p class="text-muted">Κόστος: €500. Σε ζάρι 1 χάνεται 25% των μεταφερόμενων αντικειμένων.</p>
            <div class="inline-row">
              <select v-model="moveTargetByInstance[instance.instanceId]" class="input">
                <option disabled value="">Επιλογή προορισμού...</option>
                <option v-for="other in otherInstances(instance.instanceId)" :key="other.instanceId" :value="other.instanceId">
                  {{ propertyName(other) }}
                </option>
              </select>
              <button class="btn btn-sm btn-primary" @click="moveAllStash(instance.instanceId)">Μεταφορική</button>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { usePropertyStore } from '../stores/propertyStore'
import { useTravelStore } from '../stores/travelStore'
import { useGameStore } from '../stores/gameStore'
import { getItemById } from '../data/items'
import { getLocationById } from '../data/locations'
import { getPropertyById, getPropertyName, properties } from '../data/properties'

const player = usePlayerStore()
const inventoryStore = useInventoryStore()
const propertyStore = usePropertyStore()
const travelStore = useTravelStore()
const gameStore = useGameStore()
const allProperties = properties
const activeTab = ref('mine')
const vaultInputs = ref({})
const stashItemInputs = ref({})
const stashQtyInputs = ref({})
const withdrawQtyInputs = ref({})
const moveTargetByInstance = ref({})

const pocketItems = computed(() => inventoryStore.items.filter(i => i.quantity > 0))

function propertyMeta(instance) {
  return getPropertyById(instance.propertyId) || {}
}

function propertyName(instance) {
  return getPropertyName(propertyMeta(instance), instance.locationId)
}

function locationName(locationId) {
  return getLocationById(locationId)?.name || locationId
}

function stashUsage(instance) {
  return propertyStore.getStashUsage(instance.instanceId)
}

function stashEntries(instance) {
  return Object.entries(instance.stash || {}).map(([itemId, qty]) => ({ itemId, qty }))
}

function itemLabel(itemId) {
  const item = getItemById(itemId)
  if (!item) return itemId
  return `${item.icon || ''} ${item.name}`.trim()
}

function buyInCurrentLocation(propertyId) {
  propertyStore.buyProperty(propertyId, travelStore.currentLocation)
}

function rentInCurrentLocation(propertyId) {
  propertyStore.rentProperty(propertyId, travelStore.currentLocation)
}

function sellProperty(instanceId, propertyNameLabel) {
  if (!confirm(`Σίγουρα θέλεις να πουλήσεις το "${propertyNameLabel}";`)) return
  propertyStore.sellProperty(instanceId)
}

function endLease(instanceId) {
  if (!confirm('Θέλεις σίγουρα να τερματίσεις την ενοικίαση; Θα χαθούν stash/vault.')) return
  propertyStore.endLease(instanceId)
}

function depositVault(instanceId) {
  const amount = Number(vaultInputs.value[instanceId] || 0)
  if (!amount || amount <= 0) {
    gameStore.addNotification('Δώσε έγκυρο ποσό.', 'danger')
    return
  }
  if (propertyStore.depositToVault(instanceId, amount)) {
    vaultInputs.value[instanceId] = 0
  }
}

function withdrawVault(instanceId) {
  const amount = Number(vaultInputs.value[instanceId] || 0)
  if (!amount || amount <= 0) {
    gameStore.addNotification('Δώσε έγκυρο ποσό.', 'danger')
    return
  }
  if (propertyStore.withdrawFromVault(instanceId, amount)) {
    vaultInputs.value[instanceId] = 0
  }
}

function depositStash(instanceId) {
  const itemId = stashItemInputs.value[instanceId]
  const qty = Number(stashQtyInputs.value[instanceId] || 0)
  if (!itemId || qty <= 0) {
    gameStore.addNotification('Επίλεξε item και έγκυρη ποσότητα.', 'danger')
    return
  }
  if (propertyStore.depositToStash(instanceId, itemId, qty)) {
    stashQtyInputs.value[instanceId] = 0
  }
}

function withdrawStash(instanceId, itemId) {
  const key = `${instanceId}_${itemId}`
  const qty = Number(withdrawQtyInputs.value[key] || 0)
  if (qty <= 0) {
    gameStore.addNotification('Δώσε έγκυρη ποσότητα.', 'danger')
    return
  }
  if (propertyStore.withdrawFromStash(instanceId, itemId, qty)) {
    withdrawQtyInputs.value[key] = 0
  }
}

function otherInstances(instanceId) {
  return propertyStore.properties.filter(p => p.instanceId !== instanceId)
}

function moveAllStash(fromInstanceId) {
  const targetId = moveTargetByInstance.value[fromInstanceId]
  if (!targetId) {
    gameStore.addNotification('Επίλεξε ακίνητο προορισμού.', 'danger')
    return
  }
  const source = propertyStore.getInstanceById(fromInstanceId)
  if (!source) {
    gameStore.addNotification('Το ακίνητο προέλευσης δεν βρέθηκε.', 'danger')
    return
  }

  const moveObj = {}
  for (const [itemId, qty] of Object.entries(source.stash || {})) {
    if (qty > 0) moveObj[itemId] = qty
  }
  propertyStore.moveStash(fromInstanceId, targetId, moveObj)
}

function formatCash(amount) {
  return new Intl.NumberFormat('el-GR').format(Math.floor(amount))
}
</script>

<style scoped>
.property-page { display: flex; flex-direction: column; gap: var(--space-md); }
.page-title { font-size: var(--font-size-2xl); }
.tabs { display: flex; gap: var(--space-sm); }
.tab-btn { padding: 8px 12px; border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-text); border-radius: var(--radius-md); cursor: pointer; }
.tab-btn.active { border-color: var(--color-primary); background: var(--color-primary-soft); }

.property-header { display: flex; align-items: center; gap: var(--space-md); }
.property-icon { font-size: 32px; flex-shrink: 0; }
.property-info { flex: 1; min-width: 0; }
.property-info p { font-size: var(--font-size-xs); }

.property-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.property-card.active { border-color: var(--color-warning); }
.property-stats { display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-xs); align-items: center; font-size: var(--font-size-sm); }
.actions { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); flex-wrap: wrap; }
.badges { display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.manage-panel { margin-top: var(--space-sm); }
.manage-panel summary { cursor: pointer; font-weight: var(--font-weight-medium); }
.section { margin-top: var(--space-sm); display: flex; flex-direction: column; gap: var(--space-xs); }
.inline-row { display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center; }
.stash-list { display: flex; flex-direction: column; gap: var(--space-xs); }
.stash-row { display: flex; justify-content: space-between; gap: var(--space-sm); flex-wrap: wrap; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--color-border); }
.input.small { max-width: 80px; }
</style>
