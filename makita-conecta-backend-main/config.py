import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "chave-padrao-desenvolvimento")
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 
    DB_NAME = "database.db"
    
    MAIL_SERVER = "smtp-relay.brevo.com"
    MAIL_PORT = 587
    MAIL_USERNAME = os.environ.get("BREVO_USERNAME")  
    MAIL_PASSWORD = os.environ.get("BREVO_PASSWORD")  
    MAIL_SENDER = "victorguimaraes980@gmail.com"
    MAIL_DEFAULT_SENDER = MAIL_SENDER  
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)