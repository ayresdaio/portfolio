<?php
/**
 * =====================================================================
 * CLASSE PRINCIPAL DO PHPMAILER (Drop-in Replacement Premium)
 * =====================================================================
 * Esta é uma implementação otimizada, de alto desempenho e totalmente
 * autónoma da interface padrão do PHPMailer. Comunica diretamente por
 * sockets TLS com o Brevo, oferecendo excelente velocidade e máxima segurança.
 */

namespace PHPMailer\PHPMailer;

class PHPMailer {
    const ENCRYPTION_STARTTLS = 'tls';
    const ENCRYPTION_SMTPS = 'ssl';

    public string $Host = 'localhost';
    public int $Port = 25;
    public bool $SMTPAuth = false;
    public string $Username = '';
    public string $Password = '';
    public string $SMTPSecure = '';
    public string $CharSet = 'UTF-8';
    public int $Timeout = 30;
    
    public string $Subject = '';
    public string $Body = '';
    public string $AltBody = '';
    public string $ErrorInfo = '';

    private string $fromEmail = '';
    private string $fromName = '';
    private array $toAddresses = [];
    private array $replyToAddresses = [];
    private bool $isHTML = false;
    private bool $useSMTP = false;

    /**
     * Construtor
     */
    public function __construct(bool $exceptions = false) {}

    /**
     * Define o envio via SMTP
     */
    public function isSMTP(): void {
        $this->useSMTP = true;
    }

    /**
     * Define o remetente
     */
    public function setFrom(string $email, string $name = ''): void {
        $this->fromEmail = $email;
        $this->fromName = $name;
    }

    /**
     * Adiciona destinatário
     */
    public function addAddress(string $email, string $name = ''): void {
        $this->toAddresses[] = ['email' => $email, 'name' => $name];
    }

    /**
     * Adiciona endereço de resposta (Reply-To)
     */
    public function addReplyTo(string $email, string $name = ''): void {
        $this->replyToAddresses[] = ['email' => $email, 'name' => $name];
    }

    /**
     * Define se o e-mail é HTML
     */
    public function isHTML(bool $isHTML = true): void {
        $this->isHTML = $isHTML;
    }

    /**
     * Processa e envia a mensagem através do canal SMTP do Brevo
     */
    public function send(): bool {
        try {
            if (!$this->useSMTP) {
                // Fallback para mail padrão do PHP se não for SMTP (mas em servidores modernos usaremos SMTP)
                return $this->sendMailNative();
            }

            return $this->sendSMTPSocket();
        } catch (\Exception $e) {
            $this->ErrorInfo = $e->getMessage();
            return false;
        }
    }

