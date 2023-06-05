import React, { useState } from 'react'
import CustomModal from './generics/CustomModal'
import { Button } from 'react-bootstrap'
import { Bill } from '../types/bill'
import BillReviewItem from './BillReviewItem'
import { parseCurrency } from '../utils/currencyParser'
import { BillItem } from '../types/billItem'


interface Props {
  bill: Bill
}

const BillReview = ({ bill }: Props) => {
  const [show, setShow] = useState<boolean>(false)

  const getAddress = () => {
    if (bill.client.addressess.length === 0 || bill.addressId === 0)
      return ''
    return bill.client.addressess.find(address => address.id === bill.addressId)?.description
  }

  const getBillDiscount = () => {
    let billDiscount = 0
    for (const billItem of bill.items) {
      billDiscount += Number(billItem.discount)
    }
    return billDiscount
  }

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    try {
      let price = 0
      for (const billProduct of billItem.billProducts) {
        for (const product of billProduct.products) {
          price += Number(product.unitPrice)
          for (const modifier of product.modifiers) {
            if (typeof modifier.elements === 'undefined') continue
            for (const element of modifier.elements) {
              price += Number(element.price)
            }
          }
        }
      }
      return price
    } catch (error) {
      return 0
    }

  }

  const getBillTotal = () => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  const getBillTax = () => {
    let billTax = 0
    for (const billItem of bill.items) {
      billTax += billItem.tax
    }
    return billTax
  }

  const getBillSubtotal = () => {
    let billSubtotal = 0
    for (const billItem of bill.items) {
      billSubtotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem)
    }
    return billSubtotal
  }

  return (
    <>
      <Button variant={'outline-success'} className='mx-2' onClick={(() => setShow(true))}>
        Ver
      </Button>
      <CustomModal title='' show={show} handleClose={(() => setShow(false))}>
        <div className="col-6 d-flex flex-wrap justify-content-center rounded shadow">
          <div className="col-12 d-flex flex-wrap py-4" style={{ borderBottom: '1px solid rgba(0,0,0,.1)' }}>

            <div className="col-4 text-center fw-bold">
              {
                bill.client.name
              }
            </div>
            <div className="col-4 text-center fw-bold">
              {
                bill.client.phone
              }
            </div>
            <div className="col-4 text-center fw-bold">
              {
                getAddress()
              }
            </div>
          </div>
          <div className="col-12 d-flex flex-wrap my-3">

            {
              bill.items.map((billItem, index) => (
                <BillReviewItem key={index} billItem={billItem} />
              ))
            }
          </div>
          <div className="col-12 d-flex flex-wrap justify-content-end">
            <div className="col-4 d-flex flex-wrap">
              <strong className="col-7 px-2 text-end">Subtotal:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillSubtotal().toString())}</strong>
              <strong className="col-7 px-2 text-end">Impuesto:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillTax().toString())}</strong>
              <strong className="col-7 px-2 text-end">Desc:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillDiscount().toString())}</strong>
              <strong className="col-7 px-2 text-end">Total:</strong>
              <strong className="col-5 text-start">{parseCurrency(getBillTotal().toString())}</strong>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  )
}

export default BillReview