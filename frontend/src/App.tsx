import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import LoadingScreen from './components/LoadingScreen';

// Páginas Públicas Individuais com Lazy Loading
const WelcomePage = lazy(() => import('./pages/Welcome')); // Página de entrada interativa
const Home = lazy(() => import('./pages/Home'));
const SobrePage = lazy(() => import('./pages/Sobre'));
const CompetenciasPage = lazy(() => import('./pages/Competencias'));
const ProjetosPage = lazy(() => import('./pages/Projetos'));
const ExperienciaPage = lazy(() => import('./pages/Experiencia'));
const EducacaoPage = lazy(() => import('./pages/Educacao'));
const ContactoPage = lazy(() => import('./pages/Contacto'));
const PoliticasPage = lazy(() => import('./pages/Politicas'));
const TermosPage = lazy(() => import('./pages/Termos'));

// Nova página de política de cookies dedicada em conformidade com o RGPD/ePrivacy
const CookiesPage = lazy(() => import('./pages/Cookies'));

import { LanguageProvider } from './context/LanguageContext';

// Novas Páginas de Blog e Hobbies
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const HobbiesPage = lazy(() => import('./pages/Hobbies'));

// Páginas do Painel Administrativo de Segurança com Lazy Loading
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Forgot = lazy(() => import('./pages/admin/Forgot'));
const Reset = lazy(() => import('./pages/admin/Reset'));

// Importação dinâmica (Lazy Loading) da página de erro customizada
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * COMPONENTE CENTRAL DE APLICAÇÃO (App)
 * =====================================================================
 * Define toda a malha de roteamento (React Router) do portfólio,
 * expondo a página Splash de entrada na raiz '/', agrupando as páginas
 * principais dentro do layout público consolidado (com cabeçalho e rodapé),
 * e configurando o painel de administração protegido.
 * Utiliza Code-Splitting avançado com Suspense e LoadingScreen para máxima performance.
 */
function App() {
  return (
    <LanguageProvider>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* ROTA DA PÁGINA SPLASH DE ENTRADA INTERATIVA (Sem cabeçalho global) */}
          <Route path="/" element={<WelcomePage />} />

          {/* ROTAS PÚBLICAS DO PORTFÓLIO ENVOLVIDAS NO LAYOUT GLOBAL */}
          <Route element={<PublicLayout />}>
            <Route path="/inicio" element={<Home />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/competencias" element={<CompetenciasPage />} />
            <Route path="/projetos" element={<ProjetosPage />} />
            <Route path="/experiencia" element={<ExperienciaPage />} />
            <Route path="/educacao" element={<EducacaoPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/politicas-de-privacidade" element={<PoliticasPage />} />
            <Route path="/politica-de-cookies" element={<CookiesPage />} />
            <Route path="/termos-de-uso" element={<TermosPage />} />
            
            {/* Novas Rotas de Blog e Hobbies */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/hobbies" element={<HobbiesPage />} />
          </Route>

          {/* ROTAS DO PAINEL ADMINISTRATIVO (Sem cabeçalho público) */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/forgot" element={<Forgot />} />
          <Route path="/admin/reset" element={<Reset />} />

          {/* Rota genérica de fallback para intercetar caminhos inválidos (LOST) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </Router>
    </LanguageProvider>
  );
}

export default App;
