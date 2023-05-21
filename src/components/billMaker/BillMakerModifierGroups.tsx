import React, { useEffect, useState } from 'react'
import { ModifierGroup } from '../../types/modifierGroup'
import { Product } from '../../types/product'
import BillMakerElements from './BillMakerElements'
import { ModifierElement } from '../../types/modifierElement'
import { BillItem } from '../../types/billItem'
import { LinkedProduct } from '../../types/linkedProduct'

interface Props {
  product: Product
  billItem: BillItem
  saleItemProductId: number
  addLinkedProductModifierElement: (modifierElement: ModifierElement, saleItemProductId: number) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement, saleItemProductId: number) => void
  newCombinedLinkedProduct: (linkedProduct: LinkedProduct, billItemLinkedProductId: number) => void
}

const BillMakerModifierGroups = ({ product, saleItemProductId, addLinkedProductModifierElement, removeLinkedProductModifierElement, billItem, newCombinedLinkedProduct }: Props) => {
  const [modifierGroup, setModifierGroup] = useState<ModifierGroup>(product.productModifiers[0]?.modifierGroup)

  useEffect(() => {
    setModifierGroup(product.productModifiers[0]?.modifierGroup)
  }, [product])

  return (
    <>
      <div className="col-12 d-flex flex-wrap justify-content-center align-items-center py-2" style={{boxSizing: 'border-box', height: '13vh'}}>
        {
          product !== undefined &&
          product.productModifiers.map((productModifier, index) => {
            return (
              <div key={index} className="col-3 p-2 pointer" onClick={() => setModifierGroup(productModifier.modifierGroup)}>
                <div className="card modifier-group_item" style={{ 
                  color: modifierGroup?.id === productModifier.modifierGroupId ? 'white' : 'black', 
                  boxShadow: `inset 0px 0px ${modifierGroup?.id === productModifier.modifierGroupId ? '120px -5px' : '20px -15px'} rgba(0,0,0,.76)`,
                  height: `${modifierGroup?.id === productModifier.modifierGroupId ? '75px' : '60px'}` }}>
                  <div className="card-body align-items-center d-flex justify-content-center">
                    <h6 className="card-subtitle m-0 text-center">{productModifier.modifierGroup.name}</h6>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div className="col-12 d-flex flex-wrap pt-3 justify-content-end px-2" style={{borderBottom: '1px solid rgba(0,0,0,.2)', color: 'rgba(0,0,0,.5)'}}>Elementos modificadores</div>

      {
        modifierGroup &&
        <BillMakerElements saleItemProductId={saleItemProductId} newCombinedLinkedProduct={newCombinedLinkedProduct} billItem={billItem} removeLinkedProductModifierElement={removeLinkedProductModifierElement} addLinkedProductModifierElement={addLinkedProductModifierElement} modifierGroup={modifierGroup} />
      }
    </>
  )
}

export default BillMakerModifierGroups