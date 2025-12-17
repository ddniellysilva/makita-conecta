"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"

interface Animal {
  id: number | string;
  name: string;
  image: string; 
  breed?: string; 
  age?: string;   
  description?: string; 
}

export function AnimalCarousel() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [scroll, setScroll] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/animals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const backendAnimals: Animal[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.image_url || "https://placehold.co/600x400?text=Sem+Foto", 
            breed: "Recém chegado", 
            age: "Disponível"       
          }));

          setAnimals(backendAnimals);
        }
      })
      .catch((error) => console.error("Erro ao buscar animais:", error))
  }, [])

  const scroll_carousel = (direction: "left" | "right") => {
    if (!containerRef.current) return
    const scrollAmount = 320
    const newScroll = direction === "left" ? Math.max(0, scroll - scrollAmount) : scroll + scrollAmount

    containerRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    })
    setScroll(newScroll)
  }

  if (animals.length === 0) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-500">Nenhum animal cadastrado ainda.</h2>
        <p className="text-gray-400">Acesse o sistema para adicionar pets.</p>
      </section>
    )
  }

  return (
    <section id="animais" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--ink)" }}>
            Animais esperando por você
          </h2>
          <p className="text-lg" style={{ color: "var(--brand-ink)" }}>
            Estes são nossos companheiros cadastrados no sistema
          </p>
        </div>

        <div className="relative group">
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {animals.map((animal, index) => (
              <div
                key={`${animal.id}-${index}`}
                className="flex-shrink-0 w-72 animate-fade-in transition-transform hover:scale-105 cursor-pointer group/card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => (window.location.href = `/animal/${animal.id}`)}
              >
                <div
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
                  style={{ backgroundColor: "var(--sky)" }}
                >
                  <div className="relative overflow-hidden bg-gray-200 h-64">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400?text=Erro+na+Foto"
                      }}
                    />
                    <button
                      className="absolute top-4 right-4 p-3 rounded-full bg-white shadow-md transition-all hover:scale-110 active:scale-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-5 h-5" style={{ color: "var(--accent)" }} />
                    </button>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>
                        {animal.name}
                      </h3>
                      
                      <p className="text-sm mb-4 line-clamp-3" style={{ color: "var(--brand-ink)" }}>
                          {animal.description || "Sem descrição informada."}
                      </p>
                    </div>

                    <button
                      className="w-full py-2 rounded-lg font-semibold transition-all hover:shadow-lg transform hover:scale-105 active:scale-95 mt-2"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                      }}
                    >
                      Ver perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
           <button
            onClick={() => scroll_carousel("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--brand)" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll_carousel("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--brand)" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      </div>
    </section>
  )
}