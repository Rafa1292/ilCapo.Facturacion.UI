import React, { useContext, useState } from 'react'
import { Button } from 'react-bootstrap'
import CustomModal from './generics/CustomModal'
import AppContext from '../context/AppContext'
import GenericForm from './generics/GenericForm'
import { Entry } from '../types/entry'
import { AccountHistory } from '../types/accountHistory'
import CustomInputText from './generics/CustomInputText'
import AccountHistoryForm from './AccountHistoryForm'
import { usePost } from '../hooks/useAPI'
import { regexOptions } from '../enums/regexOptions'

const initialEntry: Entry = {
  id: 0,
  accountHistory: {} as AccountHistory,
  accountHistoryId: 0,
  delete: false,
  description: '',
  workDayUserId: 0,
  createdBy: 0,
  updatedBy: 0
}


const EntryForm = () => {
  const [entry, setEntry] = useState<Entry>(initialEntry)
  const { user, setWorkDayUser } = useContext(AppContext)
  const [show, setShow] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (event: any) => {
    const { name, value } = event.target
    setEntry({ ...entry, [name]: value })
  }

  const handleAccountHistory = (accountHistory: AccountHistory): boolean => {
    const handleSubmit = async () => {
      const response = await usePost('entries', { ...entry, workDayUserId: user.workDayUser.id, accountHistory }, true)
      if (!response.error) {
        setEntry(initialEntry)
        setWorkDayUser()
        setShow(false)
      }
    }
    handleSubmit()
    return true
  }

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center'>
      <Button variant={'outline-success'} className='m-2' onClick={(() => setShow(true))}>
        Agregar ingreso
      </Button>
      <CustomModal title='Agregar ingreso' show={show} handleClose={(() => setShow(false))}>
        <div className="col-12 d-flex flex-wrap justify-content-center expense-form">
          <CustomInputText value={entry.description}
            customInputText={
              {
                label: 'Descripcion', name: 'description',
                handleChange: handleChange, pattern: regexOptions.text,
                validationMessage: 'Ingrese una descripcion valida'
              }
            } />
        </div>
        <div className="col-12 d-flex flex-wrap align-items-center">
          <AccountHistoryForm isPay={false} handleAccountHistory={handleAccountHistory} />
        </div>
      </CustomModal>
    </div>
  )
}

export default EntryForm