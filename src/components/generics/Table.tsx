import React from 'react'
import '../../scss/table.scss'

interface header {
  label: string
  col: number
}
interface Props {
  children: React.ReactNode
  headers: header[]
}
const Table = ({ headers, children }: Props) => {
  const [darkMode, setDarkMode] = React.useState<boolean>(true)
  const darkBg = '#212529'
  const darkBgStripped = '#2c3034'

  return (
    <>
      <div className="table-container col-12">
        <div className="d-flex flex-wrap text-white py-2 top-left-radius top-right-radius" style={{ background: darkBg, width: 'calc(100% - 2px)' }}>
          {
            headers.map((header, index) => (
              <span key={index} className={`text-center col-${header.col}`}>
                {header.label}
              </span>
            ))
          }
        </div>
        <div className="col-12 m-0 p-0 scroll" style={{ maxHeight: '70vh', overflowY: 'scroll' }}>
          {children}
        </div>
      </div>
    </>
  )
}

export default Table