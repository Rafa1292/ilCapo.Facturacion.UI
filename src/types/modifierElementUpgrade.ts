import { UpgradeElementPrice } from "./upgradeElementPrice"

export interface ModifierElementUpgrade {
  id: number
  label: string
  modifierElementId: number
  newModifierGroupId: number
  price: number
  prices: UpgradeElementPrice[]
  createdBy?: number
  updatedBy?: number
}
