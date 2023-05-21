import React, { useEffect, useState } from 'react'
import { ModifierElement } from '../../types/modifierElement'
import { ModifierGroup } from '../../types/modifierGroup'
import { useGet } from '../../hooks/useAPI'
import { parseCurrency } from '../../utils/currencyParser'
import { LinkedProduct } from '../../types/linkedProduct'

interface Props {
  productId: number | undefined
  element: ModifierElement
  saleItemProductId: number
  newCombinedLinkedProduct: (linkedProduct: LinkedProduct, billItemLinkedProductId: number) => void
}

const initialLinkedProduct: LinkedProduct = {
  id: 0,
  billItemLinkedProductId: 0,
  delete: false,
  linkedProductModifiers: [],
  name: '',
  productId: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const BillMakerCombinable = ({ element, newCombinedLinkedProduct, saleItemProductId, productId }: Props) => {
  const [tmpModifierGroup, setTmpModifierGroup] = useState<ModifierGroup>()
  const [modifierGroup, setModifierGroup] = useState<ModifierGroup>()
  const [upgradeModifierGroup, setUpgradeModifierGroup] = useState<ModifierGroup>()
  const [selectedElement, setSelectedElement] = useState<ModifierElement>()
  const [combine, setCombine] = useState(false)

  const addElement = (currentElement: ModifierElement) => {
    const linkedProduct: LinkedProduct = {
      ...initialLinkedProduct,
      name: currentElement.name,
      unitPrice: upgradeModifierGroup?.id === tmpModifierGroup?.id ? element.modifierUpgrade?.price : 0,
      productId: currentElement.productReference?.productId || 0
    }
    setSelectedElement(currentElement)
    newCombinedLinkedProduct(linkedProduct, saleItemProductId)
  }

  useEffect(() => {
    const getModifierGroup = async () => {
      const response = await useGet<ModifierGroup>(`modifierGroups/${element.combinableModifierGroupId}`, false)
      if (!response.error) {
        response.data.elements?.map((tmpElement, index) => {
          if (tmpElement.productReference?.productId === productId) {
            setCombine(true)
            setSelectedElement(tmpElement)
            setTmpModifierGroup(response.data)
          }
        })
        if (productId === 0 || productId === undefined) {
          setTmpModifierGroup(response.data)
        }
        setModifierGroup(response.data)
      }
    }
    const getUpgradeModifierGroup = async () => {
      const response = await useGet<ModifierGroup>(`modifierGroups/${element.modifierUpgrade.newModifierGroupId}`, false)
      if (!response.error) {
        response.data.elements?.map((tmpElement, index) => {
          if (tmpElement.productReference && tmpElement.productReference?.productId === productId) {
            setCombine(true)
            setSelectedElement(tmpElement)
            setTmpModifierGroup(response.data)
          }
        })
        setUpgradeModifierGroup(response.data)
      }
    }
    element.modifierUpgrade?.newModifierGroupId > 0 &&
      getUpgradeModifierGroup()

    getModifierGroup()
  }, [element, productId])
  return (
    <>
      {
        element && element.combinableModifierGroupId > 0 &&
        <div className="col-12 d-flex justify-content-center py-4">
          <button className="btn btn-outline-success col-6 py-4" onClick={() => setCombine(!combine)}>Combinar</button>
        </div>
      }
      {
        combine && element.modifierUpgrade &&
        <div className="col-12 d-flex flex-wrap justify-content-center">
          {
            tmpModifierGroup?.id === modifierGroup?.id &&
            <button className="btn btn-outline-success col-6 py-4" onClick={() => setTmpModifierGroup(upgradeModifierGroup)}>{element.modifierUpgrade.label} por {parseCurrency(element.modifierUpgrade.price.toString())}</button>
            ||
            <button className="btn btn-outline-danger col-6 py-4" onClick={() => setTmpModifierGroup(modifierGroup)}>No mejorar</button>
          }
        </div>
      }
      {
        combine &&
        <div className="col-12 d-flex flex-wrap pt-3 justify-content-end px-2" style={{ borderBottom: '1px solid rgba(0,0,0,.2)', color: 'rgba(0,0,0,.5)' }}>Elementos para combinar</div>
      }
      <div className="col-12 d-flex py-4 flex-wrap justify-content-center align-items-center" style={{ height: '25vh' }}>

        {
          tmpModifierGroup && combine &&
          tmpModifierGroup.elements?.map((tmpElement, index) => {
            return (
              <div key={index} className="col-3 p-2 pointer" onClick={() => addElement(tmpElement)}>
                <div className="card shadow combinable_item" style={{ border: `${tmpElement?.id === selectedElement?.id ? '3px' : '0px'} solid rgba(255,193,7,.8)`, height: `${tmpElement?.id === selectedElement?.id ? '14vh' : '12vh'}` }}>
                  <div className="card-body d-flex flex-wrap align-content-center">
                    <h5 className="card-title col-12 text-center">{tmpElement.name}</h5>
                    {
                      tmpElement.price > 0 &&
                      <h6 className="card-subtitle col-12 text-center mb-2 ">{parseCurrency(Number(tmpElement.price).toString())}</h6>
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </>
  )
}

export default BillMakerCombinable