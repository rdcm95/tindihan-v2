const API_BASE = 'https://tindahan-worker.nudge4479.workers.dev/api'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')
  
  if (path === '/dashboard' || path.startsWith('/reports/dashboard')) {
    return handleDashboard(request, url)
  }
  if (path === '/products') return handleProducts(request)
  if (path === '/categories') return handleCategories(request)
  if (path === '/orders') return handleOrders(request)
  if (path.startsWith('/reports/daily')) return handleDailyReport(request, url)
  if (path.startsWith('/reports/monthly')) return handleMonthlyReport(request, url)
  if (path === '/cash-journal') return handleCashJournal(request)
  if (path === '/month-end' && request.method === 'GET') return handleMonthEndHistory(request)
  if (path === '/month-end' && request.method === 'POST') return handleMonthEndSubmit(request)
  if (path === '/deposits') return handleDeposits(request)
  if (path === '/settings') return handleSettings(request)
  
  // Product sub-routes
  if (path.match(/^\/products\/\d+\/restock$)) return handleRestock(request)
  if (path.match(/^\/products\/\d+$)) return handleProduct(request)
  
  // Proxy everything else to old worker during build
  const target = `${API_BASE}${path}${url.search}`
  return fetch(target, request)
}
