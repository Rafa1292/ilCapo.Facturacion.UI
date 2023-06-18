import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import '../../scss/bar.scss'
import BillMaker from '../../containers/generics/BillMaker'
import CustomBtn from './CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'
import { SaleItemCategory } from '../../types/saleItemCategory'
import useBill from '../../hooks/useBill'
import { Bill } from '../../types/bill'

interface Props {
  top: number
  left: number
  tableNumber: number
  saleItemCategories: SaleItemCategory[]
  bill: Bill
  updateBill: (id: number) => void
  removeBill: (id: number) => void
}

const Bar = ({ top, left, tableNumber, removeBill, saleItemCategories, bill, updateBill }: Props) => {
  const billFunctions = useBill(tableNumber)
  const [close, setClose] = useState(true)

  const closeTable = () => {
    const container = document.getElementById(`billMakerContainer${tableNumber}`)
    container?.classList.remove('bill-makerContainer_show')
    setClose(true)
  }

  const openTable = () => {
    const container = document.getElementById(`billMakerContainer${tableNumber}`)
    container?.classList.add('bill-makerContainer_show')
    setClose(false)
  }
  return (
    <>
      <div className='bill-makerContainer' id={`billMakerContainer${tableNumber}`}>
        <span className='position-absolute' onClick={closeTable} style={{ zIndex: '10000', cursor: 'pointer', right: '30vw', top: '1vw', background: 'white', borderRadius: '50px' }}>
          <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
        </span>
        {
          !close &&
          <BillMaker removeBill={removeBill} refreshBill={updateBill} bill={billFunctions.bill} saleItemCategories={saleItemCategories} close={closeTable} billFunctions={billFunctions} />
        }
      </div>
      <div className="bar_container d-flex flex-wrap position-absolute" onClick={() => openTable()} style={{ top: `${top}px`, left: `${left}px` }}>
        <strong>#{tableNumber}</strong>
        <div className='bar'></div>
        <div className="bar_background"></div>
        <div className="bar_background-color"></div>
        <ProgressBar isServe={billFunctions.bill.isServed} styleClass='progress_bar-bar' initialTime={new Date()} finalTime={new Date()} isCommanded={false} tableNumber={tableNumber} />
      </div>
    </>
  )
}

export default Bar