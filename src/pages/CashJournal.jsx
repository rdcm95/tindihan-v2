import { useState, useEffect } from "react"
import { getCashJournal, addCashEntry, updateCashEntry, deleteCashEntry } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { PlusIcon, TrashIcon, EditIcon } from "../components/ui/Icons"

export default function CashJournal() {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    getCashJournal().then(data => { setEntries(data.entries || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const balance = entries.reduce((s, e) => s + (e.type === "in" ? parseFloat(e.amount) : -parseFloat(e.amount)), 0)

  const handleSave = async (data) => {
    if (editEntry) await updateCashEntry(editEntry.id, data)
    else await addCashEntry(data)
    setShowForm(false); setEditEntry(null); load()
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return
    await deleteCashEntry(id); load()
  }

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--text)]">Cash Journal</h1>
        <button
          onClick={() => { setEditEntry(null); setShowForm(true) }}
          className="nb-btn text-xs px-3 py-1.5 rounded-lg"
          style={{background:"var(--accent)", color:"#fff"}}
        >
          <PlusIcon size={12} /> Add
        </button>
      </header>

      <div className="px-4 py-3">
        <div className="rounded-[10px] nb-border p-4 text-center" style={{background:"var(--bg-2)"}}>
          <p className="text-xs text-[var(--text-3)]">Running Balance</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{color: balance >= 0 ? "var(--success)" : "var(--error)"}}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {loading ? (
          <p className="text-center py-8 text-[var(--text-3)]">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-3)]">No entries yet</p>
        ) : (
          entries.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-[10px] nb-border" style={{background:"var(--bg-2)"}}>
              <div className="w-2 h-10 rounded-full" style={{background: e.type === "in" ? "var(--success)" : "var(--error)"}} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text)]">{e.description}</p>
                <p className="text-xs text-[var(--text-3)]">{formatDate(e.date)}</p>
              </div>
              <p className="text-sm font-mono font-semibold" style={{color: e.type === "in" ? "var(--success)" : "var(--error)"}}>
                {e.type === "in" ? "+" : "-"}{formatCurrency(e.amount)}
              </p>
              <button onClick={() => { setEditEntry(e); setShowForm(true) }} className="p-1.5 rounded nb-border" style={{background:"var(--bg-3)"}}>
                <EditIcon size={12} style={{color:"var(--text-2)"}} />
              </button>
              <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded nb-border" style={{background:"var(--bg-3)"}}>
                <TrashIcon size={12} style={{color:"var(--error)"}} />
              </button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <EntryForm
          entry={editEntry}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditEntry(null) }}
        />
      )}
    </div>
  )
}

function EntryForm({ entry, onSave, onClose }) {
  const [form, setForm] = useState({
    type: entry?.type || "in",
    amount: entry?.amount || "",
    description: entry?.description || "",
    date: entry?.date || new Date().toISOString().split("T")[0],
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
          <h2 className="text-lg font-semibold text-[var(--text)]">{entry ? "Edit Entry" : "Add Entry"}</h2>
          <button onClick={onClose} className="text-sm text-[var(--text-3)]">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            {["in", "out"].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({...form, type: t})}
                className="flex-1 py-2 rounded-lg nb-border text-sm font-semibold"
                style={form.type === t ? {background: t === "in" ? "var(--success)" : "var(--error)", color:"#fff", borderColor: t === "in" ? "var(--success)" : "var(--error)"} : {background:"var(--bg-3)"}}
              >
                {t === "in" ? "Cash In" : "Cash Out"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Amount</label>
            <input className="nb-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Description</label>
            <input className="nb-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Bank deposit, Withdraw..." required />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Date</label>
            <input className="nb-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <button type="submit" disabled={loading} className="w-full nb-btn nb-btn-accent py-3 rounded-[10px]">
            {loading ? "Saving..." : "Save Entry"}
          </button>
        </form>
      </div>
    </div>
  )
}
