import React, { useContext, useEffect, useState } from 'react'
import GenericForm from './generics/GenericForm'
import { WorkDayUser } from '../types/workDayUser'
import CustomInputNumber from './generics/CustomInputNumber'
import { regexOptions } from '../enums/regexOptions'
import AppContext from '../context/AppContext'
import { useGet, usePost } from '../hooks/useAPI'

const initialWorkDayUser: WorkDayUser = {
  id: 0,
  workDayId: 0,
  userId: 0,
  initialCash: 0,
  finalCash: 0,
  sales: 0,
  diference: 0,
  expenses: [],
  entries: [],
  investments: [],
  close: false,
  delete: false,
  updatedBy: 0,
  createdBy: 0
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


const WorkDayUserForm = () => {
  const { setWorkDayUser, user, logout } = useContext(AppContext)
  const [currentWorkDayUser, setCurrentWorkDayUser] = useState({ ...initialWorkDayUser })
  const [errors, setErrors] = useState([])
  const [currencies, setCurrencies] = useState([...initialCurrencies])
  const submitText = 'Agregar'

  const addWorkDayUser = async () => {
    const response = await usePost<WorkDayUser>('workDayUsers', { ...currentWorkDayUser, userId: user.user?.id }, true)
    if (!response.error) {
      setCurrentWorkDayUser(response.data)
      setWorkDayUser()
    }
  }



  const handleChange = (event: any) => {
    const { name, value } = event.target
    setCurrentWorkDayUser({ ...currentWorkDayUser, [name]: value })
  }

  const handleCurrencyChange = (event: any, index: number) => {
    const { value } = event.target
    const newCurrencies = [...currencies]
    newCurrencies[index].count = value
    const total = newCurrencies.reduce((total, currency) => total + (currency.value * currency.count), 0)
    setCurrentWorkDayUser({ ...currentWorkDayUser, initialCash: total })
    setCurrencies(newCurrencies)
  }




  return (
    <div className="col-8 d-flex flex-wrap">
      <GenericForm errors={errors} submitText={submitText} handleSubmit={addWorkDayUser}>
        <div className='col-12 text-end logout-btn' onClick={logout}>Cerrar sesion</div>
        <div className="col-12 text-center fs-4">
          Inicia tu jornada
        </div>
        <CustomInputNumber value={currentWorkDayUser.initialCash} customInputNumber={
          {
            label: 'Dinero inicial', name: 'initialCash',
            handleChange: handleChange, pattern: regexOptions.decimal, validationMessage: 'Cantidad inicial invalida'
          }
        } />
        <div className="col-12 text-center fs-5 my-3">
          Conteo individual de dinero
        </div>
        <div className="col-12">
          <div className="row">
            {currencies.map((currency, index) => (
              <div className="col-3 my-2" key={index}>
                <div className="row">
                  <div className="col-4 m-0 d-flex p-0 justify-content-end" style={{ alignContent: 'center' }}>
                    <label className="form-label d-flex flex-wrap m-0 fw-bold" style={{ alignContent: 'center' }}>{currency.value}</label>
                  </div>
                  <div className="col-8">
                    <input type="number" className="form-control" name={`currency${currency.value}`} value={currency.count} onChange={(event) => handleCurrencyChange(event, index)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GenericForm>
    </div>
  )
}

export default WorkDayUserForm