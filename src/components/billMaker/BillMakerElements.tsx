import React, { useEffect, useState } from 'react'
import { ModifierGroup } from '../../types/modifierGroup'
import { ModifierElement } from '../../types/modifierElement'
import BillMakerCombinable from './BillMakerCombinable'
import { BillItem } from '../../types/billItem'
import { LinkedProduct } from '../../types/linkedProduct'
import CustomBtn from '../generics/CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'

interface Props {
  modifierGroup: ModifierGroup
  billItem: BillItem
  saleItemProductId: number
  addLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement) => void
  newCombinedLinkedProduct: (linkedProduct: LinkedProduct, billItemLinkedProductId: number) => void
}

const BillMakerElements = ({ modifierGroup, saleItemProductId, addLinkedProductModifierElement, newCombinedLinkedProduct, removeLinkedProductModifierElement, billItem }: Props) => {
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
      setElements([...tmpElements, { ...currentElement, selectedQuantity: 1 }])
      addLinkedProductModifierElement(currentElement)
    }
  }

  const setInitialElements = () => {
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const productModifier of linkedProduct.linkedProductModifiers) {
          if (productModifier.modifierGroupId === modifierGroup.id) {
            const tmpElements: ModifierElement[] = []
            for (const linkedProductModifierElement of productModifier.linkedProductModifierElements) {
              const tmpElement = modifierGroup.elements?.find(x => x.id === linkedProductModifierElement.modifierElementId)
              if (tmpElement) {
                tmpElements.push({ ...tmpElement, selectedQuantity: linkedProductModifierElement.quantity })
              }
            }
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

  const upQuantity = (element: ModifierElement) => {
    const currentQuantity = getElementQuantity(element.id)
    if (element.quantity > currentQuantity) {
      addLinkedProductModifierElement(element)
      setInitialElements()
    }
  }

  const downQuantity = (element: ModifierElement) => {
    removeLinkedProductModifierElement(element)
    setInitialElements()
  }

  const getElementQuantity = (elementId: number) => {
    const tmpElement = elements.find(x => x.id === elementId)
    if (tmpElement) {
      return tmpElement.selectedQuantity
    }
    return 0
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
            <div key={index} className="col-3 p-2 pointer">
              <div className="card shadow" onClick={tmpElement?.quantity === 1 ? () => addElement(tmpElement) : undefined} style={{ border: `${elements.map(x => x.id).includes(tmpElement?.id) ? '1px' : '0px'} solid rgba(255,193,7,.8)` }}>
                <div className="card-body">
                  <h5 className="card-title">{tmpElement.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{tmpElement.price}</h6>
                  {
                    tmpElement?.quantity > 1 &&
                    <div className="col-12 d-flex flex-wrap justify-content-center">
                      <CustomBtn action={() => downQuantity(tmpElement)} buttonType={buttonTypes.arrowDown} height='20px' />
                      <span className="card-text">{getElementQuantity(tmpElement.id)}</span>
                      <CustomBtn action={() => upQuantity(tmpElement)} buttonType={buttonTypes.arrowUp} height='20px' />
                      {
                        tmpElement?.quantity <= getElementQuantity(tmpElement.id) &&
                        <span className='col-12 text-center text-danger'>
                          Maximo alcanzado
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          )
        })
      }
      {
        elements && modifierGroup.maxSelectable === 1 && elements[0]?.combinableModifierGroupId > 0 && elements[0]?.quantity === 1 &&
        <BillMakerCombinable saleItemProductId={saleItemProductId} newCombinedLinkedProduct={newCombinedLinkedProduct} element={elements[0]} />
      }

    </>
  )
}

export default BillMakerElements