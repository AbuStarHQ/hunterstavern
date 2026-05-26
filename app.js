const $ = (id) => document.getElementById(id);

const TLD_OPTIONS = [
  '.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.dev', '.xyz', '.site',
  '.online', '.store', '.tech', '.studio', '.agency', '.media', '.digital', '.cloud',
  '.game', '.games', '.fun', '.world', '.today', '.live', '.space', '.club', '.me', '.us', '.uk', '.nl'
];

let selectedTlds = ['.com'];
let selectedWordList = 'common';
let generationSource = 'random';
let wordLists = [];
let running = false;
let offset = 0;
let checked = 0;
let availableCount = 0;
let randomSeed = Date.now() % 1000000000;

const STORAGE_KEY = 'prefixSuffixDomainGenerator.v29.state';

// domain -> { domain, word, mode, fixedPart, status, note, bucket }
const domains = new Map();

window.addEventListener('error', (event) => {
  const status = $('status');
  if (status) status.textContent = `App error: ${event.message}. Please press Clear, then Start again.`;
  running = false;
  const start = $('start');
  if (start) start.disabled = false;
});

window.addEventListener('unhandledrejection', (event) => {
  const status = $('status');
  const message = event.reason?.message || String(event.reason || 'Unknown error');
  if (status) status.textContent = `App error: ${message}. Please press Clear, then Start again.`;
  running = false;
  const start = $('start');
  if (start) start.disabled = false;
});

function normalizeTld(value) {
  const clean = String(value || '').trim().toLowerCase().replace(/^\.+/, '').replace(/[^a-z0-9-]/g, '');
  return clean ? `.${clean}` : '';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function cleanWordPattern(value) {
  // Optional pattern for the generated word only. Letters are fixed; ? or _ means any letter.
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z?_]/g, '')
    .replace(/_/g, '?');
}

function updatePatternHelp() {
  const fixedPart = $('prefix')?.value || '';
  const maxLength = Number($('maxLength')?.value || 63);
  const slots = Math.max(0, maxLength - fixedPart.length);
  const mode = getMode();
  const source = getGenerationSource();
  const exampleFixed = fixedPart || (mode === 'suffix' ? 'hub' : 'play');
  const slotsText = slots === 1 ? '1 generated-letter slot' : `${slots.toLocaleString()} generated-letter slots`;
  if ($('patternHelp')) {
    $('patternHelp').textContent = source === 'random'
      ? `Random spelling uses no word list. With ${mode === 'suffix' ? 'suffix' : 'prefix'} "${exampleFixed}" and max length ${maxLength}, the app randomly fills exactly ${slotsText}. Leave the pattern empty for any letters, or use exactly ${slots} pattern characters, for example ??y or ?o?.`
      : `Optional. The pattern applies to the generated word only. With ${mode === 'suffix' ? 'suffix' : 'prefix'} "${exampleFixed}" and max length ${maxLength}, there are up to ${slotsText}. Example: ??y means a 3-letter generated word ending in y; ?o? means a 3-letter generated word with o in the middle.`;
  }
}

function renderTldPicker() {
  $('selectedTlds').innerHTML = '';

  if (!selectedTlds.length) {
    const empty = document.createElement('span');
    empty.className = 'emptyTag';
    empty.textContent = 'No TLD selected';
    $('selectedTlds').appendChild(empty);
  }

  for (const tld of selectedTlds) {
    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = 'tag';
    tag.innerHTML = `<span>${tld}</span><strong aria-hidden="true">×</strong>`;
    tag.title = `Remove ${tld}`;
    tag.addEventListener('click', () => {
      selectedTlds = selectedTlds.filter(item => item !== tld);
      resetScan(`Removed ${tld}. Ready to scan from the beginning with the new TLD selection.`);
      renderTldPicker();
      saveState();
    });
    $('selectedTlds').appendChild(tag);
  }

  $('tldOptions').innerHTML = '';
  for (const tld of TLD_OPTIONS) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'tldOption';
    option.textContent = tld;
    option.disabled = selectedTlds.includes(tld);
    option.addEventListener('click', () => addTld(tld));
    $('tldOptions').appendChild(option);
  }
}


