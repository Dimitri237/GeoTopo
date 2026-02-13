<template>
  <div class="page">
    <h2 class="title">🛒 Accessoirs</h2>

    <!-- ➕ AJOUT PRODUIT -->
    <div class="card form">
      <input v-model="name" placeholder="Nom" />
      <input v-model="typeP" placeholder="Accessoire" disabled="" />
      <input v-model="numberApp" placeholder="Numero" />
      <input v-model.number="price" type="number" min="0" placeholder="Prix de location" />
      <button class="btn primary" @click="add" :disabled="loading">

        <span class="loading-indicator" v-if="loading"></span>
        <span v-else>Ajouter</span>
      </button>
    </div>

    <!-- LISTE PRODUITS -->
    <transition-group name="list" tag="div">
      <div v-for="a in accessoirs" :key="a.id" class="card product">
        <div class="header">
          <div class="info">
            <strong>{{ a.name }}-{{ a.numberApp }}</strong>
            <span class="price">{{ a.price }} FCFA </span>
          </div>
          <button class="danger" @click="deleteAccessoir(a)">❌</button>
        </div>
      </div>

    </transition-group>
  </div>
</template>

<script>
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default {
  data() {
    return { 
      accessoirs: [],
       name: "", 
       typeP: "Accessoire", 
       status: "disponible", 
       numberApp: "", 
       loading: false, 
       price: 0 };
  },

  methods: {
    async load() {
      const snap = await getDocs(collection(db, "accessoirs"));
      this.accessoirs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async add() {
      this.loading = true;
      if (!this.name) return alert("Nom valides requis !");
      await addDoc(collection(db, "accessoirs"), {
        name: this.name,
        typeP: this.typeP,
        status: this.status,
        numberApp: this.numberApp,
        price: this.price,
        stocks: {}
      });
      this.loading = false;
      alert("Enregistrement reussi")
      this.name = "";
      this.typeP = "";
      this.numberApp = "";
      this.price = 0;
      this.load();
    },

    async deleteAccessoir(a) {
      if (!confirm(`Supprimer l'accessoir "${a.name}" ?`)) return;
      await deleteDoc(doc(db, "accessoirs", a.id));
      this.load();
    }
  },

  mounted() {
    this.load();
  }
};
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
select{
   border-radius: 8px;
  border: 1px solid #ccc;
  padding: 10px 0;
  font-size: 1rem;
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
