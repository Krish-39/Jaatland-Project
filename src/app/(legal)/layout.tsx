export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
