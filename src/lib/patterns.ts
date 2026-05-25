export type Pattern = {
  series: string[];
  answer: string;
  acceptable: string[];
  name: string;
  hint: string;
  difficulty: Difficulty;
};

export type Difficulty = "Easy" | "Medium" | "Hard" | "GATE";

type RawPattern = Omit<Pattern, "difficulty">;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const norm = (s: string) => s.trim().toLowerCase();

function arithmetic(): RawPattern {
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

function geometric(): RawPattern {
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

function squares(): RawPattern {
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

function fibonacci(): RawPattern {
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

function alternating(): RawPattern {
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

function alphabet(): RawPattern {
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

function letterNum(): RawPattern {
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

function emojiCycle(): RawPattern {
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

function primes(): RawPattern {
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

function triangular(): RawPattern {
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

function quadratic(): RawPattern {
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

function mixedOps(): RawPattern {
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

function powerOfTwoPlus(): RawPattern {
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

function factorial(): RawPattern {
  const arr = [1, 2, 6, 24, 120];
  return {
    series: arr.map(String),
    answer: "720",
    acceptable: ["720"],
    name: "Factorials",
    hint: "n! — each term multiplied by next integer.",
  };
}

function interleaved(): RawPattern {
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

function digitSum(): RawPattern {
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

function alphabetReverse(): RawPattern {
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

function squarePlus(): RawPattern {
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

function fibMultiplied(): RawPattern {
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

function letterSkipCycle(): RawPattern {
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

// ---------- Competitive-exam level patterns ----------

function cubesShifted(): RawPattern {
  const c = rand(-3, 5);
  const start = rand(1, 3);
  const arr = Array.from({ length: 5 }, (_, i) => (start + i) ** 3 + c);
  const answer = String((start + 5) ** 3 + c);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Cubes shifted",
    hint: "Cubes of consecutive integers, plus a constant.",
  };
}

function nSquarePlusOne(): RawPattern {
  // n*(n+1) + n   variants — pick: n^2 + n + 1
  const arr = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return n * n + n + 1;
  });
  const answer = String(6 * 6 + 6 + 1);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "n² + n + 1",
    hint: "Formula based on n² + n + 1.",
  };
}

function diffOfDiffs(): RawPattern {
  // second differences constant and not 1
  const a = rand(2, 4);
  const b = rand(1, 5);
  const c = rand(0, 6);
  // f(n) = a*n^2 + b*n + c, second difference = 2a
  const arr = Array.from({ length: 5 }, (_, i) => a * (i + 1) ** 2 + b * (i + 1) + c);
  const answer = String(a * 36 + b * 6 + c);
  return {
    series: arr.map(String),
    answer,
    acceptable: [answer],
    name: "Second-difference constant",
    hint: "Differences between consecutive differences are constant.",
  };
}

function multiplyAddIndex(): RawPattern {
  // each: prev * i + i  where i grows
  let cur = rand(1, 3);
  const arr = [cur];
  for (let i = 2; i <= 5; i++) {
    cur = cur * i + i;
    arr.push(cur);
  }
  const next = cur * 6 + 6;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "× index + index",
    hint: "Each term = previous × position + position.",
  };
}

function primeGap(): RawPattern {
  // a_n + nth prime
  const primesAll = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  let cur = rand(1, 5);
  const arr = [cur];
  for (let i = 0; i < 4; i++) {
    cur += primesAll[i];
    arr.push(cur);
  }
  const next = cur + primesAll[4];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Add successive primes",
    hint: "Each step adds the next prime number.",
  };
}

function alternatingMulSub(): RawPattern {
  // ×2, -3, ×2, -3, …
  const start = rand(3, 8);
  const mul = rand(2, 3);
  const sub = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 5; i++) {
    arr.push(i % 2 === 0 ? arr[i] * mul : arr[i] - sub);
  }
  const last = arr[arr.length - 1];
  const next = arr.length % 2 === 1 ? last * mul : last - sub;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Alternating × / −",
    hint: "Alternates between multiplying and subtracting.",
  };
}

function squareDiffSeries(): RawPattern {
  // differences are themselves squares: +1,+4,+9,+16,…
  let cur = rand(2, 10);
  const arr = [cur];
  for (let i = 1; i <= 4; i++) {
    cur += i * i;
    arr.push(cur);
  }
  const next = cur + 25;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Differences = squares",
    hint: "Gaps are 1², 2², 3², 4²…",
  };
}

function geometricMinus(): RawPattern {
  // ×r − k each step
  const start = rand(2, 5);
  const r = rand(2, 3);
  const k = rand(1, 4);
  const arr = [start];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] * r - k);
  const next = arr[arr.length - 1] * r - k;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "× r − k",
    hint: "Each term = previous × r − k.",
  };
}

function alphaPositionSum(): RawPattern {
  // letters whose positions follow Fibonacci
  const fib = [1, 2, 3, 5, 8, 13, 21];
  const offset = rand(0, 3);
  const arr = fib.slice(0, 5).map((n) => String.fromCharCode(64 + n + offset));
  const answer = String.fromCharCode(64 + fib[5] + offset);
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Fibonacci letter positions",
    hint: "Letter positions follow Fibonacci.",
  };
}

function pairSum(): RawPattern {
  // pairs: (a,b), (a+b, a-b style) — Use: each pair (n, n^2)
  const arr: string[] = [];
  for (let n = 1; n <= 3; n++) {
    arr.push(String(n));
    arr.push(String(n * n));
  }
  // sequence: 1,1,2,4,3,9 → next is 4
  return {
    series: arr,
    answer: "4",
    acceptable: ["4"],
    name: "Pairs (n, n²)",
    hint: "Odd positions count up; even positions are their squares.",
  };
}

function tripleStep(): RawPattern {
  // groups of 3 with rule +1,+2,+3 repeating? Use: +1, +2, +3, +1, +2, +3
  const start = rand(1, 6);
  const steps = [1, 2, 3, 1, 2, 3];
  const arr = [start];
  for (let i = 0; i < 5; i++) arr.push(arr[arr.length - 1] + steps[i]);
  const next = arr[arr.length - 1] + steps[5];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Repeating step cycle",
    hint: "Step pattern repeats every 3 terms.",
  };
}

function divideAdd(): RawPattern {
  // start large, /2 +1 repeatedly
  const start = rand(8, 16) * 4; // ensure divisible enough
  const arr = [start];
  let cur = start;
  for (let i = 0; i < 4; i++) {
    cur = Math.floor(cur / 2) + 1;
    arr.push(cur);
  }
  const next = Math.floor(cur / 2) + 1;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Halve then +1",
    hint: "Each term = floor(previous/2) + 1.",
  };
}

function sumOfSquares(): RawPattern {
  // 1, 1+4=5, 5+9=14, 14+16=30, 30+25=55, next +36=91
  const arr = [1];
  for (let n = 2; n <= 5; n++) arr.push(arr[arr.length - 1] + n * n);
  const next = arr[arr.length - 1] + 36;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Running sum of squares",
    hint: "Add the next perfect square each time.",
  };
}

function letterReverseSkip(): RawPattern {
  // Z, X, U, Q, L → −2, −3, −4, −5, next −6
  const start = 25; // Z index
  const arr: string[] = [];
  let pos = start;
  arr.push(String.fromCharCode(65 + pos));
  for (let step = 2; step <= 5; step++) {
    pos -= step;
    arr.push(String.fromCharCode(65 + pos));
  }
  pos -= 6;
  const answer = String.fromCharCode(65 + pos);
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Growing reverse step",
    hint: "Letter goes back by 2, 3, 4, 5… each step.",
  };
}

function mixedLetterNumber(): RawPattern {
  // A2, D8, G18, J32, M50 → letters +3, numbers = 2n²
  const startIdx = rand(0, 10);
  const arr = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return `${String.fromCharCode(65 + startIdx + i * 3)}${2 * n * n}`;
  });
  const answer = `${String.fromCharCode(65 + startIdx + 15)}${2 * 36}`;
  return {
    series: arr,
    answer,
    acceptable: [answer, answer.toLowerCase()],
    name: "Letter +3, number = 2n²",
    hint: "Letter advances by 3; number follows 2n².",
  };
}

