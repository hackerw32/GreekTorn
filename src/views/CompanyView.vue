<template>
  <ComingSoon
    icon="🏢"
    title="Εταιρεία"
    description="Ίδρυσε ή δούλεψε σε εταιρεία για σταθερό εισόδημα και ειδικά bonus!"
    :features="[
      { icon: '🏗️', text: 'Ίδρυση εταιρείας' },
      { icon: '👷', text: 'Πρόσληψη υπαλλήλων' },
      { icon: '💵', text: 'Ημερήσια κέρδη' },
      { icon: '⬆️', text: 'Αναβάθμιση & επέκταση' }
    ]"
  />
</template>

<script setup>
import ComingSoon from '../components/ui/ComingSoon.vue'
</script>
