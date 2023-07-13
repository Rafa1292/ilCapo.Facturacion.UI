import React, { useContext, useEffect } from 'react'
import AppContext from '../context/AppContext'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'
import CustomInputNumber from './generics/CustomInputNumber'
import { BussinessConfig } from '../types/bussinessConfig'
import { usePost } from '../hooks/useAPI'
import '../scss/bar.scss'
import Swal from 'sweetalert2'

const initialBussinesConfig: BussinessConfig =
  { id: 0, tables: [], menuWaitTime: 0, serveWaitTime: 0 }

const RoomMaker = () => {
  const [currentBussinessConfig, setCurrentBussinessConfig] = React.useState<BussinessConfig>(initialBussinesConfig)
  const { setRoomEdit, system, getBussinessConfig } = useContext(AppContext)

  const newTable = (ev: React.DragEvent<HTMLDivElement>, type: string) => {
    setCurrentBussinessConfig(
      {
        ...currentBussinessConfig,
        tables: [...currentBussinessConfig.tables, { 
          id: 0, 
          number: getTableNumber(), 
          x: getPosX(ev, type), 
          y: getPosY(ev, type), 
          type
        }]
      }
    )
  }

  const editTable = (ev: React.DragEvent<HTMLDivElement>, tableNumber: number) => {
    const newTables = currentBussinessConfig.tables.map(table => {
      if (table.number === tableNumber) {
        return { ...table, x: getPosX(ev, table.type), y: getPosY(ev, table.type) }
      }
      return table
    })
    setCurrentBussinessConfig(
      { ...currentBussinessConfig, tables: newTables }
    )
  }

  const getTableNumber = (): number => {
    const currentNumber = currentBussinessConfig.tables.length + 1
    for (let i = 1; i <= currentNumber; i++) {
      if (!currentBussinessConfig.tables.find(table => table.number === i)) {
        return i
      }
    }
    return currentNumber
  }

  const deleteTable = (tableNumber: number) => {
    const newTables = currentBussinessConfig.tables.filter(table => table.number !== tableNumber)
    setCurrentBussinessConfig(
      { ...currentBussinessConfig, tables: newTables }
    )
  }

  const getPosX = (ev: React.DragEvent<HTMLDivElement>, type: string): number => {
    const viewPortWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const posX = type === 'bar_container' ? ev.clientX - 35 : ev.clientX - 70
    if (posX < 200) {
      return 200
    }
    if (posX > (viewPortWidth - 150)) {
      return viewPortWidth - 150
    }
    return posX
  }

  const getPosY = (ev: React.DragEvent<HTMLDivElement>, type: string): number => {
    const viewPortHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const posY = type === 'bar_container' ? ev.clientY - 70 : ev.clientY - 65
    if (posY < 60) {
      return 60
    }
    if (posY > (viewPortHeight - 140)) {
      return viewPortHeight - 140
    }
    return posY
  }

  const saveBussinesConfig = async () => {
    const response = await usePost('bussinessConfig', currentBussinessConfig, true)
    if (!response.error) {
      getBussinessConfig()
      Swal.fire({
        title: 'Configuración guardada',
        icon: 'success',
      })
    }
  }

  useEffect(() => {
    setRoomEdit(true)
    setCurrentBussinessConfig(system.bussinessConfig)
  }, [])

  return (
    <>
      <div className='col-12 d-flex' style={{ height: '98vh' }}>
        <div className="position-absolute rounded" style={{ background: 'rgba(255,255,255,.5)', height: '100vh', top: '0', width: '180px', left: '0' }}>
        </div>

        <div draggable className="table_container position-absolute d-flex flex-wrap p-2 shadow" style={{ left: '25px', top: '4vh' }} onDragEnd={(e) => newTable(e, 'table_container')}>
          <div className='table_room'></div>
          <div className="table_background"></div>
          <div className="table_background-color" ></div>
        </div>

        <div draggable className="bar_container position-absolute d-flex flex-wrap p-2 shadow" style={{ left: '55px', top: 'calc(4vh + 150px)' }} onDragEnd={(e) => newTable(e, 'bar_container')}>
          <div className='table_room'></div>
          <div className="table_background" style={{ borderRadius: '0px' }}></div>
          <div className="table_background-color" style={{ borderRadius: '5px' }}></div>
        </div>
        <div className="d-flex flex-wrap position-absolute" style={{ width: '180px', top: '40vh', left: '0' }}>
          <div className="col-12 px-3 d-flex flex-wrap justify-content-center ">
            <CustomInputNumber isRequired={false} showLabel={true} value={currentBussinessConfig.menuWaitTime} customInputNumber={
              {
                label: 'Espera con menu', name: 'menuWaitTime',
                handleChange: ((ev: React.ChangeEvent<HTMLInputElement>) => setCurrentBussinessConfig({ ...currentBussinessConfig, menuWaitTime: Number(ev.target.value) })), pattern: '', validationMessage: 'Ingrese un monto válido'
              }
            } />
          </div>
          <div className="col-12 px-3 d-flex flex-wrap justify-content-center ">
            <CustomInputNumber isRequired={false} showLabel={true} value={currentBussinessConfig.serveWaitTime} customInputNumber={
              {
                label: 'Espera de orden', name: 'serveWaitTime',
                handleChange: ((ev: React.ChangeEvent<HTMLInputElement>) => setCurrentBussinessConfig({ ...currentBussinessConfig, serveWaitTime: Number(ev.target.value) })), pattern: '', validationMessage: 'Ingrese un monto válido'
              }
            } />
          </div>
          <div className="col-12 p-3 d-flex flex-wrap justify-content-center ">
            <button className='btn btn-success col-12' onClick={saveBussinesConfig}>Guardar cambios</button>
          </div>
        </div>

        {
          currentBussinessConfig?.tables?.map((table, index) => (
            <div key={index} className={`d-flex flex-wrap p-2 shadow ${table.type}`} draggable onDragEnd={(e) => editTable(e, table.number)} style={{ left: table.x, top: table.y }}>
              <span className='position-absolute' onClick={() => deleteTable(table.number)} style={{ zIndex: '100', cursor: 'pointer', left: '80%', top: '0', background: 'white', borderRadius: '50px' }}>
                <CustomBtn height='40px' buttonType={buttonTypes.cancel} />
              </span>
              <strong># {table.number}</strong>
              <div className='table_room'></div>
              <div className="table_background"></div>
              <div className="table_background-color"></div>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default RoomMaker