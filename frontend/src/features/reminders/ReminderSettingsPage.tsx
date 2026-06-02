// 1. <expects> meaning: ReminderPage expects: onClose = a function
// why export? bcz other components might need to reuse it
// why not export from parent (DahsboardPage)? bcz they belong to the component RECEIVING them
export type ReminderSettingsPageProps = {
  onClose: () => void;
};

// 2. <receive> the prop
export function ReminderSettingsPage({ onClose }: ReminderSettingsPageProps) {

// 3. <use>
  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-5 text-slate-950">
      <div className="mx-auto w-full max-w-[430px] rounded-[20px] bg-white px-7 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.10)]">
        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-950">Habit Reminders</h1>
          {/* Child component ask parent component to close it */}
          <button
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
      </div>
    </main>
  );
}
