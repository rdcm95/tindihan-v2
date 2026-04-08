import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getDashboard } from "../lib/api"
import { formatCurrency, getToday } from "../lib/utils"
import { ChevronRightIcon, AlertIcon } from "../components/ui/Icons"

export default function Home() {
  const [data, setData] = useState(null)
  const today = getToday()

  useEffect(() => {
    getDashboard(today).then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="p-4 text-center text-[var(--text-3)]">Loading...</div>

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-[var(--border)]">
        <div>
          <p className="text-xs font-medium text-[var(--text-3)]">
            {new Date().toLocaleDateString("en-PH", {weekday:"short",month:"short",day:"numeric"})}
          </p>
          <h1 className="text-lg font-semibold mt-0.5 text-[var(--text)]">Tindahan</h1>
        </div>
        <Link to="/settings" className="w-8 h-8 flex items-center justify-center rounded-lg" style={{background:"var(--bg-3)", color:"var(--text-2)"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
      </header>
      <div className="p-4 space-y-3">
        <div className="rounded-[10px] nb-border p-4" style={{background:"var(--bg-2)"}}>
          <p className="text-xs font-medium text-[var(--text-3)]">Today's Sales</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text)]" style={{fontFamily:"var(--font-mono)"}}>{formatCurrency(data.today.total_sales)}</p>
          <p className="text-xs mt-1 text-[var(--text-3)]">{data.today.order_count} orders</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] nb-border p-3" style={{background:"var(--bg-2)"}}>
            <p className="text-xs font-medium text-[var(--text-3)]">This Month</p>
            <p className="text-lg font-bold mt-1 text-[var(--text)]" style={{fontFamily:"var(--font-mono)"}}>{formatCurrency(data.month.total_sales)}</p>
          </div>
          <div className="rounded-[10px] nb-border p-3" style={{background:"var(--bg-2)"}}>
            <p className="text-xs font-medium text-[var(--text-3)]">Profit</p>
            <p className="text-lg font-bold mt-1 text-[var(--success)]" style={{fontFamily:"var(--font-mono)"}}>{formatCurrency(data.month.profit || 0)}</p>
          </div>
        </div>
        {data.low_stock_alerts && data.low_stock_alerts.length > 0 && (
          <div className="rounded-[10px] nb-border p-4" style={{background:"var(--bg-2)", borderColor:"var(--warning)"}}>
            <div className="flex items-center gap-2 mb-2">
              <AlertIcon size={14} style={{color:"var(--warning)"}} />
              <p className="text-xs font-semibold text-[var(--warning)]">LOW STOCK</p>
            </div>
            {data.low_stock_alerts.slice(0, 3).map(a => (
              <div key={a.id} className="flex justify-between py-1 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--text)]">{a.name}</span>
                <span className="text-sm font-mono text-[var(--error)]">{a.stock_quantity} left</span>
              </div>
            ))}
            {data.low_stock_alerts.length > 3 && (
              <p className="text-xs mt-2 text-[var(--text-3)]">+{data.low_stock_alerts.length - 3} more items</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/new-order" className="nb-btn nb-btn-accent text-center text-sm py-3 rounded-[10px]">New Order</Link>
          <Link to="/inventory" className="nb-btn text-center text-sm py-3 rounded-[10px]" style={{background:"var(--bg-3)"}}>View Stock</Link>
        </div>
        <div className="rounded-[10px] nb-border p-4" style={{background:"var(--bg-2)"}}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-[var(--text)]">Recent Orders</p>
            <Link to="/reports" className="text-xs text-[var(--accent)]">View all</Link>
          </div>
          {data.recent_orders && data.recent_orders.length > 0 ? (
            data.recent_orders.map(o => (
              <Link key={o.id} to={"/order-detail/" + o.id} className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">#{o.id}</p>
                  <p className="text-xs text-[var(--text-3)]">{new Date(o.created_at).toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"})}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-[var(--text)]">{formatCurrency(o.total_price)}</span>
                  <ChevronRightIcon style={{color:"var(--text-3)"}} />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-center py-4 text-[var(--text-3)]">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
