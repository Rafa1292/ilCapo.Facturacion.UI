import { Product } from './product'

export interface SaleItemProduct {
  id: number
  saleItemId: number
  productId: number
  quantity: number
  discount: number
  product: Product
  delete: boolean
  createdBy?: number
  updatedBy?: number
}