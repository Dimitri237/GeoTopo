<template>
  <div class="page">
    <h2 class="title">📒 Comptabilité journalière</h2>

    <div v-if="Object.keys(grouped).length === 0" class="empty">
      Aucune opération enregistrée
    </div>

    <!-- ================= JOURNÉES ================= -->
    <div
      v-for="(day, date) in grouped"
      :key="date"
      class="day-card"
    >
      <div class="day-header">
        <h3>📅 {{ formatDate(date) }}</h3>
        <strong>{{ day.total }} FCFA</strong>
      </div>

      <!-- ================= OPERATIONS ================= -->
      <div
        v-for="op in day.operations"
        :key="op.id"
        class="op-row"
      >
        <div>
          <strong>{{ op.clientName }}</strong>
          <small>{{ op.total }} FCFA</small>
        </div>

        <span
          class="badge"
          :class="op.paymentStatus"
        >
          {{ op.paymentStatus }}
        </span>
      </div>

      <!-- ================= FOOTER ================= -->
      <div class="day-footer">
        <span>✔ Soldé : {{ day.solded }} FCFA</span>
        <span>❌ Dette : {{ day.debt }} FCFA</span>
      </div>
    </div>
  </div>
</template>
<script>
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

export default {
  data() {
    return {
      rentals: []
    }
  },

  computed: {
    grouped() {
      const map = {}

      this.rentals.forEach(r => {
        if (!r.soldedAt) return

        const dateKey = new Date(
          r.soldedAt.seconds * 1000
        ).toISOString().split("T")[0]

        if (!map[dateKey]) {
          map[dateKey] = {
            operations: [],
            total: 0,
            solded: 0,
            debt: 0
          }
        }

        map[dateKey].operations.push(r)
        map[dateKey].total += r.total

        if (r.paymentStatus === "soldé") {
          map[dateKey].solded += r.total
        }

        if (r.paymentStatus === "dette") {
          map[dateKey].debt += r.total
        }
      })

      // Trier par date décroissante
      return Object.fromEntries(
        Object.entries(map).sort(
          (a, b) => new Date(b[0]) - new Date(a[0])
        )
      )
    }
  },

  methods: {
    formatDate(d) {
      return new Date(d).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    }
  },

  mounted() {
    onSnapshot(collection(db, "rentals"), snap => {
      this.rentals = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    })
  }
}
</script>
<style scoped>
.page {
  max-width: 900px;
  margin: auto;
  padding: 16px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.day-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,.07);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.op-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.op-row:last-child {
  border-bottom: none;
}

.day-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-weight: 600;
}

/* BADGES */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: bold;
}

.badge.soldé {
  background: #22c55e;
  color: white;
}

.badge.dette {
  background: #ef4444;
  color: white;
}

.badge.NonSoldé {
  background: #facc15;
  color: #333;
}

.empty {
  text-align: center;
  opacity: .6;
}
</style>
