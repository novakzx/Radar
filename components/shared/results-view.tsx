"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { applyResultFilters } from "@/lib/business-filters";
import { DEFAULT_FILTERS } from "@/types/filters";
import type { BusinessListItem } from "@/types/business";
import { ResultsFilters } from "@/components/shared/results-filters";
import { ResultsMap } from "@/components/shared/results-map";
import { BusinessResultCard } from "@/components/shared/business-result-card";

export function ResultsView({ businesses }: { businesses: BusinessListItem[] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const filtered = useMemo(() => applyResultFilters(businesses, filters), [businesses, filters]);

  return (
    <div className="space-y-4">
      <ResultsFilters
        filters={filters}
        onChange={setFilters}
        totalCount={businesses.length}
        filteredCount={filtered.length}
      />

      <div className="flex gap-2 lg:hidden">
        <Button
          size="sm"
          variant={mobileView === "list" ? "default" : "outline"}
          onClick={() => setMobileView("list")}
        >
          Lista
        </Button>
        <Button
          size="sm"
          variant={mobileView === "map" ? "default" : "outline"}
          onClick={() => setMobileView("map")}
        >
          Mapa
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn("space-y-4", mobileView === "map" && "hidden lg:block")}>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma empresa corresponde aos filtros selecionados.
            </p>
          ) : (
            <div className="grid max-h-[560px] gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
              {filtered.map((business) => (
                <div
                  key={business.id}
                  onMouseEnter={() => setHoveredId(business.id)}
                  onMouseLeave={() => setHoveredId((current) => (current === business.id ? null : current))}
                  onClick={() => setSelectedId(business.id)}
                  className={cn(
                    "cursor-pointer rounded-lg transition-shadow",
                    (selectedId === business.id || hoveredId === business.id) &&
                      "ring-2 ring-primary",
                  )}
                >
                  <BusinessResultCard business={business} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(mobileView === "list" && "hidden lg:block")}>
          <ResultsMap
            businesses={filtered}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </div>
      </div>
    </div>
  );
}
