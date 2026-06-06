/* ===================================================================
   Pattern Whiz — Pattern Generators
   Port of patterns.ts → vanilla JS
   All ~80 pattern generator functions + registry
   =================================================================== */

/**
 * @typedef {{ series: string[], answer: string, acceptable: string[], name: string, hint: string, difficulty: string }} Pattern
 * @typedef {'Easy' | 'Medium' | 'Hard' | 'GATE'} Difficulty
 * @typedef {Omit<Pattern, 'difficulty'>} RawPattern
 */

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const norm = (s) => s.trim().toLowerCase();

// ---------- Easy ----------

function arithmetic() {
  const start = rand(1, 20);
  const step = rand(2, 9);
  const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
  const answer = String(start + 5 * step);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Arithmetic', hint: 'Each number increases by a fixed amount.' };
}

function geometric() {
  const start = rand(1, 5);
  const ratio = rand(2, 4);
  const arr = Array.from({ length: 4 }, (_, i) => start * ratio ** i);
  const answer = String(start * ratio ** 4);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Geometric', hint: 'Each number is multiplied by a fixed factor.' };
}

function squares() {
  const start = rand(1, 5);
  const arr = Array.from({ length: 5 }, (_, i) => (start + i) ** 2);
  const answer = String((start + 5) ** 2);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Perfect Squares', hint: 'Squares of consecutive integers.' };
}

function fibonacci() {
  const a = rand(1, 4), b = rand(1, 4);
  const arr = [a, b];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  const answer = String(arr[arr.length - 1] + arr[arr.length - 2]);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Fibonacci-like', hint: 'Each term is the sum of the two before it.' };
}

function alphabet() {
  const start = rand(0, 15);
  const step = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + start + i * step));
  const answer = String.fromCharCode(65 + start + 5 * step);
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Alphabet step', hint: 'Letters advance by a fixed step in the alphabet.' };
}

function letterNum() {
  const start = rand(0, 20);
  const arr = Array.from({ length: 4 }, (_, i) => `${String.fromCharCode(65 + start + i)}${i + 1}`);
  const answer = `${String.fromCharCode(65 + start + 4)}5`;
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Letter + Number', hint: 'Letters and numbers both advance by one.' };
}

function emojiCycle() {
  const sets = [['🔴','🔵','🟢'], ['⭐','🌙','☀️'], ['🍎','🍌','🍇','🍊'], ['▲','■','●'], ['🐶','🐱','🐭']];
  const set = sets[rand(0, sets.length - 1)];
  const len = set.length * 2;
  const arr = Array.from({ length: len }, (_, i) => set[i % set.length]);
  const answer = set[len % set.length];
  return { series: arr, answer, acceptable: [answer], name: 'Repeating cycle', hint: 'The sequence repeats a small set in order.' };
}

function primes() {
  const primesAll = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
  const offset = rand(0, 3);
  const arr = primesAll.slice(offset, offset + 5);
  const answer = String(primesAll[offset + 5]);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Prime numbers', hint: 'Consecutive prime numbers.' };
}

function triangular() {
  const start = rand(1, 3);
  const arr = [];
  let cur = (start * (start + 1)) / 2;
  let inc = start + 1;
  for (let i = 0; i < 5; i++) { arr.push(cur); cur += inc; inc++; }
  const answer = String(cur);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Growing differences', hint: 'Gaps between numbers grow by 1 each step.' };
}

function evenNumbers() {
  const start = rand(1, 8) * 2;
  const arr = Array.from({ length: 5 }, (_, i) => start + i * 2);
  const ans = start + 10;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Even numbers', hint: 'Consecutive even numbers.' };
}

function oddNumbers() {
  const start = rand(1, 8) * 2 + 1;
  const arr = Array.from({ length: 5 }, (_, i) => start + i * 2);
  const ans = start + 10;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Odd numbers', hint: 'Consecutive odd numbers.' };
}

function multiplesOfK() {
  const k = rand(3, 9);
  const arr = Array.from({ length: 5 }, (_, i) => k * (i + 1));
  const ans = k * 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Multiples of k', hint: 'Multiples of a single small number.' };
}

function countdown() {
  const start = rand(20, 40);
  const step = rand(2, 5);
  const arr = Array.from({ length: 5 }, (_, i) => start - i * step);
  const ans = start - 5 * step;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Countdown', hint: 'Decreases by a fixed amount.' };
}

function vowelCycle() {
  const vowels = ['A','E','I','O','U'];
  const arr = Array.from({ length: 6 }, (_, i) => vowels[i % 5]);
  return { series: arr, answer: 'E', acceptable: ['E','e'], name: 'Vowel cycle', hint: 'Repeats the vowels A, E, I, O, U.' };
}

function decreasingMultiples() {
  const k = rand(3, 8);
  const start = rand(8, 12);
  const arr = Array.from({ length: 5 }, (_, i) => k * (start - i));
  const ans = k * (start - 5);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Decreasing multiples', hint: 'Multiples of k, decreasing.' };
}

function alphabetPairs() {
  const start = rand(0, 14);
  const arr = Array.from({ length: 5 }, (_, i) => {
    const p = start + i * 2;
    return `${String.fromCharCode(65 + p)}${String.fromCharCode(66 + p)}`;
  });
  const p = start + 10;
  const ans = `${String.fromCharCode(65 + p)}${String.fromCharCode(66 + p)}`;
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Letter pairs', hint: 'Consecutive pairs of letters.' };
}

function halving() {
  const start = 2 ** rand(6, 9);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] / 2);
  const ans = arr[arr.length - 1] / 2;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Halving', hint: 'Each term is half of the previous.' };
}

