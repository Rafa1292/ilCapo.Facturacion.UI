import React from 'react'
import { Col, Form, InputGroup } from 'react-bootstrap'
import { CustomInputAttributes } from '../../types/customInputAttributes'



interface Props {
  customInputCheck: CustomInputAttributes
  value: boolean
}

const CustomInputCheck = ({customInputCheck, value }: Props) => {

  const  getUniqueKey = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  return (
    <>
      <Form.Group className='my-2' as={Col} md="12">
        <InputGroup hasValidation>
          <Form.Check id={getUniqueKey()} checked={value} label={customInputCheck.label} name={customInputCheck.name} type='checkbox' onChange={customInputCheck.handleChange}/>
          <Form.Control.Feedback type="invalid">
            {customInputCheck.validationMessage}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
    </>
  )
}

export default CustomInputCheck