
import { loginRequest } from '@/src/adapters/api/authApi';
import instance from '@/src/lib/api';
import Cookies from 'js-cookie';

export const useLogin = async (
  number: string,
  password: string,
  lembrar: boolean
) => {
  const data = await loginRequest(number, password );
  const expires = lembrar ? 7 : 1;

  Cookies.set('token', data.access_token, { expires });
  return data;
};
export const forgotPasswordRequest = async (number: string) => {
  const response = await instance.post('/', { number });
  return console.log(response.data);
};
