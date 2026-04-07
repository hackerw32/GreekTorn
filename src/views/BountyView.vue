<template>
  <ComingSoon
    icon="🎯"
    title="Συμβόλαια Θανάτου"
    description="Βάλε κεφαλή σε εχθρούς ή γίνε κυνηγός επικηρυγμένων για μεγάλα κέρδη!"
    :features="[
      { icon: '💰', text: 'Τοποθέτηση συμβολαίων' },
      { icon: '🔫', text: 'Κυνήγι επικηρυγμένων' },
      { icon: '🏆', text: 'Κατάταξη κυνηγών' },
      { icon: '🕵️', text: 'Ανώνυμα συμβόλαια' }
    ]"
  />
</template>

<script setup>
import ComingSoon from '../components/ui/ComingSoon.vue'
</script>
