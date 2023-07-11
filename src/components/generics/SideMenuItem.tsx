import React, { useContext, useEffect, useState } from 'react'
import { BillItem } from '../../types/billItem'
import { parseCurrency } from '../../utils/currencyParser'
import ProgressBar from './ProgressBar'
import { Bill } from '../../types/bill'
import moto from '../../assets/icons/moto.png'
import carry from '../../assets/icons/carry.png'
import AppContext from '../../context/AppContext'
import CustomBtn from './CustomBtn'
import BillMaker from '../../containers/generics/BillMaker'
import { buttonTypes } from '../../enums/buttonTypes'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { BillFunctions } from '../../types/billFunctions'
import useBill from '../../hooks/useBill'

interface Props {
  bill: Bill
  removeBill: (id: number) => void
  saleItemCategories: SaleItemCategory[]
}

const SideMenuItem = ({ bill, removeBill, saleItemCategories }: Props) => {
  const [initialTime, setInitialTime] = useState<Date | null>(null)
  const [finalTime, setFinalTime] = useState<Date | null>(null)
  const { system } = useContext(AppContext)
  const [close, setClose] = useState(true)
  const billFunctions = useBill()

  const closeTable = () => {
    const container = document.getElementById(`billMakerContainerToGo${bill.id}`)
    container?.classList.remove('bill-makerContainer_show')
    setClose(true)
  }

  const openTable = () => {
    const container = document.getElementById(`billMakerContainerToGo${bill.id}`)
    container?.classList.add('bill-makerContainer_show')
    setClose(false)
  }

  const getBillTotal = (bill: Bill) => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    try {
      let price = 0
      for (const billProduct of billItem.billProducts) {
        for (const product of billProduct.products) {
          price += Number(product.unitPrice)
          for (const modifier of product.modifiers) {
            if (typeof modifier.elements === 'undefined') continue
            for (const element of modifier.elements) {
              price += Number(element.price)
            }
          }
        }
      }
      return price
    } catch (error) {
      return 0
    }
  }

  const calcRemainingMinutes = () => {
    if (bill.isServed) setInitialTime(null)
    let tmpInitialTime = null
    let tmpFinalTime = null
    if (bill.isCommanded) {
      tmpInitialTime = new Date(bill.updatedAt)
      tmpFinalTime = new Date(tmpInitialTime.getTime() + system.bussinessConfig.serveWaitTime * 60000)
    }
    setFinalTime(tmpFinalTime)
    setInitialTime(tmpInitialTime)
  }

  useEffect(() => {
    billFunctions.getBillFromDB(bill.id)
    calcRemainingMinutes()
  }, [bill])


  return (
    <>
      <div className='bill-makerContainer position-fixed' id={`billMakerContainerToGo${bill.id}`}>
        <span className='position-absolute' onClick={closeTable} style={{ zIndex: '10000', cursor: 'pointer', right: '30vw', top: '1vw', background: 'white', borderRadius: '50px' }}>
          <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
        </span>
        {
          !close &&
          <BillMaker removeBill={removeBill}
            bill={bill}
            saleItemCategories={saleItemCategories}
            close={closeTable} />
        }
      </div>
      <div className="col-12 flex-wrap d-flex py-3 orders-togo" onClick={() => openTable()}>
        <div className="col-3 d-flex text-center">
          {bill.client.name}
        </div>
        <div className="col-3 d-flex justify-content-center text-center">
          {bill.client.phone}
        </div>
        <div className="col-2 d-flex justify-content-center text-center">
          {parseCurrency(getBillTotal(bill).toString())}
        </div>
        <div className="col-2 d-flex justify-content-center">
          <img className='' height={18} src={bill.deliveryMethod === 2 ? moto : carry} />
        </div>
        <div className="col-2 d-flex justify-content-center position-relative">
          {/* <ProgressBar
            timeMargin={false}
            finalTime={finalTime}
            initialTime={initialTime}
            isCommanded={billFunctions.bill.isCommanded}
            isServe={billFunctions.bill.isServed}
            styleClass='progress_bar-table not-blur'
            tableNumber={0}
          /> */}
        </div>
      </div>
    </>
  )
}

export default SideMenuItem