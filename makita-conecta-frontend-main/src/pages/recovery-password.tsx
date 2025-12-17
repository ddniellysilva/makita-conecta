import { RecoveryPasswordForm } from "@/components/recovery-password-form";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router";

export function RecoveryPassword(){
  const [queryParams] = useSearchParams();
  const navigate = useNavigate();

  const token = queryParams.get('token');

  if(!token){
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-3xl">404 |</h1>
          <p>Token não encontrado na URL.</p>
        </div>
        <Button 
          className=""
          onClick={()=> navigate('/')}
        >
          Voltar para página inicial
        </Button>
      </div>
    );
  }

  const isValidToken = token.split('.').length === 3;
  
  if (!isValidToken) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-3xl">Token Inválido |</h1>
          <p>O token de recuperação está malformado.</p>
        </div>
        <Button 
          className=""
          onClick={()=> navigate('/')}
        >
          Voltar para página inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RecoveryPasswordForm />
      </div>
    </div>
  );
}