import React, { useEffect, useState } from 'react'
import { ModifierGroup } from '../../types/modifierGroup'
import { ModifierElement } from '../../types/modifierElement'
import BillMakerCombinable from './BillMakerCombinable'
import { BillItem } from '../../types/billItem'
import { LinkedProduct } from '../../types/linkedProduct'
import CustomBtn from '../generics/CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'
import { parseCurrency } from '../../utils/currencyParser'

interface Props {
  modifierGroup: ModifierGroup
  billItem: BillItem
  saleItemProductId: number
  addLinkedProductModifierElement: (modifierElement: ModifierElement, saleItemProductId: number) => void
  removeLinkedProductModifierElement: (modifierElement: ModifierElement, saleItemProductId: number) => void
  newCombinedLinkedProduct: (linkedProduct: LinkedProduct, billItemLinkedProductId: number) => void
}

const BillMakerElements = ({ modifierGroup, saleItemProductId, addLinkedProductModifierElement, newCombinedLinkedProduct, removeLinkedProductModifierElement, billItem }: Props) => {
  const [elements, setElements] = useState<ModifierElement[]>([])

  const addElement = (currentElement: ModifierElement) => {
    const maxSelectable = modifierGroup.maxSelectable
    if (elements.map(x => x.id).includes(currentElement.id)) {
      setElements(elements.filter(x => x.id !== currentElement.id))
      removeLinkedProductModifierElement(currentElement, saleItemProductId)
    } else {
      const tmpElements = elements
      if (maxSelectable === elements.length) {
        const tmpElement = tmpElements.pop()
        if (tmpElement) {
          removeLinkedProductModifierElement(tmpElement, saleItemProductId)
        }
      }
      setElements([...tmpElements, { ...currentElement, selectedQuantity: 1 }])
      addLinkedProductModifierElement(currentElement, saleItemProductId)
    }
  }

  const setInitialElements = () => {
    for (const billProduct of billItem.billProducts) {
      if (billProduct.saleItemProductId === saleItemProductId) {
        for (const linkedProduct of billProduct.products) {
          for (const productModifier of linkedProduct.modifiers) {
            if (productModifier.modifierGroupId === modifierGroup.id) {
              const tmpElements: ModifierElement[] = []
              for (const linkedProductModifierElement of productModifier.elements) {
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

  }

  const upQuantity = (element: ModifierElement) => {
    const currentQuantity = getElementQuantity(element.id)
    if (element.quantity > currentQuantity) {
      addLinkedProductModifierElement(element, saleItemProductId)
      setInitialElements()
    }
  }

  const downQuantity = (element: ModifierElement) => {
    removeLinkedProductModifierElement(element, saleItemProductId)
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
      <div className="col-12 d-flex flex-wrap align-items-center justify-content-center" style={{ height: '24vh' }}>
        {
          modifierGroup !== undefined &&
          modifierGroup?.elements?.map((tmpElement, index) => {
            return (
              <div key={index} className="col-3 pointer " style={{ height: 'fit-content' }}>
                <div className="card element_item" onClick={tmpElement?.quantity === 1 ? () => addElement(tmpElement) : undefined} style={{
                  boxShadow: `inset 0px 0px ${elements.map(x => x.id).includes(tmpElement?.id) ?  '140px 20px': tmpElement?.quantity > 1 ? '140px 20px' : '20px -15px'} rgba(0,0,0,.76)`,
                  color: `${elements.map(x => x.id).includes(tmpElement?.id) ? 'white' : tmpElement?.quantity > 1 ? 'white': 'black'}`,
                  height: `${elements.map(x => x.id).includes(tmpElement?.id) ? tmpElement?.quantity > 1 ? '20vh' : '12vh' : tmpElement?.quantity > 1 ? '18vh' : '10vh'}`
                }}>
                  <div className="card-body p-0 d-flex flex-wrap align-items-center">
                    <span className="card-title col-12 flex-wrap justify-content-center text-center align-content-center d-flex m-0" style={{ height: '75px' }} >{tmpElement.name}</span>
                    {
                      tmpElement?.quantity > 1 &&
                      <>
                        <h4 className="card-subtitle col-12 text-center mb-2" style={{ textShadow: '0px 2px 2px rgba(0,0,0,0.5)' }}>{Number(tmpElement.price) === 0 ? '' : parseCurrency(Number(tmpElement.price).toString())}</h4>
                        <div className="col-12 py-1 d-flex flex-wrap justify-content-center">
                          <CustomBtn action={() => downQuantity(tmpElement)} buttonType={buttonTypes.substract} height='20px' />
                          <span className="element_quantity mx-2">{getElementQuantity(tmpElement.id)}</span>
                          <CustomBtn action={() => upQuantity(tmpElement)} buttonType={buttonTypes.add} height='20px' />
                          {
                            tmpElement?.quantity <= getElementQuantity(tmpElement.id) &&
                            <span className='col-12 text-center text-danger'>
                              Maximo alcanzado
                            </span>
                          }
                        </div>
                      </>
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      {
        elements && modifierGroup.maxSelectable === 1 && elements[0]?.combinableModifierGroupId > 0 && elements[0]?.quantity === 1 &&
        <BillMakerCombinable productId={billItem.billProducts.find(x => x.id === saleItemProductId)?.products.find(y => y.id === 0)?.productId} saleItemProductId={saleItemProductId} newCombinedLinkedProduct={newCombinedLinkedProduct} element={elements[0]} />
      }

    </>
  )
}

export default BillMakerElements