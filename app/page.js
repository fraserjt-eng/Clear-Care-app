'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Shield, MessageCircle, Clock, CheckCircle, ChevronRight, ChevronLeft, Sparkles, Users, BookOpen, Archive, Home, Menu, X, Play, Pause, Plus, Search, Calendar, Lock, Eye, TrendingUp, Award, AlertCircle, RotateCcw, Send, Star, Zap, Target, Lightbulb, Volume2, Square } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ============================================
// FRAMEWORK DATA
// ============================================

const CLEAR_STEPS = [
  { letter: 'C', title: 'Context', subtitle: "What's the situation?", description: 'Facts only', icon: Target, color: '#2D5A5A', prompts: ['What are the observable facts? (Not interpretations)', 'When and where did this occur?', 'What specific behaviors are you addressing?'], placeholder: 'Describe using only observable facts...' },
  { letter: 'L', title: 'Listen First', subtitle: 'Plan questions before statements', description: 'Understand their perspective', icon: Volume2, color: '#3D6B6B', prompts: ['What questions will help you understand?', 'What assumptions do you need to set aside?'], placeholder: 'List the questions you want to ask...' },
  { letter: 'E', title: 'Expectations', subtitle: 'What needs to change?', description: 'Be specific and actionable', icon: CheckCircle, color: '#4D7C7C', prompts: ['What specific change are you asking for?', 'How will success be measured?'], placeholder: 'Describe the specific expectations...' },
  { letter: 'A', title: 'Agreements', subtitle: 'What will we each commit to?', description: 'Mutual accountability', icon: Users, color: '#5D8D8D', prompts: ['What will you commit to?', 'What resources can you provide?'], placeholder: 'Outline the mutual commitments...' },
  { letter: 'R', title: 'Revisit', subtitle: 'When will we check in?', description: 'Schedule follow-up', icon: Calendar, color: '#6D9E9E', prompts: ['When will you follow up?', 'What will you look for to assess progress?'], placeholder: 'Plan the follow-up timeline...' }
]

const CARE_STEPS = [
  { letter: 'C', title: 'Connection', subtitle: 'Start with relationship', description: 'Lead with humanity', icon: Heart, color: '#B8860B', prompts: ['How will you open with genuine care?', 'What shared purpose can you reference?'], placeholder: 'How will you establish connection?' },
  { letter: 'A', title: 'Acknowledge', subtitle: 'Validate their experience', description: 'See their reality', icon: Eye, color: '#C9971C', prompts: ['What challenges might they be facing?', 'What strengths can you recognize?'], placeholder: 'What will you acknowledge?' },
  { letter: 'R', title: 'Respect', subtitle: 'Assume positive intent', description: 'Extend grace', icon: Award, color: '#DAA82D', prompts: ["What's the most generous interpretation?", 'What do you appreciate about this person?'], placeholder: 'Write your most generous interpretation...' },
  { letter: 'E', title: 'Empathy', subtitle: 'Name the emotion', description: 'Feel with them', icon: Sparkles, color: '#EBB93E', prompts: ['What might they be feeling?', 'What would you need in their position?'], placeholder: 'What emotions might they be experiencing?' }
]

const CONVERSATION_TYPES = [
  { id: 'performance', label: 'Performance Concern', icon: TrendingUp },
  { id: 'parent', label: 'Parent Complaint', icon: Users },
  { id: 'colleague', label: 'Colleague Conflict', icon: AlertCircle },
  { id: 'policy', label: 'Policy Violation', icon: Shield },
  { id: 'personal', label: 'Personal Issue', icon: Heart }
]

const SAMPLE_SCENARIOS = [
  { id: 1, type: 'performance', title: 'Chronic Lateness', description: 'A teacher has been consistently late to their first period class.', context: 'Teacher arrives 5-10 minutes late, students are unsupervised.' },
  { id: 2, type: 'parent', title: 'Grade Dispute', description: "A parent is upset about their child's grade.", context: 'Student received a C, parent emailed superintendent.' },
  { id: 3, type: 'colleague', title: 'Meeting Disruption', description: 'A colleague consistently interrupts others in meetings.', context: 'Last three PLCs have been derailed.' },
  { id: 4, type: 'policy', title: 'Cell Phone Use', description: 'Staff member using phone during instruction.', context: 'Observed twice by admin.' },
  { id: 5, type: 'personal', title: 'Quality Decline', description: 'Excellent employee work quality has declined.', context: 'Missed deadlines, incomplete work.' }
]

const getQuadrantLabel = (w, s) => {
  if (w >= 50 && s >= 50) return 'Demanding (Ideal)'
  if (w >= 50 && s < 50) return 'Enabling'
  if (w < 50 && s >= 50) return 'Dominating'
  return 'Neglecting'
}

const getQuadrantColor = (w, s) => {
  if (w >= 50 && s >= 50) return '#2D8B5A'
  if (w >= 50 && s < 50) return '#D4A84B'
  if (w < 50 && s >= 50) return '#C65D4A'
  return '#7A7A7A'
}

