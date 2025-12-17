import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { useContext } from "react";
import { SessionContext } from "@/contexts/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import clsx from "clsx";
import { Button } from "./ui/button";
import MakitaSignIn from "@/assets/sign-in-makitaconecta.svg";
import { useSearchParams } from "react-router"; // Adicione esta importação

const recoveryPasswordFormValidationSchema = z.object({
  password: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type RecoveryPasswordFormData = z.infer<typeof recoveryPasswordFormValidationSchema>

export function RecoveryPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">){
    const { changePasswordOfUser } = useContext(SessionContext);
    const [searchParams] = useSearchParams(); // Obtenha os parâmetros da URL
    const token = searchParams.get('token'); // Extraia o token
    
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<RecoveryPasswordFormData>({
      resolver: zodResolver(recoveryPasswordFormValidationSchema),
      defaultValues: {
        password: '',
        confirmPassword: ''
      }
    })
  
    async function handleChangeUserPassword(data: RecoveryPasswordFormData){
      try{
        // Adicione verificação do token
        if (!token) {
          alert("Token não encontrado na URL. Por favor, use o link enviado por email.");
          return;
        }
        await changePasswordOfUser(data.password);
        alert("Senha alterada com sucesso!");
        // Redirecionar para login
        window.location.href = "/";
      }catch(error){
        if(error instanceof Error){
          alert(error.message);
        }
      }
    }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[400px]">
          <form onSubmit={handleSubmit(handleChangeUserPassword)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Recuperação de senha</h1>
                <p className="text-muted-foreground text-balance">
                  Você está quase lá. Cadastre agora sua nova senha
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="password">Nova Senha</FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id="password" 
                    type="password" 
                    className={clsx(errors.password && "border-destructive ring-destructive")} 
                    {...register("password")}
                  />
                  {errors.password && (
                    <FieldDescription className="text-destructive text-xs">
                      {errors.password.message}
                    </FieldDescription>
                  )}
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmar Nova Senha</FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id="confirmPassword" 
                    type="password" 
                    className={clsx(errors.confirmPassword && "border-destructive ring-destructive")} 
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <FieldDescription className="text-destructive text-xs">
                      {errors.confirmPassword.message}
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
                      'Cadastrar nova senha'
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