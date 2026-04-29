import React, { useState, useEffect, useRef } from 'react'
import { TEAMS, CATEGORIES, DAYS, teamTotal, teamDayTotal, emptyScores, subscribeScores } from './firebase'

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @keyframes starFloat {
    0%   { transform: translateY(0px) translateX(0px); opacity: 0.4; }
    50%  { opacity: 1; }
    100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
  }
  @keyframes orbitSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes orbitSpinReverse {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes rankPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes neonFlicker {
    0%, 95%, 100% { opacity: 1; }
    96%           { opacity: 0.8; }
    97%           { opacity: 1; }
    98%           { opacity: 0.7; }
  }
  @keyframes crownBob {
    0%, 100% { transform: translateY(0) rotate(-8deg); }
    50%       { transform: translateY(-4px) rotate(-8deg); }
  }
  @keyframes scoreCount {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lb-root {
    min-height: 100vh;
    background: #050508;
    font-family: 'Exo 2', sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  /* ── Stars ── */
  .stars-layer {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }
  .star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    animation: starFloat linear infinite;
  }

  /* ── Orbital rings ── */
  .orbit-wrap {
    position: fixed;
    top: 50%; left: 50%;
    width: min(900px, 120vw);
    height: min(900px, 120vw);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
  .orbit-ring {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 1.5px solid transparent;
    animation: orbitSpin 18s linear infinite;
  }
  .orbit-ring-2 {
    animation: orbitSpinReverse 24s linear infinite;
    inset: 60px;
  }
  .orbit-ring-3 {
    animation: orbitSpin 34s linear infinite;
    inset: 120px;
  }

  /* ── Content ── */
  .lb-content {
    position: relative; z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* ── Header ── */
  .lb-header {
    text-align: center;
    margin-bottom: 48px;
    animation: slideIn 0.8s ease both;
  }
  .lb-date {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    letter-spacing: 4px;
    color: #2EE89A;
    text-transform: uppercase;
    margin-bottom: 12px;
    animation: pulseGlow 3s ease infinite;
  }
  .lb-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(42px, 8vw, 88px);
    font-weight: 900;
    line-height: 0.95;
    background: linear-gradient(135deg, #2EE89A 0%, #fff 40%, #2EE89A 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite, neonFlicker 8s ease infinite;
    text-shadow: none;
    margin-bottom: 8px;
  }
  .lb-subtitle {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(11px, 2vw, 15px);
    letter-spacing: 6px;
    color: #fff;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .lb-verse {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 1px;
    font-style: italic;
  }

  /* ── Day tabs ── */
  .day-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    animation: slideIn 0.8s 0.15s ease both;
    opacity: 0;
    animation-fill-mode: forwards;
  }
  .day-tab {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    padding: 8px 20px;
    border-radius: 100px;
    border: 1px solid rgba(46,232,154,0.3);
    background: rgba(46,232,154,0.05);
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .day-tab:hover {
    border-color: rgba(46,232,154,0.7);
    color: #2EE89A;
    background: rgba(46,232,154,0.1);
  }
  .day-tab.active {
    background: #2EE89A;
    border-color: #2EE89A;
    color: #000;
    box-shadow: 0 0 24px #2EE89A88;
  }

  /* ── Overall podium ── */
  .podium-section {
    margin-bottom: 56px;
    animation: slideIn 0.8s 0.2s ease both;
    opacity: 0;
    animation-fill-mode: forwards;
  }
  .section-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 24px;
  }
  .podium-row {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 12px;
  }
  .podium-card {
    flex: 1;
    max-width: 220px;
    border-radius: 20px;
    padding: 24px 16px 20px;
    text-align: center;
    position: relative;
    transition: transform 0.3s;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(10px);
  }
  .podium-card:hover { transform: translateY(-4px); }
  .podium-card.rank-1 {
    padding-top: 40px;
    border-color: rgba(255,214,0,0.4);
    box-shadow: 0 0 40px rgba(255,214,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .podium-card.rank-2 {
    padding-top: 28px;
  }
  .podium-card.rank-3 {
    padding-top: 20px;
  }
  .podium-card.rank-4 {
    padding-top: 16px;
    opacity: 0.75;
  }
  .crown {
    position: absolute;
    top: -22px; left: 50%;
    transform: translateX(-50%) rotate(-8deg);
    font-size: 28px;
    animation: crownBob 2s ease infinite;
    filter: drop-shadow(0 0 12px #FFD600);
  }
  .podium-rank-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.3);
    margin-bottom: 10px;
  }
  .podium-team-dot {
    width: 48px; height: 48px;
    border-radius: 50%;
    margin: 0 auto 12px;
    position: relative;
  }
  .podium-team-dot::after {
    content: '';
    position: absolute; inset: -4px;
    border-radius: 50%;
    opacity: 0.4;
    animation: pulseGlow 2s ease infinite;
  }
  .podium-team-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .podium-score {
    font-family: 'Orbitron', sans-serif;
    font-size: 32px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }
  .podium-score-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
  }

  /* ── Detailed breakdown table ── */
  .breakdown-section {
    animation: slideIn 0.8s 0.35s ease both;
    opacity: 0;
    animation-fill-mode: forwards;
  }
  .breakdown-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 6px;
  }
  .breakdown-table th {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    text-align: center;
    padding: 0 8px 16px;
    font-weight: 400;
  }
  .breakdown-table th:first-child { text-align: left; padding-left: 20px; }
  .breakdown-table td {
    text-align: center;
    padding: 14px 8px;
    font-size: 15px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.03);
    transition: background 0.2s;
  }
  .breakdown-table td:first-child {
    text-align: left;
    padding-left: 20px;
    border-radius: 12px 0 0 12px;
    font-size: 12px;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.5);
    font-family: 'Orbitron', sans-serif;
    font-weight: 400;
  }
  .breakdown-table td:last-child {
    border-radius: 0 12px 12px 0;
  }
  .breakdown-table tr:hover td {
    background: rgba(255,255,255,0.06);
  }
  .team-score-cell {
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 16px;
  }
  .total-row td {
    background: rgba(255,255,255,0.06) !important;
    font-weight: 700;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .total-row td:first-child {
    color: rgba(255,255,255,0.7) !important;
    font-size: 10px !important;
    letter-spacing: 3px;
  }

  /* ── Team header in table ── */
  .team-th-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
  }

  /* ── Live badge ── */
  .live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,59,59,0.15);
    border: 1px solid rgba(255,59,59,0.4);
    border-radius: 100px;
    padding: 4px 12px;
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: #FF3B3B;
    text-transform: uppercase;
    margin: 0 auto 32px;
    width: fit-content;
    animation: slideIn 0.8s ease both;
  }
  .live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #FF3B3B;
    animation: pulseGlow 1s ease infinite;
  }

  /* ── Last updated ── */
  .last-updated {
    text-align: center;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 1px;
    margin-top: 40px;
    font-family: 'Orbitron', sans-serif;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .podium-row { gap: 6px; }
    .podium-card { padding: 16px 8px 14px; border-radius: 14px; }
    .podium-score { font-size: 24px; }
    .breakdown-table td { padding: 10px 4px; font-size: 13px; }
    .breakdown-table td:first-child { font-size: 9px; padding-left: 10px; }
    .breakdown-table th { font-size: 8px; padding: 0 4px 12px; }
  }
