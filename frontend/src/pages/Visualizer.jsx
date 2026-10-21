import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// --- MOCK DATA (Updated with Deep Learning) ---
const performanceMetrics = {
  rf: { accuracy: 0.97, precision: 0.97, recall: 0.97, f1_score: 0.97 },
  dl: { accuracy: 0.97, precision: 0.96, recall: 0.97, f1_score: 0.97 }, // NEW DL METRICS
  mlp: { accuracy: 0.95, precision: 0.94, recall: 0.95, f1_score: 0.94 },
  svm: { accuracy: 0.92, precision: 0.91, recall: 0.92, f1_score: 0.91 },
  knn: { accuracy: 0.89, precision: 0.88, recall: 0.89, f1_score: 0.88 }
};

// --- CHART 1: Radar Chart (Model Profiles) ---
const RadarChart = () => {
  const data = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: [
      {
        label: 'Deep Neural Network (DL)', // NEW DATASET
        data: [performanceMetrics.dl.accuracy, performanceMetrics.dl.precision, performanceMetrics.dl.recall, performanceMetrics.dl.f1_score],
        backgroundColor: 'rgba(6, 182, 212, 0.2)', // Cyan
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2,
      },
      {
        label: 'Random Forest',
        data: [performanceMetrics.rf.accuracy, performanceMetrics.rf.precision, performanceMetrics.rf.recall, performanceMetrics.rf.f1_score],
        backgroundColor: 'rgba(234, 179, 8, 0.2)', // Yellow
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 2,
      },
      {
        label: 'MLP',
        data: [performanceMetrics.mlp.accuracy, performanceMetrics.mlp.precision, performanceMetrics.mlp.recall, performanceMetrics.mlp.f1_score],
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        hidden: true // Hidden by default to avoid clutter
      },
      {
        label: 'SVM',
        data: [performanceMetrics.svm.accuracy, performanceMetrics.svm.precision, performanceMetrics.svm.recall, performanceMetrics.svm.f1_score],
        backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        hidden: true
      },
      {
        label: 'KNN',
        data: [performanceMetrics.knn.accuracy, performanceMetrics.knn.precision, performanceMetrics.knn.recall, performanceMetrics.knn.f1_score],
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        hidden: true
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255, 255, 255, 0.8)' } },
      title: { display: true, text: 'Model Profile Comparison', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
        pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } },
        ticks: { color: 'rgba(255, 255, 255, 0.7)', backdropColor: 'rgba(0, 0, 0, 0.5)', backdropPadding: 2, stepSize: 0.05 },
        min: 0.8, max: 1.0,
      }
    }
  };
  return <Radar data={data} options={options} />;
};

// --- CHART 2: Feature Importance (Updated with Fallback) ---
const FeatureImportanceChart = () => {
  const [chartData, setChartData] = useState(null);
  
  // Fallback data prevents the "Failed to fetch" error if backend is offline
  const fallbackData = {
    "redshift": 0.53,
    "z (Infrared)": 0.17,
    "i (Infrared)": 0.12,
    "r (Red)": 0.09,
    "g (Green)": 0.06,
    "u (Ultraviolet)": 0.03
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://nebulalens-core.onrender.com/feature_importance');
        if (response.data && !response.data.error) {
           processData(response.data);
        } else {
           throw new Error("Backend error");
        }
      } catch (err) { 
        console.warn("API unavailable, using fallback data for Feature Importance chart."); 
        processData(fallbackData);
      }
    };

    const processData = (data) => {
      setChartData({
        labels: Object.keys(data),
        datasets: [{
          label: 'Feature Importance (RF)',
          data: Object.values(data),
          backgroundColor: 'rgba(234, 179, 8, 0.7)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 1,
        }]
      });
    };

    fetchData();
  }, []);

  const options = {
    indexAxis: 'y', responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Predictors (Feature Importance)', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      y: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };

  if (!chartData) return <p className="text-white/70 text-center animate-pulse">Loading analysis...</p>;
  return <Bar options={options} data={chartData} />;
};

// --- CHART 3: Performance Bar Chart (Unchanged) ---
const PerformanceBarChart = () => {
  const labels = Object.keys(performanceMetrics).map(key => key.toUpperCase()); // ['RF', 'DL', 'MLP', ...]
  
  const performanceChartData = {
    labels,
    datasets: [
      {
        label: 'Accuracy',
        data: Object.values(performanceMetrics).map(m => m.accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'F1-Score',
        data: Object.values(performanceMetrics).map(m => m.f1_score),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
      },
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255, 255, 255, 0.8)' } },
      title: { display: true, text: 'Accuracy vs F1-Score', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: false, min: 0.8, max: 1.0, ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };
  return <Bar options={performanceChartOptions} data={performanceChartData} />;
};

// --- MAIN COMPONENT ---
export default function Visualizer() {
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-12 animate-fade-in">
      {/* --- ADDED: Print Styles specifically to force dark background --- */}
      <style>
        {`
          @media print {
            body {
              background-color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #root, .min-h-screen {
              background-color: #000000 !important;
              color: white !important;
            }
            /* Hide the export button and nav (handled by no-print class) */
            .no-print {
              display: none !important;
            }
            /* Ensure charts have dark backgrounds */
            .chart-container {
              background-color: #1a1a1a !important;
              border: 1px solid #333 !important;
              break-inside: avoid;
            }
            h1, h2, h3, p, span {
              color: white !important;
              text-shadow: none !important;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div className="flex justify-between items-center no-print">
        <h1 className="text-4xl font-bold text-center text-cosmic-accent">
          Data Visualizer
        </h1>
        <button 
          onClick={handlePrint}
          className="bg-cosmic-accent text-black px-5 py-2 rounded-lg font-semibold hover:shadow-glow transition"
        >
          Export Report
        </button>
      </div>
      
      {/* Charts Container */}
      <div id="report-content" className="space-y-12">
        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <RadarChart />
        </div>

        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <FeatureImportanceChart />
        </div>

        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <PerformanceBarChart />
        </div>
      </div>
    </div>
  );
}