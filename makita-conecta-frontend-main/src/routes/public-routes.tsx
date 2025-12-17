import { ForgetMyPassword } from "@/pages/forget-my-password";
import { RecoveryPassword } from "@/pages/recovery-password";
import { SignIn } from "@/pages/sign-in";
import { SignUp } from "@/pages/sign-up";
import { Navigate, Route, Routes } from "react-router";
import AnimalProfile from "@/components/animal-profile";

export function PublicRoutes(){
    return (
        <Routes>
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forget-my-password" element={<ForgetMyPassword/>} />
            <Route path="/reset-password" element={<RecoveryPassword/>} />
            <Route path="/animal/:id" element={<AnimalProfile />} />
        </Routes>
    )
}