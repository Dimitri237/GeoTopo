<template>
  <div class="page">
    <h2 class="title">📦 Locations de matériel</h2>

    <!-- FORMULAIRE -->
    <div class="card form">
      <select v-model="selectedClientId">
        <option disabled value="">-- Client --</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>

      <select v-model="selectedProductId">
        <option disabled value="">-- Produit --</option>
        <option v-for="p in products" :key="p.id" :value="p.id" :disabled="p.status !== 'disponible'">
          {{ p.name }}-{{ p.numberApp }} ({{ p.price }} FCFA)
        </option>
      </select>

      <button class="btn primary" @click="addToCart" :disabled="loading">
        Enregistrer
      </button>
    </div>

    <!-- PANIER -->
    <div v-if="cart.length" class="card">
      <h3>Produits réservés</h3>

      <div v-for="i in cart" :key="i.productId" class="cart-item">
        <div>
          <strong>{{ i.productName }}-{{ i.productNumber }}</strong>
          <div class="meta">
            {{ i.isFree ? "GRATUIT" : i.price + " FCFA" }}
          </div>
        </div>
        <button class="danger" @click="removeFromCart(i.productId)">❌</button>
      </div>

      <div class="total">
        Total : <strong>{{ rentalTotal }} FCFA</strong>
      </div>

      <button class="btn primary full" @click="saveRental" :disabled="loading">
        Valider location
      </button>
    </div>

    <!-- FILTRE -->
    <div class="card">
      <h3>Filtrer les locations</h3>
      <select v-model="statusFilter">
        <option value="all">📋 Toutes</option>
        <option value="reserve">📦 Réservées</option>
        <option value="sortie">🚚 Sorties</option>
        <option value="clos">✅ Rentrées</option>
      </select>
    </div>

    <!-- HISTORIQUE -->
    <div class="card">
      <h3>Historique des locations</h3>

      <div v-for="r in paginatedRentals" :key="r.id" class="entry">
        <div>
          <strong>{{ r.clientName }}</strong>
          <div class="meta">
            {{ formatDate(r.createdAt) }}

            <span v-if="r.paymentStatus === 'soldé'" class="badge paid">🟢 Soldé</span>

            <span v-else-if="r.paymentStatus === 'non_soldé'" class="badge pending">🟡 Non soldé</span>

            <span v-else class="badge debt">🔴 Dette</span>

            <span v-if="r.status === 'reserve'" class="badge pending">📦 Réservé</span>
            <span v-else-if="r.status === 'sortie'" class="badge debt">🚚 Sortie</span>
            <span v-else class="badge paid">✅ Rentré</span>
          </div>
        </div>

        <div class="actions">
          <button v-if="r.status === 'reserve'" class="btn primary" @click="markAsOut(r)">Sortir</button>
          <button v-if="r.status === 'sortie'" class="btn primary" @click="markAsReturned(r)">Retour</button>

          <button v-if="r.paymentStatus !== 'soldé'" class="btn primary" @click="markAsPaid(r)">Encaisser</button>

          <button v-if="r.paymentStatus === 'non_soldé'" class="btn danger" @click="markAsDebt(r)">Dette</button>

          <button class="btn" @click="openModal(r)">Détails</button>
        </div>
      </div>

      <div class="pagination" v-if="filteredRentals.length > pageSize">
        <button @click="prevPage" :disabled="currentPage === 1">⬅️</button>
        <span>Page {{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">➡️</button>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="modalRental" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Détails location</h3>

        <p><strong>Client :</strong> {{ modalRental.clientName }}</p>
        <p><strong>Date :</strong> {{ formatDate(modalRental.createdAt) }}</p>

        <hr />

        <div v-for="i in modalRental.items" :key="i.productId">
          {{ i.productName }}-{{ i.productNumber }} — {{ i.isFree ? "GRATUIT" : i.price + " FCFA" }}
        </div>

        <hr />
        <strong>Total : {{ modalRental.total }} FCFA</strong>

        <button class="btn primary full" @click="generateReceipt(modalRental, 58)">
          🧾 Ticket 58mm
        </button>

        <button class="btn full" @click="generateReceipt(modalRental, 80)">
          🖨️ Ticket 80mm
        </button>

        <button class="btn primary full" @click="closeModal">Fermer</button>
      </div>
    </div>

    <!-- REÇU THERMIQUE (HORS UI) -->
    <div v-if="modalRental" ref="receipt" class="thermal-receipt" :style="{ width: receiptWidth + 'px' }">
      <div class="center">
        <img style="width: 150px;" src="../assets/logGT.png" class="logo" />
        <!-- <h3>WS AUTO LOCATION</h3> -->
        <small>Location de matériel</small>
      </div>

      <hr />

      <p><strong>Client :</strong> {{ modalRental.clientName }}</p>
      <p><strong>Date :</strong> {{ formatDate(modalRental.createdAt) }}</p>

      <hr />

      <div v-for="i in modalRental.items" :key="i.productId" class="item">
        <span>{{ i.productName }}-{{ i.productNumber }}</span>
        <span>{{ i.isFree ? 0 : i.price }} FCFA</span>
      </div>

      <hr />
      <div class="total">TOTAL : {{ modalRental.total }} FCFA</div>

      <hr />

      <div class="signature">
        <p>GEOTOPO & PARTNERS</p>
        <img src="/signature.png" class="sign-img" />
      </div>

      <hr />

      <p class="center footer">
        Merci pour votre confiance 🙏<br />
        📞 +237 691 145 350
      </p>
    </div>
  </div>
</template>
<script>
import { db } from "../firebase"
import html2canvas from "html2canvas"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction
} from "firebase/firestore"

export default {
  data() {
    return {
      receiptWidth: 220,
      clients: [],
      products: [],
      rentals: [],
      cart: [],
      selectedClientId: "",
      selectedProductId: "",
      loading: false,
      modalRental: null,
      statusFilter: "all",
      currentPage: 1,
      pageSize: 5
    }
  },

  computed: {
    rentalTotal() {
      return this.cart.reduce((s, i) => s + (i.isFree ? 0 : i.price), 0)
    },
    filteredRentals() {
      if (this.statusFilter === "all") return this.rentals
      return this.rentals.filter(r => r.status === this.statusFilter)
    },
    totalPages() {
      return Math.ceil(this.filteredRentals.length / this.pageSize)
    },
    paginatedRentals() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRentals.slice(start, start + this.pageSize)
    }
  },

  watch: {
    statusFilter() {
      this.currentPage = 1
    }
  },

  methods: {
    async generateReceipt(rental, size = 58) {
      this.receiptWidth = size === 80 ? 300 : 220
      this.modalRental = rental
      await this.$nextTick()

      const canvas = await html2canvas(this.$refs.receipt, {
        scale: 2,
        backgroundColor: "#fff"
      })

      const link = document.createElement("a")
      link.download = `recu-${rental.clientName}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    },

    async load() {
      const c = await getDocs(collection(db, "clients"))
      this.clients = c.docs.map(d => ({ id: d.id, ...d.data() }))

      const p = await getDocs(collection(db, "products"))
      this.products = p.docs.map(d => ({ id: d.id, ...d.data() }))

      this.loadRentals()
    },

    async loadRentals() {
      const snap = await getDocs(collection(db, "rentals"))
      this.rentals = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    },

    addToCart() {
      if (!this.selectedClientId) return alert("Sélectionnez un client")
      const p = this.products.find(x => x.id === this.selectedProductId)
      if (!p || p.status !== "disponible") return
      if (this.cart.some(i => i.productId === p.id)) return

      this.cart.push({
        productId: p.id,
        productName: p.name,
        productNumber: p.numberApp,
        price: p.price,
        isFree: false
      })
      this.selectedProductId = ""
    },

    removeFromCart(id) {
      this.cart = this.cart.filter(i => i.productId !== id)
    },

    async saveRental() {
      if (!this.cart.length) return
      this.loading = true

      try {
        await runTransaction(db, async (t) => {

          /* =====================
             1️⃣ LECTURES D’ABORD
          ====================== */
          const productSnaps = []

          for (const i of this.cart) {
            const pRef = doc(db, "products", i.productId)
            const snap = await t.get(pRef)

            if (!snap.exists() || snap.data().status !== "disponible") {
              throw new Error("Produit indisponible")
            }

            productSnaps.push({ ref: pRef, snap })
          }

          /* =====================
             2️⃣ CALCUL & ITEMS
          ====================== */
          let total = 0
          const items = []

          for (const { snap } of productSnaps) {
            const price = snap.data().price
            total += price

            items.push({
              productId: snap.id,
              productName: snap.data().name,
              productNumber: snap.data().numberApp,
              price,
              isFree: false,
              status: "reserve"
            })
          }

          /* =====================
             3️⃣ ÉCRITURES APRÈS
          ====================== */
          for (const { ref } of productSnaps) {
            t.update(ref, { status: "reserve" })
          }

          const rentalRef = doc(collection(db, "rentals"))
          t.set(rentalRef, {
            clientId: this.selectedClientId,
            clientName: this.clients.find(c => c.id === this.selectedClientId).name,
            items,
            total,
            status: "reserve",
            paymentStatus: total === 0 ? "soldé" : "non_soldé",
            soldedAt: total === 0 ? serverTimestamp() : null,
            createdAt: serverTimestamp()
          })
        })

        this.cart = []
        this.selectedClientId = ""
        await this.load()

      } catch (e) {
        alert(e.message)
      } finally {
        this.loading = false
      }
    },

    async markAsOut(r) {
      for (const i of r.items)
        await updateDoc(doc(db, "products", i.productId), { status: "sortie" })
      await updateDoc(doc(db, "rentals", r.id), { status: "sortie" })
      this.load()
    },

    async markAsReturned(r) {
      for (const i of r.items)
        await updateDoc(doc(db, "products", i.productId), { status: "disponible" })
      await updateDoc(doc(db, "rentals", r.id), { status: "clos" })
      this.load()
    },

    async markAsPaid(r) {
      await updateDoc(doc(db, "rentals", r.id), {
        paymentStatus: "soldé",
        soldedAt: serverTimestamp()
      })
      this.loadRentals()
    },

    async markAsDebt(r) {
      await updateDoc(doc(db, "rentals", r.id), { paymentStatus: "dette" })
      this.loadRentals()
    },

    openModal(r) {
      this.modalRental = r
    },

    closeModal() {
      this.modalRental = null
    },

    formatDate(d) {
      return d?.seconds
        ? new Date(d.seconds * 1000).toLocaleDateString("fr-FR")
        : ""
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    }
  },

  mounted() {
    this.load()
  }
}
</script>



<style>
.receipt {
  position: absolute;
  left: -9999px;
  width: 350px;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: white;
  color: #111;
}

.receipt h2 {
  text-align: center;
  margin-bottom: 10px;
}

.receipt hr {
  margin: 10px 0;
}

.receipt .footer {
  margin-top: 14px;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.thermal-receipt {
  position: absolute;
  left: -9999px;
  background: white;
  color: #000;
  padding: 10px;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.center {
  text-align: center;
}

.logo {
  max-width: 80px;
  margin-bottom: 4px;
}

.item {
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
}

.total {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.signature {
  text-align: center;
}

.sign-img {
  max-width: 100px;
  margin-top: 6px;
}

.footer {
  font-size: 10px;
}

/* ================= PAGE ================= */
.page {
  max-width: 1100px;
  margin: auto;
  padding: 16px;
}

.title {
  margin-bottom: 20px;
  text-align: center;
  font-size: clamp(1.4rem, 4vw, 2rem);
}

/* ================= CARD ================= */
.card {
  background: #fff;
  padding: 16px;
  margin-bottom: 18px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ================= FORM ================= */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

select,
input,
textarea {
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
}

/* ================= BUTTONS ================= */
.btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #e5e7eb;
  font-size: 0.95rem;
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.primary {
  background: #3b82f6;
  color: white;
}

.primary:hover {
  background: #2563eb;
}

.danger {
  background: #ef4444;
  color: white;
}

.danger:hover {
  background: #dc2626;
}

.full {
  width: 100%;
  margin-top: 14px;
}

/* ================= PANIER ================= */
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item .meta {
  font-size: 0.9rem;
  color: #555;
}

.total {
  text-align: right;
  margin-top: 12px;
  font-size: 1.1rem;
}

/* ================= HISTORIQUE ================= */
.entry {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.entry:last-child {
  border-bottom: none;
}

.meta {
  font-size: 0.85rem;
  color: #555;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

/* ================= ACTIONS ================= */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ================= BADGES ================= */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge.paid {
  background: #22c55e;
  color: white;
}

.badge.pending {
  background: #facc15;
  color: #333;
}

.badge.debt {
  background: #ef4444;
  color: white;
}

/* ================= PAGINATION ================= */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.pagination button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ================= MODAL ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 22px;
  border-radius: 16px;
  width: 92%;
  max-width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-bottom: 10px;
}

.modal hr {
  margin: 12px 0;
  border: none;
  border-top: 1px solid #eee;
}

/* ================= LOADING ================= */
.loading-indicator {
  display: flex;
  justify-content: center;
}

.loading-indicator::after {
  content: "";
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #1e3a8a;
  border-top-color: #f59e0b;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= RESPONSIVE ================= */
@media (min-width: 768px) {
  .form {
    flex-direction: row;
  }

  .form select,
  .form input,
  .form textarea {
    flex: 1;
  }

  .entry {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .actions {
    justify-content: flex-end;
  }
}
</style>