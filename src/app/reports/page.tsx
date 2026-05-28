import { Header } from '@/components/layout/Header'
import { ReportsClient } from '@/components/reports/ReportsClient'
import { getReportData } from '@/server/actions/reports'

export default async function ReportsPage() {
  const result = await getReportData('month')
  const data = result.success && result.data ? result.data : null

  return (
    <div>
      <Header
        title="Reportes"
        description="Análisis del rendimiento de tu negocio"
      />
      <div className="p-6">
        <ReportsClient initialData={data} />
      </div>
    </div>
  )
}
