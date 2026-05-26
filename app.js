<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Domain Name Generator</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="page-shell">
    <header class="hero">
      <p class="eyebrow">Domain search tool</p>
      <div class="hero-row">
        <div>
          <h1>Generate clean domain ideas.</h1>
          <p class="intro">Pick a prefix or suffix, choose a source list or random spelling, then scan selected TLDs and sort your results.</p>
        </div>
        <div class="hero-card">
          <span id="dictCount">—</span>
          <small>words loaded</small>
        </div>
      </div>
    </header>

    <section class="panel controls" aria-label="Generator settings">
      <div class="field-card span-2">
        <span class="field-title">Generation mode</span>
        <div class="segmented">
          <label><input type="radio" name="mode" value="prefix" checked /> Prefix + word</label>
          <label><input type="radio" name="mode" value="suffix" /> Word + suffix</label>
        </div>
      </div>

      <label class="field-card">
        <span id="fixedPartLabel" class="field-title">Strict prefix</span>
        <input id="prefix" autocomplete="off" placeholder="e.g. play" />
      </label>

      <label class="field-card">
        <span class="field-title">Max name length</span>
        <input id="maxLength" type="number" min="1" max="63" value="18" />
      </label>

      <label class="field-card">
        <span class="field-title">API batch size</span>
        <input id="batchSize" type="number" min="1" max="2000" value="20" />
      </label>

      <label class="field-card">
        <span class="field-title">Check speed</span>
        <select id="speedMode">
          <option value="safe">Safe / fewer unknowns</option>
          <option value="fast" selected>Fast / recommended</option>
          <option value="turbo">Turbo / fastest</option>
        </select>
      </label>

      <div class="field-card span-3">
        <div class="label-row">
          <span class="field-title">Generated part source</span>
          <small>Choose words or random spelling</small>
        </div>
        <div class="segmented compact">
          <label><input type="radio" name="generationSource" value="wordList" /> Word list</label>
          <label><input type="radio" name="generationSource" value="random" checked /> Random spelling</label>
        </div>
      </div>

      <div class="field-card span-3 patternBox">
        <div class="label-row">
          <span class="field-title">Letter pattern</span>
          <small>Optional: use ? for any letter</small>
        </div>
        <input id="wordPattern" autocomplete="off" placeholder="Example: ??y or ?o?" />
        <p id="patternHelp" class="help-text">Leave empty for any word.</p>
      </div>

      <div class="field-card span-3 wordListPicker">
        <div class="label-row">
          <span class="field-title">Word list</span>
          <small>Choose exactly one</small>
        </div>
        <div id="wordListOptions" class="wordListOptions">
          <span class="emptyTag">Loading word lists...</span>
        </div>
      </div>

      <div class="field-card span-3 tldPicker">
        <div class="label-row">
          <span class="field-title">Selected TLDs</span>
          <small>Click a tag to remove it</small>
        </div>
        <div id="selectedTlds" class="selectedTlds"></div>

        <div class="label-row add-tld-label">
          <span class="field-title">Add TLD</span>
          <small>Popular extensions</small>
        </div>
        <div id="tldOptions" class="tldOptions"></div>

        <div class="customTld">
          <input id="customTld" placeholder="Custom TLD, e.g. .app" autocomplete="off" />
          <button id="addCustomTld" type="button" class="secondary">Add</button>
        </div>
      </div>

      <label class="check span-3">
        <input id="onlyAvailable" type="checkbox" checked />
        Show available only
      </label>

      <div class="buttons span-3">
        <button id="start">Start scan</button>
        <button id="stop" class="secondary">Stop</button>
        <button id="clear" class="ghost">Clear</button>
      </div>
    </section>

    <section class="stats" aria-label="Scan statistics">
      <div><strong id="generated">0</strong><span>checked</span></div>
      <div><strong id="available">0</strong><span>available</span></div>
      <div><strong id="unknown">0</strong><span>unknown</span></div>
      <div><strong id="cursor">0</strong><span>cursor</span></div>
    </section>

    <section class="panel results-panel">
      <div class="resultsHead">
        <div>
          <h2>Sorting board</h2>
          <p id="status">Ready. Choose your settings and start scanning.</p>
        </div>
        <div class="copyButtons">
          <button id="copyFavorites" class="secondary">Copy favourites</button>
          <button id="copyUndecided" class="secondary">Copy middle</button>
        </div>
      </div>

      <div class="board">
        <section class="column rejectedCol">
          <div class="columnHead"><h3>Rejected</h3><span id="rejectedCount">0</span></div>
          <div id="rejectedList" class="results dropList"></div>
        </section>

        <section class="column undecidedCol">
          <div class="columnHead"><h3>Checked / undecided</h3><span id="undecidedCount">0</span></div>
          <div id="undecidedList" class="results dropList"></div>
        </section>

        <section class="column favouriteCol">
          <div class="columnHead"><h3>Favourites</h3><span id="favoriteCount">0</span></div>
          <div id="favoriteList" class="results dropList"></div>
        </section>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
</body>
</html>
