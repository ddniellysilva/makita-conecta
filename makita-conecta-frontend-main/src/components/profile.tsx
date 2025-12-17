import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogDescription } from "./ui/dialog";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { DeleteProfile } from "./delete-profile";
import { SessionContext } from "@/contexts/session";
import UserMock from "/src/assets/user.svg" // mock atual

const profileFormValidationSchema = z.object({
  name: z.string(),
})

type ProfileFormData = z.infer<typeof profileFormValidationSchema>

type ProfileProps = {
  buttonReference: React.RefObject<HTMLButtonElement | null>
  modalReference: React.RefObject<HTMLDivElement | null>
}

export function Profile({buttonReference, modalReference}: ProfileProps){
  const {userLogged, updateAccount} = useContext(SessionContext)

  const user = userLogged ?? {
    name: 'Usuário desconhecido',
    email: 'unknown@email.com',
    avatar: null
  }

  const {handleSubmit, register, watch} = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormValidationSchema),
    defaultValues: {
      name: user.name
    }
  })

  const isUnnecessaryEditProfile = watch('name').trim() === user.name || !watch('name')

  async function handleEditProfile(data: ProfileFormData){
    try{
      await updateAccount(data.name)
    }catch(error){
      if(error instanceof Error){
        alert(error.message)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          ref={buttonReference}
          onSelect={(event)=>event.preventDefault()}
          className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          style={{ color: "var(--ink)" }}
        >
          Ver minha conta
        </button>
      </DialogTrigger>
      <DialogContent ref={modalReference} className="overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="bg-accent/60 h-30 w-full relative">
          <img
            src={UserMock}
            alt="Usuário"
            className="h-25 w-25 absolute left-1/2 -translate-x-1/2 -bottom-1/3 "
          />
        </DialogHeader>
        <main className="flex flex-col">
          <div className="flex flex-col gap-2 items-center p-10">
            <DialogTitle className="block">{user.name}</DialogTitle>
            <DialogDescription>
              Edite seu perfil aqui
            </DialogDescription>
          </div>
          <Separator />
          <form onSubmit={handleSubmit(handleEditProfile)} className="p-10 ">
            <FieldGroup>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Field>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input id="name" minLength={2} type="text" placeholder="Digite seu nome" required {...register('name')}/>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="Digite seu e-mail" required disabled value={user.email}/>
                </Field>
              </div>
              <div className="flex items-center gap-4 justify-end">
                <DeleteProfile />
                <Button type="submit" disabled={isUnnecessaryEditProfile}>Editar minha conta</Button>
              </div>
            </FieldGroup>
          </form>
        </main>
      </DialogContent>
    </Dialog>
  )
}