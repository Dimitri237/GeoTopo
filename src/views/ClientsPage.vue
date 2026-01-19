<template>
  <div class="page">
    <h2 class="title">Clients</h2>

    <div class="card form">
      <input v-model="name" placeholder="Nom" />
      <input v-model="cni" placeholder="Num.CNI" />
      <input v-model="localisation" placeholder="Localisation" />
      <input v-model="phone" placeholder="Téléphone" />
      <button class="btn primary" @click="add" :disabled="loading">
        <span class="loading-indicator" v-if="loading"></span>
        <span v-else>Enregistrer</span>
      </button>
    </div>
    <transition-group name="list" tag="div">
      <div v-for="c in clients" :key="c.id" class="card product">
        <div class="header">
          <div class="info">
            <strong> {{ c.name }}</strong>
            <span class="price">{{ c.phone }} </span>
          </div>
          <button class="danger" @click="remove(c.id)">❌</button>
        </div>
      </div>

    </transition-group>
  </div>
</template>

<script>
import { db } from "../firebase"
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,

  doc
} from "firebase/firestore"

export default {
  data() {
    return {
      clients: [],
      name: "",
      cni: "",
      loading: false,
      localisation: "",
      phone: ""
    }
  },
  methods: {
    async load() {
      const snap = await getDocs(collection(db, "clients"))
      this.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    async add() {
      this.loading = true;
      await addDoc(collection(db, "clients"), {
        name: this.name,
        cni: this.cni,
        localisation: this.localisation,
        phone: this.phone
      })
      this.loading = false;
      alert("Enregistrement reussi")
      this.name = ""
      this.cni = ""
      this.localisation = ""
      this.phone = ""
      this.load()
    },
    async remove(id) {
      if (!confirm("Supprimer ce client ?")) return
      await deleteDoc(doc(db, "clients", id))
      this.load()
    }
  },
  mounted() {
    this.load()
  }
}
</script>
<style scoped>
/* ===== PAGE ===== */
.page {
  max-width: 1000px;
  margin: auto;
  padding: 16px;
}

.title {
  margin-bottom: 16px;
  text-align: center;
  font-size: clamp(1.3rem, 4vw, 1.8rem);
}

/* ===== CARD ===== */
.card {
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ===== FORM ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  /* padding: 10px; */
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 10px 0;
  width: 100%;
  font-size: 1rem;
}

/* ===== BOUTONS ===== */
.btn {
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #ddd;
  font-size: 1rem;
}

.primary {
  background: #3b82f6;
  color: white;
}

.danger {
  background: #ef4444;
  color: white;
  border-radius: 6px;
  padding: 6px 10px;
  border: none;
}

/* ===== PRODUIT ===== */
.product .header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.product .info {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 0.9rem;
  color: #555;
}

.stocks {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #555;
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
  border-top-color: #F2994A;
  border-bottom-color: #F2994A;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== ANIMATIONS ===== */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== TABLETTE & + ===== */
@media (min-width: 768px) {
  .form {
    flex-direction: row;
  }

  .form input {
    flex: 1;
  }

  .form .btn {
    width: auto;
  }

  .product .header {
    align-items: center;
  }

  .product .info {
    flex-direction: row;
    gap: 8px;
  }
}
</style>