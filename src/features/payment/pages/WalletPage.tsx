import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetPayoutAccount,
  useGetWallet,
  useListMyPayouts,
  useListWalletTransactions,
  useRequestPayout,
  useSavePayoutAccount,
} from "@/api/generated/endpoints/payment/payment";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatRupiah } from "@/lib/format";

export function Component() {
  const client = useQueryClient();
  const wallet = useGetWallet();
  const account = useGetPayoutAccount();
  const payouts = useListMyPayouts({ limit: 50 });
  const ledger = useListWalletTransactions({ limit: 50 });
  const save = useSavePayoutAccount();
  const request = useRequestPayout();
  const [bankName, setBankName] = useState<string | undefined>();
  const [accountNumber, setAccountNumber] = useState<string | undefined>();
  const [accountName, setAccountName] = useState<string | undefined>();
  const [amount, setAmount] = useState("");
  const noAccount = account.error instanceof ApiError && account.error.status === 404;

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await save.mutateAsync({
        data: {
          bankName: (bankName ?? account.data?.bankName ?? "").trim(),
          accountNumber: accountNumber ?? account.data?.accountNumber ?? "",
          accountName: (accountName ?? account.data?.accountName ?? "").trim(),
        },
      });
      await client.invalidateQueries();
      toast.success("Rekening pencairan tersimpan.");
    } catch {
      toast.error("Rekening gagal disimpan. Pastikan nomor rekening berisi 5–30 digit.");
    }
  }
  async function requestPayout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isSafeInteger(value) || value <= 0) return;
    try {
      await request.mutateAsync({ data: { amount: value } });
      setAmount("");
      await client.invalidateQueries();
      toast.success("Permintaan pencairan dikirim ke admin.");
    } catch {
      toast.error(
        "Permintaan gagal. Cek saldo tersedia dan pastikan tidak ada permintaan lain yang masih diproses.",
      );
    }
  }

  const balance = wallet.data;
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-4xl font-bold">Saldo & pencairan</h1>
        <p className="mt-2 text-muted-foreground">
          Atur rekening dan ajukan pencairan pendapatanmu.
        </p>
      </header>
      {wallet.isPending ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : wallet.isError || !balance ? (
        <p className="text-destructive">Saldo gagal dimuat.</p>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Pendapatan bersih yang sudah cair dari escrow
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{formatRupiah(balance.balance)}</p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Bisa diminta sekarang</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {formatRupiah(balance.available)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Dalam escrow {formatRupiah(balance.inEscrow)} · menunggu payout{" "}
              {formatRupiah(balance.pendingPayout)}
            </p>
          </article>
        </section>
      )}
      <section className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveAccount} className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h2 className="text-xl font-bold">Rekening pencairan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rekening disalin ke setiap permintaan payout.
            </p>
          </div>
          {account.isPending ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="bankName">Nama bank</FieldLabel>
                <Input
                  id="bankName"
                  required
                  maxLength={100}
                  value={bankName ?? (noAccount ? "" : (account.data?.bankName ?? ""))}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BCA, Mandiri, BNI..."
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="accountNumber">Nomor rekening</FieldLabel>
                <Input
                  id="accountNumber"
                  inputMode="numeric"
                  pattern="[0-9]{5,30}"
                  required
                  value={accountNumber ?? (noAccount ? "" : (account.data?.accountNumber ?? ""))}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="accountName">Nama pemilik rekening</FieldLabel>
                <Input
                  id="accountName"
                  required
                  maxLength={100}
                  value={accountName ?? (noAccount ? "" : (account.data?.accountName ?? ""))}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </Field>
              <Button disabled={save.isPending}>
                {save.isPending
                  ? "Menyimpan..."
                  : noAccount
                    ? "Simpan rekening"
                    : "Perbarui rekening"}
              </Button>
            </>
          )}
        </form>
        <form onSubmit={requestPayout} className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h2 className="text-xl font-bold">Minta pencairan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin mentransfer ke rekeningmu lalu memperbarui status di aplikasi.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="payoutAmount">Nominal (rupiah)</FieldLabel>
            <Input
              id="payoutAmount"
              type="number"
              min={1}
              step={1}
              max={balance?.available}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 250000"
            />
          </Field>
          <Button
            disabled={request.isPending || account.isPending || noAccount || !balance?.available}
          >
            {request.isPending ? "Mengirim..." : "Ajukan pencairan"}
          </Button>
        </form>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Permintaan payout</h2>
        {payouts.isPending ? (
          <Skeleton className="h-32" />
        ) : payouts.isError ? (
          <p className="text-destructive">Riwayat payout gagal dimuat.</p>
        ) : payouts.data.items.length === 0 ? (
          <p className="rounded-xl border bg-card p-5 text-muted-foreground">
            Belum ada permintaan payout.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {payouts.data.items.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {formatRupiah(p.amount)} · {p.bankName} · {p.accountNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diajukan {formatDateTime(p.requestedAt)}
                    {p.reference
                      ? ` · Referensi ${p.reference}`
                      : p.rejectionReason
                        ? ` · ${p.rejectionReason}`
                        : ""}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm capitalize">
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Riwayat saldo</h2>
        {ledger.isPending ? (
          <Skeleton className="h-32" />
        ) : ledger.isError ? (
          <p className="text-destructive">Riwayat saldo gagal dimuat.</p>
        ) : ledger.data.items.length === 0 ? (
          <p className="rounded-xl border bg-card p-5 text-muted-foreground">
            Belum ada pergerakan saldo. Dana akan tercatat setelah pesanan selesai.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {ledger.data.items.map((entry) => (
              <li key={entry.id} className="flex flex-wrap justify-between gap-2 p-4">
                <div>
                  <p className="font-medium capitalize">
                    {entry.kind === "release" ? "Dana pesanan cair" : "Payout"}
                    {entry.orderCode ? ` · ${entry.orderCode}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                </div>
                <p
                  className={`font-semibold tabular-nums ${entry.direction === "credit" ? "text-green-700" : "text-muted-foreground"}`}
                >
                  {entry.direction === "credit" ? "+" : "−"}
                  {formatRupiah(entry.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
