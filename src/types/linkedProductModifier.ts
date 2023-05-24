import { LinkedProductModifierElement } from './linkedProductModifierElement'

export interface LinkedProductModifier {
  id: number
  linkedProductId: number
  quantity: number
  elements: LinkedProductModifierElement[]
  minSelectable: number
  maxSelectable: number
  label: string
  name: string
  modifierGroupId: number
  delete: boolean
  createdBy?: number
  updatedBy?: number
}