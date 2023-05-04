import React, { useEffect, useState } from 'react'
import { ModifierElement } from '../../types/modifierElement'
import { ModifierGroup } from '../../types/modifierGroup'
import { useGet } from '../../hooks/useAPI'
import { parseCurrency } from '../../utils/currencyParser'

interface Props {
  element: ModifierElement
}

const BillMakerCombinable = ({ element }: Props) => {
  const [tmpModifierGroup, setTmpModifierGroup] = useState<ModifierGroup>()
  const [modifierGroup, setModifierGroup] = useState<ModifierGroup>()
  const [upgradeModifierGroup, setUpgradeModifierGroup] = useState<ModifierGroup>()
  const [selectedElement, setSelectedElement] = useState<ModifierElement>()
  const [combine, setCombine] = useState(false)

  useEffect(() => {
    const getModifierGroup = async () => {
      const response = await useGet<ModifierGroup>(`modifierGroups/${element.combinableModifierGroupId}`, false)
      if (!response.error) {
        setModifierGroup(response.data)
        setTmpModifierGroup(response.data)
      }
    }
    const getUpgradeModifierGroup = async () => {
      const response = await useGet<ModifierGroup>(`modifierGroups/${element.modifierUpgrade.newModifierGroupId}`, false)
      if (!response.error) {
        setUpgradeModifierGroup(response.data)
      }
    }
    element.modifierUpgrade?.newModifierGroupId > 0 &&
      getUpgradeModifierGroup()

    getModifierGroup()
    setCombine(false)
  }, [element])
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
      <div className="col-12 d-flex py-4 flex-wrap justify-content-center">

        {
          tmpModifierGroup && combine &&
          tmpModifierGroup.elements?.map((tmpElement, index) => {
            return (
              <div key={index} className="col-3 p-2 pointer" onClick={() => setSelectedElement(tmpElement)}>
                <div className="card shadow" style={{ border: `${tmpElement?.id === selectedElement?.id ? '1px' : '0px'} solid rgba(255,193,7,.8)` }}>
                  <div className="card-body">
                    <h5 className="card-title">{tmpElement.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{tmpElement.price}</h6>
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