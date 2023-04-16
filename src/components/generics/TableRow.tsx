import React from 'react'

interface Props {
  tableData: string[]
  children?: React.ReactNode
}

const TableRow = ({ tableData, children }: Props) => {
  return (
    <tr>
      {
        tableData.map((data, index) => <td className='' key={index}><div className='custom-center'>{data}</div></td>)
      }
      {
        children &&
        <td className=''>
          <div className='col-12 d-flex p-0 m-0 justify-content-end'>
            {children}
          </div>
        </td>
      }
    </tr>
  )
}

export default TableRow