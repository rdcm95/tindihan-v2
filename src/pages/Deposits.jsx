import { useState, useEffect } from "react"
import { getDeposits, createDeposit, updateDeposit, deleteDeposit } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { PlusIcon, TrashIcon, EditIcon } from "../components/ui/Icons"

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editDeposit, setEditDeposit] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    getDeposits().then(data => { setDeposits(data.deposits || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    if (editDeposit) await updateDeposit(editDeposit.id, data)
    else await createDeposit(data)
    setShowForm(false); setEditDeposit(null); load()
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this deposit?")) return
    await deleteDeposit(id); load()
  }

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--text)]">Customer Deposits</h1>
        <button
          onClick={() => { setEditDeposit(null); setShowForm(true) }}
          className="nb-btn text-xs px-3 py-1.5 rounded-lg"
          style={{background:"var(--accent)", color:"#fff"}}
        >
          <PlusIcon size={12} /> Add
        </button>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center py-8 text-[var(--text-3)]">Loading...</p>
        ) : deposits.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-3)]">No deposits yet</p>
        ) : (
          deposits.map(d => (
            <div key={d.id} className="rounded-[10px] nb-border p-4" style={{background:"var(--bg-2)"}}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{d.customer_name}</p>
                  <p className="text-xs text-[var(--text-3)]">{formatDate(d.deposit_date)}</p>
                </div>
                <p className="text-sm font-mono font-semibold text-[var(--accent)]">{formatCurrency(d.amount)}</p>
              </div>
              {d.notes && <p className="text-xs text-[var(--text-3)] mb-2">{d.notes}</p>}
              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => { setEditDeposit(d); setShowForm(true) }}
                  className="flex-1 py-1.5 rounded nb-border text-xs"
                  style={{background:"var(--bg-3)"}}
                >
                  <EditIcon size={10} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="flex-1 py-1.5 rounded nb-border text-xs"
                  style={{background:"var(--bg-3)"}}
                >
                  <TrashIcon size={10} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <DepositForm
          deposit={editDeposit}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditDeposit(null) }}
        />
      )}
    </div>
  )
}

function DepositForm({ deposit, onSave, onClose }) {
  const [form, setForm] = useState({
    customer_name: deposit?.customer_name || "",
    amount: deposit?.amount || "",
    deposit_date: deposit?.deposit_date || new Date().toISOString().split("T")[0],
    notes: deposit?.notes || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave({ ...form, amount: parseFloat(form.amount) }) }
    catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{background:"rgba(0,0,0,0.5)"}}>
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style={{background:"var(--bg)", maxHeight:"90vh", overflowY:"auto"}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">{deposit ? "Edit Deposit" : "Add Deposit"}</h2>
          <button onClick={onClose} className="text-sm text-[var(--text-3)]">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Customer Name</label>
            <input className="nb-input" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="e.g. Juan dela Cruz" required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Amount</label>
            <input className="nb-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Date</label>
            <input className="nb-input" type="date" value={form.deposit_date} onChange={e => setForm({...form, deposit_date: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Notes</label>
            <input className="nb-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional" />
          </div>
          <button type="submit" disabled={loading} className="w-full nb-btn nb-btn-accent py-3 rounded-[10px]">
            {loading ? "Saving..." : "Save Deposit"}
          </button>
        </form>
      </div>
    </div>
  )
}
