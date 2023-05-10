import React from 'react'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'
import '../scss/billResume.scss'
import BillResumeItem from './BillResumeItem'

interface Props {
  bill: Bill
  removeLinkedProduct(saleItemId: number, itemNumber: number, billItemLinkedProductId: number): void
}

const BillResume = ({ bill, removeLinkedProduct }: Props) => {
  const [triangles, setTriangles] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

  const getBillTax = () => {
    let billTax = 0
    for (const billItem of bill.billItems) {
      billTax += billItem.tax
    }
    return billTax
  }

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    let price = 0
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        price += Number(linkedProduct.unitPrice)
        for (const iterator of linkedProduct.linkedProductModifiers) {
          for (const linkedProductModifierElement of iterator.linkedProductModifierElements) {
            price += Number(linkedProductModifierElement.price)
          }
        }
      }
    }
    return price
  }

  const getBillSubtotal = () => {
    let billSubtotal = 0
    for (const billItem of bill.billItems) {
      billSubtotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem)
    }
    return billSubtotal
  }

  const getBillDiscount = () => {
    let billDiscount = 0
    for (const billItem of bill.billItems) {
      billDiscount += Number(billItem.discount)
    }
    return billDiscount
  }

  const getBillTotal = () => {
    let billTotal = 0
    for (const billItem of bill.billItems) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  return (
    <>
      <div className="col-12 d-flex flex-wrap p-0">
        <div className="col-12 d-flex flex-wrap p-2 bill-resume_header">
          <strong className='text-center col-3'>Producto</strong>
          <strong className='text-center col-2'>Precio</strong>
          <strong className='text-center col-1'>Cant</strong>
          <strong className='text-center col-2'>Imp</strong>
          <strong className='text-center col-2'>Descuento</strong>
          <strong className='text-center col-2'>Total</strong>
        </div>
        <div className="col-12 d-flex flex-wrap p-0 bill-resume_content">
          {
            bill.billItems.map((billItem, index) => {
              return (
                <BillResumeItem removeLinkedProduct={removeLinkedProduct} key={index} billItem={billItem} />
              )
            })
          }
        </div>

        <div className="col-12 d-flex flex-wrap position-absolute" style={{ height: '16vh', background: 'white', bottom: '0', overflow: 'hidden' }}>
          <div className="col-12 d-flex flex-wrap py-4">
            <div className="col-7 d-flex flex-wrap justify-content-around">
              <div className='command_btn'>
                <div className='command_icon'></div>
              </div>
              <div className='cash_btn'>
                <div className='cash_icon'></div>
              </div>
            </div>
            <div className="col-5 d-flex flex-wrap">
              <strong className="col-7 px-2 text-end">Subtotal:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillSubtotal().toString())}</strong>
              <strong className="col-7 px-2 text-end">Impuesto:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillTax().toString())}</strong>
              <strong className="col-7 px-2 text-end">Descuento:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillDiscount().toString())}</strong>
              <strong className="col-7 px-2 text-end">Total:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillTotal().toString())}</strong>
            </div>
          </div>
          <div className="col-12 d-flex" style={{ overflow: 'hidden' }}>
            {
              triangles.map((triangle, index) => {
                return (
                  <div key={index} className="triangle"></div>
                )
              }
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default BillResume