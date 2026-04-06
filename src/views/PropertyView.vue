<template>
  <div class="property-page">
    <h2 class="page-title">🏘️ Ακίνητα</h2>

    <!-- Owned property -->
    <div v-if="propertyStore.ownedProperty" class="card owned-card">
      <div class="property-header">
        <span class="property-icon">{{ propertyStore.ownedProperty.icon }}</span>
        <div>
          <strong>{{ propertyStore.ownedProperty.name }}</strong>
          <p class="text-muted" style="font-size: var(--font-size-xs)">{{ propertyStore.ownedProperty.description }}</p>
        </div>
      </div>
      <div class="property-bonuses mt-sm">
        <span class="badge badge-warning">+{{ propertyStore.happinessBonus }} Κέφι</span>
        <span class="badge badge-info">Χρηματοκ.: €{{ formatCash(propertyStore.vaultCapacity) }}</span>
      </div>

      <!-- Vault -->
      <div class="vault-section mt-md card card-raised">
        <h4>🔐 Χρηματοκιβώτιο</h4>
        <div class="vault-balance text-mono text-success">
          €{{ formatCash(propertyStore.vaultCash) }} / €{{ formatCash(propertyStore.vaultCapacity) }}
        </div>
        <div class="vault-actions mt-sm">
          <div class="vault-input-group">
            <input v-model.number="vaultAmount" type="number" class="input" placeholder="Ποσό..." min="0" />
          </div>
          <div class="flex gap-sm">
            <button class="btn btn-sm btn-primary" @click="deposit" :disabled="!vaultAmount || vaultAmount <= 0">
              Κατάθεση
            </button>
            <button class="btn btn-sm btn-outline" @click="withdraw" :disabled="!vaultAmount || vaultAmount <= 0">
              Ανάληψη
            </button>
          </div>
        </div>
      </div>

      <button class="btn btn-outline btn-sm mt-md" @click="confirmSell">
        Πώληση (€{{ formatCash(propertyStore.ownedProperty.sellPrice) }})
      </button>
    </div>

    <!-- Property market -->
    <h3 class="mt-md mb-sm">Αγορά Ακινήτων</h3>
    <div class="property-list">
      <div v-for="prop in allProperties" :key="prop.id" class="card property-card" :class="{ owned: prop.id === propertyStore.ownedPropertyId }">
        <div class="property-header">
          <span class="property-icon">{{ prop.icon }}</span>
          <div class="property-info">
            <strong>{{ prop.name }}</strong>
            <p class="text-muted" style="font-size: var(--font-size-xs)">{{ prop.description }}</p>
          </div>
        </div>
        <div class="property-stats">
          <span class="badge badge-warning">+{{ prop.happinessBonus }} Κέφι</span>
          <span class="badge badge-info">Επ. {{ prop.requirements.level }}+</span>
          <span class="text-mono text-success" style="font-size: var(--font-size-sm)">€{{ formatCash(prop.buyPrice) }}</span>
        </div>
        <button
          v-if="prop.id !== propertyStore.ownedPropertyId"
          class="btn btn-sm btn-primary mt-sm"
          :disabled="player.cash < prop.buyPrice || player.level < prop.requirements.level"
          @click="propertyStore.buyProperty(prop.id)"
        >
          Αγορά
        </button>
        <span v-else class="badge badge-success mt-sm">✓ Ιδιοκτησία σου</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/playerStore'
import { usePropertyStore } from '../stores/propertyStore'
import { properties } from '../data/properties'

const player = usePlayerStore()
const propertyStore = usePropertyStore()
const allProperties = properties
const vaultAmount = ref(0)

function deposit() {
  if (vaultAmount.value > 0) {
    propertyStore.depositToVault(vaultAmount.value)
    vaultAmount.value = 0
  }
}

function withdraw() {
  if (vaultAmount.value > 0) {
    propertyStore.withdrawFromVault(vaultAmount.value)
    vaultAmount.value = 0
  }
}

function confirmSell() {
  if (confirm('Σίγουρα θέλεις να πουλήσεις το ακίνητό σου;')) {
    propertyStore.sellProperty()
  }
}

function formatCash(amount) {
  return new Intl.NumberFormat('el-GR').format(Math.floor(amount))
}
</script>

<style scoped>
.property-page { display: flex; flex-direction: column; gap: var(--space-md); }
.page-title { font-size: var(--font-size-2xl); }

.property-header { display: flex; align-items: center; gap: var(--space-md); }
.property-icon { font-size: 32px; flex-shrink: 0; }
.property-info { flex: 1; min-width: 0; }
.property-bonuses { display: flex; gap: var(--space-sm); }

.vault-balance { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); }
.vault-actions { display: flex; flex-direction: column; gap: var(--space-sm); }
.vault-input-group { max-width: 200px; }

.property-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.property-card.owned { border-color: var(--color-success); }
.property-stats { display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-xs); align-items: center; }
</style>
