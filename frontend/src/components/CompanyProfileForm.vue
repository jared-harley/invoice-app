<template>
  <div class="form-container">
    <dx-form
      :form-data="profileData"
      :col-count="2"
      label-location="top"
    >
      <dx-item data-field="company_name" :editor-options="{ placeholder: 'Enter company name' }">
        <dx-required-rule message="Company name is required" />
      </dx-item>
      
      <dx-item data-field="email" :editor-options="{ mode: 'email' }">
        <dx-email-rule message="Invalid email format" />
      </dx-item>

      <dx-item data-field="tax_id" />
      <dx-item data-field="logo_url" :editor-options="{ placeholder: 'URL to logo' }" />
      
      <dx-item
        data-field="address_line"
        editor-type="dxTextArea"
        :col-span="2"
        :editor-options="{ height: 90 }"
      />

      <dx-button-item
        :button-options="saveButtonOptions"
        horizontal-alignment="right"
      />
    </dx-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DxForm, DxItem, DxRequiredRule, DxEmailRule, DxButtonItem } from 'devextreme-vue/form';
import 'devextreme/ui/text_area'; 
import axios from 'axios';

// Base API URL for profiles
const PROFILE_API = `${import.meta.env.VITE_API_URL}/profile`;

const profileData = ref({
  company_name: '',
  tax_id: '',
  logo_url: '',
  address_line: '',
  email: ''
});

onMounted(async () => {
  try {
    const response = await axios.get(PROFILE_API);
    if (response.data.id) {
      profileData.value = response.data; 
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
});

const saveButtonOptions = {
  text: 'Save Details',
  type: 'success',
  useSubmitBehavior: false,
  onClick: async () => {
    try {
      await axios.post(PROFILE_API, profileData.value);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error saving profile');
    }
  }
};
</script>

<style scoped>
.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
</style>