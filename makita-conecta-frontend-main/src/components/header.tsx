"use client"

import { useContext, useEffect, useRef, useState } from "react"
import MakitaLogo from "@/assets/makita-conecta-logo.svg"
import { SessionContext } from "@/contexts/session"
import UserMock from "/src/assets/user.svg" 
import { Profile } from "./profile"
import { SearchBar } from "./search-bar"

export function Header() {
  const [open, setOpen] = useState(false)
  const { userLogged, signOut } = useContext(SessionContext)

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  function handleSignOut() {
    signOut()
    setOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const path = event.composedPath()

      if(modalRef.current && path.includes(modalRef.current)){
        return 
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node) 
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ borderColor: "rgba(47, 27, 18, 0.1)" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center relative">
        
        {/* LOGO */}
        <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity">
          <img src={MakitaLogo} alt="Makita Conecta" className="h-10 w-auto" />
        </div>
        <SearchBar />

        {/* LINKS DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#por-que-adotar" className="text-sm font-medium hover:opacity-70" style={{ color: "var(--ink)" }}>
            Por que adotar?
          </a>

          <a href="#animais" className="text-sm font-medium hover:opacity-70" style={{ color: "var(--ink)" }}>
            Animais
          </a>

          
            <div className="md:relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                className="
                  w-10 h-10 rounded-full 
                  overflow-hidden border
                  flex items-center justify-center
                  transition-all shadow-md hover:shadow-lg
                "
                style={{
                  backgroundColor: "var(--sky)",
                  borderColor: "var(--brand-ink)",
                  boxShadow: "0 2px 5px rgba(75, 46, 32, 0.22)",
                }}
              >
                {/* APENAS A IMAGEM MOCK (ATÉ VIR API) */}
                <img
                  src={UserMock}
                  alt="Usuário"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* DROPDOWN */}
              
            </div>
      
        </div>

        {/* MENU MOBILE */}
        <div className="md:hidden" ref={dropdownRef}>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--sky)", color: "var(--brand)" }}
            onClick={()=>setOpen(!open)}
            ref={buttonRef}
          >
            <span className="text-xl">≡</span>
          </button>
        </div>
        {open && (
                <div ref={dropdownRef}
                  className="
                    absolute right-2 top-12 mt-3 w-48
                    bg-white rounded-xl shadow-xl border
                    py-2 animate-fade-slide z-50
                  "
                  style={{
                    borderColor: "rgba(47, 27, 18, 0.15)",
                    boxShadow: "0 4px 12px rgba(47, 27, 18, 0.18)",
                  }}
                >
                  <Profile buttonReference={buttonRef} modalReference={modalRef}/>
                  <button
                    ref={buttonRef}
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    Sair
                  </button>
                </div>
              )}
      </nav>

      {/* ANIMAÇÃO DROPDOWN */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fadeSlide .22s ease-out;
        }
      `}</style>

    </header>
  )
}