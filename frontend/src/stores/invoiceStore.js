import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useInvoiceStore = defineStore('invoiceStore', {
  state: () => ({
    invoices: [],
    isLoading: false,
  }),
  
  actions: {
    async fetchInvoices() {
      this.isLoading = true;
      try {
        const response = await axios.get(`${API_URL}/invoices`);
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