import { AccountHistory } from './accountHistory'

export interface BillAccountHistory {
  id: number
  billId: number
  accountHistoryId: number
  accountHistory: AccountHistory
  delete: boolean
  createdBy?: number
  updatedBy?: number
}