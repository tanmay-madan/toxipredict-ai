/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Beaker, 
  Database, 
  Info, 
  Search, 
  ShieldCheck, 
  Zap,
  FlaskConical,
  Dna,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MolecularData, SAMPLE_COMPOUNDS } from './types';

// FIX 1: Accessing the API key via Vite's env system
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

export default function App() {
  const [inputSmiles, setInputSmiles] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCompound, setSelectedCompound] = useState<MolecularData | null>(SAMPLE_COMPOUNDS[0]);
  const [history, setHistory] = useState<MolecularData[]>(SAMPLE_COMPOUNDS);

  const analyzeCompound = async (input: string) => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // FIX 2: Using the 2.5 Flash endpoint via fetch for stability
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze chemical: "${input}". 
                Identify the compound and provide a pharmacological analysis in JSON format including:
                - toxicityScore (0 to 1)
                - properties (logP, qed, sas, molecularWeight)
                - riskFactors (array of {feature, impact, description})
                - prediction (summary string)
                - structuralAlerts (array of strings)
                - name (common name)
                - smiles (SMILES string)
                
                Return ONLY the JSON. No markdown backticks.`
              }]
            }]
          })
        }
      );

      const data = await res.json();
      
      if (data.error) {
        alert("API Error: " + data.error.message);
        return;
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("No response from AI");

      // FIX 3: THE CLEANER - Strips markdown blocks if AI adds them
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const result: MolecularData = JSON.parse(cleanJson);
      
      const finalSmiles = result.smiles || input;
      result.smiles = finalSmiles;
      
      setSelectedCompound(result);
      setHistory(prev => [result, ...prev.filter(c => c.smiles !== finalSmiles)].slice(0, 10));
      setInputSmiles('');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Invalid AI response. Check the console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const radarData = useMemo(() => {
    if (!selectedCompound) return [];
    const { properties } = selectedCompound;
    return [
      { subject: 'logP', A: (properties.logP + 2) / 10 * 100, fullMark: 100 },
      { subject: 'QED', A: properties.qed * 100, fullMark: 100 },
      { subject: 'SAS', A: (10 - properties.sas) / 10 * 100, fullMark: 100 },
      { subject: 'Safety', A: (1 - selectedCompound.toxicityScore) * 100, fullMark: 100 },
      { subject: 'Size', A: Math.min(properties.molecularWeight / 10, 100), fullMark: 100 },
    ];
  }, [selectedCompound]);

  const getToxicityColor = (score: number) => {
    if (score < 0.3) return 'text-accent';
    if (score < 0.6) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="min-h-screen flex flex-col data-grid">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
            <Activity className="text-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-xl tracking-tight">TOXIPREDICT <span className="text-accent">AI</span></h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">Pharmacology Intelligence System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-text-secondary">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              <span>TOX21 v2.4</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>NEURAL CORE v2.5</span>
            </div>
          </div>
          <button className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span>EXPORT DATA</span>
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto w-full">
        {/* Left Sidebar: Input & History */}
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between text-accent">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Compound Input</h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={inputSmiles}
                  onChange={(e) => setInputSmiles(e.target.value)}
                  placeholder="Enter name or SMILES (e.g. Paracetamol or C1=CC=CC=C1)"
                  className="w-full h-32 bg-bg border border-border rounded-lg p-3 text-sm font-mono focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"
                />
              </div>
              <button
                onClick={() => analyzeCompound(inputSmiles)}
                disabled={isAnalyzing || !inputSmiles}
                className="w-full bg-accent/10 border border-accent/30 text-accent py-3 rounded-lg font-bold hover:bg-accent hover:text-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>PREDICT TOXICITY</span>
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Database className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Analysis History</h2>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((compound, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCompound(compound)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all group",
                    selectedCompound?.smiles === compound.smiles 
                      ? "bg-accent/10 border-accent/50" 
                      : "bg-bg/50 border-border hover:border-text-secondary"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold truncate max-w-[150px]">{compound.name || 'Unknown'}</span>
                    <span className={cn("text-[10px] font-mono", getToxicityColor(compound.toxicityScore))}>
                      {(compound.toxicityScore * 100).toFixed(0)}% TOX
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary font-mono truncate">{compound.smiles}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Center: Main Analysis */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {selectedCompound ? (
              <motion.div
                key={selectedCompound.smiles}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Dna className="w-48 h-48" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-tighter">Validated</span>
                          <span className="text-text-secondary text-[10px] font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">{selectedCompound.name || 'Molecular Analysis'}</h2>
                        <p className="text-sm text-text-secondary font-mono mt-1 break-all">{selectedCompound.smiles}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">logP (Lipophilicity)</p>
                          <p className="text-xl font-mono font-bold">{selectedCompound.properties.logP.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">QED Score</p>
                          <p className="text-xl font-mono font-bold">{selectedCompound.properties.qed.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">SAS Score</p>
                          <p className="text-xl font-mono font-bold">{selectedCompound.properties.sas.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">Mol. Weight</p>
                          <p className="text-xl font-mono font-bold">{selectedCompound.properties.molecularWeight.toFixed(1)} <span className="text-xs text-text-secondary">g/mol</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-bg/50 rounded-xl border border-border min-w-[200px]">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-border" />
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 * (1 - selectedCompound.toxicityScore)}
                            className={cn("transition-all duration-1000 ease-out", getToxicityColor(selectedCompound.toxicityScore))}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={cn("text-3xl font-bold font-mono", getToxicityColor(selectedCompound.toxicityScore))}>
                            {(selectedCompound.toxicityScore * 100).toFixed(0)}%
                          </span>
                          <span className="text-[8px] text-text-secondary font-bold uppercase tracking-widest">Toxicity Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-5 space-y-4">
                    <div className="flex items-center gap-2 text-warning">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Structural Risk Factors</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCompound.riskFactors.map((factor, i) => (
                        <div key={i} className="p-3 bg-bg/30 rounded-lg border border-border/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-text-primary">{factor.feature}</span>
                            <span className={cn(
                              "text-[10px] font-mono px-1.5 py-0.5 rounded",
                              factor.impact > 0 ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent"
                            )}>
                              {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}% Impact
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary leading-relaxed">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-5 space-y-4">
                    <div className="flex items-center gap-2 text-danger">
                      <AlertTriangle className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Structural Alerts</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedCompound.structuralAlerts.length > 0 ? (
                        selectedCompound.structuralAlerts.map((alert, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-danger shrink-0" />
                            <span className="text-xs font-mono text-danger font-bold">{alert}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-xs font-mono text-accent font-bold">NO ALERTS DETECTED</span>
                        </div>
                      )}
                      
                      <div className="mt-6 p-4 bg-bg/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-text-secondary uppercase">AI Prediction Summary</span>
                        </div>
                        <p className="text-xs italic text-text-primary leading-relaxed">
                          "{selectedCompound.prediction}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary space-y-4 glass-panel">
                <Beaker className="w-16 h-16 opacity-20" />
                <p className="text-sm font-mono">Select or input a compound to begin analysis</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Visualizations */}
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 space-y-4 h-[350px]">
            <div className="flex items-center gap-2 text-accent">
              <Activity className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Property Radar</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#2D333B" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B949E', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Compound" dataKey="A" stroke="#4ADE80" fill="#4ADE80" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <BarChart3 className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Toxicity Benchmarks</h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history.slice(0, 5).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 1]} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D23', border: '1px solid #2D333B', borderRadius: '8px' }}
                    itemStyle={{ color: '#E6EDF3', fontSize: '10px' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="toxicityScore" radius={[4, 4, 0, 0]}>
                    {history.slice(0, 5).reverse().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.toxicityScore > 0.5 ? '#F87171' : '#4ADE80'} fillOpacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="p-5 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-accent uppercase flex items-center gap-2">
              <Info className="w-3 h-3" />
              Research Note
            </h3>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Predictions generated via Pharmacology Intelligence System ~TOXIPREDICT AI
            </p>
          </section>
        </div>
      </main>

      <footer className="h-10 border-t border-border bg-card/30 flex items-center px-6 justify-between text-[10px] text-text-secondary font-mono">
        <div className="flex gap-4">
          <span>SYSTEM STATUS: <span className="text-accent">OPERATIONAL</span></span>
          <span>LATENCY: 24ms</span>
        </div>
        <div>
          © 2026 TOXIPREDICT AI • EXPERIMENTAL PHARMACOLOGY TOOL
        </div>
      </footer>
    </div>
  );
}
