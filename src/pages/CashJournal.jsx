import { useState, useEffect } from "react"
import { getCashJournal, addCashEntry, updateCashEntry, deleteCashEntry } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { PlusIcon, TrashIcon, EditIcon } from "../components/ui/Icons"

export default function CashJournal() {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => { getCashJournal().then(e => { setEntries(e || []); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    if (editEntry) await updateCashEntry(editEntry.id, data)
    else await addCashEntry(data)
    setShowForm(false); setEditEntry(null); load()
  }
  const handleDelete = async (id) => { if (confirm("Delete?")) { await deleteCashEntry(id); load() } }

  const balance = entries.reduce((s, e) => e.entry_type === "in" ? s + parseFloat(e.amount) : s - parseFloat(e.amount), 0)

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">Cash Journal</h1>
        <button onClick={() => { setEditEntry(null); setShowForm(true) }} className="nb-btn text-xs px-3 py-1.5 rounded-lg" style="background:var(--accent);color:#fff"><PlusIcon size={12} /> Add</button>
      </header>

      {/* Balance */}
      <div className="px-4 pt-3">
        <div className="rounded-[10px] nb-border p-4" style="background:var(--bg-2)">
          <p className="text-xs font-medium" style="color:var(--text-3)">Cash on Hand</p>
          <p className="text-2xl font-bold font-mono mt-1" style={balance >= 0 ? "color:var(--success)" : "color:var(--error)"}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Entries */}
      <div className="p-4 space-y-2">
        {loading ? <p className="text-center py-8" style="color:var(--text-3)">Loading...</p> : entries.length === 0 ? <p className="text-center py-8" style="color:var(--text-3)">No entries</p> : entries.map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-[10px] nb-border" style="background:var(--bg-2)">
            <div className="flex-1">
              <p className="text-sm font-medium" style="color:var(--text)">{e.description}</p>
              <p className="text-xs" style="color:var(--text-3)">{formatDate(e.entry_date)}</p>
            </div>
            <span className="text-sm font-mono font-semibold" style={e.entry_type === "in" ? "color:var(--success)" : "color:var(--error)"}>{e.entry_type === "in" ? "+" : "−"}{formatCurrency(e.amount)}</span>
            <button onClick={() => { setEditEntry(e); setShowForm(true) }}><EditIcon size={12} style="color:var(--text-3)" /></button>
            <button onClick={() => handleDelete(e.id)}><TrashIcon size={12} style="color:var(--error)" /></button>
          </div>
        ))}
      </div>
      {showForm && <CashEntryForm entry={editEntry} onSave={handleSave} onClose={() => { setShowForm(false); setEditEntry(null) }} />}
    </div>
  )
}

function CashEntryForm({ entry, onSave, onClose }) {
  const [form, setForm] = useState({ description: entry?.description || "", amount: entry?.amount || "", entry_type: entry?.entry_type || "in", entry_date: entry?.entry_date || new Date().toISOString().split("T")[0] })
  const handleSubmit = async (e) => { e.preventDefault(); await onSave(form) }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style="background:rgba(0,0,0,0.5)">
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style="background:var(--bg)">
        <h2 className="text-lg font-semibold mb-4">{entry ? "Edit Entry" : "Add Entry"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({...form, entry_type: "in"})} className="flex-1 py-2 rounded-lg nb-border font-semibold text-sm" style={form.entry_type==="in" ? "background:var(--success);color:#fff;border-color:var(--success)" : "background:var(--bg-3)"}>Cash In</button>
            <button type="button" onClick={() => setForm({...form, entry_type: "out"})} className="flex-1 py-2 rounded-lg nb-border font-semibold text-sm" style={form.entry_type==="out" ? "background:var(--error);color:#fff;border-color:var(--error)" : "background:var(--bg-3)"}>Cash Out</button>
          </div>
          <input className="nb-input" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <input className="nb-input" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          <input className="nb-input" type="date" value={form.entry_date} onChange={e => setForm({...form, entry_date: e.target.value})} required />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 nb-btn py-3 rounded-[10px]" style="background:var(--bg-3)">Cancel</button>
            <button type="submit" className="flex-1 nb-btn nb-btn-accent py-3 rounded-[10px]">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}