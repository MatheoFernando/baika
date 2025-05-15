import instance from "@/src/lib/api";

export const loginRequest = async (number: string, password: string) => {
  const response = await instance.post('/userAuth/signIn', { number, password });
  return response.data;
};
