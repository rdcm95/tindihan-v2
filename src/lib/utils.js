export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

export function formatTime(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
}

export function getToday() {
  return new Date().toISOString().split("T")[0]
}

export function getCurrentMonth() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function getMonthName(month) {
  return new Date(2000, month - 1).toLocaleString("en-PH", { month: "long" })
}
