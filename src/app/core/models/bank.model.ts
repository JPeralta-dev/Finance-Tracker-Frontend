export interface BankSummary {
  id: string
  name: string
  logoUrl: string | null
  domain: string | null
  countryCode: string
  isCustom: boolean
}

export interface Bank extends BankSummary {
  aliases: string[]
  createdBy: string | null
  createdAt: string
  updatedAt: string
}
