// src/components/ui/Header.tsx
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full bg-surface px-4 py-2 flex justify-end space-x-4">
      <Link to="/help"        className="text-sm text-text-secondary hover:text-primary">Ayuda</Link>
      <Link to="/login"       className="text-sm text-text-primary hover:text-primary">Iniciar sesión</Link>
      <Link to="/register"    className="text-sm bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition">
        Registrarse
      </Link>
    </header>
  );
}
