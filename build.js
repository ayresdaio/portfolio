/**
 * @file build.js
 * @description Script de build consolidado para o projeto de Portfólio.
 * Este script automatiza o processo de limpeza da pasta de distribuição,
 * compilação do frontend React e a cópia de todos os ficheiros do backend PHP
 * para o diretório de destino final 'dist'.
 * 
 * Funciona de forma multiplataforma (Windows, macOS, Linux).
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const BACKEND_DIR = path.join(__dirname, 'backend');
const DIST_BACKEND_DIR = path.join(DIST_DIR, 'backend');

/**
 * Limpa o diretório de distribuição anterior, se existir.
 * Utiliza fs.rmSync para garantir a remoção recursiva e forçada.
 */
function cleanDist() {
  console.log('A limpar a pasta "dist"...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('Pasta "dist" removida com sucesso.');
  }
}

/**
 * Executa o build do frontend na subpasta 'frontend'.
 * Corre os comandos definidos no package.json do frontend.
 */
function buildFrontend() {
  console.log('A iniciar a compilação do frontend...');
  try {
    execSync('npm run build --prefix frontend', { stdio: 'inherit' });
    console.log('Compilação do frontend concluída.');
  } catch (error) {
    console.error('Erro ao compilar o frontend:', error.message);
    process.exit(1);
  }
}

/**
 * Copia a pasta 'backend' para 'dist/backend'.
 * Utiliza o método nativo fs.cpSync do Node.js para suporte a cópia recursiva multiplataforma.
 */
function copyBackend() {
  console.log('A copiar a pasta do backend para a pasta dist (excluindo ficheiros sensíveis)...');
  if (!fs.existsSync(BACKEND_DIR)) {
    console.error('Erro: A pasta "backend" de origem não foi encontrada.');
    process.exit(1);
  }

  try {
    fs.cpSync(BACKEND_DIR, DIST_BACKEND_DIR, { 
      recursive: true,
      filter: (srcPath) => {
        const relative = path.relative(BACKEND_DIR, srcPath);
        // Excluir ficheiros de scripts utilitários, bases de dados de teste locais e configurações locais por segurança
        const ignored = [
          'scripts',
          'database.sqlite',
          'schema.sql',
          '.env',
          '.env.example'
        ];
        return !ignored.some(item => relative === item || relative.startsWith(item + path.sep));
      }
    });
    console.log('Pasta do backend copiada com sucesso para "dist/backend" (ficheiros sensíveis excluídos).');
  } catch (error) {
    console.error('Erro ao copiar o backend:', error.message);
    process.exit(1);
  }
}

/**
 * Cria o arquivo compactado 'portfolio_deploy.zip' contendo toda a pasta 'dist'.
 * Utiliza utilitários nativos do sistema operativo correspondente (PowerShell no Windows, zip em Unix).
 */
function createZip() {
  console.log('A gerar o arquivo comprimido "portfolio_deploy.zip"...');
  const zipPath = path.join(__dirname, 'portfolio_deploy.zip');
  
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    if (process.platform === 'win32') {
      // Entra no diretório 'dist' e compacta todos os itens, incluindo ficheiros ocultos (dotfiles) através de Get-ChildItem -Force
      execSync(`powershell.exe -Command "Set-Location -Path '${DIST_DIR}'; Get-ChildItem -Force | Compress-Archive -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
    } else {
      // Entra no diretório 'dist' e compacta todos os itens recursivamente, excluindo ficheiros do Git, garantindo que dotfiles como .htaccess sejam incluídos
      execSync(`cd "${DIST_DIR}" && zip -r "${zipPath}" . -x "*.git*"`, { stdio: 'inherit' });
    }
    console.log('Arquivo "portfolio_deploy.zip" gerado com sucesso na raiz do projeto!');
  } catch (error) {
    console.error('Erro ao gerar o arquivo ZIP de distribuição:', error.message);
  }
}

/**
 * Função principal que orquestra todo o processo de build do projeto.
 */
function main() {
  cleanDist();
  buildFrontend();
  copyBackend();
  createZip();
  console.log('Build consolidado concluído com sucesso!');
}

main();
