import React from 'react'

interface TableRowProps {
  content: string
  col: number
}

interface Props {
  tableData: TableRowProps[]
  children?: React.ReactNode
  classElement?: string
  crossOut?: boolean
  bgColor: string
}

const TableRow = ({ tableData, bgColor, children, classElement, crossOut }: Props) => {
  const actionsWidth = 12 - tableData.reduce((acc, curr) => acc + curr.col, 0)

  return (
    <div className={`col-12 d-flex flex-wrap py-3 ${classElement}`} style={{ background: bgColor }}>
      {
        tableData.map((data, index) =>
          <div style={{color: 'white'}} className={`text-center col-${data.col} ${crossOut ? 'cross-out text-danger' : ''}`} key={index}>
            {data.content}
          </div>
        )
      }
      {
        children &&
        <div className={`d-flex flex-wrap justify-content-center col-${actionsWidth}`}>
          {children}
        </div>
      }
    </div>
  )
}

export default TableRow
