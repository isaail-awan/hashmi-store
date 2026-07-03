interface TickerItem {
  name: string;
  price: number;
}

export function RateTicker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null;
  // duplicate the list so the marquee loops seamlessly
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y-2 border-leaf-deep/20 bg-leaf-deep py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 font-mono-tag text-sm font-medium text-paper/90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-haldi" />
            {item.name}
            <span className="text-haldi">Rs. {item.price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
