"use client";

export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      className="text-sm text-muted-foreground border rounded px-2 py-1"
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        )
      }
    >
      Cmd+K
    </button>
  );
}
