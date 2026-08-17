import { PropsWithChildren } from "react";

import { ReactQueryProvider } from "./ReactQueryProvider";
import { TelegramBootstrap } from "./telegram/telegram-bootstrap";

export async function Providers({ children }: PropsWithChildren) {
  return <ReactQueryProvider><TelegramBootstrap />{children}</ReactQueryProvider>;
}
