import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="bg-sidebar flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-sidebar-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-sidebar-foreground text-2xl font-bold">
            BaristaOS
          </h1>
          <p className="text-sidebar-muted mt-1 text-sm">Sistema de gestión</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
