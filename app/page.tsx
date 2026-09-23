import Link from "next/link";

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

      
    </main>
  );
}
