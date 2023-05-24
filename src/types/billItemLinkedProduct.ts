import { LinkedProduct } from './linkedProduct'

export interface BillItemLinkedProduct {
  id: number
  billItemId: number
  itemNumber: number
  products: LinkedProduct[]
  combined: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}