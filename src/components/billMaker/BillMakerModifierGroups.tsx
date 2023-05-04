import React, { useEffect, useState } from 'react'
import { ModifierGroup } from '../../types/modifierGroup'
import { Product } from '../../types/product'
import BillMakerElements from './BillMakerElements'
import { ModifierElement } from '../../types/modifierElement'
import { BillItem } from '../../types/billItem'

interface Props {
  product: Product
  billItem: BillItem
  addLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement) => void
}

const BillMakerModifierGroups = ({ product, addLinkedProductModifierElement, removeLinkedProductModifierElement, billItem }: Props) => {
  const [modifierGroup, setModifierGroup] = useState<ModifierGroup>(product.productModifiers[0]?.modifierGroup)

  useEffect(() => {
    setModifierGroup(product.productModifiers[0]?.modifierGroup)
  }, [product])

  return (
    <>
      <div className="col-12 d-flex flex-wrap justify-content-center">
        {
          product !== undefined &&
          product.productModifiers.map((productModifier, index) => {
            return (
              <div key={index} className="col-3 p-2 pointer" onClick={() => setModifierGroup(productModifier.modifierGroup)}>
                <div className="card shadow" style={{ border: `${modifierGroup?.id === productModifier.modifierGroupId ? '1px' : '0px'} solid rgba(255,193,7,.8)` }}>
                  <div className="card-body">
                    <h5 className="card-title">{productModifier.modifierGroup.label}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{productModifier.modifierGroup.name}</h6>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      {
        modifierGroup &&
        <BillMakerElements billItem={billItem} removeLinkedProductModifierElement={removeLinkedProductModifierElement} addLinkedProductModifierElement={addLinkedProductModifierElement} modifierGroup={modifierGroup} />
      }
    </>
  )
}

export default BillMakerModifierGroups