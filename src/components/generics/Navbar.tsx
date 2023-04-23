import React from 'react'
import '../../scss/navbar.scss'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className="custom_navbar shadow">
      <Link to={'/'} className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='orders_icon'></div>
        </div>
        Ordenes
      </Link>
      <Link to={'/workDays'} className='nav_option px-2' style={{ width: '9vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='workDayUser_icon'></div>
        </div>
        Jornada
      </Link>
      <Link to={'/expenses'} className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='expense_icon'></div>
        </div>
        Gastos
      </Link>
      <span className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='investment_icon'></div>
        </div>
        Inversiones
      </span>
      <Link to={'/entries'} className='nav_option px-2' style={{ width: '8vw' }}>
        <div className='col-12 d-flex justify-content-center'>
          <div className='entry_icon'></div>
        </div>
        Ingresos
      </Link>
    </div>
  )
}

export default Header