import axios from "axios"
import type { IUserLogin, IUserRegister, User } from "@/types/auth"
import { USER_LOGIN_URL, USER_REGISTER_URL, GOOGLE_AUTH_URL } from "@/services/marbles"

export async function loginApi(body: IUserLogin): Promise<User> {
  const { data } = await axios.post<User>(USER_LOGIN_URL, body)
  return data
}

export async function registerApi(body: IUserRegister): Promise<User> {
  const { data } = await axios.post<User>(USER_REGISTER_URL, body)
  return data
}

export async function googleLoginApi(token: string): Promise<User> {
  const { data } = await axios.post<User>(GOOGLE_AUTH_URL, { token })
  return data
}
