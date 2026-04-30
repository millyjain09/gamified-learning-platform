import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   SOCKET  (comment out if no backend)
───────────────────────────────────────── */
// const socket = io("http://localhost:5000");

/* ─────────────────────────────────────────
   TASKS
───────────────────────────────────────── */
const TASKS = [
  {
    id: "login",
    difficulty: "easy",
    problem: "Build a Login Form",
    desc: "input[email] + input[password] + button",
    starter: "<div class=\"form\">\n  \n</div>",
    keywords: ['input', 'type="email"', 'type="password"', "button"],
    labels: ["input tag", "email type", "password type", "button"],
  },
  {
    id: "nav",
    difficulty: "medium",
    problem: "Build a Navigation Bar",
    desc: "nav + ul + 3 li items + active class",
    starter: "<nav>\n  \n</nav>",
    keywords: ["<nav", "<ul", "<li", "active"],
    labels: ["nav tag", "ul tag", "li item", "active class"],
  },
  {
    id: "card",
    difficulty: "hard",
    problem: "Build a Profile Card",
    desc: "img + h2 + p.bio + button.follow",
    starter: "<div class=\"card\">\n  \n</div>",
    keywords: ["<img", "<h2", 'class="bio"', 'class="follow"'],
    labels: ["img tag", "h2 heading", "bio class", "follow btn"],
  },
];

/* ─────────────────────────────────────────
   AI OPPONENT CODE SNIPPETS
───────────────────────────────────────── */
const OPP_SNIPPETS = {
  login: [
    "<div>\n  ",
    '<div>\n  <input\n  ',
    '<div>\n  <input type="email">\n  ',
    '<div>\n  <input type="email">\n  <input\n  ',
    '<div>\n  <input type="email">\n  <input type="password">\n  ',
    '<div>\n  <input type="email">\n  <input type="password">\n  <button>Login</button>\n</div>',
  ],
  nav: [
    "<nav>\n  ",
    "<nav>\n  <ul>\n  ",
    "<nav>\n  <ul>\n    <li>Home</li>\n  ",
    '<nav>\n  <ul>\n    <li class="active">Home</li>\n    <li>About</li>\n    <li>Contact</li>\n  </ul>\n</nav>',
  ],
  card: [
    "<div>\n  ",
    '<div>\n  <img src="avatar.jpg">\n  ',
    '<div>\n  <img src="avatar.jpg">\n  <h2>John</h2>\n  ',
    '<div>\n  <img src="avatar.jpg">\n  <h2>John</h2>\n  <p class="bio">Developer</p>\n  ',
    '<div>\n  <img src="avatar.jpg">\n  <h2>John</h2>\n  <p class="bio">Developer</p>\n  <button class="follow">Follow</button>\n</div>',
  ],
};

/* ─────────────────────────────────────────
   INITIAL LEADERBOARD DATA
───────────────────────────────────────── */
const INITIAL_LEADERBOARD = [
  { name: "xX_DevGod_Xx",  wins: 47, streak: 9, rank: "gold"   },
  { name: "c0deSlayer",    wins: 38, streak: 6, rank: "gold"   },
  { name: "NullPointer",   wins: 29, streak: 4, rank: "silver" },
  { name: "ReactRacer",    wins: 21, streak: 3, rank: "silver" },
  { name: "HTMLHero",      wins: 14, streak: 2, rank: "bronze" },
  { name: "ByteBuster",    wins: 9,  streak: 1, rank: "bronze" },
];

