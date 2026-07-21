export interface PerformanceCriterionDefinition {
  id: string;
  criterion: string;
}

const criterionIdPattern = /(?<!\d)(\d+\.\d+)\s+/g;
const trailingSectionsPattern = /\b(Evidence Requirements|Knowledge Evidence|Performance Evidence|Foundation Skills|Assessment Conditions)\b/i;

function cleanCriterionText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function removeTrailingSections(text: string) {
  const match = trailingSectionsPattern.exec(text);

  if (!match || match.index <= 0) {
    return text;
  }

  return text.slice(0, match.index).trim();
}

export function extractPerformanceCriteria(unitText: string): PerformanceCriterionDefinition[] {
  const matches = Array.from(unitText.matchAll(criterionIdPattern));
  const seen = new Set<string>();
  const criteria: PerformanceCriterionDefinition[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const id = match[1]?.trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? unitText.length;
    const segment = unitText.slice(start, end);
    const criterion = cleanCriterionText(removeTrailingSections(segment));

    if (!id || !criterion || seen.has(id)) {
      continue;
    }

    seen.add(id);
    criteria.push({ id, criterion });
  }

  return criteria;
}

export function formatCriteriaForPrompt(criteria: PerformanceCriterionDefinition[]) {
  return JSON.stringify(criteria, null, 2);
}