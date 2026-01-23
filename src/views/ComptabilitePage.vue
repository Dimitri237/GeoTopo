<template>
  <div class="page">
    <h2 class="title">📒 Comptabilité journalière</h2>

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
      <div v-for="op in day.operations" :key="op.id" class="op-row">
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
        <span>✔ Soldé : {{ day.solded }} FCFA</span>
        <span>❌ Dette : {{ day.debt }} FCFA</span>
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
import logo from "@/assets/logGT.png"
import jsPDF from "jspdf"

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
            total: 0,   // encaissé réel
            solded: 0,
            debt: 0
          }
        }

        map[dateKey].operations.push(r)

        if (r.paymentStatus === "soldé") {
          map[dateKey].total += r.total
          map[dateKey].solded += r.total
        }

        if (r.paymentStatus === "dette") {
          map[dateKey].debt += r.total
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
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  let y = 20

  const img = new Image()
  img.src = logo

  img.onload = () => {
    /* ============ LOGO ============ */
    pdf.addImage(img, "PNG", pageWidth / 2 - 20, y, 40, 20)
    y += 30

    /* ============ TITRE ============ */
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(18)
    pdf.text("COMPTABILITÉ JOURNALIÈRE", pageWidth / 2, y, { align: "center" })
    y += 10

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.text(`Date : ${this.formatDate(date)}`, pageWidth / 2, y, { align: "center" })
    y += 12

    pdf.setDrawColor(200)
    pdf.line(14, y, pageWidth - 14, y)
    y += 10

    /* ============ TABLE HEADER ============ */
    pdf.setFont("helvetica", "bold")
    pdf.text("Client", 16, y)
    pdf.text("Montant", 120, y)
    pdf.text("Statut", 160, y)
    y += 6

    pdf.setDrawColor(230)
    pdf.line(14, y, pageWidth - 14, y)
    y += 6

    /* ============ LIGNES ============ */
    pdf.setFont("helvetica", "normal")
    day.operations.forEach(op => {
      if (y > 270) {
        pdf.addPage()
        y = 20
      }

      pdf.text(op.clientName, 16, y)
      pdf.text(`${op.total} FCFA`, 120, y)
      pdf.text(this.labelStatus(op.paymentStatus), 160, y)
      y += 7
    })

    /* ============ TOTAUX ============ */
    y += 8
    pdf.setDrawColor(200)
    pdf.line(14, y, pageWidth - 14, y)
    y += 8

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text(`Total encaissé : ${day.solded} FCFA`, 16, y)
    y += 7
    pdf.text(`Total dette : ${day.debt} FCFA`, 16, y)

    /* ============ FOOTER ============ */
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(
      "GEOTOPO • Document comptable officiel",
      pageWidth / 2,
      290,
      { align: "center" }
    )

    pdf.save(`comptabilite-${date}.pdf`)
  }
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
