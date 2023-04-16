import React, { useEffect, useState } from 'react'
import { Col, Form, InputGroup } from 'react-bootstrap'
import DatalistInput from 'react-datalist-input'
import { CustomInputAttributes } from '../../types/customInputAttributes'
import 'react-datalist-input/dist/styles.css'
import CustomBtn from './CustomBtn'
import { buttonTypes } from '../../enums/buttonTypes'

interface option {
  value: number
  label: string
}

interface Props {
  customInputSelect: CustomInputAttributes
  value: number
  data: option[]
  defaultLegend: string
  showLabel?: boolean
}

const CustomInputSelect = ({ defaultLegend, customInputSelect, value, data, showLabel = true }: Props) => {
  const [currentValue, setCurrentValue] = useState<string>('')

  useEffect(() => {
    const item = data.find((item) => item.value === value)
    setCurrentValue(item ? item.label : '')
  }, [data])

  return (
    <>
      <Form.Group className='my-2' as={Col} md="12">
        {
          showLabel &&
          <Form.Label className='m-0'>{customInputSelect.label}</Form.Label>
        }
        <InputGroup hasValidation>
          <DatalistInput            
            value={currentValue}
            placeholder={defaultLegend}
            label={customInputSelect.label}
            onSelect={((item) => customInputSelect.handleChange({ target: { name: customInputSelect.name, value: item.id } }))}
            items={data.map((item) => {
              return { id: item.value, value: item.label }
            })}
          />
          <div className="datalist_clean" onClick={(() => setCurrentValue(''))}>
            x
          </div>
          <Form.Control.Feedback id={customInputSelect.name} type="invalid">
            {customInputSelect.validationMessage}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
    </>
  )
}

export default CustomInputSelect