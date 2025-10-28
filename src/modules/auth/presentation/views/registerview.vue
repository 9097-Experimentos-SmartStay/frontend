<template>
  <div class="register-page-container p-4">
    <AuthForm :start-in-register-mode="true" /> </div>
</template>

<script setup>
import AuthForm from '../components/auth-form.vue';
</script>

<style scoped>
/* Add styles specific to the register page layout if necessary */
.register-page-container {
  /* Example styles */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
</style>