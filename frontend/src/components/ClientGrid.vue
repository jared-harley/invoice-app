<template>
  <div class="grid-container">
    <dx-data-grid
      :data-source="clientStore"
      :show-borders="true"
      :column-auto-width="true"
      :row-alternation-enabled="true"
    >
      <dx-editing
        :allow-adding="true"
        :allow-updating="true"
        :allow-deleting="true"
        mode="popup"
      >
        <dx-popup
          :show-title="true"
          title="Client Information"
          :width="600"
          :height="400"
        />
        <dx-form>
          <dx-item item-type="group" :col-count="1">
            <dx-item data-field="name" />
            <dx-item data-field="website" />
            <dx-item data-field="billing_address" editor-type="dxTextArea" :editor-options="{ height: 100 }" />
          </dx-item>
        </dx-form>
      </dx-editing>

      <dx-column data-field="id" :allow-editing="false" :visible="false" />
      
      <dx-column data-field="name" caption="Client Name">
        <dx-required-rule message="Name is required" />
      </dx-column>
      
      <dx-column data-field="website" caption="Website" />
      
      <dx-column data-field="billing_address" caption="Billing Address" />

      <dx-filter-row :visible="true" />
      <dx-search-panel :visible="true" :highlight-case-sensitive="false" />
      <dx-paging :page-size="10" />
    </dx-data-grid>
  </div>
</template>

<script setup>
import { 
  DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxItem, 
  DxRequiredRule, DxFilterRow, DxSearchPanel, DxPaging 
} from 'devextreme-vue/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import axios from 'axios';
import 'devextreme/ui/text_area';

// Dynamically inject the API URL from .env
const API_URL = `${import.meta.env.VITE_API_URL}/clients`;

const clientStore = new CustomStore({
  key: 'id',
  load: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  insert: async (values) => {
    const response = await axios.post(API_URL, values);
    return response.data;
  },
  update: async (key, values) => {
    await axios.put(`${API_URL}/${key}`, values);
  },
  remove: async (key) => {
    await axios.delete(`${API_URL}/${key}`);
  }
});
</script>

<style scoped>
.grid-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
</style>