function alphaSkipTwo() {
  const start = rand(0, 8);
  const arr = Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + start + i * 3));
  const ans = String.fromCharCode(65 + start + 15);
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Skip 2 letters', hint: 'Letter advances by 3 each time.' };
}

function arithStepLarge() {
  const start = rand(10, 30);
  const step = rand(7, 15);
  const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
  const ans = start + 5 * step;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Big arithmetic step', hint: 'Add the same large number each time.' };
}

function alphabetReverseSimple() {
  const start = rand(20, 25);
  const arr = Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + start - i));
  const ans = String.fromCharCode(65 + start - 5);
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Alphabet reverse', hint: 'Letters go backward by 1.' };
}

function squaresPlusOne() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2 + 1);
  return { series: arr.map(String), answer: '37', acceptable: ['37'], name: 'n² + 1', hint: 'Square plus 1.' };
}

function consonantCycle() {
  const cons = ['B','C','D','F','G'];
  const arr = Array.from({ length: 6 }, (_, i) => cons[i % 5]);
  return { series: arr, answer: 'C', acceptable: ['C','c'], name: 'Consonant cycle', hint: 'Cycles through the first 5 consonants.' };
}

// ---------- Medium ----------

function alternating() {
  const start = rand(2, 6);
  const add = rand(2, 5);
  const sub = rand(1, 3);
  const arr = [start];
  for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] + add : arr[i] - sub);
  const next = arr.length % 2 === 1 ? arr[arr.length - 1] + add : arr[arr.length - 1] - sub;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Alternating ops', hint: 'Alternates between adding and subtracting.' };
}

function quadratic() {
  const a = rand(1, 3), b = rand(-3, 4), c = rand(-2, 5);
  const f = (n) => a * n * n + b * n + c;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const answer = String(f(6));
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Quadratic rule', hint: 'Follows a quadratic formula a·n² + b·n + c.' };
}

function mixedOps() {
  const start = rand(1, 4);
  const mul = rand(2, 3);
  const add = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * mul + add);
  const answer = String(arr[arr.length - 1] * mul + add);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Multiply then add', hint: 'Each term: previous × k + c.' };
}

function powerOfTwoPlus() {
  const c = rand(-2, 5);
  const start = rand(1, 4);
  const arr = Array.from({ length: 5 }, (_, i) => 2 ** (start + i) + c);
  const answer = String(2 ** (start + 5) + c);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Powers of 2 shifted', hint: 'Powers of 2 with a constant added.' };
}

function factorial() {
  return { series: ['1','2','6','24','120'], answer: '720', acceptable: ['720'], name: 'Factorials', hint: 'n! — each term multiplied by next integer.' };
}

function interleaved() {
  const a0 = rand(1, 10), ad = rand(2, 6), b0 = rand(2, 5), br = rand(2, 3);
  const arr = [];
  for (let i = 0; i < 3; i++) { arr.push(a0 + i * ad); arr.push(b0 * br ** i); }
  const answer = String(a0 + 3 * ad);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Two interleaved series', hint: 'Odd and even positions follow separate rules.' };
}

function digitSum() {
  let cur = rand(5, 20);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur = cur + String(cur).split('').reduce((s, d) => s + Number(d), 0); arr.push(cur); }
  const next = cur + String(cur).split('').reduce((s, d) => s + Number(d), 0);
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Add digit sum', hint: "Add the sum of the term's digits to get the next." };
}

function alphabetReverse() {
  const start = rand(20, 25);
  const step = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + start - i * step));
  const answer = String.fromCharCode(65 + start - 5 * step);
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Reverse alphabet step', hint: 'Letters go backward by a fixed step.' };
}

function squarePlus() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) * (i + 1) + (i + 1));
  const answer = String(6 * 6 + 6);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'n² + n', hint: 'Each term is n² + n.' };
}

function fibMultiplied() {
  const a = rand(1, 3), b = rand(2, 4);
  const arr = [a, b];
  for (let i = 0; i < 3; i++) arr.push(arr[arr.length - 1] * arr[arr.length - 2]);
  const answer = String(arr[arr.length - 1] * arr[arr.length - 2]);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Multiplicative Fibonacci', hint: 'Each term is the product of the two before it.' };
}

function letterSkipCycle() {
  const start = rand(0, 18);
  const arr = Array.from({ length: 4 }, (_, i) => `${String.fromCharCode(65 + start + i * 2)}${(i + 1) ** 2}`);
  const answer = `${String.fromCharCode(65 + start + 8)}25`;
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Letter skip + squares', hint: 'Letter jumps by 2, number follows squares.' };
}

function arithGeoMix() {
  const a = rand(2, 5), d = rand(2, 4), r = rand(2, 3);
  const arr = [a];
  for (let i = 1; i < 5; i++) arr.push(i % 2 === 1 ? arr[i - 1] + d : arr[i - 1] * r);
  const next = arr.length % 2 === 1 ? arr[arr.length - 1] + d : arr[arr.length - 1] * r;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Add then multiply', hint: 'Alternates between +d and ×r.' };
}

function diffArithmetic() {
  let cur = rand(1, 10), d = rand(2, 4);
  const step = rand(1, 3);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur += d; arr.push(cur); d += step; }
  const ans = cur + d;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Differences grow', hint: 'Gap between terms grows by a fixed amount.' };
}

function powersOf3() {
  const start = rand(0, 2);
  const arr = Array.from({ length: 5 }, (_, i) => 3 ** (start + i));
  const ans = 3 ** (start + 5);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Powers of 3', hint: 'Each term is the next power of 3.' };
}

function letterMinusNumber() {
  const start = rand(20, 25);
  const arr = Array.from({ length: 4 }, (_, i) => {
    const pos = start - i;
    return `${String.fromCharCode(65 + pos)}${pos + 1}`;
  });
  const pos = start - 4;
  const ans = `${String.fromCharCode(65 + pos)}${pos + 1}`;
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Letter = position', hint: 'Letter steps back and number equals its position.' };
}

