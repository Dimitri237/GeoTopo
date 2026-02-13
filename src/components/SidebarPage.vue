<template>
  <!-- Bouton burger (mobile) -->
  <button class="burger" @click="open = !open">☰</button>

  <!-- Overlay mobile -->
  <div v-if="open" class="overlay" @click="open = false"></div>

  <!-- Sidebar -->
  <nav class="sidebar" :class="{ open }">
    <h3>
      <img style="width: 200px;" src="../assets/logGT.png" alt="Logo">
    </h3>
    <h3><router-link @click="closeSidebar" to="/dashboard">📊 Dashboard</router-link></h3>
    <h3><router-link @click="closeSidebar" to="/products">🛒 Produits</router-link></h3>
    <h3><router-link @click="closeSidebar" to="/accessoir">🛒 Accessoirs</router-link></h3>
    <h3><router-link @click="closeSidebar" to="/clients">📥 Clients</router-link></h3>
    <h3><router-link @click="closeSidebar" to="/sales">📦 Location</router-link></h3>
    <h3><router-link @click="closeSidebar" to="/comptabilite">📒 Comptabilité</router-link></h3>

    <!-- Bouton déconnexion -->
    <h3>
      <button class="btn-logout" @click="logout">🚪 Déconnexion</button>
    </h3>
  </nav>
</template>

<script>
import { auth } from '../firebase'
import { useRouter } from 'vue-router'

export default {
  data() {
    return {
      open: false
    }
  },
  setup() {
    const router = useRouter()

    // Fonction de logout Firebase
    const logout = async () => {
      try {
        await auth.signOut()
        router.replace('/') // redirige vers Loading/Login
      } catch (error) {
        console.error("Erreur déconnexion :", error)
        alert("Impossible de se déconnecter")
      }
    }

    return { logout, router }
  },
  methods: {
    closeSidebar() {
      this.open = false
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
  left: 9px;
  z-index: 200;
  font-size: 1.6rem;
  background: rgb(252, 146, 48);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 10px;
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
  margin: 0;
  height: 100vh;
  width: 220px;
  background: #111827;
  border-radius: 0px!important;
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

/* ===== BOUTON DECONNEXION ===== */
.btn-logout {
  width: 100%;
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.btn-logout:hover {
  background: #dc2626;
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
