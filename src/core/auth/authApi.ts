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
      const token = data.token;
  const user = data.data.data;
  const expires = lembrar ? 7 : 1;

  Cookies.set("token", token, { expires });
  Cookies.set("user", JSON.stringify(user), { expires });
  return { token, user };
};
export const getUser = () => {
  const token = Cookies.get("token");
  const userRaw = Cookies.get("user");

  if (!token) throw new Error("Token não encontrado");
  if (!userRaw) throw new Error("Usuário não encontrado");

  const user = JSON.parse(userRaw);

  return user;
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
 window.location.href = "/login";
};