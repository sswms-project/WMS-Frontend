import { TenantDetailsPage } from '@/features/admin/pages'

export default async function AdminTenantDetailsRoute(
  props: PageProps<'/admin/tenants/[tenantId]'>
) {
  const { tenantId } = await props.params
  return <TenantDetailsPage tenantId={tenantId} />
}
