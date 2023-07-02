import React, { useEffect, useState } from 'react'
import ProgressBar from '../../components/generics/ProgressBar'

interface Props {
  initialTime: Date | null
  finalTime: Date | null
  isCommanded: boolean
  isServe: boolean
  tableNumber: number
  styleClass: string
  timeMargin?: boolean
}

const ProgressBarContainer = ({ initialTime, timeMargin, finalTime, tableNumber, isCommanded, styleClass, isServe }: Props) => {
  const [waitingSeconds, setWaitingSeconds] = useState(tableNumber)
  const [widthValueBySecond, setWidthValueBySecond] = useState(0)
  const [waitingTime, setWaitingTime] = useState(finalTime && initialTime ? ((finalTime.getTime() - initialTime.getTime()) / 60000) : 0)
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if (initialTime !== null && finalTime !== null) {
      const tmpWaitingTime = (finalTime.getTime() - initialTime.getTime()) / 60000
      const widthValue = 120 / (tmpWaitingTime * 60)
      const tmpElapsedTime = (new Date(Date.now()).getTime() - initialTime.getTime()) / 1000
      setWaitingSeconds(Math.floor(tmpElapsedTime))
      setWidthValueBySecond(widthValue)
      setWaitingTime(tmpWaitingTime)
    }
    setLoader(false)
  }, [initialTime, finalTime])

  return (
    <>
      {
        !loader &&
        <ProgressBar
          waitingTime={waitingTime}
          initialWaitingSeconds={waitingSeconds}
          isServe={isServe}
          isCommanded={isCommanded}
          styleClass={styleClass}
          timeMargin={timeMargin}
          widthValueBySecond={widthValueBySecond}
        />
      }
    </>
  )
}

export default ProgressBarContainer