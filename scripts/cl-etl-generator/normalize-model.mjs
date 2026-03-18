function toFeatureName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export function normalizeModel(parsed) {
  return {
    source: {
      type: 'jdl',
      path: parsed.jdlPath,
    },
    architecture: 'etl',
    entities: parsed.entities.map((name) => ({
      name,
      featureName: toFeatureName(name),
    })),
    enums: parsed.enums.map((name) => ({
      name,
    })),
  };
}
