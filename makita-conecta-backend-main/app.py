from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import init_db, close_db
from routes.auth import auth_bp, bcrypt
from routes.animals import animals_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

print("\n" + "="*50)
print("Iniciando aplicação Flask...")
print("="*50)

init_db()

try:
    from seed_animal import run_seed
    run_seed()
except Exception as e:
    print(f"⚠️ Erro no seed: {e}")

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(animals_bp, url_prefix="/api")

app.teardown_appcontext(close_db)

if __name__ == "__main__":
    print("\n" + "="*50)
    print("Aplicação iniciada com sucesso!")
    print(f"Servidor rodando em: http://127.0.0.1:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)