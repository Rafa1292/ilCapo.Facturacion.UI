import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import BillMaker from '../../containers/generics/BillMaker'
import '../../scss/foodTable.scss'
import CustomBtn from './CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'
import useBill from '../../hooks/useBill'
interface Props {
  top: number
  left: number
  tableNumber: number
}

const FoodTable = ({ top, left, tableNumber }: Props) => {
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
      {
        tableNumber > 0 &&
        <>
          <div className='bill-makerContainer' id={`billMakerContainer${tableNumber}`}>
            <span className='position-absolute' onClick={closeTable} style={{ zIndex: '10000', cursor: 'pointer', right: '30vw', top: '1vw', background: 'white', borderRadius: '50px' }}>
              <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
            </span>
            {
              !close &&
              <BillMaker close={closeTable} billFunctions={billFunctions} />
            }
          </div>
          <div className="table_container d-flex flex-wrap p-2" onClick={() => openTable()} style={{ top: `${top}vh`, left: `${left}vw` }}>
            <strong># {tableNumber}</strong>
            <div className='table_room'></div>
            <div className="table_background"></div>
            <div className="table_background-color"></div>
            <ProgressBar styleClass='progress_bar-table' waitingTime={0.5} isCommanded={false} tableNumber={tableNumber} />
          </div>
        </>
      }
    </>
  )
}

export default FoodTable