import React from 'react'
import loader from '../../assets/gifs/loader.gif'

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader__container">
        <div className="loader__image">
          <img src={loader} alt="" />
        </div>
      </div>
    </div>
  )
}

export default Loader