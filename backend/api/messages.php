<?php
/**
 * =====================================================================
 * ENDPOINT DE VISUALIZAÇÃO E GESTÃO DE MENSAGENS DE CONTACTO
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/messages
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Permite listar as mensagens recebidas de visitantes, marcá-las como
 * lidas para organização e eliminá-las de forma definitiva.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Proteger a rota: Validar autenticação
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Controlo de inatividade (Sessão expira após 2 horas)
$timeout_duration = 7200;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
    session_unset();
    session_destroy();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'A sua sessão expirou.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SESSION['last_activity'] = time();

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// =====================================================================
// OPERAÇÃO GET: Listar todas as mensagens recebidas
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM messages ORDER BY created_at DESC');
        $messages = $stmt->fetchAll();
        echo json_encode(['success' => true, 'messages' => $messages], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter mensagens: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter mensagens.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Alterar estado da mensagem (Ex: Marcar como lida/não lida)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        $id = isset($input['id']) ? (int)$input['id'] : null;
        $action = isset($input['action']) ? trim($input['action']) : '';

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da mensagem em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // =====================================================================
        // CASO A: Enviar Resposta por E-mail ao Visitante (SMTP Brevo + PHPMailer)
        // =====================================================================
        if ($action === 'reply') {
            $replyMessage = isset($input['reply_message']) ? trim($input['reply_message']) : '';

            if (empty($replyMessage)) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['success' => false, 'message' => 'A mensagem de resposta não pode estar vazia.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 1. Obter a mensagem original da base de dados para obter dados do visitante
            $stmt = $db->prepare('SELECT * FROM messages WHERE id = :id');
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            $msgOriginal = $stmt->fetch();

            if (!$msgOriginal) {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['success' => false, 'message' => 'A mensagem original não foi encontrada na base de dados.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 2. Carregar o utilitário de e-mails modular seguro
            require_once dirname(__DIR__) . '/includes/email_sender.php';

            // 3. Montar o template HTML premium (Estética Dark Mode/OLED Cyberpunk)
            $nomeVisitante = htmlspecialchars($msgOriginal['name'], ENT_QUOTES, 'UTF-8');
            $assuntoOriginal = htmlspecialchars($msgOriginal['subject'], ENT_QUOTES, 'UTF-8');
            $conteudoOriginal = nl2br(htmlspecialchars($msgOriginal['message'], ENT_QUOTES, 'UTF-8'));
            $dataOriginal = date('d/m/Y H:i', strtotime($msgOriginal['created_at']));
            
            // Converter a resposta escrita de texto limpo para HTML seguro
            $conteudoResposta = nl2br(htmlspecialchars($replyMessage, ENT_QUOTES, 'UTF-8'));

            $assuntoEmail = "Re: " . $msgOriginal['subject'];

            $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{$assuntoEmail}</title>
    <style>
        body {
            background-color: #050505;
            color: #e4e4e7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0b0b0f;
            border: 1px solid #1f1f2e;
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }
        .header {
            border-bottom: 1px solid #1f1f2e;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 20px;
            font-weight: 800;
            color: #3b82f6;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .sub-logo {
            font-size: 11px;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 16px;
        }
        .message-body {
            font-size: 15px;
            line-height: 1.65;
            color: #e4e4e7;
            margin-bottom: 35px;
        }
        .quote-box {
            background-color: #07070a;
            border-left: 3px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
            color: #a1a1aa;
            font-size: 13.5px;
            line-height: 1.5;
        }
        .quote-title {
            font-weight: 700;
            color: #71717a;
            margin-bottom: 10px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .divider {
            border: 0;
            border-top: 1px solid #1f1f2e;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #71717a;
            line-height: 1.5;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Ayres Daio Neto</div>
            <div class="sub-logo">Portfólio Profissional • Resposta de Contacto</div>
        </div>
        
        <div class="greeting">Olá, {$nomeVisitante}!</div>
        
        <div class="message-body">
            {$conteudoResposta}
        </div>
        
        <div class="quote-box">
            <div class="quote-title">Mensagem original enviada a {$dataOriginal}</div>
            <strong>Assunto:</strong> {$assuntoOriginal}<br><br>
            "{$conteudoOriginal}"
        </div>
        
        <hr class="divider">
        
        <div class="footer">
            Esta é uma resposta oficial enviada através do Portfólio de Ayres Daio Neto.<br>
            Website: <a href="https://ayresdaioneto.com" target="_blank">ayresdaioneto.com</a> | E-mail: <a href="mailto:ayresdaioneto@gmail.com">ayresdaioneto@gmail.com</a>
        </div>
    </div>
</body>
</html>
HTML;

            // AltBody limpo para e-mails em texto plano
            $altBody = "Olá, {$nomeVisitante}!\n\n" . 
                       $replyMessage . "\n\n" . 
                       "----------------------------------------\n" .
                       "Mensagem original enviada a {$dataOriginal}\n" .
                       "Assunto: {$msgOriginal['subject']}\n" .
                       "\"{$msgOriginal['message']}\"\n" .
                       "----------------------------------------\n" .
                       "Portfólio de Ayres Daio Neto\n" .
                       "https://ayresdaioneto.com";

            // 4. Efetuar o disparo do e-mail através do PHPMailer + Brevo SMTP
            $emailResult = \Includes\EmailSender::send($msgOriginal['email'], $assuntoEmail, $htmlBody, $altBody);

            if (!$emailResult['success']) {
                header('HTTP/1.1 500 Internal Server Error');
                echo json_encode(['success' => false, 'message' => $emailResult['message']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 5. Atualizar o estado da mensagem original para marcada como Lida na BD
            $stmt = $db->prepare('UPDATE messages SET is_read = 1 WHERE id = :id');
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Resposta enviada por e-mail com sucesso e mensagem marcada como lida!'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // =====================================================================
        // CASO B: Alterar Apenas Estado da Mensagem (Lida / Não Lida)
        // =====================================================================
        $is_read = isset($input['is_read']) ? (int)$input['is_read'] : 1;

        $stmt = $db->prepare('UPDATE messages SET is_read = :is_read WHERE id = :id');
        $stmt->bindValue(':is_read', $is_read, \PDO::PARAM_INT);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        $status = $is_read ? 'lida' : 'não lida';
        echo json_encode(['success' => true, 'message' => "Mensagem marcada como {$status}!"], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao atualizar/responder à mensagem: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao processar a operação.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO DELETE: Eliminar mensagem de forma definitiva
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da mensagem em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare('DELETE FROM messages WHERE id = :id');
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Mensagem eliminada com sucesso!'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao eliminar mensagem: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao tentar eliminar mensagem.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
