<?php
/**
 * =====================================================================
 * ENDPOINT DE TRADUÇÃO AUTOMÁTICA POR IA (RESTRICTED ADMIN API)
 * =====================================================================
 * Rota: POST /backend/api/translate.php
 * Acesso: Restrito (Apenas utilizadores administradores autenticados)
 * 
 * Traduz um texto de Português para Inglês mantendo formatação HTML de forma
 * segura, consumindo a API pública de alto desempenho MyMemory.
 */

// 1. Inicializar configurações e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';

// 2. Verificar se o administrador está devidamente autenticado
$isAdmin = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

if ($isAdmin) {
    $timeout_duration = 7200;
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
        session_unset();
        session_destroy();
        $isAdmin = false;
    } else {
        $_SESSION['last_activity'] = time();
    }
}

header('Content-Type: application/json; charset=utf-8');

// Barreira de segurança obrigatória
if (!$isAdmin) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Aceitar apenas pedidos do tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido. Utilize POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 3. Obter e higienizar a string a traduzir (suporta JSON ou POST tradicional)
    $text = '';
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents("php://input"), true);
        $text = isset($input['text']) ? $input['text'] : '';
    } else {
        $text = isset($_POST['text']) ? $_POST['text'] : '';
    }

    if (empty(trim($text))) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'O texto a traduzir está vazio.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Auxiliar de divisão de strings multibyte compatível com versões antigas do PHP.
     *
     * @param string $string A string a dividir.
     * @param int $split_length O comprimento de cada fração.
     * @return array Array de frações de string.
     */
    function safeMbStrSplit(string $string, int $split_length = 1): array {
        if ($split_length <= 0) {
            return [];
        }
        if (function_exists('mb_str_split')) {
            return mb_str_split($string, $split_length, 'UTF-8');
        }
        $array = [];
        $strlen = mb_strlen($string, 'UTF-8');
        for ($i = 0; $i < $strlen; $i += $split_length) {
            $array[] = mb_substr($string, $i, $split_length, 'UTF-8');
        }
        return $array;
    }

    /**
     * Envia uma fração de texto (máx 450 caracteres) para a API MyMemory.
     *
     * @param string $chunk O bloco de texto a traduzir.
     * @return string O texto traduzido obtido.
     * @throws \Exception Se ocorrer um erro cURL ou HTTP no serviço.
     */
    function translateChunk(string $chunk): string {
        if (empty(trim($chunk))) {
            return $chunk;
        }

        // Executar o pedido cURL seguro com timeout à API MyMemory (parâmetro 'de' estende a quota gratuita para 30k palavras/dia)
        $url = "https://api.mymemory.translated.net/get?q=" . urlencode($chunk) . "&langpair=pt|en&de=ayresdaioneto@gmail.com";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6); // Timeout de 6 segundos para não travar o servidor
        curl_setopt($ch, CURLOPT_USERAGENT, "AyresPortfolioAgent/1.0 (Contact: ayresdaioneto@gmail.com)");
        
        // Configurações extra para ambientes locais sem SSL configurado de forma estrita
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);

        if ($response === false) {
            throw new \Exception("Erro na ligação cURL com o serviço de tradução: " . $curlError);
        }

        if ($httpCode !== 200) {
            throw new \Exception("O serviço de tradução respondeu com o código HTTP " . $httpCode);
        }

        $data = json_decode($response, true);
        
        // Validar a resposta obtida da API
        if (isset($data['responseData']['translatedText']) && !empty($data['responseData']['translatedText'])) {
            $translatedText = $data['responseData']['translatedText'];
            
            // Decodificar entidades HTML comuns que a API possa ter escapado excessivamente
            return html_entity_decode($translatedText, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        } else {
            // Obter mensagem detalhada se a API devolver erro estruturado
            $apiErrorMsg = isset($data['responseDetails']) ? $data['responseDetails'] : 'Falha na resposta da API de tradução.';
            throw new \Exception("API de Tradução: " . $apiErrorMsg);
        }
    }

    /**
     * Algoritmo de fragmentação recursivo e inteligente para traduzir textos longos.
     * Divide o texto por parágrafos e frases para respeitar a estrutura linguística.
     *
     * @param string $text O texto total em português.
     * @return string O texto total traduzido em inglês.
     */
    function translateLongText(string $text): string {
        // Se o texto total for menor que o limite seguro da API, traduz diretamente
        if (mb_strlen($text, 'UTF-8') <= 450) {
            return translateChunk($text);
        }
        
        // Dividir primeiro por parágrafos (quebras de linha)
        $paragraphs = explode("\n", $text);
        $translatedParagraphs = [];
        
        foreach ($paragraphs as $para) {
            if (mb_strlen($para, 'UTF-8') <= 450) {
                $translatedParagraphs[] = translateChunk($para);
            } else {
                // Se o parágrafo exceder o limite, dividir por frases (pontuação principal)
                $sentences = preg_split('/(?<=[.?!])\s+/', $para);
                $currentChunk = '';
                $translatedSentences = [];
                
                foreach ($sentences as $sentence) {
                    // Tentar agrupar frases consecutivas até ao limite de 450 caracteres
                    if (mb_strlen($currentChunk . ' ' . $sentence, 'UTF-8') <= 450) {
                        $currentChunk = $currentChunk === '' ? $sentence : $currentChunk . ' ' . $sentence;
                    } else {
                        if ($currentChunk !== '') {
                            $translatedSentences[] = translateChunk($currentChunk);
                        }
                        
                        // Salvaguarda: se uma única frase enorme exceder 450 caracteres, divide por limite fixo
                        if (mb_strlen($sentence, 'UTF-8') > 450) {
                            $subparts = safeMbStrSplit($sentence, 400);
                            foreach ($subparts as $sub) {
                                $translatedSentences[] = translateChunk($sub);
                            }
                            $currentChunk = '';
                        } else {
                            $currentChunk = $sentence;
                        }
                    }
                }
                
                if ($currentChunk !== '') {
                    $translatedSentences[] = translateChunk($currentChunk);
                }
                
                $translatedParagraphs[] = implode(' ', $translatedSentences);
            }
            
            // Pausa de 150 milissegundos para respeitar o limite de taxa da API MyMemory
            usleep(150000);
        }
        
        return implode("\n", $translatedParagraphs);
    }

    // 5. Executar tradução fragmentada segura contra limites de tamanho
    $translatedText = translateLongText($text);

    echo json_encode([
        'success' => true,
        'translatedText' => $translatedText
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    error_log("Erro no tradutor automático translate.php: " . $e->getMessage());
    header('HTTP/1.1 502 Bad Gateway');
    echo json_encode([
        'success' => false,
        'message' => 'Incapaz de traduzir o texto de momento: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
