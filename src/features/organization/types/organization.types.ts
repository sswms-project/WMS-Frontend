export interface OrganizationResponse {
  id: string
  tenantName: string
  email: string
  phone: string
  address: string | null
  defaultCurrency: string
  status: string
}
