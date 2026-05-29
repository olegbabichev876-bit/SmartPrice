import type { ParseState } from "../types/tracker";

interface Props {
  state: ParseState;
}

export default function ParseBanner({ state }: Props) {
  return (
    <div className="pt-parse">
      <span className="pt-spin" />
      <span>{state.text}</span>
      <div className="pt-parse-dots">
        {[0, 1, 2].map((n) => (
          <i
            key={n}
            className={state.step > n ? "done" : state.step === n ? "now" : ""}
          />
        ))}
      </div>
    </div>
  );
}
