import React from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── EXACT DSA TERMINAL STYLE ───────────────────────────────
   Dark #0d1117 bg, grid overlay, image top half, title+desc+LVL bottom,
   colored left-border on desc, per-game accent color.
   Same font (monospace/bold italic), same card structure.
──────────────────────────────────────────────────────────── */

const GAMES = [
  {
    id: 'code-runner',
    title: 'Code Runner',
    desc: 'Race against AlgoBot by solving fullstack tasks. First to reach 100% on the track wins.',
    lvl: '01',
    accent: '#ff3b6b',          // red-pink like 1vs1 Battle
    path: '/games/code-runner',
    img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=700&q=80', // keyboard/code
  },
  {
    id: 'dev-survivor',
    title: 'Dev Survivor',
    desc: 'A 20-level wasteland RPG. Solve real code tasks to survive 4 brutal zones and reach The Core.',
    lvl: '02',
    accent: '#00e5ff',          // cyan like Debug Code
    path: '/games/dev-survivor',
    img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=700&q=80', // dark code screen
  },
  {
    id: 'git-quest',
    title: 'Git Quest',
    desc: 'Fill-in-the-blank Git commands. Wrong answers cost time. Build your repo step by step.',
    lvl: '03',
    accent: '#00e676',          // green like AlgoVillage
    path: '/games/git-quest',
    img: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=700&q=80', // terminal/git
  },
  {
    id: 'code-arena',
    title: 'Code Arena',
    desc: '1v1 PvE coding battle. Submit correct answers to drain the enemy HP before time runs out.',
    lvl: '04',
    accent: '#ff6d00',          // orange
    path: '/games/code-arena',
    img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=700&q=80', // computer screens battle
  },
  {
  id: 'code-race',
  title: 'Code Race',
  desc: 'Real-time multiplayer coding race. Complete fullstack tasks faster than your opponent.',
  lvl: '05',
  accent: '#d500f9',
  path: '/games/code-race',
  img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80'
}
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,900&family=Share+Tech+Mono&display=swap');

  .fst-root {
    min-height: 100vh;
    background: #0d1117;
    font-family: 'Share Tech Mono', monospace;
    color: #c9d1d9;
    position: relative;
  }

  /* Same grid as DSA Terminal */
  .fst-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(30,215,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,215,255,.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Title — same bold italic condensed style */
  .fst-title-white {
    font-family: 'Barlow Condensed', sans-serif;
    font-style: italic;
    font-weight: 900;
    color: #ffffff;
    font-size: clamp(32px, 5vw, 54px);
    letter-spacing: .02em;
    line-height: 1;
  }
  .fst-title-accent {
    font-family: 'Barlow Condensed', sans-serif;
    font-style: italic;
    font-weight: 900;
    font-size: clamp(32px, 5vw, 54px);
    letter-spacing: .02em;
    line-height: 1;
    /* gradient like DSA (white→cyan→pink) */
    background: linear-gradient(90deg, #00e5ff 0%, #ff3b6b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fst-subtitle {
    font-size: 11px;
    color: #8b949e;
    letter-spacing: .25em;
    text-transform: uppercase;
    margin-top: 6px;
    border-left: 2px solid #30363d;
    padding-left: 10px;
  }

  /* Back button */
  .fst-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 4px;
    color: #8b949e;
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: .14em;
    padding: 7px 14px;
    cursor: pointer;
    margin-bottom: 32px;
    transition: color .15s, border-color .15s;
    text-transform: uppercase;
  }
  .fst-back:hover { color: #00e5ff; border-color: #00e5ff40; }

  /* Card */
  .fst-card {
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: transform .25s cubic-bezier(.34,1.2,.64,1), border-color .2s, box-shadow .2s;
    position: relative;
  }
  .fst-card:hover {
    transform: translateY(-5px);
    border-color: var(--accent);
    box-shadow: 0 8px 32px var(--accent-dim);
  }
  .fst-card:hover .fst-card-img {
    transform: scale(1.04);
  }

  .fst-card-img-wrap {
    width: 100%; height: 200px; overflow: hidden; position: relative;
  }
  .fst-card-img {
    width: 100%; height: 100%; object-fit: cover;
    display: block;
    transition: transform .4s ease;
    filter: brightness(.75) saturate(.9);
  }
  /* Small icon overlay bottom-left on image — like the colored icons in reference */
  .fst-card-icon {
    position: absolute;
    bottom: 10px; left: 12px;
    font-size: 28px;
    opacity: .85;
    filter: drop-shadow(0 0 8px var(--accent));
  }
  /* LVL badge overlay bottom-right on image */
  .fst-card-lvl-img {
    position: absolute;
    bottom: 10px; right: 12px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: var(--accent);
    letter-spacing: .15em;
    background: #0d1117cc;
    padding: 3px 8px;
    border-radius: 2px;
  }

  /* Card body */
  .fst-card-body {
    padding: 16px 16px 20px;
  }
  .fst-card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-style: italic;
    font-weight: 900;
    font-size: 22px;
    color: #ffffff;
    letter-spacing: .04em;
    margin-bottom: 10px;
    line-height: 1;
  }
  /* Desc with colored left border — exactly like DSA Terminal */
  .fst-card-desc {
    font-size: 12px;
    color: #8b949e;
    line-height: 1.6;
    border-left: 2px solid var(--accent);
    padding-left: 10px;
    margin-bottom: 14px;
  }
  /* LVL badge below — same style as reference */
  .fst-card-lvl {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: .15em;
  }

  /* Grid layout */
  .fst-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    .fst-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 580px) {
    .fst-grid { grid-template-columns: 1fr; }
  }
`;

/* ── card icons — matching the colored icon overlays in DSA Terminal ── */
const ICONS = {
  'code-runner':      '🏃',
  'dev-survivor':     '🔥',
  'git-quest':        '⚡',
  'code-arena':       '⚔️',
  'code-race':        '⚡',

};

export default function FullStackMissions() {
  const navigate = useNavigate();

  return (
    <div className="fst-root">
      <style>{CSS}</style>
      <div className="fst-grid-bg" />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px 56px', position: 'relative', zIndex: 1 }}>

        {/* ── back button — same as DSA Terminal ── */}
        <button className="fst-back" onClick={() => navigate('/missions')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          BACK TO BASE
        </button>

        {/* ── header — same layout as DSA Terminal ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span className="fst-title-white">FULLSTACK</span>
            <span className="fst-title-accent">TERMINAL</span>
          </div>
          <p className="fst-subtitle">SELECT SUB-SYSTEM TO INITIALIZE MISSION</p>
        </div>

        {/* ── cards grid ── */}
        <div className="fst-grid">
          {GAMES.map(game => (
            <div
              key={game.id}
              className="fst-card"
              style={{
                '--accent': game.accent,
                '--accent-dim': game.accent + '28',
              }}
              onClick={() => navigate(game.path)}
            >
              {/* image top half */}
              <div className="fst-card-img-wrap">
                <img
                  className="fst-card-img"
                  src={game.img}
                  alt={game.title}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = '#0d1117';
                  }}
                />
                {/* colored icon bottom-left on image */}
                <span className="fst-card-icon">{ICONS[game.id]}</span>
              </div>

              {/* card body — dark section below image */}
              <div className="fst-card-body">
                <h3 className="fst-card-title">{game.title}</h3>

                {/* desc with colored left border */}
                <p className="fst-card-desc">{game.desc}</p>

                {/* LVL badge — exactly like reference */}
                <span className="fst-card-lvl">LVL_{game.lvl}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}