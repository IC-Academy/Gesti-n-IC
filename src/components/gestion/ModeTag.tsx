/** Etiqueta visible que deja claro si una pantalla usa datos demo o la integración real con n8n. */
export function ModeTag({ mode }: { mode: 'demo' | 'produccion' }) {
  if (mode === 'demo') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">● Datos de demostración</span>
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">● Integración real · n8n</span>
}
