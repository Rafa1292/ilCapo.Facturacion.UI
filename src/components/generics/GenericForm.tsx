import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'


interface Props {
  children: React.ReactNode
  handleSubmit: () => void
  submitText: string
  errors?: string[]
  cancel?: () => void
  formNeedsValidation?: boolean
}

const GenericForm = ({ children, submitText, handleSubmit, errors, cancel, formNeedsValidation = true }: Props) => {
  const [validated, setValidated] = useState(false)

  const validateForm = async (event: any) => {
    if (!formNeedsValidation) {
      event.preventDefault()
      event.stopPropagation()
      await handleSubmit()
    }
    else {
      event.preventDefault()
      event.stopPropagation()
      setValidated(true)
      const form = event.target
      if (form.checkValidity() === true) {
        await handleSubmit()
      }
    }
  }

  return (
    <>
      {
        errors &&
        <div className="col-12 d-flex justify-content-center">
          <ul className="list-group list-group-flush">
            {
              errors.map((error, index) => (
                <li key={index} className="list-group-item text-danger">{error}</li>
              ))
            }
          </ul>
        </div>
      }
      <Form noValidate onSubmit={validateForm} validated={validated} className='col-12 rounded p-4 shadow'>
        {children}
        <Button className='btn btn-dark col-12 mt-2' type="submit">{submitText}</Button>
        {
          cancel &&
          <button className='btn btn-outline-secondary col-12 my-2' onClick={cancel} type="button">Cancelar</button>
        }

      </Form>
    </>
  )
}

export default GenericForm
