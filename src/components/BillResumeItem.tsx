import React, { useEffect, useState } from 'react'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import '../scss/billResume.scss'

interface Props {
  billItem: BillItem
  removeLinkedProduct(saleItemId: number, itemNumber: number, billItemLinkedProductId: number): void
  handleEditLinkedProduct(saleItemId: number, itemNumber: number): void
}

const BillResumeItem = ({ billItem, removeLinkedProduct, handleEditLinkedProduct }: Props) => {
  const [show, setShow] = useState(false)

  const getBillItemTotal = (billItem: BillItem): number => {
    return ((billItem.unitPrice + billItem.tax - billItem.discount) * billItem.quantity) + getBillItemModifiersPrice(billItem)
  }

  const getDottedLine = (name: string): string => {
    const nameLength = name?.length
    let dottedLine = ''
    for (let index = 0; index < (30 - nameLength); index++) {
      dottedLine += '...'
    }
    return dottedLine
  }

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    try {
      let price = 0
      for (const billItemLinkedProduct of billItem.billProducts) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          price += Number(linkedProduct.unitPrice)
          for (const modifier of linkedProduct.modifiers) {
            for (const linkedProductModifierElement of modifier.elements) {
              price += Number(linkedProductModifierElement.price) * linkedProductModifierElement.quantity
            }
          }
        }
      }
      return price

    } catch (error) {
      return 0
    }
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
        billItem?.billProducts?.map((billProduct, index) => {
          return (
            <div key={index} className="col-12 d-flex flex-wrap bill-item_content p-0" style={
              {
                borderBottom: billItem.billProducts.length === (index + 1) ? '' : show ? '1px solid rgba(0,0,0,.2)' : 'none',
                maxHeight: show ? '1000px' : '0px'
              }
            }>
              {
                billProduct?.products?.map((product, index) => {
                  return (
                    index < 1 &&
                    <div key={index} className='col-12 d-flex flex-wrap p-0 position-relative'>
                      <div className='position-absolute' style={{ top: '5px', right: '5px' }}>
                        <CustomBtn height='25px' buttonType={buttonTypes.delete} action={() => removeLinkedProduct(billItem.saleItemId, billProduct.itemNumber, billProduct.id)} />
                      </div>
                      <div className='position-absolute' style={{ top: '5px', right: '30px' }}>
                        <CustomBtn height='25px' buttonType={buttonTypes.edit} action={() => handleEditLinkedProduct(billItem.saleItemId, billProduct.itemNumber)} />
                      </div>
                      <div className="col-7 d-flex flex-wrap p-2 ">
                        {product.name}
                        {
                          product?.modifiers?.map((modifier, index) => {
                            return (
                              <div key={index} className="col-12 d-flex flex-wrap" style={{ paddingLeft: '10px' }}>
                                <strong>
                                  {modifier.elements.length > 0 ? `-${modifier.name}` : ''}
                                </strong>
                                {
                                  modifier.elements?.map((element, index) => {
                                    return (
                                      <div key={index} className="col-12 d-flex flex-wrap" style={{ paddingLeft: '15px' }}>
                                        <div className="col-6 text-start px-2 break-text">
                                          -
                                          <strong className='mx-2'>
                                            {element.quantity}
                                          </strong>
                                          {element.name}
                                          {getDottedLine(element.name)}
                                        </div>
                                        <strong className='col-6 text-start'>
                                          {parseCurrency(Number(element.price * element.quantity).toString())}
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
                      <div className="col-5 p-2">
                        {
                          billProduct.products.length > 1 &&
                          <div className="col-12 d-flex flex-wrap">
                            <span className='col-12 text-start'>
                              Combinar con:
                            </span>
                            <strong className='col-12 text-start'>
                              {billProduct.products[1]?.name}
                              <span className='px-2'>
                                {parseCurrency(billProduct.products[1]?.unitPrice.toString())}
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