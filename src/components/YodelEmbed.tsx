'use client';

const WIDGET_ID = process.env.NEXT_PUBLIC_YODEL_WIDGET_ID;

export function YodelEmbed() {
  if (!WIDGET_ID) return null;

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Community Calendar</h3>
          <p className="text-xs text-slate-500 mt-0.5">Via Yodel</p>
        </div>
        <iframe
          src={`https://events.yodel.today/y/widget/${WIDGET_ID}?yodel2_id=yodel2-iframe-embed-0`}
          className="w-full h-[500px] border-0"
          title="Yodel Community Calendar"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