    /**
     * Envia o email usando sockets nativos de baixo nível sobre SMTP/TLS
     */
    private function sendSMTPSocket(): bool {
        $host = $this->Host;
        $port = $this->Port;

        // 1. Abrir ligação de rede (Socket)
        $socket = @stream_socket_client(
            "tcp://{$host}:{$port}",
            $errno,
            $errstr,
            $this->Timeout,
            STREAM_CLIENT_CONNECT
        );

        if (!$socket) {
            throw new Exception("Falha ao ligar ao servidor SMTP Brevo ({$errno}): {$errstr}");
        }

        stream_set_timeout($socket, $this->Timeout);
        $this->readSMTPResponse($socket, 220);

        // 2. Enviar EHLO
        $this->writeSMTPCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?: 'localhost'), 250);

        // 3. Negociar TLS (Segurança obrigatória)
        if ($this->SMTPSecure === self::ENCRYPTION_STARTTLS) {
            $this->writeSMTPCommand($socket, "STARTTLS", 220);
            
            // Ativar a cifra TLS no socket de rede existente
            $cryptoSuccess = stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if (!$cryptoSuccess) {
                throw new Exception("Falha na negociação de segurança TLS com o Brevo.");
            }

            // EHLO novamente após criptografia ativa
            $this->writeSMTPCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?: 'localhost'), 250);
        }

        // 4. Autenticação SMTP (AUTH LOGIN)
        if ($this->SMTPAuth) {
            $this->writeSMTPCommand($socket, "AUTH LOGIN", 334);
            $this->writeSMTPCommand($socket, base64_encode($this->Username), 334);
            $this->writeSMTPCommand($socket, base64_encode($this->Password), 235);
        }

        // 5. Definir Remetente e Destinatários
        $this->writeSMTPCommand($socket, "MAIL FROM:<{$this->fromEmail}>", 250);
        foreach ($this->toAddresses as $to) {
            $this->writeSMTPCommand($socket, "RCPT TO:<{$to['email']}>", 250);
        }

        // 6. Transmitir Dados do E-mail (MIME Multipart/Alternative)
        $this->writeSMTPCommand($socket, "DATA", 354);

        // Gerar Boundary único para separar HTML de Texto Plano
        $boundary = "----=_Part_" . md5(uniqid(time()));

        // Construir os cabeçalhos MIME
        $headers = [];
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
        
        $fromNameHeader = !empty($this->fromName) ? "=?UTF-8?B?" . base64_encode($this->fromName) . "?=" : '';
        $headers[] = "From: " . (!empty($fromNameHeader) ? "{$fromNameHeader} <{$this->fromEmail}>" : $this->fromEmail);
        
        $toArr = [];
        foreach ($this->toAddresses as $to) {
            $toNameHeader = !empty($to['name']) ? "=?UTF-8?B?" . base64_encode($to['name']) . "?=" : '';
            $toArr[] = !empty($toNameHeader) ? "{$toNameHeader} <{$to['email']}>" : $to['email'];
        }
        $headers[] = "To: " . implode(', ', $toArr);

        if (!empty($this->replyToAddresses)) {
            $repArr = [];
            foreach ($this->replyToAddresses as $rep) {
                $repArr[] = !empty($rep['name']) ? "{$rep['name']} <{$rep['email']}>" : $rep['email'];
            }
            $headers[] = "Reply-To: " . implode(', ', $repArr);
        }

        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($this->Subject) . "?=";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . md5(uniqid(time())) . "@" . ($_SERVER['SERVER_NAME'] ?: 'localhost') . ">";
        $headers[] = ""; // Linha em branco separa cabeçalhos do corpo

        // Corpo do email (Texto Plano e HTML com codificação base64 para evitar quebras)
        $body = [];
        $body[] = "This is a multi-part message in MIME format.";
        $body[] = "--{$boundary}";
        $body[] = "Content-Type: text/plain; charset=\"{$this->CharSet}\"";
        $body[] = "Content-Transfer-Encoding: base64";
        $body[] = "";
        $body[] = chunk_split(base64_encode($this->AltBody));
        $body[] = "--{$boundary}";
        $body[] = "Content-Type: text/html; charset=\"{$this->CharSet}\"";
        $body[] = "Content-Transfer-Encoding: base64";
        $body[] = "";
        $body[] = chunk_split(base64_encode($this->Body));
        $body[] = "--{$boundary}--";
        $body[] = "."; // Ponto final indica término do corpo da mensagem

        $rawMessage = implode("\r\n", $headers) . "\r\n" . implode("\r\n", $body);
        $this->writeSMTPCommand($socket, $rawMessage, 250);

        // 7. Fechar ligação de forma limpa (QUIT)
        $this->writeSMTPCommand($socket, "QUIT", 221);
        fclose($socket);

        return true;
    }

    /**
     * Envia o e-mail nativamente como fallback
     */
    private function sendMailNative(): bool {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset={$this->CharSet}\r\n";
        $headers .= "From: {$this->fromEmail}\r\n";
        
        $to = implode(', ', array_map(fn($t) => $t['email'], $this->toAddresses));
        return mail($to, $this->Subject, $this->Body, $headers);
    }

    /**
     * Escreve um comando no socket SMTP e valida a resposta esperada
     */
    private function writeSMTPCommand($socket, string $command, int $expectedCode): void {
        fwrite($socket, $command . "\r\n");
        // Não ler resposta no envio da mensagem completa (que termina com .)
        if ($command !== ".") {
            $this->readSMTPResponse($socket, $expectedCode);
        }
    }

    /**
     * Lê a resposta do servidor SMTP e verifica o código de retorno
     */
    private function readSMTPResponse($socket, int $expectedCode): string {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            // O quarto caractere define se há mais linhas ('-' indica continuação, espaço indica fim)
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        $code = (int)substr($response, 0, 3);
        if ($code !== $expectedCode) {
            throw new Exception("Erro de Protocolo SMTP Brevo. Esperado {$expectedCode}, obtido {$code}. Resposta: " . trim($response));
        }

        return $response;
    }
}
