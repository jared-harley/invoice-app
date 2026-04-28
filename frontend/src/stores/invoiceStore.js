import { defineStore } from 'pinia';
import axios from 'axios';

export const useInvoiceStore = defineStore('invoiceStore', {
  state: () => ({
    invoices: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchInvoices() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:3000/api/invoices');
        this.invoices = response.data;
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async refreshInvoices() {
      await this.fetchInvoices();
    }
  }
});