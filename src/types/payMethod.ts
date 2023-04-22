import { AccountHistory } from './accountHistory'

export interface PayMethod {
  id: number
  name: string
  accountId: number
  active: boolean
  comision: number
  accountHistories: AccountHistory[]
  isPublic: boolean
  isSemiPublic: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}