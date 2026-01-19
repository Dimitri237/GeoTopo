import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import QRCode from "qrcode"
import logo from "../assets/logo2.png"

export async function printInvoiceDirect(
  sale,
  items = [],
  client,
  depot
) {
  // 🛡️ Sécurité
  if (!Array.isArray(items) || !items.length) {
    console.error("Aucun produit à imprimer", items)
    return
  }

  const doc = new jsPDF()

  /* ================= LOGO ================= */
  doc.addImage(logo, "PNG", 10, 10, 30, 30)

  /* ================= TITRE ================= */
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURE DE VENTE", 105, 20, { align: "center" })

  /* ================= INFOS ================= */
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  doc.text(`Dépôt : ${depot?.name || "Dépôt principal"}`, 14, 45)
  doc.text(`Client : ${client || "Client comptant"}`, 14, 52)
  doc.text(
    `Date : ${new Date().toLocaleDateString("fr-FR")}`,
    14,
    59
  )

  /* ================= TABLE ================= */
  autoTable(doc, {
    startY: 70,
    head: [["Produit", "Qté", "Prix", "Total"]],
    body: items.map(item => {
      const totalLigne = item.qty * item.price
      return [
        item.name,
        item.qty,
        `${item.price} FCFA`,
        `${totalLigne} FCFA`
      ]
    }),
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255
    },
    styles: {
      fontSize: 10
    }
  })

  /* ================= TOTAL ================= */
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`TOTAL : ${sale.total} FCFA`, 14, finalY)

  /* ================= REMARQUE ================= */
  if (sale.remark) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text(`Remarque : ${sale.remark}`, 14, finalY + 10)
  }

  /* ================= QR CODE ================= */
  const qr = await QRCode.toDataURL(`FACTURE:${sale.id}`)
  doc.addImage(qr, "PNG", 160, finalY - 10, 35, 35)

  /* ================= IMPRESSION ================= */
  const pdfBlob = doc.output("bloburl")
  const win = window.open(pdfBlob)

  if (win) {
    win.onload = () => {
      win.focus()
      win.print()
    }
  } else {
    doc.save(`facture-${sale.id}.pdf`)
    alert("Popup bloquée, la facture a été téléchargée.")
  }
}
