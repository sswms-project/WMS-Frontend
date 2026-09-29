export interface OrganizationResponse {
  id: string
  tenantName: string
  email: string
  phone: string
  address: string | null
  taxCode: string | null
  website: string | null
  industry: string | null
  defaultCurrency: string
  status: string
}
