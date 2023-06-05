import React from 'react'
import CustomModal from './generics/CustomModal'
import CustomInputNumber from './generics/CustomInputNumber'

interface Props {
  total: number
  setBillDiscount(discount: number): void
}

const BillResumeDiscount = ({ total, setBillDiscount }: Props) => {
  const [show, setShow] = React.useState(false)
  const [discount, setDiscount] = React.useState(0)
  const [discountAmount, setDiscountAmount] = React.useState(0)

  const handleChangeDiscount = (e: any) => {
    const value = e.target.value
    if (value > 100) {
      setDiscount(100)
      setDiscountAmount(total)
    } else {
      setDiscount(value)
      setDiscountAmount(Math.ceil(total * (value / 100)))
    }
  }

  const handleChangeDiscountAmount = (e: any) => {
    const value = e.target.value
    setDiscountAmount(value)
    setDiscount((value * 100) / total)
  }

  const handleChangeApplyDiscount = () => {
    setBillDiscount(discountAmount)
    setShow(false)
  }

  return (
    <>
      <div className='discount_btn' onClick={(() => setShow(true))}>
        <div className='discount_icon' ></div>
      </div>
      <CustomModal title='Aplicar descuento' show={show} handleClose={(() => setShow(false))}>
        <div className="col-4 d-flex flex-wrap justify-content-center">
          <div className="col-12 p-1">
            <CustomInputNumber showLabel={true} value={discount} customInputNumber={
              {
                label: '% de descuento', name: 'discount',
                handleChange: handleChangeDiscount, pattern: '', validationMessage: ''
              }
            } />
          </div>
          <div className="col-12 p-1">
            <CustomInputNumber showLabel={true} value={discountAmount} customInputNumber={
              {
                label: 'Monto de descuento', name: 'discountAmount',
                handleChange: handleChangeDiscountAmount, pattern: '', validationMessage: ''
              }
            } />
          </div>
          <strong className='my-2 col-12 text-center fs-4'>Monto total: {total}</strong>
          <strong className='my-2 col-12 text-center fs-4 text-danger'>Monto final: {total - discountAmount}</strong>
          <div className="d-flex flex-wrap col-12">
            <button className='btn btn-success col-12 p-4 my-3' onClick={(() => handleChangeApplyDiscount())}>Aplicar</button>
          </div>
        </div>
      </CustomModal></>
  )
}

export default BillResumeDiscount