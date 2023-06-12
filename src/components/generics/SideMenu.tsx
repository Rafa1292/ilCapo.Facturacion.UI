import React, { useContext } from 'react'
import '../../scss/sideMenu.scss'
import { Link } from 'react-router-dom'
import logo from '../../assets/icons/logoNebulosa.png'
import time from '../../assets/icons/time.png'
import shop from '../../assets/icons/shop.png'
import moto from '../../assets/icons/moto.png'
import carry from '../../assets/icons/carry.png'
import AppContext from '../../context/AppContext'

const Navbar = () => {
  const { user, logout } = useContext(AppContext)

  return (
    <>
      <nav
        id="sidebarMenu"
        className="sidebar"
      >
        <div className="position-sticky sidebar-sticky">
          <Link className='logo_container my-2' to="/">
            <img className='' width={150} src={logo} />
          </Link>
          <div className="col-12 d-flex flex-wrap  p-2 my-2 user_info">
            <div className="col-12 text-end rounded p-1 user_name">
              Hola! {user.userInfo?.name}
            </div>
            <small className="col-12 text-end rounded p-1 text-white">
              Inicio de jornada: 10:00 am
            </small>
            <small onClick={logout} className="col-12 text-end rounded p-1 text-white">
              Cerrar sesión
            </small>
          </div>
          <div className="col-12 flex-wrap d-flex p-1 orders-togo_header">
            <div className="col-3 d-flex justify-content-center">
              Nombre
            </div>
            <div className="col-3 d-flex justify-content-center">
              Telefono
            </div>
            <div className="col-2 d-flex justify-content-center">
              Monto
            </div>
            <div className="col-2 d-flex justify-content-center">
              <img className='' style={{ opacity: '0.8' }} width={16} height={18} src={shop} />
            </div>
            <div className="col-2 d-flex justify-content-center">
              <img className='' style={{ opacity: '0.8' }} width={16} height={18} src={time} />
            </div>
          </div>
          <ul className="nav flex-column">
            <li className='nav-item'>
              <div className="col-12 flex-wrap d-flex py-3 orders-togo">
                <div className="col-3 d-flex justify-content-start">
                  Rafa villalobos
                </div>
                <div className="col-3 d-flex justify-content-center text-center">
                  85002818
                </div>
                <div className="col-2 d-flex justify-content-center text-center">
                  ¢ 9.500
                </div>
                <div className="col-2 d-flex justify-content-center">
                  <img className='' height={18} src={moto} />
                </div>
                <div className="col-2 d-flex justify-content-center">
                  90 mins
                </div>
              </div>
              <div className="col-12 flex-wrap d-flex py-3 orders-togo">
                <div className="col-3 d-flex justify-content-start">
                  Mariela Gonzales 
                </div>
                <div className="col-3 d-flex justify-content-center text-center">
                  70519920
                </div>
                <div className="col-2 d-flex justify-content-center text-center">
                  ¢ 20.500
                </div>
                <div className="col-2 d-flex justify-content-center">
                  <img className='' height={18} src={carry} />
                </div>
                <div className="col-2 d-flex justify-content-center">
                  5 mins
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="bg-dark d-flex d-md-none justify-content-center align-items-center text-white d-flex col-12"
          style={{ position: 'absolute', bottom: '0', height: '40px', fontWeight: 'bold' }}>
          Sign-out
        </div>
      </nav>

    </>
  )
}

export default Navbar