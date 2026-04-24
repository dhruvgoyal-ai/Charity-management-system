export default function AuthLayout({ eyebrow, title, description, children, aside }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <section className="space-y-6">
        <div className="inline-flex rounded-full border border-ember/20 bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
          {eyebrow}
        </div>
        <div className="max-w-xl space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-ink/70">{description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {aside.map((item) => (
            <article key={item.title} className="panel p-5">
              <p className="text-2xl font-bold text-pine">{item.value}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-ink/65">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-6 sm:p-8">{children}</section>
    </main>
  );
}
