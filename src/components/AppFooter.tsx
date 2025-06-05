export function AppFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by AI. Styled by an expert designer.
          © {new Date().getFullYear()} ImageGenAI. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          {/* Placeholder for social media icons or other links */}
        </div>
      </div>
    </footer>
  );
}
