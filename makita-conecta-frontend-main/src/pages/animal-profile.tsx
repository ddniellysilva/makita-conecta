import { AnimalProfile as AnimalProfileComponent } from "@/components/animal-profile";

export function AnimalProfile(){
    return (
        <div className="bg-background flex min-h-svh flex-col p-0">
            <div className="w-full">
                <AnimalProfileComponent />
            </div>
        </div>
    )
}