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
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import rightfundo from "@/public/images/icons/spot-illustrations/bg-shape.png"
import leftfundo from  "@/public/images/icons/spot-illustrations/shape-1.png"
import { forgotPasswordRequest } from "@/src/core/auth/useLogin";
const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof schema>;

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      await forgotPasswordRequest(data.email);
      toast.success("Email enviado com sucesso!");
      router.push("/login");
    } catch (error: unknown) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center  bg-gray-200">
      <div className="flex w-full  flex-col">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="flex w-full max-w-4xl flex-col gap-6 relative">
            <div className="absolute top-12 left-12 w-64 h-64 -z-10">
              <Image
                src={rightfundo}
                alt="Forma de fundo"
                width={250}
                height={250}
                className="object-cover opacity-10"
              />
            </div>
            <div className="absolute bottom-12 right-12 w-40 h-40 -z-10">
              <Image
                src={leftfundo}
                alt="Forma"
                width={150}
                height={150}
                      className="object-cover opacity-10"
              />
            </div>

            <div className="bg-white rounded-lg shadow-xl overflow-hidden z-10 relative">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-5/12 bg-gradient-to-br from-blue-500 to-blue-700 text-center">
                  <div className="relative p-4 pt-5 pb-7 md:pt-10 md:pb-16 text-white">
                    <div
                      className="absolute inset-0 bg-center bg-no-repeat "
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
                  <div className="p-4 md:p-8 w-full">
                    <div className="flex flex-col gap-3 mb-10">
                      <h3 className="text-xl font-bold text-gray-600">
                     Esqueceu sua senha?
                      </h3>
                      <p className="text-gray-500 font-medium">Digite seu e-mail e enviaremos um link para redefinição.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="mb-4">
                    
                        <input
                        
                          type="email"
                          placeholder="Endereço de email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                    


                      <div className="mb-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-base font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out"
                        >
                          {isLoading ? (
                            <span className="inline-flex gap-1">
                          enviando .... {" "}
                              <Loader2 className="animate-spin h-5 w-5" />
                            </span>
                          ) : (
                            "Enviar link de redefinição"
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

export default ForgotPassword;
