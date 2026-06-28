import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface ProfessionalEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

/**
 * =====================================================================
 * WRAPPER DE EDITOR DE TEXTO RICO (TinyMCE)
 * =====================================================================
 * Componente modular premium que encapsula o editor WYSIWYG TinyMCE utilizando
 * a biblioteca oficial @tinymce/tinymce-react.
 * Oferece edição visual completa (HTML), suporte integrado a tabelas,
 * links e formatação, além de acionar o upload de fotos do dispositivo
 * diretamente para o backend de forma 100% automatizada.
 * 
 * Benefícios desta abordagem:
 * - Evita dependência rígida de scripts carregados no index.html.
 * - Tratamento dinâmico e seguro do carregamento de scripts via CDN cdnjs.
 * - Desmontagem e destruição limpa do editor no ciclo de vida do React,
 *   evitando fugas de memória (memory leaks) e problemas em StrictMode.
 * =====================================================================
 */
export default function ProfessionalEditor({
  value,
  onChange,
  placeholder = 'Escreva aqui o seu conteúdo...',
  rows = 8,
  label
}: ProfessionalEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Manipulador seguro para quando ocorre erro no carregamento do script
  const handleScriptLoadError = (err: any) => {
    console.error('Erro ao carregar o script do TinyMCE a partir da CDN:', err);
    setHasError(true);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">
          {label}
        </label>
      )}

      {/* Caixa de envolvimento OLED para alinhar com o design cyberpunk */}
      <div className="w-full bg-darkBg border border-darkBorder rounded-2xl overflow-hidden focus-within:border-brandBlue/60 transition-all flex flex-col min-h-[180px] relative select-text">
        
        {/* Estado de Carregamento (Loading Spinner) */}
        {!editorLoaded && !hasError && (
          <div className="absolute inset-0 bg-darkBg/90 flex flex-col items-center justify-center space-y-3 z-10 rounded-2xl select-none">
            <div className="w-6 h-6 border-2 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">A carregar editor TinyMCE...</span>
          </div>
        )}

        {/* Estado de Erro caso a CDN falhe ou seja bloqueada por AdBlockers */}
        {hasError && (
          <div className="absolute inset-0 bg-darkBg/95 flex flex-col items-center justify-center p-6 text-center space-y-2 z-10 rounded-2xl select-none">
            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Falha ao Carregar o Editor</span>
            <p className="text-textSecondary text-xs max-w-md">
              Não foi possível obter o editor de texto a partir da CDN. Por favor, verifique a sua ligação à internet ou desative adblockers que possam estar a bloquear scripts externos.
            </p>
          </div>
        )}

        <Editor
          // Carregar dinamicamente a versão segura e livre da CDN cdnjs
          tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"
          onInit={(_evt: any, editor: any) => {
            editorRef.current = editor;
            setEditorLoaded(true);
            setHasError(false);
          }}
          // Sincronizar o valor de forma segura com o React
          value={value}
          onEditorChange={(content: string) => {
            onChange(content);
          }}
          onScriptLoadError={handleScriptLoadError}
          init={{
            plugins: 'lists link image code table wordcount',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | table code',
            menubar: false,
            statusbar: true,
            branding: false,
            promotion: false,
            skin: 'oxide-dark',
            content_css: 'dark',
            height: rows * 40,
            placeholder: placeholder,
            entity_encoding: 'raw', // Preservar os caracteres acentuados nativos em UTF-8 em vez de os converter em entidades HTML
            
            // -------------------------------------------------------------
            // HANDLER SEGURO DE UPLOAD DE FOTOS DO DISPOSITIVO (TINY MCE)
            // -------------------------------------------------------------
            images_upload_handler: async (blobInfo: any) => {
              try {
                const formData = new FormData();
                formData.append('image', blobInfo.blob(), blobInfo.filename());

                // Fazer chamada assíncrona ao nosso endpoint de backend
                const res = await fetch('/backend/api/upload.php', {
                  method: 'POST',
                  body: formData
                });

                if (!res.ok) {
                  const errData = await res.json();
                  throw new Error(errData.message || 'Falha na resposta do servidor.');
                }

                const data = await res.json();
                if (data.success && data.image_url) {
                  // Retornar o URL absoluto local para que o TinyMCE o insira no HTML
                  return data.image_url;
                } else {
                  throw new Error(data.message || 'Erro ao obter URL da imagem.');
                }
              } catch (err: any) {
                console.error('Erro de upload no TinyMCE:', err);
                throw new Error('Erro de rede: ' + (err.message || err));
              }
            }
          }}
        />
      </div>
    </div>
  );
}

