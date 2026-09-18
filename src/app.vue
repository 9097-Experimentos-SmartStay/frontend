<template>
  <div id="app">
    <RouterView/>
  </div>
</template>

<script setup>
// No necesitas lógica aquí por ahora.
// El router se encarga de renderizar las vistas de cada bounded context.
</script>

<style>
/* Reset y estilos base */
#app {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
}

/* Centramos vistas como login/register */
.router-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>

