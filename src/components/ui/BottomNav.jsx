import { NavLink } from 'react-router-dom'
import { Home, List, PlusCircle, User } from 'lucide-react'

const items = [
  { to: '/',       icon: <Home />,         label: 'Home' },
  { to: '/goals',  icon: <List />,         label: 'Goals' },
  { to: '/goals/create', icon: <PlusCircle />, label: 'Add' },
  { to: '/profile', icon: <User />,         label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-surface border-t border-gray-700 flex justify-around py-2">
      {items.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className="flex flex-col items-center text-text-secondary hover:text-primary"
        >
          {icon}
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}