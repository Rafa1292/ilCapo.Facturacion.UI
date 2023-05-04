import { ModifierElementUpgrade } from './modifierElementUpgrade'

export interface ModifierElement {
  id: number
  name: string
  price: number
  quantity: number
  delete: boolean
  defaultRecipeId: number
  combinable: boolean
  numberOfParts: number
  combinableModifierGroupId: number
  modifierUpgrade: ModifierElementUpgrade
  modifierGroupId: number
  createdBy?: number
  updatedBy?: number
}