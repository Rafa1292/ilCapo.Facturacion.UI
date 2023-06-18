import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import '../../scss/leftViewBar.scss'


interface Props {
  top: number
  left: number
  tableNumber: number
}

const Bar = ({ top, left, tableNumber }: Props) => {

  return (
    <div className="leftViewBar_container" style={{ top: `${top}vh`, left: `${left}vw` }}>
      <strong>#{tableNumber}</strong>
      <div className='leftViewBar'></div>
      <div className="leftViewBar_background"></div>
      <div className="leftViewBar_background-color"></div>
      {/* <ProgressBar styleClass='progress_bar-leftViewBar' waitingTime={0.5} isCommanded={false} tableNumber={tableNumber} /> */}
    </div>
  )
}

export default Bar