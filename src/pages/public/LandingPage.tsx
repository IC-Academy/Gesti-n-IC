import { Link } from 'react-router-dom'
import { ClipboardList, FileSearch2, ShieldCheck, ArrowRight, Building, Wrench, HardHat } from 'lucide-react'

const PASOS = [
  {
    icon: ClipboardList,
    titulo: '1. Solicita',
    descripcion:
      'Completa el formulario público con los detalles de tu proyecto de mantenimiento, adecuación o instalación.',
  },
  {
    icon: ShieldCheck,
    titulo: '2. Recibe dictamen',
    descripcion:
      'El área responsable revisa tu solicitud, define su viabilidad, prioridad y la convierte en proyecto si procede.',
  },
  {
    icon: FileSearch2,
    titulo: '3. Consulta el avance',
    descripcion:
      'Da seguimiento en cualquier momento a tu folio: estatus, actividades, evidencias y comentarios del equipo.',
  },
]

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ic-blue-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-ic-yellow-500 ring-1 ring-inset ring-white/15">
              Gestión IC · Inmuebles e Instalaciones
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Un solo lugar para solicitar, autorizar y dar seguimiento a proyectos de mantenimiento e instalaciones.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Este portal permite registrar solicitudes de proyectos y trabajos relacionados con mantenimiento,
              adecuaciones e instalaciones. Cada solicitud será revisada por el área responsable para determinar
              su viabilidad, prioridad y programación. Una vez registrada, recibirás un folio con el que podrás
              consultar el dictamen, avance y evidencias de tu proyecto de forma segura.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ic-yellow-500 px-6 text-base font-semibold text-ic-blue-900 shadow-ic-sm transition hover:bg-ic-yellow-400 focus-ring"
              >
                Solicitar proyecto <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/estatus"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-base font-medium text-white transition hover:bg-white/10 focus-ring"
              >
                Consultar estatus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explicación del proceso */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ic-blue-700">Cómo funciona</h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ic-ink">
            Un proceso claro, de principio a fin
          </p>
          <p className="mt-4 text-base leading-relaxed text-ic-slate">
            Desde el registro de tu solicitud hasta la entrega del proyecto, cada etapa queda documentada y
            disponible para consulta con tu folio.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PASOS.map((paso) => (
            <div key={paso.titulo} className="rounded-2xl border border-ic-line bg-white p-7 shadow-ic-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ic-blue-50 text-ic-blue-800">
                <paso.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ic-ink">{paso.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ic-slate">{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Áreas de trabajo */}
      <section className="border-y border-ic-line bg-ic-blue-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Building, titulo: 'Adecuaciones', texto: 'Remodelaciones, pintura y mejoras a espacios de trabajo.' },
              { icon: Wrench, titulo: 'Mantenimiento', texto: 'Correctivo y preventivo para instalaciones eléctricas, hidráulicas y más.' },
              { icon: HardHat, titulo: 'Instalaciones', texto: 'Nuevas instalaciones y adecuaciones para la operación diaria.' },
            ].map((item) => (
              <div key={item.titulo} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-ic-blue-800 shadow-ic-sm">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-ic-ink">{item.titulo}</p>
                  <p className="mt-1 text-sm text-ic-slate">{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-ic-blue-900 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-white">¿Listo para registrar tu solicitud?</h2>
            <p className="mt-2 max-w-xl text-white/75">
              El registro toma solo unos minutos y podrás dar seguimiento a tu folio en cualquier momento.
            </p>
          </div>
          <Link
            to="/solicitar"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-ic-yellow-500 px-6 text-base font-semibold text-ic-blue-900 shadow-ic-sm transition hover:bg-ic-yellow-400 focus-ring"
          >
            Solicitar proyecto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
