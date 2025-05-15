
import { loginRequest } from '@/src/adapters/api/authApi';
import instance from '@/src/utils/api';
import Cookies from 'js-cookie';

export const useLogin = async (
  phoneNumber: string,
  password: string,
  lembrar: boolean
) => {
  const data = await loginRequest(phoneNumber, password );
  const expires = lembrar ? 7 : 1;

  Cookies.set('token', data.access_token, { expires });
  return data;
};
export const forgotPasswordRequest = async (phoneNumber: string) => {
  const response = await instance.post('/', { phoneNumber });
  return response.data;
};