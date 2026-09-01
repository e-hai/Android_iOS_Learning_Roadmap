type ConstellationModule = typeof import('./macro/NeuralConstellationView');

let constellationModulePromise: Promise<ConstellationModule> | null = null;

/** Prefetch Three.js + constellation chunk before the user enters 3D. */
export function preload3DConstellation(): Promise<ConstellationModule> {
  if (!constellationModulePromise) {
    constellationModulePromise = import('./macro/NeuralConstellationView');
  }
  return constellationModulePromise;
}
