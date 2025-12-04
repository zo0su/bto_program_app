/**
 * 수행평가 점수 및 등급 계산 유틸리티
 * 점수 기준: 100/90/80/70/40 -> A/B/C/D/E
 */

/**
 * 최종 점수에 따라 등급 계산
 * @param {number} score - 최종 점수 (0-100)
 * @returns {string} 등급 (A, B, C, D, E)
 */
function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

/**
 * 등급에 따라 최종 점수 반환 (표준 점수)
 * @param {string} grade - 등급 (A, B, C, D, E)
 * @returns {number} 최종 점수
 */
function gradeToScore(grade) {
  const gradeMap = {
    'A': 100,
    'B': 90,
    'C': 80,
    'D': 70,
    'E': 40
  };
  return gradeMap[grade.toUpperCase()] || 0;
}

/**
 * 점수 배열을 등급 배열로 변환
 * @param {Array<number>} scores - 점수 배열
 * @returns {Array<string>} 등급 배열
 */
function scoresToGrades(scores) {
  return scores.map(score => calculateGrade(score));
}

/**
 * 수행평가 결과에 따라 최종 점수 및 등급 계산
 * @param {number} totalScore - 총 점수 (0-100)
 * @returns {Object} { finalScore, grade }
 */
function calculateAssessmentResult(totalScore) {
  // 점수를 표준 점수로 변환 (90 이상 -> 100, 80 이상 -> 90, ...)
  let finalScore;
  let grade;

  if (totalScore >= 90) {
    finalScore = 100;
    grade = 'A';
  } else if (totalScore >= 80) {
    finalScore = 90;
    grade = 'B';
  } else if (totalScore >= 70) {
    finalScore = 80;
    grade = 'C';
  } else if (totalScore >= 40) {
    finalScore = 70;
    grade = 'D';
  } else {
    finalScore = 40;
    grade = 'E';
  }

  return { finalScore, grade };
}

module.exports = {
  calculateGrade,
  gradeToScore,
  scoresToGrades,
  calculateAssessmentResult
};