function renderWordListPicker() {
  const box = $('wordListOptions');
  if (!box) return;
  box.innerHTML = '';

  for (const list of wordLists) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `wordListOption${list.key === selectedWordList ? ' selected' : ''}`;
    button.innerHTML = `<strong>${escapeHtml(list.label)}</strong><span>${Number(list.count || 0).toLocaleString()} items</span>`;
    button.title = list.description || list.label;
    button.addEventListener('click', () => {
      if (selectedWordList === list.key) return;
      selectedWordList = list.key;
      resetScan(`Switched to ${list.label}. Ready to scan from the beginning of this word list.`);
      renderWordListPicker();
      saveState();
    });
    box.appendChild(button);
  }
}

function currentWordListLabel() {
  return wordLists.find(list => list.key === selectedWordList)?.label || 'Common English words';
}

function getGenerationSource() {
  return document.querySelector('input[name="generationSource"]:checked')?.value === 'random' ? 'random' : 'wordList';
}

function currentSourceLabel() {
  return getGenerationSource() === 'random' ? 'Random spelling' : currentWordListLabel();
}


function summarizeCandidateInfo(data) {
  const summary = data?.wordCandidateSummary;
  if (!summary) return '';
  const matched = Number(summary.matchingDomains || 0).toLocaleString();
  const words = Number(summary.matchingWords || 0).toLocaleString();
  const total = Number(summary.selectedWords || 0).toLocaleString();
  const skippedLength = Number(summary.skippedLength || 0).toLocaleString();
  const skippedPattern = Number(summary.skippedPattern || 0).toLocaleString();
  return ` This selected list has ${words} matching words (${matched} domains with your selected TLDs) out of ${total} list items. Skipped by max length: ${skippedLength}; skipped by pattern: ${skippedPattern}.`;
}

function updateGenerationSourceUi() {
  generationSource = getGenerationSource();
  updatePatternHelp();
}

function getRandomSlots() {
  const fixedPart = $('prefix')?.value || '';
  const maxLength = Number($('maxLength')?.value || 63);
  return Math.max(0, maxLength - fixedPart.length);
}


function getMode() {
  return document.querySelector('input[name="mode"]:checked')?.value === 'suffix' ? 'suffix' : 'prefix';
}

function updateModeText() {
  const mode = getMode();
  $('fixedPartLabel').textContent = mode === 'suffix' ? 'Strict suffix' : 'Strict prefix';
  $('prefix').placeholder = mode === 'suffix' ? 'e.g. hub' : 'e.g. play';
  $('status').textContent = mode === 'suffix'
    ? 'Ready. Suffix mode creates generated word + suffix, for example candyhub.com.'
    : 'Ready. Prefix mode creates prefix + generated word, for example glowcandy.com.';
  updatePatternHelp();
}

function addTld(value) {
  const tld = normalizeTld(value);
  if (!tld) return;
  if (!selectedTlds.includes(tld)) {
    selectedTlds.push(tld);
    resetScan(`Added ${tld}. Ready to scan from the beginning with the new TLD selection.`);
  }
  $('customTld').value = '';
  renderTldPicker();
  saveState();
}

async function loadMeta() {
  const res = await fetch('/api/words/meta');
  const data = await res.json();
  wordLists = Array.isArray(data.lists) ? data.lists : [];
  $('dictCount').textContent = data.count.toLocaleString();
  renderWordListPicker();
}

function getCurrentSignature() {
  return JSON.stringify({
    fixedPart: $('prefix')?.value || '',
    mode: getMode(),
    maxLength: Number($('maxLength')?.value || 63),
    wordPattern: cleanWordPattern($('wordPattern')?.value || ''),
    generationSource: getGenerationSource(),
    tlds: [...selectedTlds].sort(),
    wordList: selectedWordList,
    speedMode: $('speedMode')?.value || 'fast',
    randomSeed
  });
}