// ---------- GATE-level patterns ----------

function lucasSeries(): RawPattern {
  const arr = [2, 1];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
  const next = arr[arr.length - 1] + arr[arr.length - 2];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Lucas series",
    hint: "Like Fibonacci, but starts 2, 1.",
  };
}

function pellSeries(): RawPattern {
  const arr = [1, 2];
  for (let i = 0; i < 4; i++) arr.push(2 * arr[arr.length - 1] + arr[arr.length - 2]);
  const next = 2 * arr[arr.length - 1] + arr[arr.length - 2];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Pell recurrence",
    hint: "a(n) = 2·a(n−1) + a(n−2).",
  };
}

function catalanSeries(): RawPattern {
  return {
    series: ["1", "2", "5", "14", "42", "132"],
    answer: "429",
    acceptable: ["429"],
    name: "Catalan numbers",
    hint: "C(n) = (2n)! / (n! (n+1)!).",
  };
}

function bellSeries(): RawPattern {
  return {
    series: ["1", "1", "2", "5", "15", "52"],
    answer: "203",
    acceptable: ["203"],
    name: "Bell numbers",
    hint: "Partitions of an n-set.",
  };
}

function primesSquared(): RawPattern {
  const ps = [2, 3, 5, 7, 11, 13, 17];
  const offset = rand(0, 1);
  const arr = ps.slice(offset, offset + 5).map((p) => p * p);
  const next = ps[offset + 5] ** 2;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Squares of primes",
    hint: "Each term is the square of a prime.",
  };
}

