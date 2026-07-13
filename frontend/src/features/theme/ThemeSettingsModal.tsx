import { Modal } from "../../shared/components/Modal";
import { themeOptions, useTheme } from "./ThemeContext";

export type ThemeSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ThemeSettingsModal({ isOpen, onClose }: ThemeSettingsModalProps) {
  const { themeId, setThemeId } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--app-text)]">Theme mode</p>
          <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
            Choose the softer light workspace or the deeper dark streak-focused workspace.
          </p>
        </section>

        <section className="grid gap-3">
          {themeOptions.map((option) => {
            const isSelected = option.id === themeId;
            const optionCardClass =
              option.id === "light"
                ? "border-[#d8d3e6] bg-[#f0eef8] text-[#26344f] hover:border-[#22c7a9]"
                : "border-[#2fc7e5] bg-[#344b7d] text-white hover:border-[#25c6d9]";
            const optionDescriptionClass = option.id === "light" ? "text-[#667085]" : "text-[#d8d5ee]";

            return (
              <button
                className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  isSelected
                    ? `${optionCardClass} shadow-[0_18px_38px_var(--app-shadow)] ring-2 ring-[var(--app-accent)]`
                    : optionCardClass
                }`}
                key={option.id}
                onClick={() => setThemeId(option.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{option.name}</p>
                    <p className={`mt-1 text-sm leading-6 ${optionDescriptionClass}`}>{option.description}</p>
                  </div>
                  {isSelected ? (
                    <span className="rounded-full bg-[var(--app-accent)] px-3 py-1 text-xs font-semibold text-white">
                      Active
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden="true">
                  <span className="h-10 rounded-2xl shadow-inner" style={{ backgroundColor: option.swatches.background }} />
                  <span className="h-10 rounded-2xl shadow-inner" style={{ backgroundColor: option.swatches.accent }} />
                  <span className="h-10 rounded-2xl shadow-inner" style={{ backgroundColor: option.swatches.text }} />
                  <span className="h-10 rounded-2xl shadow-inner" style={{ backgroundColor: option.swatches.secondary }} />
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </Modal>
  );
}
