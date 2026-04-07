<template>
  <ComingSoon
    icon="📰"
    title="Εφημερίδα"
    description="Μάθε τα τελευταία νέα του Χάους — μάχες, εγκλήματα, αλλαγές στην κατάταξη και άλλα!"
    :features="[
      { icon: '📋', text: 'Ειδήσεις παικτών & γεγονότα' },
      { icon: '💀', text: 'Αναφορές μαχών & θανάτων' },
      { icon: '📊', text: 'Στατιστικά διακομιστή' },
      { icon: '🔍', text: 'Αναζήτηση παικτών' }
    ]"
  />
</template>

<script setup>
import ComingSoon from '../components/ui/ComingSoon.vue'
</script>
