export interface ItemPrice {
  id: number
  itemId: number
  menuId: number
  price: number
  delete: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: number
  updatedBy?: number
}