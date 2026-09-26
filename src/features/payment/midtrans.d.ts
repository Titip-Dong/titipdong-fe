// Minimal types for Midtrans Snap, loaded via <script> in index.html.
// https://docs.midtrans.com/reference/snap-js

interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  transaction_status: string;
  [key: string]: unknown;
}

interface SnapPayOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

interface Window {
  snap?: {
    pay: (snapToken: string, options?: SnapPayOptions) => void;
  };
}
