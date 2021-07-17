export const delay = (ms: number = 1000) => {
  return new Promise<void>((rs, rj) => {
    setTimeout(() => {
      rs();
    }, ms);
  });
};
