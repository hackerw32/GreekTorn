<template>
  <ComingSoon
    icon="🏪"
    title="Παζάρι"
    description="Αγόρασε και πούλησε αντικείμενα με άλλους παίκτες στην ελεύθερη αγορά!"
    :features="[
      { icon: '🏷️', text: 'Αγγελίες πώλησης' },
      { icon: '💎', text: 'Σπάνια αντικείμενα' },
      { icon: '📦', text: 'Ασφαλείς συναλλαγές' },
      { icon: '📈', text: 'Ιστορικό τιμών' }
    ]"
  />
</template>

<script setup>
import ComingSoon from '../components/ui/ComingSoon.vue'
</script>
