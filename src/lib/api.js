const API_BASE = import.meta.env.VITE_API_URL || "https://tindahan-worker.nudge4479.workers.dev/api"

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Products
export const getProducts = () => request("/products")
export const getProduct = (id) => request(`/products/${id}`)
export const createProduct = (data) => request("/products", { method: "POST", body: JSON.stringify(data) })
export const updateProduct = (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deleteProduct = (id) => request("/products/${id}", { method: "DELETE" })

// Categories
export const getCategories = () => request("/categories")
export const createCategory = (data) => request("/categories", { method: "POST", body: JSON.stringify(data) })
export const updateCategory = (id, data) => request("/categories/${id}", { method: "PUT", body: JSON.stringify(data) })
export const deleteCategory = (id) => request("/categories/${id}", { method: "DELETE" })

// Cart
export const getCart = () => request("/cart")
export const addToCart = (product_id, qty) => request("/cart/add", { method: "POST", body: JSON.stringify({ product_id, quantity: qty }) })
export const updateCartItem = (id, qty) => request(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity: qty }) })
export const removeFromCart = (id) => request(`/cart/${id}`, { method: "DELETE" })
export const clearCart = () => request("/cart/clear", { method: "DELETE" })
export const checkout = (payment) => request("/orders", { method: "POST", body: JSON.stringify(payment) })

// Orders
export const getOrders = (params) => request("/orders" + (params ? "?" + new URLSearchParams(params) : ""))
export const getOrder = (id) => request("/orders/" + id)
export const updateOrder = (id, data) => request("/orders/" + id, { method: "PUT", body: JSON.stringify(data) })

// Dashboard
export const getDashboard = (date) => request("/reports/dashboard" + (date ? "?date=" + date : ""))
export const getDailyReport = (date) => request("/reports/daily?date=" + date)

// Cash Journal
export const getCashJournal = () => request("/cash-journal")
export const addCashEntry = (data) => request("/cash-journal", { method: "POST", body: JSON.stringify(data) })
export const updateCashEntry = (id, data) => request("/cash-journal/" + id, { method: "PUT", body: JSON.stringify(data) })
export const deleteCashEntry = (id) => request("/cash-journal/" + id, { method: "DELETE" })

// Month-End
export const getMonthEndList = () => request("/month-end")
export const createMonthEnd = (data) => request("/month-end", { method: "POST", body: JSON.stringify(data) })

// Deposits
export const getDeposits = () => request("/deposits")
export const createDeposit = (data) => request("/deposits", { method: "POST", body: JSON.stringify(data) })
export const updateDeposit = (id, data) => request("/deposits/" + id, { method: "PUT", body: JSON.stringify(data) })
export const deleteDeposit = (id) => request("/deposits/" + id, { method: "DELETE" })

// Settings
export const getSettings = () => request("/settings")
export const saveSettings = (data) => request("/settings", { method: "PUT", body: JSON.stringify(data) })

// Stock Batches
export const getStockBatches = (productId) => request("/stock/batches/" + productId)
export const addStock = (data) => request("/stock/add", { method: "POST", body: JSON.stringify(data) })
