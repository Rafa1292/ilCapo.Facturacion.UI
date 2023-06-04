import React, { useEffect } from 'react'
import CustomInputText from './generics/CustomInputText'
import CustomInputNumber from './generics/CustomInputNumber'
import { regexOptions } from '../enums/regexOptions'
import { buttonTypes } from '../enums/buttonTypes'
import CustomInputSelect from './generics/CustomInputSelect'
import CustomBtn from './generics/CustomBtn'
import { Bill } from '../types/bill'
import { usePost } from '../hooks/useAPI'
import { Address } from '../types/address'
import { Client } from '../types/client'
import cancel from '../assets/icons/close-circle-outline.png'
import add from '../assets/icons/add.png'
import { parseCurrency } from '../utils/currencyParser'
import { BillItem } from '../types/billItem'
import BillPayMethodSplit from './BillPayMethodSplit'
import { AccountHistory } from '../types/accountHistory'
import { BillAccountHistory } from '../types/billAccountHistory'

interface Props {
  bill: Bill
  getClient(phone: string): void
  moveBillItemBack(billItemLinkedProductId: number, saleItemId: number, itemNumber: number): void
  closeBill(billHistories: BillAccountHistory[]): void
  close: () => void
}

const BillPayMethodPullApart = ({ bill, close, getClient, closeBill, moveBillItemBack }: Props) => {
  const [phone, setPhone] = React.useState<string>('')
  const [name, setName] = React.useState<string>('')
  const [addressId, setAddressId] = React.useState<number>(0)
  const [newAddressState, setNewAddressState] = React.useState<boolean>(false)
  const [newAddress, setNewAddress] = React.useState<string>('')
  const [triangles, setTriangles] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

  const handleChangePhone = (event: any) => {
    const { value } = event.target
    setPhone(value)
    getClient(value)
  }

  const handleChangeName = (event: any) => {
    const { value } = event.target
    setName(value)
  }

  const handleChangeNewAddress = (event: any) => {
    const { value } = event.target
    setNewAddress(value)
  }

  const handleChangeAddress = (event: any) => {
    const { value } = event.target
    setAddressId(value)
  }

  const saveNewAddress = async () => {
    const response = await usePost<Address>('addresses', { id: 0, delete: false, description: newAddress, clientId: bill.client?.id, createdBy: 1, updatedBy: 1 }, true)
    if (!response.error) {
      bill.client.addressess.push(response.data)
      setAddressId(response.data?.id)
      setNewAddressState(false)
      setNewAddress('')
    }
  }

  const saveNewClient = async () => {
    const response = await usePost<Client>('clients', { id: 0, delete: false, name: name, phone: phone, addressess: [], createdBy: 1, updatedBy: 1 }, true)
    if (!response.error) {
      getClient(response.data.phone)
    }
  }

  const getBillTax = () => {
    let billTax = 0
    for (const billItem of bill.items) {
      billTax += billItem.tax
    }
    return billTax
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

  const getBillDiscount = () => {
    let billDiscount = 0
    for (const billItem of bill.items) {
      billDiscount += Number(billItem.discount)
    }
    return billDiscount
  }

  const getBillTotal = () => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  const getBillSubtotal = () => {
    let billSubtotal = 0
    for (const billItem of bill.items) {
      billSubtotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem)
    }
    return billSubtotal
  }

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

  useEffect(() => {
    if (bill.client) {
      setName(bill.client.name)
      setPhone(bill.client.phone)
    }
  }, [bill])

  return (
    <div className='col-12 d-flex flex-wrap' style={{ height: 'calc(100vh - 45px)', overflow: 'hidden' }}>
      <div className="col-5 d-flex flex-wrap shadow position-relative" style={{ height: 'calc(100vh - 45px)', overflowX: 'hidden' }}>
        <div className="col-12 d-flex flex-wrap justify-content-center align-items-center" style={{ marginTop: '4vh', height: '6vh' }}>
          {
            phone.length > 0 &&
            <div className="col-3 p-1">
              <CustomInputText value={name}
                customInputText={
                  {
                    label: 'Cliente', name: 'name',
                    handleChange: handleChangeName, pattern: regexOptions.text,
                    validationMessage: 'Ingrese un nombre válido'
                  }
                } />
            </div>
          }
          <div className="col-3 p-1">
            <CustomInputNumber showLabel={false} value={phone} customInputNumber={
              {
                label: 'Telefono', name: 'phone',
                handleChange: handleChangePhone, pattern: '', validationMessage: ''
              }
            } />
          </div>
          {
            newAddressState && phone.length > 0 && bill.client?.id > 0 &&
            <>
              <div className="col-4 d-flex flex-wrap p-1">
                <CustomInputText value={newAddress}
                  customInputText={
                    {
                      label: 'Nueva direccion', name: 'newAddress',
                      handleChange: handleChangeNewAddress, pattern: regexOptions.text,
                      validationMessage: 'Ingrese una direccion'
                    }
                  } />
              </div>
              <div className="col-1 d-flex align-content-center justify-content-center" style={{ height: '30px' }}>
                <CustomBtn buttonType={buttonTypes.success} action={() => saveNewAddress()} height='30px' />
              </div>
              <div className="col-1 d-flex align-content-center justify-content-center" style={{ height: '30px' }}>
                <img src={cancel} className='hover' onClick={() => setNewAddressState(false)} height={30} style={{ cursor: 'pointer' }} />
              </div>
            </>
          }
          {
            !newAddressState && phone.length > 0 && bill.client?.id > 0 &&
            <>
              <div className="col-4 d-flex flex-wrap p-1">
                <CustomInputSelect showLabel={false} value={addressId}
                  customInputSelect={
                    {
                      label: '', name: 'addressId',
                      handleChange: handleChangeAddress, pattern: '', validationMessage: 'Seleccione una direccion'
                    }}
                  data={bill.client?.addressess?.length > 0 ? bill.client.addressess.map(address => { return { value: address?.id, label: address.description } }) : []}
                  defaultLegend={'Direccion'}
                />
              </div>
              <div className="col-1 d-flex align-items-center justify-content-center" style={{ borderRadius: '5px', background: 'rgb(33,37,41)', height: '30px' }}>
                <img src={add} className='hover' onClick={() => setNewAddressState(true)} height={20} style={{ cursor: 'pointer' }} />
              </div>
            </>
          }
          {
            bill.client?.id === 0 && name.length > 0 && phone.length > 0 &&
            <div className="col-1 d-flex align-content-center justify-content-center" style={{ height: '30px' }}>
              <CustomBtn buttonType={buttonTypes.success} action={() => saveNewClient()} height='30px' />
            </div>
          }
        </div>
        <div className="col-12 d-flex flex-wrap scroll" style={{ height: 'calc(70vh - 45px)', overflowY: 'scroll' }}>
          {
            bill.items?.length !== 0 &&
            <>
              {bill.items.map((billItem, index) => (
                <div className="col-12 d-flex flex-wrap p-0" style={{ height: 'fit-content', borderBottom: '2px solid rgba(33,37,41,.8)' }} key={index}>
                  <div className="col-12 d-flex flex-wrap p-2 shadow-sm">
                    <strong className='text-center col-3'>{billItem.description}</strong>
                    <strong className='text-center col-2'>{parseCurrency(Number(billItem.unitPrice).toString())}</strong>
                    <strong className='text-center col-1'>{billItem.quantity}</strong>
                    <strong className='text-center col-2'>{billItem.tax}</strong>
                    <strong className='text-center col-2'>{billItem.discount}</strong>
                    <strong className='text-center col-2'>{parseCurrency(getBillItemTotal(billItem).toString())}</strong>
                  </div>
                  {
                    billItem?.billProducts?.map((billProduct, index) => {
                      return (
                        <div key={index} className="col-12 d-flex flex-wrap bill-item_content p-0" style={
                          {
                            borderBottom: '1px solid rgba(0,0,0,.2)',
                            maxHeight: '1000px'
                          }
                        }>
                          {
                            billProduct?.products?.map((product, index) => {
                              return (
                                index < 1 &&
                                <div key={index} className='col-12 d-flex flex-wrap p-0 position-relative'>
                                  <button className='position-absolute btn btn-outline-success' style={{ top: '5px', right: '5px' }} onClick={() => moveBillItemBack(billProduct.id, billItem.saleItemId, billProduct.itemNumber)}>
                                    Mover
                                  </button>
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
                                        <span className='col-12 text-start flex-wrap d-flex position-relative'>
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
              ))}
            </>
          }
        </div>
        <div className="col-12 d-flex flex-wrap py-4" style={{ height: '20vh', alignContent: 'end' }}>
          <div className="col-7 d-flex flex-wrap justify-content-around">
          </div>
          <div className="col-5 d-flex flex-wrap py-2" style={{ height: 'fit-content' }} >
            <strong className="col-7 text-end">Subtotal:</strong>
            <strong className="col-5 px-2 text-start">{parseCurrency(getBillSubtotal().toString())}</strong>
            <strong className="col-7 text-end">Impuesto:</strong>
            <strong className="col-5 px-2 text-start">{parseCurrency(getBillTax().toString())}</strong>
            <strong className="col-7 text-end">Descuento:</strong>
            <strong className="col-5 px-2 text-start">{parseCurrency(getBillDiscount().toString())}</strong>
            <strong className="col-7 text-end">Total:</strong>
            <strong className="col-5 px-2 text-start">{parseCurrency(getBillTotal().toString())}</strong>
          </div>
        </div>
        <div className="col-12 d-flex position-absolute" style={{ overflow: 'hidden', bottom: '0px' }}>
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
      <div className="col-7 d-flex flex-wrap justify-content-center py-2 scroll" style={{height: 'calc(100vh - 45px)', overflowY: 'scroll'}}>
        <BillPayMethodSplit close={close} initialParts={1} size='col-6' closeBill={closeBill} getBillTotal={getBillTotal} />
      </div>

    </div>

  )
}

export default BillPayMethodPullApart