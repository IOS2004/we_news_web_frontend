/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_CASHFREE_APP_ID: string;
  readonly VITE_CASHFREE_MODE: "sandbox" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
