/**
 * RuleEditorDialog.tsx
 *
 * Dialog untuk mengedit aturan transformasi (Rule) per pairing.
 * Mendukung live preview dari basis data.
 */

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Rule, RuleType, PreviewResult } from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

interface RuleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceConnectionId: string;
  tableName: string;
  columnName: string;
  sourceColumn: string;
  existingRule?: Rule;
  onSave: (rule: Rule | undefined) => void;
}

export function RuleEditorDialog({
  open,
  onOpenChange,
  sourceConnectionId,
  tableName,
  columnName,
  sourceColumn,
  existingRule,
  onSave,
}: RuleEditorDialogProps) {
  const [rule, setRule] = useState<Rule>({
    type: "cast",
    cast: { target_type: "string" },
  });
  const [preview, setPreview] = useState<PreviewResult[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingRule) setRule(existingRule);
      else setRule({ type: "cast", cast: { target_type: "string" } });
    }
  }, [open, existingRule]);

  useEffect(() => {
    if (!open || !sourceColumn || !sourceConnectionId) return;

    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const results = await profileService.previewRule({
          rule,
          source_connection_id: sourceConnectionId,
          table: tableName,
          column: sourceColumn,
        });
        setPreview(results);
      } catch (err) {
        console.error("Preview failed:", err);
      } finally {
        setIsPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [rule, open, sourceColumn, sourceConnectionId, tableName]);

  const handleTypeChange = (type: RuleType) => {
    const newRule: Rule = { type };
    if (type === "cast") newRule.cast = { target_type: "string" };
    if (type === "enum_map")
      newRule.enum_map = { mapping: {}, fallback: "null" };
    if (type === "regex_replace")
      newRule.regex_replace = { pattern: "", replacement: "" };
    if (type === "string_op") newRule.string_op = { operation: "trim" };
    if (type === "date_format")
      newRule.date_format = {
        input_layout: "2006-01-02 15:04:05",
        output_layout: "2006-01-02",
        on_parse_error: "null",
      };
    setRule(newRule);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Transformasi: {columnName}
            </h2>
            <p className="text-sm text-text-muted">
              Atur bagaimana nilai dari source ({sourceColumn}) diubah sebelum
              masuk ke destination.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Tipe Rule</Label>
              <Select
                value={rule.type}
                onValueChange={(v) => handleTypeChange(v as RuleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cast">Ubah Tipe (Cast)</SelectItem>
                  <SelectItem value="enum_map">Enum Map</SelectItem>
                  <SelectItem value="regex_replace">Regex Replace</SelectItem>
                  <SelectItem value="string_op">Operasi String</SelectItem>
                  <SelectItem value="date_format">Format Tanggal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 min-h-[120px]">
              {rule.type === "cast" && rule.cast && (
                <div className="space-y-2">
                  <Label>Target Tipe</Label>
                  <Select
                    value={rule.cast.target_type}
                    onValueChange={(v: "string" | "int" | "float" | "bool") =>
                      setRule({ ...rule, cast: { target_type: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="float">Float</SelectItem>
                      <SelectItem value="bool">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {rule.type === "string_op" && rule.string_op && (
                <div className="space-y-2">
                  <Label>Operasi</Label>
                  <Select
                    value={rule.string_op.operation}
                    onValueChange={(
                      v: "trim" | "upper" | "lower" | "substring",
                    ) => setRule({ ...rule, string_op: { operation: v } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trim">Trim (Buang spasi)</SelectItem>
                      <SelectItem value="upper">UPPERCASE</SelectItem>
                      <SelectItem value="lower">lowercase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {rule.type === "enum_map" && rule.enum_map && (
                <div className="space-y-3">
                  <Label>Mapping (JSON)</Label>
                  <textarea
                    className="w-full h-24 p-2 text-xs font-mono border rounded bg-background"
                    value={JSON.stringify(rule.enum_map.mapping)}
                    onChange={(e) => {
                      try {
                        const mapping = JSON.parse(e.target.value);
                        if (rule.enum_map) {
                          setRule({
                            ...rule,
                            enum_map: { ...rule.enum_map, mapping },
                          });
                        }
                      } catch {}
                    }}
                  />
                  <div className="space-y-1.5">
                    <Label>Fallback</Label>
                    <Select
                      value={rule.enum_map.fallback}
                      onValueChange={(v: "null" | "original" | "fail") => {
                        if (rule.enum_map) {
                          setRule({
                            ...rule,
                            enum_map: { ...rule.enum_map, fallback: v },
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Set NULL</SelectItem>
                        <SelectItem value="original">
                          Gunakan Aslinya
                        </SelectItem>
                        <SelectItem value="fail">Gagalkan Baris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {rule.type === "regex_replace" && rule.regex_replace && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Pattern (Regex)</Label>
                    <Input
                      value={rule.regex_replace.pattern}
                      onChange={(e) => {
                        if (rule.regex_replace) {
                          setRule({
                            ...rule,
                            regex_replace: {
                              ...rule.regex_replace,
                              pattern: e.target.value,
                            },
                          });
                        }
                      }}
                      placeholder="^prefix(.*)$"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Replacement</Label>
                    <Input
                      value={rule.regex_replace.replacement}
                      onChange={(e) => {
                        if (rule.regex_replace) {
                          setRule({
                            ...rule,
                            regex_replace: {
                              ...rule.regex_replace,
                              replacement: e.target.value,
                            },
                          });
                        }
                      }}
                      placeholder="$1"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              {rule.type === "date_format" && rule.date_format && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Input Format</Label>
                    <Input
                      value={rule.date_format.input_layout}
                      onChange={(e) => {
                        if (rule.date_format) {
                          setRule({
                            ...rule,
                            date_format: {
                              ...rule.date_format,
                              input_layout: e.target.value,
                            },
                          });
                        }
                      }}
                      placeholder="2006-01-02 15:04:05"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Output Format</Label>
                    <Input
                      value={rule.date_format.output_layout}
                      onChange={(e) => {
                        if (rule.date_format) {
                          setRule({
                            ...rule,
                            date_format: {
                              ...rule.date_format,
                              output_layout: e.target.value,
                            },
                          });
                        }
                      }}
                      placeholder="02/01/2006"
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Preview (5 Data Teratas)
              </Label>
              <div className="rounded-md border bg-surface-subtle overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Source</th>
                      <th className="px-3 py-1.5 font-semibold">Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((p, i) => (
                      <tr
                        key={`${i}-${p.source_value}`}
                        className="bg-background"
                      >
                        <td className="px-3 py-1.5 font-mono text-text-muted">
                          {p.source_value === null
                            ? "NULL"
                            : String(p.source_value)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-1.5 font-mono",
                            p.status === "error"
                              ? "text-destructive"
                              : "text-primary font-medium",
                          )}
                        >
                          {p.status === "error"
                            ? p.error || "Error"
                            : p.dest_value === null
                              ? "NULL"
                              : String(p.dest_value)}
                        </td>
                      </tr>
                    ))}
                    {preview.length === 0 && !isPreviewLoading && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-4 text-center italic text-text-muted"
                        >
                          Tidak ada data sampel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave(undefined)}
              className="text-destructive hover:bg-destructive/10"
            >
              Hapus Aturan
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={() => onSave(rule)}>Simpan Aturan</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
