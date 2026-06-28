import os
import json
import zipfile
from datetime import datetime
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

# Load environment variables from the parent directory (.env)
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(env_path)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')
DB_NAME = os.getenv('DB_NAME', 'portfolio')

BACKUPS_DIR = os.path.join(current_dir, '..', 'backups')
os.makedirs(BACKUPS_DIR, exist_ok=True)

def custom_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)

def backup_database():
    try:
        print(f"Connecting to MySQL database {DB_NAME} at {DB_HOST}...")
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )

        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Get all tables
            cursor.execute("SHOW TABLES")
            tables = [list(row.values())[0] for row in cursor.fetchall()]
            print(f"Found {len(tables)} tables to export.")
            
            db_dump = {}
            table_stats = {}
            for table in tables:
                # Obter contagem de registos
                cursor.execute(f"SELECT COUNT(*) as cnt FROM `{table}`")
                cnt = cursor.fetchone()['cnt']
                table_stats[table] = cnt
                print(f" - Exporting table '{table}' ({cnt} records)...")
                
                cursor.execute(f"SELECT * FROM `{table}`")
                rows = cursor.fetchall()
                db_dump[table] = rows
            
            # Generate backup filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            json_filename = f"backup_{DB_NAME}_{timestamp}.json"
            zip_filename = f"backup_{DB_NAME}_{timestamp}.zip"
            
            json_path = os.path.join(BACKUPS_DIR, json_filename)
            zip_path = os.path.join(BACKUPS_DIR, zip_filename)
            
            print(f"Writing database dump to temporary file: {json_filename}...")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(db_dump, f, ensure_ascii=False, indent=2, default=custom_serializer)
                
            print(f"Creating ZIP archive: {zip_filename}...")
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(json_path, arcname=json_filename)
                
            # Remove the uncompressed JSON file to save space
            os.remove(json_path)
            
            # Obter tamanho do ficheiro zip gerado
            file_size_kb = round(os.path.getsize(zip_path) / 1024, 2)
            
            print(f"Backup completed successfully. Saved to: {zip_path}")
            print(f"Total size: {file_size_kb} KB")
            
            return {
                "success": True, 
                "file": zip_filename, 
                "tables_exported": len(tables),
                "table_stats": table_stats,
                "file_size_kb": file_size_kb
            }

    except Error as e:
        error_msg = f"Error connecting to MySQL: {e}"
        print(error_msg)
        return {"success": False, "error": error_msg}
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    result = backup_database()
    # Output result as JSON for PHP to read easily if called via exec
    print("RESULT_JSON:" + json.dumps(result))
