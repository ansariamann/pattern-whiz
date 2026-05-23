export type Pattern = {
  series: string[];
  answer: string;
  acceptable: string[];
  name: string;
  hint: string;
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const norm = (s: string) => s.trim().toLowerCase();

function arithmetic(): Pattern {
  const start = rand(1, 20);
  const step = rand(2, 9);
  const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
  const answer = String(start + 5 * step);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Arithmetic",
    hint: "Each number increases by a fixed amount.",
  };
}

function geometric(): Pattern {
  const start = rand(1, 5);
  const ratio = rand(2, 4);
  const arr = Array.from({ length: 4 }, (_, i) => start * ratio ** i);
  const answer = String(start * ratio ** 4);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Geometric",
    hint: "Each number is multiplied by a fixed factor.",
  };
}

function squares(): Pattern {
  const start = rand(1, 5);
  const arr = Array.from({ length: 5 }, (_, i) => (start + i) ** 2);
  const answer = String((start + 5) ** 2);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Perfect Squares",
    hint: "Squares of consecutive integers.",
  };
}

function fibonacci(): Pattern {
  const a = rand(1, 4);
  const b = rand(1, 4);
  const arr = [a, b];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  const answer = String(arr[arr.length - 1] + arr[arr.length - 2]);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Fibonacci-like",
    hint: "Each term is the sum of the two before it.",
  };
}

function alternating(): Pattern {
  const start = rand(2, 6);
  const add = rand(2, 5);
  const sub = rand(1, 3);
  const arr = [start];
  for (let i = 0; i < 5; i++) {
    arr.push(i % 2 === 0 ? arr[i] + add : arr[i] - sub);
  }
  const next = arr.length % 2 === 1 ? arr[arr.length - 1] + add : arr[arr.length - 1] - sub;
  const answer = String(next);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Alternating ops",
    hint: "Alternates between adding and subtracting.",
  };
}

function alphabet(): Pattern {
  const start = rand(0, 15);
  const step = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) =>
    String.fromCharCode(65 + start + i * step),
  );
  const answer = String.fromCharCode(65 + start + 5 * step);
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Alphabet step",
    hint: "Letters advance by a fixed step in the alphabet.",
  };
}

function letterNum(): Pattern {
  const start = rand(0, 20);
  const arr = Array.from(
    { length: 4 },
    (_, i) => `${String.fromCharCode(65 + start + i)}${i + 1}`,
  );
  const answer = `${String.fromCharCode(65 + start + 4)}5`;
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Letter + Number",
    hint: "Letters and numbers both advance by one.",
  };
}

function emojiCycle(): Pattern {
  const sets = [
    ["🔴", "🔵", "🟢"],
    ["⭐", "🌙", "☀️"],
    ["🍎", "🍌", "🍇", "🍊"],
    ["▲", "■", "●"],
    ["🐶", "🐱", "🐭"],
  ];
  const set = sets[rand(0, sets.length - 1)];
  const len = set.length * 2;
  const arr = Array.from({ length: len }, (_, i) => set[i % set.length]);
  const answer = set[len % set.length];
  return {
    series: arr,
    answer,
    acceptable: [answer],
    name: "Repeating cycle",
    hint: "The sequence repeats a small set in order.",
  };
}

function primes(): Pattern {
  const primesAll = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
  const offset = rand(0, 3);
  const arr = primesAll.slice(offset, offset + 5);
  const answer = String(primesAll[offset + 5]);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Prime numbers",
    hint: "Consecutive prime numbers.",
  };
}

function triangular(): Pattern {
  const start = rand(1, 3);
  const arr: number[] = [];
  let cur = (start * (start + 1)) / 2;
  let inc = start + 1;
  for (let i = 0; i < 5; i++) {
    arr.push(cur);
    cur += inc;
    inc++;
  }
  const answer = String(cur);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Growing differences",
    hint: "Gaps between numbers grow by 1 each step.",
  };
}

// ---------- Complex patterns ----------

function quadratic(): Pattern {
  // a*n^2 + b*n + c
  const a = rand(1, 3);
  const b = rand(-3, 4);
  const c = rand(-2, 5);
  const f = (n: number) => a * n * n + b * n + c;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const answer = String(f(6));
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Quadratic rule",
    hint: "Follows a quadratic formula a·n² + b·n + c.",
  };
}

