:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --paper: #efe2bc;
  --paper-soft: rgba(239, 226, 188, 0.82);
  --ink: #f7f0db;
  --muted: #d7c8aa;
  --muted-2: #bba98e;
  --panel: rgba(46, 29, 20, 0.68);
  --panel-2: rgba(67, 44, 31, 0.62);
  --panel-3: rgba(35, 23, 17, 0.78);
  --line: rgba(232, 210, 169, 0.20);
  --glow: 0 22px 60px rgba(0, 0, 0, 0.36);
  --accent: #e2c37c;
  --accent-2: #8f5f3d;
  --accent-green: #739777;
  --accent-red: #92525a;
}

* { box-sizing: border-box; }
html, body { min-height: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background:
    linear-gradient(rgba(25, 17, 12, 0.45), rgba(18, 12, 9, 0.72)),
    url('saloon-bg.png') center center / cover no-repeat fixed;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 241, 205, 0.04), rgba(19, 12, 10, 0.24));
  pointer-events: none;
}
.wrap {
  position: relative;
  z-index: 1;
  width: min(1360px, calc(100% - 36px));
  margin: 0 auto;
  padding: 36px 0 56px;
}
.eyebrow {
  margin: 0 0 12px;
  color: #f2deb1;
  text-transform: uppercase;
  letter-spacing: .16em;
  font-weight: 800;
  text-shadow: 0 1px 1px rgba(0,0,0,.4);
}
h1 {
  font-size: clamp(38px, 6vw, 72px);
  line-height: .95;
  margin: 0 0 16px;
  letter-spacing: -.05em;
  color: #fff5df;
  text-shadow: 0 3px 18px rgba(0,0,0,.38);
}
.intro {
  max-width: 840px;
  color: var(--paper-soft);
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 0;
  text-shadow: 0 1px 10px rgba(0,0,0,.24);
}

