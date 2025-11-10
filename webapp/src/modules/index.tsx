'use client';

import type { ComponentType } from "react";
import type { ModuleKey } from "../lib/types";
import { ControlStudio } from "./ControlStudio";
import { Client360 } from "./Client360";
import { PolicyMatrix } from "./PolicyMatrix";
import { ClaimsCommand } from "./ClaimsCommand";
import { QuoteForge } from "./QuoteForge";
import { RevenuePulse } from "./RevenuePulse";
import { ComplianceSentinel } from "./ComplianceSentinel";
import { DocuVault } from "./DocuVault";
import { RiskInsights } from "./RiskInsights";
import { EngageHub } from "./EngageHub";
import { FlowAutomator } from "./FlowAutomator";

const modulesRegistry: Record<ModuleKey, ComponentType> = {
  controlStudio: ControlStudio,
  client360: Client360,
  policyMatrix: PolicyMatrix,
  claimsCommand: ClaimsCommand,
  quoteForge: QuoteForge,
  revenuePulse: RevenuePulse,
  complianceSentinel: ComplianceSentinel,
  docuVault: DocuVault,
  riskInsights: RiskInsights,
  engageHub: EngageHub,
  flowAutomator: FlowAutomator,
};

export default modulesRegistry;
