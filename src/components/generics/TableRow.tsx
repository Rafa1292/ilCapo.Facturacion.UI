import React from 'react'

interface Props {
  tableData: string[]
  children?: React.ReactNode
  classElement?: string
  crossOut?: boolean
}

const TableRow = ({ tableData, children, classElement, crossOut }: Props) => {
  return (
    <tr className={`${classElement}`}>
      {
        tableData.map((data, index) => <td key={index}>
          <div className={`custom-center ${crossOut ? 'cross-out text-danger' : ''}`}>
            {data}
          </div>
        </td>)
      }
      {
        children &&
        <td className={crossOut ? 'cross-out text-danger' : ''}>
          <div className='col-12 d-flex p-0 m-0 justify-content-end'>
            {children}
          </div>
        </td>
      }
    </tr>
  )
}

export default TableRow