function plusOneTimesTwo() {
  let cur = rand(1, 4);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur = (cur + 1) * 2; arr.push(cur); }
  const ans = (cur + 1) * 2;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: '(prev + 1) × 2', hint: 'Add 1, then double.' };
}

function digitReverse() {
  const arr = [];
  for (let n = 2; n <= 4; n++) { arr.push(`1${n}`); arr.push(`${n}1`); }
  return { series: arr, answer: '15', acceptable: ['15'], name: 'Number, then reverse', hint: 'Each pair is a number and its reverse.' };
}

function squaresMinusOne() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2 - 1);
  const ans = 36 - 1;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n² − 1', hint: 'Square minus one.' };
}

function productOfTwo() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) * (i + 3));
  const ans = 6 * 8;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n(n+2)', hint: 'Product of n and n+2.' };
}

function geoPlusArith() {
  const arr = Array.from({ length: 5 }, (_, i) => 2 ** (i + 1) + (i + 1));
  const ans = 2 ** 6 + 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: '2ⁿ + n', hint: 'Power of 2 plus its index.' };
}

function multiplyMinus() {
  let cur = rand(2, 4);
  const m = rand(2, 3), k = rand(1, 3);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur = cur * m - k; arr.push(cur); }
  const ans = cur * m - k;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: '× m − k', hint: 'Multiply, then subtract a constant.' };
}

function alternatingPlusMinus() {
  let cur = rand(20, 40);
  const a = rand(3, 7), b = rand(2, 5);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur = i % 2 === 0 ? cur + a : cur - b; arr.push(cur); }
  const ans = arr.length % 2 === 1 ? cur + a : cur - b;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Alternating +/−', hint: 'Adds a, then subtracts b, repeating.' };
}

function indexTimesNext() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) * (i + 2));
  return { series: arr.map(String), answer: '42', acceptable: ['42'], name: 'n(n+1)', hint: 'Product of n and n+1.' };
}

function fibPlusN() {
  const fib = [1,1,2,3,5,8,13];
  const arr = fib.slice(0, 5).map((f, i) => f + (i + 1));
  const ans = fib[5] + 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Fibonacci + n', hint: 'nth Fibonacci plus n.' };
}

// ---------- Hard ----------

function cubesShifted() {
  const c = rand(-3, 5);
  const start = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) => (start + i) ** 3 + c);
  const answer = String((start + 5) ** 3 + c);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Cubes shifted', hint: 'Cubes of consecutive integers, plus a constant.' };
}

function nSquarePlusOne() {
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 1; return n * n + n + 1; });
  const answer = String(6 * 6 + 6 + 1);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'n² + n + 1', hint: 'Formula based on n² + n + 1.' };
}

function diffOfDiffs() {
  const a = rand(2, 4), b = rand(1, 5), c = rand(0, 6);
  const arr = Array.from({ length: 5 }, (_, i) => a * (i + 1) ** 2 + b * (i + 1) + c);
  const answer = String(a * 36 + b * 6 + c);
  return { series: arr.map(String), answer, acceptable: [answer], name: 'Second-difference constant', hint: 'Differences between consecutive differences are constant.' };
}

function multiplyAddIndex() {
  let cur = rand(1, 3);
  const arr = [cur];
  for (let i = 2; i <= 5; i++) { cur = cur * i + i; arr.push(cur); }
  const next = cur * 6 + 6;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: '× index + index', hint: 'Each term = previous × position + position.' };
}

function primeGap() {
  const primesAll = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  let cur = rand(1, 5);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { cur += primesAll[i]; arr.push(cur); }
  const next = cur + primesAll[4];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Add successive primes', hint: 'Each step adds the next prime number.' };
}

function alternatingMulSub() {
  const start = rand(3, 8);
  const mul = rand(2, 3), sub = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] * mul : arr[i] - sub);
  const last = arr[arr.length - 1];
  const next = arr.length % 2 === 1 ? last * mul : last - sub;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Alternating × / −', hint: 'Alternates between multiplying and subtracting.' };
}

function squareDiffSeries() {
  let cur = rand(2, 10);
  const arr = [cur];
  for (let i = 1; i <= 4; i++) { cur += i * i; arr.push(cur); }
  const next = cur + 25;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Differences = squares', hint: 'Gaps are 1², 2², 3², 4²…' };
}

function geometricMinus() {
  const start = rand(2, 5), r = rand(2, 3), k = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * r - k);
  const next = arr[arr.length - 1] * r - k;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: '× r − k', hint: 'Each term = previous × r − k.' };
}

function alphaPositionSum() {
  const fib = [1, 2, 3, 5, 8, 13, 21];
  const offset = rand(0, 3);
  const arr = fib.slice(0, 5).map(n => String.fromCharCode(64 + n + offset));
  const answer = String.fromCharCode(64 + fib[5] + offset);
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Fibonacci letter positions', hint: 'Letter positions follow Fibonacci.' };
}

function pairSum() {
  const arr = [];
  for (let n = 1; n <= 3; n++) { arr.push(String(n)); arr.push(String(n * n)); }
  return { series: arr, answer: '4', acceptable: ['4'], name: 'Pairs (n, n²)', hint: 'Odd positions count up; even positions are their squares.' };
}

function tripleStep() {
  const start = rand(1, 6);
  const steps = [1, 2, 3, 1, 2, 3];
  const arr = [start];
  for (let i = 0; i < 5; i++) arr.push(arr[arr.length - 1] + steps[i]);
  const next = arr[arr.length - 1] + steps[5];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Repeating step cycle', hint: 'Step pattern repeats every 3 terms.' };
}

