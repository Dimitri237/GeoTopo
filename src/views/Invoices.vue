<template>
  <div>
    <h2>{{ ("invoices") }}</h2>

    <div v-for="f in invoices" :key="f.id" class="card">
      <p>Client : {{ f.client }}</p>
      <p>Total : {{ f.total }} FCFA</p>
      <p>Date : {{ formatDate(f.date) }}</p>
    </div>
  </div>
</template>

<script>
import { db } from "../firebase"
import { collection, getDocs } from "firebase/firestore"

export default {
  data() {
    return { invoices: [] }
  },
  methods: {
    async loadInvoices() {
      const snap = await getDocs(collection(db, "invoices"))
      this.invoices = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    },
    formatDate(d) {
      return d.toDate().toLocaleDateString()
    }
  },
  mounted() {
    this.loadInvoices()
  }
}
</script>
