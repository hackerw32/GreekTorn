<template>
  <div class="app-layout">
    <StatusBar v-if="gameStore.initialized" />
    <aside class="sidebar" v-if="gameStore.initialized">
      <NavBar :vertical="true" />
    </aside>
    <main class="main-content" :class="{ 'no-bars': !gameStore.initialized }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <nav class="bottom-nav" v-if="gameStore.initialized">
      <NavBar :vertical="false" />
    </nav>
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from './stores/gameStore'
import StatusBar from './components/layout/StatusBar.vue'
import NavBar from './components/layout/NavBar.vue'
import ToastNotification from './components/ui/ToastNotification.vue'

const gameStore = useGameStore()
const router = useRouter()

onMounted(() => {
  gameStore.init()
})

watch(() => gameStore.initialized, (val) => {
  if (val) {
    gameStore.startGameLoop()
  } else {
    router.push('/create')
  }
}, { immediate: true })
</script>

<style scoped>
.app-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-bar-height) + var(--space-md));
}

.main-content.no-bars {
  padding-bottom: var(--space-md);
}

.sidebar {
  display: none;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-bar-height);
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  z-index: var(--z-sticky);
}

@media (min-width: 768px) {
  .app-layout {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: auto 1fr;
  }

  .status-bar-wrapper {
    grid-column: 1 / -1;
  }

  .sidebar {
    display: flex;
    grid-row: 2;
    grid-column: 1;
    background: var(--bg-surface);
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
  }

  .main-content {
    grid-row: 2;
    grid-column: 2;
    padding-bottom: var(--space-md);
    padding: var(--space-lg) var(--space-xl);
  }

  .bottom-nav {
    display: none;
  }
}
</style>
