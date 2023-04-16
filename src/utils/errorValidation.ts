const higherThanZero = (value: any) => {
  return value !== 0
}

export const showErrorMsg = (name: string) => {
  const msg = document.getElementById(name)
  if (msg) {
    msg.style.display = 'flex'
  }
}

export const hideErrorMsg = (name: string) => {
  const msg = document.getElementById(name)
  if (msg) {
    msg.style.display = 'none'
  }
}

export const validateNumber = (value: any, name: string, regex: RegExp, couldBeZero?: boolean): boolean => {
  const isValid = regex.test(value)

  if (isValid) {
    if (!couldBeZero) {
      if (!higherThanZero(value)) {
        showErrorMsg(name)
        return false
      }
    }
    hideErrorMsg(name)
    return true
  } else {
    showErrorMsg(name)
    return false
  }
}

export const validateString = (value: any, name: string, length: number): boolean => {
  const currentLength = length === 0 ? 1000 : length
  const reg = new RegExp(`^[a-zA-Z0-9\\u00E0-\\u00FC\\s?]{1,${currentLength}}$`)
  const isValid = reg.test(value)
  if (isValid) {
    hideErrorMsg(name)
    return true
  } else {
    showErrorMsg(name)
    return false
  }
}
