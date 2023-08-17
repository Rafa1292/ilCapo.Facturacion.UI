import { ModifierGroup } from './modifierGroup'

export interface ProductModifier {
  id: number
  productId: number
  modifierGroupId: number
  modifierGroup: ModifierGroup
  order: number
  delete: boolean
  createdBy?: number
  updatedBy?: number
}