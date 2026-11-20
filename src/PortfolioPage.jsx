import { useEffect, useState } from 'react';
import { SiteLink } from './site-router.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useNavigationDismissal } from './useNavigationDismissal.js';

const cvPdf = '/Nobert-Lamn-CV.pdf';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useNavigationDismissal(menuOpen, closeMenu, '.portfolio-header');

  return (
    <header className="portfolio-header">
      <SiteLink className="portfolio-brand" to="/" onClick={closeMenu}>
        <span className="portfolio-brand-mark" aria-hidden="true">N</span>
        <span><strong>Nobert Lamn</strong><small>Android &amp; web developer</small></span>
      </SiteLink>
      <nav id="portfolio-navigation" className={`portfolio-nav ${menuOpen ? 'portfolio-nav--open' : ''}`} aria-label="Main navigation">
        <SiteLink to="/#projects" onClick={closeMenu}>Selected work</SiteLink>
        <SiteLink to="/#about" onClick={closeMenu}>About</SiteLink>
        <SiteLink to="/remote-schools" onClick={closeMenu}>Remote Schools</SiteLink>
        <a className="portfolio-nav-download" href={cvPdf} download="Nobert-Lamn-CV.pdf" onClick={closeMenu}>Download CV <span aria-hidden="true">↓</span></a>
      </nav>
      <div className="portfolio-header-actions">
        <ThemeToggle />
        <button
          className={`portfolio-menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="portfolio-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="portfolio-footer">
      <SiteLink className="portfolio-footer-brand" to="/">Nobert Lamn</SiteLink>
      <span>Android and web software · Kampala, Uganda</span>
      <div className="portfolio-footer-links">
        <a href="https://github.com/trebronwayne" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        <a href={cvPdf} download="Nobert-Lamn-CV.pdf">CV PDF <span aria-hidden="true">↓</span></a>
      </div>
    </footer>
  );
}

const skillGroups = [
  { label: 'Android', value: 'Kotlin · Java · Jetpack Compose · Android SDK' },
  { label: 'Web', value: 'React · TypeScript · HTML/CSS · Vite' },
  { label: 'Tools', value: 'Android Studio · GitHub · CI workflows' }
];

const projects = [
  {
    name: 'DropLink',
    type: 'Android · peer-to-peer networking',
    period: '2026',
    description: 'Turns an Android phone into a private server for nearby devices. Share folders, stream media, or host a local web page over Wi-Fi without a cloud account.',
    tags: ['Kotlin', 'Jetpack Compose', 'Ktor'],
    href: 'https://github.com/trebronwayne/DropLink',
    featured: true
  },
  {
    name: 'Bluebird',
    type: 'Open-source Android desktop',
    period: '2025—now',
    description: 'A desktop environment for Android with resizable windows, a taskbar, a Start menu, and built-in applications.',
    tags: ['Kotlin', 'Jetpack Compose'],
    href: '/bluebird',
    internal: true,
    preview: '/assets/img/screenshots/desktop.png',
    previewAlt: 'Bluebird Android desktop interface'
  },
  {
    name: 'Remote Schools Uganda',
    type: 'Curriculum learning · offline study',
    period: '2025—now',
    description: 'A learning platform based on Uganda’s P1–S4 curriculum, with class materials learners can download and use offline.',
    tags: ['Education', 'React', 'Offline-first'],
    href: '/remote-schools',
    internal: true,
    preview: '/assets/remote-schools/home-learning.png',
    previewAlt: 'Remote Schools learner home screen'
  },
  {
    name: 'AubreeKit',
    type: 'Android animation library',
    period: '2026',
    description: 'A lightweight Android library for adding a small animated character to an app; it powers the Aubree mascot in DropLink.',
    tags: ['Kotlin', 'Android library'],
    href: 'https://github.com/trebronwayne/AubreeKit'
  }
];

function ProjectEntry({ project, index }) {
  const content = (
    <>
      {project.preview && <img className="project-entry-image" src={project.preview} alt={project.previewAlt} loading="lazy" decoding="async" />}
      <div className="project-entry-copy">
        <div className="project-entry-top">
          <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="project-entry-type">{project.type}</span>
          <time>{project.period}</time>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <span className="project-card-link">{project.internal ? 'Explore project' : 'View repository'} <span aria-hidden="true">↗</span></span>
      </div>
    </>
  );

  return project.internal
    ? <SiteLink className={`project-entry ${project.featured ? 'project-entry-featured' : ''}`} to={project.href}>{content}</SiteLink>
    : <a className={`project-entry ${project.featured ? 'project-entry-featured' : ''}`} href={project.href} target="_blank" rel="noreferrer">{content}</a>;
}

export default function PortfolioPage() {
  useEffect(() => {
    document.title = 'Nobert Lamn — Android and web developer';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'Android and web software by Nobert Lamn: DropLink, Bluebird, Remote Schools Uganda, and AubreeKit.';
  }, []);

  return (
    <div className="portfolio-shell portfolio-page">
      <SiteHeader />
      <main className="portfolio-main portfolio-resume-layout" id="top">
        <aside className="portfolio-profile" aria-label="Profile and skills">
          <figure className="profile-portrait-wrap">
            <img className="profile-portrait" src="/assets/profile/nobert-lamn.jpg" alt="Portrait of Nobert Lamn" />
            <figcaption>Where it started: my first years exploring computers.</figcaption>
          </figure>
          <section className="profile-facts">
            <p className="portfolio-eyebrow">Contact</p>
            <p>Kampala, Uganda</p>
            <a href="https://github.com/trebronwayne" target="_blank" rel="noreferrer">github.com/trebronwayne ↗</a>
            <a href="https://trebronwayne.github.io" target="_blank" rel="noreferrer">trebronwayne.github.io ↗</a>
          </section>
          <section className="profile-skills">
            <p className="portfolio-eyebrow">Skills</p>
            {skillGroups.map((group) => (
              <div key={group.label}>
                <strong>{group.label}</strong>
                <p>{group.value}</p>
              </div>
            ))}
          </section>
          <section className="profile-facts profile-education">
            <p className="portfolio-eyebrow">Education</p>
            <strong>Secondary school (O-Level)</strong>
            <p>Studying toward the Uganda Certificate of Education, alongside self-directed software work.</p>
          </section>
        </aside>

        <div className="portfolio-content">
          <section className="portfolio-intro" id="about">
            <p className="portfolio-eyebrow">Android and web developer · Open-source software</p>
            <h1>Nobert <span>Lamn</span></h1>
            <p className="portfolio-lede">Self-taught developer with a record of shipping real products. I build fast, responsive software for low-end devices and unreliable networks—from Android applications to offline-first learning tools.</p>
            <div className="portfolio-actions">
              <a className="portfolio-button portfolio-button-primary" href={cvPdf} download="Nobert-Lamn-CV.pdf">Download CV <span aria-hidden="true">↓</span></a>
              <a className="portfolio-text-link" href="#projects">Selected work <span aria-hidden="true">↓</span></a>
            </div>
          </section>

          <section className="portfolio-section portfolio-projects" id="projects">
            <div className="portfolio-section-heading">
              <div><p className="portfolio-eyebrow">Selected work</p><h2>Projects</h2></div>
              <p>Products and libraries made to solve a specific problem, shaped by the devices and networks people use.</p>
            </div>
            <div className="portfolio-project-list">
              {projects.map((project, index) => <ProjectEntry key={project.name} project={project} index={index} />)}
            </div>
          </section>

          <section className="portfolio-about-note">
            <div><p className="portfolio-eyebrow">How I work</p><h2>Practical software,<br />made for real conditions.</h2></div>
            <p>I care about clear interfaces, dependable offline use, and making software run well on the devices people already have. My work spans mobile, local networking, and education.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
