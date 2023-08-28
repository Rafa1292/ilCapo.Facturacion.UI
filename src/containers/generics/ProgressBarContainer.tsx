import React, { useEffect, useState } from 'react'
import ProgressBar from '../../components/generics/ProgressBar'

interface Props {
  initialTime: Date | null
  finalTime: Date | null
  isCommanded: boolean
  isServe: boolean
  styleClass: string
  timeMargin?: boolean
}

const ProgressBarContainer = ({
  initialTime,
  timeMargin,
  finalTime,
  isCommanded,
  styleClass,
  isServe,
}: Props) => {
  const [waitingSeconds, setWaitingSeconds] = useState(0)
  const [widthValueBySecond, setWidthValueBySecond] = useState(0)
  const [waitingTime, setWaitingTime] = useState(
    finalTime && initialTime
      ? (finalTime.getTime() - initialTime.getTime()) / 60000
      : 0
  )

  useEffect(() => {
    if (initialTime !== null && finalTime !== null) {
      const tmpWaitingTime =
        (finalTime.getTime() - initialTime.getTime()) / 60000
      const widthValue = 120 / (tmpWaitingTime * 60)
      const now = new Date()
      const tmpElapsedTime = (now.getTime() - initialTime.getTime()) / 1000
      setWaitingSeconds(Math.floor(tmpElapsedTime))
      setWidthValueBySecond(widthValue)
      setWaitingTime(tmpWaitingTime)
    }
  }, [initialTime, finalTime, waitingSeconds])

  return (
    <>
      {initialTime !== null && finalTime !== null && (
        <ProgressBar
          waitingTime={waitingTime}
          initialWaitingSeconds={waitingSeconds}
          isServe={isServe}
          isCommanded={isCommanded}
          styleClass={styleClass}
          timeMargin={timeMargin}
          widthValueBySecond={widthValueBySecond}
        />
      )}
    </>
  )
}

export default ProgressBarContainer
