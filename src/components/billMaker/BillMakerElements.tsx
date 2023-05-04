import React, { useEffect, useState } from 'react'
import { ModifierGroup } from '../../types/modifierGroup'
import { ModifierElement } from '../../types/modifierElement'
import BillMakerCombinable from './BillMakerCombinable'
import { BillItem } from '../../types/billItem'

interface Props {
  modifierGroup: ModifierGroup
  billItem: BillItem
  addLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement) => void
}

const BillMakerElements = ({ modifierGroup, addLinkedProductModifierElement, removeLinkedProductModifierElement, billItem }: Props) => {
  const [elements, setElements] = useState<ModifierElement[]>([])

  const addElement = (currentElement: ModifierElement) => {
    const maxSelectable = modifierGroup.maxSelectable
    if (elements.map(x => x.id).includes(currentElement.id)) {
      setElements(elements.filter(x => x.id !== currentElement.id))
      removeLinkedProductModifierElement(currentElement)
    } else {
      const tmpElements = elements
      if (maxSelectable === elements.length) {
        const tmpElement = tmpElements.pop()
        if (tmpElement) {
          removeLinkedProductModifierElement(tmpElement)
        }        
      }
      setElements([...tmpElements, currentElement])
      addLinkedProductModifierElement(currentElement)
    }
  }

  const setInitialElements = () => {
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const productModifier of linkedProduct.linkedProductModifiers) {
          if(productModifier.modifierGroupId === modifierGroup.id){
            const tmpElements = modifierGroup.elements?.filter(x => productModifier.linkedProductModifierElements.map(y => y.modifierElementId).includes(x.id))
            if (tmpElements) {
              setElements(tmpElements)              
            }
            else {
              setElements([])
            }
          }
        }
      }
    }

  }



  useEffect(() => {
    setInitialElements()
  }, [modifierGroup])
  return (
    <>
      {
        modifierGroup !== undefined &&
        modifierGroup?.elements?.map((tmpElement, index) => {
          return (
            <div key={index} className="col-3 p-2 pointer" onClick={() => addElement(tmpElement)}>
              <div className="card shadow" style={{ border: `${elements.map(x => x.id).includes(tmpElement?.id) ? '1px' : '0px'} solid rgba(255,193,7,.8)` }}>
                <div className="card-body">
                  <h5 className="card-title">{tmpElement.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{tmpElement.price}</h6>
                </div>
              </div>
            </div>
          )
        })
      }
      {
        elements && modifierGroup.maxSelectable === 1 && elements[0]?.combinableModifierGroupId > 0 &&
        <BillMakerCombinable element={elements[0]} />
      }

    </>
  )
}

export default BillMakerElements