function divideAdd() {
  const start = rand(8, 16) * 4;
  const arr = [start];
  let cur = start;
  for (let i = 0; i < 4; i++) { cur = Math.floor(cur / 2) + 1; arr.push(cur); }
  const next = Math.floor(cur / 2) + 1;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Halve then +1', hint: 'Each term = floor(previous/2) + 1.' };
}

function sumOfSquares() {
  const arr = [1];
  for (let n = 2; n <= 5; n++) arr.push(arr[arr.length - 1] + n * n);
  const next = arr[arr.length - 1] + 36;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Running sum of squares', hint: 'Add the next perfect square each time.' };
}

function letterReverseSkip() {
  const start = 25;
  const arr = [];
  let pos = start;
  arr.push(String.fromCharCode(65 + pos));
  for (let step = 2; step <= 5; step++) { pos -= step; arr.push(String.fromCharCode(65 + pos)); }
  pos -= 6;
  const answer = String.fromCharCode(65 + pos);
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Growing reverse step', hint: 'Letter goes back by 2, 3, 4, 5… each step.' };
}

function mixedLetterNumber() {
  const startIdx = rand(0, 10);
  const arr = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return `${String.fromCharCode(65 + startIdx + i * 3)}${2 * n * n}`;
  });
  const answer = `${String.fromCharCode(65 + startIdx + 15)}${2 * 36}`;
  return { series: arr, answer, acceptable: [answer, answer.toLowerCase()], name: 'Letter +3, number = 2n²', hint: 'Letter advances by 3; number follows 2n².' };
}

function doublePlusPrev() {
  const arr = [1, 2];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + 2 * arr[arr.length - 2]);
  const next = arr[arr.length - 1] + 2 * arr[arr.length - 2];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'a(n−1) + 2·a(n−2)', hint: 'Each term = previous + twice the one before.' };
}

function cubeSum() {
  const arr = [1];
  for (let n = 2; n <= 5; n++) arr.push(arr[arr.length - 1] + n ** 3);
  const ans = arr[arr.length - 1] + 216;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Running sum of cubes', hint: 'Add the next perfect cube each time.' };
}

function pentagonal() {
  const f = (n) => (n * (3 * n - 1)) / 2;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Pentagonal numbers', hint: 'n(3n−1)/2.' };
}

function hexagonal() {
  const f = (n) => n * (2 * n - 1);
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Hexagonal numbers', hint: 'n(2n−1).' };
}

function letterPlusSquare() {
  const start = rand(0, 8);
  const arr = Array.from({ length: 5 }, (_, i) => `${String.fromCharCode(65 + start + i * 2)}${(i + 1) ** 2}`);
  const ans = `${String.fromCharCode(65 + start + 10)}36`;
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Letter +2, number = n²', hint: 'Letter steps by 2; number is n².' };
}

function differenceGeometric() {
  let cur = rand(1, 5);
  const arr = [cur];
  let d = 2;
  for (let i = 0; i < 4; i++) { cur += d; arr.push(cur); d *= 2; }
  const ans = cur + d;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Differences double', hint: 'Gaps between terms double each time.' };
}

function tripleMinusPrev() {
  const arr = [1, 3];
  for (let i = 0; i < 4; i++) arr.push(3 * arr[arr.length - 1] - 2 * arr[arr.length - 2]);
  const next = 3 * arr[arr.length - 1] - 2 * arr[arr.length - 2];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: '3·a(n−1) − 2·a(n−2)', hint: 'Linear recurrence with coefficients 3 and −2.' };
}

function squareTriangular() {
  const f = (n) => n * n + (n - 1) * (n - 1);
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Centered squares', hint: 'n² + (n−1)².' };
}

function digitProduct() {
  let cur = rand(12, 25);
  const arr = [cur];
  for (let i = 0; i < 4; i++) { const p = String(cur).split('').reduce((s, d) => s * Number(d), 1); cur = cur + p; arr.push(cur); }
  const p = String(cur).split('').reduce((s, d) => s * Number(d), 1);
  const ans = cur + p;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Add digit product', hint: 'Add product of digits to get next.' };
}

function letterCubeIndex() {
  const start = rand(0, 5);
  const arr = Array.from({ length: 5 }, (_, i) => `${String.fromCharCode(65 + start + i)}${(i + 1) ** 3}`);
  const ans = `${String.fromCharCode(65 + start + 5)}216`;
  return { series: arr, answer: ans, acceptable: [ans, ans.toLowerCase()], name: 'Letter + cube', hint: 'Letters +1, numbers are cubes.' };
}

function nthPrimePlusN() {
  const ps = [2,3,5,7,11,13,17];
  const arr = ps.slice(0, 5).map((p, i) => p + (i + 1));
  const ans = ps[5] + 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'nth prime + n', hint: 'Add position to the nth prime.' };
}

function powerMinusSquare() {
  const arr = Array.from({ length: 6 }, (_, i) => 2 ** (i + 1) - (i + 1) ** 2);
  return { series: arr.slice(0, 5).map(String), answer: String(arr[5]), acceptable: [String(arr[5])], name: '2ⁿ − n²', hint: 'Power of 2 minus square of n.' };
}

// ---------- GATE ----------

function lucasSeries() {
  const arr = [2, 1];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  const next = arr[arr.length - 1] + arr[arr.length - 2];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Lucas series', hint: 'Like Fibonacci, but starts 2, 1.' };
}

function pellSeries() {
  const arr = [1, 2];
  for (let i = 0; i < 4; i++) arr.push(2 * arr[arr.length - 1] + arr[arr.length - 2]);
  const next = 2 * arr[arr.length - 1] + arr[arr.length - 2];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Pell recurrence', hint: 'a(n) = 2·a(n−1) + a(n−2).' };
}

