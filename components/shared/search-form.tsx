"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSearchAction, type CreateSearchState } from "@/lib/actions/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: CreateSearchState = undefined;

export function SearchForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createSearchAction, initialState);

  useEffect(() => {
    if (state?.searchId) {
      router.push(`/radar/${state.searchId}`);
    }
  }, [state?.searchId, router]);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            name="location"
            placeholder="Almada, Portugal"
            defaultValue="Almada, Portugal"
            required
          />
          {state?.errors?.location && (
            <p className="text-sm text-destructive">{state.errors.location[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="radiusKm">Raio (km)</Label>
          <Input
            id="radiusKm"
            name="radiusKm"
            type="number"
            min="0.5"
            max="100"
            step="0.5"
            defaultValue="10"
            required
          />
          {state?.errors?.radiusKm && (
            <p className="text-sm text-destructive">{state.errors.radiusKm[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" name="category" placeholder="Barbearias" defaultValue="Barbearias" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="keyword">
            Palavra-chave (opcional — usada quando a categoria não é reconhecida)
          </Label>
          <Input id="keyword" name="keyword" placeholder="ex.: pet shop, mercearia..." />
        </div>
      </div>

      {state?.errors?.category && (
        <p className="text-sm text-destructive">{state.errors.category[0]}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Iniciando busca..." : "Buscar"}
      </Button>
    </form>
  );
}
