import { useState, useEffect } from "react"
import { getDailyReport, getOrders } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { Link } from "react-router-dom"
import { ChevronRightIcon } from "../components/ui/Icons"

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [view, setView] = useState("summary") // summary | orders

  useEffect(() => {
    Promise.all([getDailyReport(date), getOrders({ date })])
      .then(([d, o]) => { setData(d); setOrders(o.orders || []) })
      .catch(console.error)
  }, [date])

  const prev = () => {
    const d = new Date(date); d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split("T")[0])
  }
  const next = () => {
    const d = new Date(date); d.setDate(d.getDate() + 1)
    if (d <= new Date()) setDate(d.toISOString().split("T")[0])
  }

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">Daily Report</h1>
      </header>

      {/* Date nav */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prev} className="px-3 py-1.5 rounded-lg nb-border text-sm" style="background:var(--bg-3)">← Prev</button>
        <span className="font-semibold text-sm">{formatDate(date)}</span>
        <button onClick={next} className="px-3 py-1.5 rounded-lg nb-border text-sm" style="background:var(--bg-3)">Next →</button>
      </div>

      {/* View toggle */}
      <div className="px-4 flex gap-2">
        <button onClick={() => setView("summary")} className="px-4 py-1.5 text-xs font-semibold rounded-lg nb-border" style={view==="summary" ? "background:var(--accent);color:#fff;border-color:var(--accent)" : "background:var(--bg-3)"}>Summary</button>
        <button onClick={() => setView("orders")} className="px-4 py-1.5 text-xs font-semibold rounded-lg nb-border" style={view==="orders" ? "background:var(--accent);color:#fff;border-color:var(--accent)" : "background:var(--bg-3)"}>Orders ({orders.length})</button>
      </div>

      {!data ? <p className="p-4 text-center" style="color:var(--text-3)">Loading...</p> : view === "summary" ? (
        <div className="p-4 space-y-3">
          <div className="rounded-[10px] nb-border p-4" style="background:var(--bg-2)">
            <p className="text-xs font-medium" style="color:var(--text-3)">Total Sales</p>
            <p className="text-2xl font-bold font-mono mt-1">{formatCurrency(data.total_sales)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] nb-border p-3" style="background:var(--bg-2)">
              <p className="text-xs" style="color:var(--text-3)">Orders</p>
              <p className="text-lg font-bold font-mono">{data.order_count}</p>
            </div>
            <div className="rounded-[10px] nb-border p-3" style="background:var(--bg-2)">
              <p className="text-xs" style="color:var(--text-3)">Profit</p>
              <p className="text-lg font-bold font-mono" style="color:var(--success)">{formatCurrency(data.profit)}</p>
            </div>
          </div>
          {data.items && data.items.length > 0 && (
            <div className="rounded-[10px] nb-border overflow-hidden" style="background:var(--bg-2)">
              <p className="text-xs font-semibold px-3 py-2" style="border-bottom:1px solid var(--border);color:var(--text-3)">Items Sold</p>
              {data.items.map((item, i) => (
                <div key={i} className="flex justify-between px-3 py-2" style="border-top:1px solid var(--border)">
                  <span className="text-sm" style="color:var(--text)">{item.name}</span>
                  <span className="text-sm font-mono" style="color:var(--text-2)">x{item.quantity_sold}</span>
                  <span className="text-sm font-mono" style="color:var(--text)">{formatCurrency(item.quantity_sold * item.sell_price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {orders.length === 0 ? <p className="text-center py-8" style="color:var(--text-3)">No orders</p> : orders.map(o => (
            <Link key={o.id} to={"/order-detail/" + o.id} className="flex justify-between items-center p-3 rounded-[10px] nb-border" style="background:var(--bg-2)">
              <div>
                <p className="text-sm font-semibold">#{o.id}</p>
                <p className="text-xs" style="color:var(--text-3)">{new Date(o.created_at).toLocaleTimeString("en-PH", {hour:"2-digit", minute:"2-digit"})}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{formatCurrency(o.total_price)}</span>
                <ChevronRightIcon style="color:var(--text-3)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}