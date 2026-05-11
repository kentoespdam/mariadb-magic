import { useCallback, useState } from "react";
import { connectionService } from "../lib/services/connections";
import { mutate } from "swr";

export function useDeleteConnection() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteConnection = useCallback(
    async (id: string, opts?: { cascade?: boolean }) => {
      setIsDeleting(true);
      try {
        await connectionService.delete(id, opts);
        await mutate("connections/list");
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  return { deleteConnection, isDeleting };
}
