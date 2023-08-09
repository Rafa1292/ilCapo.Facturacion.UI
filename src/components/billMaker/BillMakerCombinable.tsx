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
  newCombinedLinkedProduct: (
    linkedProduct: LinkedProduct,
    billItemLinkedProductId: number
  ) => void
}

const initialLinkedProduct: LinkedProduct = {
  id: 0,
  billProductId: 0,
  delete: false,
  modifiers: [],
  isCommanded: false,
  name: '',
  productId: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0,
}

const BillMakerCombinable = ({
  element,
  newCombinedLinkedProduct,
  saleItemProductId,
  productId,
}: Props) => {
  const [tmpModifierGroup, setTmpModifierGroup] = useState<ModifierGroup>()
  const [modifierGroup, setModifierGroup] = useState<ModifierGroup>()
  const [upgradeModifierGroup, setUpgradeModifierGroup] =
    useState<ModifierGroup>()
  const [selectedElement, setSelectedElement] = useState<ModifierElement>()
  const [combine, setCombine] = useState(false)

  const addElement = (currentElement: ModifierElement) => {
    const linkedProduct: LinkedProduct = {
      ...initialLinkedProduct,
      name: currentElement.name,
      unitPrice:
        upgradeModifierGroup?.id === tmpModifierGroup?.id
          ? element.modifierUpgrade?.price
          : 0,
      productId: currentElement.productReference?.productId || 0,
    }
    setSelectedElement(currentElement)
    newCombinedLinkedProduct(linkedProduct, saleItemProductId)
  }

  useEffect(() => {
    const getModifierGroup = async () => {
      const response = await useGet<ModifierGroup>(
        `modifierGroups/${element.combinableModifierGroupId}`,
        false
      )
      if (!response.error) {
        response.data.elements?.map((tmpElement) => {
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
      const response = await useGet<ModifierGroup>(
        `modifierGroups/${element.modifierUpgrade.newModifierGroupId}`,
        false
      )
      if (!response.error) {
        response.data.elements?.map((tmpElement) => {
          if (
            tmpElement.productReference &&
            tmpElement.productReference?.productId === productId
          ) {
            setCombine(true)
            setSelectedElement(tmpElement)
            setTmpModifierGroup(response.data)
          }
        })
        setUpgradeModifierGroup(response.data)
      }
    }
    element.modifierUpgrade?.newModifierGroupId > 0 && getUpgradeModifierGroup()

    getModifierGroup()
  }, [element, productId])
  return (
    <>
      <div
        className='col-12 d-flex flex-wrap mb-2 justify-content-end px-2'
        style={{
          borderTop: '1px solid rgba(0,0,0,.2)',
          color: 'rgba(0,0,0,.5)',
        }}
      >
      </div>
      {element && element.combinableModifierGroupId > 0 && (
        <div className='col-4 d-flex justify-content-center py-1'>
          <button
            className={`btn ${
              combine ? 'btn-success' : 'btn-outline-success'
            } col-10 py-4`}
            onClick={() => setCombine(!combine)}
          >
            Combinar
          </button>
        </div>
      )}
      {combine && element.modifierUpgrade && (
        <div className='col-4 d-flex flex-wrap justify-content-center py-1'>
          {(tmpModifierGroup?.id === modifierGroup?.id && (
            <button
              className='btn btn-outline-success col-10 py-4'
              onClick={() => setTmpModifierGroup(upgradeModifierGroup)}
            >
              {element.modifierUpgrade.label} por{' '}
              {parseCurrency(element.modifierUpgrade.price?.toString())}
            </button>
          )) || (
            <button
              className='btn btn-danger col-10 py-4'
              onClick={() => setTmpModifierGroup(modifierGroup)}
            >
              No mejorar
            </button>
          )}
        </div>
      )}
      {combine && (
        <div
          className='col-12 d-flex flex-wrap pt-1 justify-content-end px-2'
          style={{
            borderBottom: '1px solid rgba(0,0,0,.2)',
            color: 'rgba(0,0,0,.5)',
          }}
        >
          Elementos para combinar
        </div>
      )}
      <div
        className='col-12 d-flex pt-2 flex-wrap justify-content-center align-items-center'
        style={{ height: '110px'}}
      >
        {tmpModifierGroup &&
          combine &&
          tmpModifierGroup.elements?.map((tmpElement, index) => {
            return (
              <div
                key={index}
                className='col-3 p-2 pointer'
                onClick={() => addElement(tmpElement)}
              >
                <div
                  className='card combinable_item'
                  style={{
                    border: `${
                      tmpElement?.id === selectedElement?.id ? '3px' : '0px'
                    } solid rgba(255,193,7,.8)`,
                    boxShadow: `0px 0px ${
                      tmpElement?.id === selectedElement?.id ? '5px 2px' : '0px 0px'
                    } rgba(0,0,0,.3)`,
                    height: `${
                      tmpElement?.id === selectedElement?.id ? '65px' : '55px'
                    }`,
                  }}
                >
                  <div className='card-body d-flex flex-wrap align-content-center'>
                    <div className='card-title col-12 text-center'>
                      {tmpElement.name}
                    </div>
                    {tmpElement.price > 0 && (
                      <div className='card-subtitle col-12 text-center mb-2 '>
                        {parseCurrency(Number(tmpElement.price)?.toString())}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </>
  )
}

export default BillMakerCombinable
