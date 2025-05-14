import instance from './axiosInstance';
import axios from './axiosInstance';

export const loginRequest = async (email: string, password: string) => {
  const response = await instance.post('userAuth/signIn', { email, password });
  return response.data;
};
