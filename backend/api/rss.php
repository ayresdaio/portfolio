<?php
/**
 * =====================================================================
 * FEED RSS 2.0 AUTOMÁTICO (INTEGRAÇÃO BREVO NEWSLETTER RSS-TO-EMAIL)
 * =====================================================================
 * Rota: GET /backend/api/rss.php
 * Acesso: Público
 * Gera dinamicamente o feed RSS 2.0 com os artigos publicados do blog,
 * formatado com datas padrão RFC 822 e mapeamento compatível com a Brevo.
 */

// 1. Inicializar configurações globais e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// Configurar cabeçalho HTTP para XML em UTF-8
header('Content-Type: application/rss+xml; charset=utf-8');

try {
    $db = Database::getConnection();
    
    // Obter URL base do frontend dinamicamente a partir do .env
    $frontendUrl = rtrim(FRONTEND_URL, '/');
    if ($frontendUrl === '*') {
        $frontendUrl = 'https://ayresdaioneto.pt'; // Fallback seguro
    }
    
    // Determinar o URL do feed atual para o link Atom self
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
        || $_SERVER['SERVER_PORT'] == 443 
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $httpProtocol = $is_https ? 'https://' : 'http://';
    $feedUrl = $httpProtocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

    // Obter os artigos de blog publicados (mais recentes primeiro)
    $stmt = $db->query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 50");
    $posts = $stmt->fetchAll();

    // Definir a data da última compilação (lastBuildDate) a partir do post mais recente ou da data atual
    $lastBuildDate = !empty($posts) ? date(DATE_RSS, strtotime($posts[0]['created_at'])) : date(DATE_RSS);

    // Escrever a estrutura inicial do XML RSS 2.0
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' . "\n";
    echo '  <channel>' . "\n";
    echo '    <title><![CDATA[Ayres Daio Neto - Blog Técnico]]></title>' . "\n";
    echo '    <link>' . htmlspecialchars($frontendUrl . '/blog') . '</link>' . "\n";
    echo '    <description><![CDATA[Tutoriais, artigos e notas técnicas sobre desenvolvimento Full-Stack e Cibersegurança por Ayres Daio Neto.]]></description>' . "\n";
    echo '    <language>pt-PT</language>' . "\n";
    echo '    <lastBuildDate>' . $lastBuildDate . '</lastBuildDate>' . "\n";
    echo '    <atom:link href="' . htmlspecialchars($feedUrl) . '" rel="self" type="application/rss+xml" />' . "\n";

    // Mapear cada artigo
    foreach ($posts as $post) {
        $postUrl = $frontendUrl . '/blog/' . $post['slug'];
        $pubDate = date(DATE_RSS, strtotime($post['created_at']));
        
        // Criar resumo/descrição limpa: se não houver excerpt, limpar o Markdown/HTML do content
        $description = !empty($post['excerpt']) ? $post['excerpt'] : $post['content'];
        
        // Limpeza robusta de Markdown e HTML para garantir renderização perfeita no e-mail
        $description = strip_tags($description);
        $description = preg_replace('/\!\[.*?\]\(.*?\)/', '', $description); // Remover imagens markdown
        $description = preg_replace('/\[(.*?)\]\(.*?\)/', '$1', $description); // Simplificar links markdown
        $description = preg_replace('/[\#\*\_`]/', '', $description); // Remover formatação comum markdown
        
        // Limitar a descrição a 300 caracteres com reticências para um visual limpo no feed e e-mail
        if (mb_strlen($description) > 300) {
            $description = mb_substr($description, 0, 300) . '...';
        }

        echo '    <item>' . "\n";
        echo '      <title><![CDATA[' . $post['title'] . ']]></title>' . "\n";
        echo '      <link>' . htmlspecialchars($postUrl) . '</link>' . "\n";
        echo '      <guid isPermaLink="true">' . htmlspecialchars($postUrl) . '</guid>' . "\n";
        echo '      <pubDate>' . $pubDate . '</pubDate>' . "\n";
        echo '      <description><![CDATA[' . $description . ']]></description>' . "\n";
        echo '    </item>' . "\n";
    }

    echo '  </channel>' . "\n";
    echo '</rss>' . "\n";

} catch (\Exception $e) {
    // Em caso de erro técnico na base de dados, gerar um log e retornar uma estrutura XML mínima
    error_log("Erro ao gerar feed RSS: " . $e->getMessage());
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<rss version="2.0">' . "\n";
    echo '  <channel>' . "\n";
    echo '    <title>Erro temporário no feed RSS</title>' . "\n";
    echo '    <link>' . htmlspecialchars(FRONTEND_URL) . '</link>' . "\n";
    echo '    <description>Não foi possível gerar as atualizações de momento.</description>' . "\n";
    echo '  </channel>' . "\n";
    echo '</rss>' . "\n";
}