`

// ─── Stars generator ──────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 15,
  }))
  return (
    <div className="stars-layer">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          animationDuration: `${s.duration}s`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  )
}

// ─── Orbital rings ────────────────────────────────────────────────────────────
function Orbits() {
  return (
    <div className="orbit-wrap">
      <div className="orbit-ring" style={{
        background: 'conic-gradient(from 0deg, transparent 60%, #2EE89A44, #3B8BFF44, #FF3B3B44, #FFD60044, transparent)',
      }} />
      <div className="orbit-ring orbit-ring-2" style={{
        background: 'conic-gradient(from 90deg, transparent 70%, #FFD60033, #2EE89A33, transparent)',
      }} />
      <div className="orbit-ring orbit-ring-3" style={{
        background: 'conic-gradient(from 200deg, transparent 75%, #FF3B3B22, #3B8BFF22, transparent)',
      }} />
    </div>
  )
}

// ─── Main Leaderboard ────────────────────────────────────────────────────────
export default function Leaderboard() {
  const [scores, setScores] = useState(emptyScores())
  const [activeDay, setActiveDay] = useState('overall')
  const [lastUpdated, setLastUpdated] = useState(null)
  const prevTotals = useRef({})

  useEffect(() => {
    const unsub = subscribeScores(data => {
      setScores(data)
      setLastUpdated(new Date())
    })
    return unsub
  }, [])

  // Compute rankings
  const ranked = [...TEAMS]
    .map(t => ({
      ...t,
      total: activeDay === 'overall'
        ? teamTotal(scores, t.id)
        : teamDayTotal(scores, t.id, activeDay),
    }))
    .sort((a, b) => b.total - a.total)

  const getRank = (teamId) => ranked.findIndex(t => t.id === teamId) + 1

  // Day totals per team per category
  const getCatScore = (teamId, catId) => {
    if (activeDay === 'overall') {
      return DAYS.reduce((sum, d) => sum + Number(scores?.[d]?.[teamId]?.[catId] || 0), 0)
    }
    return Number(scores?.[activeDay]?.[teamId]?.[catId] || 0)
  }

  const getTeamTotal = (teamId) => {
    if (activeDay === 'overall') return teamTotal(scores, teamId)
    return teamDayTotal(scores, teamId, activeDay)
  }

  const rankLabels = ['1ST', '2ND', '3RD', '4TH']

  return (
    <>
      <style>{css}</style>
      <div className="lb-root">
        <Stars />
        <Orbits />
        <div className="lb-content">

          {/* Header */}
          <header className="lb-header">
            <div className="lb-date">July 27 – 30, 2026</div>
            <h1 className="lb-title">STAMPEDE</h1>
            <div className="lb-subtitle">For His Glory</div>
            <div className="lb-verse">1 Corinthians 10:31</div>
          </header>

          {/* Live badge */}
          <div className="live-badge">
            <div className="live-dot" />
            Live Scores
          </div>

          {/* Day tabs */}
          <div className="day-tabs">
            <button
              className={`day-tab ${activeDay === 'overall' ? 'active' : ''}`}
              onClick={() => setActiveDay('overall')}
            >Overall</button>
            {DAYS.map(d => (
              <button
                key={d}
                className={`day-tab ${activeDay === d ? 'active' : ''}`}
                onClick={() => setActiveDay(d)}
              >Day {d}</button>
            ))}
          </div>

          {/* Podium */}
          <section className="podium-section">
            <div className="section-label">
              {activeDay === 'overall' ? 'Overall Standings' : `Day ${activeDay} Standings`}
            </div>
            <div className="podium-row">
              {/* Reorder for visual podium: 2nd, 1st, 3rd, 4th */}
              {[ranked[1], ranked[0], ranked[2], ranked[3]].filter(Boolean).map((team, vi) => {
                const isFirst = team.id === ranked[0]?.id
                const rankIdx = ranked.findIndex(t => t.id === team.id)
                return (
                  <div
                    key={team.id}
                    className={`podium-card rank-${rankIdx + 1}`}
                    style={{
                      borderColor: isFirst ? 'rgba(255,214,0,0.4)' : `${team.color}33`,
                      boxShadow: isFirst
                        ? `0 0 40px rgba(255,214,0,0.12), 0 0 80px ${team.glow}`
                        : `0 0 30px ${team.glow}`,
                    }}
                  >
                    {isFirst && <div className="crown">👑</div>}
                    <div className="podium-rank-num">{rankLabels[rankIdx]}</div>
                    <div
                      className="podium-team-dot"
                      style={{
                        background: team.color,
                        boxShadow: `0 0 20px ${team.color}88`,
                      }}
                    />
                    <div
                      className="podium-team-name"
                      style={{ color: team.color, textShadow: `0 0 20px ${team.color}88` }}
                    >
                      {team.label}
                    </div>
                    <div
                      className="podium-score"
                      style={{ color: team.color }}
                    >
                      {team.total}
                    </div>
                    <div className="podium-score-label">pts</div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Breakdown table */}
          <section className="breakdown-section">
            <div className="section-label">Score Breakdown</div>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Category</th>
                  {ranked.map(t => (
                    <th key={t.id}>
                      <span className="team-th-dot" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.label}</td>
                    {ranked.map(team => (
                      <td key={team.id} className="team-score-cell" style={{ color: team.color }}>
                        {getCatScore(team.id, cat.id)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  {ranked.map(team => (
                    <td key={team.id} className="team-score-cell" style={{ color: team.color }}>
                      {getTeamTotal(team.id)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>

          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
