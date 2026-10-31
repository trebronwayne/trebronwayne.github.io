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
    name: 'Remote Schools',
    summary: 'E-learning platform based on Uganda’s curriculum, with offline support.',
    stack: 'Education technology · TypeScript',
    href: '/remote-schools',
    internal: true
  },
  {
    name: 'EchoText',
    summary: 'Text editor studio with text-repeating capabilities.',
    stack: 'Android · Kotlin',
    href: 'https://github.com/trebronwayne/EchoText'
  },
  {
    name: 'Eddy Wizzy website',
    summary: 'Official website project.',
    stack: 'JavaScript · Web',
    href: 'https://github.com/trebronwayne/eddy-wizzy-website'
  }
];

export default function CvPage() {
  useEffect(() => {
    document.title = 'CV — Nobert';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'A project-focused CV for Nobert, with verified skills and selected software projects.';
  }, []);

  return (
    <div className="portfolio-shell cv-shell">
      <SiteHeader />
      <main className="cv-page">
        <div className="cv-topline">
          <p className="portfolio-eyebrow">Curriculum vitae</p>
          <button className="portfolio-button portfolio-button-secondary no-print" type="button" onClick={() => window.print()}>Print / save as PDF</button>
        </div>
        <section className="cv-intro">
          <div>
            <h1>Nobert</h1>
            <p className="cv-role">Software developer · Android · Web</p>
          </div>
          <p className="cv-summary">I build practical software across Android and the web, with selected work in mobile applications, education technology, and responsive websites.</p>
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
