import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

export function StaffSelect({
  value,
  onChange,
  staffNames,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  staffNames: string[];
  loading?: boolean;
}) {
  if (loading) {
    return <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Loading staff…" disabled />;
  }

  if (staffNames.length === 0) {
    return (
      <div>
        <Input
          className="mt-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type staff member name…"
        />
        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>
          No staff registered for this farm.{" "}
          <Link href="/staff" style={{ color: "#16a34a", textDecoration: "underline" }}>
            Add staff members
          </Link>{" "}
          to enable the lookup.
        </p>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="Select staff member…" />
      </SelectTrigger>
      <SelectContent>
        {staffNames.map((n) => (
          <SelectItem key={n} value={n}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
