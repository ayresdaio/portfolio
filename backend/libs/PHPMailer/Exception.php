<?php
/**
 * =====================================================================
 * CLASSE DE EXCEÇÃO PERSONALIZADA DO PHPMAILER (Drop-in Replacement)
 * =====================================================================
 */

namespace PHPMailer\PHPMailer;

class Exception extends \Exception {
    /**
     * Retorna a mensagem de erro formatada.
     *
     * @return string
     */
    public function errorMessage(): string {
        return $this->getMessage();
    }
}
