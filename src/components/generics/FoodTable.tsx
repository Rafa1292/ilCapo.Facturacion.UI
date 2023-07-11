import React, { useContext, useEffect, useState } from 'react'
import BillMaker from '../../containers/generics/BillMaker'
import CustomBtn from './CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'
import '../../scss/foodTable.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import AppContext from '../../context/AppContext'
import { Bill } from '../../types/bill'
import ProgressBarContainer from '../../containers/generics/ProgressBarContainer'
import { table } from 'console'

interface Props {
  top: number
  left: number
  tableNumber: number
  saleItemCategories: SaleItemCategory[]
  initialTime: Date | null
  finalTime: Date | null
  setMenuDeliveryTime: (tableNumber: number, date: Date | null) => void
  removeBill: (id: number) => void
}

const FoodTable = ({ top, left, tableNumber, removeBill, saleItemCategories, initialTime, finalTime, setMenuDeliveryTime }: Props) => {
  const [close, setClose] = useState(true)
  const { billFunctions } = useContext(AppContext)
  const [bill, setBill] = useState({} as Bill)

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

  useEffect(() => {
    const currentBill = billFunctions.getBillByTableNumber(tableNumber)
    setBill(currentBill)
  }, [billFunctions.bills])



  return (
    <>
      {
        tableNumber > 0 &&
        <>
          <div className='bill-makerContainer' id={`billMakerContainer${tableNumber}`}>
            <span className='position-absolute' onClick={closeTable} style={{ zIndex: '10000', cursor: 'pointer', right: '30vw', top: '1vw', background: 'white', borderRadius: '50px' }}>
              <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
            </span>
            {
              !close &&
              <BillMaker
                removeBill={removeBill}
                saleItemCategories={saleItemCategories}
                bill={bill}
                close={closeTable} />
            }
          </div>
          <div className="table_container d-flex flex-wrap p-2 position-absolute" style={{ top: `${top}px`, left: `${left}px` }}>
            <div className="d-flex flex-wrap justify-content-center" onClick={() => openTable()} style={{ width: '100%', height: '100%' }}>
              <strong># {tableNumber}</strong>
              <div className='table_room'></div>
              <div className="table_background"></div>
              <div className="table_background-color"></div>
              <ProgressBarContainer
                isServe={bill.isServed}
                styleClass='progress_bar-table'
                initialTime={initialTime}
                finalTime={finalTime}
                isCommanded={bill.isCommanded}
                timeMargin={true} />
            </div>
            {
              !bill.isCommanded && initialTime === null &&
              <strong onClick={() => setMenuDeliveryTime(tableNumber, new Date(Date.now()))} style={{ position: 'absolute', bottom: '-20px' }}>Menu</strong>
            }
            {
              !bill.isCommanded && initialTime !== null &&
              <strong onClick={() => setMenuDeliveryTime(tableNumber, null)} style={{ position: 'absolute', bottom: '-20px' }}>Cancelar</strong>
            }
            {
              bill.isCommanded && !bill.isServed &&
              <strong onClick={() => billFunctions.serve(bill.id)} style={{ position: 'absolute', bottom: '-20px' }}>Servir</strong>
            }
          </div>
        </>
      }
    </>
  )
}

export default FoodTable