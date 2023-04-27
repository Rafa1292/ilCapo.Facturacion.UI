import { AccountHistory } from './accountHistory'

export interface InvestmentAccountHistory {
  id: number
  investmentId: number
  accountHistoryId: number
  accountHistory: AccountHistory
  delete: boolean
  createdBy?: number
  updatedBy?: number
}