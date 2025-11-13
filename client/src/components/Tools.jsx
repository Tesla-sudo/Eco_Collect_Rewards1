// frontend/src/components/Tools.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateContent, getProfile } from '../services/api';

const Tools = () => {
  const [type, setType] = useState('workplan');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ classes: [], subjects: [] });
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data);
        if (!res.data.classes?.length) navigate('/setup');
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return alert('Select class and subject');

    setLoading(true);
    setContent('');
    try {
      const res = await generateContent({
        type,
        grade: parseInt(selectedClass),
        subject: selectedSubject,
        topic: topic.trim() || undefined
      });
      setContent(res.data.content);
      setGeneratedAt(res.data.generatedAt);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  return (
    <div className="tools-page">
      <h2>Gemini AI • CBC Content Generator</h2>
      <p className="subtitle">Perfect Kiswahili & English • KICD-Aligned • Grade 1–9</p>

      <form onSubmit={handleGenerate} className="generate-form">
        <div className="form-grid">
          <select value={type} onChange={e => setType(e.target.value)} required>
            <option value="workplan">Scheme of Work / Lesson Plan</option>
            <option value="questions">Assessment Questions</option>
            <option value="scheme">Full Scheme of Work (4 Weeks)</option>
            <option value="rubric">Assessment Rubric</option>
          </select>

          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
            <option value="">Select Grade</option>
            {profile.classes?.map(c => (
              <option key={c} value={c}>Grade {c}</option>
            ))}
          </select>

          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
            <option value="">Select Subject</option>
            {profile.subjects?.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {type === 'rubric' && (
            <input
              type="text"
              placeholder="Topic / Skill to assess (e.g. Addition of Fractions)"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
          )}
        </div>

        <button type="submit" disabled={loading} className="generate-btn">
          {loading ? 'Generating with Gemini...' : 'Generate CBC Content'}
        </button>
      </form>

      {content && (
        <div className="gemini-output">
          <div className="output-header">
            <h3>Gemini 1.5 Pro • {selectedSubject} • Grade {selectedClass}</h3>
            <div className="meta">
              <small>{generatedAt} EAT</small>
              <button onClick={copyToClipboard} className="copy-btn">
                Copy
              </button>
            </div>
          </div>
          <div className="content-box">
            <pre>{content}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;