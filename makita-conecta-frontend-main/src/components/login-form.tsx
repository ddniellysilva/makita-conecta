import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import MakitaSignIn from "@/assets/sign-in-makitaconecta.svg"
import { NavLink } from "react-router"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { useContext } from "react"
import { SessionContext } from "@/contexts/session"

const loginFormValidationSchema = z.object({
  email: z.email('Digite um e-mail válido'),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

type LoginFormData = z.infer<typeof loginFormValidationSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {signIn} = useContext(SessionContext)

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<LoginFormData>({
    resolver: zodResolver(loginFormValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  async function handleSignIn(data: LoginFormData){
    try{
      await signIn(data.email, data.password)
    }catch(error){
      if(error instanceof Error){
        alert(error.message)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(handleSignIn)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Makita Conecta</h1>
                <p className="text-muted-foreground text-balance">
                  Conectando corações a novos lares.
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <NavLink
                    to="/forget-my-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </NavLink>
                </div>
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
                <Button type="submit" disabled={isSubmitting}>
                  {
                    isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : (
                      'Login'
                    )
                  }
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Não tem uma conta? <NavLink to="/sign-up">Criar conta</NavLink>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src={MakitaSignIn}
              alt="Image"
              className="absolute  inset-0 h-full w-full object-cover "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
