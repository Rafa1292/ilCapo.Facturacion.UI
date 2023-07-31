import { ElementPrice } from './elementPrice'
import { ModifierElementUpgrade } from './modifierElementUpgrade'
import { ProductReference } from './productReference'

export interface ModifierElement {
  id: number
  name: string
  prices: ElementPrice[]
  price: number
  quantity: number
  selectedQuantity: number
  delete: boolean
  defaultRecipeId: number
  combinable: boolean
  numberOfParts: number
  combinableModifierGroupId: number
  productReference?: ProductReference
  modifierUpgrade: ModifierElementUpgrade
  modifierGroupId: number
  createdBy?: number
  updatedBy?: number
}