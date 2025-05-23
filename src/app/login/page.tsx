"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from "@/public/logo.png";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/src/core/auth/authApi";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  number: z
    .string()
    .length(9, "O número deve ter exatamente 9 dígitos")
    .regex(/^\d+$/, "O número deve conter 9 apenas dígitos"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

function Login() {
  const [lembrar, setLembrar] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await useLogin(data.number, data.password, lembrar);
      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Erro ao fazer login:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object"
      ) {
        const response = (error as any).response;
        const message = response.data?.message;
        const statusCode = response.data?.statusCode;

        if (statusCode === 404 && message === "User not found") {
          toast.error("Usuário não encontrado");
        } else if (statusCode === 401) {
          toast.error("Credenciais inválidas");
        } else {
          toast.error("Erro ao fazer login. Tente novamente.");
        }
      } else {
        toast.error("Erro ao conectar com o servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="flex min-h-svh flex-col items-center justify-center  bg-gray-100">
      <div className="flex w-full  flex-col relative">
        <h1 className="text-gray-500 text-base mx-6 absolute bottom-2 left-2">V2</h1>
        <div className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="absolute top-30 right-50 md:w-72 md:h-72  ">
            <Image
              src="/images/icons/spot-illustrations/bg-shape.png"
              alt="Forma de fundo"
              width={250}
              height={250}
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-20 left-50 md:w-72 md:h-72 ">
            <Image
              src="/images/icons/spot-illustrations/shape-1.png"
              alt="Forma"
              width={150}
              height={150}
              className="object-cover"
            />
          </div>
          <div className="flex w-full max-w-3xl flex-col gap-6 ">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden z-10 relative">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-5/12 bg-gradient-to-br from-blue-500 to-blue-700 text-center">
                  <div className="relative p-4 pt-5 pb-7 md:pt-10 md:pb-16 text-white">
                    <div
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover h-full md:block hidden"
                      style={{
                        backgroundImage:
                          "url('/images/icons/spot-illustrations/half-circle.png')",
                      }}
                    ></div>

                    <div className="relative z-10">
                      <Link
                        href="/"
                        className="mb-4 font-sans inline-block font-bold text-white"
                      >
                        <Image
                          src={logo}
                          alt="Forma"
                          width={150}
                          height={150}
                          className=""
                        />
                      </Link>
                      <p className=" text-white">
                        Com o poder do Falcon, você pode focar apenas nas
                        funcionalidades dos seus produtos digitais, deixando o
                        design com a gente!
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 mb-4 md:mt-8 md:mb-10 text-white">
                    <p className="mb-0 mt-4 md:mt-12 text-sm font-semibold text-white opacity-75">
                      Leia nossos{" "}
                      <Link href="#" className="underline text-white">
                        termos
                      </Link>{" "}
                      e{" "}
                      <Link href="#" className="underline text-white">
                        condições
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="md:w-7/12 flex items-center justify-center">
                  <div className="p-8 md:p-12 w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl md:text-2xl font-medium text-gray-600">
                        Entrar na conta
                      </h3>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="mb-4">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium text-gray-500 mb-1"
                        >
                          Número de telefone
                        </label>
                        <input
                          id="phoneNumber"
                          type="text"
                          maxLength={9}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          {...register("number")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Digite seu número de telefone"
                        />
                        {errors.number && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.number.message}
                          </p>
                        )}
                      </div>

                <div className="mb-4 relative">
  <label
    className="block text-sm font-medium text-gray-500 mb-1"
    htmlFor="senha"
  >
    Senha
  </label>
  <input
    id="senha"
    type={mostrarSenha ? "text" : "password"}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
    {...register("password")}
    placeholder="Digite sua senha"
  />
  <button
    type="button"
    onClick={() => setMostrarSenha(!mostrarSenha)}
    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
    tabIndex={-1}
  >
    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
  {errors.password && (
    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
  )}
</div>


                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <input
                            id="lembrar"
                            type="checkbox"
                            checked={lembrar}
                            onChange={() => setLembrar(!lembrar)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded checked:text-blue-600"
                          />
                          <label
                            htmlFor="lembrar"
                            className="ml-2 block text-sm font-medium text-gray-500"
                          >
                            Lembrar de mim
                          </label>
                        </div>
                        <Link
                          href="#"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>

                      <div className="mb-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-base font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out"
                        >
                          {isLoading ? (
                            <span className="inline-flex gap-1 items-center">
                              Entrando{" "}
                              <Loader2 className="animate-spin size-5 text-gray-200" />
                            </span>
                          ) : (
                            "Entrar"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
