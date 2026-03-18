/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, ArrowRight, Sparkles, Share2, RefreshCw, ChevronLeft, Search, Play, Info } from 'lucide-react';
import { MOVIES } from './constants';
import { Movie, RewriteRequest, RewriteResult, RewriteMode, EmotionalDirection, Faithfulness, Intensity } from './types';
import { generateAlternateEnding } from './services/gemini';

/// --- Types for Localization ---
type Language = 'en' | 'zh';

const TRANSLATIONS = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    heroTitle: 'Rewrite the ending you',
    heroTitleItalic: 'never got over.',
    heroDesc: 'Insert one moment. Change everything. Explore emotionally grounded alternate endings for your favorite films.',
    btnTryMovie: 'Try a Movie',
    btnSeeDemo: 'See Demo',
    step1Title: 'Pick a movie',
    step1Desc: 'Choose from our curated library of emotionally resonant films.',
    step2Title: 'Change one moment',
    step2Desc: 'Insert a new scene, change a decision, or reveal hidden info.',
    step3Title: 'Explore endings',
    step3Desc: 'See how your change ripples through the story\'s emotional fabric.',
    selectTitle: 'Select a Film',
    selectDesc: 'Choose a story you want to reimagine.',
    searchPlaceholder: 'Search movies...',
    backToSelection: 'Back to Selection',
    originalEnding: 'Original Ending',
    coreConflicts: 'Core Conflicts',
    inspirationPrompts: 'Inspiration Prompts',
    rewriteMode: 'Rewrite Mode',
    whatToChange: 'What would you change?',
    changePlaceholder: 'e.g., What if Mia stayed outside Sebastian\'s jazz bar for ten minutes before leaving for Paris?',
    emotionalDirection: 'Emotional Direction',
    faithfulness: 'Faithfulness',
    intensity: 'Intensity',
    btnGenerate: 'Generate Alternate Endings',
    alternateCut: 'The Alternate Cut',
    originalCore: 'Original Emotional Core',
    impactAnalysis: 'Impact Analysis',
    possibleBranches: 'Possible Branches',
    polishedEnding: 'The Polished Ending',
    btnStartOver: 'Start Over',
    btnBackToTop: 'Back to Top',
    loadingTitle: 'Rewriting the narrative...',
    loadingDesc: 'Our AI is analyzing the emotional core and causal ripples of your change. This takes a cinematic moment.',
    copySuccess: 'Copied to clipboard!',
    modes: {
      insert_scene: 'Insert Scene',
      change_decision: 'Change Decision',
      rewrite_final: 'Rewrite Final Moment',
      reveal_info: 'Reveal Hidden Info'
    },
    directions: ['Healing', 'Bittersweet', 'Dramatic', 'Realistic', 'Hopeful'],
    faithfulnessOptions: ['Very faithful', 'Balanced', 'Bold reinterpretation'],
    intensityOptions: ['Small shift', 'Moderate shift', 'Major rewrite']
  },
  zh: {
    navHome: '首页',
    navAbout: '关于',
    heroTitle: '重写那个让你',
    heroTitleItalic: '久久不能释怀的结局。',
    heroDesc: '插入一个瞬间。改变一切。为你的最爱电影探索情感充沛的替代结局。',
    btnTryMovie: '尝试一部电影',
    btnSeeDemo: '查看演示',
    step1Title: '选择电影',
    step1Desc: '从我们精选的情感共鸣电影库中选择。',
    step2Title: '改变一个瞬间',
    step2Desc: '插入新场景、改变决定或揭示隐藏信息。',
    step3Title: '探索结局',
    step3Desc: '看看你的改变如何波及故事的情感结构。',
    selectTitle: '选择影片',
    selectDesc: '选择一个你想重新构思的故事。',
    searchPlaceholder: '搜索电影...',
    backToSelection: '返回选择',
    originalEnding: '原版结局',
    coreConflicts: '核心冲突',
    inspirationPrompts: '灵感提示',
    rewriteMode: '重写模式',
    whatToChange: '你想改变什么？',
    changePlaceholder: '例如：如果米娅在去巴黎前，在塞巴斯蒂安的爵士酒吧外多停留了十分钟会怎样？',
    emotionalDirection: '情感走向',
    faithfulness: '忠实度',
    intensity: '改变强度',
    btnGenerate: '生成替代结局',
    alternateCut: '替代剪辑版',
    originalCore: '原始情感核心',
    impactAnalysis: '影响分析',
    possibleBranches: '可能的分支',
    polishedEnding: '润色后的结局',
    btnStartOver: '重新开始',
    btnBackToTop: '回到顶部',
    loadingTitle: '正在重写叙事...',
    loadingDesc: '我们的 AI 正在分析你改变的情感核心和因果涟漪。这需要一个电影般的瞬间。',
    copySuccess: '已复制到剪贴板！',
    modes: {
      insert_scene: '插入场景',
      change_decision: '改变决定',
      rewrite_final: '重写最后时刻',
      reveal_info: '揭示隐藏信息'
    },
    directions: ['治愈', '苦乐参半', '戏剧性', '写实', '充满希望'],
    faithfulnessOptions: ['非常忠实', '平衡', '大胆重新诠释'],
    intensityOptions: ['小幅变动', '中度变动', '重大重写']
  }
};

