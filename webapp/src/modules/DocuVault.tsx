'use client';

import { useState } from "react";
import { usePlatform } from "../context/PlatformContext";

export function DocuVault() {
  const { documents, upsertDocument, simulateOcr } = usePlatform();
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    const extract = await simulateOcr(file);
    const record = upsertDocument(
      {
        name: file.name,
        category: file.type.includes("pdf") ? "Policy" : "Claim",
        uploadedBy: "You",
      },
      extract,
    );
    setProcessing(false);
    setMessage(`Document ${record.name} stored with OCR insights.`);
    setOcrPreview(extract);
    event.target.value = "";
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-neutral-800">DocuVault AI</h2>
          <p className="text-sm text-neutral-500">
            Secure storage with instant OCR, smart categorization and quick recall.
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
          {processing ? "Processing..." : "Upload File"}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleUpload}
            className="hidden"
            disabled={processing}
          />
        </label>
      </div>

      {ocrPreview && (
        <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-4 text-sm text-primary-700">
          <h3 className="font-heading text-lg text-primary-800">OCR Snapshot</h3>
          <pre className="mt-2 whitespace-pre-wrap text-xs">{ocrPreview}</pre>
        </div>
      )}

      {message && (
        <p className="mt-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <article
            key={document.id}
            className="rounded-2xl border border-neutral-100 bg-white/80 p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg text-neutral-800">
                  {document.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  {document.category} · Uploaded {document.uploadedAt}
                </p>
              </div>
              <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                OCR Ready
              </span>
            </header>
            <p className="mt-4 text-sm text-neutral-500">
              {document.ocrExtract
                ? document.ocrExtract.slice(0, 160)
                : "No OCR data captured yet. Upload to extract."}
            </p>
            <footer className="mt-4 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-600">
                AI insight:
              </span>{" "}
              {document.category === "Policy"
                ? "Suggest renewals 45 days before expiry."
                : "Flag claim for legal review if severity rises."}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