function twoPowMinusN(): RawPattern {
  const arr = Array.from({ length: 5 }, (_, i) => 2 ** (i + 1) - (i + 1));
  const next = 2 ** 6 - 6;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "2ⁿ − n",
    hint: "2 raised to n, minus n.",
  };
}

function factorialSum(): RawPattern {
  const fact = [1, 2, 6, 24, 120, 720, 5040];
  const arr: number[] = [];
  let s = 0;
  for (let i = 0; i < 6; i++) {
    s += fact[i];
    arr.push(s);
  }
  const ans = arr[5] + fact[6];
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Σ n!",
    hint: "Running sum of factorials: 1! + 2! + … + n!.",
  };
}

function recurrence3(): RawPattern {
  const arr = [1, 3];
  for (let i = 0; i < 4; i++) arr.push(3 * arr[arr.length - 1] - arr[arr.length - 2]);
  const next = 3 * arr[arr.length - 1] - arr[arr.length - 2];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "3·a(n−1) − a(n−2)",
    hint: "Linear recurrence: 3·prev − one-before.",
  };
}

function signedSquares(): RawPattern {
  const arr = Array.from({ length: 6 }, (_, i) => (i % 2 === 0 ? 1 : -1) * (i + 1) ** 2);
  return {
    series: arr.map(String),
    answer: "49",
    acceptable: ["49"],
    name: "Alternating signed squares",
    hint: "(-1)^(n+1) · n².",
  };
}

function tetrahedral(): RawPattern {
  const arr = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return (n * (n + 1) * (n + 2)) / 6;
  });
  const ans = (6 * 7 * 8) / 6;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Tetrahedral numbers",
    hint: "n(n+1)(n+2)/6.",
  };
}

function cubeMinusN(): RawPattern {
  const arr = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return n ** 3 - n;
  });
  const ans = 6 ** 3 - 6;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "n³ − n",
    hint: "Cube of n minus n.",
  };
}

function gateMixedRecur(): RawPattern {
  const start1 = rand(1, 3);
  const start2 = rand(2, 4);
  const arr = [start1, start2];
  for (let i = 2; i < 5; i++) arr.push(arr[i - 1] + arr[i - 2] + (i + 1));
  const next = arr[4] + arr[3] + 6;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "a(n−1) + a(n−2) + n",
    hint: "Fibonacci-like, plus the current index.",
  };
}

// ---------- More patterns ----------

function evenNumbers(): RawPattern {
  const start = rand(1, 8) * 2;
  const arr = Array.from({ length: 5 }, (_, i) => start + i * 2);
  const ans = start + 10;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Even numbers",
    hint: "Consecutive even numbers.",
  };
}

function oddNumbers(): RawPattern {
  const start = rand(1, 8) * 2 + 1;
  const arr = Array.from({ length: 5 }, (_, i) => start + i * 2);
  const ans = start + 10;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Odd numbers",
    hint: "Consecutive odd numbers.",
  };
}

function multiplesOfK(): RawPattern {
  const k = rand(3, 9);
  const arr = Array.from({ length: 5 }, (_, i) => k * (i + 1));
  const ans = k * 6;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Multiples of k",
    hint: "Multiples of a single small number.",
  };
}

