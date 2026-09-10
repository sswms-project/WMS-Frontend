import { PersonnelImportPage } from '@/features/staff/pages/PersonnelImportPage'

export default async function Page({
  searchParams,
}: {
  readonly searchParams: Promise<{ importId?: string }>
}) {
  const { importId } = await searchParams
  return <PersonnelImportPage initialImportId={importId} />
}
