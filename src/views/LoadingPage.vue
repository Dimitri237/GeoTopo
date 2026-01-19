<script>
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

export default {
  mounted() {
    onAuthStateChanged(auth, user => {
      if (user) {
        this.$router.replace("/dashboard")
      } else {
        this.$router.replace("/login")
      }
    })
  }
}
</script>

<template>
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Chargement...</p>
  </div>
</template>

<style scoped>
.loading-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