function countdown(): RawPattern {
  const start = rand(20, 40);
  const step = rand(2, 5);
  const arr = Array.from({ length: 5 }, (_, i) => start - i * step);
  const ans = start - 5 * step;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Countdown",
    hint: "Decreases by a fixed amount.",
  };
}

function vowelCycle(): RawPattern {
  const vowels = ["A", "E", "I", "O", "U"];
  const arr = Array.from({ length: 6 }, (_, i) => vowels[i % 5]);
  return {
    series: arr,
    answer: "E",
    acceptable: ["E", "e"],
    name: "Vowel cycle",
    hint: "Repeats the vowels A, E, I, O, U.",
  };
}

function arithGeoMix(): RawPattern {
  // a, a+d, (a+d)*r, (a+d)*r + d, ...
  const a = rand(2, 5);
  const d = rand(2, 4);
  const r = rand(2, 3);
  const arr = [a];
  for (let i = 1; i < 5; i++) {
    arr.push(i % 2 === 1 ? arr[i - 1] + d : arr[i - 1] * r);
  }
  const next = arr.length % 2 === 1 ? arr[arr.length - 1] + d : arr[arr.length - 1] * r;
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "Add then multiply",
    hint: "Alternates between +d and ×r.",
  };
}

function diffArithmetic(): RawPattern {
  // differences themselves grow arithmetically
  let cur = rand(1, 10);
  let d = rand(2, 4);
  const step = rand(1, 3);
  const arr = [cur];
  for (let i = 0; i < 4; i++) {
    cur += d;
    arr.push(cur);
    d += step;
  }
  const ans = cur + d;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Differences grow",
    hint: "Gap between terms grows by a fixed amount.",
  };
}

function powersOf3(): RawPattern {
  const start = rand(0, 2);
  const arr = Array.from({ length: 5 }, (_, i) => 3 ** (start + i));
  const ans = 3 ** (start + 5);
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Powers of 3",
    hint: "Each term is the next power of 3.",
  };
}

function letterMinusNumber(): RawPattern {
  // Z26, Y25, X24, ...
  const start = rand(20, 25);
  const arr = Array.from({ length: 4 }, (_, i) => {
    const pos = start - i;
    return `${String.fromCharCode(65 + pos)}${pos + 1}`;
  });
  const pos = start - 4;
  const ans = `${String.fromCharCode(65 + pos)}${pos + 1}`;
  return {
    series: arr,
    answer: ans,
    acceptable: [ans, ans.toLowerCase()],
    name: "Letter = position",
    hint: "Letter steps back and number equals its position.",
  };
}

function doublePlusPrev(): RawPattern {
  // a(n) = 2*a(n-1) + a(n-2) variant already exists (Pell). Here: a(n)=a(n-1)+2*a(n-2)
  const arr = [1, 2];
  for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + 2 * arr[arr.length - 2]);
  const next = arr[arr.length - 1] + 2 * arr[arr.length - 2];
  return {
    series: arr.map(String),
    answer: String(next),
    acceptable: [String(next)],
    name: "a(n−1) + 2·a(n−2)",
    hint: "Each term = previous + twice the one before.",
  };
}

function cubeSum(): RawPattern {
  // 1, 1+8=9, 9+27=36, 36+64=100, 100+125=225, next +216=441
  const arr = [1];
  for (let n = 2; n <= 5; n++) arr.push(arr[arr.length - 1] + n ** 3);
  const ans = arr[arr.length - 1] + 216;
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Running sum of cubes",
    hint: "Add the next perfect cube each time.",
  };
}

function pentagonal(): RawPattern {
  // P(n) = n(3n-1)/2 : 1, 5, 12, 22, 35, 51
  const f = (n: number) => (n * (3 * n - 1)) / 2;
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Pentagonal numbers",
    hint: "n(3n−1)/2.",
  };
}

function hexagonal(): RawPattern {
  // H(n) = n(2n-1): 1, 6, 15, 28, 45, 66
  const f = (n: number) => n * (2 * n - 1);
  const arr = Array.from({ length: 5 }, (_, i) => f(i + 1));
  const ans = f(6);
  return {
    series: arr.map(String),
    answer: String(ans),
    acceptable: [String(ans)],
    name: "Hexagonal numbers",
    hint: "n(2n−1).",
  };
}

function motzkinSeries(): RawPattern {
  // 1, 1, 2, 4, 9, 21, 51, 127
  return {
    series: ["1", "1", "2", "4", "9", "21"],
    answer: "51",
    acceptable: ["51"],
    name: "Motzkin numbers",
    hint: "Non-crossing chords on a circle.",
  };
}

