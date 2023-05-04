import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import BillMaker from '../../containers/generics/BillMaker'
import '../../scss/foodTable.scss'
import CustomBtn from './CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'
interface Props {
  top: number
  left: number
  tableNumber: number
}

const FoodTable = ({ top, left, tableNumber }: Props) => {

  const closeTable = () => {
    const container = document.getElementById(`billMakerContainer${tableNumber}`)
    container?.classList.remove('bill-makerContainer_show')
  }

  const openTable = () => {
    const container = document.getElementById(`billMakerContainer${tableNumber}`)
    container?.classList.add('bill-makerContainer_show')
  }

  return (
    <>
      <div className='bill-makerContainer' id={`billMakerContainer${tableNumber}`}>
        <span className='position-absolute' onClick={closeTable} style={{ cursor: 'pointer', right: '1vw', top: '1vw'}}>
          <CustomBtn height='40px' buttonType={buttonTypes.cancel}/>
        </span>
        <BillMaker tableNumber={tableNumber}/>
      </div>
      <div className="table_container d-flex flex-wrap p-2" onClick={() => openTable()} style={{ top: `${top}vh`, left: `${left}vw` }}>
        <strong># {tableNumber}</strong>
        <div className='table'></div>
        <div className="table_background"></div>
        <div className="table_background-color"></div>
        <ProgressBar styleClass='progress_bar-table' waitingTime={0.5} isCommanded={false} tableNumber={tableNumber} />
      </div>
    </>
  )
}

export default FoodTable