import React, { useContext, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import CustomModal from './generics/CustomModal'
import { Expense } from '../types/expense'
import { useGetList, usePost } from '../hooks/useAPI'
import CustomInputText from './generics/CustomInputText'
import { regexOptions } from '../enums/regexOptions'
import CustomInputNumber from './generics/CustomInputNumber'
import CustomInputSelect from './generics/CustomInputSelect'
import { Provider } from '../types/provider'
import GenericForm from './generics/GenericForm'
import '../scss/expense.scss'
import AccountHistoryForm from './AccountHistoryForm'
import { AccountHistory } from '../types/accountHistory'
import { ExpenseAccountHistory } from '../types/expenseAccounntHistory'
import * as validator from '../utils/errorValidation'
import CustomInputCheck from './generics/CustomInputChecbox'
import { parseCurrency } from '../utils/currencyParser'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import AppContext from '../context/AppContext'

const initialExpense: Expense = {
  id: 0,
  amount: 0,
  description: '',
  delete: false,
  isNull: false,
  pendingPay: false,
  createdBy: 0,
  updatedBy: 0,
  providerId: 0,
  workDayUserId: 0,
  expenseAccountHistories: []
}

const initialExpenseAccountHistory: ExpenseAccountHistory = {
  accountHistory: {} as AccountHistory,
  accountHistoryId: 0,
  delete: false,
  expenseId: 0,
  id: 0,
  createdBy: 0,
  updatedBy: 0
}

const ExpenseForm = () => {
  const { user,setWorkDayUser } = useContext(AppContext)
  const [show, setShow] = useState<boolean>(false)
  const [expense, setExpense] = useState(initialExpense)
  const [providers, setProviders] = useState<Provider[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async () => {
    if (expense.providerId <= 0) {
      validator.validateNumber(0, 'providerId', /^[0-9]*$/, false)
      setErrors(['Debe seleccionar un proveedor'])
    } else {
      setErrors([])
      const response = await usePost('expenses', {...expense, workDayUserId: user.workDayUser.id }, true)
      if (!response.error) {
        setExpense(initialExpense)
        setWorkDayUser()
        setShow(false)
      }
    }

  }

  const handleChange = (event: any) => {
    const { name, value } = event.target
    setExpense({ ...expense, [name]: value })
  }

  const handleProvider = (event: any) => {
    const { value } = event.target
    setExpense({ ...expense, providerId: value })
  }

  const handleAccountHistory = (accountHistory: AccountHistory): boolean => {
    if (validateAccountHistory(accountHistory)) {
      const expenseAccountHistory: ExpenseAccountHistory = { ...initialExpenseAccountHistory, accountHistory, id: expense.expenseAccountHistories.length + 1 }
      setExpense({ ...expense, expenseAccountHistories: [...expense.expenseAccountHistories, expenseAccountHistory] })
      return true
    }
    return false
  }

  const fastPayAction = async (accountHistory: AccountHistory) => {
    if (expense.providerId <= 0) {
      validator.validateNumber(0, 'providerId', /^[0-9]*$/, false)
      setErrors(['Debe seleccionar un proveedor'])
    } else {
      setErrors([])
      const expenseAccountHistory: ExpenseAccountHistory = { ...initialExpenseAccountHistory, accountHistory, id: expense.expenseAccountHistories.length + 1 }
      const response = await usePost('expenses', {...expense, expenseAccountHistories: [expenseAccountHistory], workDayUserId: user.workDayUser.id }, true)
      if (!response.error) {
        setExpense(initialExpense)
        setWorkDayUser()
        setShow(false)
      }
    }
  }

  const handleDeleteAccountHistory = (id: number) => {
    const expenseAccountHistories = expense.expenseAccountHistories.filter(expenseAccountHistory => expenseAccountHistory.id !== id)
    setExpense({ ...expense, expenseAccountHistories })
  }

  const validateAccountHistory = (accountHistory: AccountHistory) => {
    const errors: string[] = []
    const totalAccountHistories = expense.expenseAccountHistories.reduce((total, accountHistory) => total + accountHistory.accountHistory.amount, 0)
    let isValid = true
    if (accountHistory.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
      isValid = false
    }
    if (accountHistory.payMethodId <= 0) {
      errors.push('Debe seleccionar una forma de pago')
      isValid = false
    }
    if (totalAccountHistories + accountHistory.amount > expense.amount) {
      errors.push('El monto total de las formas de pago no puede ser mayor al monto del gasto')
      isValid = false
    }
    setErrors(errors)
    return isValid
  }

  const handleCheck = (event: any) => {
    const { name, checked } = event.target
    if (checked) {
      setExpense({ ...expense, expenseAccountHistories: [], [name]: checked })
    }
    else {
      setExpense({ ...expense, [name]: checked })
    }
  }


  useEffect(() => {
    const getProviders = async () => {
      const response = await useGetList<Provider[]>('providers', false)
      if (!response.error) {
        setProviders(response.data)
      }
    }
    getProviders()
  }, [])

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center'>
      <Button variant={'outline-success'} className='m-2' onClick={(() => setShow(true))}>
        Agregar gasto
      </Button>
      <CustomModal title='Agregar gasto' show={show} handleClose={(() => setShow(false))}>
        <div className="col-6 d-flex flex-wrap justify-content-center expense-form">
          <GenericForm errors={errors} handleSubmit={handleSubmit} submitText='Agregar gasto'>
            <CustomInputText value={expense.description}
              customInputText={
                {
                  label: 'Descripcion', name: 'description',
                  handleChange: handleChange, pattern: regexOptions.text,
                  validationMessage: 'Ingrese una descripcion valida'
                }
              } />
            <CustomInputNumber showLabel={false} value={expense.amount} customInputNumber={
              {
                label: 'Monto', name: 'amount',
                handleChange: handleChange, pattern: regexOptions.integer, validationMessage: 'Ingrese un monto válido'
              }
            } />
            <CustomInputSelect showLabel={false} value={expense.providerId}
              customInputSelect={
                {
                  label: 'Proveedores', name: 'providerId',
                  handleChange: handleProvider, pattern: '', validationMessage: 'Seleccione un proveedor'
                }}
              data={providers.map(provider => { return { value: provider.id, label: provider.name } })}
              defaultLegend={'Proveedor'}
            />
            <CustomInputCheck value={expense.pendingPay} customInputCheck={
              {
                label: 'Pendiente de pago', name: 'pendingPay',
                handleChange: handleCheck, pattern: '', validationMessage: ''
              }
            } />
            <div className="col-12 d-flex flex-wrap justify-content-center ">
              {
                expense.expenseAccountHistories.map((expenseAccountHistory, index) => {
                  return (
                    <div key={index} className="col-12 d-flex flex-wrap justify-content-start">
                      <span className=''>
                        <CustomBtn buttonType={buttonTypes.delete} height='20px' action={() => handleDeleteAccountHistory(expenseAccountHistory.id)} />                      </span>
                      <span className='mx-2 d-flex flex-wrap justify-content-start'>
                        -{expenseAccountHistory.accountHistory.payMethod.name}
                      </span>
                      <span className=' col-4 d-flex flex-wrap justify-content-start'>
                        {parseCurrency(expenseAccountHistory.accountHistory.amount.toString())}
                      </span>
                    </div>
                  )
                })
              }

            </div>
          </GenericForm>
        </div>
        {
          !expense.pendingPay &&
          <div className="col-6 d-flex flex-wrap align-items-center">
            <AccountHistoryForm defaultAmount={expense.amount} fastPayAction={fastPayAction} isPay={true} handleAccountHistory={handleAccountHistory} />
          </div>
        }
      </CustomModal>
    </div>
  )
}

export default ExpenseForm