function saveState() {
  try {
    const state = {
      version: 29,
      savedAt: Date.now(),
      selectedTlds,
      selectedWordList,
      mode: getMode(),
      fixedPart: $('prefix')?.value || '',
      maxLength: Number($('maxLength')?.value || 63),
      wordPattern: cleanWordPattern($('wordPattern')?.value || ''),
      generationSource: getGenerationSource(),
      batchSize: Number($('batchSize')?.value || 100),
      speedMode: $('speedMode')?.value || 'fast',
      onlyAvailable: Boolean($('onlyAvailable')?.checked),
      offset,
      checked,
      availableCount,
      signature: getCurrentSignature(),
      randomSeed,
      domains: [...domains.values()]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Could not save scan state:', error);
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear scan state:', error);
  }
}

function restoreSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    if (!state || ![26].includes(state.version)) return false;

    selectedTlds = Array.isArray(state.selectedTlds) && state.selectedTlds.length ? state.selectedTlds : selectedTlds;
    selectedWordList = state.selectedWordList || selectedWordList;
    generationSource = state.generationSource === 'random' ? 'random' : 'wordList';
    const sourceInput = document.querySelector(`input[name="generationSource"][value="${generationSource}"]`);
    if (sourceInput) sourceInput.checked = true;

    const modeInput = document.querySelector(`input[name="mode"][value="${state.mode === 'suffix' ? 'suffix' : 'prefix'}"]`);
    if (modeInput) modeInput.checked = true;
    if ($('prefix')) $('prefix').value = state.fixedPart || '';
    if ($('maxLength')) $('maxLength').value = Number(state.maxLength || 63);
    if ($('wordPattern')) $('wordPattern').value = cleanWordPattern(state.wordPattern || '');
    if ($('batchSize')) $('batchSize').value = Number(state.batchSize || 100);
    if ($('speedMode')) $('speedMode').value = state.speedMode || 'fast';
    randomSeed = Number(state.randomSeed || randomSeed);
    if ($('onlyAvailable')) $('onlyAvailable').checked = state.onlyAvailable !== false;

    offset = Number(state.offset || 0);
    checked = Number(state.checked || 0);
    availableCount = Number(state.availableCount || 0);
    domains.clear();
    for (const item of Array.isArray(state.domains) ? state.domains : []) {
      if (!item?.domain) continue;
      domains.set(item.domain, { ...item, bucket: item.bucket || 'undecided' });
    }

    running = false;
    if ($('status')) {
      $('status').textContent = `Restored saved scan: ${checked.toLocaleString()} checked, ${availableCount.toLocaleString()} available, dictionary position ${offset.toLocaleString()}. Press Start to continue from here, or Clear to start over.`;
    }
    return true;
  } catch (error) {
    console.warn('Could not restore scan state:', error);
    return false;
  }
}

function resetScan(message, options = {}) {
  running = false;
  offset = 0;
  checked = 0;
  availableCount = 0;
  domains.clear();
  randomSeed = Date.now() % 1000000000;
  if (message) $('status').textContent = message;
  renderBoard();
  $('start').disabled = false;
  if (options.clearSaved !== false) clearSavedState();
}

function updateStats() {
  const items = [...domains.values()];
  $('generated').textContent = checked.toLocaleString();
  const confirmedAvailableCount = items.filter(item => item.status === 'available').length;
  availableCount = confirmedAvailableCount;
  $('available').textContent = confirmedAvailableCount.toLocaleString();
  if ($('unknown')) $('unknown').textContent = items.filter(item => item.status === 'unknown').length.toLocaleString();
  $('cursor').textContent = offset.toLocaleString();
  $('rejectedCount').textContent = items.filter(item => item.bucket === 'rejected').length.toLocaleString();
  $('undecidedCount').textContent = items.filter(item => item.bucket === 'undecided').length.toLocaleString();
  $('favoriteCount').textContent = items.filter(item => item.bucket === 'favorite').length.toLocaleString();
}

const bucketLists = {
  rejected: 'rejectedList',
  undecided: 'undecidedList',
  favorite: 'favoriteList'
};

function removeEmptyMessage(list) {
  list.querySelector('.emptyList')?.remove();
}

function refreshEmptyMessage(list, bucket) {
  const hasCards = Boolean(list.querySelector('.card'));
  const existing = list.querySelector('.emptyList');

  if (hasCards && existing) {
    existing.remove();
    return;
  }

  if (!hasCards && !existing) {
    const empty = document.createElement('p');
    empty.className = 'emptyList';
    empty.textContent = bucket === 'undecided'
      ? 'Checked domains will appear here.'
      : 'Nothing here yet.';
    list.appendChild(empty);
  }
}

