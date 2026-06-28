<?php
/**
 * =====================================================================
 * ENDPOINT PARA DOWNLOAD SEGURO DO CURRÍCULO PROFISSIONAL
 * =====================================================================
 * Rota: GET /backend/api/download_cv.php
 * Acesso: Público (Visitantes do portfólio)
 * Força o download do currículo em PDF com o nome limpo e profissional
 * "Curriculo_Ayres_Daio_Neto.pdf", contornando limitações de CORS.
 * =====================================================================
 */

define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

try {
    $db = Database::getConnection();
    
    // Obter o idioma solicitado
    $lang = isset($_GET['lang']) ? trim(strtolower($_GET['lang'])) : 'pt';
    $column = ($lang === 'en') ? 'cv_url_en' : 'cv_url';
    
    // Procurar os links dos currículos no perfil
    $stmt = $db->query('SELECT cv_url, cv_url_en FROM profile LIMIT 1');
    $profile = $stmt->fetch();
    
    if (!$profile || (empty($profile['cv_url']) && empty($profile['cv_url_en']))) {
        header('HTTP/1.1 404 Not Found');
        exit('Nenhum currículo configurado no portfólio.');
    }
    
    // Fallback para português se o inglês não estiver disponível
    if ($column === 'cv_url_en' && empty($profile['cv_url_en'])) {
        $column = 'cv_url';
    }
    
    $cvUrl = $profile[$column]; // Ex: /backend/uploads/profile/cv_2998986b9035b2c1.pdf
    
    // Obter o caminho relativo do arquivo no disco local do servidor
    $relativePath = str_replace('/backend', '', $cvUrl);
    $filePath = dirname(__DIR__) . $relativePath;
    
    if (!file_exists($filePath)) {
        header('HTTP/1.1 404 Not Found');
        exit('O ficheiro de currículo não foi encontrado no servidor.');
    }
    
    // Enviar cabeçalhos HTTP de transferência de ficheiro para renomeação forçada
    $filename = ($column === 'cv_url_en') ? "Resume_Ayres_Daio_Neto.pdf" : "Curriculo_Ayres_Daio_Neto.pdf";
    header('Content-Description: File Transfer');
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePath));
    
    // Limpar buffers de saída para evitar corrupção do documento PDF binário
    ob_clean();
    flush();
    
    readfile($filePath);
    exit;
} catch (\Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    exit('Erro interno ao processar o descarregamento do currículo.');
}
