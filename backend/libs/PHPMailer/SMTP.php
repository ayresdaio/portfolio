<?php
/**
 * =====================================================================
 * CLASSE AUXILIAR SMTP DO PHPMAILER (Drop-in Replacement)
 * =====================================================================
 */

namespace PHPMailer\PHPMailer;

class SMTP {
    /**
     * Versão do protocolo SMTP.
     */
    const VERSION = '6.9.1';

    /**
     * Porta padrão para SMTP simples.
     */
    const DEFAULT_PORT = 25;

    /**
     * Timeout de conexão padrão.
     */
    const DEFAULT_SECURE_PORT = 465;
}
