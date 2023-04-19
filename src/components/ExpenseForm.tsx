import React, { useEffect, useState } from 'react'
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

const initialExpense: Expense = {
  id: 0,
  amount: 0,
  description: '',
  delete: false,
  isNull: false,
  createdBy: 0,
  updatedBy: 0,
  providerId: 0,
  workDayUserId: 0,
  expenseAccountHistories: []
}

const ExpenseForm = () => {
  const [show, setShow] = useState<boolean>(false)
  const [expense, setExpense] = useState(initialExpense)
  const [providers, setProviders] = useState<Provider[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async () => {
    const response = await usePost('expenses', expense, true)
    if (!response.error) {
      setExpense(initialExpense)
      setShow(false)
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
    <>
      <Button variant={'outline-success'} className='m-2' onClick={(() => setShow(true))}>
        Agregar gasto
      </Button>
      <CustomModal title='Agregar gasto' show={show} handleClose={(() => setShow(false))}>
        <div className="col-8 d-flex flex-wrap justify-content-center expense-form">
          <GenericForm errors={errors} handleSubmit={handleSubmit} submitText='Agregar'>
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
                  label: 'Proveedores', name: 'measureId',
                  handleChange: handleProvider, pattern: '', validationMessage: 'Seleccione un proveedor'
                }}
              data={providers.map(provider => { return { value: provider.id, label: provider.name } })}
              defaultLegend={'Proveedor'}
            />
          </GenericForm>
        </div>
      </CustomModal>
    </>
  )
}

export default ExpenseForm