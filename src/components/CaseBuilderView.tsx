"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { nextCaseId } from "@/lib/cases";
import {
  CONFIDENCE_STYLES,
  EVIDENCE_LABELS,
  EVIDENCE_OPTIONS,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/lib/colors";
import type { Confidence, Entity, EntityType, Relation, RelationType } from "@/lib/types";
import { useActiveCase, useAppStore } from "@/store/useAppStore";

type BuilderTab = "entities" | "clues";
const NEW_CASE = "__new__";
const fieldClass =
  "w-full rounded-md border border-slate-700 bg-ink-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400/60";
const labelClass = "mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500";

export function CaseBuilderView() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const selectCase = useAppStore((s) => s.selectCase);
  const createCase = useAppStore((s) => s.createCase);
  const flash = useAppStore((s) => s.flash);
  const clearFlash = useAppStore((s) => s.clearFlash);
  const active = useActiveCase();

  const [selector, setSelector] = useState(activeCaseId);
  const [tab, setTab] = useState<BuilderTab>("entities");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [caseDate, setCaseDate] = useState(() => localToday());
  const [caseErrors, setCaseErrors] = useState<Record<string, string>>({});

  const previewId = nextCaseId(cases);
  const showNew = selector === NEW_CASE;

  return (
    <main className="min-h-[calc(100vh-57px)]">
      <DisclaimerBanner />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300/80">
          Investigator workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">Case builder</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Add synthetic entities and clues to a case. Every create, edit, and delete is SHA-256 chained
          into the audit trail. The live graph reads this same in-memory case file.
        </p>

        {flash && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} />
              {flash.message}
            </span>
            <span className="flex items-center gap-3">
              <Link
                href={`/live-graph?case=${encodeURIComponent(flash.caseId)}`}
                className="font-medium text-cyan-200 underline-offset-2 hover:underline"
              >
                View in live graph
              </Link>
              <button type="button" onClick={clearFlash} className="text-emerald-200/70 hover:text-white">
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        <section className="mt-6 rounded-xl border border-slate-800 bg-ink-850/40 p-4">
          <label className={labelClass} htmlFor="case-select">
            Case
          </label>
          <select
            id="case-select"
            value={selector}
            onChange={(e) => {
              const value = e.target.value;
              setSelector(value);
              if (value !== NEW_CASE) selectCase(value);
            }}
            className={`${fieldClass} max-w-xl`}
          >
            {cases.map((item) => (
              <option key={item.id} value={item.id}>
                Case #{item.id} — {item.title}
              </option>
            ))}
            <option value={NEW_CASE}>+ New case</option>
          </select>

          {showNew ? (
            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!caseTitle.trim()) errors.title = "Case title is required.";
                if (!caseDate) errors.dateOpened = "Date opened is required.";
                setCaseErrors(errors);
                if (Object.keys(errors).length) return;
                const id = createCase({
                  title: caseTitle,
                  description: caseDescription,
                  dateOpened: caseDate,
                });
                if (id) {
                  setSelector(id);
                  setCaseTitle("");
                  setCaseDescription("");
                  setTab("entities");
                }
              }}
            >
              <Field label="Case ID (auto)">
                <input value={previewId} readOnly className={`${fieldClass} text-slate-400`} />
              </Field>
              <Field label="Date opened" error={caseErrors.dateOpened}>
                <input
                  type="date"
                  value={caseDate}
                  onChange={(e) => setCaseDate(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Case title" error={caseErrors.title} className="sm:col-span-2">
                <input
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="e.g. Synthetic follow-up: inland desk"
                  className={fieldClass}
                />
              </Field>
              <Field label="Short description" className="sm:col-span-2">
                <textarea
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  rows={2}
                  placeholder="One-paragraph brief. Synthetic only."
                  className={fieldClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
                >
                  Create case
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              {active.id} · opened {active.dateOpened} · {active.entities.length} entities ·{" "}
              {active.relations.length} clues
              {active.description ? ` — ${active.description}` : ""}
            </p>
          )}
        </section>

        {!showNew && (
          <>
            <div className="mt-6 flex gap-1 border-b border-slate-800">
              {(
                [
                  ["entities", "Entities"],
                  ["clues", "Clues / Evidence"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-t-md px-4 py-2 text-sm ${
                    tab === id
                      ? "bg-ink-850 text-cyan-200"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "entities" ? <EntitiesTab /> : <CluesTab />}
          </>
        )}
      </div>
    </main>
  );
}

function EntitiesTab() {
  const active = useActiveCase();
  const addEntity = useAppStore((s) => s.addEntity);
  const updateEntity = useAppStore((s) => s.updateEntity);
  const removeEntity = useAppStore((s) => s.removeEntity);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entity | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [type, setType] = useState<EntityType>("person");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setOpen(false);
    setEditing(null);
    setType("person");
    setLabel("");
    setNotes("");
    setErrors({});
  }

  function startEdit(entity: Entity) {
    setEditing(entity);
    setType(entity.type);
    setLabel(entity.label);
    setNotes(entity.notes);
    setOpen(true);
    setErrors({});
  }

  return (
    <section className="rounded-b-xl border border-t-0 border-slate-800 bg-ink-850/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">People, phones, vehicles, locations, and organisations in this case.</p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setType("person");
            setLabel("");
            setNotes("");
            setOpen(true);
            setErrors({});
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
        >
          <Plus size={14} /> Add entity
        </button>
      </div>

      {open && (
        <form
          className="mt-4 grid gap-3 rounded-lg border border-slate-800 bg-ink-900 p-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next: Record<string, string> = {};
            if (!label.trim()) next.label = "Entity name or identifier is required.";
            setErrors(next);
            if (Object.keys(next).length) return;
            const ok = editing
              ? updateEntity(editing.id, { type, label, notes })
              : Boolean(addEntity({ type, label, notes }));
            if (ok) reset();
          }}
        >
          <p className="sm:col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {editing ? `Edit ${editing.id}` : "New entity"}
          </p>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value as EntityType)} className={fieldClass}>
              {Object.entries(TYPE_LABELS).map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name or identifier" error={errors.label}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Nisha Varghese (SYNTH)"
              className={fieldClass}
            />
          </Field>
          <Field label="Notes / description" className="sm:col-span-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Role, why they are in the case. Synthetic only."
              className={fieldClass}
            />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
            >
              {editing ? "Save entity" : "Add entity"}
            </button>
            <button type="button" onClick={reset} className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-850 font-mono text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Name / ID</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {active.entities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                  No entities yet. Add a person, phone, vehicle, location, or organisation.
                </td>
              </tr>
            )}
            {active.entities.map((entity, i) => (
              <tr key={entity.id} className={i % 2 === 0 ? "bg-ink-900" : "bg-ink-850/40"}>
                <td className="px-3 py-2">
                  <p className="text-slate-100">{entity.label}</p>
                  <p className="font-mono text-[11px] text-slate-500">{entity.id}</p>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[entity.type] }} />
                    {TYPE_LABELS[entity.type]}
                  </span>
                </td>
                <td className="max-w-md px-3 py-2 text-xs text-slate-400">{entity.notes || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(entity)}
                      className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
                      aria-label={`Edit ${entity.label}`}
                    >
                      <Pencil size={13} />
                    </button>
                    {pendingId === entity.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          removeEntity(entity.id);
                          setPendingId(null);
                        }}
                        className="rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-200"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingId(entity.id)}
                        className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-rose-400/40 hover:text-rose-200"
                        aria-label={`Remove ${entity.label}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CluesTab() {
  const active = useActiveCase();
  const addClue = useAppStore((s) => s.addClue);
  const updateClue = useAppStore((s) => s.updateClue);
  const removeClue = useAppStore((s) => s.removeClue);
  const entitiesById = useMemo(
    () => Object.fromEntries(active.entities.map((e) => [e.id, e])),
    [active.entities],
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Relation | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState<RelationType>("call");
  const [description, setDescription] = useState("");
  const [confidence, setConfidence] = useState<Confidence | "">("");
  const [sourceRef, setSourceRef] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setOpen(false);
    setEditing(null);
    setSource("");
    setTarget("");
    setType("call");
    setDescription("");
    setConfidence("");
    setSourceRef("");
    setErrors({});
  }

  function startEdit(rel: Relation) {
    setEditing(rel);
    setSource(rel.source);
    setTarget(rel.target);
    setType(rel.type);
    setDescription(rel.description);
    setConfidence(rel.confidence);
    setSourceRef(rel.sourceRef);
    setOpen(true);
    setErrors({});
  }

  return (
    <section className="rounded-b-xl border border-t-0 border-slate-800 bg-ink-850/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Evidence edges. A new clue becomes a link on the live graph for this case.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          disabled={active.entities.length < 2}
          className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} /> Add clue
        </button>
      </div>
      {active.entities.length < 2 && (
        <p className="mt-2 text-xs text-amber-200/80">Add at least two entities before logging a clue.</p>
      )}

      {open && (
        <form
          className="mt-4 grid gap-3 rounded-lg border border-slate-800 bg-ink-900 p-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next: Record<string, string> = {};
            if (!source) next.source = "Pick a from-entity.";
            if (!target) next.target = "Pick a to-entity.";
            if (source && target && source === target) {
              next.target = "A clue must link two different entities.";
            }
            if (!confidence) next.confidence = "Confidence is required.";
            setErrors(next);
            if (Object.keys(next).length) return;
            const payload = {
              source,
              target,
              type,
              description,
              confidence: confidence as Confidence,
              sourceRef,
            };
            const ok = editing ? updateClue(editing.id, payload) : Boolean(addClue(payload));
            if (ok) reset();
          }}
        >
          <p className="sm:col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {editing ? `Edit ${editing.id}` : "New clue"}
          </p>
          <Field label="From entity" error={errors.source}>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={fieldClass}>
              <option value="">Select…</option>
              {active.entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.label} ({entity.id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="To entity" error={errors.target}>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={fieldClass}>
              <option value="">Select…</option>
              {active.entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.label} ({entity.id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Evidence type">
            <select value={type} onChange={(e) => setType(e.target.value as RelationType)} className={fieldClass}>
              {EVIDENCE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {EVIDENCE_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Confidence" error={errors.confidence}>
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as Confidence | "")}
              className={fieldClass}
            >
              <option value="">Select…</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field label="Description of the clue" className="sm:col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What this evidence shows. Synthetic only."
              className={fieldClass}
            />
          </Field>
          <Field label="Source reference" className="sm:col-span-2">
            <input
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder='e.g. "CDR log page 4"'
              className={fieldClass}
            />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
            >
              {editing ? "Save clue" : "Add clue"}
            </button>
            <button type="button" onClick={reset} className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-850 font-mono text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Linked entities</th>
              <th className="px-3 py-2">Evidence type</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {active.relations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No clues yet. Link two entities with a call, transaction, statement, or other evidence.
                </td>
              </tr>
            )}
            {active.relations.map((rel, i) => (
              <tr key={rel.id} className={i % 2 === 0 ? "bg-ink-900" : "bg-ink-850/40"}>
                <td className="px-3 py-2 text-xs text-slate-200">
                  <p>{entitiesById[rel.source]?.label ?? rel.source}</p>
                  <p className="text-slate-500">→ {entitiesById[rel.target]?.label ?? rel.target}</p>
                  <p className="font-mono text-[10px] text-slate-600">{rel.id}</p>
                </td>
                <td className="px-3 py-2 text-xs text-slate-300">
                  {EVIDENCE_LABELS[rel.type] ?? rel.type}
                </td>
                <td className="max-w-sm px-3 py-2 text-xs text-slate-400">{rel.description || "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                      CONFIDENCE_STYLES[rel.confidence] ?? ""
                    }`}
                  >
                    {rel.confidence}
                  </span>
                </td>
                <td className="max-w-[10rem] px-3 py-2 text-xs text-slate-500">{rel.sourceRef || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(rel)}
                      className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
                      aria-label={`Edit ${rel.id}`}
                    >
                      <Pencil size={13} />
                    </button>
                    {pendingId === rel.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          removeClue(rel.id);
                          setPendingId(null);
                        }}
                        className="rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-200"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingId(rel.id)}
                        className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-rose-400/40 hover:text-rose-200"
                        aria-label={`Remove ${rel.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
