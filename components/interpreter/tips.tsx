const TIPS = [
  "arrow-up/down to navigate input history",
  "cmd + a, arrow-left to go to the beginning",
  "opt + arrows to jump per-word (whitespace separated)",
];

const GRADIENT = [
  "opacity-50",
  "opacity-40",
  "opacity-30",
  "opacity-25",
  "opacity-20",
  "opacity-10",
  "opacity-5",
];

export const Tips = () => {
  return (
    <ul className="select-none">
      {TIPS.map((t, i) => {
        const opacity = GRADIENT[i] || GRADIENT[GRADIENT.length - 1];

        return (
          <li
            key={i}
            className={`${opacity} group-hover:opacity-100 transition-opacity delay-75 duration-300`}
          >
            {t}
          </li>
        );
      })}
    </ul>
  );
};
