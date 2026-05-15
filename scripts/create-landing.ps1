# =============================================================================
# FlowOS Landing Page — Bootstrap Script
# Cria projeto Next.js completo em D:\dev\FlowOS_landing
# =============================================================================

$OUT = "D:\dev\flowos-landing"
$PARENT = "D:\dev"

function wf([string]$rel, [string]$body) {
    $full = Join-Path $OUT $rel
    $dir = Split-Path $full -Parent
    if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($full, $body, [System.Text.Encoding]::UTF8)
    Write-Host "  + $rel" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  FLOWOS LANDING PAGE BOOTSTRAP" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# STEP 1 — Create Next.js project
# =============================================================================
Write-Host "[1/4] Criando projeto Next.js..." -ForegroundColor Blue
Set-Location $PARENT

if (Test-Path $OUT) {
    Write-Host "  Removendo diretorio existente..." -ForegroundColor Yellow
    Remove-Item $OUT -Recurse -Force
}

& npx create-next-app@latest flowos-landing `
    --typescript `
    --tailwind `
    --eslint `
    --app `
    --no-src-dir `
    --import-alias "@/*" `
    --yes

Set-Location $OUT

# =============================================================================
# STEP 2 — Install extra dependencies
# =============================================================================
Write-Host "[2/4] Instalando dependencias..." -ForegroundColor Blue
& npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot

# =============================================================================
# STEP 3 — Write all source files
# =============================================================================
Write-Host "[3/4] Escrevendo arquivos..." -ForegroundColor Blue

# -----------------------------------------------------------------------------
# tailwind.config.ts
# -----------------------------------------------------------------------------
$f = @'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'flow-blue': '#3B82F6',
        'flow-glow': '#60A5FA',
        'flow-indigo': '#818CF8',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-med': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
}
export default config
'@
wf "tailwind.config.ts" $f

# -----------------------------------------------------------------------------
# app/globals.css
# -----------------------------------------------------------------------------
$f = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --blue: #3B82F6;
  --blue-glow: #60A5FA;
  --indigo: #818CF8;
}

html {
  scroll-behavior: smooth;
  background: #000;
}

body {
  background: #000;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: rgba(59, 130, 246, 0.35);
  color: #fff;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #3B82F6; }

@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glass-blue {
    background: rgba(59, 130, 246, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  .glow-blue {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  }
  .text-gradient {
    background: linear-gradient(135deg, #60A5FA 0%, #818CF8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .shimmer-text {
    background: linear-gradient(90deg, #fff 0%, #60A5FA 50%, #fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2.5s linear infinite;
  }
}
'@
wf "app/globals.css" $f

# -----------------------------------------------------------------------------
# lib/utils.ts
# -----------------------------------------------------------------------------
$f = @'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
'@
wf "lib/utils.ts" $f

# -----------------------------------------------------------------------------
# lib/i18n.ts
# -----------------------------------------------------------------------------
$f = @'
export type Locale = 'en' | 'pt-BR'

export const translations = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      blog: 'Blog',
      login: 'Log in',
      cta: 'Start Free',
    },
    hero: {
      badge: 'AI-Powered Life OS',
      headline1: 'Your Life.',
      headline2: 'On System.',
      sub: 'The AI-powered operating system designed to organize, optimize, and execute every area of your life.',
      cta: 'Start Free — 15 Days',
      ctaNote: 'No credit card required',
      ctaSecondary: 'Watch Experience',
      dashboardGreeting: 'Good morning, Alex',
      dashboardSub: 'FlowOS Dashboard',
      aiInsight: 'AI Insight',
      aiInsightText: 'Your productivity peaks at 9–11 am. Block this window for deep work today.',
      todayHabits: "Today's Habits",
      habits: ['Morning routine', 'Exercise', 'Reading'],
    },
    problem: {
      label: 'The Problem',
      headline: 'Your life deserves better than chaos.',
      sub: "Most people live reactively — scattered, distracted, overwhelmed. There's a better way.",
      items: [
        {
          title: 'Scattered Across Apps',
          desc: 'Dozens of tools, zero cohesion. Your focus is fragmented before the day begins.',
        },
        {
          title: 'Constant Mental Overload',
          desc: "Your brain is full of tasks, reminders, and decisions. There's no room to think clearly.",
        },
        {
          title: 'Lost Momentum',
          desc: 'Without a system, progress stalls. Goals drift. Days blur into weeks.',
        },
      ],
      solution: 'FLOWOS changes everything.',
    },
    ai: {
      label: 'AI Experience',
      headline: 'An intelligence designed for your life.',
      sub: "FLOWOS AI doesn't just organize. It understands your patterns, adapts to your goals, and guides your execution.",
      features: [
        { title: 'AI Daily Planner', desc: 'Your day, intelligently structured.', icon: '🧠' },
        { title: 'Smart Routines', desc: 'Routines that evolve with you.', icon: '🔄' },
        { title: 'Financial Intelligence', desc: 'Clarity on your financial health.', icon: '💰' },
        { title: 'Execution Coach', desc: 'Guided focus for maximum output.', icon: '⚡' },
      ],
      chatMessages: [
        { role: 'user', text: 'What should I focus on today?' },
        { role: 'ai', text: "Based on your goals, I'd suggest: 2h deep work on your main project (9–11am), then review your weekly finance tracker. Your habit streak is at 6 days — keep it going." },
        { role: 'user', text: 'How is my progress this week?' },
        { role: 'ai', text: "You're in the top 20% of your personal benchmarks. Focus score: 84. Habit completion: 78%. One area to improve: sleep consistency." },
      ],
    },
    control: {
      label: 'Life Control Center',
      headline: 'Everything. In one place.',
      sub: 'Habits, finances, projects, focus, routines, analytics — one cohesive operating system.',
      modules: [
        { title: 'Habits', desc: 'Build lasting systems', icon: '✦', color: 'blue' },
        { title: 'Finance', desc: 'Full financial clarity', icon: '◈', color: 'green' },
        { title: 'Projects', desc: 'Execute at every level', icon: '◉', color: 'purple' },
        { title: 'Focus', desc: 'Deep work, by design', icon: '◎', color: 'orange' },
        { title: 'Routines', desc: 'Consistent execution', icon: '⊕', color: 'cyan' },
        { title: 'Analytics', desc: 'Measure everything', icon: '⊞', color: 'pink' },
      ],
    },
    execution: {
      label: 'Execution Mode',
      headline: 'Enter the zone.',
      sub: 'Focused. Immersed. Executing. FLOWOS creates the mental environment for peak performance.',
      focusLabel: 'Deep Focus',
      status: 'Session Active',
      completedLabel: 'Sessions',
      completedValue: '12',
      streakLabel: 'Day Streak',
      streakValue: '9',
    },
    proof: {
      label: 'Social Proof',
      headline: 'People who took control.',
      testimonials: [
        {
          name: 'Sarah Chen',
          role: 'Founder, TechStart',
          text: 'FLOWOS transformed how I operate. I went from constantly overwhelmed to executing with precision every single day.',
          avatar: 'SC',
        },
        {
          name: 'Marcus Williams',
          role: 'Senior Engineer',
          text: "The AI insights are genuinely remarkable. It's like having a personal coach who deeply knows your patterns and goals.",
          avatar: 'MW',
        },
        {
          name: 'Isabel Torres',
          role: 'Creative Director',
          text: "I've tried every productivity app out there. Nothing comes close to the clarity and execution FLOWOS provides.",
          avatar: 'IT',
        },
      ],
      stats: [
        { value: '12,000+', label: 'Active Users' },
        { value: '94%', label: 'Report Clarity Gains' },
        { value: '3.2h', label: 'Daily Time Reclaimed' },
      ],
    },
    cta: {
      headline: 'Take control of your life.',
      sub: 'Clarity. Focus. Execution.',
      btn: 'Start Free — 15 Days',
      note: 'No credit card required',
    },
    footer: {
      tagline: 'Your Life. On System.',
      links: {
        product: { title: 'Product', items: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
        company: { title: 'Company', items: ['About', 'Blog', 'Careers', 'Press'] },
        legal: { title: 'Legal', items: ['Privacy', 'Terms', 'Security'] },
      },
      copy: '© 2025 FLOWOS. All rights reserved.',
    },
    signup: {
      headline: 'Create your account.',
      sub: 'Your operating system awaits.',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Date of Birth',
      email: 'Email Address',
      password: 'Password',
      btn: 'Create Account',
      loginPrompt: 'Already have an account?',
      loginLink: 'Sign in',
      terms: 'By continuing you agree to our Terms of Service and Privacy Policy.',
    },
    login: {
      headline: 'Welcome back.',
      sub: 'Continue your journey.',
      email: 'Email Address',
      password: 'Password',
      btn: 'Sign In',
      forgot: 'Forgot password?',
      signupPrompt: "Don't have an account?",
      signupLink: 'Start free',
    },
    verify: {
      headline: 'Check your inbox.',
      sub: 'Your FLOWOS account is almost ready.',
      message: 'We sent a verification link to your email address. Click it to activate your account.',
      resend: 'Resend email',
      spam: "Don't see it? Check your spam folder.",
    },
    install: {
      headline: 'Install FLOWOS.',
      sub: 'Your life OS, everywhere.',
      options: [
        {
          title: 'iOS App',
          desc: 'Download on the App Store',
          icon: '',
          steps: ['Open App Store', 'Search for FLOWOS', 'Tap Install'],
        },
        {
          title: 'Android App',
          desc: 'Get it on Google Play',
          icon: '',
          steps: ['Open Google Play', 'Search for FLOWOS', 'Tap Install'],
        },
        {
          title: 'Continue on Web',
          desc: 'No installation needed',
          icon: '🌐',
          steps: ['Your account is ready', 'Open dashboard', 'Start organizing'],
        },
      ],
    },
  },

  'pt-BR': {
    nav: {
      features: 'Recursos',
      pricing: 'Preços',
      blog: 'Blog',
      login: 'Entrar',
      cta: 'Começar Grátis',
    },
    hero: {
      badge: 'Sistema Operacional de Vida com IA',
      headline1: 'Sua Vida.',
      headline2: 'No Sistema.',
      sub: 'O sistema operacional movido por IA, projetado para organizar, otimizar e executar cada área da sua vida.',
      cta: 'Começar Grátis — 15 Dias',
      ctaNote: 'Sem cartão de crédito',
      ctaSecondary: 'Ver Experiência',
      dashboardGreeting: 'Bom dia, Alex',
      dashboardSub: 'FlowOS Dashboard',
      aiInsight: 'Insight da IA',
      aiInsightText: 'Sua produtividade atinge o pico das 9h às 11h. Reserve essa janela para trabalho profundo hoje.',
      todayHabits: 'Hábitos de Hoje',
      habits: ['Rotina matinal', 'Exercício', 'Leitura'],
    },
    problem: {
      label: 'O Problema',
      headline: 'Sua vida merece mais do que o caos.',
      sub: 'A maioria das pessoas vive de forma reativa — dispersa, distraída, sobrecarregada. Existe uma maneira melhor.',
      items: [
        {
          title: 'Disperso em Dezenas de Apps',
          desc: 'Inúmeras ferramentas, zero coesão. Seu foco está fragmentado antes mesmo do dia começar.',
        },
        {
          title: 'Sobrecarga Mental Constante',
          desc: 'Sua mente está cheia de tarefas, lembretes e decisões. Não há espaço para pensar com clareza.',
        },
        {
          title: 'Momentum Perdido',
          desc: 'Sem um sistema, o progresso para. Objetivos se perdem. Os dias se transformam em semanas.',
        },
      ],
      solution: 'FLOWOS muda tudo.',
    },
    ai: {
      label: 'Experiência com IA',
      headline: 'Uma inteligência criada para sua vida.',
      sub: 'A IA do FLOWOS não apenas organiza. Ela entende seus padrões, se adapta aos seus objetivos e guia sua execução.',
      features: [
        { title: 'Planejador Diário com IA', desc: 'Seu dia, estruturado com inteligência.', icon: '🧠' },
        { title: 'Rotinas Inteligentes', desc: 'Rotinas que evoluem com você.', icon: '🔄' },
        { title: 'Inteligência Financeira', desc: 'Clareza sobre sua saúde financeira.', icon: '💰' },
        { title: 'Coach de Execução', desc: 'Foco guiado para máximo desempenho.', icon: '⚡' },
      ],
      chatMessages: [
        { role: 'user', text: 'No que devo focar hoje?' },
        { role: 'ai', text: 'Com base nos seus objetivos, sugiro: 2h de trabalho profundo no seu projeto principal (9h–11h), depois revise seu rastreador financeiro semanal. Sua sequência de hábitos está em 6 dias — continue assim.' },
        { role: 'user', text: 'Como está meu progresso esta semana?' },
        { role: 'ai', text: 'Você está nos 20% melhores dos seus benchmarks pessoais. Pontuação de foco: 84. Conclusão de hábitos: 78%. Uma área a melhorar: consistência do sono.' },
      ],
    },
    control: {
      label: 'Central de Controle de Vida',
      headline: 'Tudo. Em um só lugar.',
      sub: 'Hábitos, finanças, projetos, foco, rotinas, análises — um sistema operacional coeso.',
      modules: [
        { title: 'Hábitos', desc: 'Construa sistemas duradouros', icon: '✦', color: 'blue' },
        { title: 'Finanças', desc: 'Clareza financeira total', icon: '◈', color: 'green' },
        { title: 'Projetos', desc: 'Execute em todos os níveis', icon: '◉', color: 'purple' },
        { title: 'Foco', desc: 'Trabalho profundo, por design', icon: '◎', color: 'orange' },
        { title: 'Rotinas', desc: 'Execução consistente', icon: '⊕', color: 'cyan' },
        { title: 'Análises', desc: 'Meça tudo', icon: '⊞', color: 'pink' },
      ],
    },
    execution: {
      label: 'Modo de Execução',
      headline: 'Entre na zona.',
      sub: 'Focado. Imerso. Executando. FLOWOS cria o ambiente mental para o desempenho máximo.',
      focusLabel: 'Foco Profundo',
      status: 'Sessão Ativa',
      completedLabel: 'Sessões',
      completedValue: '12',
      streakLabel: 'Dias Seguidos',
      streakValue: '9',
    },
    proof: {
      label: 'Prova Social',
      headline: 'Pessoas que assumiram o controle.',
      testimonials: [
        {
          name: 'Sarah Chen',
          role: 'Fundadora, TechStart',
          text: 'O FLOWOS transformou minha forma de operar. Fui de constantemente sobrecarregada para executar com precisão todos os dias.',
          avatar: 'SC',
        },
        {
          name: 'Marcus Williams',
          role: 'Engenheiro Sênior',
          text: 'Os insights de IA são genuinamente notáveis. É como ter um coach pessoal que conhece profundamente seus padrões e objetivos.',
          avatar: 'MW',
        },
        {
          name: 'Isabel Torres',
          role: 'Diretora Criativa',
          text: 'Já tentei todos os apps de produtividade. Nada chega perto da clareza e execução que o FLOWOS oferece.',
          avatar: 'IT',
        },
      ],
      stats: [
        { value: '12.000+', label: 'Usuários Ativos' },
        { value: '94%', label: 'Reportam Mais Clareza' },
        { value: '3,2h', label: 'Tempo Recuperado por Dia' },
      ],
    },
    cta: {
      headline: 'Assuma o controle da sua vida.',
      sub: 'Clareza. Foco. Execução.',
      btn: 'Começar Grátis — 15 Dias',
      note: 'Sem cartão de crédito',
    },
    footer: {
      tagline: 'Sua Vida. No Sistema.',
      links: {
        product: { title: 'Produto', items: ['Recursos', 'Preços', 'Novidades', 'Roadmap'] },
        company: { title: 'Empresa', items: ['Sobre', 'Blog', 'Carreiras', 'Imprensa'] },
        legal: { title: 'Legal', items: ['Privacidade', 'Termos', 'Segurança'] },
      },
      copy: '© 2025 FLOWOS. Todos os direitos reservados.',
    },
    signup: {
      headline: 'Crie sua conta.',
      sub: 'Seu sistema operacional te aguarda.',
      firstName: 'Nome',
      lastName: 'Sobrenome',
      birthDate: 'Data de Nascimento',
      email: 'Endereço de E-mail',
      password: 'Senha',
      btn: 'Criar Conta',
      loginPrompt: 'Já tem uma conta?',
      loginLink: 'Entrar',
      terms: 'Ao continuar você concorda com nossos Termos de Serviço e Política de Privacidade.',
    },
    login: {
      headline: 'Bem-vindo de volta.',
      sub: 'Continue sua jornada.',
      email: 'Endereço de E-mail',
      password: 'Senha',
      btn: 'Entrar',
      forgot: 'Esqueceu a senha?',
      signupPrompt: 'Não tem uma conta?',
      signupLink: 'Comece grátis',
    },
    verify: {
      headline: 'Verifique seu e-mail.',
      sub: 'Sua conta FLOWOS está quase pronta.',
      message: 'Enviamos um link de verificação para o seu e-mail. Clique nele para ativar sua conta.',
      resend: 'Reenviar e-mail',
      spam: 'Não encontrou? Verifique sua pasta de spam.',
    },
    install: {
      headline: 'Instale o FLOWOS.',
      sub: 'Seu sistema operacional de vida, em todo lugar.',
      options: [
        {
          title: 'App iOS',
          desc: 'Baixe na App Store',
          icon: '',
          steps: ['Abra a App Store', 'Busque por FLOWOS', 'Toque em Instalar'],
        },
        {
          title: 'App Android',
          desc: 'Disponível no Google Play',
          icon: '',
          steps: ['Abra o Google Play', 'Busque por FLOWOS', 'Toque em Instalar'],
        },
        {
          title: 'Continuar na Web',
          desc: 'Sem instalação necessária',
          icon: '🌐',
          steps: ['Sua conta está pronta', 'Abra o painel', 'Comece a organizar'],
        },
      ],
    },
  },
} as const

export type Translations = typeof translations.en
'@
wf "lib/i18n.ts" $f

# -----------------------------------------------------------------------------
# lib/motion.ts
# -----------------------------------------------------------------------------
$f = @'
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

export const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
}

export const staggerFast = {
  show: { transition: { staggerChildren: 0.07 } },
}

export const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0 },
}

export const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1 },
}

export const transition = {
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.7,
}

export const transitionFast = {
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.45,
}
'@
wf "lib/motion.ts" $f

# -----------------------------------------------------------------------------
# providers/LocaleProvider.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { translations, Locale, Translations } from '@/lib/i18n'

type LocaleCtx = {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
}

const Ctx = createContext<LocaleCtx>({} as LocaleCtx)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const lang = navigator.language || 'en'
    if (lang.startsWith('pt')) setLocale('pt-BR')
    else setLocale('en')
  }, [])

  return (
    <Ctx.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </Ctx.Provider>
  )
}

export const useLocale = () => useContext(Ctx)
'@
wf "providers/LocaleProvider.tsx" $f

# -----------------------------------------------------------------------------
# app/layout.tsx
# -----------------------------------------------------------------------------
$f = @'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LocaleProvider } from '@/providers/LocaleProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FLOWOS — Your Life. On System.',
  description:
    'The AI-powered operating system designed to organize, optimize, and execute every area of your life.',
  openGraph: {
    title: 'FLOWOS — Your Life. On System.',
    description:
      'The AI-powered operating system designed to organize, optimize, and execute every area of your life.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}
'@
wf "app/layout.tsx" $f

# -----------------------------------------------------------------------------
# app/page.tsx
# -----------------------------------------------------------------------------
$f = @'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import AIExperience from '@/components/landing/AIExperience'
import LifeControlCenter from '@/components/landing/LifeControlCenter'
import ExecutionMode from '@/components/landing/ExecutionMode'
import SocialProof from '@/components/landing/SocialProof'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="bg-black min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <ProblemSection />
      <AIExperience />
      <LifeControlCenter />
      <ExecutionMode />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </main>
  )
}
'@
wf "app/page.tsx" $f

# -----------------------------------------------------------------------------
# components/ui/button.tsx
# -----------------------------------------------------------------------------
$f = @'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] hover:scale-[1.02] active:scale-[0.99]',
        ghost:
          'border border-white/10 text-white/80 hover:border-white/25 hover:text-white hover:bg-white/5',
        outline:
          'border border-blue-500/40 text-blue-400 hover:border-blue-500 hover:bg-blue-500/10',
      },
      size: {
        sm: 'h-9 px-5 text-xs',
        md: 'h-11 px-7',
        lg: 'h-14 px-10 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
'@
wf "components/ui/button.tsx" $f

# -----------------------------------------------------------------------------
# components/ui/input.tsx
# -----------------------------------------------------------------------------
$f = @'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wide">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full h-12 px-4 rounded-xl glass text-white text-sm placeholder:text-gray-600',
            'outline-none transition-all duration-300',
            'focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
            error && 'border-red-500/60',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
'@
wf "components/ui/input.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/Navbar.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/providers/LocaleProvider'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { t, locale, setLocale } = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: t.nav.features, href: '#features' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.blog, href: '#blog' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass border-b border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all duration-300">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="white" opacity="0.9" />
              <path d="M12 8L8 10.5V13.5L12 16L16 13.5V10.5L12 8Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-widest text-sm">FLOWOS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Locale toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'pt-BR' : 'en')}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
          >
            {locale === 'en' ? 'PT' : 'EN'}
          </button>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t.nav.login}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">{t.nav.cta}</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass border-t border-white/[0.06] px-6 py-6 flex flex-col gap-4"
          >
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-300 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
              <Link href="/login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">
                  {t.nav.cta}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
'@
wf "components/landing/Navbar.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/Hero.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Play, TrendingUp } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

export default function Hero() {
  const { t } = useLocale()
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 24)
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 24)
  }

  const chartBars = [38, 55, 42, 78, 60, 85, 95]

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-24 pb-16"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
        {/* Left — copy */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            transition={transition}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-blue text-blue-400 text-xs font-medium mb-8 tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-glow-pulse" />
            {t.hero.badge}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ ...transition, delay: 0.1 }}
            className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.04] tracking-[-0.02em] text-white mb-6"
          >
            {t.hero.headline1}
            <br />
            <span className="text-gradient">{t.hero.headline2}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ ...transition, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 leading-relaxed max-w-[480px] mb-10"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ ...transition, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <Link href="/signup">
              <button className="group inline-flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] text-sm">
                {t.hero.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <button className="inline-flex items-center gap-2.5 px-8 py-4 border border-white/10 hover:border-white/20 text-white/75 hover:text-white font-medium rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-sm">
              <div className="w-7 h-7 rounded-full glass-blue flex items-center justify-center">
                <Play className="w-3 h-3 text-blue-400 ml-0.5" fill="currentColor" />
              </div>
              {t.hero.ctaSecondary}
            </button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ ...transition, delay: 0.4 }}
            className="text-xs text-gray-600"
          >
            {t.hero.ctaNote}
          </motion.p>
        </motion.div>

        {/* Right — floating dashboard */}
        <motion.div
          style={{ x: springX, y: springY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="relative hidden lg:block h-[580px]"
        >
          {/* Main dashboard card */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-6 right-6 glass rounded-2xl p-5 shadow-2xl shadow-black/60"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-gray-600 font-medium tracking-wider uppercase">{t.hero.dashboardSub}</p>
                <p className="text-white font-semibold text-sm mt-0.5">{t.hero.dashboardGreeting}</p>
              </div>
              <div className="w-9 h-9 rounded-xl glass-blue flex items-center justify-center">
                <span className="text-blue-400 text-[10px] font-bold">AI</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[
                { label: 'Focus', value: '4h 20m', col: 'text-blue-400' },
                { label: 'Habits', value: '6/8', col: 'text-emerald-400' },
                { label: 'Goals', value: '73%', col: 'text-indigo-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <p className="text-[10px] text-gray-600 mb-1">{s.label}</p>
                  <p className={`text-sm font-bold ${s.col}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-14">
              {chartBars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                  className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/60 to-blue-400/30"
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px] text-gray-700">{d}</span>
              ))}
            </div>
          </motion.div>

          {/* AI insight card */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="absolute bottom-28 -left-4 w-[220px] glass rounded-2xl p-4 shadow-xl shadow-black/50"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg glass-blue flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-[9px] font-bold">AI</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">{t.hero.aiInsight}</p>
            </div>
            <p className="text-[11px] text-white/75 leading-relaxed">{t.hero.aiInsightText}</p>
          </motion.div>

          {/* Habits card */}
          <motion.div
            animate={{ y: [0, -11, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-4 right-0 w-[175px] glass rounded-2xl p-4 shadow-xl shadow-black/50"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <p className="text-[10px] text-gray-500 font-medium">{t.hero.todayHabits}</p>
            </div>
            {t.hero.habits.map((habit, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    i < 2
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'border-white/15 bg-transparent'
                  }`}
                >
                  {i < 2 && <span className="text-emerald-400 text-[8px]">✓</span>}
                </div>
                <span className={`text-[11px] ${i < 2 ? 'text-white/40 line-through' : 'text-white/80'}`}>
                  {habit}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
'@
wf "components/landing/Hero.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/ProblemSection.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { motion } from 'framer-motion'
import { Layers, Brain, Battery } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition, scaleIn } from '@/lib/motion'

const icons = [Layers, Brain, Battery]

export default function ProblemSection() {
  const { t } = useLocale()

  return (
    <section className="relative py-28 md:py-36 bg-black overflow-hidden">
      {/* Subtle divider glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-900/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} transition={transition} className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-4">
            {t.problem.label}
          </motion.p>
          <motion.h2 variants={fadeUp} transition={transition} className="text-3xl md:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-5 max-w-2xl mx-auto leading-[1.1]">
            {t.problem.headline}
          </motion.h2>
          <motion.p variants={fadeUp} transition={transition} className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t.problem.sub}
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-3 gap-5 mb-16"
        >
          {t.problem.items.map((item, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={i}
                variants={scaleIn}
                transition={{ ...transition, delay: i * 0.1 }}
                className="glass rounded-2xl p-7 group hover:border-white/15 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/[0.06] transition-colors">
                  <Icon className="w-4.5 h-4.5 text-gray-400" size={18} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2.5">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Solution bridge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={transition}
          className="text-center"
        >
          <div className="inline-flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/60" />
            <p className="text-blue-400 font-semibold text-lg">{t.problem.solution}</p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/60" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
'@
wf "components/landing/ProblemSection.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/AIExperience.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, slideLeft, slideRight, transition } from '@/lib/motion'

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(t1)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(iv)
    }, 22)
    return () => clearInterval(iv)
  }, [started, text])

  return <span>{displayed}{started && displayed.length < text.length && <span className="animate-pulse">|</span>}</span>
}

export default function AIExperience() {
  const { t } = useLocale()
  const [visibleMsgs, setVisibleMsgs] = useState(1)

  useEffect(() => {
    const timers = t.ai.chatMessages.map((_, i) =>
      setTimeout(() => setVisibleMsgs(i + 1), i * 2800)
    )
    return () => timers.forEach(clearTimeout)
  }, [t.ai.chatMessages])

  return (
    <section id="features" className="relative py-28 md:py-36 bg-black overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/7 blur-[130px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} transition={transition} className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-4">
              {t.ai.label}
            </motion.p>
            <motion.h2 variants={fadeUp} transition={transition} className="text-3xl md:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-5 leading-[1.1]">
              {t.ai.headline}
            </motion.h2>
            <motion.p variants={fadeUp} transition={transition} className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
              {t.ai.sub}
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
              {t.ai.features.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ ...transition, delay: i * 0.08 }}
                  className="glass rounded-xl p-4 hover:border-blue-500/20 transition-all duration-300 group"
                >
                  <span className="text-xl mb-2 block">{f.icon}</span>
                  <p className="text-white font-medium text-sm mb-1">{f.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — AI chat interface */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={transition}
            className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg glass-blue flex items-center justify-center">
                <span className="text-blue-400 text-[10px] font-bold">AI</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">FLOWOS AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-emerald-400 text-[10px]">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 min-h-[320px]">
              {t.ai.chatMessages.slice(0, visibleMsgs).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 border border-blue-500/30 text-white'
                        : 'glass text-gray-300'
                    }`}
                  >
                    {i === visibleMsgs - 1 && msg.role === 'ai' ? (
                      <TypingText text={msg.text} delay={0.1} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input bar */}
            <div className="px-5 py-4 border-t border-white/[0.06]">
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <input
                  className="flex-1 bg-transparent text-xs text-gray-500 outline-none placeholder:text-gray-700"
                  placeholder="Ask FLOWOS AI anything..."
                  readOnly
                />
                <div className="w-6 h-6 rounded-lg bg-blue-600/40 flex items-center justify-center">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                    <path d="M2 8L14 8M8 2L14 8L8 14" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
'@
wf "components/landing/AIExperience.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/LifeControlCenter.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, scaleIn, transition } from '@/lib/motion'

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40 group-hover:bg-blue-500/15',
  green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/15',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40 group-hover:bg-orange-500/15',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/15',
  pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20 group-hover:border-pink-500/40 group-hover:bg-pink-500/15',
}

const glowMap: Record<string, string> = {
  blue: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]',
  green: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]',
  purple: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]',
  orange: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.12)]',
  cyan: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]',
  pink: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.12)]',
}

