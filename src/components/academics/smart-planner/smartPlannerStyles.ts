export const BG = `radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.10), transparent 55%),
linear-gradient(180deg, rgba(168,5,50,1) 0%, rgba(120,0,35,0.98) 55%, rgba(168,5,50,1) 100%)`;

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,700;0,9..40,800;0,9..40,900;0,9..40,1000&display=swap');

  @keyframes sp-spin { to { transform: rotate(360deg) } }
  @keyframes sp-fade { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
  @keyframes sp-pop  { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }

  .sp-field {
    width: 100%; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.20); border-radius: 10px;
    color: #fff; padding: 8px 12px; font-size: 13px;
    font-family: 'DM Sans', system-ui, sans-serif; outline: none;
    transition: border-color 0.18s, background 0.18s; box-sizing: border-box;
  }
  .sp-field:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.12); }
  .sp-field::placeholder { color: rgba(255,255,255,0.36); }
  .sp-field option { background: #780023; color: #fff; }

  .sp-label {
    display: block; font-size: 10px; font-weight: 800;
    letter-spacing: 0.11em; text-transform: uppercase;
    color: rgba(255,255,255,0.46); margin-bottom: 5px;
  }

  .sp-toggle {
    display: flex; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.13); border-radius: 10px; overflow: hidden;
  }
  .sp-toggle-btn {
    flex: 1; padding: 7px 0; border: none; background: transparent;
    color: rgba(255,255,255,0.46); font-weight: 700; font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer; transition: all 0.15s;
  }
  .sp-toggle-btn.on { background: rgba(255,255,255,0.15); color: #fff; }

  .sp-build-btn {
    width: 100%; padding: 11px; background: rgba(0,0,0,0.75); color: #fff;
    border: none; border-radius: 12px; font-weight: 900; font-size: 13px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer; letter-spacing: 0.03em;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: opacity 0.18s, transform 0.15s;
  }
  .sp-build-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .sp-build-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .sp-test-btn {
    width: 100%; padding: 9px; background: rgba(124,58,237,0.20);
    color: #c4b5fd; border: 1px solid rgba(124,58,237,0.42); border-radius: 12px;
    font-weight: 800; font-size: 12px; font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer; letter-spacing: 0.03em; margin-top: 7px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: background 0.18s, transform 0.15s;
  }
  .sp-test-btn:hover:not(:disabled) { background: rgba(124,58,237,0.32); transform: translateY(-1px); }
  .sp-test-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .sp-ghost-btn {
    padding: 6px 13px; background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.82); border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px; font-weight: 800; font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer;
    transition: background 0.14s; display: flex; align-items: center; gap: 5px;
  }
  .sp-ghost-btn:hover { background: rgba(255,255,255,0.17); }
  .sp-ghost-btn:disabled { opacity: 0.42; cursor: not-allowed; }

  .sp-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    max-height: 230px; overflow-y: auto; background: #780023;
    border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;
    z-index: 50; box-shadow: 0 16px 40px rgba(0,0,0,0.45);
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.22) transparent;
  }
  .sp-dropdown-item {
    padding: 9px 13px; cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.08); transition: background 0.12s;
  }
  .sp-dropdown-item:hover { background: rgba(255,255,255,0.12); }
  .sp-dropdown-item:last-child { border-bottom: none; }

  .sp-checkbox {
    display: flex; align-items: center; gap: 7px; cursor: pointer;
    color: rgba(255,255,255,0.70); font-size: 12px; font-weight: 600;
  }
  .sp-checkbox input { accent-color: #fff; width: 13px; height: 13px; }

  .sp-divider { border: none; border-top: 1px solid rgba(255,255,255,0.11); margin: 13px 0; }

  .sp-stat-row { display: flex; gap: 7px; animation: sp-fade 0.35s ease; }
  .sp-stat {
    flex: 1; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.11);
    border-radius: 11px; padding: 9px 6px; text-align: center;
  }
  .sp-stat-val { font-size: 21px; font-weight: 950; color: #fff; line-height: 1; }
  .sp-stat-lbl { font-size: 9px; font-weight: 800; letter-spacing: 0.09em; color: rgba(255,255,255,0.40); margin-top: 3px; text-transform: uppercase; }

  /* Elective modal */
  .sp-elec-card {
    border-radius: 13px; padding: 14px 15px; transition: border-color 0.15s, background 0.15s;
  }
  .sp-elec-field-row { display: grid; grid-template-columns: 1fr 2fr 64px; gap: 7px; margin-top: 10px; }

  /* Graph light mode */
  .graph-light .react-flow__edge-path { stroke: rgba(30,30,60,0.85) !important; }
  .graph-light .react-flow__connection-line { stroke: rgba(30,30,60,0.85) !important; }
  .graph-light .react-flow__controls { background: rgba(255,255,255,0.96) !important; border-color: rgba(0,0,0,0.14) !important; }
  .graph-light .react-flow__controls-button { fill: rgba(0,0,0,0.60) !important; border-bottom-color: rgba(0,0,0,0.08) !important; }
  .graph-light .react-flow__minimap { border-color: rgba(0,0,0,0.12) !important; }

  /* ReactFlow overrides */
  .react-flow__node { box-shadow: none !important; }
  .react-flow__controls { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 10px !important; }
  .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; fill: rgba(255,255,255,0.70) !important; }
  .react-flow__controls-button:hover { background: rgba(255,255,255,0.09) !important; }
  .react-flow__minimap { border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 10px !important; }
  .react-flow__edge-path { stroke: rgba(255,255,255,0.55) !important; stroke-width: 2 !important; }
  .react-flow__edge.animated path { stroke-dasharray: 5 5; }
  .react-flow__connection-line { stroke: rgba(255,255,255,0.88) !important; stroke-width: 2 !important; }
  .react-flow__handle { transition: opacity 0.15s; }
  /* Ensure edges render above semester blocks (z=0) but below course cards (z=10) */
  .react-flow__edges { z-index: 5 !important; }
  .react-flow__edge { z-index: 5 !important; }
`;
