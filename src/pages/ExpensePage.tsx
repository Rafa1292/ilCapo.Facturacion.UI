import React, { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'



const ExpensePage = () => {
  const [expenses, setExpenses] = useState([])

  return (
    <>
      <div className='d-flex col-4 justify-content-center flex-wrap'>
        <h4 className='col-12 text-center'>Estos son tus gastos de hoy</h4>
        {
          expenses.length === 0 &&
          <div className='col-12 my-3 text-center'>
            No tienes gastos registrados
          </div>
        }
        <ExpenseForm/>
      </div>
    </>
  )
}

export default ExpensePage