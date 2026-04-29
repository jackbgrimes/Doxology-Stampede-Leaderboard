import React, { useState, useEffect } from 'react'
import { TEAMS, CATEGORIES, DAYS, emptyScores, subscribeScores, saveScores, teamDayTotal, teamTotal } from './firebase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'stampede2026'

const css = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    min-height: 100vh;
    background: #07080f;
    font-family: 'Exo 2', sans-serif;
    color: #fff;
  }

  /* ── Login screen ── */
  .adm-login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
  .adm-login-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 28px;
    font-weight: 900;
    background: linear-gradient(135deg, #2EE89A, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }
  .adm-login-sub {
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.3);
    text-align: center;
    font-family: 'Orbitron', sans-serif;
  }
  .adm-login-box {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fadeIn 0.5s ease;
  }
  .adm-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 12px 16px;
    color: #fff;
    font-size: 15px;
    font-family: 'Exo 2', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .adm-input:focus { border-color: #2EE89A; }
  .adm-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .adm-btn-primary {
    background: #2EE89A;
    color: #000;
    box-shadow: 0 0 24px #2EE89A55;
  }
  .adm-btn-primary:hover { background: #4dffc0; box-shadow: 0 0 32px #2EE89A88; }
  .adm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .adm-btn-ghost {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .adm-btn-ghost:hover { background: rgba(255,255,255,0.1); }
  .adm-error { color: #FF3B3B; font-size: 12px; text-align: center; }

  /* ── Admin layout ── */
  .adm-layout {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .adm-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.02);
    border-right: 1px solid rgba(255,255,255,0.07);
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .adm-sidebar-logo {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: #2EE89A;
    letter-spacing: 2px;
    margin-bottom: 24px;
    text-align: center;
    animation: pulseGlow 3s infinite;
  }
  .adm-sidebar-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
    padding: 0 8px;
    margin: 8px 0 4px;
    font-family: 'Orbitron', sans-serif;
  }
  .adm-nav-btn {
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.55);
    font-family: 'Exo 2', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .adm-nav-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .adm-nav-btn.active { background: rgba(46,232,154,0.12); color: #2EE89A; }
  .adm-nav-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  /* ── Main area ── */
  .adm-main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    animation: fadeIn 0.4s ease;
  }
  .adm-page-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    margin-bottom: 6px;
  }
  .adm-page-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 32px;
    letter-spacing: 0.5px;
  }

  /* ── Score grid ── */
  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  .score-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 20px;
    transition: border-color 0.2s;
  }
  .score-card:hover { border-color: rgba(255,255,255,0.15); }
  .score-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .score-card-dot {
    width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  }
  .score-card-team {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .score-card-total {
    margin-left: auto;
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    font-weight: 900;
  }
  .score-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 12px;
  }
  .score-field:last-child { border-bottom: none; }
  .score-field-label {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    flex: 1;
  }
  .score-field-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .score-stepper {
    width: 28px; height: 28px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .score-stepper:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
  .score-num-input {
    width: 52px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 4px 6px;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Orbitron', sans-serif;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
  }
  .score-num-input:focus { border-color: #2EE89A; }

  /* ── Save bar ── */
  .save-bar {
    position: sticky;
    bottom: 0;
    background: rgba(7,8,15,0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255,255,255,0.08);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 -32px -32px;
  }
  .save-status {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 1px;
    flex: 1;
  }
  .save-status.saved { color: #2EE89A; }
  .save-status.saving { color: #FFD600; }
  .save-status.error { color: #FF3B3B; }

  /* ── Overview table ── */
  .overview-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 6px;
  }
  .overview-table th {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    text-align: center;
    padding: 0 12px 12px;
    font-weight: 400;
  }
  .overview-table th:first-child { text-align: left; }
  .overview-table td {
    padding: 14px 12px;
    text-align: center;
    background: rgba(255,255,255,0.03);
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .overview-table td:first-child {
    text-align: left;
    border-radius: 10px 0 0 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    display: flex; align-items: center; gap: 10px;
  }
  .overview-table td:last-child { border-radius: 0 10px 10px 0; font-weight: 700; }
  .overview-table .total-col { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 16px; }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .adm-sidebar { display: none; }
    .adm-main { padding: 20px 16px; }
    .save-bar { margin: 0 -16px -20px; padding: 14px 16px; }
  }
`

function ScoreInput({ value, onChange }) {
  return (
    <div className="score-field-controls">
      <button className="score-stepper" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <input
        className="score-num-input"
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      />
      <button className="score-stepper" onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [scores, setScores] = useState(emptyScores())
  const [localScores, setLocalScores] = useState(emptyScores())
  const [activeDay, setActiveDay] = useState(1)
  const [view, setView] = useState('scores') // 'scores' | 'overview'
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!authed) return
    const unsub = subscribeScores(data => {
      setScores(data)
      setLocalScores(JSON.parse(JSON.stringify(data)))
    })
    return unsub
  }, [authed])

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError('')
    } else {
      setPwError('Incorrect password.')
    }
  }

  const setScore = (teamId, catId, val) => {
    setLocalScores(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (!next[activeDay]) next[activeDay] = {}
      if (!next[activeDay][teamId]) next[activeDay][teamId] = {}
      next[activeDay][teamId][catId] = val
      return next
    })
    setDirty(true)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await saveScores(localScores)
      setSaveStatus('saved')
      setDirty(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) {
      setSaveStatus('error')
    }
  }

  const getScore = (teamId, catId) =>
    Number(localScores?.[activeDay]?.[teamId]?.[catId] || 0)

  const getDayTotal = (teamId) =>
    CATEGORIES.reduce((sum, c) => sum + getScore(teamId, c.id), 0)

  const getOverallTotal = (teamId) =>
    DAYS.reduce((sum, d) =>
      sum + CATEGORIES.reduce((s2, c) =>
        s2 + Number(localScores?.[d]?.[teamId]?.[c.id] || 0), 0), 0)

  if (!authed) {
    return (
      <>
        <style>{css}</style>
        <div className="adm-login">
          <div className="adm-login-title">STAMPEDE 2026<br/>Admin</div>
          <div className="adm-login-sub">Score Entry Panel</div>
          <div className="adm-login-box">
            <input
              className="adm-input"
              type="password"
              placeholder="Enter password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            {pwError && <div className="adm-error">{pwError}</div>}
            <button className="adm-btn adm-btn-primary" onClick={handleLogin}>Enter</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="adm-root">
        <div className="adm-layout">

          {/* Sidebar */}
          <aside className="adm-sidebar">
            <div className="adm-sidebar-logo">STAMPEDE<br/>2026</div>

            <div className="adm-sidebar-label">View</div>
            <button
              className={`adm-nav-btn ${view === 'scores' ? 'active' : ''}`}
              onClick={() => setView('scores')}
            >📋 Score Entry</button>
            <button
              className={`adm-nav-btn ${view === 'overview' ? 'active' : ''}`}
              onClick={() => setView('overview')}
            >📊 Overview</button>

            {view === 'scores' && (
              <>
                <div className="adm-sidebar-label" style={{ marginTop: 16 }}>Day</div>
                {DAYS.map(d => (
                  <button
                    key={d}
                    className={`adm-nav-btn ${activeDay === d ? 'active' : ''}`}
                    onClick={() => setActiveDay(d)}
                  >Day {d}</button>
                ))}
              </>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <a
                href="/"
                target="_blank"
                style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, textDecoration: 'none', fontFamily: 'Orbitron, sans-serif' }}
              >↗ View Public Board</a>
            </div>
          </aside>

          {/* Main */}
          <main className="adm-main">

            {view === 'scores' && (
              <>
                <div className="adm-page-title">Day {activeDay} — Score Entry</div>
                <div className="adm-page-sub">Enter points per team per category. Changes save when you click Save.</div>

                <div className="score-grid">
                  {TEAMS.map(team => (
                    <div key={team.id} className="score-card" style={{ borderColor: `${team.color}33` }}>
                      <div className="score-card-header">
                        <div className="score-card-dot" style={{ background: team.color, boxShadow: `0 0 10px ${team.color}88` }} />
                        <div className="score-card-team" style={{ color: team.color }}>{team.label}</div>
                        <div className="score-card-total" style={{ color: team.color }}>
                          {getDayTotal(team.id)} pts
                        </div>
                      </div>
                      {CATEGORIES.map(cat => (
                        <div key={cat.id} className="score-field">
                          <div className="score-field-label">{cat.label}</div>
                          <ScoreInput
                            value={getScore(team.id, cat.id)}
                            onChange={val => setScore(team.id, cat.id, val)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="save-bar">
                  <div className={`save-status ${saveStatus === 'idle' ? '' : saveStatus}`}>
                    {saveStatus === 'idle' && dirty && 'Unsaved changes'}
                    {saveStatus === 'idle' && !dirty && ''}
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && '✓ Saved successfully'}
                    {saveStatus === 'error' && '✕ Save failed — check connection'}
                  </div>
                  <button
                    className="adm-btn adm-btn-ghost"
                    onClick={() => { setLocalScores(JSON.parse(JSON.stringify(scores))); setDirty(false); }}
                  >Discard</button>
                  <button
                    className="adm-btn adm-btn-primary"
                    onClick={handleSave}
                    disabled={!dirty || saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Scores'}
                  </button>
                </div>
              </>
            )}

            {view === 'overview' && (
              <>
                <div className="adm-page-title">Overall Standings</div>
                <div className="adm-page-sub">Live totals across all days and categories.</div>

                <table className="overview-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      {DAYS.map(d => <th key={d}>Day {d}</th>)}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...TEAMS]
                      .map(t => ({ ...t, overall: getOverallTotal(t.id) }))
                      .sort((a, b) => b.overall - a.overall)
                      .map(team => (
                        <tr key={team.id}>
                          <td>
                            <div className="adm-nav-dot" style={{ background: team.color, boxShadow: `0 0 8px ${team.color}` }} />
                            {team.label}
                          </td>
                          {DAYS.map(d => (
                            <td key={d}>
                              {CATEGORIES.reduce((s, c) => s + Number(localScores?.[d]?.[team.id]?.[c.id] || 0), 0)}
                            </td>
                          ))}
                          <td className="total-col" style={{ color: team.color }}>
                            {getOverallTotal(team.id)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  )
}
