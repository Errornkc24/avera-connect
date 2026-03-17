import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Header({ isOwner }: { isOwner: boolean }) {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight-display text-foreground">
          Avera
        </Link>
        <div className="flex items-center gap-4">
          {isOwner && (
            <Link
              to={location.pathname === '/admin' ? '/' : '/admin'}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Shield className="h-3.5 w-3.5" />
              {location.pathname === '/admin' ? 'Dashboard' : 'Admin'}
            </Link>
          )}
          {/* @ts-ignore */}
          <appkit-button />
        </div>
      </div>
    </header>
  );
}
