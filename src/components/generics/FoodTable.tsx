import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'

interface Props {
  top: number
  left: number
  tableNumber: number
}

const FoodTable = ({ top, left, tableNumber }: Props) => {

  return (
    <div className="table_container d-flex flex-wrap p-2" style={{ top: `${top}vh`, left: `${left}vw` }}>
      <strong># {tableNumber}</strong>
      <div className='table'></div>
      <div className="table_background"></div>
      <div className="table_background-color"></div>
      <ProgressBar styleClass='progress_bar-table' waitingTime={0.5} isCommanded={false} tableNumber={tableNumber}/>
    </div>
  )
}

export default FoodTable