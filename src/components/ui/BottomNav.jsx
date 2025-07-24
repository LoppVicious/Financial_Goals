import { NavLink } from 'react-router-dom';
import { Home, List, PlusCircle, User } from 'lucide-react';

const items = [
  { to: '/',             icon: <Home size={24} />,        label: 'Home' },
  { to: '/goals',        icon: <List size={24} />,        label: 'Goals' },
  { to: '/goals/create', icon: <PlusCircle size={24} />,  label: 'Add' },
  { to: '/profile',      icon: <User size={24} />,        label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-surface border-t border-gray-700 flex justify-around py-2">
      {items.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-primary' : 'text-text-secondary'
            }`
          }
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
