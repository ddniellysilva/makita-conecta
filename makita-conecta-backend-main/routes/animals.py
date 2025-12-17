import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import get_db

animals_bp = Blueprint('animals', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@animals_bp.route("/animals", methods=["POST"])
@jwt_required()
def create_animal():
    if 'image' not in request.files:
        return jsonify({"message": "Nenhuma imagem enviada"}), 400
    
    file = request.files['image']
    name = request.form.get('name')
    description = request.form.get('description')

    if file.filename == '':
        return jsonify({"message": "Nenhum arquivo selecionado"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(save_path)

        current_user_email = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE email = ?", (current_user_email,))
        user_id = cursor.fetchone()['id']

        cursor.execute("""
            INSERT INTO animals (name, description, image_path, owner_id)
            VALUES (?, ?, ?, ?)
        """, (name, description, unique_filename, user_id))
        conn.commit()

        return jsonify({"message": "Animal cadastrado com sucesso!", "image": unique_filename}), 201
    
    return jsonify({"message": "Tipo de arquivo não permitido"}), 400

@animals_bp.route("/animals", methods=["GET"])
def list_animals():
    query = request.args.get("query", "").strip()
    species = request.args.get("species", "")
    sex = request.args.get("sex", "")
    
    print("\n" + "="*60)
    print("BACKEND - BUSCA RECEBIDA:")
    print(f" Query: '{query}'")
    print(f" Species: '{species}'")
    print(f" Sex: '{sex}'")
    print(f" URL completa: {request.url}")
    print("="*60)
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(animals)")
    columns = [col['name'] for col in cursor.fetchall()]
    print(f"COLUNAS DA TABELA: {columns}")
    
    cursor.execute("SELECT id, name, species, sex FROM animals LIMIT 10")
    sample = cursor.fetchall()
    print(f"AMOSTRA DE DADOS (10 primeiros):")
    for animal in sample:
        print(f"   - {animal['name']} (ID: {animal['id']}): species='{animal['species']}', sex='{animal['sex']}'")
    
    sql = "SELECT * FROM animals WHERE 1=1"
    params = []
    
    if query:
        sql += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)"
        term = f"%{query.lower()}%"
        params.append(term)
        params.append(term)
    
    if species and species.lower() not in ["", "todos", "all"]:
        sql += " AND LOWER(species) = ?"
        params.append(species.lower())
    
    if sex and sex.lower() not in ["", "todos", "all"]:
        sql += " AND LOWER(sex) = ?"
        params.append(sex.lower())
    
    sql += " ORDER BY id DESC"
    
    print(f"\nSQL GERADO:")
    print(f"   {sql}")
    print(f"   Parâmetros: {params}")
    
    try:
        cursor.execute(sql, params)
        animals = cursor.fetchall()
        
        animals_list = [dict(row) for row in animals]
        
        print(f"\nRESULTADOS ENCONTRADOS: {len(animals_list)} animais")
        for animal in animals_list:
            print(f"   - {animal['name']} ({animal['species']}, {animal['sex']})")
        
        for animal in animals_list:
            if animal.get('image_path'):
                if animal['image_path'].startswith("http"):
                    animal['image_url'] = animal['image_path']
                else:
                    base_url = request.host_url.rstrip('/')
                    animal['image_url'] = f"{base_url}/api/uploads/{animal['image_path']}"
        
        print("="*60 + "\n")
        return jsonify(animals_list), 200
        
    except Exception as e:
        print(f"\nERRO NO SQL: {e}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        return jsonify({"error": str(e)}), 500
    
@animals_bp.route("/animals/<int:animal_id>", methods=["GET"])
def get_animal(animal_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM animals WHERE id = ?", (animal_id,))
    animal = cursor.fetchone()
    
    if not animal:
        return jsonify({"message": "Animal nao encontrado"}), 404
    
    animal_dict = dict(animal)
    
    if animal_dict['image_path']:
        if animal_dict['image_path'].startswith("http"):
            animal_dict['image_url'] = animal_dict['image_path']
        else:
            base_url = request.host_url.rstrip('/')
            animal_dict['image_url'] = f"{base_url}/api/uploads/{animal_dict['image_path']}"
    else:
        animal_dict['image_url'] = None
    
    return jsonify(animal_dict), 200

@animals_bp.route("/uploads/<filename>")
def get_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)