import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getProducts, getCategories, getCart, addToCart, updateCartItem, removeFromCart, clearCart, checkout } from "../lib/api"
import { formatCurrency } from "../lib/utils"
import { CartIcon, TrashIcon, CheckIcon, ChevronRightIcon } from "../components/ui/Icons"

export default function NewOrder() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [orderSuccess, setOrderSuccess] = useState(null)

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getCart()])
      .then(([prods, cats, c]) => {
        setProducts(prods)
        setCategories(cats)
        setCart(c.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    if (!p.is_active) return false
    if (activeCategory && p.category_id !== activeCategory) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const cartTotal = cart.reduce((s, i) => s + i.quantity * (parseFloat(i.current_sell_price) || 0), 0)

  const handleAdd = async (product) => {
    const existing = cart.find(c => c.product_id === product.id)
    if (existing) {
      await updateCartItem(existing.id, existing.quantity + 1)
      setCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      const item = await addToCart(product.id, 1)
      setCart([...cart, { ...item, product_id: product.id }])
    }
  }

  const handleUpdateQty = async (item, qty) => {
    if (qty <= 0) { await handleRemove(item.id); return }
    await updateCartItem(item.id, qty)
    setCart(cart.map(c => c.id === item.id ? { ...c, quantity: qty } : c))
  }

  const handleRemove = async (id) => {
    await removeFromCart(id)
    setCart(cart.filter(c => c.id !== id))
  }

  const handleCheckout = async (payment) => {
    const order = await checkout(payment)
    setOrderSuccess(order)
    setCart([])
    setShowCheckout(false)
    setShowCart(false)
  }

  if (orderSuccess) {
    return (
      <div className="fade-up">
        <header className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-semibold text-[var(--text)]">Order Complete!</h1>
        </header>
        <div className="p-4 flex flex-col items-center justify-center" style={{minHeight:"60vh"}}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{background:"var(--success)"}}>
            <CheckIcon size={40} style={{color:"#fff"}} />
          </div>
          <p className="text-2xl font-bold mb-2" style={{fontFamily:"var(--font-mono)"}}>{formatCurrency(orderSuccess.total_price)}</p>
          <p className="text-sm mb-1 text-[var(--text-3)]">Order #{orderSuccess.id}</p>
          <p className="text-sm mb-6 text-[var(--text-3)]">Change: {formatCurrency(orderSuccess.change || 0)}</p>
          <button className="nb-btn nb-btn-accent px-6 py-3 rounded-[10px]" onClick={() => setOrderSuccess(null)}>New Order</button>
        </div>
      </div>
    )
  }

  if (showCheckout) {
    return <CheckoutPanel cart={cart} total={cartTotal} onBack={() => setShowCheckout(false)} onComplete={handleCheckout} />
  }

  if (showCart) {
    return <CartPanel cart={cart} total={cartTotal} onBack={() => setShowCart(false)} onCheckout={() => setShowCheckout(true)} onUpdateQty={handleUpdateQty} onRemove={handleRemove} />
  }

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--text)]">New Order</h1>
        <button
          onClick={() => setShowCart(true)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg"
          style={{background:"var(--bg-3)"}}
        >
          <CartIcon size={16} />
          {cart.length > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
              style={{background:"var(--accent)", color:"#fff", fontSize:"10px"}}
            >
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      <div className="px-4 pt-3 pb-2">
        <input
          className="nb-input text-sm rounded-lg"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="px-4 pb-2 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap nb-border"
            style={!activeCategory ? {background:"var(--accent)", color:"#fff", borderColor:"var(--accent)"} : {background:"var(--bg-3)"}}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap nb-border"
              style={activeCategory === c.id ? {background:"var(--accent)", color:"#fff", borderColor:"var(--accent)"} : {background:"var(--bg-3)"}}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        {loading ? (
          <p className="col-span-3 text-center py-8 text-[var(--text-3)]">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-3 text-center py-8 text-[var(--text-3)]">No products found</p>
        ) : (
          filtered.map(p => {
            const inCart = cart.find(c => c.product_id === p.id)
            return (
              <button
                key={p.id}
                onClick={() => handleAdd(p)}
                className="p-3 rounded-[10px] nb-border text-left relative"
                style={{background:"var(--bg-2)"}}
              >
                <p className="text-xs font-medium leading-tight truncate text-[var(--text)]">{p.name}</p>
                <p className="text-xs font-mono font-bold mt-1 text-[var(--accent)]">{formatCurrency(p.current_sell_price)}</p>
                <p className="text-xs mt-1 text-[var(--text-3)]">
                  {p.allow_decimal_quantity ? p.stock_quantity : Math.floor(p.stock_quantity)} {p.unit}
                </p>
                {inCart && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                    style={{background:"var(--accent)", color:"#fff", fontSize:"9px"}}
                  >
                    {inCart.quantity}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>

      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full nb-border nb-shadow flex items-center justify-center"
          style={{background:"var(--accent)", zIndex:40}}
        >
          <CartIcon size={22} style={{color:"#fff"}} />
        </button>
      )}
    </div>
  )
}

function CartPanel({ cart, total, onBack, onCheckout, onUpdateQty, onRemove }) {
  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <button onClick={onBack} className="text-sm text-[var(--accent)]">← Back</button>
        <h1 className="text-lg font-semibold text-[var(--text)]">Cart ({cart.length})</h1>
        <div />
      </header>
      <div className="p-4 space-y-2">
        {cart.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-3)]">Cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-[10px] nb-border" style={{background:"var(--bg-2)"}}>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text)]">{item.name}</p>
                <p className="text-xs font-mono text-[var(--accent)]">{formatCurrency(item.current_sell_price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQty(item, item.quantity - 1)}
                  className="w-7 h-7 rounded nb-border font-bold text-sm"
                  style={{background:"var(--bg-3)"}}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item, item.quantity + 1)}
                  className="w-7 h-7 rounded nb-border font-bold text-sm"
                  style={{background:"var(--bg-3)"}}
                >
                  +
                </button>
              </div>
              <button onClick={() => onRemove(item.id)}>
                <TrashIcon size={14} style={{color:"var(--error)"}} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-20 left-0 right-0 p-4" style={{background:"var(--bg)"}}>
        <div className="rounded-[10px] nb-border p-4 nb-shadow" style={{background:"var(--bg-2)"}}>
          <div className="flex justify-between mb-3">
            <span className="font-semibold text-[var(--text)]">Total</span>
            <span className="font-bold font-mono text-lg text-[var(--text)]">{formatCurrency(total)}</span>
          </div>
          <button onClick={onCheckout} className="w-full nb-btn nb-btn-accent py-3 rounded-[10px] text-sm font-semibold">
            Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckoutPanel({ cart, total, onBack, onComplete }) {
  const [payment, setPayment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const paymentVal = parseFloat(payment) || 0
  const change = paymentVal - total

  const handleSubmit = async () => {
    if (paymentVal < total) { setError("Insufficient payment"); return }
    setLoading(true)
    setError("")
    try { await onComplete({ payment: paymentVal }) } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const quickAmounts = [...new Set([total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000])].sort((a, b) => a - b)

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[var(--border)]">
        <button onClick={onBack} className="text-sm text-[var(--accent)]">← Back</button>
        <h1 className="text-lg font-semibold text-[var(--text)]">Checkout</h1>
        <div />
      </header>
      <div className="p-4 space-y-4">
        <div className="rounded-[10px] nb-border p-4 text-center" style={{background:"var(--bg-2)"}}>
          <p className="text-sm text-[var(--text-3)]">Total</p>
          <p className="text-3xl font-bold font-mono mt-1 text-[var(--text)]">{formatCurrency(total)}</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 text-[var(--text)]">Payment Received</p>
          <input
            className="nb-input text-2xl font-mono font-bold rounded-[10px] py-4"
            type="number"
            placeholder="0.00"
            value={payment}
            onChange={e => setPayment(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(a => (
            <button
              key={a}
              onClick={() => setPayment(a.toString())}
              className="px-4 py-2 rounded-lg nb-border text-sm font-mono"
              style={{background:"var(--bg-3)"}}
            >
              {formatCurrency(a)}
            </button>
          ))}
        </div>
        {change >= 0 && paymentVal > 0 && (
          <div className="rounded-[10px] nb-border p-4 text-center" style={{background:"var(--bg-2)", borderColor:"var(--success)"}}>
            <p className="text-sm text-[var(--success)]">Change</p>
            <p className="text-2xl font-bold font-mono text-[var(--success)]">{formatCurrency(change)}</p>
          </div>
        )}
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || !payment}
          className="w-full nb-btn nb-btn-accent py-4 rounded-[10px] font-semibold text-base disabled:opacity-50"
        >
          {loading ? "Processing..." : "Complete Sale"}
        </button>
      </div>
    </div>
  )
}
