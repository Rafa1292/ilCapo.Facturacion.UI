import React, { useContext, useEffect } from 'react'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import { parseCurrency } from '../utils/currencyParser'
import '../scss/billResume.scss'
import BillResumeItem from './BillResumeItem'
import CustomInputNumber from './generics/CustomInputNumber'
import CustomInputText from './generics/CustomInputText'
import { Client } from '../types/client'
import { regexOptions } from '../enums/regexOptions'
import CustomInputSelect from './generics/CustomInputSelect'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import cancel from '../assets/icons/close-circle-outline.png'
import add from '../assets/icons/add.png'
import dish from '../assets/icons/dish.png'
import moto from '../assets/icons/moto.png'
import carry from '../assets/icons/carry.png'
import { useGet, usePost } from '../hooks/useAPI'
import { Address } from '../types/address'
import BillResumeDiscount from './BillResumeDiscount'
import { get } from 'http'
import AppContext from '../context/AppContext'
interface Props {
  bill: Bill
  getClient(phone: string, table: number): void
  handleEditLinkedProduct(saleItemId: number, itemNumber: number): void
  commandBill(): void
  showPayMethods(): void
  pullApartBill: boolean
}

const BillResume = ({ bill, showPayMethods, pullApartBill, handleEditLinkedProduct, commandBill, getClient }: Props) => {
  const [triangles, setTriangles] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  const [phone, setPhone] = React.useState<string>('')
  const [name, setName] = React.useState<string>('')
  const [addressId, setAddressId] = React.useState<number>(0)
  const [newAddressState, setNewAddressState] = React.useState<boolean>(false)
  const [newAddress, setNewAddress] = React.useState<string>('')
  const [availableTables, setAvailableTables] = React.useState<number[]>([])
  const { billFunctions } = useContext(AppContext)


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

  const getBillSubtotal = () => {
    let billSubtotal = 0
    for (const billItem of bill.items) {
      billSubtotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem)
    }
    return billSubtotal
  }

  const handleChangePhone = (event: any) => {
    const { value } = event.target
    setPhone(value)
    getClient(value, bill.tableNumber)
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
    billFunctions.setBillAddress(value, bill.id, bill.tableNumber)
    setAddressId(value)
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
      getClient(response.data.phone, bill.tableNumber)
    }
  }

  const getTableNumbersWithBillOpen = async () => {
    const tableNumbers: number[] = []
    const response = await useGet<number[]>('bills/tableNumbersAvailable', true)
    if (!response.error) {
      for (const tableNumber of response.data) {
        tableNumbers.push(tableNumber)
      }
    }
    if (!tableNumbers.includes(bill.tableNumber)) {
      tableNumbers.push(bill.tableNumber)
    }
    setAvailableTables([...tableNumbers])
  }

  const handleChangeTable = async () => {
    await getTableNumbersWithBillOpen()
    billFunctions.setDeliveryMethod(0, bill.id, bill.tableNumber)
  }

  useEffect(() => {
    if (bill.client) {
      setName(bill.client.name)
      setPhone(bill.client.phone)
      setAddressId(bill.addressId)
    }
    getTableNumbersWithBillOpen()

  }, [bill.client, newAddressState])

  return (
    <>
      <div className="col-12 d-flex flex-wrap p-0">
        <div className="col-12 d-flex flex-wrap justify-content-center position-absolute" style={{ top: '1vh' }}>
          <span onClick={() => billFunctions.setDeliveryMethod(1, bill.id, bill.tableNumber)} className={`p-2 rounded hover mx-1 ${bill.deliveryMethod === 1 ? 'bg-success' : 'bg-dark'}`}>
            <img src={carry} height={25} />
          </span>
          <span onClick={() => billFunctions.setDeliveryMethod(2, bill.id, bill.tableNumber)} className={`p-2 rounded hover mx-1 ${bill.deliveryMethod === 2 ? 'bg-success' : 'bg-dark'}`}>
            <img src={moto} height={25} />
          </span>
          <span onClick={() => handleChangeTable()} className={`p-2 rounded hover mx-1 ${bill.deliveryMethod === 0 ? 'bg-success' : 'bg-dark'}`}>
            <img src={dish} height={25} />
          </span>
          {
            bill.deliveryMethod === 0 &&
            <div className="col-2 d-flex flex-wrap p-0 align-content-center position-absolute" style={{ height: '25px !important', right: '12%' }}>
              <CustomInputSelect showLabel={false} value={bill.tableNumber}
                customInputSelect={
                  {
                    label: '', name: 'tableNumber',
                    handleChange: (ev) => billFunctions.changeTableNumber(bill.tableNumber, ev.target.value), pattern: '', validationMessage: ''
                  }}
                data={availableTables.length > 0 ? availableTables.map(table => { return { value: table, label: table.toString() } }) : []}
                defaultLegend={'0'}
              />
            </div>
          }

        </div>
        <div className="col-12 d-flex flex-wrap justify-content-center align-items-center" style={{ marginTop: '6vh' }}>
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
        <div className="col-12 d-flex flex-wrap p-2 align-items-center bill-resume_header">
          <strong className='text-center col-3'>Producto</strong>
          <strong className='text-center col-2'>Precio</strong>
          <strong className='text-center col-1'>Cant</strong>
          <strong className='text-center col-2'>Imp</strong>
          <strong className='text-center col-2'>Descuento</strong>
          <strong className='text-center col-2'>Total</strong>
        </div>
        <div className="col-12 d-flex flex-wrap p-0 bill-resume_content">
          {
            bill.items.map((billItem, index) => {
              return (
                <BillResumeItem
                  billId={bill.id}
                  tableNumber={bill.tableNumber}
                  pullApartBill={pullApartBill}
                  handleEditLinkedProduct={handleEditLinkedProduct}
                  key={index}
                  billItem={billItem} />
              )
            })
          }
        </div>

        <div className="col-12 d-flex flex-wrap position-absolute" style={{ height: '16vh', background: 'white', bottom: '15px' }}>
          <div className="col-12 d-flex flex-wrap py-4">
            <div className="col-8 d-flex flex-wrap justify-content-around">
              <div className='command_btn' onClick={commandBill}>
                <div className='command_icon'></div>
              </div>
              <div className='cash_btn' onClick={showPayMethods}>
                <div className='cash_icon'></div>
              </div>
              <BillResumeDiscount billId={bill.id} tableNumber={bill.tableNumber} total={getBillTotal()} />
            </div>
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