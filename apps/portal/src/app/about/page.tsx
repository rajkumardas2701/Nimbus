import { PageHeader, Card } from "@/components/ui";

export const metadata = { title: "About" };

const principles = [
  {
    title: "Evolve, never rewrite",
    body: "Each phase builds on the last. Deleting and restarting is a failure of design, not a fresh start.",
  },
  {
    title: "Managed-first",
    body: "Prefer Azure managed services over self-hosted infrastructure until a concrete limit forces a change.",
  },
  {
    title: "Justify complexity",
    body: "Kubernetes, microservices, and service mesh are introduced only when traffic, cost, or reliability demands it — with the trigger written down.",
  },
  {
    title: "Production-shaped from day one",
    body: "Every service ships with a /health endpoint, structured logs, and a clear contract. Metrics and CI/CD follow as the phase requires.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="About"
        title="A platform, not a portfolio"
        lede="Nimbus reframes the usual 'collection of demos' into a single, coherent cloud platform. The subtle shift — treating every app as a tenant on the platform — changes every design decision for the better."
      />

      <section className="flex flex-col gap-4">
        <p className="max-w-2xl leading-7 text-slate-300">
          The goal is to build something that could realistically exist inside a real
          engineering organization. A new engineer joining should be able to open the
          portal and discover documentation, chat with an AI assistant, search knowledge,
          monitor systems, and explore the architecture — all in one place.
        </p>
        <p className="max-w-2xl leading-7 text-slate-300">
          Every capability is built to grow. Nothing is thrown away between phases; it is
          evolved. That constraint is the whole point — it is how real platforms actually
          mature, and it forces real architecture tradeoffs instead of green-field demos.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Operating principles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {principles.map((p) => (
            <Card key={p.title}>
              <h3 className="font-medium text-white">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">{p.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
