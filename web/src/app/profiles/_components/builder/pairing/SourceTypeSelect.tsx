"use client";

import {
  Select as UISelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SourceValueType } from "@/types/MappingProfile";

interface Props {
  value: SourceValueType;
  onChange: (val: string) => void;
  sourceCols: string[];
  isPK: boolean;
  disabled: boolean;
}

export function SourceTypeSelect({
  value,
  onChange,
  sourceCols,
  isPK,
  disabled,
}: Props) {
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
