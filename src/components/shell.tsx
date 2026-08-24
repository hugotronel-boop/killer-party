import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { type ReactNode, useState } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: true, retry: 1, staleTime: 1500 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <div className="grain flex min-h-dvh w-full justify-center bg-bg text-fg">
        <div className="flex min-h-dvh w-full max-w-md flex-col">{children}</div>
      </div>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-fg)",
            border: "1px solid var(--color-border)",
            fontFamily: "Outfit, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  );
}
