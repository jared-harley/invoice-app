<template>
  <div class="page-container">
    <h1>Settings</h1>
    <p>Manage your company details and invoicing defaults.</p>
    
    <section class="section">
      <h3>Company Profile</h3>
      <CompanyProfileForm />
    </section>
  </div>
</template>

<script setup>
import CompanyProfileForm from '@/components/CompanyProfileForm.vue';
</script>

<style scoped>
.page-container {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}
.section {
  margin-top: 20px;
}
</style>