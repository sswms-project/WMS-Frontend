export interface Setup2FAResponse {
  secret: string
  qrUri: string
}

export interface Confirm2FARequest {
  otp: string
}
