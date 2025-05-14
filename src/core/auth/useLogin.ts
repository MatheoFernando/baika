
import { loginRequest } from '@/src/adapters/api/authApi';
import instance from '@/src/adapters/api/axiosInstance';
import Cookies from 'js-cookie';

export const useLogin = async (
  email: string,
  password: string,
  lembrar: boolean
) => {
  const data = await loginRequest(email, password);
  const expires = lembrar ? 7 : 1;

  Cookies.set('auth-token', data.access_token, { expires });
  return data;
};
export const forgotPasswordRequest = async (email: string) => {
  const response = await instance.post('/', { email });
  return response.data;
};