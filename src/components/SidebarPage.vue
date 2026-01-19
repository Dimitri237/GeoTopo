
<template>
  <!-- Bouton burger (mobile) -->
  <button class="burger" @click="open = !open">☰</button>

  <!-- Overlay mobile -->
  <div v-if="open" class="overlay" @click="open = false"></div>

  <!-- Sidebar -->
  <nav class="sidebar" :class="{ open }">
    <h3><router-link @click="open = false" to="/dashboard">📊 Dashboard</router-link></h3>
    <h3><router-link @click="open = false" to="/products">🛒 Produits</router-link></h3>
    <h3><router-link @click="open = false" to="/clients">📥 Clients</router-link></h3>
    <h3><router-link @click="open = false" to="/sales">📦 Location</router-link></h3>
    <h3><router-link @click="open = false" to="/comptabilite">📒 Comptabilitee</router-link></h3>
  </nav>
</template>
<script>
export default {
  data() {
    return {
      open: false
    }
  }
}
</script>
<style scoped>
  /* ===== BURGER ===== */
.burger {
  display: none;
  position: fixed;
  top: 12px;
  left: 0px;
  z-index: 200;
  font-size: 1.6rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

/* ===== OVERLAY ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 150;
}

/* ===== SIDEBAR ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 220px;
  background: #111827;
  padding: 20px 16px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.25);
  transform: translateX(0);
  transition: transform 0.3s ease;
  z-index: 180;
}

.sidebar h3 {
  margin: 16px 0;
  font-weight: normal;
}

.sidebar a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
}

.sidebar a.router-link-active {
  background: #3b82f6;
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  .burger {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

/* ===== DESKTOP ===== */
@media (min-width: 769px) {
  .burger {
    display: none;
  }
}

</style>