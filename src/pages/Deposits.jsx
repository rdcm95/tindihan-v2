import { useState, useEffect } from "react"
import { getDeposits, createDeposit, updateDeposit, deleteDeposit } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { PlusIcon, EditIcon, TrashIcon } from "../components/ui/Icons"

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editDeposit, setEditDeposit] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => { getDeposits().then(d => { setDeposits(d||[]); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleSave = async (data) => { if (editDeposit) await updateDeposit(editDeposit.id, data); else await createDeposit(data); setShowForm(false); setEditDeposit(null); load() }
  const handleDelete = async (id) => { if (confirm("Delete?")) { await deleteDeposit(id); load() } }

  const totalHeld = deposits.filter(d => !d.is_returned).reduce((s, d) => s + parseFloat(d.amount), 0)
  const totalReturned = deposits.filter(d => d.is_returned).reduce((s, d) => s + parseFloat(d.amount), 0)

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">Customer Deposits</h1>
        <button onClick={() => { setEditDeposit(null); setShowForm(true) }} className="nb-btn text-xs px-3 py-1.5 rounded-lg" style="background:var(--accent);color:#fff"><PlusIcon size={12} /> Add</button>
      </header>

      <div className="px-4 pt-3 space-y-2">
        <div className="rounded-[10px] nb-border p-4" style="background:var(--bg-2)">
          <p className="text-xs font-medium" style="color:var(--text-3)">Total Held</p>
          <p className="text-2xl font-bold font-mono mt-1" style="color:var(--accent)">{formatCurrency(totalHeld)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] nb-border p-3" style="background:var(--bg-2)"><p className="text-xs" style="color:var(--text-3)">Active</p><p className="text-sm font-bold font-mono">{deposits.filter(d => !d.is_returned).length}</p></div>
          <div className="rounded-[10px] nb-border p-3" style="background:var(--bg-2)"><p className="text-xs" style="color:var(--text-3)">Returned</p><p className="text-sm font-bold font-mono" style="color:var(--success)">{formatCurrency(totalReturned)}</p></div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {loading ? <p className="text-center py-8" style="color:var(--text-3)">Loading...</p> : deposits.length === 0 ? <p className="text-center py-8 text-sm" style="color:var(--text-3)">No deposits</p> : deposits.map(d => (
          <div key={d.id} className="rounded-[10px] nb-border p-3" style="background:var(--bg-2)">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-semibold" style="color:var(--text)">{d.customer_name || "Anonymous"}</p><p className="text-xs mt-0.5" style="color:var(--text-3)">{d.note||"Deposit"} · {formatDate(d.deposit_date)}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold" style={d.is_returned?"color:var(--success)":"color:var(--accent)"}>{formatCurrency(d.amount)}</span>
                <button onClick={() => { setEditDeposit(d); setShowForm(true) }}><EditIcon size={12} style="color:var(--text-3)" /></button>
                <button onClick={() => handleDelete(d.id)}><TrashIcon size={12} style="color:var(--error)" /></button>
              </div>
            </div>
            {d.is_returned && <span className="text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full" style="background:var(--success);color:#fff;font-size:10px">RETURNED</span>}
          </div>
        ))}
      </div>
      {showForm && <DepositForm deposit={editDeposit} onSave={handleSave} onClose={() => { setShowForm(false); setEditDeposit(null) }} />}
    </div>
  )
}

function DepositForm({ deposit, onSave, onClose }) {
  const [form, setForm] = useState({ customer_name: deposit?.customer_name||"", amount: deposit?.amount||"", deposit_date: deposit?.deposit_date||new Date().toISOString().split("T")[0], note: deposit?.note||"", is_returned: deposit?.is_returned||false })
  const handleSubmit = async (e) => { e.preventDefault(); await onSave({...form, amount: parseFloat(form.amount)}) }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style="background:rgba(0,0,0,0.5)">
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style="background:var(--bg)">
        <h2 className="text-lg font-semibold mb-4">{deposit ? "Edit Deposit" : "New Deposit"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="nb-input" placeholder="Customer name (optional)" value={form.customer_name} onChange={e => setForm({...form,customer_name:e.target.value})} />
          <input className="nb-input" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} required />
          <input className="nb-input" type="date" value={form.deposit_date} onChange={e => setForm({...form,deposit_date:e.target.value})} required />
          <input className="nb-input" placeholder="Note (e.g. for bottle, container)" value={form.note} onChange={e => setForm({...form,note:e.target.value})} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_returned} onChange={e => setForm({...form,is_returned:e.target.checked})} /><span style="color:var(--text-2)">Returned to customer</span></label>
          <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 nb-btn py-3 rounded-[10px]" style="background:var(--bg-3)">Cancel</button><button type="submit" className="flex-1 nb-btn nb-btn-accent py-3 rounded-[10px]">Save</button></div>
        </form>
      </div>
    </div>
  )
}