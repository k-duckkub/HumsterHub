export type GameProps = {
  /** Called exactly once per mount. The shell advances the challenge on it. */
  onFinish: (win: boolean) => void;
  reduced: boolean;
};
