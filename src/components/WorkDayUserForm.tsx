import React, { useContext, useEffect, useState } from 'react'
import GenericForm from './generics/GenericForm'
import { WorkDayUser } from '../types/workDayUser'
import CustomInputNumber from './generics/CustomInputNumber'
import { regexOptions } from '../enums/regexOptions'
import AppContext from '../context/AppContext'
import { useGet, usePost } from '../hooks/useAPI'

const initialWorkDayUser: WorkDayUser = {
  id: 0,
  workDayId: 0,
  userId: 0,
  initialCash: 0,
  finalCash: 0,
  sales: 0,
  diference: 0,
  close: false,
  delete: false,
  updatedBy: 0,
  createdBy: 0
}


const WorkDayUserForm = () => {
  const { setWorkDayUser, user }  = useContext(AppContext)
  const [currentWorkDayUser, setCurrentWorkDayUser] = useState({...initialWorkDayUser })
  const [errors, setErrors] = useState([])
  const submitText = 'Agregar'

  const addWorkDayUser = async () => {
    const response = await usePost<WorkDayUser>('workDayUsers', {...currentWorkDayUser, userId: user.user?.id}, true)
    if (!response.error) {
      setCurrentWorkDayUser(response.data)
      setWorkDayUser(response.data)
    }
  }

  const getWorkDayUser = async () => {
    const response = await useGet<WorkDayUser>(`workDayUsers/${user.user?.id}`, true)
    if (!response.error && response.data !== null) {
      setCurrentWorkDayUser(response.data)
      setWorkDayUser(response.data)
    }
  }


  const handleChange = (event: any) => {
    const { name, value } = event.target
    setCurrentWorkDayUser({ ...currentWorkDayUser, [name]: value })
  }

  useEffect(() => {
    getWorkDayUser()
  }, [])
  

  return (
    <div className="col-6 d-flex flex-wrap">
      <GenericForm errors={errors} submitText={submitText} handleSubmit={addWorkDayUser}>
        <div className="col-12 text-center fs-4">
          Inicia tu jornada
        </div>
        <CustomInputNumber value={currentWorkDayUser.initialCash} customInputNumber={
          {
            label: 'Dinero inicial', name: 'initialCash',
            handleChange: handleChange, pattern: regexOptions.decimal, validationMessage: 'Cantidad inicial invalida'
          }
        } />
      </GenericForm>
    </div>
  )
}

export default WorkDayUserForm