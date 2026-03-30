import { useState, useEffect } from "react"
import { getMonthEndList, createMonthEnd } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"

export default function MonthEnd() {
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    getMonthEndList().then(data => { setRecords(data.records || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (data) => {
    await createMonthEnd(data)
    setShowForm(false); load()
  }

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--text)]">Month-End Count</h1>
        <button
          onClick={() => setShowForm(true)}
          className="nb-btn text-xs px-3 py-1.5 rounded-lg"
          style={{background:"var(--accent)", color:"#fff"}}
        >
          + New
        </button>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center py-8 text-[var(--text-3)]">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-3)]">No records yet</p>
        ) : (
          records.map(r => (
            <div key={r.id} className="rounded-[10px] nb-border p-4" style={{background:"var(--bg-2)"}}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{r.period_label}</p>
                  <p className="text-xs text-[var(--text-3)]">{formatDate(r.closed_at)}</p>
                </div>
                <span className="text-xs font-mono font-semibold" style={{color: r.is_closed ? "var(--success)" : "var(--warning)"}}>
                  {r.is_closed ? "Closed" : "Open"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border)]">
                <div>
                  <p className="text-xs text-[var(--text-3)]">Cash</p>
                  <p className="text-sm font-mono font-semibold text-[var(--text)]">{formatCurrency(r.cash_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-3)]">Sales</p>
                  <p className="text-sm font-mono font-semibold text-[var(--text)]">{formatCurrency(r.total_sales)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <MonthEndForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}

function MonthEndForm({ onSave, onClose }) {
  const [periodLabel, setPeriodLabel] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        period_label: periodLabel,
        cash_amount: parseFloat(cashAmount) || 0,
      })
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{background:"rgba(0,0,0,0.5)"}}>
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style={{background:"var(--bg)", maxHeight:"90vh", overflowY:"auto"}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">New Month-End</h2>
          <button onClick={onClose} className="text-sm text-[var(--text-3)]">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Period Label</label>
            <input className="nb-input" value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} placeholder="e.g. March 2026" required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Cash Counted</label>
            <input className="nb-input" type="number" step="0.01" value={cashAmount} onChange={e => setCashAmount(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full nb-btn nb-btn-accent py-3 rounded-[10px]">
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}
