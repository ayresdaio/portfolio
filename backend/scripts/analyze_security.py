import os
import sys
import json
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
import pandas as pd
import matplotlib.pyplot as plt

# Load environment variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(env_path)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')
DB_NAME = os.getenv('DB_NAME', 'portfolio')

REPORT_PATH = os.path.join(current_dir, '..', 'uploads', 'security_report.png')

def generate_security_report():
    try:
        print("A iniciar análise dos logs de segurança...")
        print(f"A ligar à base de dados MySQL '{DB_NAME}' em '{DB_HOST}'...")
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )

        if connection.is_connected():
            print("Ligação estabelecida com sucesso. A ler registos da tabela 'security_logs'...")
            query = "SELECT * FROM security_logs"
            df = pd.read_sql(query, connection)
            
            print(f"Total de registos encontrados nos logs: {len(df)}")
            if df.empty:
                print("Aviso: A tabela de logs está vazia.")
                return {"success": True, "message": "Nenhum log de segurança para analisar.", "total_failed": 0, "top_ips": [], "recent_failed": []}

            # Filter failed logins
            failed_attempts = df[df['status'] == 'failed']
            print(f"Total de tentativas de login falhadas detetadas: {len(failed_attempts)}")
            
            if failed_attempts.empty:
                print("Info: Nenhuma tentativa falhada de login encontrada nos logs.")
                return {"success": True, "message": "Nenhuma tentativa falhada para analisar.", "total_failed": 0, "top_ips": [], "recent_failed": []}

            # Top IPs que mais falharam (limite de 5)
            ip_counts = failed_attempts['ip_address'].value_counts().head(5)
            top_ips = []
            print("\nIPs com maior volume de tentativas falhadas (Top 5):")
            for ip, count in ip_counts.items():
                # Obter o país associado
                country_rows = failed_attempts[failed_attempts['ip_address'] == ip]['country']
                country = country_rows.iloc[0] if not country_rows.empty else 'Unknown'
                top_ips.append({"ip": ip, "count": int(count), "country": country})
                print(f" - IP: {ip} | País: {country} | Tentativas: {count}")

            # Últimas 5 tentativas falhadas
            failed_attempts_sorted = failed_attempts.sort_values(by='created_at', ascending=False)
            recent_attempts = failed_attempts_sorted.head(5)
            recent_failed = []
            print("\nTentativas de login falhadas mais recentes:")
            for _, row in recent_attempts.iterrows():
                city = row.get('city', 'Unknown')
                date_str = str(row['created_at'])
                # Corrigido: Aceder à coluna correta 'username_attempted' da base de dados
                recent_failed.append({
                    "ip": row['ip_address'],
                    "username": row['username_attempted'],
                    "country": row['country'],
                    "city": city,
                    "date": date_str
                })
                print(f" - Data: {date_str} | IP: {row['ip_address']} | Utilizador tentado: '{row['username_attempted']}' | Local: {city}, {row['country']}")

            # Count by country
            country_counts = failed_attempts['country'].value_counts()
            
            # Create a pie chart
            print(f"\nA gerar gráfico de tarte com a distribuição geográfica...")
            plt.figure(figsize=(8, 8))
            plt.pie(country_counts, labels=country_counts.index, autopct='%1.1f%%', startangle=140)
            plt.title('Tentativas de Login Falhadas por País')
            
            # Save the figure
            print(f"A guardar gráfico de segurança em: {REPORT_PATH}...")
            plt.savefig(REPORT_PATH)
            plt.close()
            print("Gráfico de segurança gerado com sucesso.")
            
            return {
                "success": True, 
                "report_path": "/backend/uploads/security_report.png", 
                "total_failed": int(len(failed_attempts)),
                "top_ips": top_ips,
                "recent_failed": recent_failed
            }

    except Error as e:
        error_msg = f"Erro MySQL ao analisar segurança: {e}"
        print(error_msg)
        return {"success": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Erro genérico no script Python: {e}"
        print(error_msg)
        return {"success": False, "error": error_msg}
    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()

if __name__ == '__main__':
    result = generate_security_report()
    print("RESULT_JSON:" + json.dumps(result))
