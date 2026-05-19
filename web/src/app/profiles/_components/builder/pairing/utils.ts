/**
 * Helper murni untuk parsing & default mapping.
 * Dipisah dari komponen agar mudah di-test dan menjaga cap line file.
 */

import type {
  ColumnPairing,
  ProfileMappings,
  SchemaResponse,
  SourceValueType,
  TableMapping,
  MappingProfile,
  Rule,
} from "@/types/MappingProfile";

export function parseMappings(
  raw: MappingProfile["column_pairings_json"],
): ProfileMappings {
  if (typeof raw === "object" && raw !== null) return raw as ProfileMappings;
  try {
    return JSON.parse(raw || '{"tables":[]}');
  } catch {
    return { tables: [] };
  }
}

export function parseRules(
  raw: MappingProfile["rules_json"],
): Record<string, Record<string, Rule>> {
  if (typeof raw === "object" && raw !== null)
    return raw as Record<string, Record<string, Rule>>;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export function generateDefaultMapping(
  tableName: string,
  schema: SchemaResponse,
): TableMapping {
  const destSchema = schema.dest_schema[tableName] || {};
  const sourceSchema = schema.source_schema[tableName] || {};
  const sourceCols = Object.keys(sourceSchema);

  const pairs: ColumnPairing[] = Object.keys(destSchema).map((destCol) => {
    const colInfo = destSchema[destCol];
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

export function findOrCreateTableMapping(
  mappings: ProfileMappings,
  tableName: string,
  schema: SchemaResponse,
): TableMapping {
  const existing = mappings.tables.find((t) => t.table_name === tableName);
  return existing ?? generateDefaultMapping(tableName, schema);
}
