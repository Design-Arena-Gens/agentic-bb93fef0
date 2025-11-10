'use client';

import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { PlatformProvider } from "../context/PlatformContext";
import type { ModuleKey } from "../lib/types";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("controlStudio");

  return (
    <PlatformProvider>
      <AppShell activeModule={activeModule} onModuleChange={setActiveModule} />
    </PlatformProvider>
  );
}
