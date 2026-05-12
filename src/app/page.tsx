import { Header } from '@/components/layout/Header'

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" description="Resumen general de tu negocio" />
      <div className="p-6">
        <p className="text-muted-foreground">Dashboard en construcción...</p>
      </div>
    </div>
  )
}
