import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkDayUser } from '../types/workDayUser'
import WorkDayUserForm from '../components/WorkDayUserForm'
import AppContext from '../context/AppContext'
import CustomInputNumber from '../components/generics/CustomInputNumber'
import { regexOptions } from '../enums/regexOptions'
import { useGetList, usePatch } from '../hooks/useAPI'
import { parseCurrency } from '../utils/currencyParser'
import { BillItem } from '../types/billItem'
import { Bill } from '../types/bill'

const initialWordayUser: WorkDayUser = {
  id: 0,
  initialCash: 0,
  sales: 0,
  close: false,
  delete: false,
  diference: 0,
  finalCash: 0,
  expenses: [],
  entries: [],
  investments: [],
  workDayId: 0,
  userId: 0,
  createdBy: 0,
  updatedBy: 0
}
interface currencyCount {
  value: number
  count: number
}
const initialCurrencies: currencyCount[] = [
  { value: 50000, count: 0 },
  { value: 20000, count: 0 },
  { value: 10000, count: 0 },
  { value: 5000, count: 0 },
  { value: 2000, count: 0 },
  { value: 1000, count: 0 },
  { value: 500, count: 0 },
  { value: 100, count: 0 },
  { value: 50, count: 0 },
  { value: 25, count: 0 },
  { value: 10, count: 0 },
  { value: 5, count: 0 },
]

const WorkDayUserPage = () => {
  const [currentWorkDayUser, setCurrentWorkDayUser] = useState<WorkDayUser>(initialWordayUser)
  const { user, logout, setWorkDayUser, billFunctions } = useContext(AppContext)
  const [currencies, setCurrencies] = useState([...initialCurrencies])
  const [bills, setBills] = useState<Bill[]>([])
  const navigate = useNavigate()

  const handleCurrencyChange = (event: any, index: number) => {
    const { value } = event.target
    const newCurrencies = [...currencies]
    newCurrencies[index].count = value
    const total = newCurrencies.reduce((total, currency) => total + (currency.value * currency.count), 0)
    setCurrentWorkDayUser({ ...currentWorkDayUser, finalCash: total })
    setCurrencies(newCurrencies)
  }

  const handleChange = (event: any) => {
    const { value } = event.target
    setCurrentWorkDayUser({ ...currentWorkDayUser, finalCash: value })
  }

  const getBillTotal = (bill: Bill) => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
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

  const getTotalBills = () => {
    const total = billFunctions.bills.reduce((total, bill) => total + getBillTotal(bill), 0)
    return total
  }


  const closeWorkDayUser = async () => {
    const response = await usePatch<WorkDayUser>('workDayUsers', currentWorkDayUser, true)
    if (!response.error) {
      await logout()
      await setWorkDayUser()
      navigate('/')
    }
  }

  useEffect(() => {
    const getBillsByWorkDay = async () => {
      const response = await useGetList<Bill[]>(`bills/billsByWorkDayUserClose/${user.workDayUser.id}`, true)
      if (!response.error) {
        console.log('bills', response.data)
        setBills(response.data)
      }
    }
    getBillsByWorkDay()
    setWorkDayUser()
    user.workDayUser.id !== 0 && setCurrentWorkDayUser(user.workDayUser)
    console.log('currentWorkDayUser', currentWorkDayUser)
  }, [billFunctions.bills])


  return (
    <div className='col-12 d-flex flex-wrap justify-content-center align-items-center' style={{ height: '100vh' }}>
      {currentWorkDayUser.id === 0 &&
        <WorkDayUserForm />
        ||
        <div className='d-flex col-4 justify-content-center flex-wrap'>
          <h4 className='col-12 text-center'>Esta es tu jornada de hoy</h4>
          <div className="col-12 justify-content-center d-flex flex-wrap mt-3">
            <div className="col-5 fw-bold text-end">
              Usuario:
            </div>
            <div className="col-5 mx-3 text-start">
              Mariela  Gonzales
            </div>
            <div className="col-5 fw-bold text-end">
              Dinero inicial:
            </div>
            <div className="col-5 mx-3 text-start">
              {parseCurrency(currentWorkDayUser.initialCash.toString())}
            </div>
            <div className="col-5 fw-bold text-end">
              Gastos:
            </div>
            <div className="col-5 mx-3 text-start">
              {parseCurrency(currentWorkDayUser.expenses.reduce((total, expense) => total + Number(expense.amount), 0).toString())}
            </div>
            <div className="col-5 fw-bold text-end">
              Inversiones:
            </div>
            <div className="col-5 mx-3 text-start">
              ¢ 5.000
            </div>
            <div className="col-5 fw-bold text-end">
              Ingresos:
            </div>
            <div className="col-5 mx-3 text-start">
              {parseCurrency(currentWorkDayUser.entries.reduce((total, entry) => total + entry.accountHistory.amount, 0).toString())}
            </div>
            <div className="col-5 fw-bold text-end">
              Ventas:
            </div>
            <div className="col-5 mx-3 text-start">
              {
                parseCurrency(getTotalBills().toString())
              }
            </div>
          </div>
          {
            !currentWorkDayUser.close &&
            <button className="btn btn-outline-danger col-5 mt-3" onClick={() => setCurrentWorkDayUser({ ...currentWorkDayUser, close: true })}>Cerrar jornada</button>
            ||
            <>
              <CustomInputNumber value={currentWorkDayUser.finalCash} showLabel={false} customInputNumber={
                {
                  label: 'Dinero final', name: 'finalCash',
                  handleChange: handleChange, pattern: regexOptions.decimal, validationMessage: 'Cantidad final invalida'
                }
              } />
              <button className="btn btn-outline-danger col-5 mt-3" onClick={closeWorkDayUser}>Enviar</button>
              <div className="col-12 text-center fs-5 my-3">
                Conteo individual de dinero
              </div>
              <div className="col-12">
                <div className="row">
                  {currencies.map((currency, index) => (
                    <div className="col-4 my-2" key={index}>
                      <div className="row">
                        <div className="col-4 m-0 d-flex p-0 justify-content-end" style={{ alignContent: 'center' }}>
                          <label className="form-label d-flex flex-wrap m-0 fw-bold" style={{ alignContent: 'center' }}>{currency.value}</label>
                        </div>
                        <div className="col-8">
                          <input type="number" className="form-control bg-transparent border border-secondary" name={`currency${currency.value}`} value={currency.count} onChange={(event) => handleCurrencyChange(event, index)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          }
        </div>
      }
    </div>
  )
}

export default WorkDayUserPage