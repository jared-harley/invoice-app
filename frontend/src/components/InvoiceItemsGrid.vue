<template>
  <div>
    <dx-data-grid
      :data-source="itemStore"
      key-expr="id"
      :show-borders="true"
    >
      <dx-editing 
        :allow-adding="true" 
        :allow-updating="true" 
        :allow-deleting="true" 
        mode="row" 
      />
      
      <dx-column data-field="description" caption="Description">
        <dx-required-rule />
      </dx-column>
      
      <dx-column data-field="quantity" caption="Qty" data-type="number">
        <dx-required-rule />
      </dx-column>
      
      <dx-column data-field="unit_price" caption="Price" data-type="number" format="currency">
        <dx-required-rule />
      </dx-column>
      
      <dx-column 
        data-field="total_price" 
        caption="Total" 
        data-type="number" 
        format="currency" 
        :allow-editing="false" 
      />
    </dx-data-grid>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { DxDataGrid, DxColumn, DxEditing, DxRequiredRule } from 'devextreme-vue/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import axios from 'axios';
import { useInvoiceStore } from '@/stores/invoiceStore'; 

const props = defineProps({ invoiceId: { type: Number, required: true } });
const invoiceStore = useInvoiceStore(); 

// Dynamically inject the API URL from .env
const API_URL = `${import.meta.env.VITE_API_URL}/invoices/${props.invoiceId}/items`;

const itemStore = new CustomStore({
  key: 'id',
  load: async () => (await axios.get(API_URL)).data,
  insert: async (values) => {
    const res = await axios.post(API_URL, values);
    invoiceStore.refreshInvoices(); 
    return res.data;
  },
  update: async (key, values) => {
    await axios.put(`${API_URL}/${key}`, values);
    invoiceStore.refreshInvoices(); 
  },
  remove: async (key) => {
    await axios.delete(`${API_URL}/${key}`);
    invoiceStore.refreshInvoices(); 
  }
});
</script>