.panel, .stats {
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(52, 34, 24, 0.38), rgba(28, 19, 15, 0.42));
  border-radius: 26px;
  box-shadow: var(--glow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.controls {
  margin-top: 24px;
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
}
label, .tldPicker, .modeBox, .wordListPicker, .patternBox {
  display: grid;
  gap: 8px;
  color: var(--muted);
}
input, select {
  width: 100%;
  border: 1px solid rgba(230, 209, 166, 0.16);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(20, 13, 11, 0.26);
  color: var(--ink);
  font-size: 16px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}
input::placeholder { color: #b9a487; }
input:focus, select:focus { border-color: rgba(226, 195, 124, 0.65); }
.modeBox, .tldPicker, .wordListPicker, .patternBox {
  background: rgba(15, 10, 9, 0.12);
  border: 1px solid rgba(232, 210, 169, 0.12);
  border-radius: 18px;
  padding: 14px 16px;
  align-self: stretch;
}
.modeBox > span, .labelRow span {
  font-weight: 800;
  color: #f6ebcf;
}
.radio {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--paper);
}
.radio input, .check input { width: auto; accent-color: #c79c5a; }
.labelRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
}
.labelRow small, .miniHelp { color: var(--muted-2); }
.pickLabel { margin-top: 8px; }
.tldPicker, .wordListPicker, .patternBox { grid-column: 1 / -1; }
.selectedTlds, .tldOptions { display: flex; flex-wrap: wrap; gap: 10px; }
.tag, .tldOption {
  border: 1px solid rgba(230, 209, 166, 0.18);
  border-radius: 999px;
  padding: 10px 13px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(210, 177, 111, 0.92);
  color: #28170f;
}
.tag strong {
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(40, 23, 15, 0.14);
  font-size: 18px;
  line-height: 1;
}
.tldOption {
  background: rgba(30, 20, 15, 0.38);
  color: var(--paper);
}
.tldOption:hover:not(:disabled), .wordListOption:hover { border-color: rgba(226, 195, 124, 0.68); }
.tldOption:disabled { opacity: .35; cursor: not-allowed; }
.emptyTag { color: var(--muted-2); padding: 10px 0; }
.customTld { display: flex; gap: 10px; margin-top: 4px; }
.customTld input { max-width: 320px; }
.check {
  display: flex;
  gap: 10px;
  align-items: center;
  grid-column: 1 / -1;
  color: var(--paper);
}
.buttons { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 12px; }
button {
  border: 1px solid rgba(223, 197, 145, 0.18);
  border-radius: 15px;
  padding: 13px 18px;
  background: rgba(176, 136, 77, 0.94);
  color: #2a180f;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .15s ease, filter .15s ease, background .15s ease;
}
button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
button:disabled { opacity: .45; cursor: not-allowed; }
.secondary {
  background: rgba(73, 56, 48, 0.86);
  color: var(--ink);
}
.ghost {
  background: rgba(15, 10, 9, 0.03);
  color: #eadfc6;
  border: 1px solid rgba(232, 210, 169, 0.18);
}
.stats {
  margin: 20px 0;
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.stats div {
  background: rgba(21, 14, 11, 0.24);
  border: 1px solid rgba(232, 210, 169, 0.08);
  border-radius: 20px;
  padding: 18px 20px;
}
.stats strong {
  display: block;
  font-size: 32px;
  color: #fff2d0;
}
.stats span { color: var(--muted); }
.panel:not(.controls) { padding: 22px; }
.resultsHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
h2 { margin: 0; font-size: 28px; color: #fff2d0; }
#status { color: var(--paper-soft); margin: 8px 0 0; }
.copyButtons { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.board {
  display: grid;
  grid-template-columns: minmax(220px, .9fr) minmax(360px, 1.3fr) minmax(220px, .9fr);
  gap: 16px;
  margin-top: 22px;
  align-items: start;
}
.column {
  min-height: 420px;
  border: 1px solid rgba(232, 210, 169, 0.14);
  background: rgba(16, 11, 9, 0.14);
  border-radius: 22px;
  padding: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.undecidedCol {
  background: rgba(23, 16, 13, 0.20);
  border-color: rgba(211, 181, 118, 0.28);
}
.rejectedCol { border-color: rgba(187, 111, 122, 0.26); }
.favouriteCol { border-color: rgba(139, 172, 139, 0.24); }
.columnHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
h3 { margin: 0; font-size: 19px; color: #fff0ca; }
.columnHead span {
  min-width: 34px;
  text-align: center;
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(232, 210, 169, 0.12);
  color: var(--ink);
  font-weight: 900;
}
.results { display: grid; grid-template-columns: 1fr; gap: 10px; }
.undecidedCol .results { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.card {
  padding: 14px 16px;
  border: 1px solid rgba(232, 210, 169, 0.12);
  border-radius: 18px;
  background: rgba(36, 25, 19, 0.30);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
}
.domain { font-weight: 900; overflow-wrap: anywhere; color: #fff4d8; }
.meta { margin-top: 6px; font-size: 13px; color: #d3bf9f; overflow-wrap: anywhere; }
.available { border-color: rgba(131, 173, 134, 0.5); }
.taken { opacity: .6; }
.unknown { border-color: rgba(214, 179, 109, 0.45); border-style: dashed; }
.cardActions { display: flex; gap: 8px; margin-top: 12px; }
.cardActions button { flex: 1; padding: 9px 10px; font-size: 13px; border-radius: 11px; }
.rejectBtn {
  background: rgba(121, 63, 71, 0.78);
  color: #ffe1e5;
  border: 1px solid rgba(216, 148, 156, 0.18);
}
.favBtn {
  background: rgba(70, 103, 74, 0.78);
  color: #e0ffe1;
  border: 1px solid rgba(146, 196, 146, 0.18);
}
.undoBtn {
  background: rgba(81, 63, 49, 0.9);
  color: var(--ink);
}
.emptyList { color: var(--muted-2); margin: 6px 0; font-size: 14px; }
.wordListOptions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.wordListOption {
  display: grid;
  gap: 3px;
  text-align: left;
  border: 1px solid rgba(232, 210, 169, 0.16);
  border-radius: 15px;
  padding: 12px 13px;
  background: rgba(28, 19, 15, 0.34);
  color: var(--paper);
  cursor: pointer;
}
.wordListOption strong { font-size: 15px; }
.wordListOption span { color: #c6b08e; font-size: 12px; font-weight: 700; }
.wordListOption.selected {
  background: rgba(209, 178, 112, 0.92);
  color: #28170f;
  border-color: rgba(226, 195, 124, 0.85);
}
.wordListOption.selected span { color: rgba(40, 23, 15, 0.68); }
.miniHelp { margin: 0; font-size: 13px; line-height: 1.45; }

@media (max-width: 1100px) {
  .board { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .controls { grid-template-columns: 1fr; }
  .stats { grid-template-columns: 1fr 1fr; }
  .customTld { flex-direction: column; }
  .customTld input { max-width: none; }
  .resultsHead { flex-direction: column; }
  .copyButtons { justify-content: flex-start; }
}
@media (max-width: 600px) {
  .wrap { width: min(100% - 18px, 100%); padding: 18px 0 28px; }
  h1 { font-size: clamp(32px, 10vw, 52px); }
  .stats { grid-template-columns: 1fr; }
}
