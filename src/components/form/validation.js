// This useless function is used as mark to generate translations...
const t = a => a

export const required = value => (value ? undefined : t('Campo Richiesto'))

export const maxLength = max => value =>
  value && value.length > max ? { label: t('Deve essere al massimo di {max} caratteri'), params: { max }} : undefined

export const minLength = min => value =>
  value && value.length < min ? { label: t('Deve essere di minimo {min} caratteri'), params: { min }} : undefined

export const number = value =>
  value && isNaN(Number(value)) ? t('Deve essere un numero') : undefined

export const minValue = min => value =>
  value && value < min ? `Il valore deve essere maggiore di ${min}.` : undefined

export const maxValue = max => value =>
  value && value > max ? `Il valore deve essere minore di ${max}.` : undefined

export const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? t('Indirizzo email non valido')
    : undefined

export const alphaNumeric = value =>
  value && /[^a-zA-Z0-9 ]/i.test(value)
    ? t('Solo caratteri alfanumerici')
    : undefined

export const validPhone = value =>
  value && !/^[0-9]{5,20}$/.test(value)
    ? t('Telefono non valido')
    : undefined

export const validPhoneCountryCode = value =>
  value && !/^\+[0-9]{2,5}$/.test(value)
    ? t('Prefisso non valido')
    : undefined
