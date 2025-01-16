export function findCompetitionById(compId, dataCtx) {
  return dataCtx.competitions.find((comp) => comp.id === compId) || null;
}

export function getNestedValue(obj, path, fallback = null) {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);
}
