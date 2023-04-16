import React from 'react'
import '../../scss/navbar.scss'

const Header = () => {
  return (
    <div className="custom_navbar shadow">
      <span className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='orders_icon'></div>
        </div>
        Ordenes
      </span>
      <span className='nav_option px-2' style={{ width: '9vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='workDayUser_icon'></div>
        </div>
        Jornada
      </span>
      <span className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='expense_icon'></div>
        </div>
        Gastos
      </span>
      <span className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='investment_icon'></div>
        </div>
        Inversiones
      </span>
      <span className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='entry_icon'></div>
        </div>
        Ingresos
      </span>
    </div>
  )
}

export default Header