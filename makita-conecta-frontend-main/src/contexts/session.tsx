import { createContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router";

const API_URL = "http://127.0.0.1:5000";

type UserDTO = {
    name: string
    email: string
    id?: number
}

type SessionContextProps = {
    userLogged: UserDTO | null
    signIn: (email: string, password: string) => Promise<void>
    signUp: (name: string, email: string, password: string) => Promise<void>
    signOut: () => void
    sendLinkToEmail: (email: string) => Promise<void>
    changePasswordOfUser: (newPassword: string) => Promise<void>
    deleteMyAccount: () => Promise<void>
    updateAccount: (name: string) => Promise<void>
    fetchAnimalsByQuery: (query: string, sex?: string, species?: string) => Promise<any[]>
}

export const SessionContext = createContext<SessionContextProps>({
    userLogged: null,
    signIn: async () => { },
    signUp: async () => { },
    signOut: () => { },
    sendLinkToEmail: async () => { },
    changePasswordOfUser: async () => { },
    deleteMyAccount: async () => { },
    updateAccount: async () => { },
    fetchAnimalsByQuery: async () => []
})

type SessionProviderProps = {
    children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
    const [userLogged, setUserLogged] = useState<UserDTO | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (token) {
            fetchUserProfile(token);
        }
    }, []);

    async function fetchUserProfile(token: string) {
        try {
            const response = await fetch(`${API_URL}/api/profile`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUserLogged({
                    name: userData.name,
                    email: userData.email,
                    id: userData.id
                });
            } else {
                signOut();
            }
        } catch (error) {
            console.error("Erro ao recuperar sessao:", error);
            signOut();
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erro ao fazer login");
            }

            sessionStorage.setItem("access_token", result.access_token);
            await fetchUserProfile(result.access_token);

        } catch (error) {
            throw error;
        }
    }

    async function signUp(name: string, email: string, password: string) {
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erro ao cadastrar");
            }
        } catch (error) {
            throw error;
        }
    }

    function signOut() {
        sessionStorage.removeItem("access_token");
        setUserLogged(null);
        window.location.href = "/";
    }

    async function sendLinkToEmail(email: string) {
        const response = await fetch(`${API_URL}/api/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Erro ao enviar email.");
        }
    }

    async function changePasswordOfUser(newPassword: string) {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const tokenFromUrl = url.searchParams.get("token");

        if (!tokenFromUrl) {
            throw new Error("Token de recuperacao invalido ou expirado.");
        }

        const response = await fetch(`${API_URL}/api/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenFromUrl}`
            },
            body: JSON.stringify({ newPassword })
        });

        if (!response.ok) {
            throw new Error("Erro ao alterar senha.");
        }
    }

    async function deleteMyAccount() {
    const token = sessionStorage.getItem("access_token");
    if (!token) throw new Error("Usuário não autenticado");

    console.log("Deletando conta... Token:", token ? "Presente" : "Ausente");

    try {
        const response = await fetch(`${API_URL}/api/profile`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Resposta do servidor:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro detalhado ao deletar conta:", errorText);
            
            if (response.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
            if (response.status === 404) throw new Error("Usuário não encontrado.");
            if (response.status === 403) throw new Error("Não autorizado para deletar esta conta.");
            
            throw new Error(`Erro ao deletar conta: ${response.status} ${response.statusText}`);
        }

        const result = await response.json().catch(() => ({}));
        console.log("Conta deletada com sucesso:", result);

        sessionStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        setUserLogged(null);

        alert("Conta deletada com sucesso!");
        window.location.href = "/login";
        
        return result;

    } catch (error) {
        console.error("Erro na função deleteMyAccount:", error);
        throw error;
    }
}

    async function updateAccount(name: string) {
        const token = sessionStorage.getItem("access_token");
        if (!token) throw new Error("Usuario nao autenticado");

        const response = await fetch(`${API_URL}/api/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (response.status === 401) {
            throw new Error("Nao autorizado");
        }

        if (!response.ok) {
            throw new Error("Erro ao atualizar perfil");
        }

        const data = await response.json();

        if (userLogged) {
            setUserLogged({ ...userLogged, name: data.name });
        }
    }

    async function fetchAnimalsByQuery(query: string, sex?: string, species?: string) {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            if (query && query.trim().length > 0) newParams.set("q", query);
            else newParams.delete("q");

            if (sex && sex !== "todos") newParams.set("sex", sex);
            else newParams.delete("sex");

            if (species && species !== "todos") newParams.set("species", species);
            else newParams.delete("species");

            return newParams;
        });

        const apiParams = new URLSearchParams();

        if (query && query.trim().length > 0) apiParams.append("query", query);
        if (sex && sex !== "todos") apiParams.append("sex", sex);
        if (species && species !== "todos") apiParams.append("species", species);

        try {
            const response = await fetch(`${API_URL}/api/animals?${apiParams.toString()}`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error("Erro na busca:", error);
            return [];
        }
    }

    const contextValue: SessionContextProps = {
        userLogged,
        signIn,
        signUp,
        signOut,
        sendLinkToEmail,
        changePasswordOfUser,
        deleteMyAccount,
        updateAccount,
        fetchAnimalsByQuery
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    )
}