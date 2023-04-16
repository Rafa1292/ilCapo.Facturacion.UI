import React from 'react'
import Loader from './loader'

interface Props {
  children: React.ReactNode;
  isLoading: boolean;
  minHeight?: string;
}
const Content = ({ isLoading, children, minHeight }: Props) => {
  return (
    <div className='col-12 m-0 py-0 px-1 d-flex flex-wrap justify-content-center align-content-center' style={{minHeight: minHeight}}>
      {
        isLoading ?
          (
            <Loader />
          )
          :
          (
            children
          )
      }
    </div>
  )
}

export default Content