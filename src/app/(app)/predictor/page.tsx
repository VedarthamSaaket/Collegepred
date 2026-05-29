'use client';

import { useState } from 'react';

const EXAMS = [
  { value: 'JEE_MAINS', label: 'JEE Mains' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced' },
  { value: 'EAMCET_TS', label: 'EAMCET (TS)' },
];

const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'];
const GENDERS = [
  { value: 'ALL', label: 'All Genders' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

interface Prediction {
  college: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    type: string;
    rating: number;
  };
  branch: string | null;
  rankMin: number;
  rankMax: number;
  confidence: string;
}

export default function PredictorPage() {
  const [exam, setExam] = useState('');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [gender, setGender] = useState('ALL');
  const [branch, setBranch] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [apiNote, setApiNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);
    setApiNote('');

    if (!exam) {
      setError('Please select an exam');
      return;
    }
    const rankNum = parseInt(rank);
    if (!rank || isNaN(rankNum) || rankNum < 1) {
      setError('Please enter a valid rank');
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ exam, rank, category, gender });
    if (branch.trim()) params.set('branch', branch.trim());

    try {
      const res = await fetch(`/api/predict?${params}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to get predictions');
        setPredictions([]);
      } else {
        const data = await res.json();
        setPredictions(data.data || []);
        if (data.note) setApiNote(data.note);
        setSubmitted(true);
      }
    } catch {
      setError('Failed to connect. Please try again.');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'Likely': return 'text-green-600 bg-green-50 border-green-200';
      case 'Possible': return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'Stretch': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-[#8B653B] bg-[#F5EDE4] border-[#D4B896]';
    }
  };

  const getConfidenceBg = (confidence: string) => {
    switch (confidence) {
      case 'Likely': return 'bg-green-500';
      case 'Possible': return 'bg-yellow-500';
      case 'Stretch': return 'bg-red-400';
      default: return 'bg-[#D4B896]';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-[#3A2917] mb-2 font-semibold italic">College Predictor</h1>
        <p className="text-[#8B653B] mb-8">
          Enter your exam rank to find colleges where you have a good chance of admission.
        </p>

        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Exam</label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                >
                  <option value="">Select exam</option>
                  {EXAMS.map((ex) => (
                    <option key={ex.value} value={ex.value}>{ex.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Your Rank</label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g. 5000"
                  min={1}
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">
                  Preferred Branch <span className="text-[#B8A080]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {apiNote && (
              <p className="text-sm text-[#543D23] italic">{apiNote}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#543D23] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#3A2917] transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Predicting...' : 'Predict Colleges'}
            </button>
          </form>
        </div>

        {submitted && predictions.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 text-center shadow-sm">
            <p className="text-xl text-[#8B653B] mb-2 font-semibold italic">No colleges found</p>
            <p className="text-[#B8A080]">
              No colleges matched your rank for the selected exam and category. Try a different combination.
            </p>
          </div>
        )}

        {predictions.length > 0 && (
          <div>
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">
              Predictions ({predictions.length} colleges)
            </h2>
            <div className="space-y-4">
              {predictions.map((pred, idx) => (
                <div key={`${pred.college.id}-${pred.branch}-${idx}`} className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl text-[#3A2917] font-semibold italic">{pred.college.name}</h3>
                      {pred.branch && (
                        <p className="text-sm text-[#8B653B] mt-1">{pred.branch}</p>
                      )}
                      <p className="text-xs text-[#B8A080] mt-0.5">{pred.college.city}, {pred.college.state}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold border ${getConfidenceColor(pred.confidence)}`}>
                      {pred.confidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-[#B8A080]">Rank range: </span>
                      <span className="text-[#3A2917] font-semibold">
                        {pred.rankMin.toLocaleString()} - {pred.rankMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-[#F5EDE4] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getConfidenceBg(pred.confidence)}`}
                      style={{
                        width: `${Math.min(100, ((pred.rankMax - (pred.rankMin || 0)) / ((pred.rankMax - pred.rankMin) || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}