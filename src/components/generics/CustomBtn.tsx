import React, { useEffect, useState } from 'react'
import { buttonTypes } from '../../enums/buttonTypes'
import checkBtn from '../../assets/icons/check-circle-outline.png'
import closeBtn from '../../assets/icons/close-circle-outline.png'
import editBtn from '../../assets/icons/note-edit.png'
import deleteBtn from '../../assets/icons/trash-can.png'
import arrowUp from '../../assets/icons/arrow-up.png'
import arrowDown from '../../assets/icons/arrow-down.png'

interface Props {
  buttonType: buttonTypes
  action?: () => void
  height: string
}

const CustomBtn = ({ buttonType, action, height }: Props) => {
  const [btn, setBtn] = useState<string>(checkBtn)

  const initializeBtn = () => {
    switch (buttonType) {
    case buttonTypes.success:
      setBtn(checkBtn)
      break
    case buttonTypes.cancel:
      setBtn(closeBtn)
      break
    case buttonTypes.edit:
      setBtn(editBtn)
      break
    case buttonTypes.delete:
      setBtn(deleteBtn)
      break
    case buttonTypes.arrowUp:
      setBtn(arrowUp)
      break
    case buttonTypes.arrowDown:
      setBtn(arrowDown)
      break
    default:
      setBtn(checkBtn)
      break
    }
  }

  useEffect(() => {
    initializeBtn()
  }, [])
  return (
    <div style={{cursor: 'pointer'}} onClick={action} className='hover d-flex flex-wrap justify-content-center'>
      <img src={btn} style={{height: height}}/>
    </div>
  )
}

export default CustomBtn