function catalanSeries() {
  return { series: ['1','2','5','14','42','132'], answer: '429', acceptable: ['429'], name: 'Catalan numbers', hint: 'C(n) = (2n)! / (n! (n+1)!).' };
}

function bellSeries() {
  return { series: ['1','1','2','5','15','52'], answer: '203', acceptable: ['203'], name: 'Bell numbers', hint: 'Partitions of an n-set.' };
}

function primesSquared() {
  const ps = [2,3,5,7,11,13,17];
  const offset = rand(0, 1);
  const arr = ps.slice(offset, offset + 5).map(p => p * p);
  const next = ps[offset + 5] ** 2;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Squares of primes', hint: 'Each term is the square of a prime.' };
}

function twoPowMinusN() {
  const arr = Array.from({ length: 5 }, (_, i) => 2 ** (i + 1) - (i + 1));
  const next = 2 ** 6 - 6;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: '2ⁿ − n', hint: '2 raised to n, minus n.' };
}

function factorialSum() {
  const fact = [1, 2, 6, 24, 120, 720, 5040];
  const arr = [];
  let s = 0;
  for (let i = 0; i < 6; i++) { s += fact[i]; arr.push(s); }
  const ans = arr[5] + fact[6];
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Σ n!', hint: 'Running sum of factorials: 1! + 2! + … + n!.' };
}

function recurrence3() {
  const arr = [1, 3];
  for (let i = 0; i < 4; i++) arr.push(3 * arr[arr.length - 1] - arr[arr.length - 2]);
  const next = 3 * arr[arr.length - 1] - arr[arr.length - 2];
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: '3·a(n−1) − a(n−2)', hint: 'Linear recurrence: 3·prev − one-before.' };
}

function signedSquares() {
  const arr = Array.from({ length: 6 }, (_, i) => (i % 2 === 0 ? 1 : -1) * (i + 1) ** 2);
  return { series: arr.map(String), answer: '49', acceptable: ['49'], name: 'Alternating signed squares', hint: '(-1)^(n+1) · n².' };
}

function tetrahedral() {
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 1; return (n * (n + 1) * (n + 2)) / 6; });
  const ans = (6 * 7 * 8) / 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Tetrahedral numbers', hint: 'n(n+1)(n+2)/6.' };
}

function cubeMinusN() {
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 1; return n ** 3 - n; });
  const ans = 6 ** 3 - 6;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n³ − n', hint: 'Cube of n minus n.' };
}

function gateMixedRecur() {
  const start1 = rand(1, 3), start2 = rand(2, 4);
  const arr = [start1, start2];
  for (let i = 2; i < 5; i++) arr.push(arr[i - 1] + arr[i - 2] + (i + 1));
  const next = arr[4] + arr[3] + 6;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'a(n−1) + a(n−2) + n', hint: 'Fibonacci-like, plus the current index.' };
}

function motzkinSeries() {
  return { series: ['1','1','2','4','9','21'], answer: '51', acceptable: ['51'], name: 'Motzkin numbers', hint: 'Non-crossing chords on a circle.' };
}

function partitionSeries() {
  return { series: ['1','2','3','5','7','11'], answer: '15', acceptable: ['15'], name: 'Integer partitions', hint: 'Number of partitions of n.' };
}

function recamanLike() {
  return { series: ['0','1','3','6','2','7'], answer: '13', acceptable: ['13'], name: 'Recamán sequence', hint: 'Subtract n if possible & unseen, else add n.' };
}

function jacobsthal() {
  return { series: ['0','1','1','3','5','11'], answer: '21', acceptable: ['21'], name: 'Jacobsthal sequence', hint: 'a(n) = a(n−1) + 2·a(n−2).' };
}

function perrinSeries() {
  return { series: ['3','0','2','3','2','5'], answer: '5', acceptable: ['5'], name: 'Perrin sequence', hint: 'P(n) = P(n−2) + P(n−3).' };
}

function centralBinomial() {
  return { series: ['1','2','6','20','70','252'], answer: '924', acceptable: ['924'], name: 'Central binomial', hint: 'C(2n, n).' };
}

function squarePyramidal() {
  const f = (n) => (n * (n + 1) * (2 * n + 1)) / 6;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Square pyramidal', hint: 'Sum of first n squares.' };
}

function eulerTotientPrimes() {
  return { series: ['1','2','4','6','10','12'], answer: '16', acceptable: ['16'], name: 'φ of primes (p−1)', hint: 'Euler totient at successive primes.' };
}

function tribonacci() {
  return { series: ['0','1','1','2','4','7'], answer: '13', acceptable: ['13'], name: 'Tribonacci', hint: 'Each term = sum of the previous three.' };
}

function padovan() {
  return { series: ['1','1','1','2','2','3'], answer: '4', acceptable: ['4'], name: 'Padovan sequence', hint: 'P(n) = P(n−2) + P(n−3).' };
}

function sylvester() {
  return { series: ['2','3','7','43'], answer: '1807', acceptable: ['1807'], name: 'Sylvester sequence', hint: 'a(n) = a(n−1)² − a(n−1) + 1.' };
}

function harmonicDenoms() {
  return { series: ['1','2','4','7','11','16'], answer: '22', acceptable: ['22'], name: 'Lazy caterer', hint: 'Max pieces from n straight cuts of a pancake.' };
}

function magicSquaresSum() {
  const f = (n) => (n * (n * n + 1)) / 2;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Magic square constant', hint: 'n(n²+1)/2.' };
}

function collatzPath() {
  return { series: ['6','3','10','5','16','8'], answer: '4', acceptable: ['4'], name: 'Collatz path', hint: 'If even, halve; if odd, 3n+1.' };
}

