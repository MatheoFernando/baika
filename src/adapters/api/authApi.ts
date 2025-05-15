import instance from "@/src/utils/api";

export const loginRequest = async (phoneNumber: string, password: string) => {
  const response = await instance.post('auth/signIn', { phoneNumber, password });
  return response.data;
};
