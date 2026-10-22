import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  getGetPayoutAccountQueryKey,
  getGetWalletQueryKey,
  getListMyPayoutsQueryKey,
  getListWalletTransactionsQueryKey,
  useGetPayoutAccount,
  useGetWallet,
  useListMyPayouts,
  useListWalletTransactions,
  useRequestPayout,
  useSavePayoutAccount,
} from "@/api/generated/endpoints/payment/payment";
import { ApiError } from "@/api/client";
import { SavePayoutAccountBody, RequestPayoutBody } from "@/api/generated/zod/payment/payment.zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, setFieldErrors } from "@/lib/api-error";
import { formatDateTime, formatRupiah } from "@/lib/format";

type AccountValues = z.infer<typeof SavePayoutAccountBody>;
type PayoutValues = z.infer<typeof RequestPayoutBody>;

export function Component() {
  const client = useQueryClient();
  const wallet = useGetWallet();
  const account = useGetPayoutAccount();
  const payouts = useListMyPayouts({ limit: 20 });
  const ledger = useListWalletTransactions({ limit: 20 });
  const save = useSavePayoutAccount();
  const request = useRequestPayout();
  const [editing, setEditing] = useState(false);
  const accountForm = useForm<AccountValues>({ resolver: zodResolver(SavePayoutAccountBody) });
  const payoutForm = useForm<PayoutValues>({ resolver: zodResolver(RequestPayoutBody) });
  const missingAccount = account.error instanceof ApiError && account.error.status === 404;

  async function refreshMoney() {
    await Promise.all([
      client.invalidateQueries({ queryKey: getGetWalletQueryKey() }),
      client.invalidateQueries({ queryKey: getGetPayoutAccountQueryKey() }),
      client.invalidateQueries({ queryKey: getListMyPayoutsQueryKey() }),
      client.invalidateQueries({ queryKey: getListWalletTransactionsQueryKey() }),
    ]);
  }
  async function submitAccount(values: AccountValues) {
    try {
      await save.mutateAsync({ data: values });
      await refreshMoney();
      setEditing(false);
      toast.success("Rekening pencairan tersimpan.");
    } catch (error) {
      if (!setFieldErrors(error, accountForm.setError)) toast.error(errorMessage(error));
    }
  }
  async function submitPayout(values: PayoutValues) {
    try {
      await request.mutateAsync({ data: values });
      payoutForm.reset();
      await refreshMoney();
      toast.success("Permintaan pencairan dikirim ke admin.");
    } catch (error) {
      toast.error(
        errorMessage(error, {
          404: "Simpan rekening pencairan terlebih dahulu.",
          409: "Saldo tersedia tidak cukup atau kamu masih punya payout yang diproses.",
        }),
      );
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Saldo & pencairan</h1>
        <p className="mt-1 text-muted-foreground">
          Pantau pendapatan, atur rekening, dan ajukan payout.
        </p>
      </header>
      {wallet.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : wallet.isError || !wallet.data ? (
        <p role="alert" className="text-destructive">
          Saldo gagal dimuat. Muat ulang halaman, ya.
        </p>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Saldo pendapatan</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {formatRupiah(wallet.data.balance)}
            </p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Tersedia untuk payout</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {formatRupiah(wallet.data.available)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Dalam escrow {formatRupiah(wallet.data.inEscrow)} · permintaan berjalan{" "}
              {formatRupiah(wallet.data.pendingPayout)}
            </p>
          </article>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h2 className="text-xl font-bold">Rekening pencairan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin mentransfer ke rekening ini. Detail disalin saat kamu mengajukan payout.
            </p>
          </div>
          {account.isPending ? (
            <Skeleton className="h-20" />
          ) : missingAccount || editing ? (
            <form
              className="space-y-4"
              noValidate
              onSubmit={accountForm.handleSubmit((values) => void submitAccount(values))}
            >
              <Field data-invalid={!!accountForm.formState.errors.bankName}>
                <FieldLabel htmlFor="bankName">Nama bank</FieldLabel>
                <Input
                  id="bankName"
                  autoComplete="off"
                  {...accountForm.register("bankName")}
                  aria-invalid={!!accountForm.formState.errors.bankName}
                />
                <FieldError errors={[accountForm.formState.errors.bankName]} />
              </Field>
              <Field data-invalid={!!accountForm.formState.errors.accountNumber}>
                <FieldLabel htmlFor="accountNumber">Nomor rekening</FieldLabel>
                <Input
                  id="accountNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  {...accountForm.register("accountNumber")}
                  aria-invalid={!!accountForm.formState.errors.accountNumber}
                />
                <FieldDescription>5–30 digit angka.</FieldDescription>
                <FieldError errors={[accountForm.formState.errors.accountNumber]} />
              </Field>
              <Field data-invalid={!!accountForm.formState.errors.accountName}>
                <FieldLabel htmlFor="accountName">Nama pemilik rekening</FieldLabel>
                <Input
                  id="accountName"
                  autoComplete="name"
                  {...accountForm.register("accountName")}
                  aria-invalid={!!accountForm.formState.errors.accountName}
                />
                <FieldError errors={[accountForm.formState.errors.accountName]} />
              </Field>
              <div className="flex gap-2">
                <Button disabled={save.isPending}>
                  {save.isPending ? "Menyimpan..." : "Simpan rekening"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          ) : account.data ? (
            <div className="space-y-3">
              <p className="font-medium">
                {account.data.bankName} · {account.data.accountNumber}
              </p>
              <p className="text-sm text-muted-foreground">Atas nama {account.data.accountName}</p>
              <Button
                variant="outline"
                onClick={() => {
                  accountForm.reset(account.data);
                  setEditing(true);
                }}
              >
                Ubah rekening
              </Button>
            </div>
          ) : (
            <p role="alert" className="text-sm text-destructive">
              Rekening gagal dimuat. Coba muat ulang.
            </p>
          )}
        </div>
        <form
          className="space-y-4 rounded-xl border bg-card p-5"
          noValidate
          onSubmit={payoutForm.handleSubmit((values) => void submitPayout(values))}
        >
          <div>
            <h2 className="text-xl font-bold">Ajukan payout</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Satu permintaan payout dapat diproses dalam satu waktu.
            </p>
          </div>
          <Field data-invalid={!!payoutForm.formState.errors.amount}>
            <FieldLabel htmlFor="amount">Nominal (rupiah)</FieldLabel>
            <Input
              id="amount"
              type="number"
              min={1}
              step={1}
              max={wallet.data?.available}
              inputMode="numeric"
              {...payoutForm.register("amount", { valueAsNumber: true })}
              aria-invalid={!!payoutForm.formState.errors.amount}
            />
            <FieldDescription>
              Maksimal {wallet.data ? formatRupiah(wallet.data.available) : "saldo tersedia"}.
            </FieldDescription>
            <FieldError errors={[payoutForm.formState.errors.amount]} />
          </Field>
          {request.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(request.error, {
                404: "Simpan rekening pencairan terlebih dahulu.",
                409: "Saldo tersedia tidak cukup atau ada payout yang masih diproses.",
              })}
            </p>
          )}
          <Button disabled={request.isPending || missingAccount || !wallet.data?.available}>
            {request.isPending ? "Mengirim..." : "Ajukan pencairan"}
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Riwayat payout</h2>
        {payouts.isPending ? (
          <Skeleton className="h-28" />
        ) : payouts.isError ? (
          <p role="alert" className="text-destructive">
            Riwayat payout gagal dimuat.
          </p>
        ) : payouts.data.items.length === 0 ? (
          <p className="rounded-xl border bg-card p-5 text-muted-foreground">
            Belum ada permintaan payout.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {payouts.data.items.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-3 p-4">
                <div>
                  <p className="font-medium tabular-nums">
                    {formatRupiah(item.amount)} · {item.bankName} · {item.accountNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diajukan {formatDateTime(item.requestedAt)}
                    {item.reference
                      ? ` · Referensi ${item.reference}`
                      : item.rejectionReason
                        ? ` · ${item.rejectionReason}`
                        : ""}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm capitalize">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Riwayat saldo</h2>
        {ledger.isPending ? (
          <Skeleton className="h-28" />
        ) : ledger.isError ? (
          <p role="alert" className="text-destructive">
            Riwayat saldo gagal dimuat.
          </p>
        ) : ledger.data.items.length === 0 ? (
          <p className="rounded-xl border bg-card p-5 text-muted-foreground">
            Belum ada transaksi saldo. Dana akan tercatat setelah pesanan selesai.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {ledger.data.items.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {item.kind === "release" ? "Dana pesanan cair" : "Payout"}
                    {item.orderCode ? ` · ${item.orderCode}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </div>
                <p
                  className={`font-semibold tabular-nums ${item.direction === "credit" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {item.direction === "credit" ? "+" : "−"}
                  {formatRupiah(item.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