// ---------- New patterns (Batch 4) ----------

function doublingFromSmall() {
  const start = rand(1, 5);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * 2);
  const ans = arr[arr.length - 1] * 2;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Doubling', hint: 'Each term is double the previous.' };
}

function tripling() {
  const start = rand(1, 3);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * 3);
  const ans = arr[arr.length - 1] * 3;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Tripling', hint: 'Each term is triple the previous.' };
}

function addPrevTwo() {
  const a = rand(2, 6), b = rand(3, 8);
  const arr = [a, b];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  const ans = arr[arr.length - 1] + arr[arr.length - 2];
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Sum of two previous', hint: 'Like Fibonacci: add the last two.' };
}

function staircase() {
  // +1, +2, +3, +4, +5 ...
  let cur = rand(1, 5);
  const arr = [cur];
  for (let i = 1; i <= 4; i++) { cur += i; arr.push(cur); }
  const ans = cur + 5;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Staircase', hint: 'Add 1, then 2, then 3, etc.' };
}

function squaredIndex() {
  // a(n) = n^2 + 2n
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 1; return n * n + 2 * n; });
  const ans = 36 + 12;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n² + 2n', hint: 'n squared plus twice n.' };
}

function cubicSimple() {
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) ** 3);
  const ans = 6 ** 3;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Perfect cubes', hint: 'Cubes of consecutive integers.' };
}

function zigzag() {
  // +5, -2, +5, -2, ...
  const start = rand(3, 10);
  const up = rand(4, 8), down = rand(1, 3);
  const arr = [start];
  for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] + up : arr[i] - down);
  const next = arr.length % 2 === 1 ? arr[arr.length - 1] + up : arr[arr.length - 1] - down;
  return { series: arr.map(String), answer: String(next), acceptable: [String(next)], name: 'Zigzag', hint: 'Alternates: add big, subtract small.' };
}

function nTimesPlusOne() {
  // a(n) = n * (n+1) + 1: 3, 7, 13, 21, 31, 43
  const arr = Array.from({ length: 5 }, (_, i) => (i+1)*(i+2) + 1);
  const ans = 6 * 7 + 1;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n(n+1) + 1', hint: 'Oblong numbers plus 1.' };
}

function powersOfFive() {
  const arr = [1, 5, 25, 125, 625];
  return { series: arr.map(String), answer: '3125', acceptable: ['3125'], name: 'Powers of 5', hint: 'Each term is the next power of 5.' };
}

function addSquareRoot() {
  // perfect squares: add sqrt: 4→4+2=6, 9→9+3=12, 16→16+4=20, 25→25+5=30, 36→36+6=42
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 2; return n * n + n; });
  const ans = 7 * 7 + 7;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'n² + n (from 2)', hint: 'Square a number and add itself.' };
}

function twoNPlusThree() {
  const start = rand(0, 4);
  const arr = Array.from({ length: 5 }, (_, i) => 2 * (start + i) + 3);
  const ans = 2 * (start + 5) + 3;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: '2n + 3', hint: 'Linear formula: 2n + 3.' };
}

function threeNMinusOne() {
  const start = rand(1, 5);
  const arr = Array.from({ length: 5 }, (_, i) => 3 * (start + i) - 1);
  const ans = 3 * (start + 5) - 1;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: '3n − 1', hint: 'Linear formula: 3n − 1.' };
}

function sumOfDigitsEqual() {
  // numbers whose digits sum to a value: 10, 19, 28, 37, 46, 55
  const arr = [10, 19, 28, 37, 46];
  return { series: arr.map(String), answer: '55', acceptable: ['55'], name: 'Digit sum = constant', hint: 'All numbers have the same digit sum.' };
}

function nCubeMinusNCube() {
  // (n+1)^3 - n^3 = 3n^2 + 3n + 1: 7, 19, 37, 61, 91, 127
  const f = (n) => 3*n*n + 3*n + 1;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Cube differences', hint: 'Difference between consecutive cubes.' };
}

function starNumbers() {
  // S(n) = 6n(n-1)+1: 1, 13, 37, 73, 121, 181
  const f = (n) => 6*n*(n-1) + 1;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Star numbers', hint: '6n(n−1) + 1.' };
}

function happyPath() {
  // powers of 4: 1, 4, 16, 64, 256, 1024
  const arr = Array.from({ length: 5 }, (_, i) => 4 ** i);
  const ans = 4 ** 5;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Powers of 4', hint: 'Each term is the next power of 4.' };
}

function sumFirstN() {
  // T(n) = n(n+1)/2: 1, 3, 6, 10, 15, 21
  const arr = Array.from({ length: 5 }, (_, i) => { const n = i + 1; return n*(n+1)/2; });
  const ans = 6*7/2;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Triangular numbers', hint: 'Sum of first n natural numbers.' };
}

function reverseArithmetic() {
  const start = rand(50, 100);
  const step = rand(3, 8);
  const arr = Array.from({ length: 5 }, (_, i) => start - i * step);
  const ans = start - 5 * step;
  return { series: arr.map(String), answer: String(ans), acceptable: [String(ans)], name: 'Decreasing arithmetic', hint: 'Subtract the same amount each time.' };
}

function compositeSeries() {
  // first composites: 4, 6, 8, 9, 10, 12, 14, 15
  return { series: ['4','6','8','9','10','12'], answer: '14', acceptable: ['14'], name: 'Composite numbers', hint: 'Non-prime, non-1 positive integers.' };
}

function lookAndSay() {
  // simplified: 1, 11, 21, 1211, 111221
  return { series: ['1','11','21','1211'], answer: '111221', acceptable: ['111221'], name: 'Look-and-say', hint: 'Describe what you see in the previous term.' };
}

