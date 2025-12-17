import { ForgetMyPasswordForm } from "@/components/forget-my-password-form";

export function ForgetMyPassword(){
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ForgetMyPasswordForm />
      </div>
    </div>
  )
}