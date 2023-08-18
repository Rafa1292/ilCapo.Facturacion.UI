import { ProductModifier } from './productModifier'

export interface Product {
  id: number
  name: string
  price?: number
  description: string
  pictureUrl: string
  allowsModify: boolean
  needsCommand: boolean
  productModifiers: ProductModifier[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}