import { SaleItem } from './saleItem'

export interface SaleItemCategory {
  id: number
  name: string
  saleItems: SaleItem[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}