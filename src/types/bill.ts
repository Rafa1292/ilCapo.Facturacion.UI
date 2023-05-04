import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'

export interface Bill {
  id: number
  close: boolean
  tableNumber: number
  deliveryMethod: number
  clientId: number
  addressId: number
  workDayUserId: number
  billItems: BillItem[]
  billAccountHistories: BillAccountHistory[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}