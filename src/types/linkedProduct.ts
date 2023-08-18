import { LinkedProductModifier } from './linkedProductModifier'

export interface LinkedProduct {
  id: number
  productId: number
  unitPrice: number
  name: string
  isCommanded: boolean
  needsCommand: boolean
  billProductId: number
  modifiers: LinkedProductModifier[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}