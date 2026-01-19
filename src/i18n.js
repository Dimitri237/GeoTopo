import { createI18n } from "vue-i18n"

const messages = {
  fr: {
    sales: "Ventes",
    dashboard: "Tableau de bord"
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: "fr",
  messages
})
