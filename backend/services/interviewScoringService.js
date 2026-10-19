/**
 * Aggregate overall interview performance deterministically from per-question evaluations
 */
const aggregateInterviewReport = (evaluations = []) => {
  if (!evaluations || evaluations.length === 0) {
    return {
      overallScore: 0,
      averageScores: {
        relevance: 0,
        clarity: 0,
        star: 0,
        technicalAccuracy: 0,
        completeness: 0
      },
      overallStrengths: ['Completed mock interview session.'],
      overallWeaknesses: ['Complete more questions to identify patterns.']
    };
  }

  const count = evaluations.length;
  let totalOverall = 0;
  let totalRelevance = 0;
  let totalClarity = 0;
  let totalStar = 0;
  let totalTech = 0;
  let totalCompleteness = 0;

  const allStrengths = [];
  const allWeaknesses = [];

  evaluations.forEach((ev) => {
    totalOverall += ev.overallScore || 0;
    totalRelevance += ev.relevanceScore || 0;
    totalClarity += ev.clarityScore || 0;
    totalStar += ev.starScore || 0;
    totalTech += ev.technicalAccuracyScore || 0;
    totalCompleteness += ev.completenessScore || 0;

    if (Array.isArray(ev.strengths)) allStrengths.push(...ev.strengths);
    if (Array.isArray(ev.weaknesses)) allWeaknesses.push(...ev.weaknesses);
  });

  const overallScore = Math.round((totalOverall / count) * 10) / 10;

  // Deduplicate and aggregate key strengths and recurring weaknesses
  const strengthCounts = {};
  allStrengths.forEach((s) => {
    strengthCounts[s] = (strengthCounts[s] || 0) + 1;
  });
  const overallStrengths = Object.keys(strengthCounts)
    .sort((a, b) => strengthCounts[b] - strengthCounts[a])
    .slice(0, 4);

  const weaknessCounts = {};
  allWeaknesses.forEach((w) => {
    weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
  });
  const overallWeaknesses = Object.keys(weaknessCounts)
    .sort((a, b) => weaknessCounts[b] - weaknessCounts[a])
    .slice(0, 4);

  return {
    overallScore,
    averageScores: {
      relevance: Math.round(totalRelevance / count),
      clarity: Math.round(totalClarity / count),
      star: Math.round(totalStar / count),
      technicalAccuracy: Math.round(totalTech / count),
      completeness: Math.round(totalCompleteness / count)
    },
    overallStrengths: overallStrengths.length > 0 ? overallStrengths : ['Demonstrated foundational domain awareness.'],
    overallWeaknesses: overallWeaknesses.length > 0 ? overallWeaknesses : ['Add more verified metrics and explicit results.']
  };
};

module.exports = {
  aggregateInterviewReport
};
