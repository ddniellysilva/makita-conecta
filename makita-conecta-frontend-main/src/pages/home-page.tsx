import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AnimalCarousel } from "@/components/animal-carousel"
import { WhyAdoptSection } from "@/components/why-adoption-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { useSearchParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContext, useEffect, useState } from "react"
import { SessionContext } from "@/contexts/session"
import { useNavigate } from "react-router"

type Animal = {
  id: number;
  name: string;
  description: string;
  species: string;
  sex: string;
  image_url: string;
};

export default function Home() {
  const { fetchAnimalsByQuery } = useContext(SessionContext);
  const [animalType, setAnimalType] = useState('todos');
  const [sex, setSex] = useState('todos');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = params.get('q') || '';
  const speciesParam = params.get('species') || 'todos';
  const sexParam = params.get('sex') || 'todos';
  
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    setAnimalType(speciesParam);
    setSex(sexParam);
    
    if (query || speciesParam !== 'todos' || sexParam !== 'todos') {
      setIsSearchMode(true); 
      performSearch();
    } else {
      setIsSearchMode(false); 
    }
  }, [params]); 

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchQuery = query || '';
      const data = await fetchAnimalsByQuery(
        searchQuery, 
        sexParam !== 'todos' ? sexParam : undefined,
        speciesParam !== 'todos' ? speciesParam : undefined
      );
      setAnimals(data);
    } catch (error) {
      console.error("Erro na busca:", error);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    
    // Mantém o query se existir
    if (query) newParams.set('q', query);
    if (animalType && animalType !== 'todos') newParams.set('species', animalType);
    if (sex && sex !== 'todos') newParams.set('sex', sex);
    
    setSearchParams(newParams);
    setIsSearchMode(true); // Garante que entra em modo busca
  };

  const handleResetFilters = () => {
    setAnimalType('todos');
    setSex('todos');
    setSearchParams(new URLSearchParams());
    setAnimals([]);
    setIsSearchMode(false); // Volta para tela inicial
  };

  const handleAnimalClick = (animalId: number) => {
    navigate(`/animal/${animalId}`);
  };
  const shouldShowSearchResults = isSearchMode || query || speciesParam !== 'todos' || sexParam !== 'todos';

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {shouldShowSearchResults ? (
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {query ? (
                <>Busca por <span className="text-primary">"{query}"</span></>
              ) : (
                "Animais disponíveis para adoção"
              )}
            </h1>
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              className="ml-4"
            >
              Voltar para início
            </Button>
          </div>

          <Card className="mb-8">
            <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Espécie</label>
                <Select onValueChange={setAnimalType} value={animalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                    <SelectItem value="cachorro">Cachorro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Sexo</label>
                <Select onValueChange={setSex} value={sex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="fêmea">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-transparent">.</label>
                <Button 
                  className="w-full" 
                  onClick={handleApplyFilters}
                  disabled={loading}
                >
                  {loading ? "Buscando..." : "Aplicar filtros"}
                </Button>
              </div>
              
              <div className="flex items-end">
                <p className="text-sm text-gray-500">
                  {animals.length} animal{animals.length !== 1 ? 'is' : ''} encontrado{animals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          <section>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : animals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animals.map((animal) => (
                  <Card 
                    key={animal.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAnimalClick(animal.id)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={animal.image_url || "/placeholder-animal.jpg"}
                        alt={animal.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{animal.name}</h3>
                        <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                          {animal.species}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{animal.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {animal.sex === 'macho' ? '♂ Macho' : '♀ Fêmea'}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnimalClick(animal.id);
                          }}
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {query 
                    ? `Nenhum animal encontrado para "${query}" com os filtros aplicados.`
                    : "Nenhum animal encontrado com os filtros aplicados."}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleResetFilters}
                >
                  Ver todos os animais
                </Button>
              </div>
            )}
          </section>
        </main>
      ) : (
        <>
          <HeroSection />
          <AnimalCarousel />
          <WhyAdoptSection />
          <CTASection />
          <Footer />
        </>
      )}
    </main>
  )
}