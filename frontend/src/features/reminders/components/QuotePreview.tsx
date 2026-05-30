export type QuotePreviewProps = {
  quote: string;
};

export function QuotePreview({ quote }: QuotePreviewProps) {
  return (
    <section className="quote-preview-placeholder">
      {/* TODO: Show today's motivational quote. */}
      <p>{quote || "Quote preview"}</p>
    </section>
  );
}
