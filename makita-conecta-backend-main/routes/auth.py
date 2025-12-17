from datetime import timedelta
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import get_db
import sqlite3
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt() 

def is_valid_email(email):
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email) is not None

def send_email_brevo(to_email, subject, html_content):
    try:
        if not Config.MAIL_SERVER or not Config.MAIL_PORT or not Config.MAIL_USERNAME or not Config.MAIL_PASSWORD:
            print("Configuracoes de email incompletas.")
            return False

        msg = MIMEMultipart()
        sender = Config.MAIL_DEFAULT_SENDER if hasattr(Config, 'MAIL_DEFAULT_SENDER') else Config.MAIL_SENDER
        msg['From'] = f"MakitaConecta <{sender}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT)
        server.starttls()
        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False

@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
         return jsonify({"message": "Dados incompletos"}), 400

    if not is_valid_email(email):
        return jsonify({"message": "Email invalido"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                       (name, email, hashed_password))
        conn.commit()
        return jsonify({"message": "Usuario criado!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "E-mail ja cadastrado"}), 409
    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Credenciais invalidas"}), 401 

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token), 200

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    current_user_email = get_jwt_identity()
    
    conn = get_db()
    cursor = conn.cursor()
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    cursor.execute("SELECT name, email FROM users WHERE email = ?", (current_user_email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "Usuario nao encontrado"}), 404
    
    return jsonify({
        "name": user["name"],
        "email": user["email"]
    }), 200

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({"message": "Se o email existir, enviaremos um link de recuperacao"}), 200
        
    reset_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
    
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    if not all([Config.MAIL_SERVER, Config.MAIL_PORT, Config.MAIL_USERNAME, Config.MAIL_PASSWORD]):
        print(f"Modo desenvolvimento: Link de recuperacao para {email}: {reset_link}")
        return jsonify({"message": "Link de recuperacao gerado (modo desenvolvimento)", "reset_link": reset_link}), 200
    
    email_html = f"""
    <h2>Ola, {user['name']}!</h2>
    <p>Recebemos uma solicitacao para redefinir sua senha no <strong>MakitaConecta</strong>.</p>
    <p>Clique no botao abaixo para criar uma nova senha:</p>
    <a href="{reset_link}" style="background-color: #6f4e37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
    <p><small>Se voce nao solicitou isso, apenas ignore este e-mail.</small></p>
    """
    
    sucesso = send_email_brevo(email, "Redefinicao de Senha - MakitaConecta", email_html)

    if sucesso:
        return jsonify({"message": "Link de recuperacao enviado para seu e-mail!"}), 200
    else:
        return jsonify({"message": "Erro ao enviar e-mail. Tente novamente mais tarde."}), 500

@auth_bp.route("/reset-password", methods=["POST"])
@jwt_required()
def reset_password():
    email = get_jwt_identity()
    data = request.get_json()
    new_password = data.get("newPassword")
    
    if not new_password:
        return jsonify({"message": "Nova senha e obrigatoria"}), 400
        
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email))
    conn.commit()
    
    return jsonify({"message": "Senha alterada com sucesso!"}), 200

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    data = request.get_json()
    new_name = data.get("name")
    
    if not new_name:
        return jsonify({"message": "Nome e obrigatorio"}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ? WHERE email = ?", (new_name, email))
    conn.commit()
    
    return jsonify({"message": "Perfil atualizado!", "name": new_name}), 200

@auth_bp.route("/profile", methods=["DELETE"])
@jwt_required()
def delete_profile():
    email = get_jwt_identity()
    
    conn = get_db()
    cursor = conn.cursor()
    
    print(f"Tentando deletar conta do usuario: {email}")
    
    try:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"message": "Usuario nao encontrado"}), 404
            
        user_id = user['id']
        
        cursor.execute("DELETE FROM animals WHERE owner_id = ?", (user_id,))
        print(f"Animais deletados: {cursor.rowcount}")
        
        cursor.execute("DELETE FROM users WHERE email = ?", (email,))
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Usuario nao encontrado"}), 404
            
        conn.commit()
        
        print(f"Conta deletada com sucesso para: {email}")
        return jsonify({"message": "Conta deletada com sucesso."}), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Erro ao deletar conta: {e}")
        return jsonify({"message": f"Erro ao deletar conta: {str(e)}"}), 500