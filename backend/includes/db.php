<?php
/**
 * =====================================================================
 * CONEXÃO CENTRAL À BASE DE DADOS (MySQL / PDO)
 * =====================================================================
 * Este ficheiro inicializa a conexão segura ao banco de dados MySQL
 * do InfinityFree utilizando as credenciais carregadas no .env.
 */

namespace Includes;

use PDO;
use PDOException;

// Garantir que a configuração global já foi importada
if (!defined('SECURE_ACCESS')) {
    require_once __DIR__ . '/config.php';
}

class Database {
    private static ?PDO $connection = null;

    /**
     * Retorna uma única instância da conexão PDO (Padrão Singleton).
     *
     * @return PDO
     */
    public static function getConnection(): PDO {
        if (self::$connection === null) {
            try {
                $host = $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? getenv('DB_HOST');
                $dbname = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? getenv('DB_NAME') ?: 'if0_41973639_ayres';
                $user = $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? getenv('DB_USER');
                $pass = $_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? getenv('DB_PASS');

                // Verificar se o driver mysql está disponível. Caso contrário, usar SQLite como fallback local.
                $availableDrivers = PDO::getAvailableDrivers();

                if (!in_array('mysql', $availableDrivers)) {
                    // Fallback transparente para SQLite no ambiente local caso falte o driver pdo_mysql
                    $sqlitePath = dirname(__DIR__) . '/database.sqlite';
                    $dsn = "sqlite:{$sqlitePath}";
                    $options = [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ];
                    self::$connection = @new PDO($dsn, null, null, $options);
                    self::$connection->exec('PRAGMA foreign_keys = ON;');
                } else {
                    // Validar se as variáveis de ambiente essenciais foram carregadas com sucesso
                    if (empty($host) || empty($user) || empty($pass)) {
                        header('HTTP/1.1 500 Internal Server Error');
                        echo json_encode([
                            'success' => false,
                            'message' => 'Erro crítico: As credenciais da base de dados estão vazias ou incompletas. Certifique-se de que o ficheiro .env foi corretamente enviado para a raiz da pasta backend no seu servidor online da InfinityFree e que o mesmo contém as variáveis DB_HOST, DB_USER e DB_PASS.'
                        ], JSON_UNESCAPED_UNICODE);
                        exit;
                    }

                    // DSN de ligação ao MySQL
                    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";

                    // Configurações avançadas de segurança e desempenho do PDO
                    $options = [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Dispara exceções em caso de erros
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Resultados retornados em array associativo
                        PDO::ATTR_EMULATE_PREPARES   => false,                  // Utiliza prepared statements reais do MySQL (Máxima Segurança contra SQL Injection)
                    ];

                    // Força codificação UTF-8 completa. Usamos o valor inteiro 1002 correspondente à constante
                    // PDO::MYSQL_ATTR_INIT_COMMAND para evitar avisos de depreciação (E_DEPRECATED) no PHP 8.5+.
                    $options[1002] = "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci";

                    self::$connection = @new PDO($dsn, $user, $pass, $options);
                }
            } catch (PDOException $e) {
                // Registar a mensagem técnica detalhada nos logs de erro do Apache para auditoria
                @error_log("Erro de Conexão à Base de Dados: " . $e->getMessage());
                
                header('HTTP/1.1 500 Internal Server Error');
                
                // Em produção, para além da mensagem genérica, exibimos detalhes da exceção PDO (excluindo senhas)
                // de forma a permitir ao utilizador diagnosticar imediatamente erros de permissão ou credenciais incorretas no InfinityFree.
                echo json_encode([
                    'success' => false,
                    'message' => 'Ocorreu um erro ao tentar ligar ao servidor de base de dados. Detalhes técnicos do erro: ' . $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        return self::$connection;
    }
}
