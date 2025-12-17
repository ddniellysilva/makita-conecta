import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useContext, useState } from "react"
import { SessionContext } from "@/contexts/session"
import { useNavigate, useSearchParams } from "react-router"

export function SearchBar() {
  const [query, setQuery] = useState('')
  const { fetchAnimalsByQuery } = useContext(SessionContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const currentSpecies = searchParams.get('species') || 'todos'
  const currentSex = searchParams.get('sex') || 'todos'

  async function handleFetchAnimals() {
    try {
      const newParams = new URLSearchParams()
      
      if (query.trim()) {
        newParams.set('q', query.trim())
      }
      
      if (currentSpecies && currentSpecies !== 'todos') {
        newParams.set('species', currentSpecies)
      }
      if (currentSex && currentSex !== 'todos') {
        newParams.set('sex', currentSex)
      }
      
      const queryString = newParams.toString()
      navigate(queryString ? `/?${queryString}` : '/')
      
      await fetchAnimalsByQuery(
        query.trim(),
        currentSex !== 'todos' ? currentSex : undefined,
        currentSpecies !== 'todos' ? currentSpecies : undefined
      )
      
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchAnimals()
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#C4A484] bg-[#F7F2EB] px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[#C4A484]/40 flex-1 mx-4">
      <Search className="h-4 w-4 text-[#8B5E3C]" />

      <Input
        placeholder="Buscar animais..."
        className="h-8 border-none bg-transparent px-1 text-sm text-[#3B2A1F] placeholder:text-[#9C7A5C] focus-visible:ring-0"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button
        size="sm"
        className="h-7 rounded-full bg-[#8B5E3C] px-3 text-xs text-white hover:bg-[#6F462C]"
        onClick={handleFetchAnimals}
      >
        Buscar
      </Button>
    </div>
  )
}