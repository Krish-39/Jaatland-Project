// Shown on every page. The site looks like a shop, so it has to say plainly
// that it is not one: nothing here can actually be bought.
export function DemoBanner({ showcase = false }: { showcase?: boolean }) {
  return (
    <div
      role="note"
      className="border-b-2 border-[#1a1815] bg-brand px-4 py-1.5 text-center text-xs font-medium text-[#1a1815]"
    >
      <strong className="font-semibold">Demo store.</strong> Orders are not
      fulfilled and no real payment is taken.
      {showcase && " Sign-in and checkout are switched off in this deployment."}
    </div>
  );
}