function updateCardButtonStates(card, bucket) {
  card.querySelector('.rejectBtn').disabled = bucket === 'rejected';
  card.querySelector('.undoBtn').disabled = bucket === 'undecided';
  card.querySelector('.favBtn').disabled = bucket === 'favorite';
}

function moveDomain(domain, bucket) {
  const item = domains.get(domain);
  if (!item || item.bucket === bucket) return;

  const oldBucket = item.bucket;
  item.bucket = bucket;

  // Move the existing card immediately instead of rebuilding the whole board.
  // This keeps reject/favourite clicks responsive while background checks continue.
  const selector = `[data-domain="${CSS.escape(domain)}"]`;
  const card = document.querySelector(selector);
  const targetList = $(bucketLists[bucket]);

  if (card && targetList) {
    removeEmptyMessage(targetList);
    updateCardButtonStates(card, bucket);
    targetList.appendChild(card);
    refreshEmptyMessage($(bucketLists[oldBucket]), oldBucket);
    refreshEmptyMessage(targetList, bucket);
    updateStats();
    saveState();
  } else {
    renderBoard();
    saveState();
  }
}


function displayStatus(item) {
  if (!item) return 'unknown';
  if (item.status === 'available') return 'confirmed available';
  if (item.status === 'taken') return 'taken';
  if (item.status === 'unknown') return 'unknown';
  return String(item.status || 'unknown');
}

function createDomainCard(item) {
  const div = document.createElement('article');
  div.className = `card ${item.status}`;
  div.dataset.domain = item.domain;
  div.innerHTML = `
    <div class="domain">${escapeHtml(item.domain)}</div>
    <div class="meta">${item.mode === 'suffix' ? 'suffix' : 'prefix'}: ${escapeHtml(item.fixedPart || '')} · word: ${escapeHtml(item.word)} · ${escapeHtml(displayStatus(item))}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</div>
    <div class="cardActions">
      <button type="button" class="rejectBtn" title="Reject this domain">✕</button>
      <button type="button" class="undoBtn" title="Move back to middle">Middle</button>
      <button type="button" class="favBtn" title="Favourite this domain">★</button>
    </div>
  `;

  div.querySelector('.rejectBtn').addEventListener('click', () => moveDomain(item.domain, 'rejected'));
  div.querySelector('.undoBtn').addEventListener('click', () => moveDomain(item.domain, 'undecided'));
  div.querySelector('.favBtn').addEventListener('click', () => moveDomain(item.domain, 'favorite'));

  updateCardButtonStates(div, item.bucket);

  return div;
}

function shouldShowItem(item) {
  // Important: we store every checked result locally. This checkbox is only a view filter.
  // That means you can scan with "Show available only" on, then turn it off later and
  // immediately see the taken/unknown domains that were already checked.
  if (!$('onlyAvailable').checked) return true;
  return item.status === 'available';
}

function renderList(id, bucket) {
  const list = $(id);
  const bucketItems = [...domains.values()].filter(item => item.bucket === bucket);
  const items = bucketItems.filter(shouldShowItem);
  list.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'emptyList';
    if (bucket === 'undecided' && bucketItems.length && $('onlyAvailable').checked) {
      empty.textContent = 'No confirmed available domains visible yet. Turn off “Show available only” to see taken/unknown domains already checked.';
    } else {
      empty.textContent = bucket === 'undecided'
        ? 'Checked domains will appear here.'
        : 'Nothing here yet.';
    }
    list.appendChild(empty);
    return;
  }

  // Keep the middle list in generation order: already-generated words stay above
  // newer batches, so you can keep reviewing downward without old items moving away.
  const ordered = bucket === 'undecided'
    ? items
    : items.sort((a, b) => a.domain.localeCompare(b.domain));

  for (const item of ordered) list.appendChild(createDomainCard(item));
}

function renderBoard() {
  renderList('rejectedList', 'rejected');
  renderList('undecidedList', 'undecided');
  renderList('favoriteList', 'favorite');
  updateStats();
}

