/* ===================================================================
   Pattern Whiz — Game Logic & DOM
   All game state, rendering, animations, toasts, modal
   Mobile-first MCQ version
   =================================================================== */

(function () {
  'use strict';

  const { newPatternFiltered, checkAnswer, generateOptions } = window.PatternEngine;

  // ---------- Difficulty metadata ----------
  const DIFF_ICONS = {
    Easy:   '✦',
    Medium: '⚡',
    Hard:   '🔥',
    GATE:   '🎓',
  };

  const DIFF_XP = { Easy: 10, Medium: 20, Hard: 40, GATE: 80 };
  const LEVEL_STEP = 100;

  // ---------- Game State ----------
  let filter = 'All';
  let pattern = newPatternFiltered('All');
  let currentOptions = generateOptions(pattern);
  let exp = 0;
  let solved = 0;
  let lastGain = 0;
  let streak = 0;
  let best = 0;
  let lives = 3;
  let revealed = false;
  let hintUsed = false;
  let flashTimeout = null;

  // ---------- DOM References ----------
  const $ = (id) => document.getElementById(id);

  const xpValue = $('xp-value');
  const xpDisc = $('xp-disc');
  const xpPopup = $('xp-popup');
  const levelValue = $('level-value');
  const streakValue = $('streak-value');
  const livesDisplay = $('lives-display');
  const progressFill = $('progress-fill');
  const accentBar = $('accent-bar');
  const diffChip = $('diff-chip');
  const solvedLabel = $('solved-label');
  const streakInlineVal = $('streak-inline-val');
  const seriesDisplay = $('series-display');
  const optionsGrid = $('options-grid');
  const hintBtn = $('hint-btn');
  const skipBtn = $('skip-btn');
  const gameCard = $('game-card');
  const footerText = $('footer-text');
  const modalOverlay = $('modal-overlay');
  const modalDesc = $('modal-desc');
  const playAgainBtn = $('play-again-btn');
  const toastContainer = $('toast-container');
  const filterBar = $('filter-bar');

  // ---------- Render ----------

  function render() {
    const level = Math.floor(exp / LEVEL_STEP) + 1;
    const intoLevel = exp % LEVEL_STEP;

    // Scoreboard
    xpValue.textContent = exp;
    levelValue.textContent = level;
    streakValue.textContent = streak;
    progressFill.style.width = `${(intoLevel / LEVEL_STEP) * 100}%`;

    // Lives
    const hearts = livesDisplay.querySelectorAll('.heart');
    hearts.forEach((h, i) => {
      h.classList.toggle('heart--full', i < lives);
      h.classList.toggle('heart--empty', i >= lives);
    });

    // Card header
    accentBar.setAttribute('data-diff', pattern.difficulty);
    diffChip.setAttribute('data-diff', pattern.difficulty);
    diffChip.innerHTML = `${DIFF_ICONS[pattern.difficulty]} ${pattern.difficulty}`;
    solvedLabel.textContent = `Solved ${solved}`;
    streakInlineVal.textContent = streak;

    // Series items
    renderSeries();
    
    // MCQ Options
    renderOptions();

    // Input state
    hintBtn.disabled = hintUsed || revealed;
    hintBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17H8v-2.1A7 7 0 0 1 12 2z"/></svg> ${hintUsed ? 'Hint shown' : 'Hint (resets streak)'}`;
    skipBtn.disabled = revealed;

    // Footer
    footerText.textContent = `Best streak: ${best} · Mix of arithmetic, algebraic, recurrence, prime & alphanumeric series.`;
  }

  function renderSeries() {
    const displaySeries = [...pattern.series, revealed ? pattern.answer : '?'];
    seriesDisplay.innerHTML = '';

    displaySeries.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'series-item';
      el.style.animationDelay = `${i * 0.06}s`;

      const isLast = i === displaySeries.length - 1;

      if (isLast) {
        if (revealed) {
          if (lastAnswerCorrect) {
            el.classList.add('series-item--correct');
          } else {
            el.classList.add('series-item--wrong');
          }
        } else {
          el.classList.add('series-item--question');
          el.setAttribute('data-diff', pattern.difficulty);
        }
      }

      el.textContent = item;
      seriesDisplay.appendChild(el);
    });
  }

  function renderOptions() {
    optionsGrid.innerHTML = '';
    currentOptions.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.disabled = revealed;
      
      if (revealed) {
        if (checkAnswer(pattern, opt)) {
          // This is the correct answer
          btn.classList.add(lastAnswerCorrect && selectedOption === opt ? 'option-btn--correct' : 'option-btn--reveal');
        } else if (selectedOption === opt) {
          // This is the wrong answer the user picked
          btn.classList.add('option-btn--wrong');
        }
      }

      btn.addEventListener('click', () => {
        if (!revealed) submit(opt);
      });
      optionsGrid.appendChild(btn);
    });
  }

  let lastAnswerCorrect = false;
  let selectedOption = null;

  // ---------- Actions ----------

  function nextRound(resetAll = false) {
    pattern = newPatternFiltered(filter, pattern.name);
    currentOptions = generateOptions(pattern);
    revealed = false;
    hintUsed = false;
    lastAnswerCorrect = false;
    selectedOption = null;

    if (resetAll) {
      exp = 0;
      solved = 0;
      streak = 0;
      lives = 3;
      lastGain = 0;
      modalOverlay.style.display = 'none';
    }

    render();
  }

  function submit(val) {
    if (revealed) return;
    selectedOption = val;

    if (checkAnswer(pattern, val)) {
      // Correct
      lastAnswerCorrect = true;
      const newStreak = streak + 1;
      const base = DIFF_XP[pattern.difficulty];
      const bonus = Math.floor(newStreak / 3) * 5;
      const gained = base + bonus;
      exp += gained;
      solved++;
      lastGain = gained;
      streak = newStreak;
      best = Math.max(best, newStreak);

      flashCard('good');
      spinXpCoin(gained);
      showToast('success', 'Correct!', `${pattern.difficulty} · ${pattern.name}`);
      revealed = true;
      render();
      setTimeout(() => nextRound(), 1000);
    } else {
      // Wrong
      lastAnswerCorrect = false;
      streak = 0;
      const remaining = lives - 1;
      lives = remaining;

      flashCard('bad');
      shakeCard();
      showToast('error', 'Not quite', `Answer was ${pattern.answer} — ${pattern.name}`);
      revealed = true;
      render();

      if (remaining <= 0) {
        setTimeout(() => showGameOver(), 800);
      } else {
        setTimeout(() => nextRound(), 1500);
      }
    }
  }

  function useHint() {
    if (hintUsed || revealed) return;
    hintUsed = true;
    streak = 0;
    showToast('info', '💡 Hint', pattern.hint);
    render();
  }

  // ---------- Animations ----------

  function flashCard(type) {
    if (flashTimeout) clearTimeout(flashTimeout);
    gameCard.classList.remove('card--flash-good', 'card--flash-bad');
    gameCard.classList.add(type === 'good' ? 'card--flash-good' : 'card--flash-bad');
    flashTimeout = setTimeout(() => {
      gameCard.classList.remove('card--flash-good', 'card--flash-bad');
    }, 500);
  }

  function shakeCard() {
    gameCard.classList.remove('card--shake');
    // Trigger reflow
    void gameCard.offsetWidth;
    gameCard.classList.add('card--shake');
    setTimeout(() => gameCard.classList.remove('card--shake'), 450);
  }

  function spinXpCoin(gained) {
    xpDisc.classList.remove('spin');
    void xpDisc.offsetWidth;
    xpDisc.classList.add('spin');
    setTimeout(() => xpDisc.classList.remove('spin'), 600);

    // Show popup
    xpPopup.textContent = `+${gained}`;
    xpPopup.classList.remove('show');
    void xpPopup.offsetWidth;
    xpPopup.classList.add('show');
    setTimeout(() => xpPopup.classList.remove('show'), 900);
  }

  // ---------- Toasts ----------

  function showToast(type, title, desc) {
    const icons = { success: '✅', error: '❌', info: '💡' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type]}</span>
      <div class="toast__body">
        <div class="toast__title">${title}</div>
        ${desc ? `<div class="toast__desc">${desc}</div>` : ''}
      </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--leaving');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ---------- Game Over Modal ----------

  function showGameOver() {
    const level = Math.floor(exp / LEVEL_STEP) + 1;
    modalDesc.innerHTML = `Level <strong>${level}</strong> · Solved: <strong>${solved}</strong> · Best streak: <strong>${best}</strong>`;
    modalOverlay.style.display = '';
  }

  // ---------- Filter ----------

  function setFilter(f) {
    filter = f;

    // Update active chip
    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('filter-chip--active', chip.getAttribute('data-filter') === f);
    });

    // Generate new pattern with filter
    pattern = newPatternFiltered(filter, pattern.name);
    currentOptions = generateOptions(pattern);
    revealed = false;
    hintUsed = false;
    lastAnswerCorrect = false;
    selectedOption = null;
    render();
  }

  // ---------- Event Listeners ----------

  // Hint
  hintBtn.addEventListener('click', useHint);

  // Skip
  skipBtn.addEventListener('click', () => {
    if (!revealed) nextRound();
  });

  // Play again
  playAgainBtn.addEventListener('click', () => nextRound(true));

  // Close modal on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) nextRound(true);
  });

  // Filter chips
  filterBar.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      setFilter(chip.getAttribute('data-filter'));
    });
  });

  // ---------- Init ----------
  render();

})();
