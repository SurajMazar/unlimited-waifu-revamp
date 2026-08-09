import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

export function NavBar() {
  const location = useLocation();
  const onUpscaler = location.pathname.startsWith('/upscaler');

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-3xl items-center justify-between rounded-full border border-border/70 bg-card/80 px-4 py-2 shadow-sm backdrop-blur-sm">
        <Link to="/" className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden>🌲</span>
          Quiet Forest
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant={onUpscaler ? 'ghost' : 'secondary'} size="sm">
            <Link to="/">Explore</Link>
          </Button>
          <Button asChild variant={onUpscaler ? 'secondary' : 'ghost'} size="sm">
            <Link to="/upscaler">Upscaler</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
