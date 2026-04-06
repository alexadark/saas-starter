import { Link, Outlet } from "react-router";
import { APP_NAME } from "~/lib/constants";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold">
            {APP_NAME}
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
