import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Check, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface BuyerRecord {
  id: number;
  name: string;
  supplierType: string;
  contactName?: string | null;
  accountNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface BuyerComboboxProps {
  farmId: string | number;
  types: string[];
  valueId: number | null;
  valueName: string;
  onChange: (id: number | null, name: string) => void;
  onChangeFull?: (record: BuyerRecord | null) => void;
  required?: boolean;
  placeholder?: string;
  typeLabel?: string;
  disabled?: boolean;
  postAddNavigatePath?: string;
}

export function BuyerCombobox({
  farmId,
  types,
  valueId,
  valueName,
  onChange,
  onChangeFull,
  required,
  placeholder = "Search or select...",
  typeLabel = "Contact",
  disabled,
  postAddNavigatePath,
}: BuyerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addAccount, setAddAccount] = useState("");
  const [goToContacts, setGoToContacts] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const qKey = ["buyers", String(farmId), types.join(",")];

  const { data } = useQuery<{ records: BuyerRecord[] }>({
    queryKey: qKey,
    queryFn: () =>
      fetch(`/api/farms/${farmId}/buyers?types=${encodeURIComponent(types.join(","))}`)
        .then(r => r.json()),
    enabled: !!farmId,
    staleTime: 30_000,
  });

  const buyers = useMemo(() => data?.records ?? [], [data]);

  const addMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/buyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (result: { record?: BuyerRecord }) => {
      qc.invalidateQueries({ queryKey: qKey });
      if (result.record) {
        onChange(result.record.id, result.record.name);
      }
      const shouldNavigate = goToContacts && !!postAddNavigatePath;
      setAddOpen(false);
      setAddName("");
      setAddAccount("");
      setGoToContacts(false);
      toast({ title: `${typeLabel} added${shouldNavigate ? " — opening Suppliers & Contacts" : ""}` });
      if (shouldNavigate) navigate(postAddNavigatePath!);
    },
    onError: () => toast({ title: "Failed to add", variant: "destructive" }),
  });

  const handleSelect = (buyer: BuyerRecord) => {
    onChange(buyer.id, buyer.name);
    onChangeFull?.(buyer);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null, "");
    onChangeFull?.(null);
  };

  const triggerLabel = valueName || (valueId ? `ID: ${valueId}` : null);

  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="flex-1 justify-between font-normal text-left h-9 px-3"
              type="button"
            >
              <span className={triggerLabel ? "text-foreground" : "text-muted-foreground"}>
                {triggerLabel ?? placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder={`Search ${typeLabel.toLowerCase()}s...`} />
              <CommandList>
                <CommandEmpty>
                  <span className="text-sm text-muted-foreground">No matches found.</span>
                </CommandEmpty>
                <CommandGroup heading={`${typeLabel}s`}>
                  {buyers.map(b => (
                    <CommandItem
                      key={b.id}
                      value={b.name}
                      onSelect={() => handleSelect(b)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${valueId === b.id ? "opacity-100" : "opacity-0"}`}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{b.name}</span>
                        {b.accountNumber && (
                          <span className="text-xs text-muted-foreground">Acct: {b.accountNumber}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => { setOpen(false); setAddOpen(true); }}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Quick add new {typeLabel.toLowerCase()}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {(valueId !== null || valueName) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="px-2 h-9 text-muted-foreground hover:text-destructive"
            title="Clear selection"
          >
            ×
          </Button>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add {typeLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder={`e.g. ${typeLabel} name`}
                autoFocus
              />
            </div>
            <div>
              <Label>Account / Reference</Label>
              <Input
                value={addAccount}
                onChange={e => setAddAccount(e.target.value)}
                placeholder="Optional account number"
              />
            </div>
            {postAddNavigatePath && (
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={goToContacts}
                  onChange={e => setGoToContacts(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-brand shrink-0"
                />
                <span className="text-xs text-foreground/80 group-hover:text-foreground leading-relaxed">
                  Open Suppliers &amp; Contacts to complete this record after adding
                </span>
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              {postAddNavigatePath
                ? "A full record lets you add contact details, account number, certification numbers and more."
                : "This will be saved to your contacts list. You can add more details in Suppliers & Contacts."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} type="button">Cancel</Button>
            <Button
              onClick={() => {
                if (!addName.trim()) return;
                addMut.mutate({
                  name: addName.trim(),
                  accountNumber: addAccount.trim() || undefined,
                  supplierType: types[0] ?? "other",
                  isActive: true,
                });
              }}
              disabled={!addName.trim() || addMut.isPending}
              type="button"
            >
              {addMut.isPending ? "Adding..." : "Add & Select"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
