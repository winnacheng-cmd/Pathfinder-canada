"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjectAreas } from "@/config/site";

export function ProgramFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParams(next: { q?: string; subject?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.subject !== undefined) {
      if (next.subject && next.subject !== "all") params.set("subject", next.subject);
      else params.delete("subject");
    }
    router.push(`/programs?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Search programs or universities"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParams({ q: query });
        }}
        onBlur={() => updateParams({ q: query })}
        className="sm:max-w-sm"
      />
      <Select
        defaultValue={searchParams.get("subject") ?? "all"}
        onValueChange={(subject) => updateParams({ subject })}
      >
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="All subject areas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All subject areas</SelectItem>
          {subjectAreas.map((area) => (
            <SelectItem key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
