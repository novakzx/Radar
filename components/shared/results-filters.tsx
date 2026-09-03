"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResultFilters, SortKey, WebsiteStatusFilter } from "@/types/filters";

const WEBSITE_STATUS_OPTIONS: { value: WebsiteStatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "nao_encontrado", label: "Website não encontrado na fonte" },
  { value: "encontrado", label: "Website encontrado na fonte" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "lead_score_desc", label: "Lead Score (maior primeiro)" },
  { value: "rating_desc", label: "Rating (maior primeiro)" },
  { value: "reviews_desc", label: "Nº de avaliações (maior primeiro)" },
  { value: "name_asc", label: "Nome (A-Z)" },
];

const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5];

interface ResultsFiltersProps {
  filters: ResultFilters;
  onChange: (filters: ResultFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export function ResultsFilters({ filters, onChange, totalCount, filteredCount }: ResultsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border p-4">
      <div className="space-y-1.5">
        <Label>Status de website</Label>
        <Select
          value={filters.websiteStatus}
          onValueChange={(value) => {
            if (value) onChange({ ...filters, websiteStatus: value as WebsiteStatusFilter });
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEBSITE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Rating mínimo</Label>
        <Select
          value={String(filters.minRating)}
          onValueChange={(value) => onChange({ ...filters, minRating: Number(value) })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value === 0 ? "Qualquer" : `≥ ${value.toFixed(1)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Ordenar por</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => {
            if (value) onChange({ ...filters, sortBy: value as SortKey });
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={filters.onlyIndependent}
          onCheckedChange={(checked) => onChange({ ...filters, onlyIndependent: checked === true })}
        />
        Só independentes
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={filters.onlyWithPhone}
          onCheckedChange={(checked) => onChange({ ...filters, onlyWithPhone: checked === true })}
        />
        Só com telefone
      </label>

      <span className="ml-auto text-sm text-muted-foreground">
        {filteredCount} de {totalCount} empresas
      </span>
    </div>
  );
}
