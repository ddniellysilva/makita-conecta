import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; 
import { Card, CardContent } from "@/components/ui/card";
import MakitaLogo from "@/assets/makita-conecta-logo.svg";
import { useNavigate, useParams } from 'react-router';

interface Animal {
  id: number;
  name: string;
  species: 'Cachorro' | 'Gato' | 'Outro';
  breed: string;
  status: 'Disponível' | 'Adotado' | 'Em Avaliação';
  age: string;
  size: 'Pequeno' | 'Médio' | 'Grande';
  sex: 'Macho' | 'Fêmea';
  location: string;
  description: string;
  temperament: string[];
  vaccines: { name: string; status: 'Em dia' | 'Pendente' }[];
  specialCare: string[];
  mainImage: string;
  thumbnailImages: string[];
}

interface AnimalProfileProps extends React.ComponentProps<"div"> {}

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col p-3 bg-secondary rounded-lg">
    <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
    <span className="text-base font-bold text-foreground">{value}</span>
  </div>
);

const VaccineTag: React.FC<{ name: string; status: 'Em dia' | 'Pendente' }> = ({ name, status }) => {
  const isUpToDate = status === 'Em dia';
  const successColor = "text-green-600";
  const warningColor = "text-amber-500";

  const icon = isUpToDate ? (
    <svg className={`w-4 h-4 ${successColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  ) : (
    <svg className={`w-4 h-4 ${warningColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  return (
    <div className="flex justify-between items-center p-2 bg-card rounded-lg shadow-sm mb-1 border border-border">
      <span className="text-foreground/80 font-medium text-sm">{name}</span>
      <div className={`flex items-center space-x-1 ${isUpToDate ? successColor : warningColor}`}>
        {icon}
        <span className="text-xs font-semibold">{status}</span>
      </div>
    </div>
  );
};

type RouteParams = {
    id: string
}

const API_URL = "http://127.0.0.1:5000";

export function AnimalProfile({ className, ...props }: AnimalProfileProps) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams() as RouteParams;
  const navigate = useNavigate();

  useEffect(() => {
    async function getAnimalById(animalId: string) {
      try {
        const response = await fetch(`${API_URL}/api/animals/${animalId}`);
        
        if (response.status === 404) {
          setError("Animal nao encontrado");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Erro ao carregar animal");
        }

        const animalData = await response.json();
        
        const formattedAnimal: Animal = {
          id: animalData.id,
          name: animalData.name,
          species: animalData.species === 'cachorro' ? 'Cachorro' : 
                  animalData.species === 'gato' ? 'Gato' : 'Outro',
          breed: 'Nao informada',
          status: 'Disponível',
          age: 'Nao informada',
          size: 'Médio',
          sex: animalData.sex === 'macho' ? 'Macho' : 'Fêmea',
          location: 'Nao informada',
          description: animalData.description || 'Sem descricao disponivel',
          temperament: [],
          vaccines: [],
          specialCare: [],
          mainImage: animalData.image_url || "https://placehold.co/800x600/D2B48C/5C4033?text=Sem+Imagem",
          thumbnailImages: animalData.image_url ? [animalData.image_url] : [],
        };

        setAnimal(formattedAnimal);
      } catch (error) {
        setError("Nao foi possivel carregar o perfil do animal");
        console.error("Erro ao buscar animal:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getAnimalById(id);
    } else {
      setError("ID do animal nao fornecido");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
        <div className={cn("min-h-screen bg-background flex items-center justify-center", className)} {...props}>
            <div className="text-primary flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-t-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-lg text-foreground">Carregando perfil do animal...</p>
            </div>
        </div>
    );
  }

  if (error || !animal) {
    const message = error || `O animal com ID ${id} nao foi encontrado.`;
    const title = error ? "Erro ao carregar!" : "Animal nao encontrado :(";
    
    return (
        <div className={cn("min-h-screen bg-background flex items-center justify-center", className)} {...props}>
            <div className="text-foreground flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border border-border max-w-sm">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground mb-4 text-center">{message}</p>
                <Button 
                    onClick={() => error ? window.location.reload() : navigate('/')} 
                    className="mt-4 bg-accent text-accent-foreground"
                >
                    {error ? 'Tentar Novamente' : 'Ver todos os animais'}
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className={cn("min-h-screen w-full bg-background", className)} {...props}>
      <header className="sticky top-0 z-10 p-4 shadow-md bg-white" >
        <div className="flex justify-between items-center px-4 md:px-8 lg:px-12">
          <img
            src={MakitaLogo}
            alt="Logo Makita Conecta"
            className="w-auto h-8"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x32/6f4e37/f8f3ec?text=MAKITA'; e.currentTarget.className = "w-auto h-8 text-white"; }}
          />

          <Button
            className="hidden sm:block text-primary bg-primary-foreground font-semibold rounded-full shadow-lg text-sm px-4 py-2"
            variant="secondary" 
            onClick={()=>navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <section className=" space-y-6">
                <Card className="rounded-xl shadow-lg p-3 md:p-5">
                  <CardContent className='p-0'>
                    <div className="relative mb-3 overflow-hidden rounded-lg aspect-w-4 aspect-h-3">
                      <img
                        src={animal.mainImage}
                        alt={`Foto principal de ${animal.name}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/800x600/D2B48C/5C4033?text=Imagem+de+${animal.name}`; }}
                      />
                      <button className="absolute top-3 right-3 p-2 bg-card/70 backdrop-blur-sm rounded-full text-destructive hover:bg-card transition duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex space-x-3 overflow-x-auto pb-1">
                      {animal.thumbnailImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md border-2 border-transparent hover:border-primary transition duration-300 cursor-pointer flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/A0522D/FDF5E6?text=Thumb'; }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-5 rounded-xl shadow-lg border border-border">
                  <CardContent className='p-0'>
                    <h2 className="text-xl font-bold text-foreground/80 mb-3 border-b pb-2 border-border">Temperamento</h2>
                    <div className="flex flex-wrap gap-2">
                      {animal.temperament.map((temp, index) => (
                        <span
                          key={index}
                          className="bg-secondary text-foreground font-medium px-3 py-1 rounded-full text-xs shadow-sm"
                        >
                          {temp}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="lg:col-span-1 space-y-4 md:space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{animal.name}</h1>
                    <p className="text-sm text-muted-foreground">{animal.breed} • {animal.species}</p>
                  </div>
                  <span className="text-xs font-bold py-1 px-3 rounded-full bg-green-100 text-green-700 uppercase self-center shadow-sm flex-shrink-0">
                    {animal.status}
                  </span>
                </div>

                <Card className="p-4 rounded-xl shadow-lg border border-border">
                  <CardContent className='p-0 grid grid-cols-2 gap-3'>
                    <InfoCard label="Idade" value={animal.age} />
                    <InfoCard label="Porte" value={animal.size} />
                    <InfoCard label="Sexo" value={animal.sex} />
                    <InfoCard label="Local" value={animal.location} />
                  </CardContent>
                </Card>

                <Button
                  onClick={() => console.log(`Interesse em visitar animal ID: ${animal.id}`)}
                  className="w-full font-bold py-3 text-lg shadow-lg text-primary-foreground"
                  style={{ backgroundColor: 'var(--brand)' }}
                  variant="default"
                >
                  Tenho interesse em visitar
                </Button>

                <Card className="p-5 rounded-xl shadow-lg border border-border">
                  <CardContent className='p-0'>
                    <h2 className="text-xl font-bold text-foreground/80 mb-3 border-b pb-2 border-border">Historia</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{animal.description}</p>
                  </CardContent>
                </Card>

                <Card className="p-5 rounded-xl shadow-lg border border-border">
                  <CardContent className='p-0'>
                    <h2 className="text-xl font-bold text-foreground/80 mb-3 border-b pb-2 border-border">Vacinas</h2>
                    <div className="space-y-2">
                      {animal.vaccines.map((v, index) => (
                        <VaccineTag key={index} name={v.name} status={v.status} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-5 rounded-xl shadow-lg border border-border">
                  <CardContent className='p-0'>
                    <h2 className="text-xl font-bold text-foreground/80 mb-3 border-b pb-2 border-border">Cuidados Especiais</h2>
                    <ul className="space-y-2 text-muted-foreground">
                      {animal.specialCare.map((care, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <svg className="w-4 h-4 text-accent mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 11a1 1 0 112 0 1 1 0 01-2 0zm1-8a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" fillRule="evenodd"></path>
                          </svg>
                          <span>{care}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            </div>

            <section className="mt-8 md:mt-12">
              <Card className="rounded-xl shadow-xl p-6 md:p-8 text-center text-primary-foreground" style={{ backgroundColor: 'var(--brand)' }}>
                <CardContent className='p-0'>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
                    Pronto para dar um lar para {animal.name}?
                  </h2>
                  <p className="text-base mb-4 opacity-90">
                    Voce sentira em seu coracao a alegria de mudar a vida de um animal.
                  </p>
                  <Button
                    onClick={() => console.log(`Adotar Agora animal ID: ${animal.id}`)}
                    className="bg-accent text-accent-foreground font-bold text-lg py-3 px-6 rounded-full shadow-lg hover:bg-accent/90 transition duration-300 transform hover:scale-105"
                  >
                    Adotar Agora
                  </Button>
                </CardContent>
              </Card>
            </section>
        </div>
      </main>
      
      <footer className="w-full py-6 mt-12 text-primary-foreground" style={{background: 'var(--brand)'}} >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Makita Conecta. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs opacity-70">Conectando coracoes a novos lares com responsabilidade e transparencia.</p>
        </div>
      </footer>
    </div>
  );
}

export default AnimalProfile;