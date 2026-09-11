import { z } from 'zod'

const DOTNET_GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

export function dotNetGuidSchema(message: string) {
  return z.string().regex(DOTNET_GUID_PATTERN, message)
}

export function nonEmptyDotNetGuidSchema(message: string) {
  return dotNetGuidSchema(message).refine((value) => value.toLowerCase() !== EMPTY_GUID, message)
}
