import React, { useContext } from 'react'
import logoNebulosa from '../../assets/icons/logoNebulosa.png'
import '../../scss/login.scss'
import AppContext from '../../context/AppContext'

const Login = () => {
  // use state from context for change state.loggedIn to true
  const { user, system, login } = useContext(AppContext)



  return (
    <form className='col-6 d-flex flex-wrap justify-content-center p-4 login'>
      <img className="mb-4" src={logoNebulosa} alt="" width="200" height="70" />
      <h1 className="h3 mb-3 fw-normal col-12 text-center">Inicio de sesion</h1>
      <div className="form-floating">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
        <label htmlFor="floatingInput">Correo</label>
      </div>
      <div className="form-floating">
        <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
        <label htmlFor="floatingPassword">Contraseña</label>
      </div>
      <button className="col-12 btn btn-lg" type="button" onClick={login}>Ingresar</button>
      <small className='col-12 text-center my-4'>¿Olvidaste tu contraseña?</small>
    </form>
  )
}

export default Login