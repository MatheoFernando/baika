import instance from "@/src/lib/api";
import Cookies from "js-cookie";


export const loginRequest = async (number: string, password: string) => {
  const response = await instance.post("/userAuth/signIn", { number, password });
  return response.data;
};

export const useLogin = async (
  number: string,
  password: string,
  lembrar: boolean = false
) => {
  const data = await loginRequest(number, password);
  const expires = lembrar ? 7 : 1;

  Cookies.set("token", data.access_token, { expires });
  Cookies.set("user", JSON.stringify(data.user), { expires });

  return data;
};
export const getUser = async () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token não encontrado");

  const response = await instance.get("/user", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};