function addResult(item) {
  if (domains.has(item.domain)) return false;

  const domainItem = { ...item, bucket: 'undecided' };
  domains.set(item.domain, domainItem);
  if (item.status === 'available') availableCount += 1;

  // Append only visible cards. Hidden taken/unknown results are still stored and will
  // appear instantly if the user turns off "Show available only".
  if (shouldShowItem(domainItem)) {
    const list = $('undecidedList');
    removeEmptyMessage(list);
    list.appendChild(createDomainCard(domainItem));
  } else {
    renderList('undecidedList', 'undecided');
  }
  return true;
}



async function scanLoop() {
  if (!selectedTlds.length) {
    $('status').textContent = 'Choose at least one TLD first.';
    return;
  }

  running = true;
  $('start').disabled = true;
  const mode = document.querySelector('input[name="mode"]:checked')?.value === 'suffix' ? 'suffix' : 'prefix';
  const fixedPart = $('prefix').value;
  const source = getGenerationSource();
  const listLabel = currentSourceLabel();
  const activePattern = cleanWordPattern($('wordPattern').value);
  const patternText = activePattern ? ` with generated-word pattern ${activePattern}` : '';
  $('status').textContent = mode === 'suffix'
    ? `Starting scan: one generated item + suffix${patternText}. First batch is being checked now...`
    : `Starting scan: prefix + one generated item${patternText}. First batch is being checked now...`;
  updateStats();
  if (source === 'random' && activePattern && activePattern.length !== getRandomSlots()) {
    $('status').textContent = `Random spelling pattern must be exactly ${getRandomSlots()} characters for this max length and fixed part.`;
    running = false;
    $('start').disabled = false;
    return;
  }

  while (running) {
    const body = {
      prefix: fixedPart, // backward compatibility
      fixedPart,
      mode,
      tlds: selectedTlds,
      maxLength: Number($('maxLength').value),
      wordPattern: cleanWordPattern($('wordPattern').value),
      generationSource: getGenerationSource(),
      batchSize: Number($('batchSize').value),
      speedMode: $('speedMode')?.value || 'fast',
      randomSeed,
      onlyAvailable: false,
      wordList: selectedWordList,
      offset
    };

    $('status').textContent = `${source === 'random' ? 'Random scan' : 'Word-list scan'}: checking next batch from position ${offset.toLocaleString()}...`;

    let res;
    try {
      res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (error) {
      $('status').textContent = `Browser could not reach the local server: ${error.message}. Make sure npm start is still running.`;
      running = false;
      break;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed.' }));
      $('status').textContent = err.error || 'Request failed.';
      break;
    }

    let data;
    try {
      data = await res.json();
      offset = Number(data.nextOffset || offset);
      checked += Number(data.checked || 0);

      for (const item of Array.isArray(data.results) ? data.results : []) addResult(item);
      updateStats();
      saveState();
    } catch (error) {
      $('status').textContent = `The scan stopped because the results could not be shown: ${error.message}.`;
      running = false;
      break;
    }

    if (Number(data.checked || 0) === 0 && !data.finished) {
      $('status').textContent = `Still looking: scanned list/random position ${offset.toLocaleString()}, but no candidates matched your current max length or pattern yet.${summarizeCandidateInfo(data)}`;
      await new Promise(resolve => setTimeout(resolve, 50));
      continue;
    }

    if (data.finished) {
      const scannedType = mode === 'suffix' ? 'word + suffix' : 'prefix + word';
      const patternPart = activePattern ? ` and generated-word pattern ${activePattern}` : '';
      $('status').textContent = `Finished ${currentSourceLabel()}. Looked through ${data.totalWords.toLocaleString()} list items and checked ${checked.toLocaleString()} ${scannedType} domains that matched your max length${patternPart}.${summarizeCandidateInfo(data)} Results are saved, so refresh will not change or restart this scan.`;
      running = false;
      saveState();
      break;
    }

    const undecidedAll = [...domains.values()].filter(item => item.bucket === 'undecided').length;
    const undecidedVisible = [...domains.values()].filter(item => item.bucket === 'undecided' && shouldShowItem(item)).length;
    if ($('onlyAvailable').checked && undecidedVisible === 0 && undecidedAll > 0) {
      $('status').textContent = `${source === 'random' ? 'Random scanning' : 'Scanning'} in ${data.speedLabel || 'Fast'} mode... checked ${checked.toLocaleString()}, found 0 confirmed available so far. Turn off “Show available only” to see ${undecidedAll.toLocaleString()} taken/unknown domains already checked.`;
    } else {
      $('status').textContent = `${source === 'random' ? 'Random scanning' : 'Scanning'} in ${data.speedLabel || 'Fast'} mode... checked ${checked.toLocaleString()}, found ${availableCount.toLocaleString()} confirmed available, ${undecidedVisible.toLocaleString()} visible in the middle.${summarizeCandidateInfo(data)}`;
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  $('start').disabled = false;
}

function copyBucket(bucket) {
  const list = [...domains.values()]
    .filter(item => item.bucket === bucket)
    .map(item => item.domain)
    .sort((a, b) => a.localeCompare(b));
  navigator.clipboard.writeText(list.join('\n'));
  $('status').textContent = `Copied ${list.length.toLocaleString()} ${bucket === 'favorite' ? 'favourite' : 'middle'} domains.`;
}

$('start').addEventListener('click', () => {
  if (!running) scanLoop();
});

$('stop').addEventListener('click', () => {
  running = false;
  $('status').textContent = 'Stopped. Progress saved; press Start to continue.';
  saveState();
});

$('clear').addEventListener('click', () => {
  resetScan(`Cleared. Ready to scan from the beginning of ${currentSourceLabel()}.`);
});

document.querySelectorAll('input[name="mode"]').forEach(input => {
  input.addEventListener('change', () => {
    resetScan('Mode changed. Ready to scan from the beginning.');
    updateModeText();
    saveState();
  });
});

document.querySelectorAll('input[name="generationSource"]').forEach(input => {
  input.addEventListener('change', () => {
    generationSource = getGenerationSource();
    resetScan(generationSource === 'random'
      ? 'Switched to random spelling. This uses no word list and randomly fills the remaining letters.'
      : `Switched to ${currentWordListLabel()}. Ready to scan from the word list.`);
    updateGenerationSourceUi();
    saveState();
  });
});

$('copyFavorites').addEventListener('click', () => copyBucket('favorite'));
$('copyUndecided').addEventListener('click', () => copyBucket('undecided'));

$('addCustomTld').addEventListener('click', () => addTld($('customTld').value));
$('customTld').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addTld($('customTld').value);
  }
});


