<template>
  <div class="page">
    <h2 class="title">📒 Comptabilité journalière</h2>
    <div class="search-box">
      <input type="date" v-model="searchDate" />

      <input type="text" v-model="searchClient" placeholder="🔎 Rechercher par client..." />
    </div>
    <div v-if="Object.keys(grouped).length === 0" class="empty">
      Aucune opération enregistrée
    </div>

    <!-- ================= JOURNÉES ================= -->
    <div v-for="(day, date) in grouped" :key="date" class="day-card">
      <div class="day-header">
        <h3>📅 {{ formatDate(date) }}</h3>
        <strong>{{ day.total }} FCFA</strong>
      </div>

      <!-- ================= OPERATIONS ================= -->
      <div v-for="op in day.sorties" :key="op.id" class="op-row">
        <div>
          <strong>{{ op.clientName }}</strong>
          <small>{{ op.total }} FCFA</small>
        </div>

        <span class="badge" :class="op.paymentStatus">
          {{ labelStatus(op.paymentStatus) }}
        </span>
      </div>

      <!-- ================= FOOTER ================= -->
      <div class="day-footer">
        <div>📦: {{ day.totalSorties }} FCFA</div>
        <div>✔: {{ day.solded }} FCFA</div>
        <div>🟡: {{ day.non_solded }} FCFA</div>
        <div>❌: {{ day.debt }} FCFA</div>
        <div>💰: {{ day.encaissements }} FCFA</div>
      </div>

      <!-- ================= EXPORT ================= -->
      <button class="btn export" @click="exportPDF(date, day)">
        📄 Export PDF
      </button>
    </div>
  </div>
</template>

<script>
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import jsPDF from "jspdf"

export default {
  data() {
    return {
      rentals: [],
      searchDate: "",
      searchClient: ""
    }
  },

  computed: {
    grouped() {
      const map = {}

      this.rentals.forEach(r => {

        /* =============================
           1️⃣ SORTIES DU JOUR
        ============================== */

        if (r.createdAt) {
          const createdDate = new Date(
            r.createdAt.seconds * 1000
          ).toISOString().split("T")[0]

          if (!map[createdDate]) {
            map[createdDate] = {
              sorties: [],
              totalSorties: 0,
              solded: 0,
              non_solded: 0,
              debt: 0,
              encaissements: 0
            }
          }

          map[createdDate].sorties.push(r)
          map[createdDate].totalSorties += r.total

          if (r.paymentStatus === "soldé")
            map[createdDate].solded += r.total

          if (r.paymentStatus === "non_soldé")
            map[createdDate].non_solded += r.total

          if (r.paymentStatus === "dette")
            map[createdDate].debt += r.total
        }

        /* =============================
           2️⃣ ENCAISSEMENTS DU JOUR
        ============================== */

        if (r.paymentStatus === "soldé" && r.soldedAt) {
          const soldedDate = new Date(
            r.soldedAt.seconds * 1000
          ).toISOString().split("T")[0]

          if (!map[soldedDate]) {
            map[soldedDate] = {
              sorties: [],
              totalSorties: 0,
              solded: 0,
              non_solded: 0,
              debt: 0,
              encaissements: 0
            }
          }

          map[soldedDate].encaissements += r.total
        }
      })

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
    },

    labelStatus(s) {
      if (s === "soldé") return "Soldé"
      if (s === "dette") return "Dette"
      return "En attente"
    },
    exportPDF(date, day) {
      const pdf = new jsPDF()
      let y = 20

      pdf.setFontSize(16)
      pdf.text("COMPTABILITÉ JOURNALIÈRE", 105, y, { align: "center" })
      y += 10

      pdf.setFontSize(11)
      pdf.text(`Date : ${this.formatDate(date)}`, 105, y, { align: "center" })
      y += 15

      pdf.setFontSize(12)

      day.sorties.forEach(op => {
        if (y > 270) {
          pdf.addPage()
          y = 20
        }

        pdf.text(`${op.clientName} - ${op.total} FCFA - ${this.labelStatus(op.paymentStatus)}`, 15, y)
        y += 8
      })

      y += 10
      pdf.text(`Total sorties : ${day.totalSorties} FCFA`, 15, y)
      y += 8
      pdf.text(`Total encaissé : ${day.encaissements} FCFA`, 15, y)
      y += 8
      pdf.text(`Total dette : ${day.debt} FCFA`, 15, y)

      pdf.save(`comptabilite-${date}.pdf`)
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, .07);
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
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
  display: block;
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

.badge.non_soldé {
  background: #facc15;
  color: #333;
}

.btn.export {
  margin-top: 12px;
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
}

.empty {
  text-align: center;
  opacity: .6;
}
</style>
