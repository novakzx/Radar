interface BarListItem {
  label: string;
  count: number;
}

/**
 * Gráfico de barras horizontais simples e determinístico (sem lib
 * externa) — a altura/largura de cada barra é sempre proporcional ao
 * maior valor do próprio conjunto de dados exibido.
 */
export function BarListChart({ items, emptyLabel }: { items: BarListItem[]; emptyLabel: string }) {
  const max = Math.max(1, ...items.map((item) => item.count));

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate pr-2">{item.label}</span>
            <span className="shrink-0 font-medium text-muted-foreground">{item.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
