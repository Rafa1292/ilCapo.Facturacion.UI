import { BillItemLinkedProduct } from './billItemLinkedProduct'

export interface BillItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  billId: number
  saleItemId: number
  kitchenMessage: boolean
  billProducts: BillItemLinkedProduct[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}