import { ItemPrice } from './itemPrice'
import { SaleItemProduct } from './saleItemProduct'

export interface SaleItem {
  id: number
  name: string
  price: number
  prices: ItemPrice[]
  saleItemCategoryId: number
  description: string
  pictureUrl: string
  saleItemProducts: SaleItemProduct[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}