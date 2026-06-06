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

  // ---------- Game State (Persisted) ----------
  let filter = localStorage.getItem('pw_filter') || 'All';
  let exp = parseInt(localStorage.getItem('pw_exp')) || 0;
  let solved = parseInt(localStorage.getItem('pw_solved')) || 0;
  let streak = parseInt(localStorage.getItem('pw_streak')) || 0;
  let best = parseInt(localStorage.getItem('pw_best')) || 0;
  
  // Starting with 5 lives
  let lives = 5;

  let pattern = newPatternFiltered(filter);
  let currentOptions = generateOptions(pattern);
  let lastGain = 0;
  let revealed = false;
  let hintUsed = false;
  let flashTimeout = null;
  let isDailyMode = false;

  function saveState() {
    localStorage.setItem('pw_filter', filter);
    localStorage.setItem('pw_exp', exp);
    localStorage.setItem('pw_solved', solved);
    localStorage.setItem('pw_streak', streak);
    localStorage.setItem('pw_best', best);
  }

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
  const dailyBtn = $('daily-btn');

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
    if (isDailyMode) {
      accentBar.style.background = 'linear-gradient(to right, #fbbf24, #f59e0b)';
      diffChip.innerHTML = '📅 Daily Challenge';
      diffChip.style.background = 'rgba(245, 158, 11, 0.15)';
      diffChip.style.color = '#b45309';
      diffChip.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
      accentBar.style.background = '';
      accentBar.setAttribute('data-diff', pattern.difficulty);
      diffChip.style.background = '';
      diffChip.style.color = '';
      diffChip.style.borderColor = '';
      diffChip.setAttribute('data-diff', pattern.difficulty);
      diffChip.innerHTML = `${DIFF_ICONS[pattern.difficulty]} ${pattern.difficulty}`;
    }

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
          if (!isDailyMode) el.setAttribute('data-diff', pattern.difficulty);
          else el.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
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
    if (isDailyMode) {
      // If we just finished daily mode, revert to normal
      isDailyMode = false;
      // Reset filter chips visually
      filterBar.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('filter-chip--active', chip.getAttribute('data-filter') === filter);
      });
    }

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
      lives = 5;
      lastGain = 0;
      saveState();
      modalOverlay.style.display = 'none';
    }

    render();
  }

  function loadDaily() {
    const today = new Date().toDateString();
    if (localStorage.getItem('pw_daily_last') === today) {
      showToast('info', 'Already Done', 'You have already completed today’s Daily Challenge!');
      return;
    }

    isDailyMode = true;
    // Generate a random Hard pattern for the daily challenge
    pattern = newPatternFiltered('Hard');
    currentOptions = generateOptions(pattern);
    revealed = false;
    hintUsed = false;
    lastAnswerCorrect = false;
    selectedOption = null;

    // Visually activate daily button
    filterBar.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('filter-chip--active'));
    dailyBtn.classList.add('filter-chip--active');

    render();
  }

  function submit(val) {
    if (revealed) return;
    selectedOption = val;

    if (checkAnswer(pattern, val)) {
      // Correct
      lastAnswerCorrect = true;
      streak++;
      best = Math.max(best, streak);

      if (isDailyMode) {
        localStorage.setItem('pw_daily_last', new Date().toDateString());
        showToast('success', 'Daily Solved!', 'Streak increased! (+1)');
        flashCard('good');
      } else {
        const base = DIFF_XP[pattern.difficulty];
        const bonus = Math.floor(streak / 3) * 5;
        const gained = base + bonus;
        exp += gained;
        solved++;
        lastGain = gained;
        spinXpCoin(gained);
        showToast('success', 'Correct!', `${pattern.difficulty} · ${pattern.name}`);
        flashCard('good');
      }

      saveState();
      revealed = true;
      render();
      setTimeout(() => nextRound(), 1200);
    } else {
      // Wrong
      lastAnswerCorrect = false;
      streak = 0;
      saveState();

      if (isDailyMode) {
        // Failing daily challenge locks you out for the day
        localStorage.setItem('pw_daily_last', new Date().toDateString());
        showToast('error', 'Daily Failed', `Answer was ${pattern.answer} — Streak reset.`);
      } else {
        lives--;
        showToast('error', 'Not quite', `Answer was ${pattern.answer} — ${pattern.name}`);
      }

      flashCard('bad');
      shakeCard();
      revealed = true;
      render();

      if (lives <= 0) {
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
    saveState();
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
    isDailyMode = false;
    filter = f;
    saveState();

    // Update active chip
    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      if(chip.id !== 'daily-btn') {
        chip.classList.toggle('filter-chip--active', chip.getAttribute('data-filter') === f);
      } else {
        chip.classList.remove('filter-chip--active');
      }
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
  filterBar.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      setFilter(chip.getAttribute('data-filter'));
    });
  });

  // Daily Challenge
  if (dailyBtn) {
    dailyBtn.addEventListener('click', loadDaily);
  }

  // ---------- Init ----------
  render();

})();