// ============================================
// MAIN APP
// ============================================
export default function ClearCarePlatform() {
  const [view, setView] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [current, setCurrent] = useState(null)

  // Load conversations from Supabase on mount
  useEffect(() => {
    async function loadConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        // Transform database format to app format
        const formatted = data.map(c => ({
          id: c.id,
          title: c.title,
          personName: c.person_name,
          type: c.conversation_type,
          relationship: c.relationship_context,
          warmth: c.warmth_level,
          structure: c.structure_level,
          status: c.status,
          date: new Date(c.created_at).toLocaleDateString(),
          care: { C: c.care_c, A: c.care_a, R: c.care_r, E: c.care_e },
          clear: { C: c.clear_c, L: c.clear_l, E: c.clear_e, A: c.clear_a, R: c.clear_r },
          starter: c.conversation_starter,
          notes: c.notes || [],
          duration: c.duration_seconds
        }))
        setConversations(formatted)
      }
    }
    loadConversations()
  }, [])

  // Save conversation to Supabase
  const saveConversation = async (conv) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: conv.title,
        person_name: conv.personName,
        conversation_type: conv.type,
        relationship_context: conv.relationship,
        warmth_level: conv.warmth,
        structure_level: conv.structure,
        care_c: conv.care?.C,
        care_a: conv.care?.A,
        care_r: conv.care?.R,
        care_e: conv.care?.E,
        clear_c: conv.clear?.C,
        clear_l: conv.clear?.L,
        clear_e: conv.clear?.E,
        clear_a: conv.clear?.A,
        clear_r: conv.clear?.R,
        conversation_starter: conv.starter,
        additional_notes: conv.notes,
        status: conv.status || 'prepared'
      })
      .select()
      .single()
    
    if (data) {
      return { ...conv, id: data.id }
    }
    return conv
  }

  // Update conversation in Supabase
  const updateConversation = async (conv) => {
    if (!conv.id) return conv
    await supabase
      .from('conversations')
      .update({
        status: conv.status,
        duration_seconds: conv.duration,
        notes: conv.notes,
        reflection: conv.reflection,
        updated_at: new Date().toISOString()
      })
      .eq('id', conv.id)
    return conv
  }

  const nav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'prep', label: 'New', icon: Plus },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'pricing', label: 'Pricing', icon: Zap }
  ]

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView onNav={setView} conversations={conversations} />
      case 'prep': return <PrepWizard onComplete={async (c) => { 
        const saved = await saveConversation(c)
        setConversations([saved, ...conversations])
        setCurrent(saved)
        setView('live') 
      }} />
      case 'live': return <LiveMode conv={current} onComplete={async (c) => { 
        const updated = await updateConversation(c)
        setCurrent(updated)
        setView('reflect') 
      }} />
      case 'reflect': return <Reflection conv={current} onComplete={async () => {
        if (current) await updateConversation({ ...current, status: 'completed' })
        setView('archive')
      }} />
      case 'archive': return <ArchiveView conversations={conversations} onSelect={(c) => { setCurrent(c); setView('reflect') }} />
      case 'learn': return <LearnModule />
      case 'team': return <TeamView />
      case 'pricing': return <PricingView />
      case 'landing': return <LandingView onStart={() => setView('prep')} />
      default: return <HomeView onNav={setView} conversations={conversations} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-amber-50/20">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setView('landing')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-slate-800">Clear & Care</h1>
                <p className="text-xs text-slate-500 -mt-0.5">Conversation Coaching</p>
              </div>
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${view === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </button>
              ))}
            </nav>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-xl">
            <nav className="px-4 py-3 space-y-1">
              {nav.map((item) => (
                <button key={item.id} onClick={() => { setView(item.id); setMenuOpen(false) }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm ${view === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <item.icon className="w-5 h-5" />{item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main>{renderView()}</main>
    </div>
  )
}

// ============================================
// HOME VIEW
// ============================================
function HomeView({ onNav, conversations = [] }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-3">Welcome back</h1>
        <p className="text-lg text-slate-600">Ready to navigate your next difficult conversation with clarity and care?</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        <button onClick={() => onNav('prep')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-left shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Plus className="w-8 h-8 text-white/90 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Start New Conversation</h3>
          <p className="text-teal-100 text-sm">Prepare with the Clear & Care framework</p>
        </button>
        <button onClick={() => onNav('learn')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-left shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <BookOpen className="w-8 h-8 text-white/90 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Practice Scenarios</h3>
          <p className="text-amber-100 text-sm">Role-play with AI coaching</p>
        </button>
        <button onClick={() => onNav('archive')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-6 text-left shadow-xl shadow-slate-500/20 hover:shadow-slate-500/30 transition-all hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Archive className="w-8 h-8 text-white/90 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">View Archive</h3>
          <p className="text-slate-300 text-sm">{conversations.length} conversations saved</p>
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">The Clear & Care Framework</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-teal-600" /><span className="font-semibold text-teal-700">CLEAR (Structure)</span></div>
            {CLEAR_STEPS.map((s) => (<div key={s.letter} className="flex items-start gap-3 p-3 rounded-lg bg-teal-50/50"><span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.letter}</span><div><p className="font-medium text-slate-800 text-sm">{s.title}</p><p className="text-xs text-slate-600">{s.subtitle}</p></div></div>))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-amber-600" /><span className="font-semibold text-amber-700">CARE (Warmth)</span></div>
            {CARE_STEPS.map((s) => (<div key={s.letter} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50"><span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.letter}</span><div><p className="font-medium text-slate-800 text-sm">{s.title}</p><p className="text-xs text-slate-600">{s.subtitle}</p></div></div>))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PREP WIZARD
// ============================================
function PrepWizard({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ title: '', type: '', personName: '', relationship: '', warmth: 70, structure: 70, clear: { C: '', L: '', E: '', A: '', R: '' }, care: { C: '', A: '', R: '', E: '' }, starter: '', notes: '' })
  const update = (k, v) => setData(p => ({ ...p, [k]: v }))
  const updateClear = (l, v) => setData(p => ({ ...p, clear: { ...p.clear, [l]: v } }))
  const updateCare = (l, v) => setData(p => ({ ...p, care: { ...p.care, [l]: v } }))
  const total = 4

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Step {step + 1} of {total}</span>
          <span className="text-sm text-slate-500">{Math.round(((step + 1) / total) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        {step === 0 && <SetupStep data={data} update={update} />}
        {step === 1 && <CareStepUI data={data} updateCare={updateCare} />}
        {step === 2 && <ClearStepUI data={data} updateClear={updateClear} />}
        {step === 3 && <ReviewStep data={data} update={update} />}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200/50 flex items-center justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" />Back</button>
          {step < total - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/20">Continue<ChevronRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={() => onComplete({ ...data, id: Date.now(), date: new Date().toLocaleDateString(), status: 'prepared' })} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20"><Play className="w-4 h-4" />Start Conversation</button>
          )}
        </div>
      </div>
    </div>
  )
}

function SetupStep({ data, update }) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8"><h2 className="text-2xl font-semibold text-slate-800 mb-2">Let&apos;s prepare your conversation</h2><p className="text-slate-600">Start by telling us about the situation.</p></div>
      <div className="space-y-6">
        <div><label className="block text-sm font-medium text-slate-700 mb-2">Conversation Title</label><input type="text" value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Follow-up on classroom management" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-2">Type</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{CONVERSATION_TYPES.map((t) => (<button key={t.id} onClick={() => update('type', t.id)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${data.type === t.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}><t.icon className="w-4 h-4" /><span className="text-sm">{t.label}</span></button>))}</div></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-2">Who are you talking with?</label><input type="text" value={data.personName} onChange={(e) => update('personName', e.target.value)} placeholder="Name or role" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-2">Relationship context</label><textarea value={data.relationship} onChange={(e) => update('relationship', e.target.value)} placeholder="Brief description of your relationship..." rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /></div>
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Tone Calibration</h3>
          <Quadrant warmth={data.warmth} structure={data.structure} onW={(v) => update('warmth', v)} onS={(v) => update('structure', v)} />
        </div>
      </div>
    </div>
  )
}

function Quadrant({ warmth, structure, onW, onS }) {
  return (
    <div className="space-y-6">
      <div className="relative w-full aspect-square max-w-xs mx-auto">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl overflow-hidden">
          <div className="bg-red-100 flex items-center justify-center p-2"><span className="text-xs text-red-600 text-center font-medium">Dominating</span></div>
          <div className="bg-green-100 flex items-center justify-center p-2"><span className="text-xs text-green-600 text-center font-medium">Demanding<br/>(Ideal)</span></div>
          <div className="bg-slate-100 flex items-center justify-center p-2"><span className="text-xs text-slate-500 text-center font-medium">Neglecting</span></div>
          <div className="bg-amber-100 flex items-center justify-center p-2"><span className="text-xs text-amber-600 text-center font-medium">Enabling</span></div>
        </div>
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500 whitespace-nowrap">Structure →</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-slate-500">Warmth →</div>
        <div className="absolute w-6 h-6 rounded-full bg-white border-4 shadow-lg -translate-x-1/2 -translate-y-1/2 transition-all" style={{ left: `${warmth}%`, top: `${100 - structure}%`, borderColor: getQuadrantColor(warmth, structure) }} />
      </div>
      <div className="space-y-4">
        <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Heart className="w-4 h-4 text-amber-500" />Warmth</label><span className="text-sm text-slate-500">{warmth}%</span></div><input type="range" min="0" max="100" value={warmth} onChange={(e) => onW(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full cursor-pointer accent-amber-500" /></div>
        <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" />Structure</label><span className="text-sm text-slate-500">{structure}%</span></div><input type="range" min="0" max="100" value={structure} onChange={(e) => onS(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full cursor-pointer accent-teal-500" /></div>
      </div>
      <div className="text-center py-2 px-4 rounded-full text-sm font-medium" style={{ backgroundColor: `${getQuadrantColor(warmth, structure)}20`, color: getQuadrantColor(warmth, structure) }}>{getQuadrantLabel(warmth, structure)}</div>
    </div>
  )
}

function CareStepUI({ data, updateCare }) {
  const [idx, setIdx] = useState(0)
  const s = CARE_STEPS[idx]
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8"><div className="flex items-center gap-3 mb-2"><Heart className="w-6 h-6 text-amber-500" /><h2 className="text-2xl font-semibold text-slate-800">CARE: Build the Warmth</h2></div><p className="text-slate-600">Prepare to lead with care and connection.</p></div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{CARE_STEPS.map((step, i) => (<button key={step.letter} onClick={() => setIdx(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${idx === i ? 'bg-amber-500 text-white shadow-lg' : data.care[step.letter] ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><span className="font-bold">{step.letter}</span><span className="text-sm">{step.title}</span>{data.care[step.letter] && idx !== i && <CheckCircle className="w-4 h-4" />}</button>))}</div>
      <div className="bg-amber-50/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color }}><s.icon className="w-6 h-6 text-white" /></div><div><h3 className="text-xl font-semibold text-slate-800">{s.letter}: {s.title}</h3><p className="text-slate-600">{s.subtitle}</p></div></div>
        <div className="bg-white rounded-lg p-4 mb-4"><div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium text-amber-700">Coaching Prompts</span></div><ul className="space-y-2">{s.prompts.map((p, i) => (<li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-amber-400 mt-1">•</span>{p}</li>))}</ul></div>
        <textarea value={data.care[s.letter]} onChange={(e) => updateCare(s.letter, e.target.value)} placeholder={s.placeholder} rows={4} className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none resize-none" />
      </div>
      <div className="flex justify-between"><button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50">← Previous</button><button onClick={() => setIdx(Math.min(CARE_STEPS.length - 1, idx + 1))} disabled={idx === CARE_STEPS.length - 1} className="text-sm text-amber-600 hover:text-amber-700 disabled:opacity-50">Next →</button></div>
    </div>
  )
}

function ClearStepUI({ data, updateClear }) {
  const [idx, setIdx] = useState(0)
  const s = CLEAR_STEPS[idx]
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8"><div className="flex items-center gap-3 mb-2"><Shield className="w-6 h-6 text-teal-600" /><h2 className="text-2xl font-semibold text-slate-800">CLEAR: Establish Structure</h2></div><p className="text-slate-600">Prepare the clear, specific elements.</p></div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{CLEAR_STEPS.map((step, i) => (<button key={step.letter} onClick={() => setIdx(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${idx === i ? 'bg-teal-600 text-white shadow-lg' : data.clear[step.letter] ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><span className="font-bold">{step.letter}</span><span className="text-sm">{step.title}</span>{data.clear[step.letter] && idx !== i && <CheckCircle className="w-4 h-4" />}</button>))}</div>
      <div className="bg-teal-50/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color }}><s.icon className="w-6 h-6 text-white" /></div><div><h3 className="text-xl font-semibold text-slate-800">{s.letter}: {s.title}</h3><p className="text-slate-600">{s.subtitle}</p></div></div>
        <div className="bg-white rounded-lg p-4 mb-4"><div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-teal-500" /><span className="text-sm font-medium text-teal-700">Coaching Prompts</span></div><ul className="space-y-2">{s.prompts.map((p, i) => (<li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-teal-400 mt-1">•</span>{p}</li>))}</ul></div>
        <textarea value={data.clear[s.letter]} onChange={(e) => updateClear(s.letter, e.target.value)} placeholder={s.placeholder} rows={4} className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none resize-none" />
      </div>
      <div className="flex justify-between"><button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50">← Previous</button><button onClick={() => setIdx(Math.min(CLEAR_STEPS.length - 1, idx + 1))} disabled={idx === CLEAR_STEPS.length - 1} className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50">Next →</button></div>
    </div>
  )
}

function ReviewStep({ data, update }) {
  const [gen, setGen] = useState(false)
  
  const generate = async () => {
    setGen(true)
    try {
      const response = await fetch('/api/generate-starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationType: data.type,
          personName: data.personName,
          relationship: data.relationship,
          warmth: data.warmth,
          structure: data.structure,
          care: data.care
        })
      })
      const result = await response.json()
      update('starter', result.starter)
    } catch (error) {
      update('starter', "I appreciate you taking the time to meet with me today. Before I share what I've noticed, I'd really like to understand how things have been going from your perspective.")
    }
    setGen(false)
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8"><div className="flex items-center gap-3 mb-2"><CheckCircle className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-semibold text-slate-800">Review & Prepare</h2></div><p className="text-slate-600">Review your preparation.</p></div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-3"><Heart className="w-5 h-5 text-amber-600" /><span className="font-semibold text-amber-700">CARE Summary</span></div><div className="space-y-2">{CARE_STEPS.map((s) => (<div key={s.letter} className="flex items-start gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${data.care[s.letter] ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-600'}`}>{s.letter}</span><p className="text-sm text-slate-600 line-clamp-1">{data.care[s.letter] || <span className="italic text-slate-400">Not completed</span>}</p></div>))}</div></div>
        <div className="bg-teal-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-teal-600" /><span className="font-semibold text-teal-700">CLEAR Summary</span></div><div className="space-y-2">{CLEAR_STEPS.map((s) => (<div key={s.letter} className="flex items-start gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${data.clear[s.letter] ? 'bg-teal-600 text-white' : 'bg-teal-200 text-teal-600'}`}>{s.letter}</span><p className="text-sm text-slate-600 line-clamp-1">{data.clear[s.letter] || <span className="italic text-slate-400">Not completed</span>}</p></div>))}</div></div>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 mb-6"><h3 className="font-semibold text-slate-800 mb-3">Approach: {getQuadrantLabel(data.warmth, data.structure)}</h3><div className="flex items-center gap-4"><div className="flex-1"><div className="flex justify-between text-xs text-slate-500 mb-1"><span>Low Warmth</span><span>High</span></div><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-slate-400 to-amber-500 rounded-full" style={{ width: `${data.warmth}%` }} /></div></div><div className="flex-1"><div className="flex justify-between text-xs text-slate-500 mb-1"><span>Low Structure</span><span>High</span></div><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-slate-400 to-teal-500 rounded-full" style={{ width: `${data.structure}%` }} /></div></div></div></div>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-6"><div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-amber-400" /><span className="font-semibold text-white">AI-Suggested Opening</span></div>{data.starter ? (<div className="bg-white/10 rounded-lg p-4 mb-4"><p className="text-white/90 italic">&quot;{data.starter}&quot;</p></div>) : (<p className="text-white/60 mb-4">Generate a personalized opener using Claude AI.</p>)}<button onClick={generate} disabled={gen} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-50">{gen ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : (<><RotateCcw className="w-4 h-4" />{data.starter ? 'Regenerate' : 'Generate'}</>)}</button></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label><textarea value={data.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any other reminders..." rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /></div>
    </div>
  )
}

// ============================================
// LIVE MODE
// ============================================
function LiveMode({ conv, onComplete }) {
  const [active, setActive] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState('')
  const [check, setCheck] = useState({ care: { C: false, A: false, R: false, E: false }, clear: { C: false, L: false, E: false, A: false, R: false } })
  
  useEffect(() => { let i; if (active) i = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(i) }, [active])
  
  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const add = (t) => { if (!note.trim()) return; setNotes([...notes, { text: note, type: t, time: elapsed, id: Date.now() }]); setNote('') }
  const toggle = (f, l) => setCheck(p => ({ ...p, [f]: { ...p[f], [l]: !p[f][l] } }))
  const careP = Object.values(check.care).filter(Boolean).length
  const clearP = Object.values(check.clear).filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-semibold text-slate-800">{conv?.title || 'Live Conversation'}</h1><p className="text-sm text-slate-500">with {conv?.personName || 'Team Member'}</p></div>
          <div className="flex items-center gap-4"><div className="text-right"><p className="text-3xl font-mono font-bold text-slate-800">{fmt(elapsed)}</p>{elapsed > 1800 && <p className="text-xs text-amber-600">Consider a break</p>}</div><button onClick={() => setActive(!active)} className={`w-12 h-12 rounded-full flex items-center justify-center ${active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>{active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Heart className="w-4 h-4 text-amber-500" /><span className="font-semibold text-slate-700 text-sm">CARE</span></div><span className="text-xs text-slate-500">{careP}/4</span></div><div className="space-y-2">{CARE_STEPS.map((s) => (<button key={s.letter} onClick={() => toggle('care', s.letter)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${check.care[s.letter] ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${check.care[s.letter] ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>{check.care[s.letter] && <CheckCircle className="w-3 h-3 text-white" />}</div><span className="font-bold text-sm">{s.letter}</span><span className="text-xs">{s.title}</span></button>))}</div></div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" /><span className="font-semibold text-slate-700 text-sm">CLEAR</span></div><span className="text-xs text-slate-500">{clearP}/5</span></div><div className="space-y-2">{CLEAR_STEPS.map((s) => (<button key={s.letter} onClick={() => toggle('clear', s.letter)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${check.clear[s.letter] ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${check.clear[s.letter] ? 'border-teal-600 bg-teal-600' : 'border-slate-300'}`}>{check.clear[s.letter] && <CheckCircle className="w-3 h-3 text-white" />}</div><span className="font-bold text-sm">{s.letter}</span><span className="text-xs">{s.title}</span></button>))}</div></div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Conversation Notes</h2>
            <div className="mb-4"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Capture a thought, quote, or observation..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /><div className="flex gap-2 mt-2 flex-wrap"><button onClick={() => add('quote')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm hover:bg-purple-200"><MessageCircle className="w-3 h-3" />Quote</button><button onClick={() => add('action')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm hover:bg-green-200"><CheckCircle className="w-3 h-3" />Action</button><button onClick={() => add('followup')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm hover:bg-amber-200"><Clock className="w-3 h-3" />Follow-up</button><button onClick={() => add('note')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"><Plus className="w-3 h-3" />Note</button></div></div>
            <div className="space-y-2 max-h-60 overflow-y-auto">{notes.length === 0 ? (<p className="text-center text-slate-400 py-8">No notes yet.</p>) : notes.map((n) => (<div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.type === 'quote' ? 'bg-purple-50' : n.type === 'action' ? 'bg-green-50' : n.type === 'followup' ? 'bg-amber-50' : 'bg-slate-50'}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${n.type === 'quote' ? 'bg-purple-200 text-purple-700' : n.type === 'action' ? 'bg-green-200 text-green-700' : n.type === 'followup' ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>{n.type === 'quote' && <MessageCircle className="w-3 h-3" />}{n.type === 'action' && <CheckCircle className="w-3 h-3" />}{n.type === 'followup' && <Clock className="w-3 h-3" />}{n.type === 'note' && <Plus className="w-3 h-3" />}</div><div className="flex-1"><p className="text-sm text-slate-700">{n.text}</p><p className="text-xs text-slate-400 mt-1">{fmt(n.time)}</p></div></div>))}</div>
          </div>
          <div className="mt-6 flex justify-end"><button onClick={() => onComplete({ ...conv, notes, check, duration: elapsed, status: 'completed' })} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/20"><Square className="w-4 h-4" />End Conversation</button></div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// REFLECTION
// ============================================
function Reflection({ conv, onComplete }) {
  const [r, setR] = useState({ careRating: 3, clearRating: 3, whatWorked: '', whatToImprove: '', nextSteps: '', mood: '' })
  const moods = [{ v: 'accomplished', e: '✨', l: 'Accomplished' }, { v: 'hopeful', e: '🌱', l: 'Hopeful' }, { v: 'uncertain', e: '🤔', l: 'Uncertain' }, { v: 'concerned', e: '😟', l: 'Concerned' }, { v: 'relieved', e: '😌', l: 'Relieved' }]
  const upd = (k, v) => setR(p => ({ ...p, [k]: v }))
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Reflection Time</h1><p className="text-slate-600">Process and learn from this conversation.</p></div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 sm:p-8 space-y-8">
        {conv && (<div className="bg-slate-50 rounded-xl p-4"><p className="font-medium text-slate-800">{conv.title}</p><p className="text-sm text-slate-500">Duration: {Math.floor((conv.duration || 0) / 60)} min • {conv.notes?.length || 0} notes</p></div>)}
        <div><label className="block text-sm font-medium text-slate-700 mb-3">How do you feel?</label><div className="flex flex-wrap gap-2">{moods.map((m) => (<button key={m.v} onClick={() => upd('mood', m.v)} className={`flex items-center gap-2 px-4 py-2 rounded-full ${r.mood === m.v ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><span className="text-lg">{m.e}</span><span className="text-sm">{m.l}</span></button>))}</div></div>
        <div className="grid sm:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-amber-500" />CARE effectiveness</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => (<button key={n} onClick={() => upd('careRating', n)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${r.careRating >= n ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{n}</button>))}</div></div><div><label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" />CLEAR effectiveness</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => (<button key={n} onClick={() => upd('clearRating', n)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${r.clearRating >= n ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{n}</button>))}</div></div></div>
        <div className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-2">What worked well?</label><textarea value={r.whatWorked} onChange={(e) => upd('whatWorked', e.target.value)} placeholder="Describe effective moments..." rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">What would you do differently?</label><textarea value={r.whatToImprove} onChange={(e) => upd('whatToImprove', e.target.value)} placeholder="Consider adjustments..." rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">Next steps</label><textarea value={r.nextSteps} onChange={(e) => upd('nextSteps', e.target.value)} placeholder="What actions need to happen?" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" /></div></div>
        <div className="flex justify-end pt-4"><button onClick={onComplete} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/20"><Archive className="w-4 h-4" />Save to Archive</button></div>
      </div>
    </div>
  )
}

// ============================================
// ARCHIVE VIEW
// ============================================
function ArchiveView({ conversations = [], onSelect }) {
  const [q, setQ] = useState('')
  const filtered = conversations.filter(c => c.title?.toLowerCase().includes(q.toLowerCase()) || c.personName?.toLowerCase().includes(q.toLowerCase()))
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Conversation Archive</h1><p className="text-slate-600">Review and learn from past conversations.</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4 mb-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" /></div></div>
      <div className="space-y-4">{filtered.length === 0 ? (<div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-12 text-center"><Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-slate-600 mb-2">No conversations yet</h3><p className="text-slate-500">Start a new conversation to build your archive.</p></div>) : filtered.map((c) => (<button key={c.id} onClick={() => onSelect(c)} className="w-full bg-white rounded-xl shadow-sm border border-slate-200/50 p-4 hover:shadow-md transition-all text-left group"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-teal-600" /></div><div><h3 className="font-medium text-slate-800 group-hover:text-teal-700">{c.title || 'Untitled'}</h3><p className="text-sm text-slate-500">{c.personName} • {c.date}</p></div></div><div className="flex items-center gap-3"><span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.status === 'completed' ? 'Completed' : 'Prepared'}</span><ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" /></div></div></button>))}</div>
    </div>
  )
}

// ============================================
// LEARN MODULE
// ============================================
function LearnModule() {
  const [tab, setTab] = useState('overview')
  const [scenario, setScenario] = useState(null)
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Learn the Framework</h1><p className="text-slate-600">Master Clear & Care through examples and practice.</p></div>
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">{[{ id: 'overview', label: 'Overview', icon: BookOpen }, { id: 'scenarios', label: 'Practice', icon: Play }, { id: 'quiz', label: 'Certification', icon: Award }].map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${tab === t.id ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}><t.icon className="w-4 h-4" />{t.label}</button>))}</div>
      {tab === 'overview' && (<div className="grid md:grid-cols-2 gap-6"><div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-2xl p-6 border border-amber-200/50"><div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"><Heart className="w-7 h-7 text-white" /></div><div><h3 className="text-2xl font-semibold text-amber-800">CARE</h3><p className="text-sm text-amber-600">The Warmth Side</p></div></div><div className="space-y-3">{CARE_STEPS.map((s) => (<div key={s.letter} className="bg-white/60 rounded-xl p-3"><span className="text-amber-600 font-bold">{s.letter}</span><span className="text-slate-700 text-sm ml-2">{s.title}</span></div>))}</div></div><div className="bg-gradient-to-br from-teal-50 to-teal-100/30 rounded-2xl p-6 border border-teal-200/50"><div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30"><Shield className="w-7 h-7 text-white" /></div><div><h3 className="text-2xl font-semibold text-teal-800">CLEAR</h3><p className="text-sm text-teal-600">The Structure Side</p></div></div><div className="space-y-3">{CLEAR_STEPS.map((s) => (<div key={s.letter} className="bg-white/60 rounded-xl p-3"><span className="text-teal-600 font-bold">{s.letter}</span><span className="text-slate-700 text-sm ml-2">{s.title}</span></div>))}</div></div></div>)}
      {tab === 'scenarios' && !scenario && (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{SAMPLE_SCENARIOS.map((s) => { const T = CONVERSATION_TYPES.find(t => t.id === s.type)?.icon || MessageCircle; return (<button key={s.id} onClick={() => setScenario(s)} className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-5 text-left hover:shadow-md hover:-translate-y-1 transition-all group"><div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:bg-teal-100"><T className="w-5 h-5" /></div><h3 className="font-semibold text-slate-800 mb-1">{s.title}</h3><p className="text-sm text-slate-600 line-clamp-2">{s.description}</p><div className="mt-3 flex items-center gap-2 text-xs text-teal-600"><Play className="w-3 h-3" />Practice</div></button>) })}</div>)}
      {tab === 'scenarios' && scenario && <ScenarioPractice s={scenario} onBack={() => setScenario(null)} />}
      {tab === 'quiz' && (<div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8 text-center"><Award className="w-16 h-16 text-amber-500 mx-auto mb-4" /><h2 className="text-2xl font-semibold text-slate-800 mb-2">Get Certified</h2><p className="text-slate-600 mb-6 max-w-md mx-auto">Complete the quiz to demonstrate your mastery.</p><button className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20">Start Quiz</button></div>)}
    </div>
  )
}

function ScenarioPractice({ s, onBack }) {
  const [msgs, setMsgs] = useState([{ role: 'system', content: `Scenario: ${s.description}\n\nContext: ${s.context}` }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  
  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMsgs([...msgs, userMsg])
    setInput('')
    setTyping(true)
    
    try {
      const response = await fetch('/api/practice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: s.id,
          messages: msgs.filter(m => m.role !== 'system'),
          userMessage: input
        })
      })
      const result = await response.json()
      setMsgs(p => [...p, { role: 'assistant', content: result.response }])
    } catch (error) {
      setMsgs(p => [...p, { role: 'assistant', content: "I appreciate you taking the time to talk with me about this." }])
    }
    setTyping(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200/50 p-4 flex items-center gap-4"><button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg"><ChevronLeft className="w-5 h-5" /></button><div><h2 className="font-semibold text-slate-800">{s.title}</h2><p className="text-sm text-slate-500">Practice with Claude AI</p></div></div>
      <div className="h-80 overflow-y-auto p-4 space-y-4">{msgs.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'system' ? 'bg-amber-50 text-amber-800' : m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'}`}><p className="text-sm">{m.content}</p></div></div>))}{typing && (<div className="flex justify-start"><div className="bg-slate-100 rounded-2xl px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>)}</div>
      <div className="border-t border-slate-200/50 p-4"><div className="flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && send()} placeholder="Practice your response..." className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" /><button onClick={send} className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700"><Send className="w-5 h-5" /></button></div></div>
    </div>
  )
}

// ============================================
// TEAM VIEW
// ============================================
function TeamView() {
  const team = [{ id: 1, name: 'Sarah Johnson', role: 'Assistant Principal', convs: 12, rating: 4.2 }, { id: 2, name: 'Michael Chen', role: 'Department Head', convs: 8, rating: 3.8 }, { id: 3, name: 'Lisa Williams', role: 'Teacher Leader', convs: 15, rating: 4.5 }]
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Team Dashboard</h1><p className="text-slate-600">Support your team&apos;s conversation development.</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[{ l: 'Conversations', v: '35', icon: MessageCircle, bg: 'bg-teal-100', fg: 'text-teal-600' }, { l: 'Team Members', v: '3', icon: Users, bg: 'bg-amber-100', fg: 'text-amber-600' }, { l: 'Avg Rating', v: '4.2', icon: Star, bg: 'bg-purple-100', fg: 'text-purple-600' }, { l: 'This Week', v: '+8', icon: TrendingUp, bg: 'bg-green-100', fg: 'text-green-600' }].map((s, i) => (<div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4"><div className={`w-10 h-10 rounded-lg ${s.bg} ${s.fg} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div><p className="text-2xl font-bold text-slate-800">{s.v}</p><p className="text-sm text-slate-500">{s.l}</p></div>))}</div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6"><h2 className="text-lg font-semibold text-slate-800 mb-4">Team Members</h2><div className="space-y-3">{team.map((m) => (<div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">{m.name.split(' ').map(n => n[0]).join('')}</div><div><p className="font-medium text-slate-800">{m.name}</p><p className="text-sm text-slate-500">{m.role}</p></div></div><div className="text-right"><p className="text-sm font-medium text-slate-800">{m.convs} conversations</p><div className="flex items-center gap-1 justify-end"><Star className="w-3 h-3 text-amber-500 fill-current" /><span className="text-sm text-slate-500">{m.rating}</span></div></div></div>))}</div></div>
    </div>
  )
}

// ============================================
// PRICING VIEW
// ============================================
function PricingView() {
  const plans = [
    { name: 'Personal', price: 'Free', period: '', desc: 'For individuals starting out', features: ['5 preps/month', 'Basic framework', 'Self-reflection', 'Learning module'], cta: 'Get Started', hl: false },
    { name: 'Professional', price: '$12', period: '/mo', desc: 'For committed educators', features: ['Unlimited preps', 'AI coaching', 'Archive & search', 'Practice scenarios', 'Analytics'], cta: 'Start Free Trial', hl: true },
    { name: 'Team', price: '$29', period: '/user/mo', desc: 'For schools & districts', features: ['Everything in Pro', 'Team dashboard', 'Supervisor tools', 'Custom scenarios', 'Priority support'], cta: 'Contact Sales', hl: false }
  ]
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center mb-12"><h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-4">Simple, Transparent Pricing</h1><p className="text-lg text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your needs.</p></div>
      <div className="grid md:grid-cols-3 gap-6">{plans.map((p, i) => (<div key={i} className={`rounded-2xl p-6 sm:p-8 ${p.hl ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-500/30 scale-105' : 'bg-white border border-slate-200 shadow-sm'}`}>{p.hl && <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">Most Popular</div>}<h3 className={`text-xl font-semibold mb-2 ${p.hl ? 'text-white' : 'text-slate-800'}`}>{p.name}</h3><p className={`text-sm mb-4 ${p.hl ? 'text-teal-100' : 'text-slate-600'}`}>{p.desc}</p><div className="mb-6"><span className={`text-4xl font-bold ${p.hl ? 'text-white' : 'text-slate-800'}`}>{p.price}</span><span className={p.hl ? 'text-teal-100' : 'text-slate-500'}>{p.period}</span></div><ul className="space-y-3 mb-8">{p.features.map((f, j) => (<li key={j} className="flex items-start gap-2"><CheckCircle className={`w-5 h-5 shrink-0 ${p.hl ? 'text-teal-200' : 'text-teal-500'}`} /><span className={`text-sm ${p.hl ? 'text-teal-50' : 'text-slate-600'}`}>{f}</span></li>))}</ul><button className={`w-full py-3 rounded-xl font-medium transition-all ${p.hl ? 'bg-white text-teal-700 hover:bg-teal-50' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>{p.cta}</button></div>))}</div>
    </div>
  )
}

// ============================================
// LANDING VIEW
// ============================================
function LandingView({ onStart }) {
  return (
    <div className="overflow-hidden">
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-800 mb-6 leading-tight">Navigate difficult conversations with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-amber-500">clarity and care</span></h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">The Clear & Care framework helps educators have hard conversations that transform relationships and build accountability.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"><button onClick={onStart} className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:from-teal-700 hover:to-teal-800 shadow-xl shadow-teal-500/30 text-lg">Start Your First Conversation</button><button className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 shadow-sm text-lg">Watch Demo</button></div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-16"><h2 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-4">Two frameworks, one powerful conversation</h2><p className="text-lg text-slate-600 max-w-2xl mx-auto">Blend warmth and structure to create conversations that honor relationships while driving change.</p></div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-3xl p-8 border border-amber-200/50"><div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"><Heart className="w-7 h-7 text-white" /></div><div><h3 className="text-2xl font-semibold text-amber-800">CARE</h3><p className="text-amber-600">Lead with warmth</p></div></div><div className="grid grid-cols-2 gap-3">{CARE_STEPS.map((s) => (<div key={s.letter} className="bg-white/60 rounded-xl p-3"><span className="text-amber-600 font-bold">{s.letter}</span><span className="text-slate-700 text-sm ml-2">{s.title}</span></div>))}</div></div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/30 rounded-3xl p-8 border border-teal-200/50"><div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30"><Shield className="w-7 h-7 text-white" /></div><div><h3 className="text-2xl font-semibold text-teal-800">CLEAR</h3><p className="text-teal-600">Establish structure</p></div></div><div className="grid grid-cols-2 gap-3">{CLEAR_STEPS.map((s) => (<div key={s.letter} className="bg-white/60 rounded-xl p-3"><span className="text-teal-600 font-bold">{s.letter}</span><span className="text-slate-700 text-sm ml-2">{s.title}</span></div>))}</div></div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center mb-16"><h2 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-4">Everything you need to succeed</h2></div>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[{ icon: Sparkles, title: 'AI Coaching', desc: 'Real-time prompts and suggestions' }, { icon: Clock, title: 'Live Support', desc: 'Reminders and checklists during conversation' }, { icon: BookOpen, title: 'Practice Scenarios', desc: 'Role-play with AI before real conversations' }, { icon: Archive, title: 'Track Progress', desc: 'Review past conversations and growth' }, { icon: Users, title: 'Team Features', desc: 'Support your team with dashboards' }, { icon: Lock, title: 'Private & Secure', desc: 'Conversations stay confidential' }].map((f, i) => (<div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-all"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-teal-600" /></div><h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3><p className="text-sm text-slate-600">{f.desc}</p></div>))}</div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center"><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">Ready to transform your conversations?</h2><p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of educators having more effective, more human conversations.</p><button onClick={onStart} className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 shadow-xl shadow-amber-500/30 text-lg">Get Started Free</button></div>
      </section>
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div><span className="text-white font-semibold">Clear & Care</span></div><p className="text-slate-400 text-sm">© 2025 Clear & Care. Built by J Fraser.</p></div></footer>
    </div>
  )
}
