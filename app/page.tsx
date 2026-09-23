import Link from "next/link";

const steps = [

];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="container hero-inner">
          <span className="hero-flag"><i />Wage protection for daily-wage work</span>

          <h1>Wagely</h1>

          <p className="hero-tagline">No thekedaar can ghost you.</p>

          

          <div className="hero-actions">
            <Link href="/jobs" className="btn btn-primary btn-lg">Find work</Link>
            <Link href="/jobs/new" className="btn btn-ghost btn-lg">Post a job</Link>
          </div>
        </div>
      </section>

      <section className="home-steps">
        <div className="container steps-list">
          {steps.map((step) => (
            <div className="step" key={step.n}>
              <span className="step-n">{step.n}</span>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