function refreshVisibilityStatus() {
  renderBoard();
  const totalStored = domains.size;
  const visible = [...domains.values()].filter(shouldShowItem).length;
  if ($('onlyAvailable').checked) {
    $('status').textContent = `Showing confirmed available domains only: ${visible.toLocaleString()} visible from ${totalStored.toLocaleString()} checked results.`;
  } else {
    $('status').textContent = `Showing all checked domains: ${visible.toLocaleString()} visible, including available, taken, and unknown.`;
  }
  saveState();
}

$('onlyAvailable').addEventListener('change', refreshVisibilityStatus);

const restoredState = restoreSavedState();
renderTldPicker();
updateGenerationSourceUi();
renderBoard();
updatePatternHelp();
if (!restoredState) updateModeText();

function settingChanged(message = 'Settings changed. Ready to scan from the beginning.') {
  if ($('wordPattern')) $('wordPattern').value = cleanWordPattern($('wordPattern').value);
  updatePatternHelp();
  resetScan(message);
  saveState();
}

['prefix', 'maxLength', 'wordPattern'].forEach(id => {
  $(id).addEventListener('change', () => settingChanged());
});

['prefix', 'maxLength'].forEach(id => {
  $(id).addEventListener('input', updatePatternHelp);
});

$('batchSize').addEventListener('change', () => {
  const value = Math.max(1, Math.min(2000, Number($('batchSize').value || 20)));
  $('batchSize').value = value;
  saveState();
});
$('speedMode').addEventListener('change', saveState);

loadMeta().catch(() => {
  $('dictCount').textContent = 'Install first';
  $('status').textContent = 'Run npm install, then npm start.';
});
