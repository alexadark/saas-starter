import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layouts/public-layout.tsx", [index("routes/_index.tsx")]),
  layout("routes/layouts/auth-layout.tsx", [
    ...prefix("auth", [
      route("login", "routes/auth/login.tsx"),
      route("signup", "routes/auth/signup.tsx"),
      route("callback", "routes/auth/callback.tsx"),
      route("forgot-password", "routes/auth/forgot-password.tsx"),
      route("reset-password", "routes/auth/reset-password.tsx"),
      route("verify-email", "routes/auth/verify-email.tsx"),
    ]),
  ]),
  route("dashboard", "routes/dashboard/_index.tsx"),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
