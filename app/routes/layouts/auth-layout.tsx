import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold">
            SaaS Starter
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
