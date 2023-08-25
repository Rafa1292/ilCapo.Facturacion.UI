import React, { useContext, useEffect, useState } from 'react'
import { SaleItemCategory } from '../../types/saleItemCategory'
import FoodTable from '../../components/generics/FoodTable'
import { Bill } from '../../types/bill'
import AppContext from '../../context/AppContext'
import { Menu } from '../../types/menu'

interface Props {
  top: number
  left: number
  tableNumber: number
  menus: Menu[]

  saleItemCategories: SaleItemCategory[]
  menuDeliveryTime: Date | null | undefined
  setMenuDeliveryTime: (tableNumber: number, date: Date | null) => void
  setPrices: (menuId: number) => void
}

const FoodTableContainer = ({
  top,
  left,
  tableNumber,
  setPrices,
  saleItemCategories,
  menuDeliveryTime,
  setMenuDeliveryTime,
  menus,
}: Props) => {
  const [initialTime, setInitialTime] = useState<Date | null>(null)
  const [finalTime, setFinalTime] = useState<Date | null>(null)
  const { system, billFunctions } = useContext(AppContext)

  const calcRemainingMinutes = (currentBill: Bill) => {
    console.log(currentBill)
    if (currentBill.isServed) setInitialTime(null)
    let tmpInitialTime = null
    let tmpFinalTime = null
    if (currentBill.isCommanded) {
      tmpInitialTime = new Date(currentBill.commandTime)
      
      tmpFinalTime = new Date(
        tmpInitialTime.getTime() + system.bussinessConfig.serveWaitTime * 60000
      )
    } else if (menuDeliveryTime) {
      tmpInitialTime = menuDeliveryTime
      tmpFinalTime = new Date(
        tmpInitialTime.getTime() + system.bussinessConfig.menuWaitTime * 60000
      )
    }
    setFinalTime(tmpFinalTime)
    setInitialTime(tmpInitialTime)
  }

  useEffect(() => {
    const currentBill = billFunctions.getBillByTableNumber(tableNumber)
    calcRemainingMinutes(currentBill)
  }, [menuDeliveryTime, billFunctions.bills])

  return (
    <>
      <FoodTable
        menus={menus}
        setPrices={setPrices}
        initialTime={initialTime}
        finalTime={finalTime}
        setMenuDeliveryTime={setMenuDeliveryTime}
        saleItemCategories={saleItemCategories}
        tableNumber={tableNumber}
        top={top}
        left={left}
      />
    </>
  )
}

export default FoodTableContainer
