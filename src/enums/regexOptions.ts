export enum regexOptions {
  text = '[a-zA-Z0-9\\u00E0-\\u00FC\\s?]*',
  email = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}',
  decimal = '^[0-9]+(.[0-9]+)?$',
  integer = '[0-9]*',
  integerLengthTwo = '[0-9]{2}*',
  phone = '[0-9]{8}',
  textWithSpaceAndComma = '[a-zA-Z0-9\\u00E0-\\u00FC\\s?,]*',
}