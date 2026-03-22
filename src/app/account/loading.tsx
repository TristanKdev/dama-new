export default function AccountLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-dama-cream">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dama-sand border-t-dama-green-500" />
        <p className="mt-4 text-sm text-dama-charcoal/50">Loading account...</p>
      </div>
    </div>
  );
}
