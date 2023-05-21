import { LinkedProduct } from './linkedProduct'

export interface BillItemLinkedProduct {
  id: number
  billItemId: number
  itemNumber: number
  linkedProducts: LinkedProduct[]
  combined: boolean
  isCommanded: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}