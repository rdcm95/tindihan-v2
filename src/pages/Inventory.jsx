import { useState, useEffect } from "react"
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "../lib/api"
import { formatCurrency } from "../lib/utils"
import { EditIcon, TrashIcon, PlusIcon, AlertIcon } from "../components/ui/Icons"

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    if (filter === "low" && p.stock_quantity > p.low_stock_threshold) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSave = async (data) => {
    if (editProduct) await updateProduct(editProduct.id, data)
    else await createProduct(data)
    setShowForm(false); setEditProduct(null); load()
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return
    await deleteProduct(id); load()
  }

  const btnStyle = (active) => active
    ? {background:"var(--accent)", color:"#fff", borderColor:"var(--accent)"}
    : {background:"var(--bg-3)"}

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--text)]">Stock / Inventory</h1>
        <button onClick={() => { setEditProduct(null); setShowForm(true) }} className="nb-btn text-xs px-3 py-1.5 rounded-lg" style={{background:"var(--accent)", color:"#fff"}}>
          <PlusIcon size={12} /> Add
        </button>
      </header>
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <button onClick={() => setFilter("all")} className="px-3 py-1.5 text-xs font-semibold rounded-lg nb-border" style={btnStyle(filter==="all")}>All</button>
        <button onClick={() => setFilter("low")} className="px-3 py-1.5 text-xs font-semibold rounded-lg nb-border flex items-center gap-1" style={btnStyle(filter==="low")}>
          <AlertIcon size={10} style={{color: filter==="low" ? "#fff" : "var(--warning)"}} /> Low Stock
        </button>
        <input className="nb-input text-xs px-2 py-1.5 flex-1 h-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="px-4 pb-4">
        <div className="rounded-[10px] nb-border overflow-hidden" style={{background:"var(--bg-2)"}}>
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold border-b border-[var(--border)] text-[var(--text-3)]">
            <span className="col-span-4">Product</span>
            <span className="col-span-2 text-right">Cost</span>
            <span className="col-span-2 text-right">Sell</span>
            <span className="col-span-2 text-right">Stock</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {loading ? <p className="p-4 text-center text-sm text-[var(--text-3)]">Loading...</p> : filtered.length === 0 ? <p className="p-4 text-center text-sm text-[var(--text-3)]">No products</p> : filtered.map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center border-t border-[var(--border)]">
              <div className="col-span-4">
                <p className="text-sm font-medium truncate text-[var(--text)]">{p.name}</p>
                <p className="text-xs text-[var(--text-3)]">{p.category_name || "-"}</p>
              </div>
              <span className="col-span-2 text-right text-xs font-mono text-[var(--text-2)]">{formatCurrency(p.current_cost_price)}</span>
              <span className="col-span-2 text-right text-xs font-mono font-semibold text-[var(--text)]">{formatCurrency(p.current_sell_price)}</span>
              <span className="col-span-2 text-right text-xs font-mono" style={{color: p.stock_quantity <= p.low_stock_threshold ? "var(--error)" : "var(--text)"}}>
                {p.allow_decimal_quantity ? p.stock_quantity : Math.floor(p.stock_quantity)} {p.unit}
              </span>
              <div className="col-span-2 text-right flex gap-1 justify-end">
                <button onClick={() => { setEditProduct(p); setShowForm(true) }} className="p-1.5 rounded nb-border" style={{background:"var(--bg-3)"}}><EditIcon size={12} style={{color:"var(--text-2)"}} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded nb-border" style={{background:"var(--bg-3)"}}><TrashIcon size={12} style={{color:"var(--error)"}} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showForm && <ProductForm categories={categories} product={editProduct} onSave={handleSave} onClose={() => { setShowForm(false); setEditProduct(null) }} />}
    </div>
  )
}

function ProductForm({ categories, product, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || "",
    unit: product?.unit || "piece",
    current_cost_price: product?.current_cost_price || "",
    current_sell_price: product?.current_sell_price || "",
    stock_quantity: product?.stock_quantity || "0",
    low_stock_threshold: product?.low_stock_threshold || "5",
    allow_decimal_quantity: product?.allow_decimal_quantity || false,
    is_active: product?.is_active !== false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...form,
        current_cost_price: parseFloat(form.current_cost_price) || 0,
        current_sell_price: parseFloat(form.current_sell_price) || 0,
        stock_quantity: parseFloat(form.stock_quantity) || 0,
        low_stock_threshold: parseFloat(form.low_stock_threshold) || 0,
      })
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{background:"rgba(0,0,0,0.5)"}}>
      <div className="w-full max-w-lg rounded-t-2xl p-4 nb-border" style={{background:"var(--bg)", maxHeight:"90vh", overflowY:"auto"}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-sm text-[var(--text-3)]">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Product Name</label>
            <input className="nb-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Category</label>
              <select className="nb-input" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Unit</label>
              <input className="nb-input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="piece, kg, ml..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Cost Price</label>
              <input className="nb-input" type="number" step="0.01" value={form.current_cost_price} onChange={e => setForm({...form, current_cost_price: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Sell Price</label>
              <input className="nb-input" type="number" step="0.01" value={form.current_sell_price} onChange={e => setForm({...form, current_sell_price: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Current Stock</label>
              <input className="nb-input" type="number" step={form.allow_decimal_quantity ? "0.01" : "1"} value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block text-[var(--text-3)]">Low Stock Alert</label>
              <input className="nb-input" type="number" step="1" value={form.low_stock_threshold} onChange={e => setForm({...form, low_stock_threshold: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.allow_decimal_quantity} onChange={e => setForm({...form, allow_decimal_quantity: e.target.checked})} />
              <span className="text-[var(--text-2)]">Allow decimal qty</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
              <span className="text-[var(--text-2)]">Active</span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full nb-btn nb-btn-accent py-3 rounded-[10px]">{loading ? "Saving..." : "Save Product"}</button>
        </form>
      </div>
    </div>
  )
}
