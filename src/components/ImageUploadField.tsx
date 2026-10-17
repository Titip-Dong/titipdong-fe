import { ShoppingBagIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CreateUploadRequestPurpose } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { IMAGE_TYPES, imageProblem, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

type State =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "done" }
  | { kind: "error"; message: string; file?: File };

/**
 * Square photo field: pick or drop an image, upload it right away, and report the upload ID through
 * `onChange`. `onBusyChange` lets the form disable its submit button while a file is uploading.
 */
export function ImageUploadField({
  label,
  purpose,
  onChange,
  onBusyChange,
  initialUrl,
  className,
}: {
  label: string;
  purpose: CreateUploadRequestPurpose;
  onChange: (uploadId: string | undefined) => void;
  onBusyChange?: (busy: boolean) => void;
  initialUrl?: string;
  className?: string;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(initialUrl);
  const [state, setState] = useState<State>({ kind: initialUrl ? "done" : "idle" });
  const [dragging, setDragging] = useState(false);

  useEffect(
    () => () => void (preview?.startsWith("blob:") && URL.revokeObjectURL(preview)),
    [preview],
  );

  const start = async (file: File) => {
    const problem = imageProblem(file);
    if (problem) {
      setState({ kind: "error", message: problem });
      return;
    }
    setPreview(URL.createObjectURL(file));
    setState({ kind: "uploading", progress: 0 });
    onChange(undefined);
    onBusyChange?.(true);
    try {
      const id = await uploadImage(file, purpose, (progress) =>
        setState({ kind: "uploading", progress }),
      );
      setState({ kind: "done" });
      onChange(id);
    } catch {
      setState({ kind: "error", message: "Fotonya gagal diunggah. Coba lagi, ya.", file });
    } finally {
      onBusyChange?.(false);
    }
  };

  const clear = () => {
    setPreview(undefined);
    setState({ kind: "idle" });
    onChange(undefined);
    if (input.current) input.current.value = "";
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) void start(file);
        }}
        className={cn(
          "relative flex aspect-square w-full max-w-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted text-muted-foreground transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
          dragging && "border-primary bg-secondary",
          preview && "border-solid",
        )}
      >
        {preview ? (
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-4 text-center text-sm">
            <ShoppingBagIcon className="size-8" strokeWidth={1.5} aria-hidden />
            Pilih atau tarik foto ke sini
          </span>
        )}
        {state.kind === "uploading" && (
          <span className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-card">
            <span
              className="block h-full bg-primary transition-[width]"
              style={{ width: `${Math.round(state.progress * 100)}%` }}
            />
          </span>
        )}
        <input
          ref={input}
          id={inputId}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void start(file);
          }}
        />
      </label>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {state.kind === "uploading"
          ? `Mengunggah ${Math.round(state.progress * 100)}%...`
          : "JPG, PNG, atau WebP, maksimal 5 MB."}
      </p>
      {state.kind === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      {(state.kind === "done" || state.kind === "error") && (
        <div className="flex flex-wrap gap-2">
          {state.kind === "error" && state.file && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => state.file && void start(state.file)}
            >
              Coba lagi
            </Button>
          )}
          {state.kind === "done" && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => input.current?.click()}
              >
                Ganti foto
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clear}>
                Hapus
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
