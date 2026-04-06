import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import { APP_NAME } from "~/lib/constants";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Built with React Router + Supabase
        </div>
      </footer>
    </div>
  );
}
