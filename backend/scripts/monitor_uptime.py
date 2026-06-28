import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(env_path)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@localhost')
BREVO_API_KEY = os.getenv('BREVO_API_KEY')

def send_alert_email(status_code):
    if not BREVO_API_KEY:
        return False, "BREVO_API_KEY not configured."
    
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": "Portfolio Monitor", "email": "monitor@portfolio.local"},
        "to": [{"email": ADMIN_EMAIL}],
        "subject": f"⚠️ ALERTA: Portfólio Offline (Status: {status_code})",
        "htmlContent": f"<p>O seu portfólio em {FRONTEND_URL} não está a responder corretamente.</p><p>Código de estado HTTP: {status_code}</p><p>Por favor, verifique o servidor imediatamente.</p>"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        return response.status_code in [200, 201, 202], response.text
    except Exception as e:
        return False, str(e)

def check_uptime():
    try:
        # Avoid checking '*' if FRONTEND_URL is not configured properly
        url_to_check = FRONTEND_URL if FRONTEND_URL != '*' else 'http://localhost'
        print(f"A iniciar teste de conectividade para a URL: {url_to_check}")
        
        response = requests.get(url_to_check, timeout=10)
        print(f"Resposta HTTP recebida do servidor: {response.status_code}")
        
        if response.status_code == 200:
            print("Servidor está ONLINE e a responder normalmente.")
            return {"success": True, "status": "online", "code": 200, "url": url_to_check}
        else:
            print(f"Aviso: Servidor respondeu com código de erro {response.status_code}.")
            print(f"A disparar alerta de e-mail para {ADMIN_EMAIL}...")
            email_sent, email_msg = send_alert_email(response.status_code)
            if email_sent:
                print("E-mail de alerta enviado com sucesso através da API Brevo.")
            else:
                print(f"Erro ao enviar e-mail de alerta: {email_msg}")
            return {"success": False, "status": "offline", "code": response.status_code, "email_sent": email_sent, "email_msg": email_msg, "url": url_to_check}
            
    except requests.RequestException as e:
        print(f"Erro de rede ou timeout ao tentar aceder a {url_to_check}: {e}")
        print(f"A disparar alerta de e-mail por falha de conectividade para {ADMIN_EMAIL}...")
        email_sent, email_msg = send_alert_email("Timeout/Connection Error")
        if email_sent:
            print("E-mail de alerta enviado com sucesso através da API Brevo.")
        else:
            print(f"Erro ao enviar e-mail de alerta: {email_msg}")
        return {"success": False, "status": "offline", "error": str(e), "email_sent": email_sent, "email_msg": email_msg, "url": url_to_check}

if __name__ == '__main__':
    result = check_uptime()
    print("RESULT_JSON:" + json.dumps(result))
