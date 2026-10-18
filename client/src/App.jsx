import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MAX = 5000;

const input =
  'w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/40 outline-none transition focus:ring-2 focus:ring-violet-400';
const label = 'block text-sm text-violet-100/80 mb-1';

export default function App() {
  const [form, setForm] = useState({ name: '', skills: '', jobDescription: '' });
  const [letter, setLetter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLetter('');
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setLetter(data.coverLetter);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Cannot reach the server. Is it running?' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#150f22] px-4 py-10">
      <div className="float-slow pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-violet-600/50 blur-3xl" />
      <div className="float-slower pointer-events-none absolute bottom-0 right-0 w-[26rem] h-[26rem] rounded-full bg-fuchsia-600/40 blur-3xl" />

      <div className="relative max-w-2xl mx-auto">
        <div className="fade-up text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            AI Cover Letter Generator ✨
          </h1>
          <p className="text-sm text-white/60 mt-2">
            Paste a job description, add your skills, and get a tailored cover letter in seconds.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="fade-up bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl transition duration-300 hover:border-violet-300/30"
        >
          <label className={label}>Your name</label>
          <input name="name" value={form.name} onChange={handleChange} required className={`${input} mb-3`} placeholder="Amna Ishaq" />

          <label className={label}>Your skills and background</label>
          <textarea
            name="skills" value={form.skills} onChange={handleChange} required rows={3}
            className={`${input} mb-3`}
            placeholder="React.js, Node.js, Express.js, MongoDB, JWT authentication, 5 live projects..."
          />

          <label className={label}>Job description</label>
          <textarea
            name="jobDescription" value={form.jobDescription} onChange={handleChange} required rows={6} maxLength={MAX}
            className={input} placeholder="Paste the job description here..."
          />
          <p className="text-xs text-white/40 text-right mt-1">{form.jobDescription.length}/{MAX}</p>

          {error && <p className="bg-red-500/20 text-red-100 text-sm p-2 rounded mt-3">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full mt-4 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/40 active:scale-95 transition text-white py-3 rounded-lg font-medium disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? 'Writing your cover letter...' : 'Generate cover letter'}
          </button>
        </form>

        {letter && (
          <div className="fade-up mt-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Your cover letter</h2>
              <button
                onClick={handleCopy}
                className="text-sm px-4 py-1.5 rounded-lg border border-white/20 text-white/85 hover:bg-white/10 transition"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-violet-50/90">{letter}</p>
            <p className="text-xs text-white/40 mt-4">AI can make mistakes. Please review and edit before sending.</p>
          </div>
        )}
      </div>
    </div>
  );
}