import React, { useContext, useEffect, useState } from 'react'
import '../../scss/sideMenu.scss'
import { Link } from 'react-router-dom'
import logo from '../../assets/icons/logoNebulosa.png'
import time from '../../assets/icons/time.png'
import shop from '../../assets/icons/shop.png'
import AppContext from '../../context/AppContext'
import { Bill } from '../../types/bill'
import SideMenuItem from './SideMenuItem'
import { SaleItemCategory } from '../../types/saleItemCategory'
import BillMaker from '../../containers/generics/BillMaker'
import { buttonTypes } from '../../enums/buttonTypes'
import CustomBtn from './CustomBtn'
import { Client } from '../../types/client'
import { Menu } from '../../types/menu'

const initialClient: Client = {
  id: 0,
  name: '',
  phone: '',
  mail: '',
  cedula: '',
  addressess: [],
  creditState: 3,
  creditLimit: 0,
  delete: false,
  createdBy: 0,
  updatedBy: 0,
}

const initialBill: Bill = {
  id: 0,
  addressId: 0,
  client: initialClient,
  clientId: 0,
  close: false,
  deliveryMethod: 0,
  tableNumber: 0,
  workDayUserIdOpen: 0,
  workDayUserIdClose: 0,
  commandTime: new Date(Date.now()),
  isServed: false,
  isNull: false,
  isCredit: false,
  items: [],
  isCommanded: false,
  billAccountHistories: [],
  delete: false,
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
  createdBy: 0,
  updatedBy: 0,
}

interface Props {
  saleItemCategories: SaleItemCategory[]
  setPrices: (menuId: number) => void
  menus: Menu[]
  bills: Bill[]
}

const SideMenu = ({ saleItemCategories, setPrices, menus, bills }: Props) => {
  const { user, logout, billFunctions } = useContext(AppContext)
  const [close, setClose] = useState(true)
  const [bill, setBill] = useState(initialBill)
  
  const closeTable = () => {
    const container = document.getElementById(`billMakerContainerToGo${0}`)
    container?.classList.remove('bill-makerContainer_show')
    setClose(true)
  }

  const openTable = () => {
    billFunctions.removeIncompleteBill()
    console.log(bills)
    setBill(initialBill)
    const container = document.getElementById(`billMakerContainerToGo${0}`)
    container?.classList.add('bill-makerContainer_show')
    setClose(false)
  }

  useEffect(() => {
    const currentBill = billFunctions.getBill(0, 0)
    setBill(currentBill)
  }, [bills])

  return (
    <>
      <div
        className='bill-makerContainer position-fixed'
        id={`billMakerContainerToGo${0}`}
        style={{ zIndex: '1000' }}
      >
        <span
          className='position-absolute'
          onClick={closeTable}
          style={{
            zIndex: '10000',
            cursor: 'pointer',
            right: '30vw',
            top: '1vw',
            background: 'white',
            borderRadius: '50px',
          }}
        >
          <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
        </span>
        {!close && (
          <BillMaker
            menus={menus}
            setPrices={setPrices}
            bill={bill}
            saleItemCategories={saleItemCategories}
            close={closeTable}
          />
        )}
      </div>
      <nav id='sidebarMenu' className='sidebar'>
        <div className='position-sticky sidebar-sticky'>
          <Link className='logo_container my-2' to='/'>
            <img className='' width={150} src={logo} />
          </Link>
          <div className='col-12 d-flex flex-wrap  p-2 my-2 user_info'>
            <div className='col-12 text-end rounded p-1 user_name'>
              Hola! {user.userInfo?.name}
            </div>
            <small className='col-12 text-end rounded p-1 text-white'>
              Inicio de jornada: 10:00 am
            </small>
            <small
              onClick={logout}
              className='col-12 text-end rounded pointer p-1 text-white'
            >
              Cerrar sesión
            </small>
          </div>
          <div className='col-12 d-flex flex-wrap justify-content-center'>
            <button
              className='btn btn-outline-warning my-3'
              onClick={openTable}
            >
              Agregar
            </button>
          </div>
          <div className='col-12 flex-wrap d-flex p-1 orders-togo_header'>
            <div className='col-3 d-flex justify-content-center'>Nombre</div>
            <div className='col-3 d-flex justify-content-center'>Telefono</div>
            <div className='col-2 d-flex justify-content-center'>Monto</div>
            <div className='col-2 d-flex justify-content-center'>
              <img
                className=''
                style={{ opacity: '0.8' }}
                width={16}
                height={18}
                src={shop}
              />
            </div>
            <div className='col-2 d-flex justify-content-center'>
              <img
                className=''
                style={{ opacity: '0.8' }}
                width={16}
                height={18}
                src={time}
              />
            </div>
          </div>
          <ul className='nav flex-column'>
            {bills.filter((x) => x.id > 0 && x.tableNumber === 0 && !x.close)
              .map((bill, index) => {
                return (
                  <li className='nav-item' key={index}>
                    <SideMenuItem
                      menus={menus}
                      setPrices={setPrices}
                      bill={bill}
                      saleItemCategories={saleItemCategories}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
        <div
          className='bg-dark d-flex d-md-none justify-content-center align-items-center text-white d-flex col-12'
          style={{
            position: 'absolute',
            bottom: '0',
            height: '40px',
            fontWeight: 'bold',
          }}
        >
          Sign-out
        </div>
      </nav>
    </>
  )
}

export default SideMenu
