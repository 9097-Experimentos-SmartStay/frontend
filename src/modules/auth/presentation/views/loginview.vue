<template>
  <div class="register-page-container"> <div class="top-right-controls">
    <LanguageSwitcher class="mr-2" />
    <router-link to="/login">
    </router-link>
  </div>

    <div class="register-content-wrapper"> <div class="form-section">
      <h1 class="welcome-text">CREATE YOUR SMART STAY ACCOUNT</h1> <AuthForm :is-login="false" />
    </div>

      <div class="logo-section">
        <img src="../../../../assets/logo-modo-oscuro.png" alt="Smart Stay Logo" class="logo-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
// --- Import Shared Components ---
// Adjust the path based on your actual shared components directory structure
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue';
// --- Import the actual form component ---
// Adjust the path based on your actual auth components directory structure
import AuthForm from '../components/auth-form.vue';

// No registration logic needed here anymore, it's inside AuthForm
</script>

<style scoped>
/* Reuse the styles from loginview.vue for consistency */
/* Renamed classes to avoid potential global conflicts if not scoped correctly */
.register-page-container {
  min-height: 100vh;
  width: 100%;
  background-color: #0d2a4f; /* Dark blue */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.register-page-container::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -70%;
  width: 200%;
  height: 180%;
  background-color: #f5f0e1; /* Cream */
  border-radius: 50%;
  z-index: 1;
}

.top-right-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.register-content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
  align-items: center;
  justify-content: space-around;
  padding: 3rem;
  box-sizing: border-box;
}

.form-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Aligns items to the start (left) */
  padding-right: 2rem;
  box-sizing: border-box;
  position: relative;
  z-index: 2; /* Ensure form is above the pseudo-element */
}


.welcome-text {
  color: #e67e22; /* Orange */
  font-size: clamp(1.25rem, 3vw, 1.75rem); /* Responsive font size */
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: left; /* Align text to the left */
  width: 100%; /* Ensure text takes full width */
}

/* AuthForm component will likely render its own card/container */

.logo-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 2rem;
  box-sizing: border-box;
  z-index: 2; /* Ensure logo is above the pseudo-element */
}

.logo-image {
  max-width: 80%; /* Adjust as needed */
  height: auto;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .register-content-wrapper {
    justify-content: center;
    flex-direction: column; /* Stack elements vertically */
    padding: 2rem;
  }
  .form-section {
    padding-right: 0;
    align-items: center; /* Center form in the column */
    margin-bottom: 3rem; /* Space between form and logo */
    max-width: 450px;
    order: 2; /* Form below title */
  }
  .welcome-text {
    text-align: center; /* Center title on smaller screens */
    order: 1; /* Title first */
  }
  .logo-section {
    padding-left: 0;
    max-width: 300px;
    order: 3; /* Logo last */
    margin-top: 2rem; /* Space above logo */
  }
  .register-page-container::before {
    top: -40%;
    left: -80%;
    width: 220%;
    height: 120%;
  }
}

@media (max-width: 576px) {
  .welcome-text {
    font-size: clamp(1.1rem, 5vw, 1.5rem);
  }
  /* AuthForm likely controls its internal padding/margins */
  .register-content-wrapper {
    padding: 1rem;
  }
}
</style>