<template>
  <div class="grid-container">
    <dx-data-grid
      :data-source="invoiceStore.invoices"
      key-expr="id"
      :show-borders="true"
      :column-auto-width="true"
      @row-inserted="saveNewInvoice"
      @row-updated="updateInvoice"
    >
      <dx-editing :allow-adding="true" :allow-updating="true" mode="popup">
        <dx-popup title="Invoice Header" :show-title="true" :width="700" :height="450" />
      </dx-editing>

      <dx-column data-field="invoice_number" caption="Inv #" :allow-editing="false" :width="120" />
      <dx-column data-field="client_id" caption="Client">
        <dx-lookup :data-source="clientsStore" value-expr="id" display-expr="name" />
        <dx-required-rule message="Client is required" />
      </dx-column>
      <dx-column data-field="issue_date" caption="Issue Date" data-type="date" />
      <dx-column data-field="due_date" caption="Due Date" data-type="date" />
      <dx-column data-field="status" caption="Status" />
      <dx-column data-field="total_amount" caption="Total" data-type="number" format="currency" :allow-editing="false" />

      <dx-column caption="Actions" :width="140" cell-template="actionTemplate" :allow-editing="false" />
      <template #actionTemplate="{ data }">
        <div class="action-buttons">
          <dx-button icon="exportpdf" hint="Download PDF" @click="downloadPdf(data.data.id)" />
          <dx-button icon="email" hint="Send Email" type="default" @click="sendEmail(data.data.id)" />
        </div>
      </template>

      <dx-master-detail :enabled="true" template="detailTemplate" />
      <template #detailTemplate="{ data }">
        <InvoiceItemsGrid :invoice-id="data.data.id" />
      </template>
    </dx-data-grid>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { DxDataGrid, DxColumn, DxEditing, DxLookup, DxRequiredRule, DxMasterDetail, DxPopup } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import notify from 'devextreme/ui/notify';
import CustomStore from 'devextreme/data/custom_store';
import axios from 'axios';
import InvoiceItemsGrid from './InvoiceItemsGrid.vue';
import { useInvoiceStore } from '@/stores/invoiceStore';

const INVOICE_API = 'http://localhost:3000/api/invoices';
const CLIENT_API = 'http://localhost:3000/api/clients';

const invoiceStore = useInvoiceStore();

onMounted(() => {
  invoiceStore.fetchInvoices();
});

const saveNewInvoice = async (e) => {
  try {
    await axios.post(INVOICE_API, e.data);
    await invoiceStore.refreshInvoices();
    notify("Invoice created", "success", 2000);
  } catch (error) {
    notify("Failed to create", "error", 3000);
  }
};

const updateInvoice = async (e) => {
  try {
    await axios.put(`${INVOICE_API}/${e.key}`, e.data);
    await invoiceStore.refreshInvoices();
    notify("Invoice updated", "success", 2000);
  } catch (error) {
    notify("Update failed", "error", 3000);
  }
};

const clientsStore = new CustomStore({
  key: 'id',
  loadMode: 'raw',
  load: async () => (await axios.get(CLIENT_API)).data
});

const downloadPdf = (invoiceId) => {
  window.open(`${INVOICE_API}/${invoiceId}/pdf`, '_blank');
};

const sendEmail = async (invoiceId) => {
  const loadNotify = notify("Generating PDF and sending email...", "info", 0);
  const emailTab = window.open('about:blank', '_blank');

  try {
    const response = await axios.post(`${INVOICE_API}/${invoiceId}/email`);
    loadNotify.hide();
    notify("Email sent successfully!", "success", 3000);
    
    if (response.data.preview_url) {
      emailTab.location.href = response.data.preview_url;
    } else {
      emailTab.document.write('<h3>Email sent, but no preview URL was generated.</h3>');
    }
  } catch (error) {
    loadNotify.hide();
    if (emailTab) emailTab.close();
    const serverError = error.response?.data?.error || error.message;
    notify(`Error: ${serverError}`, "error", 5000);
  }
};
</script>

<style scoped>
.grid-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.action-buttons { display: flex; gap: 8px; }
</style>