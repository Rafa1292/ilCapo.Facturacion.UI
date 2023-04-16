import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import '../../scss/bar.scss'

interface Props {
  top: number
  left: number
  tableNumber: number
  rotate?: number
}

const Bar = ({ top, left, tableNumber, rotate }: Props) => {

  return (
    <div className="bar_container d-flex flex-wrap" style={{ top: `${top}vh`, left: `${left}vw` }}>
      <div className='bar' style={{ transform: `rotate(${rotate}deg)` }}></div>
      <div className="bar_background"></div>
      <div className="bar_background-color"></div>
      <ProgressBar styleClass='progress_bar-bar' waitingTime={0.5} isCommanded={false} tableNumber={tableNumber} />
    </div>
  )
}

export default Bar