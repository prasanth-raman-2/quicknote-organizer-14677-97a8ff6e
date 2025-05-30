import React from "react";
import "./App.css";
import QuickNoteMainContainer from "./QuickNoteMainContainer";

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app">
      <nav className="navbar" style={{ background: "#4A90E2" }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: "#F5A623" }}>✏️</span> QuickNote Organizer
            </div>
            <span style={{ color: "#fff", fontSize: 14, letterSpacing: 1, fontWeight: 400 }}>
              by KAVIA AI
            </span>
          </div>
        </div>
      </nav>
      <main style={{ paddingTop: 56 }}>
        <QuickNoteMainContainer />
      </main>
    </div>
  );
}

export default App;