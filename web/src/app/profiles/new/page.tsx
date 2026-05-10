"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConnectionOption {
  id: string;

  name: string;
  host: string;
  port: number;
  username: string;
  database: string;
  ssl: boolean;
}

interface SourceTargetSelectorProps {
  connections: ConnectionOption[];
  selectedSource: string | null;
  selectedTarget: string | null;
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
}

function SourceTargetSelector({
  connections,
  selectedSource,
  selectedTarget,
  onSelectSource,
  onSelectTarget,
}: SourceTargetSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Pilih Source</h3>
          <div className="space-y-3">
            <Label htmlFor="source-connection">Koneksi Source</Label>
            <Select onValueChange={onSelectSource} value={selectedSource || ""}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih koneksi source" />
              </SelectTrigger>
              <SelectContent>
                {connections
                  .filter((conn) => conn.id === selectedSource)
                  .map((conn) => (
                    <SelectItem key={conn.id} value={conn.id}>
                      {conn.name} ({conn.host}:{conn.port})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="target-connection">Koneksi Target</Label>
            <Select onValueChange={onSelectTarget} value={selectedTarget || ""}>
              <SelectContent>
                <SelectItem value="target1">Target 1</SelectItem>
                <SelectItem value="target2">Target 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Buat Mapping Profile Baru</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SourceTargetSelector />
        </div>
      </div>
    </div>
  );
}
