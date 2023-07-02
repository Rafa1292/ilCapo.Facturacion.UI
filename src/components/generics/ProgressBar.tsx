import React, { useEffect, useState } from 'react'

interface Props {
  timeMargin?: boolean
  initialWaitingSeconds: number
  isCommanded: boolean
  styleClass: string
  isServe: boolean
  waitingTime: number
  widthValueBySecond: number
}

const ProgressBar = ({ timeMargin, initialWaitingSeconds, isCommanded, styleClass, isServe, widthValueBySecond, waitingTime }: Props) => {
  const [currentWaitingSeconds, setCurrentWaitingSeconds] = useState(0)
  const [waitingMinutes, setWaitingMinutes] = useState(0)
  const [waitingSeconds, setWaitingSeconds] = useState(0)
  const [waitingHours, setWaitingHours] = useState(0)
  const [fill, setFill] = useState(0)

  const setTime = () => {
    setCurrentWaitingSeconds(currentWaitingSeconds + 1)
    const tmpWaitingSeconds = initialWaitingSeconds + currentWaitingSeconds + 1
    const tmpWaitingMinutes = Math.floor(tmpWaitingSeconds / 60)
    const tmpWaitingHours = Math.floor(tmpWaitingMinutes / 60)
    setWaitingSeconds(tmpWaitingSeconds % 60)
    setWaitingMinutes(tmpWaitingMinutes % 60)
    setWaitingHours(tmpWaitingHours)
    setFill(widthValueBySecond * tmpWaitingSeconds)
  }

  const setProgressBarClass = () => {
    const totalSeconds = initialWaitingSeconds + currentWaitingSeconds
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
    setTimeout(() => setTime(), 1000)
  }, [waitingSeconds])

  return (
    <>
      {
        waitingTime !== 0 &&
        <div className='d-flex flex-wrap'>
          <div className={`mt-1 col-12 ${styleClass}`} style={{ background: setProgressBarClass() }}></div>
          <small className={`col-12 text-center d-flex align-items-center justify-content-center ${timeMargin ? 'mt-2' : ''}`} style={{ width: '40px', textShadow: !timeMargin ? '1px 1px 2px rgba(0,0,0,.8)' : 'none' }}>
            {
              waitingHours > 0 ?
                `${waitingHours}:` :
                ''
            }
            {
              waitingMinutes < 10 ?
                `0${waitingMinutes}` :
                waitingMinutes
            }
            :
            {
              waitingSeconds
            }
          </small>
        </div>
      }
    </>
  )
}

export default ProgressBar