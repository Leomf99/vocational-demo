import KardexUploader from "@/components/KardexUploader";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Demo Vocacional por Fortalezas
        </h1>
        <p className="text-sm text-gray-600">
          Carga base para evolucionar el scoring por calificaciones.
        </p>
      </header>

      <KardexUploader />

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Resultados</h2>
        <p className="text-sm text-gray-600">Aún sin resultados</p>
      </section>
    </main>
  );
}