// ---------- Registry ----------

const registry = [
  // Easy
  { fn: arithmetic, difficulty: 'Easy' },
  { fn: geometric, difficulty: 'Easy' },
  { fn: squares, difficulty: 'Easy' },
  { fn: fibonacci, difficulty: 'Easy' },
  { fn: alphabet, difficulty: 'Easy' },
  { fn: letterNum, difficulty: 'Easy' },
  { fn: emojiCycle, difficulty: 'Easy' },
  { fn: primes, difficulty: 'Easy' },
  { fn: triangular, difficulty: 'Easy' },
  { fn: evenNumbers, difficulty: 'Easy' },
  { fn: oddNumbers, difficulty: 'Easy' },
  { fn: multiplesOfK, difficulty: 'Easy' },
  { fn: countdown, difficulty: 'Easy' },
  { fn: vowelCycle, difficulty: 'Easy' },
  { fn: decreasingMultiples, difficulty: 'Easy' },
  { fn: alphabetPairs, difficulty: 'Easy' },
  { fn: halving, difficulty: 'Easy' },
  { fn: alphaSkipTwo, difficulty: 'Easy' },
  { fn: arithStepLarge, difficulty: 'Easy' },
  { fn: alphabetReverseSimple, difficulty: 'Easy' },
  { fn: squaresPlusOne, difficulty: 'Easy' },
  { fn: consonantCycle, difficulty: 'Easy' },
  { fn: doublingFromSmall, difficulty: 'Easy' },
  { fn: tripling, difficulty: 'Easy' },
  { fn: addPrevTwo, difficulty: 'Easy' },
  { fn: sumFirstN, difficulty: 'Easy' },
  { fn: twoNPlusThree, difficulty: 'Easy' },
  { fn: reverseArithmetic, difficulty: 'Easy' },

  // Medium
  { fn: alternating, difficulty: 'Medium' },
  { fn: quadratic, difficulty: 'Medium' },
  { fn: mixedOps, difficulty: 'Medium' },
  { fn: powerOfTwoPlus, difficulty: 'Medium' },
  { fn: factorial, difficulty: 'Medium' },
  { fn: interleaved, difficulty: 'Medium' },
  { fn: digitSum, difficulty: 'Medium' },
  { fn: alphabetReverse, difficulty: 'Medium' },
  { fn: squarePlus, difficulty: 'Medium' },
  { fn: fibMultiplied, difficulty: 'Medium' },
  { fn: letterSkipCycle, difficulty: 'Medium' },
  { fn: arithGeoMix, difficulty: 'Medium' },
  { fn: diffArithmetic, difficulty: 'Medium' },
  { fn: powersOf3, difficulty: 'Medium' },
  { fn: letterMinusNumber, difficulty: 'Medium' },
  { fn: plusOneTimesTwo, difficulty: 'Medium' },
  { fn: digitReverse, difficulty: 'Medium' },
  { fn: squaresMinusOne, difficulty: 'Medium' },
  { fn: productOfTwo, difficulty: 'Medium' },
  { fn: geoPlusArith, difficulty: 'Medium' },
  { fn: multiplyMinus, difficulty: 'Medium' },
  { fn: alternatingPlusMinus, difficulty: 'Medium' },
  { fn: indexTimesNext, difficulty: 'Medium' },
  { fn: fibPlusN, difficulty: 'Medium' },
  { fn: staircase, difficulty: 'Medium' },
  { fn: zigzag, difficulty: 'Medium' },
  { fn: cubicSimple, difficulty: 'Medium' },
  { fn: threeNMinusOne, difficulty: 'Medium' },
  { fn: powersOfFive, difficulty: 'Medium' },

  // Hard
  { fn: cubesShifted, difficulty: 'Hard' },
  { fn: nSquarePlusOne, difficulty: 'Hard' },
  { fn: diffOfDiffs, difficulty: 'Hard' },
  { fn: multiplyAddIndex, difficulty: 'Hard' },
  { fn: primeGap, difficulty: 'Hard' },
  { fn: alternatingMulSub, difficulty: 'Hard' },
  { fn: squareDiffSeries, difficulty: 'Hard' },
  { fn: geometricMinus, difficulty: 'Hard' },
  { fn: alphaPositionSum, difficulty: 'Hard' },
  { fn: pairSum, difficulty: 'Hard' },
  { fn: tripleStep, difficulty: 'Hard' },
  { fn: divideAdd, difficulty: 'Hard' },
  { fn: sumOfSquares, difficulty: 'Hard' },
  { fn: letterReverseSkip, difficulty: 'Hard' },
  { fn: mixedLetterNumber, difficulty: 'Hard' },
  { fn: doublePlusPrev, difficulty: 'Hard' },
  { fn: cubeSum, difficulty: 'Hard' },
  { fn: pentagonal, difficulty: 'Hard' },
  { fn: hexagonal, difficulty: 'Hard' },
  { fn: letterPlusSquare, difficulty: 'Hard' },
  { fn: differenceGeometric, difficulty: 'Hard' },
  { fn: tripleMinusPrev, difficulty: 'Hard' },
  { fn: squareTriangular, difficulty: 'Hard' },
  { fn: digitProduct, difficulty: 'Hard' },
  { fn: letterCubeIndex, difficulty: 'Hard' },
  { fn: nthPrimePlusN, difficulty: 'Hard' },
  { fn: powerMinusSquare, difficulty: 'Hard' },
  { fn: squaredIndex, difficulty: 'Hard' },
  { fn: nTimesPlusOne, difficulty: 'Hard' },
  { fn: addSquareRoot, difficulty: 'Hard' },
  { fn: sumOfDigitsEqual, difficulty: 'Hard' },
  { fn: compositeSeries, difficulty: 'Hard' },

  // GATE
  { fn: lucasSeries, difficulty: 'GATE' },
  { fn: pellSeries, difficulty: 'GATE' },
  { fn: catalanSeries, difficulty: 'GATE' },
  { fn: bellSeries, difficulty: 'GATE' },
  { fn: primesSquared, difficulty: 'GATE' },
  { fn: twoPowMinusN, difficulty: 'GATE' },
  { fn: factorialSum, difficulty: 'GATE' },
  { fn: recurrence3, difficulty: 'GATE' },
  { fn: signedSquares, difficulty: 'GATE' },
  { fn: tetrahedral, difficulty: 'GATE' },
  { fn: cubeMinusN, difficulty: 'GATE' },
  { fn: gateMixedRecur, difficulty: 'GATE' },
  { fn: motzkinSeries, difficulty: 'GATE' },
  { fn: partitionSeries, difficulty: 'GATE' },
  { fn: recamanLike, difficulty: 'GATE' },
  { fn: jacobsthal, difficulty: 'GATE' },
  { fn: perrinSeries, difficulty: 'GATE' },
  { fn: centralBinomial, difficulty: 'GATE' },
  { fn: squarePyramidal, difficulty: 'GATE' },
  { fn: eulerTotientPrimes, difficulty: 'GATE' },
  { fn: tribonacci, difficulty: 'GATE' },
  { fn: padovan, difficulty: 'GATE' },
  { fn: sylvester, difficulty: 'GATE' },
  { fn: harmonicDenoms, difficulty: 'GATE' },
  { fn: magicSquaresSum, difficulty: 'GATE' },
  { fn: collatzPath, difficulty: 'GATE' },
  { fn: nCubeMinusNCube, difficulty: 'GATE' },
  { fn: starNumbers, difficulty: 'GATE' },
  { fn: happyPath, difficulty: 'GATE' },
  { fn: lookAndSay, difficulty: 'GATE' },
];

