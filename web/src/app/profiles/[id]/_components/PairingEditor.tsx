/**
 * PairingEditor.tsx
 *
 * Komponen untuk mengatur pemetaan kolom (column pairing) per tabel.
 * Mendukung 5 tipe sumber nilai sesuai ADR-0023.
 */

"use client";

import { useState, useMemo } from "react";
import type {
  MappingProfile,
  SchemaResponse,
  ProfileMappings,
  ColumnPairing,
  SourceValueType,
  TableMapping,
  Rule,
} from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { mutate } from "swr";
import { cn } from "@/lib/utils";
import { RuleEditorDialog } from "./RuleEditorDialog";
import { Button } from "@/components/ui/button";

import {
  Select as UISelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PairingEditorProps {
  profile: MappingProfile;
  schema: SchemaResponse;
  tableName: string;
}

export function PairingEditor({
  profile,
  schema,
  tableName,
}: PairingEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [ruleEditorOpen, setRuleEditorOpen] = useState(false);
  const [ruleEditorCol, setRuleEditorCol] = useState<{
    destColumn: string;
    sourceColumn: string;
  } | null>(null);

  const rules = useMemo(() => {
    try {
      return JSON.parse(profile.rules_json || "{}");
    } catch {
      return {};
    }
  }, [profile.rules_json]);

  const getExistingRule = (destCol: string): Rule | undefined => {
    const tableRules = rules[tableName];
    if (tableRules && tableRules[destCol]) {
      return tableRules[destCol] as Rule;
    }
    return undefined;
  };

  const handleSaveRule = async (rule: Rule | undefined) => {
    const newRules = JSON.parse(JSON.stringify(rules));
    if (!newRules[tableName]) {
      newRules[tableName] = {};
    }
    if (rule) {
      newRules[tableName][ruleEditorCol!.destColumn] = rule;
    } else {
      delete newRules[tableName][ruleEditorCol!.destColumn];
    }
    setIsSaving(true);
    try {
      await profileService.updatePairings(
        profile.id,
        JSON.stringify(mappings),
        JSON.stringify(newRules),
      );
      await mutate(`/api/profiles/${profile.id}`);
    } catch (err) {
      console.error("Gagal menyimpan rule:", err);
    } finally {
      setIsSaving(false);
      setRuleEditorOpen(false);
      setRuleEditorCol(null);
    }
  };

  const openRuleEditor = (destCol: string, sourceCol: string) => {
    setRuleEditorCol({ destColumn: destCol, sourceColumn: sourceCol });
    setRuleEditorOpen(true);
  };

  const mappings = useMemo<ProfileMappings>(() => {
    try {
      return JSON.parse(profile.column_pairings_json || '{"tables":[]}');
    } catch {
      return { tables: [] };
    }
  }, [profile.column_pairings_json]);

  const tableMapping = useMemo(() => {
    let tm = mappings.tables.find((t) => t.table_name === tableName);
    if (!tm) {
      tm = generateDefaultMapping(tableName, schema);
    }
    return tm;
  }, [mappings, tableName, schema]);

  const sourceCols = useMemo(() => {
    const tableSchema = schema.source_schema[tableName];
    return tableSchema ? Object.keys(tableSchema) : [];
  }, [schema, tableName]);

  const updatePairing = async (
    colName: string,
    updates: Partial<ColumnPairing>,
  ) => {
    const newMappings: ProfileMappings = JSON.parse(JSON.stringify(mappings));
    let tm = newMappings.tables.find((t) => t.table_name === tableName);

    if (!tm) {
      tm = generateDefaultMapping(tableName, schema);
      newMappings.tables.push(tm);
    }

    tm.column_pairs = tm.column_pairs.map((cp) =>
      cp.dest_column === colName
        ? { ...cp, ...updates, status: "resolved" }
        : cp,
    );

    // Update counts
    tm.unresolved_cnt = tm.column_pairs.filter(
      (cp) => cp.status === "unresolved",
    ).length;

    setIsSaving(true);
    try {
      await profileService.updatePairings(
        profile.id,
        JSON.stringify(newMappings),
        profile.rules_json || "{}",
      );
      await mutate(`/api/profiles/${profile.id}`);
    } catch (err) {
      console.error("Gagal menyimpan pairing:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border bg-surface">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-text-secondary uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b w-[200px]">Kolom Tujuan</th>
              <th className="px-4 py-3 border-b w-[240px]">Sumber Nilai</th>
              <th className="px-4 py-3 border-b">Detail / Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tableMapping.column_pairs.map((cp) => (
              <tr
                key={cp.dest_column}
                className={cn(
                  "group transition-colors",
                  cp.status === "unresolved"
                    ? "bg-warning/5"
                    : "hover:bg-muted/30",
                )}
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2 pt-1">
                    {cp.is_pk && <span title="Primary Key">🔑</span>}
                    <span className="font-mono font-medium">
                      {cp.dest_column}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top space-y-2">
                  <SourceTypeSelect
                    value={cp.source_type}
                    onChange={(val) =>
                      updatePairing(cp.dest_column, {
                        source_type: val as SourceValueType,
                      })
                    }
                    sourceCols={sourceCols}
                    isPK={cp.is_pk}
                    disabled={isSaving}
                  />

                  {cp.source_type === "column" && (
                    <UISelect
                      value={cp.source_column || ""}
                      onValueChange={(val) =>
                        updatePairing(cp.dest_column, { source_column: val })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Pilih kolom source..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceCols.map((sc) => (
                          <SelectItem key={sc} value={sc} className="text-xs">
                            {sc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </UISelect>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  {cp.source_type === "constant" && (
                    <input
                      type="text"
                      className="w-full h-8 px-2 text-xs border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                      value={cp.constant_val || ""}
                      onChange={(e) =>
                        updatePairing(cp.dest_column, {
                          constant_val: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        updatePairing(cp.dest_column, {
                          constant_val: e.target.value,
                        })
                      }
                      placeholder="Nilai konstanta..."
                      disabled={isSaving}
                    />
                  )}
                  <DetailLabel cp={cp} />
                  {cp.source_type === "column" && cp.source_column && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-[11px] text-primary hover:text-primary/80"
                      onClick={() =>
                        openRuleEditor(cp.dest_column, cp.source_column!)
                      }
                      disabled={isSaving}
                    >
                      Aturan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RuleEditorDialog
        open={ruleEditorOpen}
        onOpenChange={(open) => {
          setRuleEditorOpen(open);
          if (!open) setRuleEditorCol(null);
        }}
        sourceConnectionId={profile.source_connection_id}
        tableName={tableName}
        columnName={ruleEditorCol?.destColumn || ""}
        sourceColumn={ruleEditorCol?.sourceColumn || ""}
        existingRule={
          ruleEditorCol ? getExistingRule(ruleEditorCol.destColumn) : undefined
        }
        onSave={handleSaveRule}
      />
    </div>
  );
}

function SourceTypeSelect({
  value,
  onChange,
  sourceCols,
  isPK,
  disabled,
}: {
  value: SourceValueType;
  onChange: (val: string) => void;
  sourceCols: string[];
  isPK: boolean;
  disabled: boolean;
}) {
  return (
    <UISelect value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue placeholder="Pilih tipe sumber..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-[10px]">Basis Data</SelectLabel>
          <SelectItem
            value="column"
            className="text-xs"
            disabled={sourceCols.length === 0}
          >
            Dari Kolom Source
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-[10px]">Opsi Khusus</SelectLabel>
          <SelectItem value="constant" className="text-xs" disabled={isPK}>
            Konstanta
          </SelectItem>
          <SelectItem value="null" className="text-xs" disabled={isPK}>
            Kosongkan / NULL
          </SelectItem>
          <SelectItem value="default_db" className="text-xs" disabled={isPK}>
            Default DB
          </SelectItem>
          <SelectItem value="skip" className="text-xs" disabled={isPK}>
            Lewati (Jangan Disentuh)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </UISelect>
  );
}

function DetailLabel({ cp }: { cp: ColumnPairing }) {
  switch (cp.source_type) {
    case "null":
      return (
        <span className="text-[11px] text-text-muted italic pt-1 inline-block">
          Selalu diset NULL
        </span>
      );
    case "default_db":
      return (
        <span className="text-[11px] text-text-muted italic pt-1 inline-block">
          Gunakan default skema
        </span>
      );
    case "skip":
      return (
        <span className="text-[11px] text-blue-600/70 italic pt-1 inline-block">
          Pertahankan nilai Destination
        </span>
      );
    case "column":
      if (!cp.source_column)
        return (
          <span className="text-[11px] text-warning italic pt-1 inline-block">
            Belum dipilih
          </span>
        );
      return null;
    default:
      if (cp.status === "unresolved") {
        return (
          <span className="text-[11px] text-warning font-medium pt-1 inline-block">
            Wajib diisi
          </span>
        );
      }
      return null;
  }
}

function generateDefaultMapping(
  tableName: string,
  schema: SchemaResponse,
): TableMapping {
  const destSchema = schema.dest_schema[tableName] || {};
  const sourceSchema = schema.source_schema[tableName] || {};
  const sourceCols = Object.keys(sourceSchema);

  const pairs: ColumnPairing[] = Object.keys(destSchema).map((destCol) => {
    const colInfo = destSchema[destCol];
    // Auto-match by name (case-insensitive)
    const match = sourceCols.find(
      (sc) => sc.toLowerCase() === destCol.toLowerCase(),
    );

    return {
      dest_column: destCol,
      is_pk: colInfo.IsPK,
      source_type: (match ? "column" : "unresolved") as SourceValueType,
      source_column: match,
      status: match ? "auto" : "unresolved",
    } as ColumnPairing;
  });

  return {
    table_name: tableName,
    column_pairs: pairs,
    unresolved_cnt: pairs.filter((cp) => cp.status === "unresolved").length,
    total_cols: pairs.length,
  };
}
