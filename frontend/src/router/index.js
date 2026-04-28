import { createRouter, createWebHistory } from 'vue-router';
// Standard imports (No lazy loading)
import SettingsView from '../views/SettingsView.vue';
import ClientsView from '../views/ClientsView.vue';
import InvoicesView from '../views/InvoicesView.vue';

const routes = [
  {
    path: '/',
    redirect: '/clients'
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientsView
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: InvoicesView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;