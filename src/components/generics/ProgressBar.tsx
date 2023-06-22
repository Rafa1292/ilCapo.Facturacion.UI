import { table } from 'console'
import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../../context/AppContext'

interface Props {
  initialTime: Date | null
  finalTime: Date | null
  isCommanded: boolean
  isServe: boolean
  tableNumber: number
  styleClass: string
  timeMargin?: boolean
}

const ProgressBar = ({ initialTime, timeMargin, finalTime, isCommanded, styleClass, tableNumber, isServe }: Props) => {
  const [waitingMinutes, setWaitingMinutes] = useState(0)
  const [waitingSeconds, setWaitingSeconds] = useState(0)
  const [waitingHours, setWaitingHours] = useState(0)
  const [fill, setFill] = useState(0)
  const [widthValueBySecond, setWidthValueBySecond] = useState(0)
  const [waitingTime, setWaitingTime] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const setTime = () => {
    setFill(fill + widthValueBySecond)
    setWaitingSeconds(waitingSeconds + 1)
    if (waitingSeconds === 59) {
      setWaitingSeconds(0)
      setWaitingMinutes(waitingMinutes + 1)
    }
    if (waitingMinutes === 59) {
      setWaitingMinutes(0)
      setWaitingHours(waitingHours + 1)
    }
  }

  const setProgressBarClass = () => {
    const hoursToSeconds = waitingHours * 60 * 60
    const minutesToSeconds = waitingMinutes * 60
    const totalSeconds = hoursToSeconds + minutesToSeconds + waitingSeconds
    if ((totalSeconds >= waitingTime * 60) && !isServe) {
      return `linear-gradient(0deg, rgba(228, 41, 11, .8) 0%, rgba(228, 41, 11, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(228, 41, 11, 0) ${fill}%)`
    }

    if (isCommanded) {
      if (isServe)
        return `linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(0, 0, 0, 0) ${fill}%)`
      return `linear-gradient(0deg, rgba(50, 200, 50, 1) 0%, rgba(50, 200, 50, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(50, 200, 50, 0) ${fill}%)`
    }

    return `linear-gradient(0deg, rgba(77, 160, 190, 1) 0%, rgba(77, 160, 190, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(77, 160, 190, 0) ${fill}%)`
  }


  useEffect(() => {
    if (initialTime !== null && finalTime !== null) {
      const tmpWaitingTime = (finalTime.getTime() - initialTime.getTime()) / 60000
      const widthValue = 120 / (tmpWaitingTime * 60)
      const tmpElapsedTime = (initialTime.getTime() - new Date(Date.now()).getTime()) / -60000
      const tmpWaitingHours = Math.floor(tmpElapsedTime / 60)
      const tmpWaitingMinutes = tmpElapsedTime - (tmpWaitingHours * 60)
      const tmpWaitingSeconds = (tmpWaitingMinutes - Math.floor(tmpWaitingMinutes)) * 60
      setWaitingSeconds(Math.floor(tmpWaitingSeconds))
      setTimeout(() => setTime(), 1000)
      setWidthValueBySecond(widthValue)
      setWaitingTime(tmpWaitingTime)
      setTimeElapsed(tmpElapsedTime)
      if (tmpElapsedTime > tmpWaitingTime) {
        setFill(120)
      } else {
        if (isServe) {
          setFill(120)
        } else {
          setFill(Math.ceil(tmpElapsedTime * 60 * widthValue))
        }
      }
      setWaitingHours(tmpWaitingHours)
      setWaitingMinutes(Math.floor(tmpWaitingMinutes))
    } else {
      setWaitingTime(0)
      setWaitingHours(0)
      setWaitingMinutes(0)
      setWaitingSeconds(0)
      setFill(0)
    }
  }, [waitingSeconds, initialTime, finalTime, fill])

  return (
    <>
      {
        waitingTime !== 0 &&
        <div className='d-flex flex-wrap'>
          <div className={`mt-1 col-12 ${styleClass}`} style={{ background: setProgressBarClass() }}></div>
          <small className={`col-12 text-center d-flex align-items-center justify-content-center ${timeMargin ? 'mt-2': ''}`} style={{ width: '40px', textShadow: !timeMargin ? '1px 1px 2px rgba(0,0,0,.8)' : 'none' }}>{waitingHours > 0 ? `${waitingHours}:` : ''}{waitingMinutes < 10 ? `0${waitingMinutes}` : waitingMinutes}:{waitingSeconds}</small>
        </div>
      }
    </>
  )
}

export default ProgressBar