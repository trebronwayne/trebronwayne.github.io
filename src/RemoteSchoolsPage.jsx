import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import { detectVisitorDevice } from './device-detection.js';
import { useNavigationDismissal } from './useNavigationDismissal.js';

const releasesEndpoint = 'https://api.github.com/repos/trebronwayne/trebronwayne.github.io/releases?per_page=30';
const webAppUrl = 'https://remoteschools.dpdns.org';

const screenshots = [
  {
    src: '/assets/remote-schools/home-learning.png',
    title: 'Daily learning',
    description: 'Quick practice, reminders, and a class download for offline study.',
    alt: 'Remote Schools home screen showing a daily question, sleep reminder, offline class download, and curriculum link.'
  },
  {
    src: '/assets/remote-schools/curriculum-browser.png',
    title: 'Browse the curriculum',
    description: 'Choose a class and subject, then open lessons that are available offline.',
    alt: 'Remote Schools curriculum browser showing S1 subjects and class navigation from P1 to S4.'
  },
  {
    src: '/assets/remote-schools/library.png',
    title: 'Books, notes & past papers',
    description: 'Find study materials by level, subject, and type.',
    alt: 'Remote Schools library showing books, notes, exams, and subject filters.'
  },
  {
    src: '/assets/remote-schools/subjects-and-school.png',
    title: 'Set up a learner profile',
    description: 'Choose a class, school, region, and subjects.',
    alt: 'Remote Schools settings page for a learner’s subjects, class, school, and region.'
  }
];

function RemoteSchoolsHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useNavigationDismissal(menuOpen, closeMenu, '.remote-header');

  return (
    <header className="remote-header">
      <a className="remote-brand" href="#overview" aria-label="Remote Schools store" onClick={closeMenu}>
        <span className="remote-brand-mark" aria-hidden="true">R</span>
        <span><strong>Remote Schools</strong><small>Study store</small></span>
      </a>
      <nav id="remote-navigation" className={`remote-nav ${menuOpen ? 'remote-nav--open' : ''}`} aria-label="Remote Schools navigation">
        <a href="#overview" onClick={closeMenu}>Overview</a>
        <a href="#screenshots" onClick={closeMenu}>Screenshots</a>
        <a href="#features" onClick={closeMenu}>What’s inside</a>
        <a className="remote-nav-cta" href="#downloads" onClick={closeMenu}>Get the app <span aria-hidden="true">↓</span></a>
      </nav>
      <div className="remote-header-actions">
        <ThemeToggle />
        <button
          className={`remote-menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="remote-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}

function RemoteSchoolsFooter() {
  return (
    <footer className="remote-footer">
      <a className="remote-footer-brand" href="#overview">Remote Schools</a>
      <span>Learning support for Uganda’s curriculum</span>
      <nav aria-label="Remote Schools footer navigation">
        <a href="#screenshots">Screenshots</a>
        <a href="#features">What’s inside</a>
        <a href="#downloads">Downloads</a>
      </nav>
    </footer>
  );
}

function isRemoteSchoolsRelease(release) {
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const releaseText = [release.name, release.tag_name, ...assets.map((asset) => asset.name)]
    .filter(Boolean)
    .join(' ');
  return /remote[\s_-]?schools?/i.test(releaseText) &&
    assets.some((asset) => /\.(apk|exe)$/i.test(asset.name || ''));
}

async function loadLatestRemoteSchoolsRelease() {
  const response = await fetch(releasesEndpoint, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Release information is temporarily unavailable.');

  const releases = await response.json();
  if (!Array.isArray(releases)) throw new Error('Unexpected release response.');

  const match = releases
    .filter((release) => !release.draft && !release.prerelease && isRemoteSchoolsRelease(release))
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))[0];
  if (!match) return null;

  const assets = match.assets || [];
  return {
    tag: match.tag_name,
    url: match.html_url,
    date: match.published_at || match.created_at,
    apk: assets.find((asset) => /\.apk$/i.test(asset.name)),
    exe: assets.find((asset) => /\.exe$/i.test(asset.name))
  };
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DownloadSkeleton() {
  return (
    <div className="store-download-grid" aria-label="Loading app downloads">
      <span className="store-download-skeleton"></span>
      <span className="store-download-skeleton"></span>
    </div>
  );
}

function StoreDownload({ title, detail, asset, href, action, featured = false, external = false }) {
  const className = `store-download ${featured ? 'store-download-featured' : ''} ${asset || href ? '' : 'store-download-unavailable'}`;
  const content = (
    <>
      <span className="store-platform-copy">
        <span className="store-platform-title">{title}</span>
        <span className="store-platform-detail">{detail}</span>
      </span>
      <span className="store-platform-action">{action} <span aria-hidden="true">{asset || href ? '↓' : '·'}</span></span>
    </>
  );

  return asset || href
    ? <a className={className} href={asset?.browser_download_url || href} {...(external || asset ? { target: '_blank', rel: 'noreferrer' } : {})}>{content}</a>
    : <div className={className} aria-disabled="true">{content}</div>;
}

export default function RemoteSchoolsPage() {
  const [status, setStatus] = useState('loading');
  const [release, setRelease] = useState(null);
  const [device] = useState(detectVisitorDevice);

  useEffect(() => {
    document.title = 'Remote Schools — Uganda curriculum learning app';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'Explore Remote Schools: Uganda curriculum lessons, books, practice, past papers, and app downloads for offline study.';

    let active = true;
    loadLatestRemoteSchoolsRelease()
      .then((data) => {
        if (!active) return;
        setRelease(data);
        setStatus(data ? 'ready' : 'empty');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => { active = false; };
  }, []);

  const deviceName = device === 'android' ? 'Android phone' : device === 'windows' ? 'Windows PC' : 'Web browser';
  const deviceAsset = device === 'android' ? release?.apk : device === 'windows' ? release?.exe : null;
  const primaryAction = deviceAsset
    ? {
        label: device === 'android' ? 'Download for Android' : 'Download for Windows',
        href: deviceAsset.browser_download_url,
        detail: `${release.tag} · ${formatSize(deviceAsset.size)}`,
        external: true
      }
    : {
        label: 'Open the web app',
        href: webAppUrl,
        detail: device === 'web' ? 'Use it in your browser' : 'Install files will appear here when published',
        external: true
      };
  const publishedDate = release?.date
    ? new Date(release.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="portfolio-shell remote-shell remote-store">
      <RemoteSchoolsHeader />
      <main className="portfolio-main remote-main">
        <section className="remote-store-hero" id="overview">
          <div className="remote-store-copy">
            <p className="portfolio-eyebrow">Remote Schools Uganda · Learning app</p>
            <h1>School materials, <span>all in one place.</span></h1>
            <p className="remote-store-lede">Explore lessons, practice questions, books, and past papers from Uganda’s curriculum. Download class materials to keep studying when you’re offline.</p>
            <div className="remote-store-device">
              <span className="remote-device-dot" aria-hidden="true"></span>
              <span>Recommended for <strong>{deviceName}</strong></span>
              {release?.tag && <span className="remote-store-version">{release.tag}</span>}
            </div>
            <div className="remote-store-actions">
              <a
                className="remote-store-primary"
                href={primaryAction.href}
                target={primaryAction.external ? '_blank' : undefined}
                rel={primaryAction.external ? 'noreferrer' : undefined}
              >
                <span className="store-button-icon" aria-hidden="true">{deviceAsset ? '↓' : '↗'}</span>
                <span><strong>{primaryAction.label}</strong><small>{primaryAction.detail}</small></span>
              </a>
              <a className="remote-store-secondary" href="#screenshots">See the app <span aria-hidden="true">↓</span></a>
            </div>
            <div className="remote-store-facts">
              <span>Uganda P1–S4 curriculum</span>
              <span>Lessons &amp; practice</span>
              <span>Offline study</span>
            </div>
          </div>
          <figure className="remote-store-preview">
            <img src={screenshots[0].src} alt={screenshots[0].alt} fetchPriority="high" />
            <figcaption><span>IN THE APP</span><strong>Home · learning · offline downloads</strong></figcaption>
          </figure>
        </section>

        <section className="remote-store-highlights" id="features" aria-label="What is included">
          <article>
            <span className="store-highlight-number">01</span>
            <div><h2>Lessons by class</h2><p>Browse Uganda curriculum topics across primary and secondary levels.</p></div>
          </article>
          <article>
            <span className="store-highlight-number">02</span>
            <div><h2>Study materials</h2><p>Find books, notes, past papers, and exam practice by subject.</p></div>
          </article>
          <article>
            <span className="store-highlight-number">03</span>
            <div><h2>Offline access</h2><p>Download class materials once and keep learning without an internet connection.</p></div>
          </article>
        </section>

        <section className="remote-store-screenshots" id="screenshots">
          <div className="remote-store-section-heading">
            <div><p className="portfolio-eyebrow">Inside Remote Schools</p><h2>Take a closer look.</h2></div>
            <p>Real screens from the app, with the same warm, easy-to-read study space.</p>
          </div>
          <div className="remote-screenshot-track">
            {screenshots.map((shot, index) => (
              <figure className="remote-screenshot-card" key={shot.src}>
                <a href={shot.src} target="_blank" rel="noreferrer" aria-label={`View full screenshot: ${shot.title}`}>
                  <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
                  <span className="remote-screenshot-zoom" aria-hidden="true">↗</span>
                </a>
                <figcaption><span className="remote-screenshot-index">{String(index + 1).padStart(2, '0')}</span><div><strong>{shot.title}</strong><p>{shot.description}</p></div></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="remote-store-downloads" id="downloads">
          <div className="remote-store-section-heading">
            <div><p className="portfolio-eyebrow">Get Remote Schools</p><h2>Choose your version.</h2></div>
            <p>Pick the app for your device, or open the web version. Downloads use the latest published Remote Schools release.</p>
          </div>
          {status === 'loading' && <DownloadSkeleton />}
          {status === 'ready' && release && (
            <>
              <div className="store-release-summary">
                <span className="store-release-mark" aria-hidden="true">RS</span>
                <div><strong>Remote Schools</strong><span>{release.tag}{publishedDate ? ` · Published ${publishedDate}` : ''}</span></div>
                {release.url && <a href={release.url} target="_blank" rel="noreferrer">Release details ↗</a>}
              </div>
              <div className="store-download-grid">
                <StoreDownload
                  title="Android app"
                  detail={release.apk ? `${release.apk.name} · ${formatSize(release.apk.size)}` : 'Not included in the latest release'}
                  asset={release.apk}
                  action={release.apk ? 'Download APK' : 'Unavailable'}
                  featured={device === 'android'}
                />
                <StoreDownload
                  title="Windows app"
                  detail={release.exe ? `${release.exe.name} · ${formatSize(release.exe.size)}` : 'Not included in the latest release'}
                  asset={release.exe}
                  action={release.exe ? 'Download EXE' : 'Unavailable'}
                  featured={device === 'windows'}
                />
                <StoreDownload
                  title="Web app"
                  detail="Open Remote Schools in your browser"
                  href={webAppUrl}
                  action="Open web app"
                  external
                  featured={device === 'web'}
                />
              </div>
            </>
          )}
          {status === 'empty' && (
            <>
              <div className="store-download-grid">
                <StoreDownload title="Android app" detail="No installer is attached to the latest release yet" action="Coming soon" />
                <StoreDownload title="Windows app" detail="No installer is attached to the latest release yet" action="Coming soon" />
                <StoreDownload title="Web app" detail="Open Remote Schools in your browser" href={webAppUrl} action="Open web app" external featured={device === 'web'} />
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="store-download-grid">
                <StoreDownload title="Android app" detail="Release details could not be loaded right now" href="https://github.com/trebronwayne/trebronwayne.github.io/releases" action="View releases" external featured={device === 'android'} />
                <StoreDownload title="Windows app" detail="Release details could not be loaded right now" href="https://github.com/trebronwayne/trebronwayne.github.io/releases" action="View releases" external featured={device === 'windows'} />
                <StoreDownload title="Web app" detail="Open Remote Schools in your browser" href={webAppUrl} action="Open web app" external featured={device === 'web'} />
              </div>
            </>
          )}
          <p className="remote-store-note">For Android, Windows, and web. The app download cards only show files from a Remote Schools release.</p>
        </section>
      </main>
      <RemoteSchoolsFooter />
    </div>
  );
}
