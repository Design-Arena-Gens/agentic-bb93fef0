import { createContext, useContext, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import type {
  Claim,
  Client,
  CommissionRecord,
  CommunicationThread,
  DocumentRecord,
  ModuleConfig,
  Partner,
  PlatformConfig,
  Policy,
  Quote,
  Workflow,
  ComplianceTask,
} from "../lib/types";

interface PlatformContextValue {
  platformConfig: PlatformConfig;
  updatePlatformConfig: (config: Partial<PlatformConfig>) => void;
  modules: ModuleConfig[];
  reorderModules: (from: number, to: number) => void;
  clients: Client[];
  upsertClient: (
    client: Partial<Client> & Pick<Client, "name" | "email"> & { id?: string },
  ) => {
    status: "created" | "updated" | "duplicate";
    record: Client;
    duplicateOf?: Client;
  };
  removeClient: (id: string) => void;
  policies: Policy[];
  upsertPolicy: (policy: Omit<Policy, "id"> & { id?: string }) => Policy;
  claims: Claim[];
  upsertClaim: (claim: Omit<Claim, "id"> & { id?: string }) => Claim;
  quotes: Quote[];
  upsertQuote: (quote: Omit<Quote, "id"> & { id?: string }) => Quote;
  commissions: CommissionRecord[];
  upsertCommission: (
    record: Omit<CommissionRecord, "id"> & { id?: string },
  ) => CommissionRecord;
  complianceTasks: ComplianceTask[];
  upsertComplianceTask: (
    task: Omit<ComplianceTask, "id"> & { id?: string },
  ) => ComplianceTask;
  documents: DocumentRecord[];
  upsertDocument: (
    file: Pick<DocumentRecord, "name" | "category" | "uploadedBy">,
    ocrExtract?: string,
  ) => DocumentRecord;
  partners: Partner[];
  upsertPartner: (partner: Omit<Partner, "id"> & { id?: string }) => Partner;
  communications: CommunicationThread[];
  upsertCommunication: (
    comm: Omit<CommunicationThread, "id"> & { id?: string },
  ) => CommunicationThread;
  workflows: Workflow[];
  upsertWorkflow: (workflow: Omit<Workflow, "id"> & { id?: string }) => Workflow;
  globalSearch: (query: string) => Array<{ id: string; label: string }>;
  aiSuggest: (field: string, context?: Record<string, string>) => string[];
  simulateOcr: (file: File) => Promise<string>;
}

const modulesCatalog: ModuleConfig[] = [
  {
    id: "controlStudio",
    name: "Control Studio",
    description: "Drag-and-drop module and branding personalization.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "🧭",
  },
  {
    id: "client360",
    name: "Client 360",
    description: "Unified client view with dedupe intelligence.",
    accent: "bg-accent-500/10 text-accent-700",
    icon: "👥",
  },
  {
    id: "policyMatrix",
    name: "Policy Matrix",
    description: "Central policy inventory with OCR attachments.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "📄",
  },
  {
    id: "claimsCommand",
    name: "Claims Command",
    description: "Advanced claims tracking and prioritization.",
    accent: "bg-accent-500/10 text-accent-700",
    icon: "⚖️",
  },
  {
    id: "quoteForge",
    name: "Quote Forge",
    description: "Guided quoting with AI premium suggestions.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "🧠",
  },
  {
    id: "revenuePulse",
    name: "Revenue Pulse",
    description: "Commission forecasting and reconciliation.",
    accent: "bg-accent-500/10 text-accent-700",
    icon: "💹",
  },
  {
    id: "complianceSentinel",
    name: "Compliance Sentinel",
    description: "Audit-ready compliance controls and checklists.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "🛡️",
  },
  {
    id: "docuVault",
    name: "DocuVault AI",
    description: "Secure document vault with instant OCR.",
    accent: "bg-accent-500/10 text-accent-700",
    icon: "🗂️",
  },
  {
    id: "riskInsights",
    name: "Risk Insights",
    description: "Portfolio analytics, loss ratios, and trend maps.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "📊",
  },
  {
    id: "engageHub",
    name: "Engage Hub",
    description: "Multichannel messaging and sentiment insights.",
    accent: "bg-primary-500/10 text-primary-700",
    icon: "💬",
  },
  {
    id: "flowAutomator",
    name: "Flow Automator",
    description: "Workflow builder and SLA orchestration.",
    accent: "bg-accent-500/10 text-accent-700",
    icon: "🚀",
  },
];

const initialConfig: PlatformConfig = {
  brandName: "SureSphere Atlas",
  theme: "Aurora",
  accentMode: "Teal",
  moduleOrder: [
    "controlStudio",
    "client360",
    "policyMatrix",
    "claimsCommand",
    "quoteForge",
    "revenuePulse",
    "complianceSentinel",
    "docuVault",
    "riskInsights",
    "engageHub",
    "flowAutomator",
  ],
  toggles: {
    aiCopilot: true,
    ocrExtraction: true,
    predictiveAlerts: true,
    sandboxMode: false,
  },
};

const initialClients: Client[] = [
  {
    id: "cli-ins-001",
    name: "Infinite Logistics Ltd.",
    email: "cover@infinitelogistics.com",
    company: "Infinite Logistics Ltd.",
    policyCount: 6,
    status: "Active",
    tags: ["Marine", "Global"],
  },
  {
    id: "cli-ins-002",
    name: "Willowbrook Medical Group",
    email: "risk@willowbrook-med.com",
    company: "Willowbrook Medical Group",
    policyCount: 4,
    status: "Prospect",
    tags: ["Healthcare", "Liability"],
  },
  {
    id: "cli-ins-003",
    name: "Skyward Retail Consortium",
    email: "coverage@skywardretail.com",
    company: "Skyward Retail Consortium",
    policyCount: 3,
    status: "Active",
    tags: ["Retail", "Cyber"],
  },
];

const initialPolicies: Policy[] = [
  {
    id: "pol-001",
    policyNumber: "SR-7789201",
    clientId: "cli-ins-001",
    carrier: "Apex Underwriters",
    product: "Global Marine Cargo",
    premium: 42000,
    effectiveDate: "2024-01-01",
    renewalDate: "2025-01-01",
    status: "Active",
  },
  {
    id: "pol-002",
    policyNumber: "SR-7789202",
    clientId: "cli-ins-002",
    carrier: "Guardian Mutual",
    product: "Medical Malpractice",
    premium: 68000,
    effectiveDate: "2023-09-15",
    renewalDate: "2024-09-15",
    status: "Active",
  },
  {
    id: "pol-003",
    policyNumber: "SR-7789203",
    clientId: "cli-ins-003",
    carrier: "Veritas Assurance",
    product: "Cyber Liability",
    premium: 27000,
    effectiveDate: "2024-03-01",
    renewalDate: "2025-03-01",
    status: "Pending",
  },
];

const initialClaims: Claim[] = [
  {
    id: "clm-001",
    policyId: "pol-001",
    clientId: "cli-ins-001",
    type: "Cargo Loss",
    amount: 125000,
    stage: "Investigating",
    handler: "Aria Patel",
    lastUpdated: "2024-04-14",
  },
  {
    id: "clm-002",
    policyId: "pol-002",
    clientId: "cli-ins-002",
    type: "Malpractice",
    amount: 85000,
    stage: "Approved",
    handler: "Marcus Lee",
    lastUpdated: "2024-04-11",
  },
];

const initialQuotes: Quote[] = [
  {
    id: "quo-001",
    clientId: "cli-ins-002",
    product: "Clinical Trials Coverage",
    coverage: 3000000,
    premiumEstimate: 91000,
    probability: 0.7,
    notes: "AI suggests bundling with cyber coverage for 12% savings.",
  },
  {
    id: "quo-002",
    clientId: "cli-ins-003",
    product: "Enterprise Retail Umbrella",
    coverage: 5000000,
    premiumEstimate: 64000,
    probability: 0.4,
    notes: "Consider seasonal endorsements for Q4 surge.",
  },
];

const initialCommissions: CommissionRecord[] = [
  {
    id: "rev-001",
    policyId: "pol-001",
    month: "2024-03",
    amount: 3800,
    status: "Received",
  },
  {
    id: "rev-002",
    policyId: "pol-002",
    month: "2024-03",
    amount: 6120,
    status: "Projected",
  },
];

const initialComplianceTasks: ComplianceTask[] = [
  {
    id: "cmp-001",
    title: "Annual carrier due-diligence pack",
    owner: "Compliance Desk",
    dueDate: "2024-05-01",
    status: "In Review",
    riskLevel: "High",
  },
  {
    id: "cmp-002",
    title: "GDPR attestation refresh",
    owner: "Risk & Legal",
    dueDate: "2024-06-10",
    status: "Open",
    riskLevel: "Medium",
  },
];

const initialDocs: DocumentRecord[] = [
  {
    id: "doc-001",
    name: "Marine_Cargo_Certificate.pdf",
    category: "Policy",
    uploadedBy: "SureSphere Atlas",
    uploadedAt: "2024-04-01",
    ocrExtract:
      "Insured: Infinite Logistics Ltd. Coverage: $2.5M. Effective: Jan 01 2024.",
  },
  {
    id: "doc-002",
    name: "Malpractice_Claim_Form.png",
    category: "Claim",
    uploadedBy: "SureSphere Atlas",
    uploadedAt: "2024-03-22",
    ocrExtract:
      "Incident: Procedure on 03/12. Claimant: Willowbrook Medical Group.",
  },
];

const initialPartners: Partner[] = [
  {
    id: "par-001",
    name: "Guardian Mutual",
    specialization: "Healthcare",
    coverageAreas: ["Medical", "Clinical Trials", "Life Sciences"],
    rating: 4.6,
    activeDeals: 14,
  },
  {
    id: "par-002",
    name: "Apex Underwriters",
    specialization: "Marine & Aviation",
    coverageAreas: ["Cargo", "Hull", "Aviation"],
    rating: 4.3,
    activeDeals: 11,
  },
];

const initialCommunications: CommunicationThread[] = [
  {
    id: "com-001",
    title: "Renewal strategy | Infinite Logistics",
    participants: ["Aria Patel", "Logistics CFO"],
    lastMessage: "Schedule risk engineering visit for May 12.",
    channel: "Portal",
    sentiment: "Positive",
  },
  {
    id: "com-002",
    title: "Quote feedback | Willowbrook Medical",
    participants: ["Marcus Lee", "Risk Director"],
    lastMessage: "Need clarification on retroactive coverage window.",
    channel: "Email",
    sentiment: "Neutral",
  },
];

const initialWorkflows: Workflow[] = [
  {
    id: "flw-001",
    name: "Large Account Onboarding",
    trigger: "New client > $1M premium",
    active: true,
    steps: [
      {
        id: "flw-001-s1",
        title: "Underwriting intake",
        owner: "Underwriting Desk",
        sla: "24 hrs",
      },
      {
        id: "flw-001-s2",
        title: "Compliance validation",
        owner: "Compliance Desk",
        sla: "48 hrs",
      },
      {
        id: "flw-001-s3",
        title: "Client activation",
        owner: "Client Success",
        sla: "24 hrs",
      },
    ],
  },
  {
    id: "flw-002",
    name: "Claims escalation loop",
    trigger: "Claim over $50k hits Investigation stage",
    active: true,
    steps: [
      {
        id: "flw-002-s1",
        title: "Assign senior adjuster",
        owner: "Claims Command",
        sla: "6 hrs",
      },
      {
        id: "flw-002-s2",
        title: "Legal review",
        owner: "Legal",
        sla: "16 hrs",
      },
    ],
  },
];

const PlatformContext = createContext<PlatformContextValue | null>(null);

const searchCorpus = <T extends { id: string }>(items: T[], labeler: (item: T) => string) =>
  items.map((item) => ({ id: item.id, label: labeler(item).toLowerCase() }));

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platformConfig, setPlatformConfig] = useState(initialConfig);
  const [clients, setClients] = useState(initialClients);
  const [policies, setPolicies] = useState(initialPolicies);
  const [claims, setClaims] = useState(initialClaims);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [complianceTasks, setComplianceTasks] = useState(initialComplianceTasks);
  const [documents, setDocuments] = useState(initialDocs);
  const [partners, setPartners] = useState(initialPartners);
  const [communications, setCommunications] = useState(initialCommunications);
  const [workflows, setWorkflows] = useState(initialWorkflows);

  const modules = useMemo(() => {
    const order = platformConfig.moduleOrder;
    const moduleMap = new Map(modulesCatalog.map((mod) => [mod.id, mod]));
    return order.map((id) => moduleMap.get(id)!).filter(Boolean);
  }, [platformConfig.moduleOrder]);

  const updatePlatformConfig = (config: Partial<PlatformConfig>) => {
    setPlatformConfig((prev) => ({
      ...prev,
      ...config,
      moduleOrder: config.moduleOrder ?? prev.moduleOrder,
      toggles: config.toggles
        ? {
            ...prev.toggles,
            ...config.toggles,
          }
        : prev.toggles,
    }));
  };

  const reorderModules = (from: number, to: number) => {
    setPlatformConfig((prev) => {
      const updated = [...prev.moduleOrder];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return { ...prev, moduleOrder: updated };
    });
  };

  const upsertClient: PlatformContextValue["upsertClient"] = (clientPayload) => {
    const dedupe = clients.find(
      (record) =>
        record.email.toLowerCase() === clientPayload.email.toLowerCase() ||
        record.name.toLowerCase() === clientPayload.name.toLowerCase(),
    );

    if (dedupe && !clientPayload.id) {
      return { status: "duplicate", record: dedupe, duplicateOf: dedupe };
    }

    if (clientPayload.id) {
      const normalizedPayload = {
        ...clientPayload,
        tags: clientPayload.tags ?? [],
        company: clientPayload.company ?? clientPayload.name,
      };
      setClients((prev) =>
        prev.map((item) =>
          item.id === clientPayload.id ? { ...item, ...normalizedPayload } : item,
        ),
      );
      const updated: Client = {
        ...(clients.find((c) => c.id === clientPayload.id) ?? {
          id: clientPayload.id,
          policyCount: 0,
          status: "Active" as const,
          tags: [],
        }),
        ...normalizedPayload,
      };
      return { status: "updated", record: updated };
    }

    const newClient: Client = {
      id: nanoid(8),
      policyCount: 0,
      status: "Prospect",
      tags: clientPayload.tags ?? [],
      company: clientPayload.company ?? clientPayload.name,
      ...clientPayload,
    };
    setClients((prev) => [newClient, ...prev]);
    return { status: "created", record: newClient };
  };

  const removeClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  const upsertPolicy: PlatformContextValue["upsertPolicy"] = (payload) => {
    if (payload.id) {
      setPolicies((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as Policy;
    }
    const record: Policy = { id: nanoid(8), ...payload };
    setPolicies((prev) => [record, ...prev]);
    setClients((prev) =>
      prev.map((client) =>
        client.id === record.clientId
          ? { ...client, policyCount: client.policyCount + 1 }
          : client,
      ),
    );
    return record;
  };

  const upsertClaim: PlatformContextValue["upsertClaim"] = (payload) => {
    if (payload.id) {
      setClaims((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as Claim;
    }
    const record: Claim = { id: nanoid(8), ...payload };
    setClaims((prev) => [record, ...prev]);
    return record;
  };

  const upsertQuote: PlatformContextValue["upsertQuote"] = (payload) => {
    if (payload.id) {
      setQuotes((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as Quote;
    }
    const record: Quote = { id: nanoid(8), ...payload };
    setQuotes((prev) => [record, ...prev]);
    return record;
  };

  const upsertCommission: PlatformContextValue["upsertCommission"] = (payload) => {
    if (payload.id) {
      setCommissions((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as CommissionRecord;
    }
    const record: CommissionRecord = { id: nanoid(8), ...payload };
    setCommissions((prev) => [record, ...prev]);
    return record;
  };

  const upsertComplianceTask: PlatformContextValue["upsertComplianceTask"] = (payload) => {
    if (payload.id) {
      setComplianceTasks((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as ComplianceTask;
    }
    const record: ComplianceTask = { id: nanoid(8), ...payload };
    setComplianceTasks((prev) => [record, ...prev]);
    return record;
  };

  const upsertDocument: PlatformContextValue["upsertDocument"] = (
    file,
    ocrExtract,
  ) => {
    const record: DocumentRecord = {
      id: nanoid(8),
      uploadedAt: new Date().toISOString().slice(0, 10),
      ...file,
      ocrExtract,
    };
    setDocuments((prev) => [record, ...prev]);
    return record;
  };

  const upsertPartner: PlatformContextValue["upsertPartner"] = (payload) => {
    if (payload.id) {
      setPartners((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as Partner;
    }
    const record: Partner = { id: nanoid(8), ...payload };
    setPartners((prev) => [record, ...prev]);
    return record;
  };

  const upsertCommunication: PlatformContextValue["upsertCommunication"] = (
    payload,
  ) => {
    if (payload.id) {
      setCommunications((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as CommunicationThread;
    }
    const record: CommunicationThread = { id: nanoid(8), ...payload };
    setCommunications((prev) => [record, ...prev]);
    return record;
  };

  const upsertWorkflow: PlatformContextValue["upsertWorkflow"] = (payload) => {
    if (payload.id) {
      setWorkflows((prev) =>
        prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)),
      );
      return payload as Workflow;
    }
    const record: Workflow = { id: nanoid(8), ...payload };
    setWorkflows((prev) => [record, ...prev]);
    return record;
  };

  const corpus = useMemo(() => {
    const items = [
      ...searchCorpus(clients, (item) => `${item.name} ${item.email}`),
      ...searchCorpus(policies, (item) => `${item.policyNumber} ${item.product}`),
      ...searchCorpus(claims, (item) => `${item.type} ${item.stage}`),
      ...searchCorpus(quotes, (item) => `${item.product} quote`),
      ...searchCorpus(partners, (item) => `${item.name} ${item.specialization}`),
      ...searchCorpus(workflows, (item) => `${item.name} ${item.trigger}`),
    ];
    return items;
  }, [clients, policies, claims, quotes, partners, workflows]);

  const globalSearch: PlatformContextValue["globalSearch"] = (query) => {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(" ").filter(Boolean);
    const scored = corpus
      .map((item) => {
        const hits = terms.reduce(
          (score, term) => (item.label.includes(term) ? score + 1 : score),
          0,
        );
        return { ...item, score: hits };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    return scored.map(({ id, label }) => ({ id, label }));
  };

  const aiSuggest: PlatformContextValue["aiSuggest"] = (field, context = {}) => {
    const map: Record<string, string[]> = {
      industry: [
        "Healthcare & Life Sciences",
        "Fintech & Digital Assets",
        "Global Logistics",
        "Retail & Omnichannel",
        "Energy & Renewables",
      ],
      coverage: [
        "Cyber Liability - Business Interruption",
        "Directors & Officers Side A/B/C",
        "Enterprise Risk Umbrella",
        "Trade Credit with Political Risk",
      ],
      carrier: [
        "Guardian Mutual",
        "Apex Underwriters",
        "Veritas Assurance",
        "Nova Sheild",
        "Atlas Syndicate 514",
      ],
      handler: ["Aria Patel", "Marcus Lee", "Jordan Miller", "Priya Desai"],
    };

    if (field === "premiumEstimate" && context.coverage) {
      const coverage = Number(context.coverage);
      if (Number.isFinite(coverage)) {
        return [
          (coverage * 0.028).toFixed(0),
          (coverage * 0.032).toFixed(0),
          (coverage * 0.036).toFixed(0),
        ];
      }
    }

    return map[field] ?? [];
  };

  const simulateOcr: PlatformContextValue["simulateOcr"] = async (file) => {
    const buffer = await file.arrayBuffer();
    const preview = new TextDecoder().decode(buffer).slice(0, 180);
    const hints = [
      "Detected coverage limits and renewal window.",
      "Identified named insured and key endorsements.",
      "Extracted claim timeline with adjuster notes.",
    ];
    return (
      `📄 ${file.name}\n` +
      `Preview: ${preview || "Binary document"}\n` +
      `Signal: ${hints[Math.floor(Math.random() * hints.length)]}`
    );
  };

  const value: PlatformContextValue = {
    platformConfig,
    updatePlatformConfig,
    modules,
    reorderModules,
    clients,
    upsertClient,
    removeClient,
    policies,
    upsertPolicy,
    claims,
    upsertClaim,
    quotes,
    upsertQuote,
    commissions,
    upsertCommission,
    complianceTasks,
    upsertComplianceTask,
    documents,
    upsertDocument,
    partners,
    upsertPartner,
    communications,
    upsertCommunication,
    workflows,
    upsertWorkflow,
    globalSearch,
    aiSuggest,
    simulateOcr,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used within PlatformProvider");
  }
  return ctx;
};