function mixedOps(): Pattern {
  // x2 +1, x2 +1, ...
  const start = rand(1, 4);
  const mul = rand(2, 3);
  const add = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * mul + add);
  const answer = String(arr[arr.length - 1] * mul + add);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Multiply then add",
    hint: "Each term: previous × k + c.",
  };
}

function powerOfTwoPlus(): Pattern {
  const c = rand(-2, 5);
  const start = rand(1, 4);
  const arr = Array.from({ length: 5 }, (_, i) => 2 ** (start + i) + c);
  const answer = String(2 ** (start + 5) + c);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Powers of 2 shifted",
    hint: "Powers of 2 with a constant added.",
  };
}

function factorial(): Pattern {
  const arr = [1, 2, 6, 24, 120];
  return {
    series: arr.map(String),
    answer: "720",
    acceptable: ["720"],
    name: "Factorials",
    hint: "n! — each term multiplied by next integer.",
  };
}

function interleaved(): Pattern {
  // two interleaved sequences: arithmetic A and geometric B
  const a0 = rand(1, 10);
  const ad = rand(2, 6);
  const b0 = rand(2, 5);
  const br = rand(2, 3);
  const arr: number[] = [];
  for (let i = 0; i < 3; i++) {
    arr.push(a0 + i * ad);
    arr.push(b0 * br ** i);
  }
  // length 6, next is A index 3
  const answer = String(a0 + 3 * ad);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Two interleaved series",
    hint: "Odd and even positions follow separate rules.",
  };
}

function digitSum(): Pattern {
  // each term = previous + sum of its digits
  let cur = rand(5, 20);
  const arr = [cur];
  for (let i = 0; i < 4; i++) {
    cur = cur + String(cur).split("").reduce((s, d) => s + Number(d), 0);
    arr.push(cur);
  }
  const next = cur + String(cur).split("").reduce((s, d) => s + Number(d), 0);
  const answer = String(next);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Add digit sum",
    hint: "Add the sum of the term's digits to get the next.",
  };
}

function alphabetReverse(): Pattern {
  // letters going backward, with step
  const start = rand(20, 25);
  const step = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) =>
    String.fromCharCode(65 + start - i * step),
  );
  const answer = String.fromCharCode(65 + start - 5 * step);
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Reverse alphabet step",
    hint: "Letters go backward by a fixed step.",
  };
}

function squarePlus(): Pattern {
  // n^2 + n
  const arr = Array.from({ length: 5 }, (_, i) => (i + 1) * (i + 1) + (i + 1));
  const answer = String(6 * 6 + 6);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "n² + n",
    hint: "Each term is n² + n.",
  };
}

function fibMultiplied(): Pattern {
  // Fibonacci-like but multiplied
  const a = rand(1, 3);
  const b = rand(2, 4);
  const arr = [a, b];
  for (let i = 0; i < 3; i++) arr.push(arr[arr.length - 1] * arr[arr.length - 2]);
  const answer = String(arr[arr.length - 1] * arr[arr.length - 2]);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Multiplicative Fibonacci",
    hint: "Each term is the product of the two before it.",
  };
}

function letterSkipCycle(): Pattern {
  // letter + number where number follows its own pattern (squares)
  const start = rand(0, 18);
  const arr = Array.from(
    { length: 4 },
    (_, i) => `${String.fromCharCode(65 + start + i * 2)}${(i + 1) ** 2}`,
  );
  const answer = `${String.fromCharCode(65 + start + 8)}25`;
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Letter skip + squares",
    hint: "Letter jumps by 2, number follows squares.",
  };
}

const generators = [
  arithmetic,
  geometric,
  squares,
  fibonacci,
  alternating,
  alphabet,
  letterNum,
  emojiCycle,
  primes,
  triangular,
  quadratic,
  mixedOps,
  powerOfTwoPlus,
  factorial,
  interleaved,
  digitSum,
  alphabetReverse,
  squarePlus,
  fibMultiplied,
  letterSkipCycle,
];

export function newPattern(lastName?: string): Pattern {
  let p = generators[rand(0, generators.length - 1)]();
  let tries = 0;
  while (p.name === lastName && tries < 5) {
    p = generators[rand(0, generators.length - 1)]();
    tries++;
  }
  return p;
}

export function checkAnswer(pattern: Pattern, input: string): boolean {
  const n = norm(input);
  return pattern.acceptable.some((a) => norm(a) === n);
}