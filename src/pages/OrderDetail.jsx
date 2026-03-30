import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getOrder } from "../lib/api"
import { formatCurrency, formatDate, formatTime } from "../lib/utils"

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id).then(o => { setOrder(o); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-4 text-center" style="color:var(--text-3)">Loading...</div>
  if (!order) return <div className="p-4 text-center" style="color:var(--text-3)">Order not found</div>

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">Order #{order.id}</h1>
      </header>

      <div className="p-4 space-y-3">
        <div className="rounded-[10px] nb-border p-4" style="background:var(--bg-2)">
          <p className="text-xs" style="color:var(--text-3)">{formatDate(order.created_at)} · {formatTime(order.created_at)}</p>
          <p className="text-2xl font-bold font-mono mt-1">{formatCurrency(order.total_price)}</p>
          <p className="text-xs mt-1" style="color:var(--text-3)">Payment: {formatCurrency(order.payment_received)} · Change: {formatCurrency(order.change || 0)}</p>
        </div>

        <div className="rounded-[10px] nb-border overflow-hidden" style="background:var(--bg-2)">
          <p className="text-xs font-semibold px-3 py-2" style="border-bottom:1px solid var(--border);color:var(--text-3)">Items</p>
          {order.items && order.items.map((item, i) => (
            <div key={i} className="flex justify-between px-3 py-2.5" style="border-top:1px solid var(--border)">
              <div>
                <p className="text-sm font-medium" style="color:var(--text)">{item.name}</p>
                <p className="text-xs" style="color:var(--text-3)">x{item.quantity} × {formatCurrency(item.unit_price)}</p>
              </div>
              <span className="text-sm font-mono font-semibold" style="color:var(--text)">{formatCurrency(item.quantity * item.unit_price)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}