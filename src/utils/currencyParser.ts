export const parseCurrency = (value: string): string => {
  const stringLength = value.length
  if(stringLength < 4) return `¢${value}`
  let finalValue = ''
  let position = 0
  for(let i = stringLength - 1; i >= 0; i--) {
    if(position === 3) {
      finalValue = ',' + finalValue
      position = 0
    }
    finalValue = value[i] + finalValue
    position++
  }

  return `¢${finalValue}`
}

