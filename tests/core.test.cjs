const assert = require('node:assert/strict');
const { impact, findMoments, nextReplayCase } = require('../.cache/core-check/analysis.js');
const { practiceForTrip } = require('../.cache/core-check/practice.js');
const cases = require('../src/data/nazirkar_cases.json');

assert.equal(cases.length, 4, 'the bundle should have four replay excerpts');
assert.deepEqual(cases.map((item) => item.case), [1, 2, 3, 4]);
assert.deepEqual(cases.map((item) => item.sourceFile), ['1_20210317_184512.csv', '1_20210317_184512.csv', '2_20210317_171452.csv', '2_20210317_171452.csv']);
assert.equal(cases[0].originalReadingCount + cases[1].originalReadingCount, 6646);
assert.equal(cases[2].originalReadingCount + cases[3].originalReadingCount, 7603);
for (const item of cases) {
  assert.equal(item.points[0].t, 0);
  assert.ok(item.points.length > 300);
  assert.ok(item.points.at(-1).distance > 500);
  assert.ok(!('latitude' in item.points[0]) && !('longitude' in item.points[0]), 'coordinates should not be bundled');
}
assert.ok(cases[0].sourceWindow.slice(9) < cases[1].sourceWindow.slice(0, 8));
assert.ok(cases[2].sourceWindow.slice(9) < cases[3].sourceWindow.slice(0, 8));
assert.equal(nextReplayCase([]), 1);
for (let last = 1; last <= 4; last++) {
  assert.equal(nextReplayCase([{ source: 'live' }, { source: 'recorded', recordedCase: last }]), last % 4 + 1);
}
assert.equal(new Set(cases.map((item) => practiceForTrip({ recordedCase: item.case }).title)).size, 4, 'each recorded case needs a different tip');

const estimate = impact(16093.44, { mpg: 25, pricePerGallon: 3.5, label: 'Test gasoline car' });
assert.ok(estimate);
assert.equal(estimate.gallons, 0.4);
assert.ok(Math.abs(estimate.cost - 1.4) < 1e-10);
assert.ok(Math.abs(estimate.co2Kg - 3.5548) < 1e-10);
assert.equal(impact(null, { mpg: 25, pricePerGallon: null, label: 'Test' }), null);
assert.equal(impact(1609.344, { mpg: null, pricePerGallon: null, label: 'Test' }), null);

const momentCounts = cases.map((item) => {
  const points = item.points.map(({ t, speed, distance, motion }) => ({ t, speedMps: speed, distanceM: distance, motionMagnitude: motion }));
  return findMoments(points).length;
});
assert.ok(momentCounts.every((count) => count > 0), 'each excerpt should have a moment to review');
assert.equal(findMoments([{ t: 0, motionMagnitude: 4 }, { t: 1, motionMagnitude: 6 }]).length, 0, 'motion alone cannot identify braking');
console.log(`Core checks passed: estimate, replay cycle, and moments in four excerpts (${momentCounts.join(', ')}).`);
