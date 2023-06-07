import axios from 'axios'
import { get } from 'http'
import Swal from 'sweetalert2'

class CustomResponse<T> {
  public data!: T
  public error!: boolean
  public message!: string[]

  constructor() {
    this.data = {} as T
    this.error = false
    this.message = ['']
  }

  public badResponse(errors:string[]): CustomResponse<T> {
    const response = new CustomResponse<T>()
    response.error = true
    response.message = errors
    return response
  }

  public setResponse(data: T, error: boolean, message: string[]): CustomResponse<T> {
    const response = new CustomResponse<T>()
    response.data = data
    response.error = error
    response.message = message
    return response
  }
}

const billingApi = 'http://localhost:4001/api/v1/'
const dashboardApi = 'http://localhost:3001/api/v1/'

const useGetList = async<T>(route: string, api: boolean): Promise<CustomResponse<T>> => {
  return await useCustom<T>(route, 'get', {} as T, api)
}

const usePost = async<T>(route: string, data: T, api: boolean): Promise<CustomResponse<T>> => {
  return await useCustom<T>(route, 'post', data, api)
}

const usePostWithResponse = async(route: string, data: any, api: boolean): Promise<CustomResponse<any>> => {
  return await useCustom<any>(route, 'post', data, api)
}

const useDelete = async<T>(route: string, api: boolean): Promise<CustomResponse<T>> => {
  return await useCustom<T>(route, 'delete', {} as T, api)
}

const useGet = async<T>(route: string, api: boolean): Promise<CustomResponse<T>> => {
  return await useCustom<T>(route, 'get', {} as T, api)
}

const usePatch = async<T>(route: string, data: T, api: boolean): Promise<CustomResponse<T>> => {
  return await useCustom<T>(route, 'patch', data, api)
}

const getCredentials = (): string => {
  const credentials = localStorage.getItem('credentials')
  if (credentials) {
    const token = JSON.parse(credentials).token
    return token
  }
  return ''
}

const useCustom = async<T>(route: string, method: string, data: T, api: boolean): Promise<CustomResponse<T>> => {
  const customResponse = new CustomResponse<T>()
  const currentApi = api ? billingApi : dashboardApi
  try {
    const response = await axios({
      headers: {
        Authorization: `bearer ${getCredentials()}`
      },
      method: method,
      url: `${currentApi}${route}`,
      data: data,
    })

    if (response?.data?.error) {
      Swal.fire('Error', response.data.message.toString(), 'error')
      return customResponse.badResponse(response.data.message)
    }

    return customResponse.setResponse(response.data.content, false, [''])

  } catch (error) {
    return customResponse.badResponse(['Bad response'])

  }

}


export { useGetList, usePost, useDelete, useGet, useCustom, usePatch, usePostWithResponse }