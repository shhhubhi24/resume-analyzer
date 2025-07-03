// App.js (Enhanced with Resume Scoring + Role Personalization)
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeScore, setResumeScore] = useState(null);
  const [selectedRole, setSelectedRole] = useState("General");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFeedback("");
    setJobs([]);
    setResumeScore(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", selectedRole);

    try {
      const uploadRes = await fetch("http://localhost:8000/upload-resume/", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      setJobs(uploadData.job_matches || []);
      setResumeScore(uploadData.score || null);

      const feedbackRes = await fetch("http://localhost:8000/suggest-improvements/", {
        method: "POST",
        body: formData,
      });
      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData.suggestions || "No suggestions received.");
    } catch (err) {
      console.error("Upload failed:", err);
      setFeedback("❌ Failed to fetch feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-900 shadow-md py-6 mb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">🚀 Resume Analyzer Pro</h1>
          <p className="text-indigo-200 text-lg mt-1">AI-powered feedback & job matching for your resume</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 bg-gray-850 rounded-xl shadow-xl">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="block w-full sm:w-auto border border-gray-600 bg-gray-800 text-white rounded px-4 py-2"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-white rounded px-4 py-2"
            >
              <option>General</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Data Scientist</option>
              <option>Full-Stack Developer</option>
              <option>DevOps Engineer</option>
            </select>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Upload & Analyze"}
            </button>
          </div>

          {file && (
            <p className="mt-4 text-sm text-indigo-300">
              ✅ File selected: <strong>{file.name}</strong>
            </p>
          )}

          {loading && (
            <div className="mt-6 text-center text-indigo-400 animate-pulse">⏳ Analyzing your resume...</div>
          )}

          {resumeScore !== null && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-indigo-300">📊 Resume Score</h2>
              <div className="w-full bg-gray-700 rounded h-4 mt-2">
                <div
                  className="bg-green-500 h-4 rounded"
                  style={{ width: `${resumeScore}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1 text-indigo-200">Score: {resumeScore} / 100</p>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-indigo-300">🎯 Recommended Jobs</h2>
              <ul className="list-disc list-inside mt-2 text-white">
                {jobs.map((job, index) => (
                  <li key={index}>
                    <strong>{job.title}</strong> — Match Score: {job.score.toFixed(2)}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-indigo-300">📝 Feedback</h2>
              <div className="prose prose-invert text-indigo-100 bg-gray-800 border border-gray-700 p-4 rounded mt-2">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Built with ❤️ using React, TailwindCSS, and FastAPI + LLaMA3
      </footer>
    </div>
  );
}

export default App;
