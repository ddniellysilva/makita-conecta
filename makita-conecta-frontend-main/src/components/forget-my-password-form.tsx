import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import clsx from "clsx";
import { Button } from "./ui/button";
import MakitaSignIn from "@/assets/sign-in-makitaconecta.svg"
import { NavLink } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useContext } from "react";
import { SessionContext } from "@/contexts/session";
import { Send } from "lucide-react";

const forgetMyPasswordFormValidationSchema = z.object({
  email: z.email('Digite um e-mail válido')
})

type ForgetMyPasswordFormData = z.infer<typeof forgetMyPasswordFormValidationSchema>

export function ForgetMyPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">){
  const {sendLinkToEmail} = useContext(SessionContext)

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<ForgetMyPasswordFormData>({
    resolver: zodResolver(forgetMyPasswordFormValidationSchema),
    defaultValues: {
      email: '',
    }
  })

  async function handleSendLinkToEmail(data: ForgetMyPasswordFormData){
    try{
      await sendLinkToEmail(data.email)
    }catch(error){
      if(error instanceof Error){
        alert(error.message)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[400px]">
          <form onSubmit={handleSubmit(handleSendLinkToEmail)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
                <p className="text-muted-foreground text-balance">
                  Relaxa! Diga seu email cadastrado e verifique sua caixa de email logo em seguida
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id="email"
                    placeholder="seu@email.com"
                    className={clsx(errors.email && "border-destructive ring-destructive")}
                    {...register('email')}
                  />
                  {errors.email && (
                    <FieldDescription className="text-destructive text-xs">
                      {errors.email.message}
                    </FieldDescription>
                  )}
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {
                    isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        <span>Enviar Link</span>
                        <Send />
                      </>
                    )
                  }
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src={MakitaSignIn}
              alt="Image"
              className="absolute h-full w-full inset-0 object-cover "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}