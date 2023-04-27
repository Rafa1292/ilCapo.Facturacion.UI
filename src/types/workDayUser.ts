import { Entry } from './entry'
import { Expense } from './expense'
import { Investment } from './investment'

export interface WorkDayUser {
  id: number
  workDayId: number
  userId: number
  initialCash: number
  finalCash: number
  sales: number
  diference: number
  expenses: Expense[]
  entries: Entry[]
  investments: Investment[]
  close: boolean
  delete: boolean,
  createdBy?: number
  updatedBy?: number
}
