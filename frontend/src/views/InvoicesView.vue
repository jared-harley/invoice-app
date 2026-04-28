<template>
  <div class="page-container">
    <h1>Invoices</h1>
    <InvoiceGrid />
  </div>
</template>

<script setup>
import InvoiceGrid from '@/components/InvoiceGrid.vue';
</script>

<style scoped>
.page-container { padding: 40px; max-width: 1200px; margin: 0 auto; }
</style>