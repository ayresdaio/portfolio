<?php
/**
 * =====================================================================
 * MOTOR DE ENVIO DE EMAILS MODULAR (Usando PHPMailer + SMTP Brevo)
 * =====================================================================
 * Este script centraliza toda a lógica de disparo de mensagens eletrónicas,
 * lendo as chaves a partir do brevo_config.php e instanciando o PHPMailer.
 */

namespace Includes;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Garantir que os ficheiros globais já foram importados
if (!defined('SECURE_ACCESS')) {
    require_once __DIR__ . '/config.php';
}

// Carregar as classes do PHPMailer a partir da diretoria libs/
require_once dirname(__DIR__) . '/libs/PHPMailer/Exception.php';
require_once dirname(__DIR__) . '/libs/PHPMailer/PHPMailer.php';
require_once dirname(__DIR__) . '/libs/PHPMailer/SMTP.php';

// Carregar a configuração do Brevo
require_once __DIR__ . '/brevo_config.php';

class EmailSender {
    /**
     * Envia um email seguro através do SMTP do Brevo utilizando o PHPMailer.
     *
     * @param string $to Email do destinatário
     * @param string $subject Assunto da mensagem
     * @param string $htmlBody Corpo da mensagem em formato HTML
     * @param string $altBody Corpo alternativo em texto limpo (opcional)
     * @return array Retorna ['success' => true/false, 'message' => 'detalhe']
     */
    public static function send(string $to, string $subject, string $htmlBody, string $altBody = ''): array {
        // Verificar se as credenciais do Brevo estão configuradas
        if (empty(SMTP_USER) || empty(SMTP_PASS)) {
            return [
                'success' => false,
                'message' => 'O serviço de email Brevo não está configurado (credenciais em falta).'
            ];
        }

        $mail = new PHPMailer(true);

        try {
            // Configuração do Servidor SMTP com as constantes do brevo_config.php
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Ativa TLS explícito
            $mail->Port       = SMTP_PORT;
            $mail->CharSet    = 'UTF-8';                        // Suporte a acentuação portuguesa
            $mail->Timeout    = 30;

            // Remetente (Usar o email e nome configurados no brevo_config.php)
            $mail->setFrom(EMAIL_REMETENTE, NOME_REMETENTE ?: 'Portfólio Ayres');
            $mail->addReplyTo(EMAIL_REMETENTE, 'Administrador do Portfólio');
            
            // Destinatário
            $mail->addAddress($to);

            // Conteúdo do Email
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            
            // Definir texto plano alternativo para clientes de email antigos
            if (!empty($altBody)) {
                $mail->AltBody = $altBody;
            } else {
                $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlBody));
            }

            $mail->send();

            return [
                'success' => true,
                'message' => 'Email enviado com sucesso!'
            ];
        } catch (Exception $e) {
            error_log("Falha no PHPMailer: " . $mail->ErrorInfo);
            return [
                'success' => false,
                'message' => "Não foi possível enviar o email. Erro técnico: {$mail->ErrorInfo}"
            ];
        }
    }
}
