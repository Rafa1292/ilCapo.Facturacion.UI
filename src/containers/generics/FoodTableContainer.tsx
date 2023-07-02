import React, { useContext, useEffect, useState } from 'react'
import { SaleItemCategory } from '../../types/saleItemCategory'
import useBill from '../../hooks/useBill'
import FoodTable from '../../components/generics/FoodTable'
import { Bill } from '../../types/bill'
import { Client } from '../../types/client'
import AppContext from '../../context/AppContext'
import { sys } from 'typescript'

const initialClient: Client = {
  id: 0,
  name: '',
  phone: '',
  addressess: [],
  delete: false,
  createdBy: 0,
  updatedBy: 0
}

const initialBill: Bill = {
  id: 0,
  addressId: 0,
  client: initialClient,
  clientId: 0,
  close: false,
  deliveryMethod: 0,
  tableNumber: 0,
  workDayUserId: 0,
  items: [],
  isCommanded: false,
  isServed: false,
  isNull: false,
  billAccountHistories: [],
  delete: false,
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
  createdBy: 0,
  updatedBy: 0
}

interface Props {
  top: number
  left: number
  tableNumber: number
  saleItemCategories: SaleItemCategory[]
  menuDeliveryTime: Date | null | undefined
  bills: Bill[]
  removeBill: (id: number) => void
  setMenuDeliveryTime: (tableNumber: number, date: Date | null) => void
}

const FoodTableContainer = ({ top, left, removeBill, tableNumber, saleItemCategories, menuDeliveryTime, bills, setMenuDeliveryTime }: Props) => {
  const [initialTime, setInitialTime] = useState<Date | null>(null)
  const [finalTime, setFinalTime] = useState<Date | null>(null)
  const { system, billFunctions } = useContext(AppContext)

  const calcRemainingMinutes = (currentBill: Bill) => {
    if (currentBill.isServed) setInitialTime(null)
    let tmpInitialTime = null
    let tmpFinalTime = null
    if (currentBill.isCommanded) {
      tmpInitialTime = new Date(currentBill.updatedAt)
      tmpFinalTime = new Date(tmpInitialTime.getTime() + system.bussinessConfig.serveWaitTime * 60000)
    } else if (menuDeliveryTime) {
      tmpInitialTime = menuDeliveryTime
      tmpFinalTime = new Date(tmpInitialTime.getTime() + system.bussinessConfig.menuWaitTime * 60000)
    }
    setFinalTime(tmpFinalTime)
    setInitialTime(tmpInitialTime)
  }

  const getBillFromTableNumber = (tableNumber: number): Bill => {
    const bill = bills.find(bill => bill.tableNumber === tableNumber)
    return bill ? bill : initialBill
  }

  useEffect(() => {
    // console.log('foodTableContainer useEffect')
    const currentBill = billFunctions.setBillByTableNumber(tableNumber)
    calcRemainingMinutes(currentBill)
  }, [menuDeliveryTime, bills])

  return (
    <>
      <FoodTable
        removeBill={removeBill}
        initialTime={initialTime}
        finalTime={finalTime}
        setMenuDeliveryTime={setMenuDeliveryTime}
        saleItemCategories={saleItemCategories}
        tableNumber={tableNumber}
        top={top}
        left={left} />
    </>
  )
}

export default FoodTableContainer