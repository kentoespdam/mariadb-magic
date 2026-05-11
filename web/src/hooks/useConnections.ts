import useSWR from "swr";
import { connectionService } from "../lib/services/connections";
import type {
  Connection,
  ConnectionInput,
  ConnectionUpdateInput,
} from "../types/Connection";

export function useConnections() {
  return useSWR("connections/list", () => connectionService.list());
}

export function useConnection(id: string) {
  return useSWR(id ? `connections/${id}` : null, () =>
    id ? connectionService.get(id) : Promise.resolve(null),
  );
}

export async function createConnection(
  input: ConnectionInput,
): Promise<Connection> {
  return connectionService.create(input);
}

export async function updateConnection(
  id: string,
  input: ConnectionUpdateInput,
): Promise<Connection> {
  return connectionService.update(id, input);
}

export async function deleteConnection(
  id: string,
  opts?: { cascade?: boolean },
): Promise<void> {
  return connectionService.delete(id, opts);
}