// ---------- Public API ----------

function newPatternFiltered(difficulty, lastName) {
  const pool = !difficulty || difficulty === 'All'
    ? registry
    : registry.filter(e => e.difficulty === difficulty);
  const src = pool.length ? pool : registry;
  let entry = src[rand(0, src.length - 1)];
  let p = entry.fn();
  let tries = 0;
  while (p.name === lastName && tries < 5) {
    entry = src[rand(0, src.length - 1)];
    p = entry.fn();
    tries++;
  }
  return { ...p, difficulty: entry.difficulty };
}

function checkAnswer(pattern, input) {
  const n = norm(input);
  return pattern.acceptable.some(a => norm(a) === n);
}

/**
 * Generate 4 MCQ options (including the correct answer), shuffled.
 * Tries to create plausible wrong answers near the correct one.
 */
function generateOptions(pattern) {
  const correct = pattern.answer;
  const num = Number(correct);
  const options = new Set();
  options.add(correct);

  if (!isNaN(num) && isFinite(num) && /^-?\d+$/.test(correct.trim())) {
    // Numeric answer — generate nearby wrong answers
    const magnitude = Math.max(Math.abs(num), 1);
    const spread = Math.max(Math.ceil(magnitude * 0.25), 2);

    let attempts = 0;
    while (options.size < 4 && attempts < 40) {
      const offset = rand(1, spread) * (Math.random() < 0.5 ? 1 : -1);
      const wrong = num + offset;
      if (wrong !== num) options.add(String(wrong));
      attempts++;
    }
    // Fallback if still not enough
    let fallback = 1;
    while (options.size < 4) {
      if (!options.has(String(num + fallback))) options.add(String(num + fallback));
      if (!options.has(String(num - fallback))) options.add(String(num - fallback));
      fallback++;
    }
  } else {
    // Non-numeric (letter, emoji, alphanumeric) — generate plausible alternatives
    const isLetter = /^[A-Za-z]$/.test(correct);
    if (isLetter) {
      const code = correct.toUpperCase().charCodeAt(0);
      const offsets = [-2, -1, 1, 2, 3, -3];
      for (const off of offsets) {
        if (options.size >= 4) break;
        const c = code + off;
        if (c >= 65 && c <= 90) options.add(String.fromCharCode(c));
      }
    }
    // Alphanumeric like "E5" or "K36"
    const alphaNum = correct.match(/^([A-Za-z]+)(\d+)$/);
    if (alphaNum) {
      const letterPart = alphaNum[1];
      const numPart = Number(alphaNum[2]);
      const offsets = [
        { l: 1, n: rand(1, 3) }, { l: -1, n: rand(1, 3) },
        { l: 0, n: rand(1, 5) }, { l: 2, n: -rand(1, 3) },
      ];
      for (const off of offsets) {
        if (options.size >= 4) break;
        const newLetter = String.fromCharCode(letterPart.charCodeAt(0) + off.l);
        if (newLetter >= 'A' && newLetter <= 'Z') {
          const newNum = Math.max(0, numPart + off.n);
          const opt = newLetter + newNum;
          if (opt !== correct) options.add(opt);
        }
      }
    }
    // Emoji / symbol fallback — use items from the series as distractors
    if (options.size < 4) {
      const pool = pattern.series.filter(s => s !== correct);
      for (const s of pool) {
        if (options.size >= 4) break;
        options.add(s);
      }
    }
    // Last resort: append indices
    let idx = 1;
    while (options.size < 4) {
      options.add(correct + idx);
      idx++;
    }
  }

  // Convert to array and shuffle (Fisher-Yates)
  const arr = Array.from(options).slice(0, 4);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Expose globally
window.PatternEngine = { newPatternFiltered, checkAnswer, generateOptions };
