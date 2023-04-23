import { AccountHistory } from './accountHistory'

export interface Entry {
  id: number
  description: string
  accountHistoryId: number
  workDayUserId: number
  accountHistory: AccountHistory
  delete: boolean
  createdBy?: number
  updatedBy?: number
}