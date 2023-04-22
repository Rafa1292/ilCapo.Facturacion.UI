import { Expense } from './expense'

export interface WorkDayUser {
  id: number
  workDayId: number
  userId: number
  initialCash: number
  finalCash: number
  sales: number
  diference: number
  expenses: Expense[]
  close: boolean
  delete: boolean,
  createdBy?: number
  updatedBy?: number
}
