import React, { useEffect, useState } from 'react'
import { InvestmentDetail } from '../types/investmentDetail'
import { Brand } from '../types/brand'
import { Measure } from '../types/measure'
import { Input } from '../types/input'
import CustomInputNumber from './generics/CustomInputNumber'
import CustomInputSelect from './generics/CustomInputSelect'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import { parseCurrency } from '../utils/currencyParser'

const initialInvestmentDetail: InvestmentDetail = {
  id: 0,
  quantity: 0,
  inputId: 0,
  presentation: 0,
  measureId: 0,
  brandId: 0,
  price: 0,
  discount: 0,
  iva: 0,
  investmentId: 0,
  delete: false,
  createdBy: 0,
  updatedBy: 0
}

interface Props {
  currentInvestmentDetail: InvestmentDetail | null
  handleInvestmentDetail: (investmentDetail: InvestmentDetail) => boolean
  handleEditInvestmentDetail: (investmentDetail: InvestmentDetail) => boolean
  brands: Brand[]
  measures: Measure[]
  inputs: Input[]
}

const InvestmentDetailForm = ({ handleEditInvestmentDetail, handleInvestmentDetail, brands, measures, inputs, currentInvestmentDetail }: Props) => {
  const [investmentDetail, setInvestmentDetail] = useState(initialInvestmentDetail)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setInvestmentDetail({ ...investmentDetail, [name]: value })
  }

  const getTotal = () => {
    const { price, discount, iva, quantity } = investmentDetail
    const total = (Number(price) + Number(iva) - Number(discount)) * quantity
    return parseCurrency(total.toString())
  }

  const handleSubmit = () => {
    if (investmentDetail.id === 0) {
      if (handleInvestmentDetail(investmentDetail)) {
        setInvestmentDetail(initialInvestmentDetail)
      }
    } else {
      if (handleEditInvestmentDetail(investmentDetail)) {
        setInvestmentDetail(initialInvestmentDetail)
      }
    }
  }

  useEffect(() => {
    if (currentInvestmentDetail !== null) {
      setInvestmentDetail(currentInvestmentDetail)
    }
    console.log(currentInvestmentDetail)
  }, [currentInvestmentDetail])

  return (
    <div className='col-12 d-flex flex-wrap'>
      <div className="col-1">
        <CustomInputNumber isRequired={false} showLabel={false} value={investmentDetail.quantity} customInputNumber={
          {
            label: 'Cant', name: 'quantity',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese una cantidad válida'
          }
        } />
      </div>
      <div className="col-2 px-1">
        <CustomInputSelect showLabel={false} value={investmentDetail.inputId}
          customInputSelect={
            {
              label: 'Insumo', name: 'inputId',
              handleChange: handleChange, pattern: '', validationMessage: 'Seleccione un insumo'
            }}
          data={inputs.map(input => { return { value: input.id, label: input.name } })}
          defaultLegend={'Insumo'}
        />
      </div>
      <div className="col-2">
        <CustomInputNumber isRequired={false} showLabel={false} value={investmentDetail.presentation} customInputNumber={
          {
            label: 'Presentacion', name: 'presentation',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese una cantidad válida'
          }
        } />
      </div>
      <div className="col-1 px-1">
        <CustomInputSelect showLabel={false} value={investmentDetail.measureId}
          customInputSelect={
            {
              label: 'Medida', name: 'measureId',
              handleChange: handleChange, pattern: '', validationMessage: 'Seleccione una medida'
            }}
          data={measures.map(measure => { return { value: measure.id, label: measure.name } })}
          defaultLegend={'Medida'}
        />
      </div>
      <div className="col-1">
        <CustomInputSelect showLabel={false} value={investmentDetail.brandId}
          customInputSelect={
            {
              label: 'Marca', name: 'brandId',
              handleChange: handleChange, pattern: '', validationMessage: 'Seleccione una marca'
            }}
          data={brands.map(brand => { return { value: brand.id, label: brand.name } })}
          defaultLegend={'Marca'}
        />
      </div>
      <div className="col-1 px-1">
        <CustomInputNumber isRequired={false} showLabel={false} value={investmentDetail.price} customInputNumber={
          {
            label: 'Precio', name: 'price',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese un precio válido'
          }
        } />
      </div>
      <div className="col-1">
        <CustomInputNumber isRequired={false} showLabel={false} value={investmentDetail.discount} customInputNumber={
          {
            label: 'Desc', name: 'discount',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese un descuento válido'
          }
        } />
      </div>
      <div className="col-1 px-1">
        <CustomInputNumber isRequired={false} showLabel={false} value={investmentDetail.iva} customInputNumber={
          {
            label: 'Iva', name: 'iva',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese un impuesto válido'
          }
        } />
      </div>
      <div className="col-1 d-flex align-items-center justify-content-center">
        {getTotal()}
      </div>
      <div className="col-1 d-flex flex-wrap alignt-items-center">
        <CustomBtn height='30px' buttonType={buttonTypes.success} action={handleSubmit} />
      </div>
    </div>
  )
}

export default InvestmentDetailForm