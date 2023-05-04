import React from 'react'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'

interface Props {
  bill: Bill
}

const BillResume = ({ bill }: Props) => {

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    let price = 0
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const iterator of linkedProduct.linkedProductModifiers) {
          for (const linkedProductModifierElement of iterator.linkedProductModifierElements) {
            price += Number(linkedProductModifierElement.price)
          }
        }
      }
    }
    return price
  }

  const getBillItemTotal = (billItem: BillItem): number => {
    return ((billItem.unitPrice + billItem.tax - billItem.discount) * billItem.quantity) + getBillItemModifiersPrice(billItem)
  }

  const getDottedLine = (name: string): string => {
    const nameLength = name.length
    let dottedLine = ''
    for (let index = 0; index < (30 - nameLength); index++) {
      dottedLine += '...'
    }
    return dottedLine
  }

  return (
    <>
      <div className="col-12 d-flex flex-wrap mt-5 px-1">
        <div className="col-12 d-flex flex-wrap py-1" style={{ borderTop: '1px solid rgba(0,0,0,5)', borderBottom: '1px solid rgba(0,0,0,5)' }}>
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
              <div key={index} className="col-12 d-flex flex-wrap p-2">
                <div className="col-12 d-flex flex-wrap mb-2">
                  <strong className='text-center col-3'>{billItem.description}</strong>
                  <strong className='text-center col-2'>{parseCurrency(Number(billItem.unitPrice).toString())}</strong>
                  <strong className='text-center col-1'>{billItem.quantity}</strong>
                  <strong className='text-center col-2'>{billItem.tax}</strong>
                  <strong className='text-center col-2'>{billItem.discount}</strong>
                  <strong className='text-center col-2'>{parseCurrency(getBillItemTotal(billItem).toString())}</strong>
                </div>
                {
                  billItem.billItemLinkedProducts.map((billItemLinkedProduct, index) => {
                    return (
                      <div key={index} className="col-12 d-flex flex-wrap py-2" style={{ borderBottom: '1px solid rgba(0,0,0,.2)' }}>
                        {
                          billItemLinkedProduct.linkedProducts.map((linkedProduct, index) => {
                            return (
                              <div key={index} className="col-12 d-flex flex-wrap">
                                {billItem.billItemLinkedProducts?.length > 1 ? linkedProduct.name : ''}

                                {
                                  linkedProduct.linkedProductModifiers.map((linkedProductModifier, index) => {
                                    return (
                                      <div key={index} className="col-12 d-flex flex-wrap" style={{ paddingLeft: '10px' }}>
                                        <strong>
                                          {linkedProductModifier.linkedProductModifierElements.length > 0 ? `-${linkedProductModifier.name}` : ''}
                                        </strong>
                                        {
                                          linkedProductModifier.linkedProductModifierElements.map((linkedProductModifierElement, index) => {
                                            return (
                                              <div key={index} className="col-12 d-flex flex-wrap" style={{ paddingLeft: '15px' }}>
                                                <div className="col-4 text-start px-2 break-text">
                                                  *{linkedProductModifierElement.name}
                                                  {getDottedLine(linkedProductModifierElement.name)}
                                                </div>
                                                <strong className='col-4 text-start'>
                                                  {parseCurrency(Number(linkedProductModifierElement.price).toString())}
                                                </strong>
                                              </div>
                                            )
                                          })
                                        }
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            )
                          })
                        }
                      </div>
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    </>
  )
}

export default BillResume