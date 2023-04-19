import { PayMethod } from './payMethod'

export interface AccountHistory {
  id: number
  amount: number
  previousBalance: number
  currentBalance: number
  pay: boolean
  payMethodId: number
  payMethod: PayMethod
  delete: boolean
  createdBy?: number
  updatedBy?: number
}