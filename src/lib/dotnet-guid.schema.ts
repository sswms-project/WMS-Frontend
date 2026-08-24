import { z } from 'zod'

const DOTNET_GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function dotNetGuidSchema(message: string) {
  return z.string().regex(DOTNET_GUID_PATTERN, message)
}