export default function LifeControlCenter() {
  const { t } = useLocale()

  return (
    <section className="relative py-28 md:py-36 bg-black overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-blue-900/6 blur-[140px]" />
      </div>

      <div className="container mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} transition={transition} className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-4">
            {t.control.label}
          </motion.p>
          <motion.h2 variants={fadeUp} transition={transition} className="text-3xl md:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-5 leading-[1.1]">
            {t.control.headline}
          </motion.h2>
          <motion.p variants={fadeUp} transition={transition} className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t.control.sub}
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {t.control.modules.map((mod, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              transition={{ ...transition, delay: i * 0.07 }}
              className={`group glass rounded-2xl p-6 cursor-pointer transition-all duration-300 border border-transparent ${glowMap[mod.color]}`}
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg mb-4 transition-all duration-300 ${colorMap[mod.color]}`}>
                {mod.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{mod.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
'@
wf "components/landing/LifeControlCenter.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/ExecutionMode.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

function FocusTimer() {
  const [seconds, setSeconds] = useState(52 * 60 + 18)
  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(iv)
  }, [])
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return <span>{m}:{s}</span>
}

export default function ExecutionMode() {
  const { t } = useLocale()

  return (
    <section className="relative py-28 md:py-36 bg-[#020208] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/6 blur-[120px] animate-glow-pulse" />
        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-blue-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — focus timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={transition}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="w-72 h-72 rounded-full border border-blue-500/15 flex items-center justify-center">
                <div className="w-60 h-60 rounded-full border border-blue-500/25 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full glass-blue flex flex-col items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.15)]">
                    <p className="text-gray-500 text-[10px] font-medium tracking-widest uppercase mb-2">{t.execution.focusLabel}</p>
                    <p className="text-white text-4xl font-bold tracking-tight tabular-nums">
                      <FocusTimer />
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <p className="text-blue-400 text-[10px] font-medium">{t.execution.status}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rotating arc */}
              <svg className="absolute inset-0 w-72 h-72 -rotate-90" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r="138" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
                <motion.circle
                  cx="144" cy="144" r="138"
                  fill="none"
                  stroke="rgba(59,130,246,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 138}`}
                  strokeDashoffset={`${2 * Math.PI * 138 * 0.35}`}
                  animate={{ strokeDashoffset: [`${2 * Math.PI * 138 * 0.35}`, `${2 * Math.PI * 138 * 0.3}`] }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Right — copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} transition={transition} className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-4">
              {t.execution.label}
            </motion.p>
            <motion.h2 variants={fadeUp} transition={transition} className="text-3xl md:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-5 leading-[1.1]">
              {t.execution.headline}
            </motion.h2>
            <motion.p variants={fadeUp} transition={transition} className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
              {t.execution.sub}
            </motion.p>

            <motion.div variants={fadeUp} transition={transition} className="flex gap-6">
              {[
                { label: t.execution.completedLabel, value: t.execution.completedValue },
                { label: t.execution.streakLabel, value: t.execution.streakValue },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl px-5 py-4">
                  <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
'@
wf "components/landing/ExecutionMode.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/SocialProof.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, scaleIn, transition } from '@/lib/motion'

const avatarColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600']

export default function SocialProof() {
  const { t } = useLocale()

  return (
    <section className="relative py-28 md:py-36 bg-black overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="container mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} transition={transition} className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-4">
            {t.proof.label}
          </motion.p>
          <motion.h2 variants={fadeUp} transition={transition} className="text-3xl md:text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            {t.proof.headline}
          </motion.h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-5 mb-16 max-w-2xl mx-auto"
        >
          {t.proof.stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ ...transition, delay: i * 0.1 }} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gradient mb-1.5">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-3 gap-5"
        >
          {t.proof.testimonials.map((t2, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              transition={{ ...transition, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t2.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div className={`w-8 h-8 rounded-full ${avatarColors[i]} flex items-center justify-center text-white text-xs font-bold`}>
                  {t2.avatar}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{t2.name}</p>
                  <p className="text-gray-600 text-[10px]">{t2.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
'@
wf "components/landing/SocialProof.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/FinalCTA.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

export default function FinalCTA() {
  const { t } = useLocale()

  return (
    <section className="relative py-32 md:py-44 bg-black overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-blue-600/8 blur-[140px] animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-indigo-600/6 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2
            variants={fadeUp}
            transition={transition}
            className="text-4xl md:text-5xl xl:text-6xl font-bold text-white tracking-tight mb-5 leading-[1.05]"
          >
            {t.cta.headline}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ ...transition, delay: 0.1 }}
            className="text-xl md:text-2xl text-gradient font-semibold mb-10 tracking-wide"
          >
            {t.cta.sub}
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ ...transition, delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <Link href="/signup">
              <button className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.55)] hover:scale-[1.03] active:scale-[0.99] text-base">
                {t.cta.btn}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <p className="text-gray-700 text-sm">{t.cta.note}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
'@
wf "components/landing/FinalCTA.tsx" $f

# -----------------------------------------------------------------------------
# components/landing/Footer.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import Link from 'next/link'
import { useLocale } from '@/providers/LocaleProvider'

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="bg-[#020202] border-t border-white/[0.05]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="white" opacity="0.9" />
                  <path d="M12 8L8 10.5V13.5L12 16L16 13.5V10.5L12 8Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-white tracking-widest text-xs">FLOWOS</span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed max-w-[180px]">{t.footer.tagline}</p>
          </div>

          {/* Links */}
          {Object.values(t.footer.links).map((group) => (
            <div key={group.title}>
              <p className="text-white text-xs font-semibold mb-4">{group.title}</p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs">{t.footer.copy}</p>
          <p className="text-gray-700 text-xs">Built with precision.</p>
        </div>
      </div>
    </footer>
  )
}
'@
wf "components/landing/Footer.tsx" $f

# -----------------------------------------------------------------------------
# app/signup/page.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

export default function SignupPage() {
  const { t } = useLocale()
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', birthDate: '', email: '', password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.birthDate) e.birthDate = 'Required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Min 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    window.location.href = '/verify-email'
  }

  const s = t.signup

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} transition={transition} className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.6)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="white" opacity="0.9" />
                <path d="M12 8L8 10.5V13.5L12 16L16 13.5V10.5L12 8Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">FLOWOS</span>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} transition={transition} className="glass rounded-2xl p-8 shadow-2xl shadow-black/60">
          <h1 className="text-2xl font-bold text-white mb-1">{s.headline}</h1>
          <p className="text-gray-500 text-sm mb-8">{s.sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label={s.firstName}
                value={form.firstName}
                onChange={(v) => setForm({ ...form, firstName: v })}
                error={errors.firstName}
                placeholder="Alex"
              />
              <Field
                label={s.lastName}
                value={form.lastName}
                onChange={(v) => setForm({ ...form, lastName: v })}
                error={errors.lastName}
                placeholder="Morgan"
              />
            </div>
            <Field
              label={s.birthDate}
              type="date"
              value={form.birthDate}
              onChange={(v) => setForm({ ...form, birthDate: v })}
              error={errors.birthDate}
            />
            <Field
              label={s.email}
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
              placeholder="you@example.com"
            />
            <div className="relative">
              <Field
                label={s.password}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                error={errors.password}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 bottom-3 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 group text-sm"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <>
                  {s.btn}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-gray-700 text-[10px] text-center mt-5 leading-relaxed">{s.terms}</p>

          <p className="text-center text-sm text-gray-500 mt-5">
            {s.loginPrompt}{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {s.loginLink}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}

function Field({
  label, type = 'text', value, onChange, error, placeholder,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1.5 tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-11 px-4 rounded-xl glass text-white text-sm placeholder:text-gray-700 outline-none transition-all duration-300 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ${error ? 'border-red-500/50' : ''}`}
      />
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
    </div>
  )
}
'@
wf "app/signup/page.tsx" $f

# -----------------------------------------------------------------------------
# app/login/page.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

export default function LoginPage() {
  const { t } = useLocale()
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
  }

  const s = t.login

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div variants={fadeUp} transition={transition} className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.6)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="white" opacity="0.9" />
                <path d="M12 8L8 10.5V13.5L12 16L16 13.5V10.5L12 8Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">FLOWOS</span>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} transition={transition} className="glass rounded-2xl p-8 shadow-2xl shadow-black/60">
          <h1 className="text-2xl font-bold text-white mb-1">{s.headline}</h1>
          <p className="text-gray-500 text-sm mb-8">{s.sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{s.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl glass text-white text-sm placeholder:text-gray-700 outline-none transition-all duration-300 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{s.password}</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 px-4 rounded-xl glass text-white text-sm placeholder:text-gray-700 outline-none transition-all duration-300 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 bottom-3 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
                {s.forgot}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 group text-sm"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <>
                  {s.btn}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {s.signupPrompt}{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {s.signupLink}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}
'@
wf "app/login/page.tsx" $f

# -----------------------------------------------------------------------------
# app/verify-email/page.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, transition } from '@/lib/motion'

export default function VerifyEmailPage() {
  const { t } = useLocale()
  const s = t.verify

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[130px] animate-glow-pulse" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.div
          variants={fadeUp}
          transition={transition}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl glass-blue flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.25)]">
            <Mail className="w-9 h-9 text-blue-400" />
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} transition={transition} className="text-3xl font-bold text-white mb-2">
          {s.headline}
        </motion.h1>
        <motion.p variants={fadeUp} transition={{ ...transition, delay: 0.1 }} className="text-blue-400 font-medium mb-6">
          {s.sub}
        </motion.p>
        <motion.p variants={fadeUp} transition={{ ...transition, delay: 0.15 }} className="text-gray-400 text-sm leading-relaxed mb-10">
          {s.message}
        </motion.p>

        <motion.div variants={fadeUp} transition={{ ...transition, delay: 0.2 }} className="space-y-3">
          <Link href="/install">
            <button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              Continue to Install
            </button>
          </Link>
          <button className="w-full h-11 glass text-gray-400 hover:text-white text-sm rounded-xl transition-all duration-300 hover:border-white/20">
            {s.resend}
          </button>
        </motion.div>

        <motion.p variants={fadeUp} transition={{ ...transition, delay: 0.25 }} className="text-gray-700 text-xs mt-6">
          {s.spam}
        </motion.p>
      </motion.div>
    </main>
  )
}
'@
wf "app/verify-email/page.tsx" $f

# -----------------------------------------------------------------------------
# app/install/page.tsx
# -----------------------------------------------------------------------------
$f = @'
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { fadeUp, stagger, scaleIn, transition } from '@/lib/motion'

const optionColors = [
  'border-blue-500/25 hover:border-blue-500/50 hover:shadow-[0_0_35px_rgba(59,130,246,0.1)]',
  'border-green-500/25 hover:border-green-500/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.1)]',
  'border-indigo-500/25 hover:border-indigo-500/50 hover:shadow-[0_0_35px_rgba(99,102,241,0.1)]',
]

export default function InstallPage() {
  const { t } = useLocale()
  const s = t.install

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-blue-600/7 blur-[140px]" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} transition={transition} className="flex justify-center mb-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.6)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="white" opacity="0.9" />
                <path d="M12 8L8 10.5V13.5L12 16L16 13.5V10.5L12 8Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">FLOWOS</span>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} transition={transition} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{s.headline}</h1>
          <p className="text-gray-400 text-base">{s.sub}</p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid md:grid-cols-3 gap-5"
        >
          {s.options.map((opt, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              transition={{ ...transition, delay: i * 0.1 }}
              className={`glass rounded-2xl p-6 border cursor-pointer transition-all duration-300 ${optionColors[i]}`}
            >
              <div className="text-4xl mb-4">{opt.icon}</div>
              <h3 className="text-white font-bold text-base mb-1">{opt.title}</h3>
              <p className="text-gray-500 text-xs mb-6">{opt.desc}</p>

              <div className="space-y-3">
                {opt.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] text-gray-500 font-bold">{j + 1}</span>
                    </div>
                    <span className="text-xs text-gray-400">{step}</span>
                  </div>
                ))}
              </div>

              {i === 2 && (
                <Link href="#dashboard" className="mt-6 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Go to Dashboard
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ ...transition, delay: 0.4 }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs text-gray-500">
            <Check className="w-3 h-3 text-emerald-400" />
            Your account is active and ready
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}
'@
wf "app/install/page.tsx" $f

# =============================================================================
# STEP 4 — Summary
# =============================================================================
Write-Host ""
Write-Host "[4/4] Concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "  Projeto criado em: $OUT (flowos-landing)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Para iniciar o servidor de desenvolvimento:" -ForegroundColor White
Write-Host "    cd $OUT" -ForegroundColor Yellow
Write-Host "    npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Paginas disponiveis:" -ForegroundColor White
Write-Host "    http://localhost:3000        - Landing page" -ForegroundColor DarkGray
Write-Host "    http://localhost:3000/signup - Cadastro" -ForegroundColor DarkGray
Write-Host "    http://localhost:3000/login  - Login" -ForegroundColor DarkGray
Write-Host "    http://localhost:3000/verify-email - Verificacao" -ForegroundColor DarkGray
Write-Host "    http://localhost:3000/install      - Instalacao" -ForegroundColor DarkGray
Write-Host ""
