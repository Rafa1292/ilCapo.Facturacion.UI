import { LinkedProductModifier } from './linkedProductModifier'

export interface LinkedProduct {
  id: number
  productId: number
  unitPrice: number
  name: string
  billItemLinkedProductId: number
  linkedProductModifiers: LinkedProductModifier[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}