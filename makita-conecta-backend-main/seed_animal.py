import sqlite3
import os
from config import Config


ANIMAIS_PARA_CADASTRAR = [
    {
        "name": "Luna",
        "description": "Gato Siamês, 2 anos. Dócil e carinhosa.",
        "image_path": "Luna.jpg",
        "species": "Gato",
        "sex": "Fêmea"
    },
    {
        "name": "Max",
        "description": "Cão Labrador, 1 ano. Muito brincalhão.",
        "image_path": "Max.jpg",
        "species": "Cachorro",
        "sex": "Macho"
    },
    {
        "name": "Bella",
        "description": "Cão Poodle, 3 anos. Adora crianças.",
        "image_path": "Bella.jpg",
        "species": "Cachorro",
        "sex": "Fêmea"
    },
    {
        "name": "Oliver",
        "description": "Gato Persa, 1 ano. Muito tranquilo.",
        "image_path": "Oliver.jpg",
        "species": "Gato",
        "sex": "Macho"
    },
    {
        "name": "Sophie",
        "description": "Cachorro Caramelo, 2 anos. Companheira ideal.",
        "image_path": "Sophie.jpg",
        "species": "Cachorro",
        "sex": "Fêmea"
    },
    {
        "name": "Luana",
        "description": "Cachorro Golden Retriever, 2 anos. Brincalhão e amoroso.",
        "image_path": "Luana.jpg",
        "species": "Cachorro",
        "sex": "Fêmea"
    },
    {
        "name": "Simba",
        "description": "Gato Laranja, 3 anos. Curioso e independente.",
        "image_path": "Simba.jpg",
        "species": "Gato",
        "sex": "Macho"
    },
    {
        "name": "Thor",
        "description": "Cachorro Pastor Alemão, 5 anos. Protetor e leal.",
        "image_path": "Thor.jpg",
        "species": "Cachorro",
        "sex": "Macho"
    }
]


def create_default_user(cursor):
    """Cria um usuário padrão para vincular os animais"""
    try:
        cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@example.com",))
        user = cursor.fetchone()
        
        if user:
            return user[0]
        
        cursor.execute("""
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        """, ("Administrador", "admin@example.com", "$2b$12$DEFAULT_HASH_PLACEHOLDER"))
        
        user_id = cursor.lastrowid
        print(f"Usuário padrão criado com ID: {user_id}")
        return user_id
    except Exception as e:
        print(f"Erro ao criar usuário padrão: {e}")
        return 1  

def run_seed():
    """Executa o seed de animais no banco de dados"""
    print("\nIniciando seed de animais...")
    
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
        print(f"Pasta uploads criada: {Config.UPLOAD_FOLDER}")
    
    conn = sqlite3.connect(Config.DB_NAME)
    cursor = conn.cursor()
    
    try:
        owner_id = create_default_user(cursor)
        
        novos_adicionados = 0
        
        for animal in ANIMAIS_PARA_CADASTRAR:
            cursor.execute("SELECT id FROM animals WHERE name = ? AND species = ?", 
                          (animal["name"], animal["species"]))
            exists = cursor.fetchone()
            
            if exists:
                cursor.execute("""
                    UPDATE animals 
                    SET description = ?, image_path = ?, sex = ?
                    WHERE name = ? AND species = ?
                """, (
                    animal["description"],
                    animal["image_path"],
                    animal["sex"],
                    animal["name"],
                    animal["species"]
                ))
                print(f"Animal atualizado: {animal['name']}")
            else:
                cursor.execute("""
                    INSERT INTO animals (name, description, image_path, species, sex, owner_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    animal["name"],
                    animal["description"],
                    animal["image_path"],
                    animal["species"],
                    animal["sex"],
                    owner_id
                ))
                novos_adicionados += 1
                print(f"Animal adicionado: {animal['name']}")
        
        conn.commit()
        
        # Conta total de animais
        cursor.execute("SELECT COUNT(*) FROM animals")
        total = cursor.fetchone()[0]
        
        if novos_adicionados > 0:
            print(f"Seed concluído: {novos_adicionados} novos animais inseridos")
        else:
            print(f"Banco verificado: {total} animais já cadastrados")
        
        print(f"Total de animais no sistema: {total}")
        
    except Exception as e:
        print(f"Erro durante seed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_seed()