import { PropsWithChildren } from "react";

import { ReactQueryProvider } from "./ReactQueryProvider";
import { TelegramBootstrap } from "./telegram/telegram-bootstrap";
import BProgressProvider from "./BProgressProvider";

export async function Providers({ children }: PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <BProgressProvider>
        <TelegramBootstrap />
        {children}
      </BProgressProvider>
    </ReactQueryProvider>
  );
}
