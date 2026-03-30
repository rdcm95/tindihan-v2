import { useState, useEffect } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import BottomNav from "./components/layout/BottomNav"
import { getSettings } from "./lib/api"
import Home from "./pages/Home"
import NewOrder from "./pages/NewOrder"
import Inventory from "./pages/Inventory"
import Reports from "./pages/Reports"
import CashJournal from "./pages/CashJournal"
import MonthEnd from "./pages/MonthEnd"
import Deposits from "./pages/Deposits"
import Settings from "./pages/Settings"
import OrderDetail from "./pages/OrderDetail"

export default function App() {
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    getSettings().then(s => {
      if (s.theme) setTheme(s.theme)
    }).catch(() => {})
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.dataset.theme = next
  }

  return (
    <HashRouter>
      <div className="app-container min-h-screen" data-theme={theme}>
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/cash-journal" element={<CashJournal />} />
            <Route path="/month-end" element={<MonthEnd />} />
            <Route path="/deposits" element={<Deposits />} />
            <Route path="/settings" element={<Settings theme={theme} onToggleTheme={toggleTheme} />} />
            <Route path="/order-detail/:id" element={<OrderDetail />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
