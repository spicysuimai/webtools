import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">登录</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
