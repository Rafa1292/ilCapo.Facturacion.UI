import React from 'react'
import Modal from 'react-bootstrap/Modal'

interface Props {
  children: React.ReactNode
  title: string
  show: boolean
  handleClose: () => void
}

function CustomModal({ children, title, show, handleClose }: Props) {
  return (
    <>
      <Modal dialogClassName="w-90" fullscreen='fullscreen' centered show={show}  onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className='w-100 fw-bold text-center'>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-4 d-flex flex-wrap justify-content-center'>
          {children}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CustomModal