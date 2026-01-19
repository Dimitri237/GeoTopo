<template>
  <div class="login-page">
  <div class="card login-card">
    <!-- <h2>🔐 WS Connexion</h2> -->
     <img class="logo" src="../assets/logGT.png" alt="">
    <p class="subtitle">Accédez à votre espace de gestion</p>

    <input v-model="email" type="email" placeholder="📧 Adresse email" />
    <input v-model="password" type="password" placeholder="🔑 Mot de passe" />

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
    return { email: "", password: "", loading: false }
  },
  methods: {
    async login() {
    this.loading = true;
      await signInWithEmailAndPassword(auth, this.email, this.password)
       this.loading = false;
      this.$router.push("/dashboard")
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

/* ===== TITRES ===== */
.logo {
  width: 150px;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 24px;
}

/* ===== INPUTS ===== */
input {
  width: 100%;
  margin-bottom: 14px;
  padding: 10px 0;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: border 0.2s, box-shadow 0.2s;
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
  transition: transform 0.15s, box-shadow 0.15s;
}

.primary {
  background: rgb(252, 146, 48);
  color: white;
}

.btn:active {
  transform: scale(0.98);
}

/* ===== LOADING ===== */
.loading-indicator {
  display: flex;
  justify-content: center;
}

.loading-indicator::after {
  content: "";
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #06283D;
  border-top-color: rgb(252, 146, 48);
  border-bottom-color: rgb(252, 146, 48);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== GRAND ÉCRAN ===== */
@media (min-width: 768px) {
  .login-card {
    padding: 32px;
  }
}

</style>

