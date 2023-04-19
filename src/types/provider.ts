export interface Provider {
  id: number
  name: string
  phone: number
  fixedExpense: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}