// --- Components ---

const Navbar = ({ onHome, lang, setLang }: { onHome: () => void, lang: Language, setLang: (l: Language) => void }) => {
  const t = TRANSLATIONS[lang];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-cinema-black/80 backdrop-blur-md border-bottom border-white/5">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <div className="w-10 h-10 bg-cinema-gold rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Film className="text-cinema-black" size={24} />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight">What If Cinema</span>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full transition-all ${lang === 'en' ? 'bg-cinema-gold text-cinema-black' : 'opacity-50 hover:opacity-100'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('zh')}
            className={`px-3 py-1 rounded-full transition-all ${lang === 'zh' ? 'bg-cinema-gold text-cinema-black' : 'opacity-50 hover:opacity-100'}`}
          >
            中
          </button>
        </div>
        <button className="hover:opacity-100 transition-opacity opacity-70" onClick={onHome}>{t.navHome}</button>
      </div>
    </nav>
  );
};

const LandingPage = ({ onStart, lang }: { onStart: () => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center cinematic-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
          {t.heroTitle} <span className="text-cinema-gold italic">{t.heroTitleItalic}</span>
        </h1>
        <p className="text-xl md:text-2xl opacity-60 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onStart} className="btn-primary flex items-center justify-center gap-2">
            {t.btnTryMovie} <ArrowRight size={20} />
          </button>
          <button className="btn-secondary">{t.btnSeeDemo}</button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-32 w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: t.step1Title, desc: t.step1Desc },
            { step: "02", title: t.step2Title, desc: t.step2Desc },
            { step: "03", title: t.step3Title, desc: t.step3Desc }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 text-left group hover:bg-white/10 transition-colors">
              <span className="text-cinema-gold font-mono text-sm mb-4 block">{item.step}</span>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="opacity-50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const MovieSelectionPage = ({ onSelect, lang }: { onSelect: (movie: Movie) => void, lang: Language }) => {
  const [search, setSearch] = useState('');
  const t = TRANSLATIONS[lang];
  const filteredMovies = MOVIES.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.titleZh.includes(search)
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">{t.selectTitle}</h2>
          <p className="opacity-50">{t.selectDesc}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:border-cinema-gold/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMovies.map((movie) => (
          <motion.div
            key={movie.id}
            layoutId={movie.id}
            onClick={() => onSelect(movie)}
            className="group cursor-pointer"
            whileHover={{ y: -10 }}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl mb-4">
              <img 
                src={movie.posterUrl} 
                alt={lang === 'en' ? movie.title : movie.titleZh} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(lang === 'en' ? movie.moodTags : movie.moodTagsZh).slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-cinema-gold transition-colors">
              {lang === 'en' ? movie.title : movie.titleZh}
            </h3>
            <p className="text-sm opacity-40 italic line-clamp-1">
              {lang === 'en' ? movie.endingTheme : movie.endingThemeZh}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BuilderPage = ({ movie, onBack, onGenerate, lang }: { movie: Movie, onBack: () => void, onGenerate: (req: RewriteRequest) => void, lang: Language }) => {
  const [mode, setMode] = useState<RewriteMode>('insert_scene');
  const [prompt, setPrompt] = useState('');
  const [direction, setDirection] = useState<EmotionalDirection>('Bittersweet');
  const [faithfulness, setFaithfulness] = useState<Faithfulness>('Balanced');
  const [intensity, setIntensity] = useState<Intensity>('Moderate shift');
  const t = TRANSLATIONS[lang];

  const modes: { id: RewriteMode; label: string; icon: any }[] = [
    { id: 'insert_scene', label: t.modes.insert_scene, icon: Play },
    { id: 'change_decision', label: t.modes.change_decision, icon: RefreshCw },
    { id: 'rewrite_final', label: t.modes.rewrite_final, icon: Sparkles },
    { id: 'reveal_info', label: t.modes.reveal_info, icon: Info },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ movie, mode, prompt, direction, faithfulness, intensity });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity mb-8">
        <ChevronLeft size={20} /> {t.backToSelection}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Movie Info */}
        <div className="space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <img src={movie.posterUrl} alt={lang === 'en' ? movie.title : movie.titleZh} className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black p-8 flex flex-col justify-end">
              <h2 className="text-4xl font-bold mb-2">{lang === 'en' ? movie.title : movie.titleZh}</h2>
              <p className="opacity-70 italic mb-4">{lang === 'en' ? movie.endingTheme : movie.endingThemeZh}</p>
              <div className="flex flex-wrap gap-2">
                {(lang === 'en' ? movie.genres : movie.genresZh).map(g => <span key={g} className="text-xs border border-white/20 px-3 py-1 rounded-full">{g}</span>)}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <div>
              <h4 className="text-cinema-gold uppercase text-xs font-mono mb-2 tracking-widest">{t.originalEnding}</h4>
              <p className="opacity-70 text-sm leading-relaxed">{lang === 'en' ? movie.endingSummary : movie.endingSummaryZh}</p>
            </div>
            <div>
              <h4 className="text-cinema-gold uppercase text-xs font-mono mb-2 tracking-widest">{t.coreConflicts}</h4>
              <div className="flex flex-wrap gap-2">
                {(lang === 'en' ? movie.coreConflicts : movie.coreConflictsZh).map(c => <span key={c} className="text-xs bg-white/5 px-3 py-1 rounded-lg">{c}</span>)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold opacity-50">{t.inspirationPrompts}</h4>
            {(lang === 'en' ? movie.samplePrompts : movie.samplePromptsZh).map((p, i) => (
              <button 
                key={i} 
                onClick={() => setPrompt(p)}
                className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-cinema-gold/30 hover:bg-white/5 transition-all text-sm opacity-60 hover:opacity-100"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="text-sm font-bold opacity-50">{t.rewriteMode}</label>
            <div className="grid grid-cols-2 gap-3">
              {modes.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                    mode === m.id ? 'bg-cinema-gold text-cinema-black border-cinema-gold' : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <m.icon size={18} />
                  <span className="text-sm font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold opacity-50">{t.whatToChange}</label>
            <textarea
              required
              placeholder={t.changePlaceholder}
              className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-cinema-gold/50 transition-colors resize-none text-lg leading-relaxed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold opacity-50">{t.emotionalDirection}</label>
              <div className="flex flex-wrap gap-2">
                {['Healing', 'Bittersweet', 'Dramatic', 'Realistic', 'Hopeful'].map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDirection(d as EmotionalDirection)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      direction === d ? 'bg-white text-cinema-black' : 'bg-white/5 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {t.directions[i]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-50">{t.faithfulness}</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none"
                  value={faithfulness}
                  onChange={(e) => setFaithfulness(e.target.value as Faithfulness)}
                >
                  {t.faithfulnessOptions.map((opt, i) => (
                    <option key={i} value={['Very faithful', 'Balanced', 'Bold reinterpretation'][i]}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-50">{t.intensity}</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as Intensity)}
                >
                  {t.intensityOptions.map((opt, i) => (
                    <option key={i} value={['Small shift', 'Moderate shift', 'Major rewrite'][i]}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3">
            {t.btnGenerate} <Sparkles size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

const ResultsPage = ({ result, onRestart, onRegenerate, lang }: { result: RewriteResult, onRestart: () => void, onRegenerate: () => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-16">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold">{t.alternateCut}</h2>
        <div className="flex gap-4">
          <button onClick={onRegenerate} className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors" title="Regenerate">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(result.polishedEnding);
            alert(t.copySuccess);
          }} className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors" title="Copy">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h4 className="text-cinema-gold uppercase text-xs font-mono mb-4 tracking-widest">{t.originalCore}</h4>
          <p className="opacity-80 leading-relaxed">{result.originalCore}</p>
        </div>
        <div className="glass-card p-8 border-cinema-gold/20">
          <h4 className="text-cinema-gold uppercase text-xs font-mono mb-4 tracking-widest">{t.impactAnalysis}</h4>
          <p className="opacity-80 leading-relaxed">{result.impactAnalysis}</p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold">{t.possibleBranches}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.branches.map((branch, i) => (
            <div key={i} className="glass-card p-6 border-white/5 hover:border-white/20 transition-all">
              <h5 className="font-bold text-lg mb-2">{branch.title}</h5>
              <p className="text-xs text-cinema-gold italic mb-3">{branch.summary}</p>
              <p className="text-sm opacity-60 leading-relaxed">{branch.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold">{t.polishedEnding}</h3>
        <div className="glass-card p-10 md:p-16 bg-white/[0.02] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cinema-gold" />
          <div className="prose prose-invert max-w-none">
            {result.polishedEnding.split('\n').map((para, i) => (
              <p key={i} className="text-xl md:text-2xl font-serif leading-relaxed mb-6 opacity-90">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 pt-10">
        <button onClick={onRestart} className="btn-secondary">{t.btnStartOver}</button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary">{t.btnBackToTop}</button>
      </div>
    </div>
  );
};

const LoadingScreen = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="fixed inset-0 z-[100] bg-cinema-black flex flex-col items-center justify-center text-center p-6">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-20 h-20 border-4 border-cinema-gold border-t-transparent rounded-full mb-8"
      />
      <h2 className="text-3xl font-serif italic mb-4">{t.loadingTitle}</h2>
      <p className="opacity-50 max-w-md">{t.loadingDesc}</p>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'selection' | 'builder' | 'results'>('landing');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [lastRequest, setLastRequest] = useState<RewriteRequest | null>(null);
  const [lang, setLang] = useState<Language>('en');

  const handleStart = () => setView('selection');
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('builder');
  };
  const handleBackToSelection = () => setView('selection');
  const handleHome = () => setView('landing');

  const handleGenerate = async (request: RewriteRequest) => {
    setLoading(true);
    setLastRequest(request);
    try {
      const res = await generateAlternateEnding(request, lang);
      setResult(res);
      setView('results');
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? "Failed to generate alternate ending. Please try again." : "生成替代结局失败。请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastRequest) handleGenerate(lastRequest);
  };

  return (
    <div className="bg-cinema-black min-h-screen text-cinema-text">
      <Navbar onHome={handleHome} lang={lang} setLang={setLang} />
      
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen lang={lang} />}
        
        <motion.main
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          {view === 'landing' && <LandingPage onStart={handleStart} lang={lang} />}
          {view === 'selection' && <MovieSelectionPage onSelect={handleSelectMovie} lang={lang} />}
          {view === 'builder' && selectedMovie && (
            <BuilderPage 
              movie={selectedMovie} 
              onBack={handleBackToSelection} 
              onGenerate={handleGenerate} 
              lang={lang}
            />
          )}
          {view === 'results' && result && (
            <ResultsPage 
              result={result} 
              onRestart={handleStart} 
              onRegenerate={handleRegenerate} 
              lang={lang}
            />
          )}
        </motion.main>
      </AnimatePresence>

      <footer className="py-12 px-6 border-t border-white/5 text-center opacity-30 text-xs tracking-widest uppercase">
        <p>© 2026 What If Cinema • Powered by Gemini AI</p>
        <p className="mt-2">Copyright © yuyao wang • yuyaow@bu.edu</p>
      </footer>
    </div>
  );
}
