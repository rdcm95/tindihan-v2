import { useState, useEffect } from "react"
import { getMonthEndList, createMonthEnd, getProducts } from "../lib/api"
import { formatCurrency, formatDate, getMonthName } from "../lib/utils"

export default function MonthEnd() {
  const [records, setRecords] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([getMonthEndList(), getProducts()])
      .then(([r, p]) => { setRecords(r || []); setProducts(p); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">Month-End Count</h1>
        <button onClick={() => setShowForm(true)} className="nb-btn text-xs px-3 py-1.5 rounded-lg" style="background:var(--accent);color:#fff">+ New</button>
      </header>

      <div className="p-4 space-y-3">
        {loading ? <p className="text-center py-12" style="color:var(--text-3)">Loading...</p> : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style="color:var(--text-3)">No records yet</p>
          </div>
        ) : records.map(r => (
          <div key={r.id} className="rounded-[10px] nb-border p-4" style="background:var(--bg-2)">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold" style="color:var(--text)">{getMonthName(r.month)} {r.year}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style="background:var(--bg-3);color:var(--text-3)">{formatDate(r.count_date)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg" style="background:var(--bg)"><p className="text-xs" style="color:var(--text-3)">Products</p><p className="text-sm font-bold font-mono">{r.total_products || 0}</p></div>
              <div className="text-center p-2 rounded-lg" style="background:var(--bg)"><p className="text-xs" style="color:var(--text-3)">Items</p><p className="text-sm font-bold font-mono">{r.total_items?.toLocaleString() || 0}</p></div>
              <div className="text-center p-2 rounded-lg" style="background:var(--bg)"><p className="text-xs" style="color:var(--text-3)">Value</p><p className="text-sm font-bold font-mono" style="color:var(--accent)">{formatCurrency(r.total_value)}</p></div>
            </div>
          </div>
        ))}
      </div>
      {showForm && <MonthEndForm products={products} onSave={async (data) => { await createMonthEnd(data); setShowForm(false); load() }} onClose={() => setShowForm(false)} />}
    </div>
  )
}

function MonthEndForm({ products, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0]
  const current = new Date()
  const [form, setForm] = useState({ year: current.getFullYear(), month: current.getMonth() + 1, count_date: today, notes: "" })
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { const totalItems = Object.values(counts).reduce((s,v) => s+(parseFloat(v)||0), 0); const totalValue = products.reduce((s,p) => s+((parseFloat(counts[p.id])||0)*(parseFloat(p.current_cost_price)||0)), 0); await onSave({ ...form, counts, total_items: totalItems, total_value: totalValue, total_products: products.length }) } catch(err) { alert(err.message) } finally { setLoading(false) } }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style="background:rgba(0,0,0,0.5)">
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style="background:var(--bg);max-height:90vh;overflow-y:auto">
        <h2 className="text-lg font-semibold mb-4">New Month-End Count</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style="color:var(--text-3)">Year</label><input className="nb-input" type="number" value={form.year} onChange={e => setForm({...form,year:parseInt(e.target.value)})} required /></div>
            <div><label className="text-xs font-semibold mb-1 block" style="color:var(--text-3)">Month</label><input className="nb-input" type="number" min="1" max="12" value={form.month} onChange={e => setForm({...form,month:parseInt(e.target.value)})} required /></div>
            <div><label className="text-xs font-semibold mb-1 block" style="color:var(--text-3)">Date</label><input className="nb-input" type="date" value={form.count_date} onChange={e => setForm({...form,count_date:e.target.value})} required /></div>
          </div>
          <div><label className="text-xs font-semibold mb-1 block" style="color:var(--text-3)">Counts</label><div className="space-y-1 max-h-48 overflow-y-auto">{products.map(p => (<div key={p.id} className="flex items-center gap-2"><span className="text-xs flex-1 truncate" style="color:var(--text-2)">{p.name}</span><input className="nb-input w-20 text-xs py-1 text-right" type="number" step={p.allow_decimal_quantity?"0.01":"1"} placeholder="0" value={counts[p.id]||""} onChange={e => setCounts({...counts,[p.id]:e.target.value})} /></div>))}</div></div>
          <textarea className="nb-input text-xs" placeholder="Notes" rows="2" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
          <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 nb-btn py-3 rounded-[10px]" style="background:var(--bg-3)">Cancel</button><button type="submit" disabled={loading} className="flex-1 nb-btn nb-btn-accent py-3 rounded-[10px]">{loading?"Saving...":"Save Count"}</button></div>
        </form>
      </div>
    </div>
  )
}