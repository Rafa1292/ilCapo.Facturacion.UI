import { LinkedProductModifierElement } from './linkedProductModifierElement'

export interface LinkedProductModifier {
  id: number
  linkedProductId: number
  linkedProductModifierElements: LinkedProductModifierElement[]
  minSelectable: number
  maxSelectable: number
  label: string
  name: string
  quantity: number
  modifierGroupId: number
  delete: boolean
  createdBy?: number
  updatedBy?: number
}