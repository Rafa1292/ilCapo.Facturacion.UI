import React from 'react'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'
import '../scss/billResume.scss'
import BillResumeItem from './BillResumeItem'

interface Props {
  bill: Bill
}

const BillResume = ({ bill }: Props) => {
  return (
    <>
      <div className="col-12 d-flex flex-wrap mt-5 p-0">
        <div className="col-12 d-flex flex-wrap p-2" style={{ borderTop: '2px solid rgba(33,37,41,.8)', borderBottom: '2px solid rgba(33,37,41,.8)' }}>
          <strong className='text-center col-3'>Producto</strong>
          <strong className='text-center col-2'>Precio</strong>
          <strong className='text-center col-1'>Cant</strong>
          <strong className='text-center col-2'>Impuesto</strong>
          <strong className='text-center col-2'>Descuento</strong>
          <strong className='text-center col-2'>Total</strong>
        </div>
        {
          bill.billItems.map((billItem, index) => {
            return (
              <BillResumeItem key={index} billItem={billItem} />
            )
          })
        }
      </div>
    </>
  )
}

export default BillResume