const RANK_COLORS = {
  gold:   { border: "#fbbf24", text: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  silver: { border: "#94a3b8", text: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  bronze: { border: "#f97316", text: "#f97316", bg: "rgba(249,115,22,0.1)"  },
};

/* ─────────────────────────────────────────
   POWER-UPS CONFIG
───────────────────────────────────────── */
const POWERUPS = [
  {
    id: "slow",
    icon: "⏱",
    label: "SLOW",
    desc: "Freeze opponent for 5s",
    color: "#f59e0b",
    cooldown: 30,
  },
  {
    id: "hint",
    icon: "💡",
    label: "HINT",
    desc: "Auto-fill next keyword",
    color: "#06b6d4",
    cooldown: 45,
  },
  {
    id: "boost",
    icon: "⚡",
    label: "BOOST",
    desc: "+25% progress instantly",
    color: "#a78bfa",
    cooldown: 60,
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function CodeRace() {
  /* ── phase: enter | lobby | matching | countdown | game ── */
  const navigate = useNavigate();
  const [phase,       setPhase]       = useState("enter");
  const [playerName,  setPlayerName]  = useState("");
  const [nameInput,   setNameInput]   = useState("");
  const [nameError,   setNameError]   = useState("");
  const [difficulty,  setDifficulty]  = useState("easy");
  const [task,        setTask]        = useState(null);
  const [countdown,   setCountdown]   = useState(3);

  /* ── game state ── */
  const [code,        setCode]        = useState("");
  const [progress,    setProgress]    = useState(0);
  const [oppProgress, setOppProgress] = useState(0);
  const [oppCode,     setOppCode]     = useState("");
  const [timeLeft,    setTimeLeft]    = useState(90);
  const [result,      setResult]      = useState(null); // 'win'|'lose'|'draw'|'timeup'
  const [startTime,   setStartTime]   = useState(null);

  /* ── power-ups ── */
  const [puCooldowns,  setPuCooldowns]  = useState({ slow: 0, hint: 0, boost: 0 });
  const [oppFrozen,    setOppFrozen]    = useState(false);
  const [activeEffect, setActiveEffect] = useState(null); // for flash messages

  /* ── leaderboard ── */
  const [showLB,       setShowLB]       = useState(false);
  const [leaderboard,  setLeaderboard]  = useState(INITIAL_LEADERBOARD);
  const [playerStats,  setPlayerStats]  = useState({ wins: 0, streak: 0, rank: "bronze" });

  /* ── refs ── */
  const timerRef    = useRef(null);
  const aiRef       = useRef(null);
  const puTickRef   = useRef(null);
  const resultRef   = useRef(null);
  const editorRef   = useRef(null);

  /* ─────────────────────────────────────────
     CLEANUP on unmount
  ───────────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(aiRef.current);
      clearInterval(puTickRef.current);
    };
  }, []);

  /* ─────────────────────────────────────────
     UPDATE PROGRESS when code changes
  ───────────────────────────────────────── */
  useEffect(() => {
    if (!task || resultRef.current) return;
    let score = 0;
    task.keywords.forEach((kw) => { if (code.includes(kw)) score += 25; });
    setProgress(score);
    if (score >= 100 && !resultRef.current) triggerResult("win");
  }, [code, task]);

  /* ─────────────────────────────────────────
     POWER-UP COOLDOWN TICK
  ───────────────────────────────────────── */
  useEffect(() => {
    if (phase !== "game") return;
    puTickRef.current = setInterval(() => {
      setPuCooldowns((prev) => ({
        slow:  Math.max(0, prev.slow  - 1),
        hint:  Math.max(0, prev.hint  - 1),
        boost: Math.max(0, prev.boost - 1),
      }));
    }, 1000);
    return () => clearInterval(puTickRef.current);
  }, [phase]);

  /* ─────────────────────────────────────────
     HELPER: trigger result (once)
  ───────────────────────────────────────── */
  const triggerResult = useCallback((r) => {
    if (resultRef.current) return;
    resultRef.current = r;
    clearInterval(timerRef.current);
    clearInterval(aiRef.current);
    setResult(r);
  }, []);

  /* ─────────────────────────────────────────
     START MATCH FLOW
  ───────────────────────────────────────── */
  const startMatch = () => {
    const pool = TASKS.filter((t) => t.difficulty === difficulty);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setTask(chosen);
    setCode(chosen.starter);
    setProgress(0);
    setOppProgress(0);
    setOppCode("");
    setResult(null);
    resultRef.current = null;
    setPuCooldowns({ slow: 0, hint: 0, boost: 0 });
    setOppFrozen(false);
    setActiveEffect(null);
    setTimeLeft(difficulty === "easy" ? 90 : difficulty === "medium" ? 75 : 60);
    setPhase("matching");

    setTimeout(() => {
      setPhase("countdown");
      setCountdown(3);
      let c = 3;
      const cd = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(cd);
          setTimeout(() => beginRace(chosen, difficulty), 500);
        }
      }, 1000);
    }, 1500);
  };

  /* ─────────────────────────────────────────
     BEGIN RACE
  ───────────────────────────────────────── */
  const beginRace = (chosenTask, diff) => {
    setPhase("game");
    setStartTime(Date.now());

    const maxTime = diff === "easy" ? 90 : diff === "medium" ? 75 : 60;
    let remaining = maxTime;

    /* ── countdown timer ── */
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        triggerResult("timeup");
        clearInterval(timerRef.current);
      }
    }, 1000);

    /* ── AI opponent ── */
    const aiSpeed    = diff === "easy" ? [1.5, 3] : diff === "medium" ? [2.5, 5] : [3.5, 7];
    const snippets   = OPP_SNIPPETS[chosenTask.id] || [];
    let   snippetIdx = 0;
    let   oppProg    = 0;
    let   frozen     = false;

    // expose freeze setter to power-up handler
    window.__setOppFrozen = (v) => { frozen = v; };

    aiRef.current = setInterval(() => {
      if (resultRef.current) return;
      if (frozen) return;

      const inc = aiSpeed[0] + Math.random() * (aiSpeed[1] - aiSpeed[0]);
      oppProg = Math.min(100, oppProg + inc);

      const step = Math.floor((oppProg / 100) * (snippets.length - 1));
      if (step !== snippetIdx) {
        snippetIdx = step;
        setOppCode(snippets[snippetIdx] || "");
      }

      setOppProgress(oppProg);

      if (oppProg >= 100) {
        triggerResult("lose");
        clearInterval(aiRef.current);
      }
    }, 1800);
  };

  /* ─────────────────────────────────────────
     USE POWER-UP
  ───────────────────────────────────────── */
  const usePowerup = (id) => {
    if (puCooldowns[id] > 0 || resultRef.current) return;

    if (id === "slow") {
      setOppFrozen(true);
      if (window.__setOppFrozen) window.__setOppFrozen(true);
      setActiveEffect("Opponent FROZEN for 5s! ❄️");
      setPuCooldowns((p) => ({ ...p, slow: 30 }));
      setTimeout(() => {
        setOppFrozen(false);
        if (window.__setOppFrozen) window.__setOppFrozen(false);
      }, 5000);
    }

    if (id === "hint") {
      if (!task) return;
      const nextKw = task.keywords.find((kw) => !code.includes(kw));
      if (nextKw) {
        const insertion = ` ${nextKw}`;
        setCode((prev) => prev + insertion);
        setActiveEffect(`Hint used: "${nextKw}" added! 💡`);
      } else {
        setActiveEffect("All keywords already included!");
      }
      setPuCooldowns((p) => ({ ...p, hint: 45 }));
    }

    if (id === "boost") {
      setProgress((prev) => {
        const next = Math.min(100, prev + 25);
        if (next >= 100 && !resultRef.current) triggerResult("win");
        return next;
      });
      setActiveEffect("+25% BOOST applied! ⚡");
      setPuCooldowns((p) => ({ ...p, boost: 60 }));
    }

    setTimeout(() => setActiveEffect(null), 2500);
  };

  /* ─────────────────────────────────────────
     EXIT TO LOBBY
  ───────────────────────────────────────── */
  const exitToLobby = () => {
    clearInterval(timerRef.current);
    clearInterval(aiRef.current);
    clearInterval(puTickRef.current);
    setPhase("lobby");
    setResult(null);
    resultRef.current = null;
  };

  /* ─────────────────────────────────────────
     PLAY AGAIN
  ───────────────────────────────────────── */
  const playAgain = () => {
    clearInterval(timerRef.current);
    clearInterval(aiRef.current);
    clearInterval(puTickRef.current);
    setPhase("lobby");
    setResult(null);
    resultRef.current = null;
  };

  /* ─────────────────────────────────────────
     UPDATE LEADERBOARD on win
  ───────────────────────────────────────── */
  useEffect(() => {
    if (result !== "win") return;
    setPlayerStats((prev) => {
      const wins   = prev.wins + 1;
      const streak = prev.streak + 1;
      const rank   = wins >= 20 ? "gold" : wins >= 8 ? "silver" : "bronze";
      return { wins, streak, rank };
    });
  }, [result]);

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={S.root}>
      {/* scanlines overlay */}
      <div style={S.scanlines} />

      {/* ── LEADERBOARD MODAL ── */}
      {showLB && (
        <LeaderboardModal
          leaderboard={leaderboard}
          playerStats={playerStats}
          playerName={playerName}
          onClose={() => setShowLB(false)}
        />
      )}

      {/* ── NAME ENTRY ── */}
      {phase === "enter" && (
        <EnterScreen
          nameInput={nameInput}
          setNameInput={setNameInput}
          nameError={nameError}
          hasExistingName={!!playerName}
            onBack={() => navigate("/full-stack")}
          onConfirm={() => {
            const n = nameInput.trim();
            if (!n) { setNameError("Apna naam toh daal bhai!"); return; }
            if (n.length < 2) { setNameError("Naam kam se kam 2 characters ka ho"); return; }
            if (n.length > 16) { setNameError("16 characters se zyada nahi"); return; }
            setPlayerName(n);
            setNameError("");
            setPhase("lobby");
          }}
        />
      )}

      {/* ── LOBBY ── */}
      {phase === "lobby" && (
        <LobbyScreen
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={startMatch}
          onLeaderboard={() => setShowLB(true)}
          playerStats={playerStats}
          playerName={playerName}
          onChangeName={() => setPhase("enter")}
        />
      )}

      {/* ── MATCHING ── */}
      {phase === "matching" && <MatchingScreen playerName={playerName} onExit={exitToLobby} />}

      {/* ── COUNTDOWN ── */}
      {phase === "countdown" && <CountdownScreen n={countdown} />}

      {/* ── GAME ── */}
      {phase === "game" && task && (
        <GameScreen
          task={task}
          code={code}
          setCode={setCode}
          progress={progress}
          oppProgress={oppProgress}
          oppCode={oppCode}
          timeLeft={timeLeft}
          result={result}
          startTime={startTime}
          puCooldowns={puCooldowns}
          oppFrozen={oppFrozen}
          activeEffect={activeEffect}
          onUsePowerup={usePowerup}
          onPlayAgain={playAgain}
          onExit={exitToLobby}
          editorRef={editorRef}
          playerName={playerName}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ENTER SCREEN (Name Input)
═══════════════════════════════════════════ */
function EnterScreen({ nameInput, setNameInput, nameError, onConfirm, onBack, hasExistingName }) {
  return (
    <div style={S.lobby}>
      <div style={S.logoWrap}>
        <div style={S.logoTitle}>CODE RACE</div>
        <div style={S.logoSub}>REAL-TIME CODING BATTLE</div>
      </div>

      <div style={S.nameCard}>
        <div style={S.nameCardTitle}>ENTER YOUR NAME</div>
        <div style={S.nameCardSub}>Yeh naam leaderboard pe dikhega</div>
        <input
          style={{ ...S.nameInput, ...(nameError ? S.nameInputError : {}) }}
          type="text"
          placeholder="e.g. xX_DevGod_Xx"
          value={nameInput}
          maxLength={16}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); }}
          autoFocus
        />
        {nameError && <div style={S.nameError}>{nameError}</div>}
        <div style={S.nameCounter}>{nameInput.length}/16</div>
        <button style={S.startBtn} onClick={onConfirm}>
          <span style={S.btnShine} />
          ENTER ARENA ⚡
        </button>
        <button style={S.exitBtn} onClick={onBack}>← BACK</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOBBY SCREEN
═══════════════════════════════════════════ */
function LobbyScreen({ difficulty, setDifficulty, onStart, onLeaderboard, playerStats, playerName, onChangeName }) {
  return (
    <div style={S.lobby}>
      <div style={S.logoWrap}>
        <div style={S.logoTitle}>CODE RACE</div>
        <div style={S.logoSub}>REAL-TIME CODING BATTLE</div>
      </div>

      {/* player badge */}
      <div style={{ ...S.playerBadge, borderColor: RANK_COLORS[playerStats.rank].border }}>
        <span style={{ color: "#00ffb4", fontWeight: 700, fontSize: 15 }}>{playerName}</span>
        <span style={S.badgeSep}>|</span>
        <span style={{ color: RANK_COLORS[playerStats.rank].text, fontWeight: 700 }}>
          {playerStats.rank.toUpperCase()}
        </span>
        <span style={S.badgeSep}>|</span>
        <span style={{ color: "#aaa" }}>{playerStats.wins} WINS</span>
        <span style={S.badgeSep}>|</span>
        <span style={{ color: "#ffaa00" }}>🔥 {playerStats.streak}</span>
        <button onClick={onChangeName} style={S.changeNameBtn} title="Change name">✏️</button>
      </div>

      {/* difficulty */}
      <div style={S.diffRow}>
        {["easy", "medium", "hard"].map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            style={{
              ...S.diffBtn,
              ...(difficulty === d ? S.diffBtnActive : {}),
            }}
          >
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      <button style={S.startBtn} onClick={onStart}>
        <span style={S.btnShine} />
        ⚡ QUICK MATCH
      </button>

      <button style={S.lbBtn} onClick={onLeaderboard}>
        🏆 LEADERBOARD
      </button>

      <button style={S.exitBtn} onClick={onChangeName}>
        ✏️ CHANGE NAME
      </button>

      {/* power-ups preview */}
      <div style={S.puPreview}>
        <div style={S.puPreviewTitle}>AVAILABLE POWER-UPS</div>
        <div style={S.puPreviewRow}>
          {POWERUPS.map((p) => (
            <div key={p.id} style={{ ...S.puCard, borderColor: p.color + "44" }}>
              <span style={{ fontSize: 22 }}>{p.icon}</span>
              <span style={{ ...S.puCardLabel, color: p.color }}>{p.label}</span>
              <span style={S.puCardDesc}>{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* how to */}
      <div style={S.howto}>
        <div style={S.howtoTitle}>HOW TO PLAY</div>
        {[
          "Write the HTML code shown in the task",
          "Type required keywords to fill your progress bar",
          "Use power-ups to gain advantage over opponent",
          "Reach 100% before opponent wins",
        ].map((t, i) => (
          <div key={i} style={S.howtoItem}>
            <div style={S.howtoDot} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MATCHING SCREEN
═══════════════════════════════════════════ */
function MatchingScreen({ playerName, onExit }) {
  return (
    <div style={S.center}>
      <div style={S.matchTitle}>FINDING OPPONENT FOR <span style={{ color: "#00ffb4" }}>{playerName}</span></div>
      <div style={S.spinner} />
      <div style={S.dots}>
        <span style={{ ...S.dot, animationDelay: "0s" }} />
        <span style={{ ...S.dot, animationDelay: "0.2s" }} />
        <span style={{ ...S.dot, animationDelay: "0.4s" }} />
      </div>
      <button style={S.exitBtn} onClick={onExit}>← BACK TO LOBBY</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COUNTDOWN SCREEN
═══════════════════════════════════════════ */
function CountdownScreen({ n }) {
  return (
    <div style={S.center}>
      <div style={S.countNum}>{n > 0 ? n : "GO!"}</div>
      <div style={S.countLabel}>{n > 0 ? "GET READY" : "START CODING"}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME SCREEN
═══════════════════════════════════════════ */
function GameScreen({
  task, code, setCode, progress, oppProgress, oppCode,
  timeLeft, result, startTime, puCooldowns, oppFrozen,
  activeEffect, onUsePowerup, onPlayAgain, onExit, editorRef, playerName,
}) {
  const tc = timeLeft <= 10 ? "#ff4466" : timeLeft <= 30 ? "#ffaa00" : "#00ffb4";
  const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  return (
    <div style={S.gameWrap}>
      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <button onClick={onExit} style={S.topExitBtn}>← EXIT</button>
        <div style={S.taskText}>
          <span style={{ color: "#555", fontSize: 11, letterSpacing: 3 }}>TASK &nbsp;</span>
          <span style={{ color: "#00ffb4", fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>{task.problem}</span>
          <span style={{ color: "#444", margin: "0 10px" }}>|</span>
          <span style={{ color: "#888", fontSize: 15 }}>{task.desc}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: "#555" }}>TIME</span>
          <span style={{ ...S.timerNum, color: tc }}>{timeLeft}s</span>
        </div>
      </div>

      {/* ── POWER-UPS BAR ── */}
      <div style={S.puBar}>
        <span style={S.puBarLabel}>POWER-UPS</span>
        {POWERUPS.map((p) => {
          const cd = puCooldowns[p.id];
          const ready = cd === 0 && !result;
          return (
            <button
              key={p.id}
              onClick={() => onUsePowerup(p.id)}
              title={p.desc}
              style={{
                ...S.puBtn,
                borderColor: ready ? p.color : "#333",
                opacity: ready ? 1 : 0.45,
                cursor: ready ? "pointer" : "not-allowed",
              }}
            >
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <span style={{ ...S.puBtnLabel, color: ready ? p.color : "#555" }}>{p.label}</span>
              {cd > 0 && <span style={S.puCd}>{cd}s</span>}
            </button>
          );
        })}
        {activeEffect && (
          <div style={S.effectToast}>{activeEffect}</div>
        )}
        {oppFrozen && (
          <div style={{ ...S.effectToast, color: "#06b6d4", borderColor: "#06b6d4" }}>
            ❄️ Opponent frozen!
          </div>
        )}
      </div>

      {/* ── PLAYERS AREA ── */}
      <div style={S.playersArea}>
        {/* YOU */}
        <div style={S.panel}>
          <div style={S.panelHeader}>
            <span style={{ ...S.playerName, color: "#00ffb4" }}>{playerName || "YOU"}</span>
            <span style={{ ...S.progPct, color: "#00ffb4" }}>{progress}%</span>
          </div>

          {/* progress bar */}
          <div style={S.track}>
            <div style={{ ...S.fill, width: `${progress}%`, background: "linear-gradient(90deg,#00c896,#00ffb4)" }}>
              <div style={{ ...S.progGlow, background: "#00ffb4" }} />
            </div>
          </div>

          {/* milestones */}
          <div style={S.miles}>
            {[25, 50, 75, 100].map((m) => (
              <div key={m} style={{ ...S.mile, background: progress >= m ? "#00ffb4" : "rgba(255,255,255,0.06)" }} />
            ))}
          </div>

          {/* keyword chips */}
          <div style={S.chips}>
            {task.keywords.map((kw, i) => (
              <div key={i} style={{ ...S.chip, ...(code.includes(kw) ? S.chipDone : {}) }}>
                {task.labels[i]}
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div style={S.editorWrap}>
            <Editor
              height="100%"
              defaultLanguage="html"
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={(editor) => { editorRef.current = editor; }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Share Tech Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
              }}
            />
          </div>
        </div>

        {/* OPPONENT */}
        <div style={{ ...S.panel, borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={S.panelHeader}>
            <span style={{ ...S.playerName, color: "#ff6699" }}>
              OPPONENT {oppFrozen ? "❄️" : "🤖"}
            </span>
            <span style={{ ...S.progPct, color: "#ff6699" }}>{Math.round(oppProgress)}%</span>
          </div>

          <div style={S.track}>
            <div style={{ ...S.fill, width: `${oppProgress}%`, background: "linear-gradient(90deg,#cc3355,#ff6699)" }}>
              <div style={{ ...S.progGlow, background: "#ff6699" }} />
            </div>
          </div>

          <div style={S.miles}>
            {[25, 50, 75, 100].map((m) => (
              <div key={m} style={{ ...S.mile, background: oppProgress >= m ? "#ff6699" : "rgba(255,255,255,0.06)" }} />
            ))}
          </div>

          <div style={{ ...S.chips, visibility: "hidden" }}>
            {task.keywords.map((_, i) => <div key={i} style={S.chip}>_</div>)}
          </div>

          {/* Fake editor showing opponent typing */}
          <div style={S.oppEditor}>
            <pre style={S.oppCode}>{oppCode}<span style={S.cursor} /></pre>
          </div>
        </div>
      </div>

      {/* ── RESULT OVERLAY ── */}
      {result && (
        <ResultOverlay
          result={result}
          progress={progress}
          oppProgress={oppProgress}
          elapsed={elapsed}
          onPlayAgain={onPlayAgain}
          onExit={onExit}
          playerName={playerName}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   RESULT OVERLAY
═══════════════════════════════════════════ */
function ResultOverlay({ result, progress, oppProgress, elapsed, onPlayAgain, onExit, playerName }) {
  const map = {
    win:    { icon: "🏆", title: "YOU WIN",   sub: "FLAWLESS VICTORY",    cls: "#00ffb4" },
    lose:   { icon: "💀", title: "DEFEATED",  sub: "BETTER LUCK NEXT TIME", cls: "#ff4466" },
    timeup: { icon: "⏱", title: "TIME UP",   sub: "TIME EXPIRED",        cls: "#ffaa00" },
    draw:   { icon: "🤝", title: "DRAW",      sub: "EVENLY MATCHED",      cls: "#0af"    },
  };
  const r = map[result] || map.draw;
  return (
    <div style={S.resultOverlay}>
      <div style={S.resultCard}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>{r.icon}</div>
        <div style={{ ...S.resultTitle, color: r.cls }}>{r.title}</div>
        <div style={S.resultSub}>{r.sub}</div>
        <div style={S.resultStats}>
          <div style={S.stat}>
            <div style={{ ...S.statVal, color: "#00ffb4" }}>{progress}%</div>
            <div style={S.statLabel}>{playerName || "YOU"}</div>
          </div>
          <div style={S.stat}>
            <div style={{ ...S.statVal, color: "#ff6699" }}>{Math.round(oppProgress)}%</div>
            <div style={S.statLabel}>OPPONENT</div>
          </div>
          <div style={S.stat}>
            <div style={{ ...S.statVal, color: "#0af" }}>{elapsed}s</div>
            <div style={S.statLabel}>TIME USED</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={S.playAgainBtn} onClick={onPlayAgain}>
            PLAY AGAIN
          </button>
          <button style={{ ...S.playAgainBtn, borderColor: "#555", color: "#888" }} onClick={onExit}>
            ← LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LEADERBOARD MODAL
═══════════════════════════════════════════ */
function LeaderboardModal({ leaderboard, playerStats, playerName, onClose }) {
  const sorted = [...leaderboard].sort((a, b) => b.wins - a.wins);
  return (
    <div style={S.lbOverlay}>
      <div style={S.lbModal}>
        <div style={S.lbHeader}>
          <span style={S.lbTitle}>🏆 LEADERBOARD</span>
          <button onClick={onClose} style={S.lbClose}>✕</button>
        </div>

        {/* player's own stats */}
        <div style={S.lbSelf}>
          <span style={{ color: "#aaa", fontSize: 13 }}>{playerName || "YOU"}</span>
          <span style={{ color: "#00ffb4", fontWeight: 700, fontSize: 18 }}>{playerStats.wins} WINS</span>
          <span style={{ color: "#ffaa00" }}>🔥 {playerStats.streak} streak</span>
          <span style={{
            padding: "2px 10px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            background: RANK_COLORS[playerStats.rank].bg,
            color: RANK_COLORS[playerStats.rank].text,
            border: `1px solid ${RANK_COLORS[playerStats.rank].border}`,
          }}>
            {playerStats.rank.toUpperCase()}
          </span>
        </div>

        {/* table */}
        <div style={S.lbTable}>
          <div style={S.lbTableHead}>
            <span style={{ width: 30, textAlign: "center" }}>#</span>
            <span style={{ flex: 1 }}>PLAYER</span>
            <span style={{ width: 60, textAlign: "center" }}>WINS</span>
            <span style={{ width: 80, textAlign: "center" }}>STREAK</span>
            <span style={{ width: 70, textAlign: "center" }}>RANK</span>
          </div>
          {sorted.map((p, i) => (
            <div key={p.name} style={{ ...S.lbRow, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
              <span style={{ width: 30, textAlign: "center", color: i < 3 ? ["#fbbf24","#94a3b8","#f97316"][i] : "#555", fontWeight: 700 }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, color: "#ddd" }}>{p.name}</span>
              <span style={{ width: 60, textAlign: "center", color: "#00ffb4", fontFamily: "monospace" }}>{p.wins}</span>
              <span style={{ width: 80, textAlign: "center", color: "#ffaa00" }}>🔥 {p.streak}</span>
              <span style={{
                width: 70,
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: RANK_COLORS[p.rank].text,
              }}>
                {p.rank.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */

const pulse = `
  @keyframes codeRacePulse {
    0%,100% { text-shadow: 0 0 20px #00ffb4, 0 0 60px rgba(0,255,180,0.3); }
    50%      { text-shadow: 0 0 30px #00ffb4, 0 0 90px rgba(0,255,180,0.5); }
  }
  @keyframes codeRaceSpin { to { transform: rotate(360deg); } }
  @keyframes codeRaceBlink { 0%,80%,100%{opacity:.15} 40%{opacity:1} }
  @keyframes codeRaceCursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes codeRaceShine { 0%{left:-100%} 60%,100%{left:100%} }
  @keyframes codeRacePop { from{transform:scale(1.4);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes codeRaceSlideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes codeRaceFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes codeRaceTimerFlash { 0%,100%{opacity:1} 50%{opacity:.3} }
  .cr-logo-anim { animation: codeRacePulse 2s ease-in-out infinite; }
  .cr-spinner   { animation: codeRaceSpin  1s linear infinite; }
  .cr-dot       { animation: codeRaceBlink 1.2s ease-in-out infinite; }
  .cr-cursor    { animation: codeRaceCursor .8s step-end infinite; }
  .cr-shine     { animation: codeRaceShine 2.5s infinite; }
  .cr-pop       { animation: codeRacePop .4s ease-out; }
  .cr-slideup   { animation: codeRaceSlideUp .4s ease; }
  .cr-fadein    { animation: codeRaceFadeIn .4s ease; }
`;

if (typeof document !== "undefined") {
  const existing = document.getElementById("cr-styles");
  if (!existing) {
    const tag = document.createElement("style");
    tag.id = "cr-styles";
    tag.textContent = pulse;
    document.head.appendChild(tag);
  }
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#050a0f",
    color: "#e0e0e0",
    fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  scanlines: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,0.012) 2px,rgba(0,255,180,0.012) 4px)",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* NAME ENTRY */
  nameCard: {
    background: "rgba(0,255,180,0.03)",
    border: "1px solid rgba(0,255,180,0.15)",
    borderRadius: 14, padding: "32px 40px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
    maxWidth: 380, width: "100%",
  },
  nameCardTitle: { fontSize: 13, letterSpacing: 4, color: "#0af", fontWeight: 700 },
  nameCardSub: { fontSize: 13, color: "#555", marginBottom: 4 },
  nameInput: {
    width: "100%",
    background: "#0a0e14",
    border: "1px solid rgba(0,255,180,0.25)",
    borderRadius: 8, padding: "12px 16px",
    color: "#00ffb4", fontSize: 18, fontWeight: 700,
    fontFamily: "inherit", letterSpacing: 2,
    outline: "none", textAlign: "center",
    transition: "border-color 0.2s",
  },
  nameInputError: { borderColor: "#ff4466" },
  nameError: { fontSize: 12, color: "#ff4466", letterSpacing: 1 },
  nameCounter: { fontSize: 11, color: "#444", letterSpacing: 1, alignSelf: "flex-end" },

  /* EXIT BUTTONS */
  exitBtn: {
    marginTop: 16,
    padding: "9px 24px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#555", fontSize: 13, fontWeight: 700,
    letterSpacing: 2, borderRadius: 6, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.2s",
  },
  topExitBtn: {
    padding: "5px 14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#555", fontSize: 12, fontWeight: 700,
    letterSpacing: 2, borderRadius: 5, cursor: "pointer",
    fontFamily: "inherit", flexShrink: 0,
    transition: "all 0.2s",
  },
  changeNameBtn: {
    background: "transparent", border: "none",
    cursor: "pointer", fontSize: 14, padding: "0 2px",
    marginLeft: 4, opacity: 0.6,
  },

  /* LOBBY */
  lobby: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: 20, padding: "40px 20px",
  },
  logoWrap: { textAlign: "center" },
  logoTitle: {
    fontSize: 56, fontWeight: 700, letterSpacing: 8,
    color: "#00ffb4",
    textShadow: "0 0 20px #00ffb4, 0 0 60px rgba(0,255,180,0.3)",
  },
  logoSub: { fontSize: 13, letterSpacing: 6, color: "#0af", marginTop: -6, opacity: 0.65 },
  playerBadge: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "6px 18px", borderRadius: 6,
    border: "1px solid", fontSize: 13,
    background: "rgba(255,255,255,0.03)",
  },
  badgeSep: { color: "#333" },
  diffRow: { display: "flex", gap: 10 },
  diffBtn: {
    padding: "7px 22px",
    border: "1px solid rgba(0,255,180,0.25)",
    background: "transparent", color: "#666",
    borderRadius: 6, cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: 2,
    transition: "all 0.2s",
  },
  diffBtnActive: {
    borderColor: "#00ffb4", color: "#00ffb4",
    background: "rgba(0,255,180,0.08)",
  },
  startBtn: {
    padding: "15px 52px",
    background: "rgba(0,255,180,0.08)",
    border: "1px solid #00ffb4",
    color: "#00ffb4", fontSize: 20, fontWeight: 700,
    letterSpacing: 4, borderRadius: 8, cursor: "pointer",
    fontFamily: "inherit", position: "relative", overflow: "hidden",
    transition: "all 0.2s",
  },
  btnShine: {
    position: "absolute", top: 0, left: "-100%",
    width: "100%", height: "100%",
    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)",
    animation: "codeRaceShine 2.5s infinite",
  },
  lbBtn: {
    padding: "9px 28px",
    border: "1px solid rgba(251,191,36,0.3)",
    background: "transparent", color: "#fbbf24",
    fontSize: 14, fontWeight: 700, letterSpacing: 2,
    borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
  },
  puPreview: {
    background: "rgba(0,255,180,0.03)",
    border: "1px solid rgba(0,255,180,0.1)",
    borderRadius: 10, padding: "16px 24px",
    maxWidth: 480, width: "100%",
  },
  puPreviewTitle: { fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 12 },
  puPreviewRow: { display: "flex", gap: 10 },
  puCard: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, padding: "10px 8px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid", borderRadius: 8,
  },
  puCardLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 2 },
  puCardDesc: { fontSize: 11, color: "#555", textAlign: "center" },
  howto: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: "16px 24px",
    maxWidth: 480, width: "100%",
  },
  howtoTitle: { fontSize: 11, letterSpacing: 3, color: "#0af", marginBottom: 10 },
  howtoItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#888", marginBottom: 7 },
  howtoDot: { width: 6, height: 6, borderRadius: "50%", background: "#00ffb4", flexShrink: 0 },

  /* CENTER */
  center: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: 20,
  },
  matchTitle: { fontSize: 13, letterSpacing: 4, color: "#0af" },
  spinner: {
    width: 48, height: 48,
    border: "2px solid rgba(0,255,180,0.15)",
    borderTopColor: "#00ffb4",
    borderRadius: "50%",
    animation: "codeRaceSpin 1s linear infinite",
  },
  dots: { display: "flex", gap: 6 },
  dot: {
    display: "inline-block", width: 8, height: 8,
    borderRadius: "50%", background: "#00ffb4",
    animation: "codeRaceBlink 1.2s ease-in-out infinite",
  },
  countNum: {
    fontSize: 110, fontWeight: 700, color: "#00ffb4",
    textShadow: "0 0 40px #00ffb4",
    animation: "codeRacePop 0.4s ease-out",
    lineHeight: 1,
  },
  countLabel: { fontSize: 13, letterSpacing: 4, color: "#444" },

  /* GAME */
  gameWrap: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column",
    height: "100vh",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px",
    background: "rgba(0,0,0,0.6)",
    borderBottom: "1px solid rgba(0,255,180,0.08)",
    flexShrink: 0,
  },
  taskText: { flex: 1, fontSize: 13, textAlign: "center" },
  timerNum: { fontSize: 22, fontWeight: 700, fontFamily: "monospace", minWidth: 44 },

  /* POWER-UPS BAR */
  puBar: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 16px",
    background: "rgba(0,0,0,0.4)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    flexShrink: 0, flexWrap: "wrap",
  },
  puBarLabel: { fontSize: 11, letterSpacing: 2, color: "#444", marginRight: 4 },
  puBtn: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "5px 12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 6, cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 700,
    transition: "all 0.2s", position: "relative",
  },
  puBtnLabel: { letterSpacing: 1 },
  puCd: {
    position: "absolute", top: -6, right: -4,
    fontSize: 10, background: "#ff4466", color: "#fff",
    padding: "1px 4px", borderRadius: 3, fontWeight: 700,
  },
  effectToast: {
    marginLeft: "auto", fontSize: 13, fontWeight: 700,
    color: "#00ffb4", border: "1px solid rgba(0,255,180,0.3)",
    padding: "4px 12px", borderRadius: 6,
    background: "rgba(0,255,180,0.06)",
    animation: "codeRaceFadeIn 0.3s ease",
  },

  /* PLAYERS */
  playersArea: { display: "flex", flex: 1, overflow: "hidden" },
  panel: { flex: 1, display: "flex", flexDirection: "column", padding: "12px 14px", overflow: "hidden" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 },
  playerName: { fontSize: 12, letterSpacing: 3, fontWeight: 700 },
  progPct: { fontSize: 20, fontWeight: 700, fontFamily: "monospace" },
  track: { height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 8, overflow: "hidden", position: "relative", flexShrink: 0 },
  fill: { height: "100%", borderRadius: 3, transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)", position: "relative" },
  progGlow: { position: "absolute", right: 0, top: -2, width: 10, height: 10, borderRadius: "50%", filter: "blur(3px)" },
  miles: { display: "flex", gap: 4, marginBottom: 8, flexShrink: 0 },
  mile: { flex: 1, height: 2, borderRadius: 1, transition: "background 0.3s" },
  chips: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8, flexShrink: 0 },
  chip: {
    padding: "2px 8px", borderRadius: 4,
    fontSize: 11, letterSpacing: 1,
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#444", background: "transparent",
    transition: "all 0.3s",
  },
  chipDone: {
    color: "#00ffb4",
    borderColor: "rgba(0,255,180,0.5)",
    background: "rgba(0,255,180,0.07)",
  },
  editorWrap: {
    flex: 1, minHeight: 0,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid rgba(0,255,180,0.15)",
  },
  oppEditor: {
    flex: 1, minHeight: 0,
    background: "#0a0e14",
    borderRadius: 8,
    border: "1px solid rgba(255,102,153,0.1)",
    padding: 12, overflow: "hidden",
  },
  oppCode: {
    fontFamily: "'Share Tech Mono','Fira Code',monospace",
    fontSize: 13, color: "#555", whiteSpace: "pre-wrap",
    lineHeight: 1.6, margin: 0,
  },
  cursor: {
    display: "inline-block", width: 2, height: 14,
    background: "#ff6699",
    animation: "codeRaceCursor 0.8s step-end infinite",
    verticalAlign: "text-bottom", marginLeft: 1,
  },

  /* RESULT */
  resultOverlay: {
    position: "absolute", top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(5,10,15,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 10,
    animation: "codeRaceFadeIn 0.4s ease",
  },
  resultCard: {
    textAlign: "center", padding: "40px 52px",
    borderRadius: 14,
    border: "1px solid rgba(0,255,180,0.15)",
    background: "rgba(10,14,20,0.97)",
    animation: "codeRaceSlideUp 0.4s ease",
  },
  resultTitle: { fontSize: 42, fontWeight: 700, letterSpacing: 4, marginBottom: 6 },
  resultSub: { fontSize: 13, letterSpacing: 3, color: "#555", marginBottom: 28 },
  resultStats: { display: "flex", gap: 28, marginBottom: 28, justifyContent: "center" },
  stat: { textAlign: "center" },
  statVal: { fontSize: 28, fontWeight: 700, fontFamily: "monospace" },
  statLabel: { fontSize: 11, letterSpacing: 2, color: "#555", marginTop: 2 },
  playAgainBtn: {
    padding: "12px 38px",
    background: "rgba(0,255,180,0.08)",
    border: "1px solid #00ffb4",
    color: "#00ffb4", fontSize: 16, fontWeight: 700,
    letterSpacing: 3, borderRadius: 8, cursor: "pointer",
    fontFamily: "inherit",
  },

  /* LEADERBOARD */
  lbOverlay: {
    position: "fixed", top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
    animation: "codeRaceFadeIn 0.3s ease",
  },
  lbModal: {
    background: "#0a0e14",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 14, padding: "28px 32px",
    width: "100%", maxWidth: 560,
    animation: "codeRaceSlideUp 0.3s ease",
  },
  lbHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  lbTitle: { fontSize: 20, fontWeight: 700, letterSpacing: 3, color: "#fbbf24" },
  lbClose: {
    background: "transparent", border: "none",
    color: "#555", fontSize: 20, cursor: "pointer",
    fontFamily: "inherit",
  },
  lbSelf: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "10px 14px",
    background: "rgba(0,255,180,0.04)",
    border: "1px solid rgba(0,255,180,0.1)",
    borderRadius: 8, marginBottom: 16,
    flexWrap: "wrap",
  },
  lbTable: { display: "flex", flexDirection: "column", gap: 0 },
  lbTableHead: {
    display: "flex", alignItems: "center",
    padding: "6px 8px",
    fontSize: 11, letterSpacing: 2, color: "#444",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 4,
  },
  lbRow: {
    display: "flex", alignItems: "center",
    padding: "10px 8px", borderRadius: 6,
    fontSize: 14,
  },
};