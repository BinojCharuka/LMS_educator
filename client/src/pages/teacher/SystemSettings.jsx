import { useState, useEffect } from 'react';
import api from '../../services/api';

const SystemSettings = () => {
  const [metrics, setMetrics] = useState({ mongoSizeBytes: 0, cloudinaryUsageBytes: 0, cloudinaryLimitBytes: 0 });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/metrics');
      setMetrics({
        mongoSizeBytes: res.data.mongoSizeBytes || 0,
        cloudinaryUsageBytes: res.data.cloudinaryUsageBytes || 0,
        cloudinaryLimitBytes: res.data.cloudinaryLimitBytes || 0
      });
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Failed to load system metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleReset = async () => {
    if (confirmText !== 'CONFIRM') {
      setError('Please type CONFIRM to proceed.');
      return;
    }
    
    if (!window.confirm('Are you absolutely sure? This will delete ALL students and ALL payments. This cannot be undone.')) {
      return;
    }

    try {
      setResetting(true);
      setError('');
      setSuccess('');
      const res = await api.post('/system/reset');
      setSuccess(res.data.message || 'System data has been reset.');
      setConfirmText('');
      await fetchMetrics(); // Refresh metrics after reset
    } catch (err) {
      console.error('Failed to reset data:', err);
      setError(err.response?.data?.message || 'Failed to reset system data.');
    } finally {
      setResetting(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cloudinaryPercentage = metrics.cloudinaryLimitBytes > 0 
    ? ((metrics.cloudinaryUsageBytes / metrics.cloudinaryLimitBytes) * 100).toFixed(2)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen pt-24 md:pt-8 relative z-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-2">Monitor storage usage and manage system data</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100 flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      {/* Metrics Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-100 bg-slate-50 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Storage Analytics</h2>
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cloudinary Stats */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Cloudinary Media Storage</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-3xl font-bold text-slate-900">{formatBytes(metrics.cloudinaryUsageBytes)}</p>
                <p className="text-sm text-slate-500">Used of {formatBytes(metrics.cloudinaryLimitBytes) || 'Unknown'}</p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${cloudinaryPercentage > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {cloudinaryPercentage}%
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 mt-4 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${cloudinaryPercentage > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(cloudinaryPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* MongoDB Stats */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">MongoDB Database Size</h3>
            <div>
              <p className="text-3xl font-bold text-slate-900">{formatBytes(metrics.mongoSizeBytes)}</p>
              <p className="text-sm text-slate-500">Total data and index size</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <p className="text-sm text-slate-600 font-medium">Text data uses very little space compared to images.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="border-b border-red-100 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Danger Zone
          </h2>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Reset Student Data</h3>
          <p className="text-slate-600 mb-6 max-w-2xl">
            This action will permanently delete <strong>ALL student accounts</strong>, <strong>ALL payment records</strong>, and <strong>ALL uploaded payment slip images</strong> from Cloudinary. 
            This is useful for resetting the system for a new batch of students. 
            <em>Teachers, Lesson Packs, and Course Materials will NOT be deleted.</em>
          </p>

          <div className="bg-red-50 border border-red-100 rounded-xl p-5 max-w-md">
            <label className="block text-sm font-medium text-red-800 mb-2">
              Type <strong>CONFIRM</strong> to verify
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRM"
              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 bg-white"
            />
            
            <button
              onClick={handleReset}
              disabled={confirmText !== 'CONFIRM' || resetting}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${
                confirmText === 'CONFIRM' && !resetting
                  ? 'bg-red-600 hover:bg-red-700 shadow-md' 
                  : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              {resetting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Resetting Data...
                </>
              ) : (
                'Permanently Delete Data'
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemSettings;
