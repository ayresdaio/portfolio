<?php
/**
 * =====================================================================
 * INTERPRETADOR AUTÓNOMO DE FICHEIROS .ENV
 * Criado especialmente para o InfinityFree (sem dependências adicionais)
 * =====================================================================
 * Este script lê o ficheiro .env na raiz do backend e carrega as variáveis
 * para o ambiente global do PHP ($_ENV, $_SERVER e getenv()).
 */

namespace Includes;

class EnvLoader {
    /**
     * Carrega as variáveis de um ficheiro .env para o ambiente do PHP.
     *
     * @param string $path Caminho completo para o ficheiro .env
     * @return bool Retorna true se carregar com sucesso, false caso contrário
     */
    public static function load(string $path): bool {
        if (!file_exists($path)) {
            return false;
        }

        if (!is_readable($path)) {
            return false;
        }

        // Ler as linhas do ficheiro .env
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Ignorar comentários (linhas que começam por #)
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }

            // Dividir em KEY e VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Remover aspas simples ou duplas do valor
                if ((strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
                    (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)) {
                    $value = substr($value, 1, -1);
                }

                // Definir a variável nas superglobais e no ambiente (suprimindo warnings se putenv estiver desativado por razões de segurança no alojamento)
                @putenv(sprintf('%s=%s', $key, $value));
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }

        return true;
    }
}

// Executar o carregamento de forma automática ao incluir este ficheiro

// 1. Tentar ler as credenciais do ficheiro seguro .php (Prioridade no InfinityFree)
$credentials_file = __DIR__ . '/db_credentials.php';
if (file_exists($credentials_file)) {
    require_once $credentials_file;
}

// 2. Executar o carregamento do .env como fallback
// O ficheiro .env encontra-se um nível acima da pasta includes/
EnvLoader::load(dirname(__DIR__) . '/.env');
