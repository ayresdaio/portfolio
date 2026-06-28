

/**
 * =====================================================================
 * PAINEL DE CONTROLO ADMINISTRATIVO COMPLETO (Dashboard)
 * =====================================================================
 * Rota: /admin/dashboard/
 * Acesso: Restrito (Com redirecionamento automático se não autenticado)
 * Oferece controlo total sobre Perfil, Projetos, Skills, Experiências e
 * permite ler as mensagens de contacto recebidas direto do MySQL.
 */

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { 
  User, 
  Code, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Briefcase,
  LogOut,
  Download,
  CornerUpLeft,
  Send,
  BarChart2,
  Mail,
  Sliders,
  Heart,
  Menu,
  Activity,
  Globe,
  Link,
  Smartphone,
  Monitor,
  Chrome,
  Compass,
  TrendingUp,
  Lock,
  Shield
} from 'lucide-react';

// Importação completa de todos os ícones da biblioteca Lucide para permitir a sua resolução dinâmica com base no nome guardado na base de dados (Ex: "Gamepad2", "Camera", "Heart")
import * as LucideIcons from 'lucide-react';

import ProfessionalEditor from '../../components/admin/ProfessionalEditor';
import AutomationsTab from '../../components/admin/AutomationsTab';

interface Profile {
  name: string;
  role: string;
  role_en?: string;
  bio: string;
  bio_en?: string;
  email: string;
  phone?: string;
  location?: string;
  location_en?: string;
  github_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  avatar_url?: string;
  cv_url?: string;
  cv_url_en?: string;
  about_text?: string;
  about_text_en?: string;
  about_image_url?: string;
}

interface ProjectImage {
  id: number;
  image_url: string;
}

interface Project {
  id: number;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  image_url?: string;
  tags: string;
  demo_url?: string;
  repo_url?: string;
  sort_order: number;
  images?: ProjectImage[];
}

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
  category_en?: string;
  subcategory?: string;
  subcategory_en?: string;
  icon?: string;
  description?: string;
  description_en?: string;
  experience_time?: string;
  experience_time_en?: string;
}

interface Experience {
  id: number;
  role: string;
  role_en?: string;
  company: string;
  company_en?: string;
  duration: string;
  duration_en?: string;
  location?: string;
  location_en?: string;
  description: string;
  description_en?: string;
  image_url?: string;
  sort_order: number;
}

interface Education {
  id: number;
  degree: string;
  degree_en?: string;
  institution: string;
  institution_en?: string;
  duration: string;
  duration_en?: string;
  location?: string;
  location_en?: string;
  education_type?: string;
  education_type_en?: string;
  description: string;
  description_en?: string;
  image_url?: string;
  link_url?: string;
  sort_order: number;
}

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
}

interface BlogPost {
  id: number;
  title: string;
  title_en?: string;
  slug: string;
  content: string;
  content_en?: string;
  excerpt: string;
  excerpt_en?: string;
  image_url?: string;
  status: 'draft' | 'published';
  created_at: string;
}

interface Hobby {
  id: number;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  icon: string;
  image_url?: string;
  sort_order: number;
}

interface AboutSection {
  id: number;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  icon: string;
  sort_order: number;
}

interface AboutImage {
  id: number;
  image_url: string;
  caption?: string;
  caption_en?: string;
  sort_order: number;
}

/**
 * Converte um código ISO de 2 caracteres (ex: "PT", "US") no emoji correspondente da sua bandeira.
 *
 * @param string countryCode Código ISO de 2 caracteres do país.
 * @return string Emoji da bandeira ou globo de fallback.
 */
function getCountryFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === 'UN' || countryCode === 'LH') {
    return '🌐'; // Globo para localhost ou desconhecido
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌐';
  }
}

