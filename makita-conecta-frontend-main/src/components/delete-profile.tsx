import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { SessionContext } from "@/contexts/session";

export function DeleteProfile() {
    const { deleteMyAccount } = useContext(SessionContext);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!window.confirm("⚠️ ATENÇÃO!\n\nVocê está prestes a DELETAR PERMANENTEMENTE sua conta.\n\nEsta ação NÃO PODE ser desfeita e todos os seus dados serão perdidos.\n\nDeseja continuar?")) {
            return;
        }

        try {
            setIsDeleting(true);
            console.log("🔄 Iniciando processo de deleção...");
            
            await deleteMyAccount();
            
            
        } catch (error: any) {
            console.error("Erro no frontend:", error);
            
            let errorMessage = "Erro desconhecido";
            if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Falha ao deletar conta:\n\n${errorMessage}\n\nPor favor, tente novamente.`);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Button
            type="button"
            className="text-destructive hover:text-destructive/90 border-destructive hover:bg-destructive/10"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? "Deletando..." : "Deletar minha conta"}
        </Button>
    );
}