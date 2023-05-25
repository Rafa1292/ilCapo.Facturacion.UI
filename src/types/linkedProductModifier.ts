import { LinkedProductModifierElement } from './linkedProductModifierElement'

export interface LinkedProductModifier {
  id: number
  linkedProductId: number
  elements: LinkedProductModifierElement[]
  minSelectable: number
  maxSelectable: number
  label: string
  quantity: number
  name: string
  modifierGroupId: number
  delete: boolean
  createdBy?: number
  updatedBy?: number
}