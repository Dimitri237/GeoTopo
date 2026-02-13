<template>
  <div class="page">
    <h2 class="title">📊 Dashboard</h2>

    <!-- 🔐 MESSAGE AGENT -->
    <div v-if="role !== 'admin'" class="card info">
      <strong>Accès agent</strong>
      <p>Vous pouvez consulter l’état du matériel et les alertes.</p>
    </div>

    <!-- ================= FINANCES (ADMIN) ================= -->
    <div v-if="role === 'admin'" class="stats">
      <div class="stat-card green">
        <strong>{{ finance.encaisse }}</strong>
        <span>Encaissements</span>
      </div>

      <div class="stat-card yellow">
        <strong>{{ finance.nonSolde }}</strong>
        <span>Non soldées</span>
      </div>

      <div class="stat-card red">
        <strong>{{ finance.dettes }}</strong>
        <span>Dettes</span>
      </div>
    </div>

    <!-- ================= ALERTES ================= -->
    <div class="card" v-if="lateRentals.length">
      <h3>🚨 Matériel non rendu</h3>

      <div v-for="r in lateRentals" :key="r.id" class="alert-row">
        <div>
          <strong>{{ r.clientName }}</strong>
          <div class="meta">
            {{ r.items.length }} matériel(s) —
            {{ daysLate(r) }} jours
          </div>
        </div>

        <span class="badge debt">EN RETARD</span>
      </div>
    </div>

    <!-- ================= GRAPHIQUES ================= -->
    <div class="card">
      <h3>📈 Matériel le plus loué</h3>

      <div v-for="(m, i) in mostRented" :key="i" class="chart-row">
        <span>{{ m.name }}</span>
        <strong>{{ m.count }}</strong>
      </div>
    </div>

    <!-- ================= TABLEAU MATERIEL ================= -->
    <div class="card">
      <h3>📦 État du matériel</h3>

      <div class="material-table">
        <div
          v-for="p in products"
          :key="p.id"
          class="material-row"
          :class="p.status"
        >
          <div>
            <strong>{{ p.name }}-{{ p.numberApp }}</strong>
            <small>{{ p.price }} FCFA / jour</small>
          </div>

          <span v-if="p.status === 'disponible'" class="badge paid">Disponible</span>
          <span v-else-if="p.status === 'reserve'" class="badge pending">Réservé</span>
          <span v-else class="badge debt">Sorti</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from "../firebase"
import {
  collection,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore"

export default {
  data() {
    return {
      products: [],
      rentals: [],
      role: "agent"
    }
  },

  computed: {
    finance() {
      const encaisse = this.rentals
        .filter(r => r.paymentStatus === "soldé")
        .reduce((s, r) => s + r.total, 0)

      const dettes = this.rentals
        .filter(r => r.paymentStatus === "dette")
        .reduce((s, r) => s + r.total, 0)

      const nonSolde = this.rentals.filter(
        r => r.paymentStatus === "NonSoldé"
      ).length

      return { encaisse, dettes, nonSolde }
    },

    lateRentals() {
      const now = Date.now()
      const limit = 3 * 24 * 60 * 60 * 1000

      return this.rentals.filter(
        r =>
          r.status === "sortie" &&
          r.createdAt?.seconds &&
          now - r.createdAt.seconds * 1000 > limit
      )
    },

    mostRented() {
      const map = {}

      this.rentals.forEach(r => {
        r.items.forEach(i => {
          map[i.productName] = (map[i.productName] || 0) + 1
        })
      })

      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  },

  methods: {
    daysLate(r) {
      return Math.floor(
        (Date.now() - r.createdAt.seconds * 1000) /
        (1000 * 60 * 60 * 24)
      )
    },

    async loadRole() {
      if (!auth.currentUser) return
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid))
      if (snap.exists()) this.role = snap.data().role
    }
  },

  mounted() {
    this.loadRole()

    onSnapshot(collection(db, "products"), snap => {
      this.products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })

    onSnapshot(collection(db, "rentals"), snap => {
      this.rentals = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }
}
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: auto;
  padding: 16px;
}

.title {
  text-align: center;
  margin-bottom: 18px;
}

/* ===== STATS ===== */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 14px;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,.08);
}

.stat-card strong {
  font-size: 1.6rem;
  display: block;
}

.green { border-top: 6px solid #22c55e; }
.yellow { border-top: 6px solid #facc15; }
.red { border-top: 6px solid #ef4444; }

/* ===== ALERTES ===== */
.alert-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.alert-row:last-child {
  border-bottom: none;
}

/* ===== CHART ===== */
.chart-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.chart-row:last-child {
  border-bottom: none;
}

/* ===== TABLE MATERIEL ===== */
.material-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.material-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 12px 14px;
  border-radius: 12px;
}

.material-row.disponible { border-left: 6px solid #22c55e; }
.material-row.reserve { border-left: 6px solid #facc15; }
.material-row.sortie { border-left: 6px solid #ef4444; }

/* ===== BADGES ===== */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge.paid { background: #22c55e; color: white; }
.badge.pending { background: #facc15; color: #333; }
.badge.debt { background: #ef4444; color: white; }

/* ===== INFO ===== */
.info {
  background: #f1f5f9;
  text-align: center;
}

/* ===== MOBILE ===== */
@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .material-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
