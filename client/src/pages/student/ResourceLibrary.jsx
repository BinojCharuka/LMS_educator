import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

const CATEGORIES = ['All', 'Note', 'Paper', 'Past Paper', 'Other'];

export default function ResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchResources = async (cat) => {
    setLoading(true);
    try {
      const url = cat === 'All' ? '/resources' : `/resources?category=${encodeURIComponent(cat)}`;
      const { data } = await api.get(url);
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(activeCategory);
  }, [activeCategory]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Resource Library</h1>
          <p className="text-slate-500 mt-1">Download free study materials, notes, and past papers.</p>
        </div>

        {/* Category Filter */}
        <div className="glass p-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
                  ${activeCategory === c 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm' 
                    : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Resource List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📚</div>
            <p className="font-semibold text-slate-900">No resources found</p>
            <p className="text-sm mt-1">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map(r => (
              <a key={r._id} href={r.fileUrl} target="_blank" rel="noopener noreferrer" download
                className="glass-card group hover:border-primary-300 flex flex-col justify-between h-full">
                <div>
                  <div className="text-3xl mb-3">📄</div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2" title={r.title}>
                    {r.title}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded">{r.category}</span>
                  <span className="text-primary-600 text-xs font-bold group-hover:underline">Download ↓</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
