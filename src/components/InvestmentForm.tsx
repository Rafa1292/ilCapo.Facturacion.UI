import React, { useContext, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import CustomModal from './generics/CustomModal'
import GenericForm from './generics/GenericForm'
import CustomInputSelect from './generics/CustomInputSelect'
import CustomInputCheck from './generics/CustomInputChecbox'
import { Investment } from '../types/investment'
import { InvestmentAccountHistory } from '../types/investmentAccountHistory'
import { AccountHistory } from '../types/accountHistory'
import { Provider } from '../types/provider'
import { buttonTypes } from '../enums/buttonTypes'
import CustomBtn from './generics/CustomBtn'
import { parseCurrency } from '../utils/currencyParser'
import AccountHistoryForm from './AccountHistoryForm'
import * as validator from '../utils/errorValidation'
import { useGetList, usePost } from '../hooks/useAPI'
import AppContext from '../context/AppContext'
import InvestmentDetailForm from './InvestmentDetailForm'
import { InvestmentDetail } from '../types/investmentDetail'
import { Brand } from '../types/brand'
import { Measure } from '../types/measure'
import { Input } from '../types/input'

const initialInvestment: Investment = {
  id: 0,
  amount: 0,
  delete: false,
  isNull: false,
  pendingPay: false,
  providerId: 0,
  workDayUserId: 0,
  investmentHistories: [],
  discount: 0,
  investmentDetails: [],
  iva: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialInvestmentAccountHistory: InvestmentAccountHistory = {
  accountHistory: {} as AccountHistory,
  accountHistoryId: 0,
  delete: false,
  investmentId: 0,
  id: 0,
  createdBy: 0,
  updatedBy: 0
}

interface Props {
  refreshInvestments: () => void
}

const InvestmentForm = ({ refreshInvestments }: Props) => {
  const { user } = useContext(AppContext)
  const [show, setShow] = useState<boolean>(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [investment, setInvestment] = useState(initialInvestment)
  const [errors, setErrors] = useState<string[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [measures, setMeasures] = useState<Measure[]>([])
  const [inputs, setInputs] = useState<Input[]>([])
  const [currentInvestmentDetail, setCurrentInvestmentDetail] = useState<InvestmentDetail | null>(null)

  const handleProvider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setInvestment({ ...investment, providerId: value })
  }

  const validateAccountHistory = (accountHistory: AccountHistory) => {
    const errors: string[] = []
    const totalAccountHistories = investment.investmentHistories.reduce((total, investmentAccountHistory) => Number(total) + Number(investmentAccountHistory.accountHistory.amount), 0)
    let isValid = true
    if (accountHistory.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
      isValid = false
    }
    if (accountHistory.payMethodId <= 0) {
      errors.push('Debe seleccionar una forma de pago')
      isValid = false
    }
    if (totalAccountHistories + Number(accountHistory.amount) > investment.amount) {
      errors.push('El monto total de las formas de pago no puede ser mayor al monto de la compra')
      isValid = false
    }
    setErrors(errors)
    return isValid
  }

  const handleAccountHistory = (accountHistory: AccountHistory): boolean => {
    if (validateAccountHistory(accountHistory)) {
      const investmentAccountHistory: InvestmentAccountHistory = { ...initialInvestmentAccountHistory, accountHistory, id: investment.investmentHistories.length + 1 }
      setInvestment({ ...investment, investmentHistories: [...investment.investmentHistories, investmentAccountHistory] })
      return true
    }
    return false
  }

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    if (checked) {
      setInvestment({ ...investment, investmentHistories: [], [name]: checked })
    }
    else {
      setInvestment({ ...investment, [name]: checked })
    }
  }

  const handleDeleteAccountHistory = (id: number) => {
    const investmentAccountHistories = investment.investmentHistories.filter(investmentAccountHistory => investmentAccountHistory.id !== id)
    setInvestment({ ...investment, investmentHistories: investmentAccountHistories })
  }

  const handleSubmit = async () => {
    if (investment.providerId <= 0) {
      validator.validateNumber(0, 'providerId', /^[0-9]*$/, false)
      setErrors(['Debe seleccionar un proveedor'])
    } else {
      setErrors([])
      const response = await usePost('investments', { ...investment, workDayUserId: user.workDayUser.id }, true)
      if (!response.error) {
        setInvestment(initialInvestment)
        refreshInvestments()
        setShow(false)
      }
    }

  }

  const getDetailTotal = (investmentDetail: InvestmentDetail) => {
    const { price, quantity, discount, iva } = investmentDetail
    return (Number(price) - Number(discount) + Number(iva)) * quantity
  }

  const handleInvestmentDetail = (investmentDetail: InvestmentDetail): boolean => {
    const investmentDetails = [...investment.investmentDetails, { ...investmentDetail, id: investment.investmentDetails.length + 1 }]
    setInvestment({ ...investment, investmentDetails, amount: Number(investment.amount) + getDetailTotal(investmentDetail) })
    return true
  }

  const handleSetInvestmentDetailForEdit = (investmentDetail: InvestmentDetail) => {
    const investmentDetails = investment.investmentDetails.filter(currentInvestmentDetail => currentInvestmentDetail.id !== investmentDetail.id)
    setInvestment({ ...investment, investmentDetails, amount: Number(investment.amount) - getDetailTotal(investmentDetail) })
    setCurrentInvestmentDetail(investmentDetail)
  }

  const handleDeleteInvestmentDetail = (currentInvestmentDetail: InvestmentDetail) => {
    const investmentDetails = investment.investmentDetails.filter(investmentDetail => investmentDetail.id !== currentInvestmentDetail.id)
    setInvestment({ ...investment, investmentDetails, amount: Number(investment.amount) - getDetailTotal(currentInvestmentDetail) })
  }

  const getMeasureName = (measureId: number) => {
    const measure = measures.find(measure => measure.id === measureId)
    return measure ? measure.name : ''
  }

  const getBrandName = (brandId: number) => {
    const brand = brands.find(brand => brand.id === brandId)
    return brand ? brand.name : ''
  }

  const getInputName = (inputId: number) => {
    const input = inputs.find(input => input.id === inputId)
    return input ? input.name : ''
  }

  const getTotal = (currentInvestmentDetail: InvestmentDetail) => {
    const { price, discount, iva, quantity } = currentInvestmentDetail
    const total = (Number(price) + Number(iva) - Number(discount)) * quantity
    return total
  }


  useEffect(() => {
    const getProviders = async () => {
      const response = await useGetList<Provider[]>('providers', false)
      if (!response.error) {
        setProviders(response.data)
      }
    }
    const getBrands = async () => {
      const response = await useGetList<Brand[]>('brands', false)
      if (!response.error) {
        setBrands(response.data)
      }
    }
    const getMeasures = async () => {
      const response = await useGetList<Measure[]>('measures', false)
      if (!response.error) {
        setMeasures(response.data)
      }
    }
    const getInputs = async () => {
      const response = await useGetList<Input[]>('inputs', false)
      if (!response.error) {
        setInputs(response.data)
      }
    }
    getProviders()
    getBrands()
    getMeasures()
    getInputs()
  }, [])



  return (
    <div className='col-12 d-flex flex-wrap justify-content-center'>
      <Button variant={'outline-success'} className='m-2' onClick={(() => setShow(true))}>
        Agregar compra
      </Button>
      <CustomModal title='Agregar compra' show={show} handleClose={(() => setShow(false))}>
        <div className="col-9 d-flex flex-wrap justify-content-center expense-form">
          <GenericForm errors={errors} handleSubmit={handleSubmit} submitText='Agregar compra'>
            <CustomInputSelect showLabel={false} value={investment.providerId}
              customInputSelect={
                {
                  label: 'Proveedores', name: 'providerId',
                  handleChange: handleProvider, pattern: '', validationMessage: 'Seleccione un proveedor'
                }}
              data={providers.map(provider => { return { value: provider.id, label: provider.name } })}
              defaultLegend={'Proveedor'}
            />
            <CustomInputCheck value={investment.pendingPay} customInputCheck={
              {
                label: 'Pendiente de pago', name: 'pendingPay',
                handleChange: handleCheck, pattern: '', validationMessage: ''
              }
            } />
            <InvestmentDetailForm currentInvestmentDetail={currentInvestmentDetail} brands={brands} measures={measures} inputs={inputs}
              handleInvestmentDetail={handleInvestmentDetail} handleEditInvestmentDetail={handleInvestmentDetail} />
            <div className="col-12 d-flex flex-wrap mt-4" style={{ borderTop: '1px solid rgba(0,0,0,.2)' }}>
              {
                investment.investmentDetails.length === 0 &&
                <div className="col-12 d-flex flex-wrap justify-content-center my-2 py-2">
                  <span className='col-12 center'>
                    No hay detalles de compra
                  </span>
                </div>
              }
              {
                investment.investmentDetails.map((investmentDetail, index) => {
                  return (
                    <div key={index} className="col-12 d-flex flex-wrap justify-content-start my-2 py-2"
                      style={{ borderBottom: '1px solid rgba(0,0,0,.2)' }}
                    >
                      <span className='col-1 center'>
                        {investmentDetail.quantity}
                      </span>
                      <span className='col-2 px-1 center'>
                        {getInputName(investmentDetail.inputId)}
                      </span>
                      <span className='col-2 center'>
                        {investmentDetail.presentation}
                      </span>
                      <span className='col-1 px-1 center'>
                        {getMeasureName(investmentDetail.measureId)}
                      </span>
                      <span className='col-1 px-1 center'>
                        {getBrandName(investmentDetail.brandId)}
                      </span>
                      <span className=' col-1 center'>
                        {parseCurrency(investmentDetail.price.toString())}
                      </span>
                      <span className=' col-1 px-1 center'>
                        {parseCurrency(investmentDetail.discount.toString())}
                      </span>
                      <span className=' col-1 center'>
                        {parseCurrency(investmentDetail.iva.toString())}
                      </span>
                      <span className=' col-1 px-1 center'>
                        {parseCurrency(getTotal(investmentDetail).toString())}
                      </span>
                      <span className=''>
                        <CustomBtn buttonType={buttonTypes.delete} height='20px' action={() => handleDeleteInvestmentDetail(investmentDetail)} />
                      </span>
                      <span className=''>
                        <CustomBtn buttonType={buttonTypes.edit} height='20px' action={() => handleSetInvestmentDetailForEdit(investmentDetail)} />
                      </span>
                    </div>
                  )
                })
              }
            </div>
            <div className="col-12 d-flex flex-wrap justify-content-center px-4">
              <div className="col-12 d-flex justify-content-end mt-5">
                <div className="col-1 text-end">
                  Subtotal:
                </div>
                <strong className='col-1 px-2'>
                  {parseCurrency(investment.investmentDetails.reduce((acc, investmentDetail) => acc + Number(investmentDetail.price * investmentDetail.quantity), 0).toString())}
                </strong>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <div className="col-1 text-end">
                  Iva:
                </div>
                <strong className='col-1 px-2'>
                  {parseCurrency(investment.investmentDetails.reduce((acc, investmentDetail) => acc + Number(investmentDetail.iva * investmentDetail.quantity), 0).toString())}
                </strong>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <div className="col-1 text-end">
                  Descuento:
                </div>
                <strong className='col-1 px-2'>
                  {parseCurrency(investment.investmentDetails.reduce((acc, investmentDetail) => acc + Number(investmentDetail.discount * investmentDetail.quantity), 0).toString())}
                </strong>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <div className="col-1 text-end">
                  Total:
                </div>
                <strong className='col-1 px-2'>
                  {parseCurrency(investment.investmentDetails.reduce((acc, investmentDetail) => acc + getTotal(investmentDetail), 0).toString())}
                </strong>
              </div>

            </div>
          </GenericForm>
        </div>
        {
          !investment.pendingPay &&
          <div className="col-3 d-flex flex-wrap align-items-center">
            <AccountHistoryForm defaultAmount={investment.investmentDetails.reduce((acc, investmentDetail) => acc + getTotal(investmentDetail), 0)} selectedPayMethodsId={investment?.investmentHistories?.map(x => x?.accountHistory?.payMethodId)} isPay={true} handleAccountHistory={handleAccountHistory} />
            <div className="col-12 d-flex flex-wrap justify-content-center mt-4">
              {
                investment.investmentHistories.map((expenseAccountHistory, index) => {
                  return (
                    <div key={index} className="col-12 d-flex flex-wrap justify-content-center">
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
          </div>
        }

      </CustomModal>
    </div>
  )
}

export default InvestmentForm