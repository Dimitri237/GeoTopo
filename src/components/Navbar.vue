<template>
  <div>
    <!-- Bouton déconnexion -->
    <button class="logout-btn" @click="showConfirm = true">
      🚪 Déconnexion
    </button>

    <!-- Modal de confirmation -->
    <div v-if="showConfirm" class="modal-overlay">
      <div class="modal">
        <h3>Confirmation</h3>
        <p>Voulez-vous vraiment vous déconnecter ?</p>

        <div class="actions">
          <button class="btn cancel" @click="showConfirm = false">
            Annuler
          </button>
          <button class="btn danger" @click="logout" :disabled="loading">
            <span v-if="loading">Déconnexion...</span>
            <span v-else>Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

export default {
  name: "LogoutButton",
  data() {
    return {
      showConfirm: false,
      loading: false
    }
  },
  methods: {
    async logout() {
      try {
        this.loading = true
        await signOut(auth)
        this.showConfirm = false
        this.$router.replace("/login")
      } catch (e) {
        alert("Erreur lors de la déconnexion")
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>
.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  text-align: center;
  animation: pop 0.2s ease;
}

.modal h3 {
  margin-bottom: 8px;
}

.modal p {
  color: #555;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.cancel {
  background: #e5e7eb;
}

.danger {
  background: #ef4444;
  color: white;
}

.danger:hover {
  background: #dc2626;
}

@keyframes pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
