import React from 'react'
import { Col, Form, InputGroup } from 'react-bootstrap'
import { CustomInputAttributes } from '../../types/customInputAttributes'

interface Props {
  customInputNumber: CustomInputAttributes
  value: number | string
  showLabel?: boolean
  isRequired?: boolean
  setDefaultValue?: () => void
}

const CustomInputNumber = ({ customInputNumber, value, showLabel = true, isRequired = true, setDefaultValue }: Props) => {
  return (
    <>
      <Form.Group className='my-2' as={Col} md="12">
        {
          showLabel &&
          <Form.Label className='m-0'>{customInputNumber.label}</Form.Label>
        }
        <InputGroup hasValidation>
          <Form.Control
            type="string"
            onDoubleClick={setDefaultValue}
            placeholder={customInputNumber.label}
            name={customInputNumber.name}
            value={value === 0 ? '' : value}
            onChange={customInputNumber.handleChange}
            required={isRequired}
            pattern={customInputNumber.pattern}
          />
          <Form.Control.Feedback id={customInputNumber.name} type="invalid">
            {customInputNumber.validationMessage}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
    </>
  )
}

export default CustomInputNumber