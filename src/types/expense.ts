import { ExpenseAccountHistory } from './expenseAccounntHistory'

export interface Expense {
  id: number
  amount: number
  isNull: boolean
  description: string
  providerId: number
  workDayUserId: number
  expenseAccountHistories: ExpenseAccountHistory[]
  pendingPay: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}