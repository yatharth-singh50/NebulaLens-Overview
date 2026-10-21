import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- CONFIGURATION ---
const ENABLE_AI_EXPLANATION = false;
const TYPEWRITER_SPEED_MS = 5;

// --- HELPER: Color Mapping for Classes ---
const getClassColor = (cls) => {
  switch (cls) {
    case 'STAR': return 'bg-yellow-400';
    case 'GALAXY': return 'bg-blue-400';
    case 'QSO': return 'bg-red-400';
    default: return 'bg-gray-500';
  }
};

// --- HELPER: Calculate Consensus on the Frontend ---
// We use this to calculate the "Classical Ensemble" result separately from the DL model
const calculateConsensus = (preds) => {
  const votes = Object.values(preds)
    .map(p => p.prediction)
    .filter(p => p !== 'Error');
  
  if (votes.length === 0) return { prediction: 'Unknown', count: 0, total: 0 };
  
  const counts = {};
  votes.forEach(v => counts[v] = (counts[v] || 0) + 1);
  
  const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  
  return {
    prediction: winner,
    count: counts[winner],
    total: votes.length
  };
};

// --- COMPONENT: Probability Bars ---
const ProbabilityBreakdown = ({ probabilities }) => {
  const sortedProbs = Object.entries(probabilities)
    .sort(([, probA], [, probB]) => probB - probA);

  return (
    <div className="space-y-2 mt-2">
      {sortedProbs.map(([className, prob]) => (
        <div key={className} className="text-xs">
          <div className="flex justify-between text-white/70 mb-0.5">
            <span>{className}</span>
            <span>{(prob * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5 border border-white/10">
            <div
              className={`${getClassColor(className)} h-full rounded-full opacity-80`}
              style={{ width: `${prob * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENT: Comparison Graph ---
const ComparisonGraph = ({ predictions }) => {
  return (
    <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10">
      <div className="space-y-3">
        {Object.entries(predictions).map(([modelName, data]) => {
          const isError = data.prediction === "Error";
          const colorClass = isError ? 'bg-gray-700' : getClassColor(data.prediction);
          const width = isError ? 0 : data.confidence * 100;
          
          return (
            <div key={modelName} className="relative group">
              <div className="flex justify-between text-[10px] mb-1 uppercase tracking-wider text-white/60">
                <span>{modelName}</span>
              </div>
              
              <div className="w-full bg-white/5 h-6 rounded-md relative overflow-hidden flex items-center">
                 <div 
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out flex items-center justify-end px-2`}
                    style={{ width: `${width}%` }}
                 >
                 </div>
                 <span className="absolute left-2 text-[10px] font-bold text-white/90 drop-shadow-md">
                    {isError ? "ERR" : data.prediction}
                 </span>
                 <span className="absolute right-2 text-[10px] font-bold text-white/90">
                    {isError ? "" : `${width.toFixed(0)}%`}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- CARD 1: GLOBAL CONSENSUS & AI ---
const GlobalConsensusCard = ({ agreement, explanation, isLoading, error }) => {
  const [typedExplanation, setTypedExplanation] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (explanation) {
      setTypedExplanation('');
      setIsTyping(true);
      const intervalId = setInterval(() => {
        setTypedExplanation((prev) => {
          if (prev.length === explanation.length) {
            clearInterval(intervalId);
            setIsTyping(false);
            return prev;
          }
          return prev + explanation.charAt(prev.length);
        });
      }, TYPEWRITER_SPEED_MS);
      return () => clearInterval(intervalId);
    }
  }, [explanation]);

  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Global Consensus</h2>
          <p className="text-xs text-white/50">Combined agreement of ALL models</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-cosmic-accent">{agreement.prediction}</div>
          <div className="text-xs text-white/60 font-mono mt-1">
            {agreement.count}/{agreement.total} Votes
          </div>
        </div>
      </div>

      {ENABLE_AI_EXPLANATION && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✨</span>
            <h3 className="font-semibold text-sm text-white/90">Gemini Analysis</h3>
          </div>
          {isLoading && <p className="text-sm text-white/50 animate-pulse pl-7">Analyzing cosmic data...</p>}
          {error && <p className="text-sm text-red-400 pl-7">Error: {error}</p>}
          {explanation && !isLoading && (
            <p className="text-sm text-white/80 whitespace-pre-line pl-7 border-l-2 border-cosmic-accent/30">
              {typedExplanation}
              {isTyping && <span className="animate-pulse ml-0.5">|</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// --- CARD 2: DEEP LEARNING HERO ---
const DeepLearningCard = ({ data }) => {
  if (!data || data.prediction === "Error") return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/60 to-black/80 p-6 group backdrop-blur-md">
      {/* Background Glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
           <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
           <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-widest">Neural Network Analysis</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
             <span className="text-xs text-white/50 block mb-1">Keras / TensorFlow Model</span>
             <div className="text-5xl font-bold text-white tracking-tight mb-2">
               {data.prediction}
             </div>
             <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-300 font-mono">
               Confidence: {(data.confidence * 100).toFixed(2)}%
             </div>
          </div>
          
          <div className="w-full sm:w-1/2 bg-black/40 p-4 rounded-lg border border-white/5">
             <span className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Probability Distribution</span>
             <ProbabilityBreakdown probabilities={data.probabilities} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CARD 3: CLASSICAL ENSEMBLE & BREAKDOWN ---
const ClassicalEnsembleCard = ({ predictions }) => {
  // Calculate consensus strictly for these models
  const consensus = calculateConsensus(predictions);

  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Classical Ensemble</h2>
          <p className="text-xs text-white/50">RF, SVM, KNN, MLP</p>
        </div>
        <div className="text-right">
           <div className="text-xl font-bold text-white">{consensus.prediction}</div>
           <div className="text-xs text-white/50">
             {consensus.count}/{consensus.total} Agreement
           </div>
        </div>
      </div>

      {/* Graph of Classical Models */}
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Model Comparison</h3>
      <ComparisonGraph predictions={predictions} />
      
      {/* Detailed Grid */}
      <div className="mt-6 pt-4 border-t border-white/10">
         <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Detailed Metrics</h3>
         <div className="grid grid-cols-2 gap-3">
           {Object.entries(predictions).map(([modelName, data]) => (
             <div key={modelName} className="bg-black/30 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-white/50 uppercase">{modelName}</span>
                 <span className={`text-xs font-bold ${data.prediction === 'QSO' ? 'text-red-400' : data.prediction === 'GALAXY' ? 'text-blue-400' : 'text-yellow-400'}`}>
                   {data.prediction}
                 </span>
               </div>
               <ProbabilityBreakdown probabilities={data.probabilities} />
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

// --- MAIN CONTAINER COMPONENT ---
export default function ResultCard({ predictions, modelAgreement, isLoading }) {
  const [explanation, setExplanation] = useState(null);
  const [isXaiLoading, setIsXaiLoading] = useState(false);
  const [xaiError, setXaiError] = useState(null);

  useEffect(() => {
    if (ENABLE_AI_EXPLANATION && modelAgreement && modelAgreement.prediction !== "Error") {
      const fetchExplanation = async () => {
        setIsXaiLoading(true);
        setXaiError(null);
        setExplanation(null);
        try {
          const response = await axios.post('https://nebulalens-core.onrender.com/get_explanation', {
            prediction: modelAgreement.prediction,
            confidence: modelAgreement.confidence, 
          });
          if (response.data.explanation) setExplanation(response.data.explanation);
          else if (response.data.error) setXaiError(response.data.error);
        } catch (err) {
          console.error(err);
          setXaiError("Failed to fetch explanation.");
        } finally {
          setIsXaiLoading(false);
        }
      };
      fetchExplanation();
    } else {
      setExplanation(null);
      setIsXaiLoading(false);
      setXaiError(null);
    }
  }, [modelAgreement]);

  if (isLoading) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-cosmic-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="font-semibold text-lg text-white/80">Processing cosmic signals...</h2>
      </div>
    );
  }

  if (!predictions || !modelAgreement) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="font-semibold text-lg mb-4">Ready to Predict</h2>
        <p className="text-white/50 text-sm text-center max-w-xs">
          Adjust parameters and run the models to analyze stellar objects.
        </p>
      </div>
    );
  }

  // Split predictions
  const dlPrediction = predictions['dl'];
  const standardPredictions = Object.fromEntries(
    Object.entries(predictions).filter(([key]) => key !== 'dl')
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Main Result (Global Consensus) */}
      <GlobalConsensusCard 
        agreement={modelAgreement} 
        explanation={explanation} 
        isLoading={isXaiLoading} 
        error={xaiError} 
      />

      {/* 2. Deep Learning Special Card */}
      {dlPrediction && <DeepLearningCard data={dlPrediction} />}

      {/* 3. Classical Models Breakdown */}
      <ClassicalEnsembleCard predictions={standardPredictions} />

    </div>
  );
}