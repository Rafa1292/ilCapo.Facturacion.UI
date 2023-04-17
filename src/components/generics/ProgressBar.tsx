import React, { useEffect, useState } from 'react'

interface Props {
  waitingTime: number
  isCommanded: boolean
  tableNumber: number
  styleClass: string
}

const ProgressBar = ({ waitingTime, isCommanded, tableNumber, styleClass }: Props) => {
  const [waitingMinutes, setWaitingMinutes] = useState(0)
  const [waitingSeconds, setWaitingSeconds] = useState(0)
  const [waitingHours, setWaitingHours] = useState(0)
  const [fill, setFill] = useState(0)
  const [widthValueBySecond] = useState(120 / (waitingTime * 60))

  const setTime = () => {
    setFill(fill + widthValueBySecond)
    setWaitingSeconds(waitingSeconds + 1)
    if (waitingSeconds === 60) {
      setWaitingSeconds(0)
      setWaitingMinutes(waitingMinutes + 1)
    }
    if (waitingMinutes === 60) {
      setWaitingMinutes(0)
      setWaitingHours(waitingHours + 1)
    }
  }

  const setProgressBarClass = () => {
    const hoursToSeconds = waitingHours * 60 * 60
    const minutesToSeconds = waitingMinutes * 60
    const totalSeconds = hoursToSeconds + minutesToSeconds + waitingSeconds
    if (totalSeconds >= waitingTime * 60) {
      return `linear-gradient(0deg, rgba(228, 41, 11, .8) 0%, rgba(228, 41, 11, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(228, 41, 11, 0) ${fill}%)`
    }

    if (isCommanded) {
      return `linear-gradient(0deg, rgba(50, 200, 50, 1) 0%, rgba(50, 200, 50, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(50, 200, 50, 0) ${fill}%)`
    }

    return `linear-gradient(0deg, rgba(77, 160, 90, 1) 0%, rgba(77, 160, 90, 1) ${fill > 20 ? fill - 20 : fill - 2}%, rgba(77, 160, 90, 0) ${fill}%)`
  }


  useEffect(() => {
    setTimeout(() => setTime(), 1000)
  }, [waitingSeconds])

  return (
    <>
      <div className={`mt-1 ${styleClass}`} style={{ background: setProgressBarClass() }}></div>
      <div className="d-flex flex-wrap position-relative pt-3">
        <small className="col-12 text-center" style={{position: 'absolute', top: '5px'}}>{waitingMinutes}:{waitingSeconds}</small>
        <div className="col-12 text-center" style={{minWidth: '40px'}}>
          <strong>#{tableNumber}</strong>
        </div>
      </div>
    </>

  )
}

export default ProgressBar