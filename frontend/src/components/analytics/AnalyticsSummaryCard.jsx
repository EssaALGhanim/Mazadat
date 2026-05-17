export default function AnalyticsSummaryCard({ title, value, icon: Icon, valueClassName = '' }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-[#C5E0DC] dark:border-slate-700 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#6B9E99] dark:text-slate-300 text-sm font-semibold">{title}</p>
          <p className={`mt-2 text-2xl font-bold text-[#1A2E2C] dark:text-slate-100 ${valueClassName}`}>{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#EAF7F5] dark:bg-slate-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#2A9D8F] dark:text-emerald-300" />
          </div>
        )}
      </div>
    </div>
  );
}
