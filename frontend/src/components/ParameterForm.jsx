import { useState } from 'react';
import axios from 'axios';

// --- NEW: Define parameter metadata, including slider ranges ---
// I've estimated reasonable min/max/step values from your dataset
const parameters = [
  { name: 'u', placeholder: 'u (UV)', min: 10, max: 30, step: 0.1 },
  { name: 'g', placeholder: 'g (Green)', min: 10, max: 30, step: 0.1 },
  { name: 'r', placeholder: 'r (Red)', min: 10, max: 30, step: 0.1 },
  { name: 'i', placeholder: 'i (IR)', min: 10, max: 30, step: 0.1 },
  { name: 'z', placeholder: 'z (Far IR)', min: 10, max: 30, step: 0.1 },
  { name: 'redshift', placeholder: 'Redshift', min: -0.5, max: 5, step: 0.01 },
];

const exampleData = {
  STAR: { u: 18.85, g: 17.63, r: 16.90, i: 16.60, z: 16.39, redshift: -0.000089 },
  GALAXY: { u: 19.47, g: 17.91, r: 17.02, i: 16.63, z: 16.37, redshift: 0.080111 },
  QSO: { u: 19.29, g: 19.24, r: 19.06, i: 18.96, z: 18.89, redshift: 1.854089 },
};

const initialState = parameters.reduce((acc, param) => {
  acc[param.name] = '';
  return acc;
}, {});

export default function ParameterForm({ setIsLoading, setApiResult, setPredictionLog }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Ensure it's stored as a number, or empty string if cleared
      [name]: value === '' ? '' : Number(value) 
    }));
  };

  const loadExample = (type) => {
    setFormData(exampleData[type]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiResult(null); 
    try {
      const response = await axios.post('https://nebulalens-core.onrender.com/predict', formData);
      setApiResult(response.data); 
      
      // --- NEW: Add successful result to the log ---
      // We add a unique ID for React's .map() key
      setPredictionLog(prev => [
        { id: crypto.randomUUID(), ...response.data }, 
        ...prev
      ]);

    } catch (error) {
      console.error("Error fetching prediction:", error);
      setApiResult({ error: "Failed to get prediction." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h2 className="text-left font-semibold text-lg">Enter Object Parameters</h2>
      
      <div className="flex gap-2 my-4">
        <span className="text-xs text-white/60 py-1">Load Example:</span>
        <button type="button" onClick={() => loadExample('STAR')} className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded-md hover:border-cosmic-accent">Star</button>
        <button type="button" onClick={() => loadExample('GALAXY')} className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded-md hover:border-cosmic-accent">Galaxy</button>
        <button type="button" onClick={() => loadExample('QSO')} className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded-md hover:border-cosmic-accent">QSO</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {parameters.map((param) => (
            <div key={param.name}>
              {/* --- 1. The Text Input --- */}
              <label className="text-sm text-white/70">{param.placeholder}</label>
              <input
                type="number"
                name={param.name}
                placeholder={param.placeholder}
                value={formData[param.name]}
                onChange={handleChange}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-cosmic-accent w-full mt-1"
                step={param.step} 
                required
              />
              {/* --- 2. The Interactive Slider --- */}
              <input
                type="range"
                name={param.name}
                min={param.min}
                max={param.max}
                step={param.step}
                value={formData[param.name]}
                onChange={handleChange}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer range-sm accent-cosmic-accent mt-2"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-end">
          <button 
            type="submit" 
            className="bg-cosmic-accent text-black px-6 py-2 rounded-lg font-semibold hover:shadow-glow transition"
          >
            Predict
          </button>
        </div>
      </form>
    </div>
  );
}