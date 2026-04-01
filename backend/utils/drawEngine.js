const getRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums);
};

const getAlgorithmicNumbers = (users) => {
  const freq = {};
  users.forEach((u) => {
    u.scores.forEach((s) => {
      freq[s.score] = (freq[s.score] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const nums = new Set(sorted.slice(0, 5).map((v) => Number(v[0])));
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums);
};

const matchCount = (drawNumbers, userScores) => {
  const latestScores = [...userScores].slice(0, 5).map((x) => x.score);
  return latestScores.filter((n) => drawNumbers.includes(n)).length;
};

module.exports = { getRandomNumbers, getAlgorithmicNumbers, matchCount };
