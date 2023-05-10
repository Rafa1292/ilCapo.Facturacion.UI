import React, { useState } from 'react'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import '../scss/billResume.scss'

interface Props {
  billItem: BillItem
  removeLinkedProduct(saleItemId: number, itemNumber: number, billItemLinkedProductId: number): void
}

const BillResumeItem = ({ billItem, removeLinkedProduct }: Props) => {
  const [show, setShow] = useState(false)

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

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    let price = 0
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        price += Number(linkedProduct.unitPrice)
        for (const iterator of linkedProduct.linkedProductModifiers) {
          for (const linkedProductModifierElement of iterator.linkedProductModifierElements) {
            price += Number(linkedProductModifierElement.price * linkedProductModifierElement.quantity)
          }
        }
      }
    }
    return price
  }

  return (
    <div className="col-12 d-flex flex-wrap p-0" style={{ height: 'fit-content', borderBottom: '2px solid rgba(33,37,41,.8)' }}>
      <div className="col-12 d-flex flex-wrap p-2 shadow-sm">
        <strong className='text-center col-3'>{billItem.description}</strong>
        <strong className='text-center col-2'>{parseCurrency(Number(billItem.unitPrice).toString())}</strong>
        <strong className='text-center col-1'>{billItem.quantity}</strong>
        <strong className='text-center col-2'>{billItem.tax}</strong>
        <strong className='text-center col-2'>{billItem.discount}</strong>
        <strong className='text-center col-2'>{parseCurrency(getBillItemTotal(billItem).toString())}</strong>
        <div className="col-12 d-flex justify-content-center">
          <span className='hover' style={{ cursor: 'pointer', color: 'darkgreen' }} onClick={() => setShow(!show)}>{!show ? 'Ver items' : 'Ocultar items'}</span>
        </div>
      </div>
      {
        billItem.billItemLinkedProducts.map((billItemLinkedProduct, index) => {
          return (
            <div key={index} className="col-12 d-flex flex-wrap bill-item_content p-0" style={
              {
                borderBottom: billItem.billItemLinkedProducts.length === (index + 1) ? '' : show ? '1px solid rgba(0,0,0,.2)' : 'none',
                maxHeight: show ? '1000px' : '0px'
              }
            }>
              {
                billItemLinkedProduct.linkedProducts.map((linkedProduct, index) => {
                  return (
                    index < 1 &&
                    <div key={index} className='col-12 d-flex flex-wrap p-0 position-relative'>
                      <div className='position-absolute' style={{ top: '5px', right: '5px' }}>
                        <CustomBtn height='25px' buttonType={buttonTypes.delete} action={() => removeLinkedProduct(billItemLinkedProduct.id, billItemLinkedProduct.itemNumber, billItemLinkedProduct.id)} />
                      </div>
                      <div className="col-10 d-flex flex-wrap p-2 ">
                        {linkedProduct.name}
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
                                        <div className="col-6 text-start px-2 break-text">
                                          -
                                          <strong className='mx-2'>
                                            {linkedProductModifierElement.quantity}
                                          </strong>
                                          {linkedProductModifierElement.name}
                                          {getDottedLine(linkedProductModifierElement.name)}
                                        </div>
                                        <strong className='col-6 text-start'>
                                          {parseCurrency(Number(linkedProductModifierElement.price * linkedProductModifierElement.quantity).toString())}
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
                      <div className="col-4 p-2">
                        {
                          billItemLinkedProduct.linkedProducts.length > 1 &&
                          <div className="col-12 d-flex flex-wrap">
                            <span className='col-12 text-start'>
                              Combinar con:
                            </span>
                            <strong className='col-12 text-start'>
                              {billItemLinkedProduct.linkedProducts[1]?.name}
                              <span className='px-2'>
                                {parseCurrency(billItemLinkedProduct.linkedProducts[1]?.unitPrice.toString())}
                              </span>
                            </strong>
                          </div>
                        }
                      </div>
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
}

export default BillResumeItem