export default function AdminDashboardPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Inicialização inteligente do activeTab a partir do localStorage para reter a navegação
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'messages' | 'stats' | 'blog' | 'hobbies' | 'security' | 'automations'>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as any) || 'profile';
  });
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  // Estados dinâmicos para a barra lateral de navegação colapsável/hambúrguer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Alternar colapso da barra lateral e persistir no browser
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // Estados para os novos Modais Administrativos Profissionais (OLED Glassmorphism)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar Eliminação',
    type: 'danger',
    onConfirm: () => {}
  });

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Estados para alteração de password e chave de segurança no painel
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwNewConfirm, setPwNewConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [keyPwCurrent, setKeyPwCurrent] = useState('');
  const [keyNew, setKeyNew] = useState('');
  const [keyNewConfirm, setKeyNewConfirm] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);

  // Estados para alteração do PIN de Scripts de Base de Dados
  const [dbPinCurrentPw, setDbPinCurrentPw] = useState('');
  const [dbPinNew, setDbPinNew] = useState('');
  const [dbPinConfirm, setDbPinConfirm] = useState('');
  const [dbPinLoading, setDbPinLoading] = useState(false);

  interface SecurityLog {
    id: number;
    username_attempted: string;
    ip_address: string;
    country: string;
    city: string;
    status: 'success' | 'failed' | 'blocked';
    created_at: string;
  }

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  // Dados do Estado
  const [profile, setProfile] = useState<Profile>({ name: '', role: '', bio: '', email: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Estados dos Formulários - Removidos ficheiros binários em favor de links de texto diretos
  // (avatar_url, cv_url e about_image_url são manipulados diretamente no objeto de perfil)

  // Estados para suportar a internacionalização (_en)
  const [projTitleEn, setProjTitleEn] = useState('');
  const [projDescEn, setProjDescEn] = useState('');
  const [skillDescEn, setSkillDescEn] = useState('');
  const [skillExpTimeEn, setSkillExpTimeEn] = useState('');
  const [hobbyNameEn, setHobbyNameEn] = useState('');
  const [hobbyDescEn, setHobbyDescEn] = useState('');
  const [aboutSecTitleEn, setAboutSecTitleEn] = useState('');
  const [aboutSecContentEn, setAboutSecContentEn] = useState('');

  // Estados para a Galeria de Fotos do Sobre Mim
  const [aboutImages, setAboutImages] = useState<AboutImage[]>([]);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImageCaption, setAboutImageCaption] = useState('');
  const [aboutImageCaptionEn, setAboutImageCaptionEn] = useState('');
  const [aboutImageSort, setAboutImageSort] = useState(0);
  const [showAboutImageForm, setShowAboutImageForm] = useState(false);
  const [editingAboutImageId, setEditingAboutImageId] = useState<number | null>(null);
  const aboutImageInputRef = React.useRef<HTMLInputElement>(null);

  // Estado para controlo de tradução automática por IA
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  /**
   * Traduz um texto de Português para Inglês em tempo real usando a API interna do backend.
   *
   * @param string sourceText Texto a traduzir.
   * @param function targetSetter State setter do input correspondente em inglês.
   * @param string fieldId Identificador único do spinner.
   */
  const handleAutoTranslate = async (sourceText: string, targetSetter: (val: string) => void, fieldId: string) => {
    if (!sourceText || sourceText.trim() === '') {
      triggerAlert('error', 'O campo correspondente em Português encontra-se vazio.');
      return;
    }
    setTranslatingField(fieldId);
    try {
      const res = await fetch('/backend/api/translate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText })
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        targetSetter(data.translatedText);
        triggerAlert('success', 'Tradução automática realizada com sucesso pela IA ✨');
      } else {
        triggerAlert('error', data.message || 'Falha na tradução automática.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro ao comunicar com a API do tradutor.');
    } finally {
      setTranslatingField(null);
    }
  };

  // Formulário Projeto (Modal/Adicionar/Editar) - Agora usa link para a imagem do projeto
  const [projId, setProjId] = useState<number | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projSort, setProjSort] = useState(0);
  const [projImageUrl, setProjImageUrl] = useState('');
  const [projImageFile, setProjImageFile] = useState<File | null>(null);
  const [showProjForm, setShowProjForm] = useState(false);
  
  // Novos estados para controlo de múltiplas fotos de suporte na galeria
  const [projImages, setProjImages] = useState<ProjectImage[]>([]);
  const [projImageFiles, setProjImageFiles] = useState<File[]>([]);

  // Formulário Skill - Inclui suporte a Descrição, Ícone Físico e Tempo de Experiência
  const [skillId, setSkillId] = useState<number | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(80);
  const [skillCat, setSkillCat] = useState('Full Stack Developer');
  const [skillCatEn, setSkillCatEn] = useState('Full Stack Developer');
  const [customSkillCat, setCustomSkillCat] = useState('');
  const [customSkillCatEn, setCustomSkillCatEn] = useState('');
  // Estados para gerir a subcategoria da competência (Select padrão ou subcategoria personalizada)
  const [skillSubcat, setSkillSubcat] = useState('Frontend');
  const [skillSubcatEn, setSkillSubcatEn] = useState('Frontend');
  const [skillSubcatType, setSkillSubcatType] = useState('Frontend');
  const [customSkillSubcat, setCustomSkillSubcat] = useState('');
  const [customSkillSubcatEn, setCustomSkillSubcatEn] = useState('');
  const [skillIcon, setSkillIcon] = useState('code');
  const [skillImageFile, setSkillImageFile] = useState<File | null>(null);
  const [skillDesc, setSkillDesc] = useState('');
  const [skillExpTime, setSkillExpTime] = useState('');
  const [showSkillForm, setShowSkillForm] = useState(false);

  // Formulário Experiência
  const [expId, setExpId] = useState<number | null>(null);
  const [expRole, setExpRole] = useState('');
  const [expRoleEn, setExpRoleEn] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expCompanyEn, setExpCompanyEn] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDurationEn, setExpDurationEn] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expLocationEn, setExpLocationEn] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDescEn, setExpDescEn] = useState('');
  const [expSort, setExpSort] = useState(0);
  const [expImage, setExpImage] = useState<File | null>(null);
  const [expImageUrl, setExpImageUrl] = useState('');
  const [showExpForm, setShowExpForm] = useState(false);

  // Formulário Educação (Adicionado de forma modular)
  const [eduId, setEduId] = useState<number | null>(null);
  const [eduDegree, setEduDegree] = useState('');
  const [eduDegreeEn, setEduDegreeEn] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduInstitutionEn, setEduInstitutionEn] = useState('');
  const [eduDuration, setEduDuration] = useState('');
  const [eduDurationEn, setEduDurationEn] = useState('');
  const [eduLocation, setEduLocation] = useState('');
  const [eduLocationEn, setEduLocationEn] = useState('');
  const [eduType, setEduType] = useState('Ensino Superior');
  const [eduTypeEn, setEduTypeEn] = useState('');
  const [customEduType, setCustomEduType] = useState('');
  const [eduLink, setEduLink] = useState('');
  const [eduDesc, setEduDesc] = useState('');
  const [eduDescEn, setEduDescEn] = useState('');
  const [eduSort, setEduSort] = useState(0);
  const [eduImage, setEduImage] = useState<File | null>(null);
  const [eduImageUrl, setEduImageUrl] = useState('');
  const [showEduForm, setShowEduForm] = useState(false);

  // Estados do Blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogId, setBlogId] = useState<number | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogTitleEn, setBlogTitleEn] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogContentEn, setBlogContentEn] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogExcerptEn, setBlogExcerptEn] = useState('');
  const [blogStatus, setBlogStatus] = useState<'draft' | 'published'>('draft');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Estados dos Hobbies
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [hobbyId, setHobbyId] = useState<number | null>(null);
  const [hobbyName, setHobbyName] = useState('');
  const [hobbyDesc, setHobbyDesc] = useState('');
  const [hobbyIcon, setHobbyIcon] = useState('Heart');
  const [hobbyImageUrl, setHobbyImageUrl] = useState('');
  const [hobbyImageFile, setHobbyImageFile] = useState<File | null>(null);
  const [hobbySort, setHobbySort] = useState(0);
  const [showHobbyForm, setShowHobbyForm] = useState(false);

  // Estados temporários para os uploads locais de Perfil e Currículo
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvEnFile, setCvEnFile] = useState<File | null>(null);
  const [aboutImgFile, setAboutImgFile] = useState<File | null>(null);

  // Referências programáticas para uploads táteis seguros e compatíveis em telemóveis
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);
  const cvEnInputRef = React.useRef<HTMLInputElement>(null);
  const aboutImgInputRef = React.useRef<HTMLInputElement>(null);
  const projImageInputRef = React.useRef<HTMLInputElement>(null);

  // Estados para controlo profissional de resposta a e-mails na Inbox
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Estados para as estatísticas de tráfego anónimas do portfólio (RGPD Compliant)
  const [statsData, setStatsData] = useState<{
    kpis: { totalVisits: number; periodVisits: number; todayVisits: number; dailyAverage: number; newsletterSubscribers?: number };
    activity: { date: string; visits: number }[];
    popularPages: { page: string; visits: number }[];
    devices: { device: string; visits: number }[];
    browsers: { browser: string; visits: number }[];
    referrers: { referrer: string; visits: number }[];
    countries?: { country: string; country_code: string; visits: number }[];
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Estado para controlar o período selecionado de estatísticas (7, 30 ou 90 dias)
  const [statsRange, setStatsRange] = useState<'7' | '30' | '90'>('7');
  
  // Estado para controlar o índice do ponto ativo no gráfico para exibir o tooltip dinâmico
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Gravar separador ativo no localStorage para persistência de navegação
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Função assíncrona para obter estatísticas dinâmicas do backend parametrizadas
  const fetchStats = async (rangeVal = statsRange) => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/backend/api/stats?range=${rangeVal}`);
      if (!res.ok) throw new Error('Falha ao obter dados do servidor.');
      
      const data = await res.json();
      if (data.success) {
        setStatsData(data);
      }
    } catch (err) {
      console.error('Erro ao ler estatísticas de tráfego:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Carregar estatísticas automaticamente ao aceder ao separador correspondente ou ao alterar o período
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats(statsRange);
    }
  }, [activeTab, statsRange]);

  // Carregar os logs de segurança automaticamente ao aceder ao separador correspondente
  useEffect(() => {
    if (activeTab === 'security') {
      fetchSecurityLogs();
    }
  }, [activeTab]);

  // Efeito para verificar login e carregar dados em tempo real
  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        // Tentar obter dados do perfil (Atua como barreira de validação da sessão no PHP)
        const profileRes = await fetch('/backend/api/profile');
        if (profileRes.status === 401) {
          // Utilizador não está autenticado! Redirecionar para o login
          window.location.href = '/admin/login/';
          return;
        }

        const profileData = await profileRes.json();
        if (profileData.success && profileData.profile) {
          setProfile(profileData.profile);
        }

        // Carregar outros dados
        loadProjects();
        loadSkills();
        loadExperiences();
        loadEducation();
        loadMessages();
        loadBlogPosts();
        loadHobbies();
        loadAboutSections();
        loadAboutImages();
      } catch (err) {
        console.error('Erro de ligação com a API de segurança:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadData();
  }, []);

  // Auxiliares de Carregamento de Dados
  const loadBlogPosts = async () => {
    const res = await fetch('/backend/api/blog');
    const data = await res.json();
    if (data.success) setBlogPosts(data.posts || []);
  };

  const loadHobbies = async () => {
    const res = await fetch('/backend/api/hobbies');
    const data = await res.json();
    if (data.success) setHobbies(data.hobbies || []);
  };

  const loadProjects = async () => {
    const res = await fetch('/backend/api/projects');
    const data = await res.json();
    if (data.success) setProjects(data.projects || []);
  };

  const loadSkills = async () => {
    const res = await fetch('/backend/api/skills');
    const data = await res.json();
    if (data.success) setSkills(data.skills || []);
  };

  const loadExperiences = async () => {
    const res = await fetch('/backend/api/experience');
    const data = await res.json();
    if (data.success) setExperiences(data.experiences || []);
  };

  const loadEducation = async () => {
    const res = await fetch('/backend/api/education');
    const data = await res.json();
    if (data.success) setEducation(data.education || []);
  };

  const loadMessages = async () => {
    const res = await fetch('/backend/api/messages');
    const data = await res.json();
    if (data.success) setMessages(data.messages || []);
  };

  // Mostrar modal de feedback profissional em vez de alerta inline simples
  const triggerAlert = (type: 'success' | 'error', msg: string) => {
    setFeedbackModal({
      isOpen: true,
      type,
      title: type === 'success' ? 'Ação Concluída' : 'Ocorreu um Erro',
      message: msg
    });
  };

  // Terminar sessão real
  const executeRealLogout = async () => {
    try {
      await fetch('/backend/api/logout');
      window.location.href = '/admin/login/';
    } catch (err) {
      window.location.href = '/admin/login/';
    }
  };

  // Terminar sessão (Logout) com Confirmação em Modal OLED
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Terminar Sessão',
      message: 'Tem a certeza de que deseja encerrar a sua sessão e sair do Painel de Controlo?',
      type: 'warning',
      confirmText: 'Sair do Painel',
      onConfirm: executeRealLogout
    });
  };

  /**
   * Processa o pedido de alteração de palavra-passe do administrador.
   *
   * @param {React.FormEvent} e Evento de submissão do formulário.
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwNewConfirm) {
      triggerAlert('error', 'A nova palavra-passe e a respetiva confirmação não coincidem.');
      return;
    }
    if (pwNew.length < 8) {
      triggerAlert('error', 'A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/backend/api/update_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setPwCurrent('');
        setPwNew('');
        setPwNewConfirm('');
      } else {
        triggerAlert('error', data.message || 'Falha ao atualizar a palavra-passe.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro técnico ao comunicar com o servidor.');
    } finally {
      setPwLoading(false);
    }
  };

  /**
   * Processa o pedido de alteração de chave de segurança do administrador.
   *
   * @param {React.FormEvent} e Evento de submissão do formulário.
   */
  const handleSecurityKeyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyNew !== keyNewConfirm) {
      triggerAlert('error', 'A nova chave de segurança e a respetiva confirmação não coincidem.');
      return;
    }

    setKeyLoading(true);
    try {
      const res = await fetch('/backend/api/update_security_key.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: keyPwCurrent, newSecurityKey: keyNew })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setKeyPwCurrent('');
        setKeyNew('');
        setKeyNewConfirm('');
      } else {
        triggerAlert('error', data.message || 'Falha ao atualizar a chave de segurança.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro técnico ao comunicar com o servidor.');
    } finally {
      setKeyLoading(false);
    }
  };

  /**
   * Processa o pedido de alteração de PIN de Segurança para Scripts BD.
   *
   * @param {React.FormEvent} e Evento de submissão do formulário.
   */
  const handleDbPinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dbPinNew !== dbPinConfirm) {
      triggerAlert('error', 'O novo PIN e a respetiva confirmação não coincidem.');
      return;
    }
    if (dbPinNew.length < 4) {
      triggerAlert('error', 'O novo PIN deve ter pelo menos 4 caracteres.');
      return;
    }

    setDbPinLoading(true);
    try {
      const res = await fetch('/backend/api/update_db_pin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: dbPinCurrentPw, newPin: dbPinNew })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setDbPinCurrentPw('');
        setDbPinNew('');
        setDbPinConfirm('');
      } else {
        triggerAlert('error', data.message || 'Falha ao atualizar o PIN da Base de Dados.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro técnico ao comunicar com o servidor.');
    } finally {
      setDbPinLoading(false);
    }
  };

  /**
   * Obtém os logs de segurança e tentativas de login do administrador do backend.
   */
  const fetchSecurityLogs = async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const response = await fetch('/backend/api/security_logs.php');
      const data = await response.json();
      if (data.success) {
        setSecurityLogs(data.logs || []);
      } else {
        setLogsError(data.message || 'Erro ao obter logs de segurança.');
      }
    } catch (err) {
      setLogsError('Erro técnico ao obter os logs de segurança.');
    } finally {
      setLogsLoading(false);
    }
  };

  // Guardar Dados do Perfil (Com suporte a URLs diretas de Imagens e PDF)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('role', profile.role);
      formData.append('role_en', profile.role_en || '');
      formData.append('bio', profile.bio);
      formData.append('bio_en', profile.bio_en || '');
      formData.append('email', profile.email);
      formData.append('phone', profile.phone || '');
      formData.append('location', profile.location || '');
      formData.append('location_en', profile.location_en || '');
      formData.append('github_url', profile.github_url || '');
      formData.append('linkedin_url', profile.linkedin_url || '');
      formData.append('facebook_url', profile.facebook_url || '');
      formData.append('instagram_url', profile.instagram_url || '');
      formData.append('about_text', profile.about_text || '');
      formData.append('about_text_en', profile.about_text_en || '');
      
      // Anexar os ficheiros se tiverem sido selecionados para upload real
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else {
        formData.append('avatar_url', profile.avatar_url || '');
      }

      if (cvFile) {
        formData.append('cv', cvFile);
      } else {
        formData.append('cv_url', profile.cv_url || '');
      }

      if (cvEnFile) {
        formData.append('cv_en', cvEnFile);
      } else {
        formData.append('cv_url_en', profile.cv_url_en || '');
      }

      if (aboutImgFile) {
        formData.append('about_image', aboutImgFile);
      } else {
        formData.append('about_image_url', profile.about_image_url || '');
      }

      const res = await fetch('/backend/api/profile', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
          // O backend retorna os URLs processados
          setProfile(prev => ({
            ...prev,
            avatar_url: data.avatar_url || prev.avatar_url,
            cv_url: data.cv_url || prev.cv_url,
            cv_url_en: data.cv_url_en || prev.cv_url_en,
            about_image_url: data.about_image_url || prev.about_image_url
          }));
          // Limpar ficheiros carregados de forma reativa
          setAvatarFile(null);
          setCvFile(null);
          setCvEnFile(null);
          setAboutImgFile(null);
      } else {
        triggerAlert('error', data.message || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro ao processar ligação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar Projeto (Criar / Editar com Link de Imagem)
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (projId) formData.append('id', projId.toString());
      formData.append('title', projTitle);
      formData.append('title_en', projTitleEn);
      formData.append('description', projDesc);
      formData.append('description_en', projDescEn);
      formData.append('tags', projTags);
      formData.append('demo_url', projDemo);
      formData.append('repo_url', projRepo);
      formData.append('sort_order', projSort.toString());
      
      if (projImageFile) {
        formData.append('image', projImageFile);
      } else {
        formData.append('image_url', projImageUrl);
      }

      // Anexar lote de novas imagens físicas selecionadas para a galeria do projeto
      if (projImageFiles.length > 0) {
        projImageFiles.forEach((file) => {
          formData.append('images[]', file);
        });
      }

      const res = await fetch('/backend/api/projects', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowProjForm(false);
        resetProjForm();
        loadProjects();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar projeto.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha técnica ao tentar guardar o projeto.');
    } finally {
      setLoading(false);
    }
  };

  const resetProjForm = () => {
    setProjId(null);
    setProjTitle('');
    setProjTitleEn('');
    setProjDesc('');
    setProjDescEn('');
    setProjTags('');
    setProjDemo('');
    setProjRepo('');
    setProjSort(0);
    setProjImageUrl('');
    setProjImageFile(null);
    setProjImages([]);      // Limpar galeria administrativa
    setProjImageFiles([]);   // Limpar seleção de fotos temporárias
  };

  // Eliminar Imagem Individual da Galeria via API dedicada
  const handleProjectImageDelete = (imageId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Imagem da Galeria',
      message: 'Tem a certeza de que deseja eliminar permanentemente esta imagem física da galeria deste projeto?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/projects?image_id=${imageId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            // Atualizar o estado local das fotos da galeria
            setProjImages(prev => prev.filter(img => img.id !== imageId));
            // Recarregar projetos em segundo plano para consistência
            loadProjects();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar imagem da galeria.');
          }
        } catch (err) {
          triggerAlert('error', 'Falha técnica ao tentar ligar com a API.');
        }
      }
    });
  };

  // Eliminar Projeto (Com suporte ao novo Modal de Confirmação Profissional)
  const handleProjectDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Projeto',
      message: 'Tem a certeza de que deseja eliminar permanentemente este projeto do seu portfólio no servidor?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/projects?id=${id}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadProjects();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar projeto.');
          }
        } catch (err) {
          triggerAlert('error', 'Falha de comunicação.');
        }
      }
    });
  };

  // Guardar Skill (Trata FormData para permitir o carregamento físico e seguro do ícone de imagem)
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criação do objeto FormData para empacotar campos textuais e ficheiros binários
      const formData = new FormData();
      if (skillId) {
        formData.append('id', skillId.toString());
      }
      formData.append('name', skillName);
      formData.append('level', skillLevel.toString());
      
      const finalCat = skillCat === 'Custom' ? customSkillCat : skillCat;
      const finalCatEn = skillCat === 'Custom' ? customSkillCatEn : skillCatEn;
      formData.append('category', finalCat);
      formData.append('category_en', finalCatEn);
      
      const finalSubcat = skillSubcatType === 'Custom' ? customSkillSubcat : skillSubcat;
      const finalSubcatEn = skillSubcatType === 'Custom' ? customSkillSubcatEn : skillSubcatEn;
      formData.append('subcategory', finalSubcat);
      formData.append('subcategory_en', finalSubcatEn);
      formData.append('description', skillDesc);
      formData.append('description_en', skillDescEn);
      formData.append('experience_time', skillExpTime);
      formData.append('experience_time_en', skillExpTimeEn);

      // Se existir um ficheiro binário local selecionado, envia como ficheiro real
      if (skillImageFile) {
        formData.append('image', skillImageFile);
      } else {
        // Caso contrário, envia o valor textual (Devicon, link web ou SVG inline)
        formData.append('icon', skillIcon);
      }

      const res = await fetch('/backend/api/skills', {
        method: 'POST',
        // O cabeçalho Content-Type é definido automaticamente pelo navegador com o boundary correto ao usar FormData
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowSkillForm(false);
        // Limpar todos os estados associados à criação/edição da competência
        setSkillId(null);
        setSkillName('');
        setSkillLevel(80);
        setSkillDesc('');
        setSkillDescEn('');
        setSkillExpTime('');
        setSkillExpTimeEn('');
        setSkillIcon('code');
        setSkillImageFile(null);
        setSkillCat('Full Stack Developer');
        setSkillCatEn('Full Stack Developer');
        setCustomSkillCat('');
        setCustomSkillCatEn('');
        setSkillSubcat('Frontend');
        setSkillSubcatEn('Frontend');
        setSkillSubcatType('Frontend');
        setCustomSkillSubcat('');
        setCustomSkillSubcatEn('');
        loadSkills();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar competência.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro ao salvar competência.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Skill (Com suporte ao novo Modal de Confirmação Profissional)
  const handleSkillDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Competência',
      message: 'Tem a certeza de que deseja eliminar permanentemente esta competência técnica do seu portfólio?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/skills?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadSkills();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar competência.');
          }
        } catch (err) {
          triggerAlert('error', 'Erro ao eliminar.');
        }
      }
    });
  };

  // Guardar Experiência (FormData para suportar upload de imagem)
  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (expId) formData.append('id', expId.toString());
      formData.append('role', expRole);
      formData.append('role_en', expRoleEn);
      formData.append('company', expCompany);
      formData.append('company_en', expCompanyEn);
      formData.append('duration', expDuration);
      formData.append('duration_en', expDurationEn);
      formData.append('location', expLocation);
      formData.append('location_en', expLocationEn);
      formData.append('description', expDesc);
      formData.append('description_en', expDescEn);
      formData.append('sort_order', expSort.toString());
      
      if (expImage) formData.append('image', expImage);

      const res = await fetch('/backend/api/experience', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowExpForm(false);
        resetExpForm();
        loadExperiences();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar experiência.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro ao guardar.');
    } finally {
      setLoading(false);
    }
  };

  const resetExpForm = () => {
    setExpId(null);
    setExpRole('');
    setExpRoleEn('');
    setExpCompany('');
    setExpCompanyEn('');
    setExpDuration('');
    setExpLocation('');
    setExpDesc('');
    setExpDescEn('');
    setExpSort(0);
    setExpImage(null);
    setExpImageUrl('');
  };

  // Eliminar Experiência (Com suporte ao novo Modal de Confirmação Profissional)
  const handleExpDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Historial Profissional',
      message: 'Tem a certeza de que deseja eliminar permanentemente este registo profissional da sua linha temporal?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/experience?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadExperiences();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar registo profissional.');
          }
        } catch (err) {
          triggerAlert('error', 'Erro ao eliminar.');
        }
      }
    });
  };

  // =====================================================================
  // CRUDS DE EDUCAÇÃO ACADÉMICA (POST/DELETE) - Adicionado de forma modular
  // =====================================================================
  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (eduId) formData.append('id', eduId.toString());
      formData.append('degree', eduDegree);
      formData.append('degree_en', eduDegreeEn);
      formData.append('institution', eduInstitution);
      formData.append('institution_en', eduInstitutionEn);
      formData.append('duration', eduDuration);
      formData.append('duration_en', eduDurationEn);
      formData.append('location', eduLocation);
      formData.append('location_en', eduLocationEn);
      const finalEduType = eduType === 'Outro' ? customEduType : eduType;
      formData.append('education_type', finalEduType);
      formData.append('education_type_en', eduTypeEn);
      formData.append('link_url', eduLink);
      formData.append('description', eduDesc);
      formData.append('description_en', eduDescEn);
      formData.append('sort_order', eduSort.toString());
      
      if (eduImage) formData.append('image', eduImage);

      const res = await fetch('/backend/api/education', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowEduForm(false);
        resetEduForm();
        loadEducation();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar formação académica.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro técnico de ligação.');
    } finally {
      setLoading(false);
    }
  };

  const resetEduForm = () => {
    setEduId(null);
    setEduDegree('');
    setEduDegreeEn('');
    setEduInstitution('');
    setEduInstitutionEn('');
    setEduDuration('');
    setExpDuration('');
    setExpDurationEn('');
    setExpLocation('');
    setExpLocationEn('');
    setEduType('Ensino Superior');
    setEduTypeEn('');
    setCustomEduType('');
    setEduLink('');
    setEduDesc('');
    setEduDescEn('');
    setEduSort(0);
    setEduImage(null);
    setEduImageUrl('');
  };

  // Eliminar Educação (Com suporte ao novo Modal de Confirmação Profissional)
  const handleEduDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Formação Académica',
      message: 'Tem a certeza de que deseja eliminar permanentemente esta formação académica da sua linha temporal?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/education?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadEducation();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar formação académica.');
          }
        } catch (err) {
          triggerAlert('error', 'Erro ao eliminar.');
        }
      }
    });
  };

  // Marcar Mensagem de Contacto como lida
  const handleMessageStatusChange = async (id: number, isRead: number) => {
    try {
      const res = await fetch('/backend/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: isRead })
      });
      if (!res.ok) {
        // Se a resposta do servidor for um erro (ex: 500, 401, 400), tentar ler a mensagem técnica se for JSON
        try {
          const errorData = await res.json();
          triggerAlert('error', errorData.message || 'Falha ao alterar estado da mensagem no servidor.');
        } catch {
          triggerAlert('error', 'Falha ao alterar estado da mensagem no servidor (Erro HTTP ' + res.status + ').');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        loadMessages();
      } else {
        triggerAlert('error', data.message || 'Falha ao alterar estado da mensagem.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha ao alterar estado da mensagem.');
    }
  };

  // Eliminar Mensagem de Contacto (Com suporte ao novo Modal de Confirmação Profissional)
  const handleMessageDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Mensagem Recebida',
      message: 'Tem a certeza de que deseja eliminar esta mensagem da caixa de entrada permanentemente?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/messages?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadMessages();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar mensagem.');
          }
        } catch (err) {
          triggerAlert('error', 'Falha ao eliminar mensagem.');
        }
      }
    });
  };

  // =====================================================================
  // GESTÃO DE ARTIGOS DO BLOG (CRUD HANDLERS)
  // =====================================================================
  const handleBlogPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (blogId) formData.append('id', blogId.toString());
      formData.append('title', blogTitle);
      formData.append('title_en', blogTitleEn);
      formData.append('slug', blogSlug);
      formData.append('content', blogContent);
      formData.append('content_en', blogContentEn);
      formData.append('excerpt', blogExcerpt);
      formData.append('excerpt_en', blogExcerptEn);
      formData.append('status', blogStatus);

      if (blogImageFile) {
        formData.append('image', blogImageFile);
      } else {
        formData.append('image_url', blogImageUrl);
      }

      const res = await fetch('/backend/api/blog', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowBlogForm(false);
        resetBlogForm();
        loadBlogPosts();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar artigo.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha técnica ao tentar guardar o artigo do blog.');
    } finally {
      setLoading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogId(null);
    setBlogTitle('');
    setBlogTitleEn('');
    setBlogSlug('');
    setBlogContent('');
    setBlogContentEn('');
    setBlogExcerpt('');
    setBlogExcerptEn('');
    setBlogStatus('draft');
    setBlogImageUrl('');
    setBlogImageFile(null);
  };

  const handleBlogPostDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Artigo do Blog',
      message: 'Tem a certeza de que deseja eliminar permanentemente este artigo do seu blog?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/blog?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadBlogPosts();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar artigo.');
          }
        } catch (err) {
          triggerAlert('error', 'Falha de comunicação com a API.');
        }
      }
    });
  };

  // =====================================================================
  // GESTÃO DE HOBBIES (CRUD HANDLERS)
  // =====================================================================
  const handleHobbySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (hobbyId) formData.append('id', hobbyId.toString());
      formData.append('name', hobbyName);
      formData.append('name_en', hobbyNameEn);
      formData.append('description', hobbyDesc);
      formData.append('description_en', hobbyDescEn);
      formData.append('icon', hobbyIcon);
      formData.append('sort_order', hobbySort.toString());

      if (hobbyImageFile) {
        formData.append('image', hobbyImageFile);
      } else {
        formData.append('image_url', hobbyImageUrl);
      }

      const res = await fetch('/backend/api/hobbies', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowHobbyForm(false);
        resetHobbyForm();
        loadHobbies();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar passatempo.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha técnica ao tentar guardar o passatempo.');
    } finally {
      setLoading(false);
    }
  };

  const resetHobbyForm = () => {
    setHobbyId(null);
    setHobbyName('');
    setHobbyNameEn('');
    setHobbyDesc('');
    setHobbyDescEn('');
    setHobbyIcon('Heart');
    setHobbyImageUrl('');
    setHobbyImageFile(null);
    setHobbySort(0);
  };

  const handleHobbyDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Passatempo',
      message: 'Tem a certeza de que deseja eliminar permanentemente este passatempo?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/hobbies?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadHobbies();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar passatempo.');
          }
        } catch (err) {
          triggerAlert('error', 'Erro ao tentar eliminar.');
        }
      }
    });
  };

  // =====================================================================
  // GESTÃO DE SECÇÕES DO SOBRE MIM (CRUD HANDLERS)
  // =====================================================================
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [aboutSecId, setAboutSecId] = useState<number | null>(null);
  const [aboutSecTitle, setAboutSecTitle] = useState('');
  const [aboutSecContent, setAboutSecContent] = useState('');
  const [aboutSecIcon, setAboutSecIcon] = useState('Info');
  const [aboutSecSort, setAboutSecSort] = useState(0);
  const [showAboutSecForm, setShowAboutSecForm] = useState(false);

  const loadAboutSections = async () => {
    try {
      const res = await fetch('/backend/api/about_sections');
      const data = await res.json();
      if (data.success) setAboutSections(data.about_sections || []);
    } catch (err) {
      console.error('Erro ao ler secções do Sobre:', err);
    }
  };

  const handleAboutSecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (aboutSecId) formData.append('id', aboutSecId.toString());
      formData.append('title', aboutSecTitle);
      formData.append('title_en', aboutSecTitleEn);
      formData.append('content', aboutSecContent);
      formData.append('content_en', aboutSecContentEn);
      formData.append('icon', aboutSecIcon);
      formData.append('sort_order', aboutSecSort.toString());

      const res = await fetch('/backend/api/about_sections', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowAboutSecForm(false);
        resetAboutSecForm();
        loadAboutSections();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar secção.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha técnica ao tentar guardar a secção.');
    } finally {
      setLoading(false);
    }
  };

  const resetAboutSecForm = () => {
    setAboutSecId(null);
    setAboutSecTitle('');
    setAboutSecTitleEn('');
    setAboutSecContent('');
    setAboutSecContentEn('');
    setAboutSecIcon('Info');
    setAboutSecSort(0);
  };

  const handleAboutSecDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Secção do Sobre Mim',
      message: 'Tem a certeza de que deseja eliminar permanentemente esta secção?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/about_sections?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadAboutSections();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar secção.');
          }
        } catch (err) {
          triggerAlert('error', 'Erro ao tentar eliminar.');
        }
      }
    });
  };

  // =====================================================================
  // GESTÃO DE IMAGENS DO SOBRE MIM (CRUD HANDLERS)
  // =====================================================================
  const loadAboutImages = async () => {
    try {
      const res = await fetch('/backend/api/about_images');
      const data = await res.json();
      if (data.success) setAboutImages(data.about_images || []);
    } catch (err) {
      console.error('Erro ao ler galeria do Sobre:', err);
    }
  };

  const handleAboutImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (editingAboutImageId) {
        formData.append('id', editingAboutImageId.toString());
      }
      formData.append('caption', aboutImageCaption);
      formData.append('caption_en', aboutImageCaptionEn);
      formData.append('sort_order', aboutImageSort.toString());

      if (aboutImageFile) {
        formData.append('image', aboutImageFile);
      }

      const res = await fetch('/backend/api/about_images', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setShowAboutImageForm(false);
        resetAboutImageForm();
        loadAboutImages();
      } else {
        triggerAlert('error', data.message || 'Erro ao guardar imagem.');
      }
    } catch (err) {
      triggerAlert('error', 'Falha técnica ao tentar guardar a imagem.');
    } finally {
      setLoading(false);
    }
  };

  const resetAboutImageForm = () => {
    setEditingAboutImageId(null);
    setAboutImageCaption('');
    setAboutImageCaptionEn('');
    setAboutImageSort(0);
    setAboutImageFile(null);
  };

  const handleAboutImageDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Imagem da Galeria',
      message: 'Tem a certeza de que deseja eliminar permanentemente esta foto da galeria do Sobre Mim?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/backend/api/about_images?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            triggerAlert('success', data.message);
            loadAboutImages();
          } else {
            triggerAlert('error', data.message || 'Erro ao eliminar imagem.');
          }
        } catch (err) {
          triggerAlert('error', 'Falha de comunicação com a API.');
        }
      }
    });
  };

  /**
   * Envia uma resposta profissional por e-mail a um visitante a partir do painel.
   * Comunica com o backend messages.php através de POST seguro com ação 'reply'.
   * 
   * @param e Formulário de submissão
   * @param msgId ID da mensagem original
   */
  const handleSendReply = async (e: React.FormEvent, msgId: number) => {
    e.preventDefault();
    if (!replyText.trim()) {
      triggerAlert('error', 'A mensagem de resposta não pode estar vazia.');
      return;
    }
    setSendingReply(true);

    try {
      const res = await fetch('/backend/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msgId,
          action: 'reply',
          reply_message: replyText
        })
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          triggerAlert('error', errorData.message || 'Falha ao enviar resposta por e-mail.');
        } catch {
          triggerAlert('error', 'Falha técnica ao enviar resposta (Erro HTTP ' + res.status + ').');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        triggerAlert('success', data.message);
        setReplyingToId(null);
        setReplyText('');
        loadMessages(); // Recarregar mensagens para atualizar o estado is_read para Lida
      } else {
        triggerAlert('error', data.message || 'Falha ao processar envio de resposta.');
      }
    } catch (err) {
      triggerAlert('error', 'Erro de comunicação ao enviar resposta.');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading && profile.name === '') {
    return (
      <div className="min-h-screen bg-darkBg text-textPrimary flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-textSecondary uppercase tracking-widest">A carregar segurança do painel...</p>
        </div>
      </div>
    );
  }

  // Contagem de mensagens não lidas
  const unreadMessagesCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="h-screen bg-darkBg flex flex-col md:flex-row text-textPrimary overflow-hidden">
      
      {/* CABEÇALHO MÓVEL DE TOPO (Exposto exclusivamente em telemóveis) */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-darkSurface border-b border-darkBorder z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/imag/icon.png" alt="Logotipo" className="w-8 h-8 object-contain" />
          <span className="text-sm font-bold text-textPrimary tracking-wider uppercase">Painel</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg bg-darkBg text-textSecondary hover:text-brandBlue border border-darkBorder transition-all"
          title="Abrir Menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* 1. BARRA LATERAL DE NAVEGAÇÃO DO ADMIN (Suporta colapso desktop e painel mobile) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setAlert({ type: null, msg: '' });
        }}
        unreadMessagesCount={unreadMessagesCount}
        handleLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. ÁREA DE CONTEÚDO DINÂMICO */}
      {/* flex-1 min-w-0 impede que conteúdos largos espremam o menu lateral */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Cabeçalho da Tab */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-darkBorder pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brandBlue">Zona de Administração</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-textPrimary uppercase tracking-tight mt-0.5">
              {activeTab === 'profile' && 'Informações de Perfil'}
              {activeTab === 'stats' && 'Estatísticas de Tráfego e Atividade'}
              {activeTab === 'about' && 'Secção "Sobre Mim"'}
              {activeTab === 'projects' && 'Gestão de Projetos'}
              {activeTab === 'skills' && 'Gestão de Competências'}
              {activeTab === 'experience' && 'Linha Temporal de Experiência'}
              {activeTab === 'education' && 'Historial de Formação Académica'}
              {activeTab === 'messages' && 'Caixa de Entrada'}
              {activeTab === 'blog' && 'Gestão do Blog Técnico'}
              {activeTab === 'hobbies' && 'Passatempos & Hobbies'}
              {activeTab === 'security' && 'Segurança da Conta'}
              {activeTab === 'automations' && 'Automações e Scripts'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <a href="/" target="_blank" className="text-xs px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/40 text-textSecondary hover:text-textPrimary rounded-xl transition-all flex items-center space-x-2">
              <span>Visualizar Portfólio</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Alerta de Feedback Geral */}
        {alert.type && (
          <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            alert.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          } animate-slide-up`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span>{alert.msg}</span>
          </div>
        )}

        {/* =============================================================
            TAB: PERFIL
            ============================================================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="glass-panel p-8 space-y-6">
            <h3 className="text-lg font-bold text-textPrimary border-b border-darkBorder/40 pb-2">Informação Pessoal & Biografia</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome de Exibição</label>
                <input 
                  type="text" required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Cargo / Título (PT)</label>
                <input 
                  type="text" required
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                  <span>Cargo / Título (EN)</span>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    value={profile.role_en || ''}
                    onChange={(e) => setProfile({ ...profile, role_en: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoTranslate(profile.role, (val) => setProfile(prev => ({ ...prev, role_en: val })), 'profile_role')}
                    disabled={translatingField === 'profile_role'}
                    className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                    title="Traduzir com IA ✨"
                  >
                    {translatingField === 'profile_role' ? (
                      <div className="w-4 h-4 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-[13px] leading-none">✨</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ProfessionalEditor
                  label="Biografia Curta (PT)"
                  value={profile.bio}
                  onChange={(val) => setProfile({ ...profile, bio: val })}
                  placeholder="Escreva uma biografia sucinta para ser apresentada no cabeçalho/página inicial do portfólio..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Biografia Curta (EN)</label>
                  <button
                    type="button"
                    onClick={() => handleAutoTranslate(profile.bio, (val) => setProfile(prev => ({ ...prev, bio_en: val })), 'profile_bio')}
                    disabled={translatingField === 'profile_bio'}
                    className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {translatingField === 'profile_bio' ? (
                      <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>✨ Traduzir com IA</span>
                    )}
                  </button>
                </div>
                <ProfessionalEditor
                  label=""
                  value={profile.bio_en || ''}
                  onChange={(val) => setProfile({ ...profile, bio_en: val })}
                  placeholder="Short bio in English..."
                  rows={4}
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-textPrimary border-b border-darkBorder/40 pt-4 pb-2">Contactos & Redes</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">E-mail do Perfil</label>
                <input 
                  type="email" required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Telefone (Opcional)</label>
                <input 
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Localização (Cidade, País) (PT)</label>
                <input 
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Localização (EN)</label>
                  <button
                    type="button"
                    onClick={() => handleAutoTranslate(profile.location || '', (val) => setProfile(prev => ({ ...prev, location_en: val })), 'profile_location')}
                    disabled={translatingField === 'profile_location'}
                    className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {translatingField === 'profile_location' ? (
                      <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>✨ Traduzir com IA</span>
                    )}
                  </button>
                </div>
                <input 
                  type="text"
                  value={profile.location_en || ''}
                  onChange={(e) => setProfile({ ...profile, location_en: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL do GitHub</label>
                <input 
                  type="url"
                  value={profile.github_url || ''}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL do LinkedIn</label>
                <input 
                  type="url"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL do Facebook</label>
                <input 
                  type="url"
                  value={profile.facebook_url || ''}
                  onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL do Instagram</label>
                <input 
                  type="url"
                  value={profile.instagram_url || ''}
                  onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-textPrimary border-b border-darkBorder/40 pt-4 pb-2">Foto de Perfil & Ficheiro de Currículo (PDF)</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Foto de Perfil (Avatar) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Fotografia de Perfil (Avatar)</label>
                <div className="flex items-center space-x-4 bg-darkBg/60 border border-darkBorder p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-inner">
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : <User size={24} className="text-slate-655" />}
                  </div>
                  <div className="flex-grow space-y-2 min-w-0">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAvatarFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      ref={avatarInputRef}
                    />
                    <button 
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                    >
                      <Upload size={12} />
                      <span>Selecionar Imagem</span>
                    </button>
                    <p className="text-[10px] text-textSecondary truncate">
                      {avatarFile ? `Ficheiro: ${avatarFile.name}` : profile.avatar_url ? `Caminho: ${profile.avatar_url}` : 'Nenhum ficheiro.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Currículo PDF (Português) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Currículo em Português (PDF)</label>
                <div className="flex items-center space-x-4 bg-darkBg/60 border border-darkBorder p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-xl bg-brandBlue/10 flex items-center justify-center text-brandBlue shrink-0 border border-brandBlue/20">
                    <FileText size={24} />
                  </div>
                  <div className="flex-grow space-y-2 min-w-0">
                    <input 
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCvFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      ref={cvInputRef}
                    />
                    <button 
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                    >
                      <Upload size={12} />
                      <span>Selecionar PDF</span>
                    </button>
                    <p className="text-[10px] text-textSecondary truncate">
                      {cvFile ? `Ficheiro: ${cvFile.name}` : profile.cv_url ? `Caminho: ${profile.cv_url}` : 'Nenhum currículo em português.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Currículo PDF (Inglês) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Currículo em Inglês / Resume (PDF)</label>
                <div className="flex items-center space-x-4 bg-darkBg/60 border border-darkBorder p-4 rounded-2xl">
                  <div className="w-16 h-16 rounded-xl bg-brandBlue/10 flex items-center justify-center text-brandBlue shrink-0 border border-brandBlue/20">
                    <FileText size={24} />
                  </div>
                  <div className="flex-grow space-y-2 min-w-0">
                    <input 
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCvEnFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      ref={cvEnInputRef}
                    />
                    <button 
                      type="button"
                      onClick={() => cvEnInputRef.current?.click()}
                      className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                    >
                      <Upload size={12} />
                      <span>Selecionar PDF</span>
                    </button>
                    <p className="text-[10px] text-textSecondary truncate">
                      {cvEnFile ? `Ficheiro: ${cvEnFile.name}` : profile.cv_url_en ? `Caminho: ${profile.cv_url_en}` : 'Nenhum currículo em inglês.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary font-semibold rounded-xl flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-brandBlue/10 ml-auto"
            >
              <Save size={16} />
              <span>Guardar Perfil</span>
            </button>
          </form>
        )}

        {/* =============================================================
            TAB: SOBRE MIM
            ============================================================= */}
        {activeTab === 'about' && (
          <form onSubmit={handleProfileSubmit} className="glass-panel p-8 space-y-6 animate-slide-up">
            <h3 className="text-lg font-bold text-textPrimary border-b border-darkBorder/40 pb-2">Conteúdo da Secção "Sobre Mim"</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ProfessionalEditor
                  label="Texto Detalhado Sobre Mim (PT)"
                  value={profile.about_text || ''}
                  onChange={(val) => setProfile({ ...profile, about_text: val })}
                  placeholder="Escreva a sua história, conquistas profissionais e trajetórias com formatação profissional..."
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Texto Detalhado Sobre Mim (EN)</label>
                  <button
                    type="button"
                    onClick={() => handleAutoTranslate(profile.about_text || '', (val) => setProfile(prev => ({ ...prev, about_text_en: val })), 'profile_about_text')}
                    disabled={translatingField === 'profile_about_text'}
                    className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {translatingField === 'profile_about_text' ? (
                      <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>✨ Traduzir com IA</span>
                    )}
                  </button>
                </div>
                <ProfessionalEditor
                  label=""
                  value={profile.about_text_en || ''}
                  onChange={(val) => setProfile({ ...profile, about_text_en: val })}
                  placeholder="Detailed text about me in English..."
                  rows={8}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-darkBorder/40">
              <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Imagem de Destaque "Sobre Mim"</label>
              <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg">
                  {aboutImgFile ? (
                    <img src={URL.createObjectURL(aboutImgFile)} alt="Preview Sobre Mim" className="w-full h-full object-cover" />
                  ) : profile.about_image_url ? (
                    <img src={profile.about_image_url} alt="Sobre Mim" className="w-full h-full object-cover" />
                  ) : <User size={36} className="text-slate-655" />}
                </div>
                <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAboutImgFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    ref={aboutImgInputRef}
                  />
                  <button 
                    type="button"
                    onClick={() => aboutImgInputRef.current?.click()}
                    className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                  >
                    <Upload size={12} />
                    <span>Selecionar Imagem</span>
                  </button>
                  <p className="text-xs text-textSecondary truncate">
                    {aboutImgFile ? `Ficheiro: ${aboutImgFile.name}` : profile.about_image_url ? `Caminho: ${profile.about_image_url}` : 'Nenhuma imagem selecionada.'}
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="mt-6 px-6 py-3 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary font-semibold rounded-xl flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-brandBlue/10 ml-auto"
            >
              <Save size={16} />
              <span>Guardar Alterações</span>
            </button>
          </form>
        )}

        {/* =============================================================
            TAB: SECÇÃO "SOBRE MIM" (BENTO GRID CRUD)
            ============================================================= */}
        {activeTab === 'about' && (
          <div className="space-y-6 mt-12 border-t border-darkBorder/40 pt-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-textPrimary">Secções Adicionais do "Sobre Mim" ({aboutSections.length})</h3>
                <p className="text-xs text-textSecondary">Crie blocos adicionais que serão exibidos na Bento Grid do seu portfólio público.</p>
              </div>
              <button 
                type="button"
                onClick={() => { resetAboutSecForm(); setShowAboutSecForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Nova Secção</span>
              </button>
            </div>

            {showAboutSecForm && (
              <form onSubmit={handleAboutSecSubmit} className="glass-panel p-6 space-y-4 bg-darkSurface/40 border border-darkBorder/60 rounded-3xl">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder/60">
                  {aboutSecId ? 'Editar Secção Adicional' : 'Nova Secção Adicional'}
                </h4>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Título da Secção (PT)</label>
                    <input 
                      type="text" required value={aboutSecTitle} onChange={(e) => setAboutSecTitle(e.target.value)}
                      placeholder="Ex: Os Meus Valores ou Metodologia"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                      <span>Título (EN)</span>
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="text" value={aboutSecTitleEn} onChange={(e) => setAboutSecTitleEn(e.target.value)}
                        placeholder="Ex: My Values"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(aboutSecTitle, setAboutSecTitleEn, 'about_sec_title')}
                        disabled={translatingField === 'about_sec_title'}
                        className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                        title="Traduzir com IA ✨"
                      >
                        {translatingField === 'about_sec_title' ? (
                          <div className="w-4 h-4 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-[13px] leading-none">✨</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ícone Lucide</label>
                    <input 
                      type="text" value={aboutSecIcon} onChange={(e) => setAboutSecIcon(e.target.value)}
                      placeholder="Ex: ShieldCheck, Target, Cpu, Award"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <ProfessionalEditor
                      label="Conteúdo da Secção (PT)"
                      value={aboutSecContent}
                      onChange={(val) => setAboutSecContent(val)}
                      placeholder="Escreva a descrição rica ou detalhes desta secção..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Conteúdo da Secção (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(aboutSecContent, setAboutSecContentEn, 'about_sec_content')}
                        disabled={translatingField === 'about_sec_content'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'about_sec_content' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={aboutSecContentEn}
                      onChange={(val) => setAboutSecContentEn(val)}
                      placeholder="Content in English..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Exibição</label>
                    <input 
                      type="number" value={aboutSecSort} onChange={(e) => setAboutSecSort(parseInt(e.target.value) || 0)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => { setShowAboutSecForm(false); resetAboutSecForm(); }}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar Secção</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Secções Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutSections.map(sec => (
                <div key={sec.id} className="glass-panel p-6 flex items-center justify-between gap-4 bg-darkSurface/20 border border-darkBorder/40 rounded-3xl animate-scale-up">
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center text-cyan-400 p-1">
                      {(() => {
                        const IconComponent = (LucideIcons as any)[sec.icon] || (LucideIcons as any)['Info'];
                        return <IconComponent size={20} />;
                      })()}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-full text-textSecondary font-bold uppercase tracking-widest">Ordem: {sec.sort_order}</span>
                        <span className="text-[10px] text-brandBlue font-mono">Ícone: {sec.icon}</span>
                      </div>
                      <h4 className="text-base font-bold text-textPrimary pt-1 truncate">{sec.title}</h4>
                      <p className="text-xs text-textSecondary leading-normal line-clamp-2" dangerouslySetInnerHTML={{ __html: sec.content }} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 text-xs shrink-0 font-bold">
                    <button 
                      type="button"
                      onClick={() => {
                        setAboutSecId(sec.id);
                        setAboutSecTitle(sec.title);
                        setAboutSecTitleEn(sec.title_en || '');
                        setAboutSecContent(sec.content);
                        setAboutSecContentEn(sec.content_en || '');
                        setAboutSecIcon(sec.icon);
                        setAboutSecSort(sec.sort_order);
                        setShowAboutSecForm(true);
                      }}
                      className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleAboutSecDelete(sec.id)}
                      className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* =============================================================
                ZONA: GALERIA DE FOTOS DO SOBRE MIM (about_images)
                ============================================================= */}
            <div className="space-y-6 mt-12 border-t border-darkBorder/40 pt-8 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">Galeria de Fotos do "Sobre Mim" ({aboutImages.length})</h3>
                  <p className="text-xs text-textSecondary">Faça o upload de fotografias pessoais para exibir no carousel interativo da página pública.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => { resetAboutImageForm(); setShowAboutImageForm(true); }}
                  className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
                >
                  <Plus size={14} />
                  <span>Adicionar Foto</span>
                </button>
              </div>

              {showAboutImageForm && (
                <form onSubmit={handleAboutImageSubmit} className="glass-panel p-6 space-y-4 bg-darkSurface/40 border border-darkBorder/60 rounded-3xl">
                  <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder/60">
                    {editingAboutImageId ? 'Editar Foto da Galeria' : 'Nova Foto para a Galeria'}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Legenda da Foto (PT)</label>
                      <input 
                        type="text" value={aboutImageCaption} onChange={(e) => setAboutImageCaption(e.target.value)}
                        placeholder="Ex: A trabalhar no escritório ou Evento tecnológico"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                        <span>Legenda (EN)</span>
                      </label>
                      <div className="flex items-center space-x-1.5">
                        <input 
                          type="text" value={aboutImageCaptionEn} onChange={(e) => setAboutImageCaptionEn(e.target.value)}
                          placeholder="Ex: Working at the office"
                          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoTranslate(aboutImageCaption, setAboutImageCaptionEn, 'about_img_caption')}
                          disabled={translatingField === 'about_img_caption'}
                          className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                          title="Traduzir com IA ✨"
                        >
                          {translatingField === 'about_img_caption' ? (
                            <div className="w-4 h-4 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className="text-[13px] leading-none">✨</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Ficheiro de Imagem</label>
                      <div className="flex items-center space-x-4 bg-darkBg/60 border border-darkBorder p-3 rounded-2xl">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center text-textSecondary">
                          {aboutImageFile ? (
                            <img src={URL.createObjectURL(aboutImageFile)} alt="Preview" className="w-full h-full object-cover" />
                          ) : editingAboutImageId && aboutImages.find(i => i.id === editingAboutImageId)?.image_url ? (
                            <img src={aboutImages.find(i => i.id === editingAboutImageId)?.image_url} alt="Atual" className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={18} />
                          )}
                        </div>
                        <div className="flex-grow space-y-2">
                          <input 
                            type="file" accept="image/*" className="hidden" ref={aboutImageInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAboutImageFile(e.target.files[0]);
                              }
                            }}
                          />
                          <button 
                            type="button" onClick={() => aboutImageInputRef.current?.click()}
                            className="px-3.5 py-1.5 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-lg text-xs font-bold transition-all"
                          >
                            Selecionar Ficheiro
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Exibição</label>
                      <input 
                        type="number" value={aboutImageSort} onChange={(e) => setAboutImageSort(parseInt(e.target.value) || 0)}
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button" onClick={() => { setShowAboutImageForm(false); resetAboutImageForm(); }}
                      className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <Save size={14} />
                      <span>Salvar Foto</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Listagem de Fotos da Galeria */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {aboutImages.map(img => (
                  <div key={img.id} className="glass-panel p-4 flex flex-col gap-3 bg-darkSurface/20 border border-darkBorder/40 rounded-3xl group relative animate-scale-up">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-darkBorder relative">
                      <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[8px] font-black bg-black/80 px-2 py-0.5 rounded-full border border-darkBorder/40 uppercase tracking-wider text-brandBlue">Ordem: {img.sort_order}</span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-textPrimary truncate">{img.caption || 'Sem Legenda (PT)'}</h4>
                      <p className="text-[10px] text-textSecondary truncate italic">{img.caption_en || 'No Caption (EN)'}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-darkBorder/30 pt-3 text-[11px] font-bold">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingAboutImageId(img.id);
                          setAboutImageCaption(img.caption || '');
                          setAboutImageCaptionEn(img.caption_en || '');
                          setAboutImageSort(img.sort_order);
                          setAboutImageFile(null);
                          setShowAboutImageForm(true);
                        }}
                        className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                      >
                        <Edit3 size={12} />
                        <span>Editar</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleAboutImageDelete(img.id)}
                        className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                      >
                        <Trash2 size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: PROJETOS
            ============================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Todos os Projetos ({projects.length})</h3>
              <button 
                onClick={() => { resetProjForm(); setShowProjForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Adicionar Projeto</span>
              </button>
            </div>

            {/* Formulário deslizante de Projeto */}
            {showProjForm && (
              <form onSubmit={handleProjectSubmit} className="glass-panel p-6 space-y-4 animate-slide-up">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {projId ? 'Editar Projeto' : 'Novo Projeto'}
                </h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Título (PT)</label>
                    <input 
                      type="text" required value={projTitle} onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="Nome do projeto"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                      <span>Título (EN)</span>
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input 
                        type="text" value={projTitleEn} onChange={(e) => setProjTitleEn(e.target.value)}
                        placeholder="Project title in English"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(projTitle, setProjTitleEn, 'project_title')}
                        disabled={translatingField === 'project_title'}
                        className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                        title="Traduzir com IA ✨"
                      >
                        {translatingField === 'project_title' ? (
                          <div className="w-4 h-4 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-[13px] leading-none">✨</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Tags (Separadas por vírgula)</label>
                    <input 
                      type="text" required value={projTags} onChange={(e) => setProjTags(e.target.value)}
                      placeholder="React, Next.js, MySQL"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <ProfessionalEditor
                      label="Descrição Detalhada (PT)"
                      value={projDesc}
                      onChange={(val) => setProjDesc(val)}
                      placeholder="Escreva um resumo detalhado e profissional com os recursos e arquitetura do projeto..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição Detalhada (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(projDesc, setProjDescEn, 'project_desc')}
                        disabled={translatingField === 'project_desc'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'project_desc' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={projDescEn}
                      onChange={(val) => setProjDescEn(val)}
                      placeholder="Detailed description in English..."
                      rows={5}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL Demonstração</label>
                    <input 
                      type="url" value={projDemo} onChange={(e) => setProjDemo(e.target.value)}
                      placeholder="https://exemplo.com"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">URL Repositório</label>
                    <input 
                      type="url" value={projRepo} onChange={(e) => setProjRepo(e.target.value)}
                      placeholder="https://github.com/ayres"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Exibição</label>
                    <input 
                      type="number" value={projSort} onChange={(e) => setProjSort(parseInt(e.target.value) || 0)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Imagem de Capa do Projeto</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg relative group">
                      {projImageFile ? (
                        <img src={URL.createObjectURL(projImageFile)} alt="Preview Projeto" className="w-full h-full object-cover" />
                      ) : projImageUrl ? (
                        <img src={projImageUrl} alt="Imagem Projeto" className="w-full h-full object-cover" />
                      ) : (
                        <Code size={24} className="text-textSecondary" />
                      )}
                      
                      {!projImageFile && projImageUrl && (
                        <a 
                          href={projImageUrl} 
                          download={`projeto_${projId || 'novo'}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-brandBlue hover:text-indigo-400 transition-all animate-fade-in"
                          title="Descarregar Imagem"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProjImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        ref={projImageInputRef}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => projImageInputRef.current?.click()}
                          className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                        >
                          <Upload size={12} />
                          <span>Selecionar Imagem</span>
                        </button>
                        {projImageFile && (
                          <button 
                            type="button"
                            onClick={() => setProjImageFile(null)}
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                          >
                            Remover Seleção
                          </button>
                        )}
                        {!projImageFile && projImageUrl && (
                          <a 
                            href={projImageUrl} 
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/40 text-textSecondary hover:text-brandBlue rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                          >
                            <Download size={12} />
                            <span>Baixar Capa</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-textSecondary truncate">
                        {projImageFile ? `Ficheiro local: ${projImageFile.name}` : projImageUrl ? `Caminho DB: ${projImageUrl}` : 'Nenhuma imagem selecionada.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    NOVA SECÇÃO: GALERIA DE IMAGENS DE SUPORTE DO PROJETO
                    ------------------------------------------------------------- */}
                <div className="space-y-4 pt-4 border-t border-darkBorder/40">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Galeria de Imagens de Suporte (Múltiplas)</label>
                  
                  {/* Exibição das Fotos da Galeria já Existentes no Servidor (Modo Edição) */}
                  {projId && projImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 bg-darkBg/30 border border-darkBorder/60 p-4 rounded-2xl">
                      {projImages.map((img) => (
                        <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-darkBorder group shadow-md flex items-center justify-center">
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          
                          {/* Botões de Ações Rápidas por Cima da Foto (Download e Eliminar) */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition-all duration-300">
                            {/* Botão de Download Físico da Foto da Galeria */}
                            <a 
                              href={img.image_url} 
                              download={`projeto_${projId}_foto_${img.id}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/40 text-textSecondary hover:text-brandBlue rounded-lg transition-all"
                              title="Descarregar Imagem"
                            >
                              <Download size={14} />
                            </a>

                            {/* Botão de Eliminação Física e Lógica */}
                            <button 
                              type="button"
                              onClick={() => handleProjectImageDelete(img.id)}
                              className="p-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-lg transition-all"
                              title="Eliminar Imagem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zona de Upload de Novas Fotos em Lote */}
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-20 h-20 rounded-xl bg-brandBlue/5 border border-brandBlue/10 flex flex-col items-center justify-center text-brandBlue shrink-0">
                      <Code size={20} className="opacity-80" />
                      <span className="text-[9px] font-bold uppercase mt-1">BATCH</span>
                    </div>

                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setProjImageFiles(Array.from(e.target.files));
                          }
                        }}
                        className="hidden"
                        id="proj-gallery-upload"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label 
                          htmlFor="proj-gallery-upload"
                          className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                        >
                          <Upload size={12} />
                          <span>Selecionar Múltiplas Fotos</span>
                        </label>
                        {projImageFiles.length > 0 && (
                          <button 
                            type="button"
                            onClick={() => setProjImageFiles([])}
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                          >
                            Limpar Selecionadas
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-textSecondary leading-normal">
                        {projImageFiles.length > 0 
                          ? `${projImageFiles.length} fotos selecionadas para carregar (${projImageFiles.map(f => f.name).join(', ')})` 
                          : 'Selecione uma ou mais fotos para adicionar à galeria de pormenores.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowProjForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>{projId ? 'Guardar Alterações' : 'Criar Projeto'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Projetos em Grelha Admin */}
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div key={project.id} className="glass-panel p-5 flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-darkBg border border-darkBorder shrink-0 overflow-hidden flex items-center justify-center">
                    {project.image_url ? (
                      <img src={project.image_url} alt="" className="w-full h-full object-cover" />
                    ) : <Code size={20} className="text-slate-600" />}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h4 className="text-base font-bold text-textPrimary truncate">{project.title}</h4>
                    <p className="text-xs text-textSecondary line-clamp-2 mt-0.5 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-darkBorder/40 text-[10px] text-textSecondary font-bold">
                      <button 
                        onClick={() => {
                          setProjId(project.id);
                          setProjTitle(project.title);
                          setProjTitleEn(project.title_en || '');
                          setProjDesc(project.description);
                          setProjDescEn(project.description_en || '');
                          setProjTags(project.tags);
                          setProjDemo(project.demo_url || '');
                          setProjRepo(project.repo_url || '');
                          setProjSort(project.sort_order);
                          setProjImageUrl(project.image_url || '');
                          setProjImageFile(null);
                          setProjImages(project.images || []); // Carregar a galeria existente na edição
                          setProjImageFiles([]); // Limpar nova seleção temporária
                          setShowProjForm(true);
                        }}
                        className="text-brandBlue hover:text-indigo-400 flex items-center space-x-0.5"
                      >
                        <Edit3 size={12} />
                        <span>Editar</span>
                      </button>
                      
                      {project.image_url && (
                        <a 
                          href={project.image_url} 
                          download 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-emerald-500 hover:text-emerald-400 flex items-center space-x-0.5"
                        >
                          <Download size={12} />
                          <span>Baixar Imagem</span>
                        </a>
                      )}

                      <button 
                        onClick={() => handleProjectDelete(project.id)}
                        className="text-rose-500 hover:text-rose-400 flex items-center space-x-0.5"
                      >
                        <Trash2 size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: COMPETÊNCIAS (SKILLS)
            ============================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Todas as Competências ({skills.length})</h3>
              <button 
                onClick={() => { 
                  setSkillId(null); 
                  setSkillName(''); 
                  setSkillLevel(85); 
                  setSkillDesc('');
                  setSkillDescEn('');
                  setSkillExpTime('');
                  setSkillExpTimeEn('');
                  setSkillIcon('code');
                  setSkillImageFile(null);
                  setSkillCat('Full Stack Developer');
                  setSkillCatEn('Full Stack Developer');
                  setCustomSkillCat('');
                  setCustomSkillCatEn('');
                  setSkillSubcat('Frontend');
                  setSkillSubcatEn('Frontend');
                  setSkillSubcatType('Frontend');
                  setCustomSkillSubcat('');
                  setCustomSkillSubcatEn('');
                  setShowSkillForm(true); 
                }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Adicionar Skill</span>
              </button>
            </div>
            {showSkillForm && (
              <form onSubmit={handleSkillSubmit} className="glass-panel p-6 space-y-4 animate-slide-up">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {skillId ? 'Editar Competência' : 'Nova Competência'}
                </h4>

                {/* Grelha de formulário otimizada para 2 colunas (Nome e Ícone de forma a dar mais largura e legibilidade) */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Nome da Competência Técnica */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome</label>
                    <input 
                      type="text" required value={skillName} onChange={(e) => setSkillName(e.target.value)}
                      placeholder="React, PHP, Figma"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  {/* Configuração do Ícone (Suporta Devicon, upload de ficheiro local ou código SVG inline) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ícone (Devicon, Link, SVG ou Ficheiro)</label>
                      <a href="https://devicon.dev/" target="_blank" rel="noreferrer" className="text-[10px] text-brandBlue hover:underline flex items-center space-x-1">
                        <ExternalLink size={10} />
                        <span>Ver Ícones</span>
                      </a>
                    </div>
                    
                    {/* Contentor flexível de entrada de texto + botão para upload tátil */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input 
                        type="text" value={skillIcon} onChange={(e) => setSkillIcon(e.target.value)}
                        placeholder="devicon-react-plain, https://... ou código <svg>"
                        className="flex-1 min-w-0 bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all font-sans"
                      />
                      
                      {/* Botão de upload local com seletor invisível */}
                      <label className="shrink-0 py-3 px-4 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 hover:bg-darkSurface/80 text-textSecondary hover:text-textPrimary rounded-xl flex items-center justify-center space-x-2 text-xs font-bold cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap">
                        <Upload size={14} className="text-brandBlue shrink-0 animate-pulse" />
                        <span>Ficheiro</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSkillImageFile(file);
                              const reader = new FileReader();
                              if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
                                reader.onload = (evt) => {
                                  if (evt.target?.result) setSkillIcon(evt.target.result as string);
                                };
                                reader.readAsText(file);
                              } else {
                                reader.onload = (evt) => {
                                  if (evt.target?.result) setSkillIcon(evt.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Área de pré-visualização reativa do ícone configurado */}
                    {skillIcon && (
                      <div className="mt-2 p-3 bg-zinc-950/40 border border-white/5 rounded-xl flex items-center space-x-3 w-fit max-w-full">
                        <span className="text-[10px] uppercase font-bold text-textSecondary select-none">Pré-visualização:</span>
                        <div className="w-10 h-10 flex items-center justify-center text-2xl text-textPrimary bg-black/40 rounded-lg p-1">
                          {skillIcon.startsWith('devicon-') ? (
                            <i className={`${skillIcon} colored text-2xl`}></i>
                          ) : skillIcon.startsWith('http') || skillIcon.startsWith('/') || skillIcon.startsWith('data:image/') ? (
                            <img src={skillIcon} alt="Preview" className="w-8 h-8 object-contain" />
                          ) : skillIcon.trim().startsWith('<svg') ? (
                            <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain" dangerouslySetInnerHTML={{ __html: skillIcon }} />
                          ) : (
                            <Code size={18} className="text-textSecondary" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSkillIcon('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secção de Categoria Principal com suporte i18n em grelha de 2 colunas para PT/EN */}
                <div className="grid md:grid-cols-2 gap-4 bg-zinc-950/20 p-4 border border-darkBorder/40 rounded-2xl">
                  {/* Categoria em Português (Dropdown de presets ou opção customizada) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Categoria Principal (PT)</label>
                    <select 
                      value={skillCat} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSkillCat(val);
                        // Atualizar automaticamente a versão correspondente em inglês, mantendo o campo editável
                        if (val === 'Full Stack Developer') {
                          setSkillCatEn('Full Stack Developer');
                        } else if (val === 'Técnico Informático') {
                          setSkillCatEn('IT Technician');
                        } else if (val === 'Softskills') {
                          setSkillCatEn('Soft Skills');
                        } else {
                          setSkillCatEn('');
                        }
                      }}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    >
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Técnico Informático">Técnico Informático</option>
                      <option value="Softskills">Softskills</option>
                      <option value="Custom">Outra / Personalizada...</option>
                    </select>
                  </div>

                  {/* Categoria em Inglês (Sempre editável e configurável pelo utilizador) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Categoria Principal (EN)</label>
                      {/* Botão de tradução por IA disponível apenas ao definir categoria personalizada */}
                      {skillCat === 'Custom' && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslate(customSkillCat, setCustomSkillCatEn, 'custom_cat_en')}
                          disabled={translatingField === 'custom_cat_en'}
                          className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-bold cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {translatingField === 'custom_cat_en' ? (
                            <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span>Traduzir com IA ✨</span>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Seletor dinâmico de input com base no tipo de Categoria (Padrão ou Custom) */}
                    {skillCat === 'Custom' ? (
                      <input 
                        type="text" required value={customSkillCatEn} onChange={(e) => setCustomSkillCatEn(e.target.value)}
                        placeholder="Ex: Artificial Intelligence, Cybersecurity"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    ) : (
                      <input 
                        type="text" required value={skillCatEn} onChange={(e) => setSkillCatEn(e.target.value)}
                        placeholder="Ex: Full Stack Developer, IT Technician, Soft Skills"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    )}
                  </div>
                </div>

                {/* Input adicional exclusivamente para o nome da Categoria Personalizada em PT */}
                {skillCat === 'Custom' && (
                  <div className="space-y-2 animate-fade-in bg-zinc-950/40 p-4 border border-brandBlue/10 rounded-2xl">
                    <label className="text-xs font-semibold uppercase tracking-wider text-brandBlue">Nome da Categoria Personalizada (PT)</label>
                    <input 
                      type="text" required value={customSkillCat} onChange={(e) => setCustomSkillCat(e.target.value)}
                      placeholder="Ex: Inteligência Artificial, Cibersegurança, Línguas Estrangeiras"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                )}

                {/* Secção de Subcategoria com suporte i18n em grelha de 2 colunas para PT/EN */}
                <div className="grid md:grid-cols-2 gap-4 bg-zinc-950/20 p-4 border border-darkBorder/40 rounded-2xl">
                  {/* Subcategoria em Português (Dropdown com presets ou opção personalizada) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Subcategoria (PT)</label>
                    <select 
                      value={skillSubcatType} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSkillSubcatType(val);
                        // Atualizar automaticamente os estados de subcategoria e a sua tradução em inglês, mantendo a edição livre
                        if (val === 'Frontend') {
                          setSkillSubcat('Frontend');
                          setSkillSubcatEn('Frontend');
                        } else if (val === 'Backend') {
                          setSkillSubcat('Backend');
                          setSkillSubcatEn('Backend');
                        } else if (val === 'Bases de Dados') {
                          setSkillSubcat('Bases de Dados');
                          setSkillSubcatEn('Databases');
                        } else if (val === 'Mobile') {
                          setSkillSubcat('Mobile');
                          setSkillSubcatEn('Mobile');
                        } else if (val === 'DevOps & Cloud') {
                          setSkillSubcat('DevOps & Cloud');
                          setSkillSubcatEn('DevOps & Cloud');
                        } else if (val === 'Design & UI') {
                          setSkillSubcat('Design & UI');
                          setSkillSubcatEn('Design & UI');
                        } else if (val === 'Ferramentas') {
                          setSkillSubcat('Ferramentas');
                          setSkillSubcatEn('Tools');
                        } else if (val === 'Soft Skills') {
                          setSkillSubcat('Soft Skills');
                          setSkillSubcatEn('Soft Skills');
                        } else {
                          setSkillSubcat('');
                          setSkillSubcatEn('');
                        }
                      }}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Bases de Dados">Bases de Dados</option>
                      <option value="Mobile">Mobile (iOS / Android)</option>
                      <option value="DevOps & Cloud">DevOps & Cloud</option>
                      <option value="Design & UI">Design & UI</option>
                      <option value="Ferramentas">Ferramentas</option>
                      <option value="Soft Skills">Soft Skills</option>
                      <option value="Custom">Outra / Personalizada...</option>
                    </select>
                  </div>

                  {/* Subcategoria em Inglês (Sempre editável para máxima flexibilidade) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Subcategoria (EN)</label>
                      {/* Botão de tradução por IA disponível apenas ao definir subcategoria personalizada */}
                      {skillSubcatType === 'Custom' && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslate(customSkillSubcat, setCustomSkillSubcatEn, 'custom_subcat_en')}
                          disabled={translatingField === 'custom_subcat_en'}
                          className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-bold cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {translatingField === 'custom_subcat_en' ? (
                            <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span>Traduzir com IA ✨</span>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Seletor dinâmico de input com base no tipo de Subcategoria (Padrão ou Custom) */}
                    {skillSubcatType === 'Custom' ? (
                      <input 
                        type="text" required value={customSkillSubcatEn} onChange={(e) => setCustomSkillSubcatEn(e.target.value)}
                        placeholder="Ex: Machine Learning, Cybersecurity"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    ) : (
                      <input 
                        type="text" required value={skillSubcatEn} onChange={(e) => setSkillSubcatEn(e.target.value)}
                        placeholder="Ex: Frontend, Backend, Databases, Mobile"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    )}
                  </div>
                </div>

                {/* Input adicional exclusivamente para a Subcategoria Personalizada em PT */}
                {skillSubcatType === 'Custom' && (
                  <div className="space-y-2 animate-fade-in bg-zinc-950/40 p-4 border border-brandBlue/10 rounded-2xl">
                    <label className="text-xs font-semibold uppercase tracking-wider text-brandBlue">Nome da Subcategoria Personalizada (PT)</label>
                    <input 
                      type="text" required value={customSkillSubcat} onChange={(e) => setCustomSkillSubcat(e.target.value)}
                      placeholder="Ex: Aprendizagem Automática, Cibersegurança"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição detalhada (PT)</label>
                    <textarea 
                      rows={3} value={skillDesc} onChange={(e) => setSkillDesc(e.target.value)}
                      placeholder="Escreva aqui detalhes sobre o que desenvolve ou domina nesta tecnologia..."
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all resize-none leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição detalhada (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(skillDesc, setSkillDescEn, 'skill_desc')}
                        disabled={translatingField === 'skill_desc'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'skill_desc' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <textarea 
                      rows={3} value={skillDescEn} onChange={(e) => setSkillDescEn(e.target.value)}
                      placeholder="Detailed description in English..."
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Tempo de Experiência (PT)</label>
                    <input 
                      type="text" value={skillExpTime} onChange={(e) => setSkillExpTime(e.target.value)}
                      placeholder="Ex: 3 anos, 6 meses, Fundamentos"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Tempo de Experiência (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(skillExpTime, setSkillExpTimeEn, 'skill_exp_time')}
                        disabled={translatingField === 'skill_exp_time'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'skill_exp_time' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={skillExpTimeEn} onChange={(e) => setSkillExpTimeEn(e.target.value)}
                      placeholder="Ex: 3 years, 6 months, Basics"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-textSecondary">
                    <span>Nível de Proficiência</span>
                    <span className="text-brandBlue font-bold">{skillLevel}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={skillLevel} onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                    className="w-full accent-brandBlue"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowSkillForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Skills por Categoria */}
            <div className="space-y-4">
              {Array.from(new Set(skills.map(s => s.category))).map(category => {
                // Obter a tradução correspondente em inglês para a categoria principal a partir da primeira competência desse grupo
                const firstSkillInCat = skills.find(s => s.category === category);
                const categoryEn = firstSkillInCat?.category_en || category;
                
                return (
                  <div key={category} className="glass-panel p-6 space-y-4">
                    {/* Título do bloco com a Categoria em Português e Inglês */}
                    <h4 className="text-sm font-bold text-textPrimary border-b border-darkBorder/40 pb-2 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        {category} <span className="text-textSecondary/50 font-medium text-xs font-sans normal-case ml-2">({categoryEn})</span>
                      </span>
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {skills.filter(s => s.category === category).map(skill => (
                        <div key={skill.id} className="flex items-center justify-between bg-darkBg/60 border border-darkBorder p-4 rounded-xl">
                          <div className="flex-grow pr-4">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-semibold text-textPrimary text-sm">{skill.name}</span>
                              <span className="text-xs text-brandBlue font-bold">({skill.level}%)</span>
                              {skill.subcategory && (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                  Sub: {skill.subcategory} / {skill.subcategory_en}
                                </span>
                              )}
                              {skill.experience_time && (
                                <span className="text-[10px] bg-brandBlue/10 text-brandBlue px-2.5 py-0.5 rounded-full font-bold">
                                  {skill.experience_time}
                                </span>
                              )}
                            </div>
                            {skill.description && (
                              <p className="text-xs text-textSecondary mt-1 leading-normal line-clamp-1">{skill.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs shrink-0">
                            {/* Botão de Edição - Carrega todos os campos da BD no estado local */}
                            <button 
                              onClick={() => {
                                setSkillId(skill.id);
                                setSkillName(skill.name);
                                setSkillLevel(skill.level);
                                
                                const presets = ['Full Stack Developer', 'Técnico Informático', 'Softskills'];
                                if (presets.includes(skill.category)) {
                                  setSkillCat(skill.category);
                                  setSkillCatEn(skill.category_en || skill.category);
                                  setCustomSkillCat('');
                                  setCustomSkillCatEn('');
                                } else {
                                  setSkillCat('Custom');
                                  setCustomSkillCat(skill.category);
                                  setSkillCatEn('Custom');
                                  setCustomSkillCatEn(skill.category_en || '');
                                }

                                setSkillIcon(skill.icon || 'code');
                                setSkillImageFile(null);
                                setSkillDesc(skill.description || '');
                                setSkillDescEn(skill.description_en || '');
                                setSkillExpTime(skill.experience_time || '');
                                setSkillExpTimeEn(skill.experience_time_en || '');
                                
                                // Carregar dinamicamente a subcategoria padrão ou personalizada de acordo com os presets existentes
                                const subcatPresets = ['Frontend', 'Backend', 'Bases de Dados', 'Mobile', 'DevOps & Cloud', 'Design & UI', 'Ferramentas', 'Soft Skills'];
                                if (subcatPresets.includes(skill.subcategory || '')) {
                                  setSkillSubcatType(skill.subcategory || 'Frontend');
                                  setSkillSubcat(skill.subcategory || '');
                                  setSkillSubcatEn(skill.subcategory_en || '');
                                  setCustomSkillSubcat('');
                                  setCustomSkillSubcatEn('');
                                } else {
                                  setSkillSubcatType('Custom');
                                  setCustomSkillSubcat(skill.subcategory || '');
                                  setSkillSubcat(skill.subcategory || '');
                                  setSkillSubcatEn(skill.subcategory_en || '');
                                  setCustomSkillSubcatEn(skill.subcategory_en || '');
                                }
                                setShowSkillForm(true);
                              }}
                              className="text-textSecondary hover:text-brandBlue"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleSkillDelete(skill.id)} className="text-textSecondary hover:text-rose-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: EXPERIÊNCIA (TIMELINE)
            ============================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Linha Temporal de Experiências ({experiences.length})</h3>
              <button 
                onClick={() => { resetExpForm(); setShowExpForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Adicionar Experiência</span>
              </button>
            </div>

            {showExpForm && (
              <form onSubmit={handleExpSubmit} className="glass-panel p-6 space-y-4 animate-slide-up">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {expId ? 'Editar Experiência' : 'Nova Experiência'}
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Cargo / Título (PT)</label>
                    <input 
                      type="text" required value={expRole} onChange={(e) => setExpRole(e.target.value)}
                      placeholder="Ex: Desenvolvedor Senior"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Cargo / Título (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(expRole, setExpRoleEn, 'exp_role')}
                        disabled={translatingField === 'exp_role'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'exp_role' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" required value={expRoleEn} onChange={(e) => setExpRoleEn(e.target.value)}
                      placeholder="Ex: Senior Developer"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Empresa ou Instituição</label>
                    <input 
                      type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="Ex: Empresa Tecnica Lda"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                      <span>Empresa ou Instituição (EN)</span>
                    </label>
                    <input 
                      type="text" value={expCompanyEn} onChange={(e) => setExpCompanyEn(e.target.value)}
                      placeholder="Ex: Technical Company Ltd"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Duração / Período (PT)</label>
                    <input 
                      type="text" required value={expDuration} onChange={(e) => setExpDuration(e.target.value)}
                      placeholder="Ex: 2024 - Presente"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Duração / Período (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(expDuration, setExpDurationEn, 'exp_duration')}
                        disabled={translatingField === 'exp_duration'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'exp_duration' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={expDurationEn} onChange={(e) => setExpDurationEn(e.target.value)}
                      placeholder="Ex: 2024 - Present"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Local / Localização (PT)</label>
                    <input 
                      type="text" value={expLocation} onChange={(e) => setExpLocation(e.target.value)}
                      placeholder="Ex: Remoto, Lisboa"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Local / Localização (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(expLocation, setExpLocationEn, 'exp_location')}
                        disabled={translatingField === 'exp_location'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'exp_location' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={expLocationEn} onChange={(e) => setExpLocationEn(e.target.value)}
                      placeholder="Ex: Remote, Lisbon"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ProfessionalEditor
                      label="Descrição das Responsabilidades (PT)"
                      value={expDesc}
                      onChange={(val) => setExpDesc(val)}
                      placeholder="Descreva as suas conquistas, tecnologias dominadas e responsabilidades neste cargo profissional..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição das Responsabilidades (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(expDesc, setExpDescEn, 'exp_desc')}
                        disabled={translatingField === 'exp_desc'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'exp_desc' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={expDescEn}
                      onChange={(val) => setExpDescEn(val)}
                      placeholder="Describe your achievements, mastered technologies, and responsibilities in English..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-4">
                  <div className="space-y-2 max-w-xs">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Exibição</label>
                    <input 
                      type="number" value={expSort} onChange={(e) => setExpSort(parseInt(e.target.value) || 0)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Logótipo da Empresa ou Certificado</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg relative group">
                      {expImage ? (
                        <img src={URL.createObjectURL(expImage)} alt="Preview Logótipo" className="w-full h-full object-cover" />
                      ) : expImageUrl ? (
                        <img src={expImageUrl} alt="Logótipo Atual" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={24} className="text-textSecondary" />
                      )}
                      
                      {!expImage && expImageUrl && (
                        <a 
                          href={expImageUrl} 
                          download={`experiencia_${expId || 'nova'}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-brandBlue hover:text-indigo-400 transition-all animate-fade-in"
                          title="Descarregar Logótipo"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setExpImage(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="exp-image-upload"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label 
                          htmlFor="exp-image-upload"
                          className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                        >
                          <Upload size={12} />
                          <span>Selecionar Imagem</span>
                        </label>
                        {expImage && (
                          <button 
                            type="button"
                            onClick={() => setExpImage(null)}
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                          >
                            Remover Seleção
                          </button>
                        )}
                        {!expImage && expImageUrl && (
                          <a 
                            href={expImageUrl} 
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/40 text-textSecondary hover:text-brandBlue rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                          >
                            <Download size={12} />
                            <span>Baixar Atual</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-textSecondary truncate">
                        {expImage ? `Ficheiro local: ${expImage.name}` : expImageUrl ? `Caminho DB: ${expImageUrl}` : 'Nenhuma imagem selecionada.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowExpForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Linha Temporal */}
            <div className="space-y-4">
              {experiences.map(exp => (
                <div key={exp.id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-darkBg border border-darkBorder shrink-0 overflow-hidden flex items-center justify-center">
                      {exp.image_url ? (
                        <img src={exp.image_url} alt="" className="w-full h-full object-cover" />
                      ) : <Briefcase size={20} className="text-slate-600" />}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-full text-textSecondary font-bold uppercase tracking-widest">{exp.duration}</span>
                      <h4 className="text-lg font-bold text-textPrimary pt-1">{exp.role}</h4>
                      <p className="text-xs font-semibold text-brandBlue">{exp.company}{exp.location && ` (${exp.location})`}</p>
                      <p className="text-xs text-textSecondary leading-relaxed mt-2 max-w-2xl">{exp.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs border-t md:border-t-0 border-darkBorder/40 pt-3 md:pt-0 shrink-0 font-bold">
                    <button 
                      onClick={() => {
                        setExpId(exp.id);
                        setExpRole(exp.role);
                        setExpRoleEn(exp.role_en || '');
                        setExpCompany(exp.company);
                        setExpCompanyEn(exp.company_en || '');
                        setExpDuration(exp.duration);
                        setExpDurationEn(exp.duration_en || '');
                        setExpLocation(exp.location || '');
                        setExpLocationEn(exp.location_en || '');
                        setExpDesc(exp.description);
                        setExpDescEn(exp.description_en || '');
                        setExpSort(exp.sort_order);
                        setExpImage(null);
                        setExpImageUrl(exp.image_url || '');
                        setShowExpForm(true);
                      }}
                      className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>
                    
                    {exp.image_url && (
                      <a 
                        href={exp.image_url} 
                        download 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-500 hover:text-emerald-400 flex items-center space-x-0.5"
                      >
                        <Download size={14} />
                        <span>Baixar</span>
                      </a>
                    )}

                    <button 
                      onClick={() => handleExpDelete(exp.id)}
                      className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: EDUCAÇÃO (FORMAÇÃO ACADÉMICA)
            ============================================================= */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Cursos e Formações Académicas ({education.length})</h3>
              <button 
                onClick={() => { resetEduForm(); setShowEduForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Adicionar Formação</span>
              </button>
            </div>

            {showEduForm && (
              <form onSubmit={handleEduSubmit} className="glass-panel p-6 space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {eduId ? 'Editar Formação Académica' : 'Nova Formação Académica'}
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Curso / Diploma (PT)</label>
                    <input 
                      type="text" required value={eduDegree} onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="Ex: Licenciatura em Engenharia Informática"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Curso / Diploma (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(eduDegree, setEduDegreeEn, 'edu_degree')}
                        disabled={translatingField === 'edu_degree'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'edu_degree' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" required value={eduDegreeEn} onChange={(e) => setEduDegreeEn(e.target.value)}
                      placeholder="Ex: Bachelor's Degree in Computer Engineering"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Escola / Universidade</label>
                    <input 
                      type="text" required value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)}
                      placeholder="Ex: Universidade de Lisboa"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                      <span>Escola / Universidade (EN)</span>
                    </label>
                    <input 
                      type="text" value={eduInstitutionEn} onChange={(e) => setEduInstitutionEn(e.target.value)}
                      placeholder="Ex: University of Lisbon"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Duração / Período (PT)</label>
                    <input 
                      type="text" required value={eduDuration} onChange={(e) => setEduDuration(e.target.value)}
                      placeholder="Ex: 2021 - 2024"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Duração / Período (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(eduDuration, setEduDurationEn, 'edu_duration')}
                        disabled={translatingField === 'edu_duration'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'edu_duration' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={eduDurationEn} onChange={(e) => setEduDurationEn(e.target.value)}
                      placeholder="Ex: 2021 - 2024"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Local / Localização (PT)</label>
                    <input 
                      type="text" value={eduLocation} onChange={(e) => setEduLocation(e.target.value)}
                      placeholder="Ex: Coimbra, Portugal"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Local / Localização (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(eduLocation, setEduLocationEn, 'edu_location')}
                        disabled={translatingField === 'edu_location'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'edu_location' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={eduLocationEn} onChange={(e) => setEduLocationEn(e.target.value)}
                      placeholder="Ex: Coimbra, Portugal"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Tipo de Ensino</label>
                    <select 
                      value={eduType} onChange={(e) => setEduType(e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    >
                      <option value="Ensino Superior">Ensino Superior</option>
                      <option value="Formação Técnica">Formação Técnica</option>
                      <option value="Ensino Secundário">Ensino Secundário</option>
                      <option value="Curso Profissional">Curso Profissional</option>
                      <option value="Certificação">Certificação</option>
                      <option value="Outro">Outro / Personalizado...</option>
                    </select>
                  </div>

                  {eduType === 'Outro' ? (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome do Tipo Personalizado</label>
                      <input 
                        type="text" required value={customEduType} onChange={(e) => setCustomEduType(e.target.value)}
                        placeholder="Ex: Pós-Graduação"
                        className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                      />
                    </div>
                  ) : (
                    <div></div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Exibição</label>
                    <input 
                      type="number" value={eduSort} onChange={(e) => setEduSort(parseInt(e.target.value) || 0)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Tipo de Ensino (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(eduType === 'Outro' ? customEduType : eduType, setEduTypeEn, 'edu_type_en')}
                        disabled={translatingField === 'edu_type_en'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'edu_type_en' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={eduTypeEn} onChange={(e) => setEduTypeEn(e.target.value)}
                      placeholder="Ex: Higher Education"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Link de Referência / Certificado</label>
                    <input 
                      type="url" value={eduLink} onChange={(e) => setEduLink(e.target.value)}
                      placeholder="Ex: https://certificados.com/meu-diploma"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ProfessionalEditor
                      label="Descrição do Curso / Detalhes (PT)"
                      value={eduDesc}
                      onChange={(val) => setEduDesc(val)}
                      placeholder="Indique as suas conquistas escolares, projetos académicos dignos de nota e média final..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição do Curso / Detalhes (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(eduDesc, setEduDescEn, 'edu_desc')}
                        disabled={translatingField === 'edu_desc'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'edu_desc' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={eduDescEn}
                      onChange={(val) => setEduDescEn(val)}
                      placeholder="Describe your achievements, academic projects, and final GPA in English..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Logótipo da Escola ou Diploma</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg relative group">
                      {eduImage ? (
                        <img src={URL.createObjectURL(eduImage)} alt="Preview Escola" className="w-full h-full object-cover" />
                      ) : eduImageUrl ? (
                        <img src={eduImageUrl} alt="Logótipo Escola Atual" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={24} className="text-textSecondary" />
                      )}
                      
                      {!eduImage && eduImageUrl && (
                        <a 
                          href={eduImageUrl} 
                          download={`educacao_${eduId || 'nova'}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-brandBlue hover:text-indigo-400 transition-all animate-fade-in"
                          title="Descarregar Logótipo"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEduImage(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="edu-image-upload"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label 
                          htmlFor="edu-image-upload"
                          className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                        >
                          <Upload size={12} />
                          <span>Selecionar Imagem</span>
                        </label>
                        {eduImage && (
                          <button 
                            type="button"
                            onClick={() => setEduImage(null)}
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                          >
                            Remover Seleção
                          </button>
                        )}
                        {!eduImage && eduImageUrl && (
                          <a 
                            href={eduImageUrl} 
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/40 text-textSecondary hover:text-brandBlue rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                          >
                            <Download size={12} />
                            <span>Baixar Atual</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-textSecondary truncate">
                        {eduImage ? `Ficheiro local: ${eduImage.name}` : eduImageUrl ? `Caminho DB: ${eduImageUrl}` : 'Nenhuma imagem selecionada.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowEduForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Formações Académicas */}
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-darkBg border border-darkBorder shrink-0 overflow-hidden flex items-center justify-center">
                      {edu.image_url ? (
                        <img src={edu.image_url} alt="" className="w-full h-full object-cover" />
                      ) : <Briefcase size={20} className="text-slate-600" />}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-full text-textSecondary font-bold uppercase tracking-widest">{edu.duration}</span>
                      <h4 className="text-lg font-bold text-textPrimary pt-1">{edu.degree}</h4>
                      <p className="text-xs font-semibold text-brandBlue">{edu.institution}{edu.location && ` (${edu.location})`}</p>
                      <p className="text-xs text-textSecondary leading-relaxed mt-2 max-w-2xl">{edu.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs border-t md:border-t-0 border-darkBorder/40 pt-3 md:pt-0 shrink-0 font-bold">
                    <button 
                      onClick={() => {
                        setEduId(edu.id);
                        setEduDegree(edu.degree);
                        setEduDegreeEn(edu.degree_en || '');
                        setEduInstitution(edu.institution);
                        setEduInstitutionEn(edu.institution_en || '');
                        setEduDuration(edu.duration);
                        setEduDurationEn(edu.duration_en || '');
                        setEduLocation(edu.location || '');
                        setEduLocationEn(edu.location_en || '');
                        setEduTypeEn(edu.education_type_en || '');
                        setEduLink(edu.link_url || '');
                        
                        const presets = ['Ensino Superior', 'Formação Técnica', 'Ensino Secundário', 'Curso Profissional', 'Certificação'];
                        if (edu.education_type && presets.includes(edu.education_type)) {
                          setEduType(edu.education_type);
                          setCustomEduType('');
                        } else {
                          setEduType('Outro');
                          setCustomEduType(edu.education_type || '');
                        }

                        setEduDesc(edu.description);
                        setEduSort(edu.sort_order);
                        setEduImage(null);
                        setEduImageUrl(edu.image_url || '');
                        setShowEduForm(true);
                      }}
                      className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>
                    
                    {edu.image_url && (
                      <a 
                        href={edu.image_url} 
                        download 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-500 hover:text-emerald-400 flex items-center space-x-0.5"
                      >
                        <Download size={14} />
                        <span>Baixar</span>
                      </a>
                    )}

                    <button 
                      onClick={() => handleEduDelete(edu.id)}
                      className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: GERIR BLOG (Markdown Blog CRUD)
            ============================================================= */}
        {activeTab === 'blog' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Artigos do Blog ({blogPosts.length})</h3>
              <button 
                onClick={() => { resetBlogForm(); setShowBlogForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Novo Artigo</span>
              </button>
            </div>

            {showBlogForm && (
              <form onSubmit={handleBlogPostSubmit} className="glass-panel p-6 space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {blogId ? 'Editar Artigo de Blog' : 'Criar Novo Artigo'}
                </h4>

                {/* TÍTULO DO ARTIGO (PT / EN) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Título do Artigo (PT)</label>
                    <input 
                      type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Ex: Guia Prático de Redes e Roteamento"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Título do Artigo (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(blogTitle, setBlogTitleEn, 'blog_title')}
                        disabled={translatingField === 'blog_title'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                        title="Traduzir com IA ✨"
                      >
                        {translatingField === 'blog_title' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={blogTitleEn} onChange={(e) => setBlogTitleEn(e.target.value)}
                      placeholder="Ex: Practical Guide to Networks and Routing"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                {/* SLUG E ESTADO DO ARTIGO */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Slug (URL Amigável)</label>
                    <input 
                      type="text" value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)}
                      placeholder="Ex: guia-pratico-redes"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Estado do Artigo</label>
                    <select 
                      value={blogStatus} onChange={(e) => setBlogStatus(e.target.value as any)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>
                </div>

                {/* EXCERTO / RESUMO DO ARTIGO (PT / EN) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Excerto / Resumo (PT)</label>
                    <input 
                      type="text" value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="Breve resumo a figurar na grelha de cartões..."
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Excerto / Resumo (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(blogExcerpt, setBlogExcerptEn, 'blog_excerpt')}
                        disabled={translatingField === 'blog_excerpt'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                        title="Traduzir com IA ✨"
                      >
                        {translatingField === 'blog_excerpt' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" value={blogExcerptEn} onChange={(e) => setBlogExcerptEn(e.target.value)}
                      placeholder="Brief excerpt in English for list card..."
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                {/* CORPO DO ARTIGO / CONTEÚDO MARKDOWN (PT / EN) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ProfessionalEditor
                      label="Corpo do Artigo (PT - Markdown)"
                      value={blogContent}
                      onChange={(val) => setBlogContent(val)}
                      placeholder="Escreva o seu artigo utilizando Markdown... Utilize os atalhos superiores para formatar."
                      rows={12}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Corpo do Artigo (EN - Markdown)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(blogContent, setBlogContentEn, 'blog_content')}
                        disabled={translatingField === 'blog_content'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                        title="Traduzir com IA ✨"
                      >
                        {translatingField === 'blog_content' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={blogContentEn}
                      onChange={(val) => setBlogContentEn(val)}
                      placeholder="Write your article body in English using Markdown..."
                      rows={12}
                    />
                  </div>
                </div>

                {/* UPLOAD DA IMAGEM DE CAPA */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Imagem de Capa (URL ou Upload)</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg relative group">
                      {blogImageFile ? (
                        <img src={URL.createObjectURL(blogImageFile)} alt="Preview Capa" className="w-full h-full object-cover" />
                      ) : blogImageUrl ? (
                        <img src={blogImageUrl} alt="Capa Atual" className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={28} className="text-textSecondary" />
                      )}
                    </div>
                    
                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <div className="flex flex-col space-y-2">
                        <input 
                          type="text" value={blogImageUrl} onChange={(e) => setBlogImageUrl(e.target.value)}
                          placeholder="Link direto da imagem (Opcional)"
                          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                        />
                        <span className="text-[10px] text-textSecondary block text-center">OU</span>
                        <input 
                          type="file" accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setBlogImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="blog-capa-upload"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label 
                            htmlFor="blog-capa-upload"
                            className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                          >
                            <Upload size={12} />
                            <span>Carregar Ficheiro</span>
                          </label>
                          {blogImageFile && (
                            <button 
                              type="button" onClick={() => setBlogImageFile(null)}
                              className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                            >
                              Remover Upload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowBlogForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Posts */}
            <div className="space-y-4">
              {blogPosts.map(post => (
                <div key={post.id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-darkSurface/20">
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className="w-16 h-12 rounded-xl bg-darkBg border border-darkBorder shrink-0 overflow-hidden flex items-center justify-center">
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                      ) : <FileText size={20} className="text-slate-600" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] border px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                          post.status === 'published' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                        }`}>
                          {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span className="text-[10px] text-textSecondary font-mono">{new Date(post.created_at).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <h4 className="text-base font-bold text-textPrimary pt-1 truncate">{post.title}</h4>
                      <p className="text-xs text-textSecondary leading-normal line-clamp-1">{post.excerpt || 'Sem excerto definido.'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs border-t md:border-t-0 border-darkBorder/40 pt-3 md:pt-0 shrink-0 font-bold">
                    <button 
                      onClick={() => {
                        setBlogId(post.id);
                        setBlogTitle(post.title);
                        setBlogTitleEn(post.title_en || '');
                        setBlogSlug(post.slug);
                        setBlogContent(post.content);
                        setBlogContentEn(post.content_en || '');
                        setBlogExcerpt(post.excerpt || '');
                        setBlogExcerptEn(post.excerpt_en || '');
                        setBlogStatus(post.status);
                        setBlogImageFile(null);
                        setBlogImageUrl(post.image_url || '');
                        setShowBlogForm(true);
                      }}
                      className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>

                    <button 
                      onClick={() => handleBlogPostDelete(post.id)}
                      className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: GERIR HOBBIES
            ============================================================= */}
        {activeTab === 'hobbies' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">Passatempos & Hobbies ({hobbies.length})</h3>
              <button 
                onClick={() => { resetHobbyForm(); setShowHobbyForm(true); }}
                className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all hover:shadow-lg hover:shadow-brandBlue/10"
              >
                <Plus size={14} />
                <span>Novo Hobby</span>
              </button>
            </div>

            {showHobbyForm && (
              <form onSubmit={handleHobbySubmit} className="glass-panel p-6 space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider pb-2 border-b border-darkBorder">
                  {hobbyId ? 'Editar Passatempo' : 'Novo Passatempo'}
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome do Hobby (PT)</label>
                    <input 
                      type="text" required value={hobbyName} onChange={(e) => setHobbyName(e.target.value)}
                      placeholder="Ex: Gaming ou Fotografia"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome do Hobby (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(hobbyName, setHobbyNameEn, 'hobby_name')}
                        disabled={translatingField === 'hobby_name'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'hobby_name' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <input 
                      type="text" required value={hobbyNameEn} onChange={(e) => setHobbyNameEn(e.target.value)}
                      placeholder="Ex: Gaming or Photography"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nome do Ícone Lucide</label>
                    <input 
                      type="text" required value={hobbyIcon} onChange={(e) => setHobbyIcon(e.target.value)}
                      placeholder="Ex: Gamepad2, Camera, Cpu, Terminal"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Ordem de Ordenação</label>
                    <input 
                      type="number" value={hobbySort} onChange={(e) => setHobbySort(parseInt(e.target.value) || 0)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ProfessionalEditor
                      label="Descrição do Hobby (PT)"
                      value={hobbyDesc}
                      onChange={(val) => setHobbyDesc(val)}
                      placeholder="Descreva a história e os pormenores enriquecedores deste hobby..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Descrição do Hobby (EN)</label>
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(hobbyDesc, setHobbyDescEn, 'hobby_desc')}
                        disabled={translatingField === 'hobby_desc'}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all flex items-center space-x-1 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {translatingField === 'hobby_desc' ? (
                          <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>✨ Traduzir com IA</span>
                        )}
                      </button>
                    </div>
                    <ProfessionalEditor
                      label=""
                      value={hobbyDescEn}
                      onChange={(val) => setHobbyDescEn(val)}
                      placeholder="Describe the history and details of this hobby in English..."
                      rows={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block">Imagem Ilustrativa (Opcional)</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center bg-darkBg/60 border border-darkBorder p-5 rounded-2xl gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-darkBg border border-darkBorder shrink-0 flex items-center justify-center shadow-lg relative group">
                      {hobbyImageFile ? (
                        <img src={URL.createObjectURL(hobbyImageFile)} alt="Preview Hobby" className="w-full h-full object-cover" />
                      ) : hobbyImageUrl ? (
                        <img src={hobbyImageUrl} alt="Imagem Hobby Atual" className="w-full h-full object-cover" />
                      ) : (
                        <Heart size={24} className="text-textSecondary" />
                      )}
                    </div>
                    
                    <div className="flex-grow w-full md:w-auto space-y-3 min-w-0">
                      <div className="flex flex-col space-y-2">
                        <input 
                          type="text" value={hobbyImageUrl} onChange={(e) => setHobbyImageUrl(e.target.value)}
                          placeholder="Link da foto (Opcional)"
                          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                        />
                        <span className="text-[10px] text-textSecondary block text-center">OU</span>
                        <input 
                          type="file" accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setHobbyImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="hobby-imagem-upload"
                        />
                        <div className="flex flex-wrap gap-2">
                          <label 
                            htmlFor="hobby-imagem-upload"
                            className="px-4 py-2 bg-darkSurface border border-darkBorder hover:border-brandBlue/45 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 w-fit"
                          >
                            <Upload size={12} />
                            <span>Carregar Ficheiro</span>
                          </label>
                          {hobbyImageFile && (
                            <button 
                              type="button" onClick={() => setHobbyImageFile(null)}
                              className="px-3 py-2 bg-darkSurface border border-darkBorder hover:border-rose-500/40 text-textSecondary hover:text-rose-400 rounded-xl text-xs font-bold transition-all"
                            >
                              Remover Upload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" onClick={() => setShowHobbyForm(false)}
                    className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Hobbies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hobbies.map(hobby => {
                // Resolver dinamicamente o ícone a partir de LucideIcons
                const IconComponent = (LucideIcons as any)[hobby.icon];
                return (
                  <div key={hobby.id} className="glass-panel p-6 flex items-center justify-between gap-4 bg-darkSurface/20">
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-darkBg border border-darkBorder shrink-0 overflow-hidden flex items-center justify-center text-cyan-400 p-1">
                        {hobby.image_url ? (
                          <img src={hobby.image_url} alt="" className="w-full h-full object-cover" />
                        ) : IconComponent ? (
                          <IconComponent size={20} />
                        ) : (
                          <Heart size={20} />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-full text-textSecondary font-bold uppercase tracking-widest">Ordem: {hobby.sort_order}</span>
                          <span className="text-[10px] text-brandBlue font-mono">Ícone: {hobby.icon}</span>
                        </div>
                        <h4 className="text-base font-bold text-textPrimary pt-1 truncate">{hobby.name}</h4>
                        <p className="text-xs text-textSecondary leading-normal line-clamp-2">
                          {hobby.description ? hobby.description.replace(/<[^>]*>/g, '') : 'Sem descrição.'}
                        </p>
                      </div>
                    </div>

                  <div className="flex flex-col items-end gap-3 text-xs shrink-0 font-bold">
                    <button 
                      onClick={() => {
                        setHobbyId(hobby.id);
                        setHobbyName(hobby.name);
                        setHobbyNameEn(hobby.name_en || '');
                        setHobbyDesc(hobby.description);
                        setHobbyDescEn(hobby.description_en || '');
                        setHobbyIcon(hobby.icon);
                        setHobbyImageFile(null);
                        setHobbyImageUrl(hobby.image_url || '');
                        setHobbySort(hobby.sort_order);
                        setShowHobbyForm(true);
                      }}
                      className="text-textSecondary hover:text-brandBlue flex items-center space-x-0.5"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>

                    <button 
                      onClick={() => handleHobbyDelete(hobby.id)}
                      className="text-textSecondary hover:text-rose-500 flex items-center space-x-0.5"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ); // Fim do retorno do elemento JSX de cada Hobby
            })}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB: INBOX / MENSAGENS
            ============================================================= */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-textPrimary border-b border-darkBorder/40 pb-3">Caixa de Entrada</h3>

            {messages.length > 0 ? (
              <div className="space-y-4 animate-slide-up">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`glass-panel p-6 space-y-4 border-l-4 transition-all ${
                      msg.is_read ? 'border-l-darkBorder bg-darkSurface/30' : 'border-l-brandBlue bg-darkSurface/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-darkBorder pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-textPrimary">{msg.name}</h4>
                          {!msg.is_read && (
                            <span className="bg-brandBlue/10 text-brandBlue text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Nova</span>
                          )}
                        </div>
                        <p className="text-xs text-textSecondary mt-0.5">
                          Remetente: <a href={`mailto:${msg.email}`} className="text-brandBlue hover:underline">{msg.email}</a>
                        </p>
                      </div>
                      
                      <span className="text-[10px] text-textSecondary font-semibold uppercase">
                        {new Date(msg.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-textSecondary">
                        Assunto: <span className="text-textPrimary">{msg.subject}</span>
                      </p>
                      <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl text-sm text-textSecondary leading-relaxed white-space-pre-wrap">
                        {msg.message}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 text-xs font-semibold pt-1">
                      <button 
                        onClick={() => {
                          if (replyingToId === msg.id) {
                            setReplyingToId(null);
                            setReplyText('');
                          } else {
                            setReplyingToId(msg.id);
                            setReplyText('');
                          }
                        }}
                        className="text-textSecondary hover:text-brandBlue flex items-center space-x-1"
                      >
                        <CornerUpLeft size={14} />
                        <span>{replyingToId === msg.id ? 'Cancelar' : 'Responder'}</span>
                      </button>

                      <button 
                        onClick={() => handleMessageStatusChange(msg.id, msg.is_read ? 0 : 1)}
                        className="text-textSecondary hover:text-brandBlue flex items-center space-x-1"
                      >
                        {msg.is_read ? (
                          <>
                            <EyeOff size={14} />
                            <span>Marcar Não Lida</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            <span>Marcar como Lida</span>
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => handleMessageDelete(msg.id)}
                        className="text-rose-500 hover:text-rose-400 flex items-center space-x-1"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    {/* Formulario interativo Cyberpunk/OLED de Resposta por Email */}
                    {replyingToId === msg.id && (
                      <form onSubmit={(e) => handleSendReply(e, msg.id)} className="space-y-4 border-t border-darkBorder/40 pt-4 mt-3 animate-slide-up">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-textSecondary">
                          <span className="text-brandBlue flex items-center space-x-1.5">
                            <CornerUpLeft size={12} />
                            <span>Responder a {msg.name} ({msg.email})</span>
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <ProfessionalEditor
                            value={replyText}
                            onChange={(val) => setReplyText(val)}
                            placeholder="Escreva a sua resposta de e-mail utilizando formatação avançada (Markdown/Rich Text)..."
                            rows={4}
                          />
                        </div>

                        <div className="flex justify-end space-x-3 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 border border-darkBorder text-textSecondary hover:text-textPrimary rounded-xl font-semibold transition-all"
                            disabled={sendingReply}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-textPrimary rounded-xl font-semibold flex items-center space-x-1.5 transition-all shadow-md hover:shadow-brandBlue/10"
                            disabled={sendingReply}
                          >
                            {sendingReply ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>A Enviar...</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>Enviar E-mail</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 glass-panel">
                <p className="text-textSecondary">A sua caixa de entrada está limpa de mensagens.</p>
              </div>
            )}
          </div>
        )}

        {/* 8. SEPARADOR DE ESTATÍSTICAS DE TRÁFEGO (RGPD COMPLIANT) */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fade-in text-textPrimary">
            
            {/* Barra de Controlo de Filtro de Período Dinâmico */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950/40 border border-white/5 p-6 rounded-3xl shrink-0 backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-block">
                  Painel de Tráfego
                </span>
                <h4 className="text-lg font-black tracking-tight font-display uppercase">Análise de Atividade do Portfólio</h4>
                <p className="text-xs text-textSecondary font-medium">Controlo e monitorização anónima em conformidade estrita com o RGPD.</p>
              </div>
              
              {/* Comutador em Pílula Cyberpunk */}
              <div className="flex items-center space-x-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/5 shrink-0 self-end sm:self-center">
                {(['7', '30', '90'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setStatsRange(r);
                      setActivePointIndex(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-300 ${
                      statsRange === r
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
                        : 'text-textSecondary hover:text-textPrimary bg-transparent border border-transparent'
                    }`}
                  >
                    {r === '7' ? '7 Dias' : r === '30' ? '30 Dias' : '90 Dias'}
                  </button>
                ))}
              </div>
            </div>

            {loadingStats ? (
              <div className="text-center py-24 glass-panel flex flex-col items-center justify-center space-y-4 bg-zinc-950/20 border border-white/5 rounded-[2rem]">
                <div className="w-12 h-12 border-2 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest text-textSecondary font-mono">A ler a atividade em tempo real no servidor...</p>
              </div>
            ) : statsData ? (
              <>
                {/* A. Bento Grid de 5 KPIs Globais e do Período */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  
                  {/* Cartão 1: Visitas Acumuladas */}
                  <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md flex items-center justify-between rounded-3xl group hover:border-indigo-500/20 transition-all duration-500">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Visitas Acumuladas</span>
                      <h3 className="text-3xl font-extrabold text-textPrimary tracking-tight truncate group-hover:text-indigo-400 transition-colors">
                        {statsData.kpis.totalVisits.toLocaleString('pt-PT')}
                      </h3>
                      <p className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">Histórico Total</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <BarChart2 size={22} />
                    </div>
                  </div>

                  {/* Cartão 2: Visitas no Período */}
                  <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md flex items-center justify-between rounded-3xl group hover:border-cyan-500/20 transition-all duration-500">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">No Período ({statsRange}D)</span>
                      <h3 className="text-3xl font-extrabold text-cyan-400 tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                        {statsData.kpis.periodVisits.toLocaleString('pt-PT')}
                      </h3>
                      <p className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider">Acessos Filtrados</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Activity size={22} />
                    </div>
                  </div>

                  {/* Cartão 3: Visitas Hoje */}
                  <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md flex items-center justify-between rounded-3xl group hover:border-emerald-500/20 transition-all duration-500">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Visitas Hoje</span>
                      <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight truncate group-hover:text-emerald-300 transition-colors">
                        {statsData.kpis.todayVisits.toLocaleString('pt-PT')}
                      </h3>
                      <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">Utilizadores Ativos</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <User size={22} />
                    </div>
                  </div>

                  {/* Cartão 4: Média Diária */}
                  <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md flex items-center justify-between rounded-3xl group hover:border-amber-500/20 transition-all duration-500">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Média Diária</span>
                      <h3 className="text-3xl font-extrabold text-amber-400 tracking-tight truncate group-hover:text-amber-300 transition-colors">
                        {statsData.kpis.dailyAverage.toLocaleString('pt-PT')}
                      </h3>
                      <p className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">Visitas Diárias</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Sliders size={22} />
                    </div>
                  </div>

                  {/* Cartão 5: Subscritores da Newsletter (Integração Brevo API v3) */}
                  <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md flex items-center justify-between rounded-3xl group hover:border-purple-500/20 transition-all duration-500">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Newsletter</span>
                      <h3 className="text-3xl font-extrabold text-purple-400 tracking-tight truncate group-hover:text-purple-300 transition-colors">
                        {(statsData.kpis.newsletterSubscribers ?? 0).toLocaleString('pt-PT')}
                      </h3>
                      <p className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider">Subscritores Ativos</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Mail size={22} />
                    </div>
                  </div>
                </div>

                {/* B. Gráfico de Evolução Semanal/Mensal (SVG Cyberpunk com Tooltip Integrado) */}
                <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md space-y-6 rounded-[2rem] relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide flex items-center space-x-2">
                        <TrendingUp size={16} className="text-indigo-400" />
                        <span>Curva de Acessos Temporais</span>
                      </h4>
                      <p className="text-xs text-textSecondary">Visualização cronológica de visitas acumuladas por data.</p>
                    </div>
                    <button 
                      onClick={() => fetchStats(statsRange)}
                      className="text-xs px-3.5 py-2 bg-zinc-900 hover:bg-white/5 border border-white/5 hover:border-indigo-500/35 text-textSecondary hover:text-textPrimary rounded-xl transition-all font-semibold"
                    >
                      Atualizar
                    </button>
                  </div>

                  {/* Renderização Reativa do Gráfico SVG */}
                  <div className="w-full overflow-hidden relative pt-6">
                    {(() => {
                      const width = 850;
                      const height = 260;
                      const paddingX = 50;
                      const paddingY = 40;
                      const chartW = width - paddingX * 2;
                      const chartH = height - paddingY * 2;

                      const maxVal = Math.max(...statsData.activity.map(a => a.visits), 1);
                      // Ajustar o máximo para dar uma folga de topo elegante no gráfico
                      const gridMax = Math.ceil(maxVal * 1.15);

                      // Mapeamento cronológico de coordenadas (x, y)
                      const points = statsData.activity.map((item, idx) => {
                        const x = paddingX + (idx * chartW) / (statsData.activity.length - 1);
                        const y = height - paddingY - (item.visits / gridMax) * chartH;
                        return { x, y, label: item.date, val: item.visits };
                      });

                      // Desenhar o caminho vetorial principal da linha (path D)
                      const pathD = points.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                      }, '');

                      // Desenhar a área vetorial sombreada sob a linha (area D)
                      const areaD = points.length > 0 
                        ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
                        : '';

                      return (
                        <div className="relative">
                          {/* Tooltip Dinâmico Reativo em Vidro OLED */}
                          {activePointIndex !== null && points[activePointIndex] && (
                            <div 
                              className="absolute z-25 bg-zinc-950/95 border border-indigo-500/30 text-white p-3 rounded-2xl shadow-2xl text-[10px] space-y-1 backdrop-blur-md pointer-events-none transition-all duration-150 animate-scale-up"
                              style={{ 
                                left: `${(points[activePointIndex].x / width) * 100}%`, 
                                top: `${(points[activePointIndex].y / height) * 100 - 18}%`,
                                transform: 'translate(-50%, -100%)'
                              }}
                            >
                              <span className="text-textSecondary block font-bold font-mono">Data: {statsData.activity[activePointIndex].date}</span>
                              <span className="text-indigo-400 block font-black text-xs">
                                {statsData.activity[activePointIndex].visits} {statsData.activity[activePointIndex].visits === 1 ? 'Visita' : 'Visitas'}
                              </span>
                            </div>
                          )}

                          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                            <defs>
                              {/* Gradiente de linha fluorescente HSL */}
                              <linearGradient id="neonGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                              {/* Gradiente de preenchimento de área */}
                              <linearGradient id="neonFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                              </linearGradient>
                              {/* Filtro de desfoque néon (glow) */}
                              <filter id="neonBlurGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="6" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            {/* Grelha de Linhas Horizontais de Referência */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                              const y = paddingY + ratio * chartH;
                              const val = Math.round(gridMax * (1 - ratio));
                              return (
                                <g key={idx} className="opacity-15">
                                  <line 
                                    x1={paddingX} 
                                    y1={y} 
                                    x2={width - paddingX} 
                                    y2={y} 
                                    stroke="#52525b" 
                                    strokeWidth="0.8" 
                                    strokeDasharray="4 4" 
                                  />
                                  <text 
                                    x={paddingX - 12} 
                                    y={y + 3.5} 
                                    fill="#a1a1aa" 
                                    fontSize="9" 
                                    textAnchor="end"
                                    className="font-bold font-mono"
                                  >
                                    {val}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Linhas Verticais de Referência Baseadas no Filtro */}
                            {points.map((p, idx) => {
                              // Filtrar a densidade de linhas verticais para evitar poluição visual
                              const shouldShowLine = 
                                statsRange === '7' || 
                                (statsRange === '30' && idx % 5 === 0) || 
                                (statsRange === '90' && idx % 15 === 0);

                              if (!shouldShowLine) return null;

                              return (
                                <line
                                  key={`v-line-${idx}`}
                                  x1={p.x}
                                  y1={paddingY}
                                  x2={p.x}
                                  y2={height - paddingY}
                                  stroke="#27272a"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                  className="opacity-45"
                                />
                              );
                            })}

                            {/* Preenchimento Dinâmico sob a Linha */}
                            {areaD && (
                              <path d={areaD} fill="url(#neonFadeGrad)" className="animate-fade-in" />
                            )}

                            {/* Linha Principal Néon com Glow */}
                            {pathD && (
                              <path 
                                d={pathD} 
                                fill="none" 
                                stroke="url(#neonGlowGrad)" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                filter="url(#neonBlurGlow)"
                              />
                            )}

                            {/* Linha Vertical Auxiliar de Hover */}
                            {activePointIndex !== null && points[activePointIndex] && (
                              <line 
                                x1={points[activePointIndex].x} 
                                y1={paddingY} 
                                x2={points[activePointIndex].x} 
                                y2={height - paddingY} 
                                stroke="rgba(99,102,241,0.4)" 
                                strokeWidth="1.5" 
                                strokeDasharray="3 3" 
                              />
                            )}

                            {/* Trajetória de mini-círculos de apoio */}
                            {points.map((p, idx) => {
                              // Se o período for maior que 7 dias, mostra apenas pontos muito pequenos
                              // para manter a elegância e fluidez visual
                              const isLargeRange = statsRange !== '7';
                              return (
                                <circle 
                                  key={`dot-${idx}`}
                                  cx={p.x} 
                                  cy={p.y} 
                                  r={activePointIndex === idx ? 6 : isLargeRange ? 1.5 : 3.5} 
                                  fill={activePointIndex === idx ? '#09090b' : '#06b6d4'} 
                                  stroke="#06b6d4" 
                                  strokeWidth={activePointIndex === idx ? 2.5 : 1}
                                  className="transition-all duration-150"
                                />
                              );
                            })}

                            {/* Eixo de Legendas X (Datas) */}
                            {points.map((p, idx) => {
                              // Mostrar legendas com frequência adaptativa de acordo com a quantidade de dados
                              const shouldShowLabel = 
                                statsRange === '7' || 
                                (statsRange === '30' && idx % 5 === 0) || 
                                (statsRange === '90' && idx % 15 === 0);

                              if (!shouldShowLabel) return null;

                              return (
                                <text 
                                  key={`lbl-${idx}`}
                                  x={p.x} 
                                  y={height - paddingY + 18} 
                                  fill="#71717a" 
                                  fontSize="9" 
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                >
                                  {p.label}
                                </text>
                              );
                            })}

                            {/* Grelha de Retângulos Invisíveis para Deteção Sensível do Rato */}
                            {points.map((p, idx) => {
                              const colW = chartW / (points.length - 1);
                              const startX = p.x - colW / 2;
                              return (
                                <rect
                                  key={`hit-${idx}`}
                                  x={idx === 0 ? paddingX : startX}
                                  y={paddingY}
                                  width={idx === 0 || idx === points.length - 1 ? colW / 2 : colW}
                                  height={chartH}
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setActivePointIndex(idx)}
                                  onMouseLeave={() => setActivePointIndex(null)}
                                />
                              );
                            })}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* C. Bento Grid Secundária - Páginas Populares & Origens de Tráfego */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Bloco: Páginas Mais Populares */}
                  <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md flex flex-col justify-between rounded-[2rem] hover:border-white/10 transition-colors duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Globe size={14} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Páginas Mais Acedidas</h4>
                          <p className="text-[10px] text-textSecondary">Popularidade e tráfego por secção do portfólio.</p>
                        </div>
                      </div>

                      {statsData.popularPages.length > 0 ? (
                        <div className="space-y-4">
                          {statsData.popularPages.map((item, idx) => {
                            const maxVal = Math.max(...statsData.popularPages.map(p => p.visits), 1);
                            const pct = Math.round((item.visits / maxVal) * 100);
                            const rank = String(idx + 1).padStart(2, '0');
                            return (
                              <div key={idx} className="space-y-1.5 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="flex items-center justify-between text-xs font-medium">
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <span className="font-mono text-[10px] font-bold text-indigo-400/70">{rank}</span>
                                    <span className="text-textPrimary truncate">{item.page}</span>
                                  </div>
                                  <span className="text-indigo-400 shrink-0 font-bold">{item.visits} {item.visits === 1 ? 'visita' : 'visitas'}</span>
                                </div>
                                <div className="h-1.5 bg-darkBg border border-white/[0.04] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-black/25 border border-dashed border-white/5 rounded-2xl">
                          <p className="text-xs text-textSecondary">Sem registos de páginas no período.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloco: Origens de Referência */}
                  <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md flex flex-col justify-between rounded-[2rem] hover:border-white/10 transition-colors duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                          <Link size={14} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Canais de Origem (Referrers)</h4>
                          <p className="text-[10px] text-textSecondary">Ligações externas que trouxeram visitantes ao site.</p>
                        </div>
                      </div>

                      {statsData.referrers.length > 0 ? (
                        <div className="space-y-4">
                          {statsData.referrers.map((item, idx) => {
                            const maxVal = Math.max(...statsData.referrers.map(r => r.visits), 1);
                            const pct = Math.round((item.visits / maxVal) * 100);
                            const rank = String(idx + 1).padStart(2, '0');
                            return (
                              <div key={idx} className="space-y-1.5 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="flex items-center justify-between text-xs font-medium">
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <span className="font-mono text-[10px] font-bold text-cyan-400/70">{rank}</span>
                                    <span className="text-textPrimary truncate">{item.referrer}</span>
                                  </div>
                                  <span className="text-cyan-400 shrink-0 font-bold">{item.visits} {item.visits === 1 ? 'visita' : 'visitas'}</span>
                                </div>
                                <div className="h-1.5 bg-darkBg border border-white/[0.04] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-450 rounded-full transition-all duration-1000"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-black/25 border border-dashed border-white/5 rounded-2xl">
                          <p className="text-xs text-textSecondary">Sem registos de origens externas no período.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* D. Bento Grid de Dispositivos e Navegadores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Bloco: Dispositivos */}
                  <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md space-y-6 rounded-[2rem] hover:border-white/10 transition-colors duration-500">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Smartphone size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Plataformas e Dispositivos</h4>
                        <p className="text-[10px] text-textSecondary">Tipologia de ecrã técnico usado pelos utilizadores.</p>
                      </div>
                    </div>

                    {statsData.devices.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {statsData.devices.map((item, idx) => {
                          const total = statsData.kpis.periodVisits || 1;
                          const pct = Math.round((item.visits / total) * 100);
                          const isMobile = item.device.toLowerCase() === 'telemóvel' || item.device.toLowerCase() === 'mobile';
                          return (
                            <div key={idx} className="flex items-center justify-between bg-darkBg/60 border border-white/[0.04] p-4 rounded-2xl group hover:border-emerald-500/25 transition-all duration-300">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-textSecondary group-hover:text-emerald-400 transition-colors">
                                  {isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
                                </div>
                                <span className="text-xs font-semibold text-textPrimary">{item.device}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-emerald-400 block">{pct}%</span>
                                <span className="text-[9px] text-textSecondary">({item.visits} {item.visits === 1 ? 'visita' : 'visitas'})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-black/25 border border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs text-textSecondary">Sem dados de dispositivos no período.</p>
                      </div>
                    )}
                  </div>

                  {/* Bloco: Navegadores */}
                  <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md space-y-6 rounded-[2rem] hover:border-white/10 transition-colors duration-500">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Compass size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Navegadores Preferidos</h4>
                        <p className="text-[10px] text-textSecondary">Browsers técnicos de leitura e carregamento.</p>
                      </div>
                    </div>

                    {statsData.browsers.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {statsData.browsers.map((item, idx) => {
                          const total = statsData.kpis.periodVisits || 1;
                          const pct = Math.round((item.visits / total) * 100);
                          const browserLower = item.browser.toLowerCase();
                          const isChrome = browserLower.includes('chrome');
                          const isSafari = browserLower.includes('safari');
                          return (
                            <div key={idx} className="flex items-center justify-between bg-darkBg/60 border border-white/[0.04] p-4 rounded-2xl group hover:border-amber-500/25 transition-all duration-300">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-textSecondary group-hover:text-amber-450 transition-colors">
                                  {isChrome ? <Chrome size={16} /> : isSafari ? <Compass size={16} /> : <Globe size={16} />}
                                </div>
                                <span className="text-xs font-semibold text-textPrimary">{item.browser}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-amber-400 block">{pct}%</span>
                                <span className="text-[9px] text-textSecondary">({item.visits} {item.visits === 1 ? 'visita' : 'visitas'})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-black/25 border border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs text-textSecondary">Sem dados de navegadores no período.</p>
                      </div>
                    )}
                  </div>

                  {/* Bloco: Audiência por País (Largura total no grid em ecrãs grandes) */}
                  <div className="glass-panel p-6 md:p-8 bg-zinc-950/40 border border-white/5 shadow-md space-y-6 rounded-[2rem] hover:border-white/10 transition-colors duration-500 lg:col-span-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Globe size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wide">Audiência Global por País</h4>
                        <p className="text-[10px] text-textSecondary">Geolocalização anónima baseada nos IPs dos visitantes (RGPD Compliant).</p>
                      </div>
                    </div>

                    {statsData.countries && statsData.countries.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {statsData.countries.map((item, idx) => {
                          const total = statsData.kpis.periodVisits || 1;
                          const pct = Math.round((item.visits / total) * 100);
                          return (
                            <div key={idx} className="flex items-center justify-between bg-darkBg/60 border border-white/[0.04] p-4 rounded-2xl group hover:border-indigo-500/25 transition-all duration-300">
                              <div className="flex items-center space-x-3 min-w-0">
                                <span className="text-2xl filter drop-shadow-md leading-none shrink-0" role="img" aria-label={item.country}>
                                  {getCountryFlagEmoji(item.country_code)}
                                </span>
                                <span className="text-xs font-semibold text-textPrimary truncate">{item.country}</span>
                              </div>
                              <div className="flex items-center space-x-3 shrink-0">
                                <div className="hidden sm:block w-20 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                                <div className="text-right min-w-[50px]">
                                  <span className="text-xs font-black text-indigo-450 block">{pct}%</span>
                                  <span className="text-[9px] text-textSecondary">({item.visits} {item.visits === 1 ? 'visita' : 'visitas'})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-black/25 border border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs text-textSecondary">Sem dados demográficos de países no período.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 glass-panel bg-zinc-950/20 border border-white/5 rounded-[2rem]">
                <p className="text-textSecondary font-medium">Não foi possível recuperar nenhuns dados de estatísticas.</p>
              </div>
            )}
          </div>
        )}

        {/* =============================================================
            TAB: SEGURANÇA
            ============================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fade-in font-sans">
            {/* Secção de Alteração de Senha */}
            <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md rounded-[2rem] space-y-6">
              <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
                <div className="w-10 h-10 rounded-xl bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center text-brandBlue">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wide">Alterar Palavra-passe</h3>
                  <p className="text-[10px] text-textSecondary">Atualize a sua senha de acesso ao painel de administração.</p>
                </div>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Palavra-passe Atual</label>
                  <input
                    type="password"
                    required
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nova Palavra-passe</label>
                  <input
                    type="password"
                    required
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Confirmar Nova Palavra-passe</label>
                  <input
                    type="password"
                    required
                    value={pwNewConfirm}
                    onChange={(e) => setPwNewConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-6 py-3 bg-brandBlue hover:bg-brandBlue/90 disabled:bg-brandBlue/60 text-textPrimary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed"
                >
                  {pwLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>A atualizar...</span>
                    </>
                  ) : (
                    <span>Atualizar Palavra-passe</span>
                  )}
                </button>
              </form>
            </div>

            {/* Secção de Alteração de Chave de Segurança */}
            <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md rounded-[2rem] space-y-6">
              <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wide">Alterar Chave de Segurança</h3>
                  <p className="text-[10px] text-textSecondary">Modifique a chave (2FA) exigida ao iniciar sessão.</p>
                </div>
              </div>
              
              <form onSubmit={handleSecurityKeyChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Palavra-passe Atual</label>
                  <input
                    type="password"
                    required
                    value={keyPwCurrent}
                    onChange={(e) => setKeyPwCurrent(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nova Chave de Segurança</label>
                  <input
                    type="password"
                    required
                    value={keyNew}
                    onChange={(e) => setKeyNew(e.target.value)}
                    placeholder="Código ou chave de segurança"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Confirmar Nova Chave</label>
                  <input
                    type="password"
                    required
                    value={keyNewConfirm}
                    onChange={(e) => setKeyNewConfirm(e.target.value)}
                    placeholder="Confirmar a chave"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={keyLoading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-600/90 disabled:bg-purple-600/60 text-textPrimary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed"
                >
                  {keyLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>A atualizar...</span>
                    </>
                  ) : (
                    <span>Atualizar Chave</span>
                  )}
                </button>
              </form>
            </div>

            {/* Secção de Alteração do PIN de Scripts de BD */}
            <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md rounded-[2rem] space-y-6">
              <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wide">PIN de Scripts BD</h3>
                  <p className="text-[10px] text-textSecondary">Defina um PIN exclusivo para aprovar a execução de scripts no painel de automação.</p>
                </div>
              </div>
              
              <form onSubmit={handleDbPinChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Palavra-passe Atual do Admin</label>
                  <input
                    type="password"
                    required
                    value={dbPinCurrentPw}
                    onChange={(e) => setDbPinCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Novo PIN de Scripts BD</label>
                  <input
                    type="password"
                    required
                    value={dbPinNew}
                    onChange={(e) => setDbPinNew(e.target.value)}
                    placeholder="Min 4 caracteres"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Confirmar Novo PIN</label>
                  <input
                    type="password"
                    required
                    value={dbPinConfirm}
                    onChange={(e) => setDbPinConfirm(e.target.value)}
                    placeholder="Confirmar o PIN"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={dbPinLoading}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-600/90 disabled:bg-orange-600/60 text-textPrimary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed"
                >
                  {dbPinLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>A atualizar...</span>
                    </>
                  ) : (
                    <span>Atualizar PIN de Scripts</span>
                  )}
                </button>
              </form>
            </div>

            {/* Registo de Atividades de Segurança */}
            <div className="glass-panel p-6 bg-zinc-950/40 border border-white/5 shadow-md rounded-[2rem] space-y-6">
              <div className="flex items-center justify-between border-b border-darkBorder pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wide">Logs de Acesso e Segurança</h3>
                    <p className="text-[10px] text-textSecondary">Últimas 15 tentativas de login registadas no servidor.</p>
                  </div>
                </div>
                <button
                  onClick={fetchSecurityLogs}
                  disabled={logsLoading}
                  className="px-4 py-2 bg-darkBg hover:bg-zinc-900 border border-darkBorder rounded-xl text-xs font-semibold text-textPrimary transition-all flex items-center space-x-2"
                >
                  {logsLoading ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  <span>Atualizar</span>
                </button>
              </div>

              {logsError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400">
                  {logsError}
                </div>
              )}

              {logsLoading && securityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-textSecondary">A carregar logs de segurança...</p>
                </div>
              ) : securityLogs.length === 0 ? (
                <div className="text-center py-12 bg-black/20 border border-white/5 rounded-2xl">
                  <p className="text-xs text-textSecondary">Nenhum log de segurança registado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-textPrimary font-sans">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-textSecondary uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Data e Hora</th>
                        <th className="pb-3 font-semibold">IP</th>
                        <th className="pb-3 font-semibold">Localização</th>
                        <th className="pb-3 font-semibold">Tentativa</th>
                        <th className="pb-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 text-textSecondary">{new Date(log.created_at).toLocaleString('pt-PT')}</td>
                          <td className="py-3 font-mono font-medium">{log.ip_address}</td>
                          <td className="py-3">
                            <span className="font-semibold">{log.country}</span>
                            {log.city && log.city !== 'Desconhecido' && (
                              <span className="text-[10px] text-textSecondary ml-1">({log.city})</span>
                            )}
                          </td>
                          <td className="py-3 text-textSecondary font-mono">{log.username_attempted}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                              log.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : log.status === 'blocked'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {log.status === 'success' ? 'Sucesso' : log.status === 'blocked' ? 'Bloqueado' : 'Falha'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* =============================================================
            TAB: AUTOMAÇÕES E SCRIPTS
            ============================================================= */}
        {activeTab === 'automations' && (
          <div className="space-y-8 animate-fade-in font-sans">
            <AutomationsTab />
          </div>
        )}

      </main>
      </div>

      {/* =============================================================
          MODAL PROFISSIONAL DE CONFIRMAÇÃO DE ELIMINAÇÃO/SAÍDA (OLED Glassmorphism)
          ============================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`glass-panel max-w-md w-full p-8 bg-zinc-950/90 border shadow-2xl space-y-6 animate-slide-up text-center rounded-3xl ${
            confirmModal.type === 'warning'
              ? 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)]'
              : 'border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border mx-auto ${
              confirmModal.type === 'warning'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {confirmModal.type === 'warning' ? <LogOut size={28} /> : <Trash2 size={28} />}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-textPrimary font-display uppercase tracking-wide">
                {confirmModal.title}
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed font-sans">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-textSecondary hover:text-textPrimary rounded-xl text-sm font-semibold transition-all font-sans"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 font-sans ${
                  confirmModal.type === 'warning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-650 hover:to-orange-700 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-700 shadow-red-500/20'
                }`}
              >
                {confirmModal.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL PROFISSIONAL DE ALERTA/FEEDBACK (Sucesso/Erro OLED Glassmorphic)
          ============================================================= */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className={`glass-panel max-w-sm w-full p-8 bg-zinc-950/90 border shadow-2xl space-y-6 animate-slide-up text-center rounded-3xl ${
            feedbackModal.type === 'success' ? 'border-emerald-500/20 shadow-emerald-500/10' : 'border-rose-500/20 shadow-rose-500/10'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border shrink-0 ${
              feedbackModal.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
            }`}>
              {feedbackModal.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-textPrimary font-display uppercase tracking-wide">
                {feedbackModal.title}
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed font-sans">
                {feedbackModal.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 font-sans ${
                  feedbackModal.type === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35'
                    : 'bg-gradient-to-r from-rose-500 to-red-650 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35'
                }`}
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
