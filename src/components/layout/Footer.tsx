export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} TITIP DONG</span>
        <span>Dana ditahan sampai barang diterima.</span>
      </div>
    </footer>
  );
}
