export type User = {
  id: string
  email: string
  name: string
  token: string
  isAdmin: boolean
}

export interface IUserLogin {
  email: string
  password: string
}

export interface IUserRegister {
  name: string
  email: string
  password: string
  ConfirmPassword: string
}
