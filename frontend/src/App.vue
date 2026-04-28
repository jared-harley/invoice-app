<template>
  <div id="app-container">
    <nav class="main-nav">
      <div class="logo">InvoicePro</div>
      <div class="links">
        <router-link to="/clients">Clients</router-link>
        <router-link to="/settings">Settings</router-link>
        <router-link to="/invoices">Invoices</router-link>
      </div>
    </nav>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Simple Global Styles */
body { margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; }
.main-nav { 
  display: flex; 
  justify-content: space-between; 
  padding: 1rem 2rem; 
  background: #232f3e; /* AWS-style dark blue */
  color: white; 
}
.links a { 
  color: white; 
  margin-left: 20px; 
  text-decoration: none; 
  opacity: 0.8; 
}
.links a.router-link-active { opacity: 1; font-weight: bold; border-bottom: 2px solid #ff9900; }
.content { padding: 20px; }
</style>