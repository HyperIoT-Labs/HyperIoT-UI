// jsdom has no canvas; xeokit (from `components`) needs a 2D context on load.
HTMLCanvasElement.prototype.getContext = function (contextId: string) {
  return contextId === '2d' ? ({} as CanvasRenderingContext2D) : null;
} as typeof HTMLCanvasElement.prototype.getContext;
