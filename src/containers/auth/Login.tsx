import React, { useContext, useEffect } from 'react'
import logoNebulosa from '../../assets/icons/logoNebulosa.png'
import '../../scss/login.scss'
import AppContext from '../../context/AppContext'
import { User } from '../../types/user'
import { UserInfo } from '../../types/userInfo'

const initialUser: User = {
  id: 0,
  email: '',
  password: '',
  delete: false,
  userInfo: {} as UserInfo
}

const Login = () => {
  const { login } = useContext(AppContext)
  const [user, setUser] = React.useState<User>(initialUser)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center align-items-center' style={{ height: '100vh' }}>
      <form className='col-4 d-flex flex-wrap justify-content-center p-4 login'>
        <img className="mb-4" src={logoNebulosa} alt="" width="200" height="70" />
        <h1 className="h3 mb-3 fw-normal col-12 text-center">Inicio de sesion</h1>
        <div className="form-floating">
          <input type="email" name='email' className="form-control" onChange={handleChange} id="floatingInput" placeholder="name@example.com" />
          <label htmlFor="floatingInput">Correo</label>
        </div>
        <div className="form-floating">
          <input type="password" name='password' className="form-control" onChange={handleChange} id="floatingPassword" placeholder="Password" />
          <label htmlFor="floatingPassword">Contraseña</label>
        </div>
        <button className="col-12 btn btn-lg" type="button" onClick={() => login(user)}>Ingresar</button>
        <small className='col-12 text-center my-4'>¿Olvidaste tu contraseña?</small>
      </form>
    </div>
  )
}

export default Login