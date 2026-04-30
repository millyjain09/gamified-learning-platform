import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing Core Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MissionSelection from './pages/MissionSelection';
import DSAMissions from './pages/DSAMissions';
import AlgoArena from './pages/games/AlgoArena.jsx';
import FullStackMissions from './pages/FullStackMissions.jsx';

// Importing Game Components
import DebugLevels from './pages/games/DebugLevels';
import DebugArena from './pages/games/DebugArena';
import PredictGame from './pages/games/PredictGame.jsx';
import GraphVilla from './pages/games/GraphVilla.jsx';
import BattleScreen from './pages/games/BattleScreen.jsx';
import DebugFullstack from './pages/games/debugFullstack.jsx';
import AlgoVerse from './pages/games/AlgoVerse.jsx';
import GuardiansGate from './pages/games/GuardiansGate.jsx';

import CodeArena from './pages/games/CodeArena.jsx';
import GitQuest from './pages/games/GitQuest.jsx';
import CodeRunner from './pages/games/CodeRunner.jsx';
import CodeRace from './pages/games/CodeRace.jsx';
import DevSurvivor from './pages/games/DevSurvivor.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Navigation Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/missions" element={<MissionSelection />} />
        <Route path="/dsa-missions" element={<DSAMissions />} />
        <Route path="/full-stack" element={<FullStackMissions />} />

        
        {/* Game Routes */}
        <Route path="/games/debug" element={<DebugLevels />} /> 
        <Route path="/games/debug/arena" element={<DebugArena />} /> 
        <Route path="/games/predict" element={<PredictGame />} />
        <Route path="/games/algo-arena" element={<AlgoArena />} />
        <Route path="/games/graph" element={<GraphVilla/>} />
        <Route path="/games/battle" element={<AlgoVerse/>} />
        <Route path="/games/guardians-gate" element={<GuardiansGate/>} />

        {/* <Route path="/algoverse" element={<AlgoVerse />} /> */}

{/*full stack game routed*/}
        <Route path="/games/debug-dungeon" element={<DebugFullstack/>} />
        <Route path="/games/code-arena" element={<CodeArena />} />
        <Route path="/games/git-quest" element={<GitQuest />} />
        <Route path="/games/code-runner" element={<CodeRunner />} />
        <Route path="/games/code-race" element={<CodeRace />} />
        <Route path="/games/dev-survivor" element={<DevSurvivor />} />


        {/* Catch-all: redirect unknown URLs back to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;