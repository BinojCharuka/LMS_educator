import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

function GradeBar({ marks, total }) {
  const pct = Math.min(100, Math.round((marks / total) * 100));
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-primary-500' : pct >= 35 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="mt-2">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-500 mt-1">{pct}%</p>
    </div>
  );
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my')
      .then(r => setResults(r.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">My Results</h1>
          <p className="text-slate-500 mt-1">Track your academic performance across all exams.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📊</div>
            <p className="font-semibold text-slate-900">No results yet</p>
            <p className="text-sm mt-1">Your teacher will upload your exam results here.</p>
          </div>
        ) : (
          <>
            {/* Average card */}
            <div className="glass p-6 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-primary-500 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-2xl font-bold text-primary-600">{avg}%</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Overall Average</h2>
                <p className="text-slate-500 text-sm">Based on {results.length} exam{results.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(r => (
                <div key={r._id} className="glass-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{r.examName}</h3>
                      {r.month && <p className="text-slate-500 text-xs">{r.month}</p>}
                    </div>
                    {r.grade && (
                      <span className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold border border-primary-200">
                        {r.grade}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    {r.marks} <span className="text-slate-500 text-base font-normal">/ {r.totalMarks}</span>
                  </p>
                  <GradeBar marks={r.marks} total={r.totalMarks} />
                  {r.remarks && <p className="text-slate-500 text-xs mt-2 italic">"{r.remarks}"</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
