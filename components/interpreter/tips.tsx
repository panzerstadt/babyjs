export const Tips = () => {
  return (
    <ul className="transition-opacity group-hover:opacity-100 opacity-20">
      <li>arrow-up to navigate input history</li>
      <li>cmd + a, arrow-left to go to the beginning</li>
      <li>
        opt + arrows to jump per-word {"("}whitespace separated{")"}
      </li>
    </ul>
  );
};
