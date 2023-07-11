import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'
import { Client } from './client'

export interface Bill {
  id: number
  close: boolean
  client: Client
  tableNumber: number
  deliveryMethod: number
  clientId: number
  addressId: number
  workDayUserIdOpen: number
  workDayUserIdClose: number
  commandTime: Date
  items: BillItem[]
  isCommanded: boolean
  isServed: boolean
  isNull: boolean
  billAccountHistories: BillAccountHistory[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
  createdAt: Date
  updatedAt: Date
}