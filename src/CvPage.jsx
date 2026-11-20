import { useEffect } from 'react';
import { SiteFooter, SiteHeader } from './PortfolioPage.jsx';
import { SiteLink } from './site-router.jsx';

const cvProjects = [
  {
    name: 'Bluebird',
    summary: 'Desktop-style Android launcher with floating windows, a taskbar, and built-in applications.',
    stack: 'Android · Kotlin',
    href: '/bluebird',
    internal: true
  },
  {
    name: 'Remote Schools Uganda',
    summary: 'An offline-first learning platform based on Uganda’s P1–S4 curriculum.',
    stack: 'Education technology · TypeScript',
    href: '/remote-schools',
    internal: true
  },
  {
    name: 'DropLink',
    summary: 'An Android app that turns a phone into a private server for nearby devices, with local file sharing, media streaming, and no cloud account.',
    stack: 'Android · Kotlin · Ktor',
    href: 'https://github.com/trebronwayne/DropLink'
  },
  {
    name: 'AubreeKit',
    summary: 'A lightweight Android animation library that powers the Aubree mascot used in DropLink.',
    stack: 'Android · Kotlin',
    href: 'https://github.com/trebronwayne/AubreeKit'
  }
];

export default function CvPage() {
  useEffect(() => {
    document.title = 'CV — Nobert Lamn';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'A project-focused CV for Nobert Lamn, with selected software projects and skills.';
  }, []);

  return (
    <div className="portfolio-shell cv-shell">
      <SiteHeader />
      <main className="cv-page">
        <div className="cv-topline">
          <p className="portfolio-eyebrow">Curriculum vitae</p>
          <div className="cv-topline-actions no-print">
            <a className="portfolio-button portfolio-button-primary" href="/Nobert-Lamn-CV.pdf" download="Nobert-Lamn-CV.pdf">Download PDF <span aria-hidden="true">↓</span></a>
            <button className="portfolio-button portfolio-button-secondary" type="button" onClick={() => window.print()}>Print page</button>
          </div>
        </div>
        <section className="cv-intro">
          <div>
            <h1>Nobert Lamn</h1>
            <p className="cv-role">Android and web developer · Open-source software</p>
          </div>
          <p className="cv-summary">Self-taught Android and web developer in Kampala, Uganda. I build responsive software for low-end devices and unreliable networks.</p>
        </section>
        <section className="cv-section">
          <h2>Technical skills</h2>
          <div className="cv-skills">
            {['Kotlin', 'Android', 'TypeScript', 'JavaScript', 'React', 'CSS'].map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </section>
        <section className="cv-section">
          <h2>Selected projects</h2>
          <div className="cv-projects">
            {cvProjects.map((project) => (
              <article className="cv-project" key={project.name}>
                <div>
                  <h3>{project.internal ? <SiteLink to={project.href}>{project.name}</SiteLink> : <a href={project.href} target="_blank" rel="noreferrer">{project.name}</a>}</h3>
                  <p>{project.summary}</p>
                </div>
                <span>{project.stack}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="cv-section cv-links">
          <h2>Links</h2>
          <a href="https://github.com/trebronwayne" target="_blank" rel="noreferrer">github.com/trebronwayne ↗</a>
          <SiteLink to="/">Back to portfolio ↗</SiteLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
