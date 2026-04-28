<template>
  <div class="page-container">
    <div class="header-section">
      <h1>Client Management</h1>
      <p>Add, update, or remove companies you invoice.</p>
    </div>
    
    <ClientGrid />
  </div>
</template>

<script setup>
import ClientGrid from '@/components/ClientGrid.vue';
</script>

<style scoped>
.page-container {
  padding: 40px;
  max-width: 1200px; /* Wider than settings to fit the grid */
  margin: 0 auto;
}
.header-section {
  margin-bottom: 20px;
}
h1 {
  margin: 0 0 5px 0;
  color: #232f3e;
}
p {
  margin: 0;
  color: #666;
}
</style>