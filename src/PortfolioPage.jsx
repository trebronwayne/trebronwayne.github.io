import { useEffect } from 'react';
import { SiteLink } from './site-router.jsx';

export function SiteHeader() {
  return (
    <header className="portfolio-header">
      <SiteLink className="portfolio-brand" to="/">
        <span className="portfolio-brand-mark" aria-hidden="true">N</span>
        <span>Nobert</span>
      </SiteLink>
      <nav className="portfolio-nav" aria-label="Main navigation">
        <SiteLink to="/">Portfolio</SiteLink>
        <SiteLink to="/bluebird">Bluebird</SiteLink>
        <SiteLink to="/remote-schools">Remote Schools</SiteLink>
        <SiteLink to="/cv">CV</SiteLink>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="portfolio-footer">
      <SiteLink className="portfolio-footer-brand" to="/">Nobert</SiteLink>
      <span>Software projects built with care.</span>
      <a href="https://github.com/trebronwayne" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </footer>
  );
}

const skills = ['Kotlin', 'Android', 'TypeScript', 'JavaScript', 'React', 'CSS'];

const projects = [
  {
    name: 'Bluebird',
    type: 'Android launcher',
    description: 'A desktop-style Android launcher with floating windows, a taskbar, and built-in applications.',
    tags: ['Android', 'Kotlin'],
    href: '/bluebird',
    internal: true
  },
  {
    name: 'Remote Schools',
    type: 'Learning platform',
    description: 'An e-learning platform based on Uganda’s curriculum, designed with offline support.',
    tags: ['Education', 'Offline support'],
    href: '/remote-schools',
    internal: true
  },
  {
    name: 'EchoText',
    type: 'Android utility',
    description: 'A text editor studio with text-repeating capabilities.',
    tags: ['Android', 'Kotlin'],
    href: 'https://github.com/trebronwayne/EchoText'
  },
  {
    name: 'Eddy Wizzy',
    type: 'Website',
    description: 'An official website project built for Eddy Wizzy.',
    tags: ['JavaScript', 'Web'],
    href: 'https://github.com/trebronwayne/eddy-wizzy-website'
  }
];

function ProjectCard({ project, index }) {
  const content = (
    <>
      <div className="project-card-top">
        <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="project-type">{project.type}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <span className="project-card-link">{project.internal ? 'Explore project' : 'View repository'} <span aria-hidden="true">↗</span></span>
    </>
  );

  return project.internal
    ? <SiteLink className="project-card" to={project.href}>{content}</SiteLink>
    : <a className="project-card" href={project.href} target="_blank" rel="noreferrer">{content}</a>;
}

export default function PortfolioPage() {
  useEffect(() => {
    document.title = 'Nobert — Developer portfolio';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'Selected software projects, skills, and CV for Nobert.';
  }, []);

  return (
    <div className="portfolio-shell">
      <SiteHeader />
      <main className="portfolio-main">
        <section className="portfolio-hero" id="top">
          <div className="portfolio-hero-copy">
            <p className="portfolio-eyebrow">Software developer · Android · Web</p>
            <h1>Android apps,<br />websites, and<br /><span>learning tools.</span></h1>
            <p className="portfolio-lede">I’m Nobert, a software developer. My projects include Bluebird, a desktop-style Android launcher; EchoText, a text utility; and Remote Schools, an e-learning platform based on Uganda’s curriculum.</p>
            <div className="portfolio-actions">
              <SiteLink className="portfolio-button portfolio-button-primary" to="/#projects">Explore selected work</SiteLink>
              <SiteLink className="portfolio-text-link" to="/cv">View CV <span aria-hidden="true">↗</span></SiteLink>
            </div>
            <div className="portfolio-meta"><span>Android applications</span><span>Web products</span><span>Learning tools</span></div>
          </div>
          <aside className="portfolio-hero-note" aria-label="Portfolio introduction">
            <span className="note-label">Current focus</span>
            <h2>Remote Schools</h2>
            <p>An e-learning platform for Uganda’s curriculum, designed with offline support.</p>
            <SiteLink to="/remote-schools">See Remote Schools <span aria-hidden="true">↗</span></SiteLink>
          </aside>
        </section>

        <section className="portfolio-section portfolio-about" id="about">
          <div>
            <p className="portfolio-eyebrow">About</p>
            <h2>Building across<br />platforms and needs.</h2>
          </div>
          <div className="portfolio-about-copy">
            <p>I build Android and web applications. Bluebird explores a desktop-style Android home screen; Remote Schools organizes lessons around Uganda’s curriculum and supports offline learning. I also work on utilities such as EchoText.</p>
            <a href="https://github.com/trebronwayne" target="_blank" rel="noreferrer">Find me on GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="portfolio-section" id="projects">
          <div className="portfolio-section-heading">
            <div><p className="portfolio-eyebrow">Selected work</p><h2>Projects</h2></div>
            <p>Products and tools built across Android, education, and the web.</p>
          </div>
          <div className="project-grid">{projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} />)}</div>
        </section>

        <section className="portfolio-section skills-section" id="skills">
          <div className="portfolio-section-heading">
            <div><p className="portfolio-eyebrow">Tools and technologies</p><h2>Skills</h2></div>
            <p>Technologies reflected in the published projects.</p>
          </div>
          <div className="skills-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </section>

        <section className="portfolio-cta">
          <div><p className="portfolio-eyebrow">Curriculum vitae</p><h2>More about my work.</h2></div>
          <SiteLink className="portfolio-button portfolio-button-secondary" to="/cv">Open CV <span aria-hidden="true">↗</span></SiteLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
