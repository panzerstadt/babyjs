export const Container: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="relative bg-stone-900 w-full h-full text-slate-300 sm:rounded-lg p-6 border border-zinc-200 text-sm font-mono">
      {children}
    </div>
  );
};
