export function formatMoney(value: number, currency?: string | null): string {
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      // Unknown or invalid currency code — fall back to a plain number.
    }
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}
