import { AccountHistory } from './accountHistory'

export interface ExpenseAccountHistory {
  id: number
  accountHistoryId: number
  expenseId: number
  accountHistory: AccountHistory
  delete: boolean
  createdBy?: number
  updatedBy?: number
}