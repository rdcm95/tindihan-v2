import { NavLink } from "react-router-dom"
import { HomeIcon, PlusIcon, CubeIcon, EllipsisIcon } from "../ui/Icons"

const NAV = [
  { path: "/", label: "Home", icon: HomeIcon },
  { path: "/new-order", label: "POS", icon: PlusIcon },
  { path: "/inventory", label: "Stock", icon: CubeIcon },
  { path: "/settings", label: "More", icon: EllipsisIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 nb-border-t" style="background:var(--bg);border-color:var(--border)">
      <div className="app-container flex justify-around items-center h-16">
        {NAV.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors " +
              (isActive ? "font-semibold" : "opacity-60")
            }
            style={({ isActive }) => ({ color: isActive ? "var(--accent)" : "var(--text-3)" })}
          >
            <Icon />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
