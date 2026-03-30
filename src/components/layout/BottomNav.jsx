import { NavLink } from "react-router-dom"
import { HomeIcon, PlusIcon, ChartIcon, PesoIcon } from "../ui/Icons"

export default function BottomNav() {
  const NAV = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/new-order", label: "New Order", icon: PlusIcon },
    { path: "/reports", label: "Reports", icon: ChartIcon },
    { path: "/cash-journal", label: "Journal", icon: PesoIcon },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 nb-border"
      style={{ background: "var(--bg)", borderTop: "2px solid var(--border)" }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs font-medium transition-colors ${
                isActive ? "text-[var(--accent)]" : "text-[var(--text-3)]"
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
