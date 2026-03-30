import { useEffect } from "react"
import { Link } from "react-router-dom"
import { SunIcon, MoonIcon, ChevronRightIcon } from "../components/ui/Icons"

export default function Settings({ theme, onToggleTheme }) {
  const handleThemeToggle = () => { onToggleTheme() }

  const MENU = [
    { label: "Daily Report", path: "/reports", icon: "chart" },
    { label: "Cash Journal", path: "/cash-journal", icon: "peso" },
    { label: "Month-End Count", path: "/month-end", icon: "count" },
    { label: "Customer Deposits", path: "/deposits", icon: "deposit" },
  ]

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style="border-bottom:1px solid var(--border)">
        <h1 className="text-lg font-semibold">More</h1>
      </header>

      <div className="p-4 space-y-3">
        {/* Theme toggle */}
        <div className="rounded-[10px] nb-border p-4 flex items-center justify-between" style="background:var(--bg-2)">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            <div>
              <p className="text-sm font-semibold" style="color:var(--text)">Dark Mode</p>
              <p className="text-xs" style="color:var(--text-3)">{theme === "dark" ? "Neo-Brutalist Dark" : "Neo-Brutalist Light"}</p>
            </div>
          </div>
          <button onClick={handleThemeToggle} className="relative w-12 h-6 rounded-full nb-border transition-colors" style={theme === "dark" ? "background:#fff" : "background:var(--text)"}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={theme === "dark" ? "left-0.5;background:#000" : "right-0.5;background:#fff"} />
          </button>
        </div>

        {/* Menu items */}
        {[
          { label: "Daily Report", path: "/reports" },
          { label: "Cash Journal", path: "/cash-journal" },
          { label: "Month-End Count", path: "/month-end" },
          { label: "Customer Deposits", path: "/deposits" },
        ].map(item => (
          <Link key={item.path} to={item.path} className="flex items-center justify-between p-4 rounded-[10px] nb-border" style="background:var(--bg-2)">
            <span className="text-sm font-medium" style="color:var(--text)">{item.label}</span>
            <ChevronRightIcon style="color:var(--text-3)" />
          </Link>
        ))}
      </div>
    </div>
  )
}