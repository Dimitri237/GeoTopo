<template>
  <div class="login-page">
    <div class="card login-card">
      <img class="logo" src="../assets/logGT.png" alt="Logo" />

      <p class="subtitle">Accédez à votre espace de gestion</p>

      <!-- MESSAGE ERREUR -->
      <div v-if="error" class="error-box">
        {{ error }}
      </div>

      <input
        v-model.trim="email"
        type="email"
        placeholder="📧 Adresse email"
        :disabled="loading"
      />

      <input
        v-model="password"
        type="password"
        placeholder="🔑 Mot de passe"
        :disabled="loading"
      />

      <button class="btn primary" @click="login" :disabled="loading">
        <span class="loading-indicator" v-if="loading"></span>
        <span v-else>Connexion</span>
      </button>
    </div>
  </div>
</template>


<script>
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"

export default {
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: null
    }
  },

  methods: {
    async login() {
      this.error = null

      if (!this.email || !this.password) {
        this.error = "Veuillez renseigner l’email et le mot de passe."
        return
      }

      this.loading = true

      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push("/dashboard")
      } catch (err) {
        console.error(err)

        switch (err.code) {
          case "auth/user-not-found":
            this.error = "Utilisateur introuvable."
            break

          case "auth/wrong-password":
            this.error = "Mot de passe incorrect."
            break

          case "auth/invalid-email":
            this.error = "Adresse email invalide."
            break

          case "auth/network-request-failed":
            this.error = "Problème de connexion internet."
            break

          case "auth/too-many-requests":
            this.error = "Trop de tentatives. Réessayez plus tard."
            break

          default:
            this.error = "Erreur de connexion. Veuillez réessayer."
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>
/* ===== PAGE ===== */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #f9fafb, #eef2f7);
}

/* ===== CARD ===== */
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 24px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  text-align: center;
}

/* ===== LOGO ===== */
.logo {
  width: 150px;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 18px;
}

/* ===== ERREUR ===== */
.error-box {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 14px;
}

/* ===== INPUTS ===== */
input {
  width: 100%;
  margin-bottom: 14px;
  padding: 10px 0px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
}

input:focus {
  outline: none;
  border-color: rgb(214, 106, 5);
  box-shadow: 0 0 0 2px rgba(214,106,5,0.25);
}

/* ===== BOUTON ===== */
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

.primary {
  background: rgb(252, 146, 48);
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ===== LOADING ===== */
.loading-indicator::after {
  content: "";
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #06283D;
  border-top-color: rgb(252, 146, 48);
  border-bottom-color: rgb(252, 146, 48);
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

