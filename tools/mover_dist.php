<?php
/**
 * =====================================================================
 * SCRIPT DE MIGRAÇÃO AUTOMÁTICA DO PORTFÓLIO (VPS)
 * =====================================================================
 * Este script automatiza a migração do conteúdo da pasta 'dist'
 * para a raiz pública do servidor (uma pasta acima) e define as 
 * permissões corretas (755 para pastas, 644 para ficheiros).
 * 
 * INSTRUÇÕES:
 * 1. Envie a pasta 'dist' para o seu servidor VPS.
 * 2. Certifique-se de que este ficheiro está dentro da pasta 'dist'.
 * 3. Aceda a https://ayresdaioneto.pt/dist/mover_dist.php no seu browser.
 * 4. O script moverá tudo para a raiz e ajustará as permissões.
 */

// Aumentar o tempo limite de execução do PHP para evitar interrupções a meio do processo
@set_time_limit(300);

$source = __DIR__;
$destination = dirname(__DIR__);

header('Content-Type: text/html; charset=utf-8');
echo "<!DOCTYPE html>
<html lang='pt-PT'>
<head>
    <meta charset='UTF-8'>
    <title>Migração do Portfólio</title>
    <style>
        body { font-family: sans-serif; background: #0d0d12; color: #e4e4e7; padding: 40px; }
        h1 { color: #3b82f6; }
        pre { background: #18181b; padding: 20px; border-radius: 8px; border: 1px solid #27272a; overflow-y: auto; max-height: 400px; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Migração automática do Portfólio para a Raiz Pública</h1>";

if (basename($source) !== 'dist') {
    echo "<p class='error'>Erro Crítico: Este script deve ser executado obrigatoriamente a partir de uma pasta chamada 'dist'.</p>";
    echo "Pasta atual: " . htmlspecialchars($source) . "</body></html>";
    exit;
}

echo "<p>A mover ficheiros de <code>" . htmlspecialchars($source) . "</code> para <code>" . htmlspecialchars($destination) . "</code>...</p>";
echo "<pre>";

/**
 * Move recursivamente todos os ficheiros e pastas da origem para o destino.
 * Ajusta as permissões para garantir acesso público correto no Apache.
 *
 * @param string $src Caminho de origem
 * @param string $dst Caminho de destino
 * @return bool Retorna true em caso de sucesso
 */
function moveRecursive(string $src, string $dst): bool {
    if (!is_dir($src)) {
        return false;
    }

    $dir = opendir($src);
    if (!$dir) {
        echo "Erro ao abrir a diretoria: " . htmlspecialchars($src) . "\n";
        return false;
    }

    // Criar a diretoria de destino se não existir
    if (!is_dir($dst)) {
        if (!@mkdir($dst, 0755, true)) {
            echo "Erro ao criar a pasta de destino: " . htmlspecialchars($dst) . "\n";
        }
    }
    @chmod($dst, 0755);

    while (($file = readdir($dir)) !== false) {
        if ($file === '.' || $file === '..') {
            continue;
        }

        // Não movemos o próprio script de migração de imediato para evitar que a execução seja interrompida
        if ($file === 'mover_dist.php') {
            continue;
        }

        $srcPath = $src . '/' . $file;
        $dstPath = $dst . '/' . $file;

        if (is_dir($srcPath)) {
            echo "A processar diretoria: " . htmlspecialchars($file) . "/\n";
            moveRecursive($srcPath, $dstPath);
        } else {
            echo "A mover ficheiro: " . htmlspecialchars($file) . " (Permissões 644)\n";
            
            // Apagar ficheiro existente para evitar erros de permissão de escrita ao substituir
            if (file_exists($dstPath)) {
                @unlink($dstPath);
            }

            if (@rename($srcPath, $dstPath)) {
                @chmod($dstPath, 0644);
            } else {
                // Fallback caso o rename não seja permitido pelas restrições do sistema de ficheiros
                if (@copy($srcPath, $dstPath)) {
                    @chmod($dstPath, 0644);
                    @unlink($srcPath);
                } else {
                    echo "FALHA ao mover o ficheiro: " . htmlspecialchars($file) . "\n";
                }
            }
        }
    }
    closedir($dir);
    return true;
}

// Executar a migração recursiva
moveRecursive($source, $destination);

echo "\nFicheiros movidos com sucesso!\n";
echo "</pre>";

echo "<p class='success'>A migração terminou!</p>";
echo "<p><strong>Próximos Passos:</strong></p>";
echo "<ul>
    <li>Aceda ao seu painel de administração em: <a href='https://ayresdaioneto.pt/admin/login' style='color:#3b82f6;'>https://ayresdaioneto.pt/admin/login</a> para testar o login.</li>
    <li>Elimine manualmente o ficheiro <code>mover_dist.php</code> de dentro da pasta <code>dist</code> (se a pasta dist ainda existir no seu servidor).</li>
</ul>";
echo "</body></html>";