function partitionSeries(): RawPattern {
  // p(n): 1,1,2,3,5,7,11,15,22
  return {
    series: ["1", "2", "3", "5", "7", "11"],
    answer: "15",
    acceptable: ["15"],
    name: "Integer partitions",
    hint: "Number of partitions of n.",
  };
}

function recamanLike(): RawPattern {
  // a(n) = a(n-1) + n if positive & new, else a(n-1)+n.  Simplified deterministic version:
  // Use Recamán prefix: 0,1,3,6,2,7,13,20
  return {
    series: ["0", "1", "3", "6", "2", "7"],
    answer: "13",
    acceptable: ["13"],
    name: "Recamán sequence",
    hint: "Subtract n if possible & unseen, else add n.",
  };
}

// ---------- Registry additions ----------

// ---------- Registry ----------

type Entry = { fn: () => RawPattern; difficulty: Difficulty };

const registry: Entry[] = [
  { fn: arithmetic, difficulty: "Easy" },
  { fn: geometric, difficulty: "Easy" },
  { fn: squares, difficulty: "Easy" },
  { fn: fibonacci, difficulty: "Easy" },
  { fn: alphabet, difficulty: "Easy" },
  { fn: letterNum, difficulty: "Easy" },
  { fn: emojiCycle, difficulty: "Easy" },
  { fn: primes, difficulty: "Easy" },
  { fn: triangular, difficulty: "Easy" },
  { fn: alternating, difficulty: "Medium" },
  { fn: quadratic, difficulty: "Medium" },
  { fn: mixedOps, difficulty: "Medium" },
  { fn: powerOfTwoPlus, difficulty: "Medium" },
  { fn: factorial, difficulty: "Medium" },
  { fn: interleaved, difficulty: "Medium" },
  { fn: digitSum, difficulty: "Medium" },
  { fn: alphabetReverse, difficulty: "Medium" },
  { fn: squarePlus, difficulty: "Medium" },
  { fn: fibMultiplied, difficulty: "Medium" },
  { fn: letterSkipCycle, difficulty: "Medium" },
  { fn: cubesShifted, difficulty: "Hard" },
  { fn: nSquarePlusOne, difficulty: "Hard" },
  { fn: diffOfDiffs, difficulty: "Hard" },
  { fn: multiplyAddIndex, difficulty: "Hard" },
  { fn: primeGap, difficulty: "Hard" },
  { fn: alternatingMulSub, difficulty: "Hard" },
  { fn: squareDiffSeries, difficulty: "Hard" },
  { fn: geometricMinus, difficulty: "Hard" },
  { fn: alphaPositionSum, difficulty: "Hard" },
  { fn: pairSum, difficulty: "Hard" },
  { fn: tripleStep, difficulty: "Hard" },
  { fn: divideAdd, difficulty: "Hard" },
  { fn: sumOfSquares, difficulty: "Hard" },
  { fn: letterReverseSkip, difficulty: "Hard" },
  { fn: mixedLetterNumber, difficulty: "Hard" },
  { fn: lucasSeries, difficulty: "GATE" },
  { fn: pellSeries, difficulty: "GATE" },
  { fn: catalanSeries, difficulty: "GATE" },
  { fn: bellSeries, difficulty: "GATE" },
  { fn: primesSquared, difficulty: "GATE" },
  { fn: twoPowMinusN, difficulty: "GATE" },
  { fn: factorialSum, difficulty: "GATE" },
  { fn: recurrence3, difficulty: "GATE" },
  { fn: signedSquares, difficulty: "GATE" },
  { fn: tetrahedral, difficulty: "GATE" },
  { fn: cubeMinusN, difficulty: "GATE" },
  { fn: gateMixedRecur, difficulty: "GATE" },
];

export function newPattern(lastName?: string): Pattern {
  return newPatternFiltered(undefined, lastName);
}

export function newPatternFiltered(
  difficulty?: Difficulty | "All",
  lastName?: string,
): Pattern {
  const pool =
    !difficulty || difficulty === "All"
      ? registry
      : registry.filter((e) => e.difficulty === difficulty);
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

export function checkAnswer(pattern: Pattern, input: string): boolean {
  const n = norm(input);
  return pattern.acceptable.some((a) => norm(a) === n);
}
