"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import logo from "@/public/logo.png";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/src/core/auth/authApi";
import toast from "react-hot-toast";
import LocaleSwitcher from "@/src/infrastructure/components/locale-switcher";

const createSchema = (t: any) => z.object({
  number: z
    .string()
    .length(9, t("validation.numberLength"))
    .regex(/^\d+$/, t("validation.numberDigits")),
  password: z.string().min(6, t("validation.passwordMin")),
});

type FormData = {
  number: string;
  password: string;
};

function Login() {
  const [lembrar, setLembrar] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const t = useTranslations("login");
  const router = useRouter();
  
  const schema = createSchema(t);
  
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
      await useLogin(data.number, data.password);
      toast.success(t("messages.loginSuccess"));
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
          toast.error(t("messages.userNotFound"));
        } else if (statusCode === 401) {
          toast.error(t("messages.invalidCredentials"));
        } else {
          toast.error(t("messages.loginError"));
        }
      } else {
        toast.error(t("messages.serverConnectionError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex w-full flex-col relative">
        <div className="absolute top-4 right-4 flex justify-between items-center z-20">
          <LocaleSwitcher className="shadow-sm" />
        </div>

        <div className="min-h-screen flex items-center justify-center  relative">
          <div className="absolute top-30 right-50 hidden  md:w-72 md:h-72">
            <Image
              src="/images/icons/spot-illustrations/bg-shape.png"
              alt="Forma de fundo"
              width={250}
              height={250}
              className="object-cover opacity-80 dark:opacity-40"
            />
          </div>
          <div className="absolute bottom-20 left-50 md:w-72 md:h-72">
            <Image
              src="/images/icons/spot-illustrations/shape-1.png"
              alt="Forma"
              width={150}
              height={150}
              className="object-cover opacity-80 dark:opacity-40"
            />
          </div>

          <div className="flex w-full md:max-w-3xl flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 md:rounded-lg smd:shadow-xl overflow-hidden z-10 relative transition-colors duration-200">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-5/12 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 text-center">
                  <div className="relative p-4 pt-5 pb-7 md:pt-10 md:pb-16 text-white">
                    <div
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover h-full md:block hidden opacity-20"
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
                          alt="Logo"
                          width={150}
                          height={150}
                          className=""
                        />
                      </Link>
                      <p className="text-white opacity-90">
                        {t("leftPanel.description")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 mb-4 md:mt-8 md:mb-10 text-white">
                    <p className="mb-0 mt-4 md:mt-12 text-sm font-semibold text-white opacity-75">
                      {t("leftPanel.readOur")}{" "}
                      <Link href="#" className="underline text-white hover:opacity-100">
                        {t("leftPanel.terms")}
                      </Link>{" "}
                      {t("leftPanel.and")}{" "}
                      <Link href="#" className="underline text-white hover:opacity-100">
                        {t("leftPanel.conditions")}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-7/12 flex items-center justify-center">
                  <div className="p-8 md:p-12 w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200">
                        {t("form.title")}
                      </h3>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="mb-4">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                        >
                          {t("form.phoneNumber")}
                        </label>
                        <input
                          id="phoneNumber"
                          type="text"
                          maxLength={9}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          {...register("number")}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                          placeholder={t("form.phoneNumberPlaceholder")}
                        />
                        {errors.number && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                            {errors.number.message}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 relative">
                        <label
                          className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                          htmlFor="senha"
                        >
                          {t("form.password")}
                        </label>
                        <input
                          id="senha"
                          type={mostrarSenha ? "text" : "password"}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                          {...register("password")}
                          placeholder={t("form.passwordPlaceholder")}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                          tabIndex={-1}
                        >
                          {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {errors.password && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <Link
                          href="#"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          {t("form.forgotPassword")}
                        </Link>
                      </div>

                      <div className="mb-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-600 dark:bg-blue-700 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-500 text-white text-base font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out"
                        >
                          {isLoading ? (
                            <span className="inline-flex gap-1 items-center">
                              {t("form.loggingIn")}{" "}
                              <Loader2 className="animate-spin size-5 text-gray-200" />
                            </span>
                          ) : (
                            t("form.loginButton")
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