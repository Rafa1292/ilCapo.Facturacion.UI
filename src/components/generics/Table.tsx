import React from 'react'
import '../../scss/table.scss'
interface Props {
  children: React.ReactNode
  headers: string[]
}
const Table = ({ headers, children }: Props) => {
  const [darkMode, setDarkMode] = React.useState<boolean>(false)

  return (
    <>
      <div className="col-12 d-flex justify-content-end">
        <div className="form-check form-switch">
          <input className="form-check-input" onChange={(() => setDarkMode(!darkMode))} type="checkbox" role="switch" id="flexSwitchCheckChecked" checked={darkMode} />
          <label className="form-check-label text-secondary" htmlFor="flexSwitchCheckChecked">Modo oscuro</label>
        </div>
      </div>
      <div className="table-responsive table-container col-12">

        <table className={`table shadow table-hover table-striped rounded ${darkMode ? 'table-dark' : ''}`}>
          <thead>
            <tr>
              {
                headers.map((header, index) => (
                  <th key={index} scope="col" className={`${index === 0 ? 'top-left-radius' : ''} ${index === (headers.length - 1) ? 'top-right-radius' : ''}`}>
                    <span className={'d-flex justify-content-center col-12'}>
                      {header}
                    </span>
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Table