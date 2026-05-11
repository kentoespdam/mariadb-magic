"use client";

import { useEffect, useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import { commands } from "@/lib/commands";
import { Dialog, DialogContent } from "./ui/dialog";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: (typeof commands)[number]) => {
    setOpen(false);
    command.run();
  };

  const groupedCommands = commands.reduce(
    (acc, cmd) => {
      const group = cmd.group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(cmd);
      return acc;
    },
    {} as Record<string, typeof commands>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-lg border shadow-2xl w-[500px]">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([group, cmds]) => (
              <CommandGroup key={group} heading={group}>
                {cmds.map((cmd) => (
                  <CommandItem key={cmd.id} onSelect={() => runCommand(cmd)}>
                    <cmd.icon className="mr-2 h-4 w-4" />
                    {cmd.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
