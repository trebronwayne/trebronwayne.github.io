import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import { detectVisitorDevice } from './device-detection.js';
import { useNavigationDismissal } from './useNavigationDismissal.js';

const releasesEndpoint = 'https://api.github.com/repos/trebronwayne/trebronwayne.github.io/releases';

function RemoteSchoolsHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useNavigationDismissal(menuOpen, closeMenu, '.remote-header');

  return (
    <header className="remote-header">
      <a className="remote-brand" href="#overview" aria-label="Remote Schools overview" onClick={closeMenu}>
        <span className="remote-brand-mark" aria-hidden="true">R</span>
        <span>Remote Schools</span>
      </a>
      <nav id="remote-navigation" className={`remote-nav ${menuOpen ? 'remote-nav--open' : ''}`} aria-label="Remote Schools navigation">
        <a href="#overview" onClick={closeMenu}>Overview</a>
        <a href="#features" onClick={closeMenu}>Features</a>
        <a className="remote-nav-cta" href="#downloads" onClick={closeMenu}>Downloads <span aria-hidden="true">↓</span></a>
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
      <nav aria-label="Footer navigation">
        <a href="#overview">Overview</a>
        <a href="#features">Features</a>
        <a href="#downloads">Downloads</a>
      </nav>
    </footer>
  );
}

function isRemoteSchoolsRelease(release) {
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const text = [release.name, release.tag_name, ...assets.map((asset) => asset.name)]
    .filter(Boolean)
    .join(' ');
  const hasProductName = /remote[\s_-]?schools?/i.test(text);
  const expectedVersionSeries = /^v?1\.0\.\d+$/i.test(release.tag_name || '');
  return (hasProductName || expectedVersionSeries) &&
    assets.some((asset) => /\.(apk|exe)$/i.test(asset.name || ''));
}

async function loadLatestRemoteSchoolsRelease() {
  const releases = [];
  let page = 1;

  while (page <= 10) {
    const response = await fetch(`${releasesEndpoint}?per_page=100&page=${page}`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error('Release information is temporarily unavailable.');

    const pageItems = await response.json();
    if (!Array.isArray(pageItems)) throw new Error('Unexpected release response.');
    releases.push(...pageItems);
    if (pageItems.length < 100) break;
    page += 1;
  }

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

function DownloadSkeleton() {
  return (
    <div className="download-skeletons" aria-label="Loading release downloads">
      <span className="skeleton-block"></span>
      <span className="skeleton-block"></span>
    </div>
  );
}

export default function RemoteSchoolsPage() {
  const [status, setStatus] = useState('loading');
  const [release, setRelease] = useState(null);
  const [device] = useState(detectVisitorDevice);

  useEffect(() => {
    document.title = 'Remote Schools — Uganda curriculum learning';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'Remote Schools is an e-learning platform for Uganda’s curriculum, with offline support and desktop and Android downloads.';

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

  const publishedDate = release?.date
    ? new Date(release.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const deviceName = device === 'android' ? 'Android' : device === 'windows' ? 'Windows' : 'Web browser';
  const deviceAsset = device === 'android' ? release?.apk : device === 'windows' ? release?.exe : null;
  const primaryAction = device === 'web'
    ? { label: 'Open the web app', href: 'https://remoteschools.dpdns.org', icon: '↗', external: true }
    : deviceAsset
      ? {
          label: device === 'android' ? 'Download Android APK' : 'Download Windows EXE',
          href: deviceAsset.browser_download_url,
          icon: '↓',
          external: false
        }
      : {
          label: device === 'android' ? 'Check Android APK' : 'Check Windows EXE',
          href: '#downloads',
          icon: '↓',
          external: false
        };

  return (
    <div className="portfolio-shell remote-shell">
      <RemoteSchoolsHeader />
      <main className="portfolio-main remote-main">
        <section className="remote-hero" id="overview">
          <div className="remote-hero-copy">
            <p className="portfolio-eyebrow">Learning platform · Uganda</p>
            <h1>Learning that<br /><span>can keep going.</span></h1>
            <p className="portfolio-lede">Remote Schools brings curriculum-aligned lessons, examples, and practice to learners, including when a reliable internet connection is not available.</p>
            <p className="remote-device-hint"><span className="remote-device-dot" aria-hidden="true"></span> Device detected: <strong>{deviceName}</strong></p>
            <div className="portfolio-actions">
              <a
                className="portfolio-button portfolio-button-primary"
                href={primaryAction.href}
                {...(primaryAction.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {primaryAction.label} <span aria-hidden="true">{primaryAction.icon}</span>
              </a>
              <a className="portfolio-text-link" href="#downloads">View all options <span aria-hidden="true">↓</span></a>
            </div>
            <div className="portfolio-meta"><span>Uganda P1–S4 curriculum</span><span>Offline support</span><span>Android and Windows</span></div>
          </div>
          <aside className="remote-summary">
            <span className="note-label">Study materials</span>
            <h2>Notes, examples, and practice in one place.</h2>
            <p>Browse lessons by class and keep learning materials close at hand.</p>
          </aside>
        </section>

        <section className="remote-content-grid" id="features">
          <article>
            <p className="portfolio-eyebrow">Curriculum-first</p>
            <h2>Made for Uganda’s classrooms.</h2>
            <p>Lessons are organized by class across the Uganda P1–S4 curriculum, with clear notes, worked examples, and practice questions.</p>
          </article>
          <article>
            <p className="portfolio-eyebrow">Offline support</p>
            <h2>Keep learning with limited access.</h2>
            <p>The platform is designed to support learning when connectivity is limited. Use the web version or install the Android and Windows apps when their release files are available.</p>
          </article>
          <article>
            <p className="portfolio-eyebrow">Your study space</p>
            <h2>Progress that stays yours.</h2>
            <p>The web experience supports saved progress and personal notes, so learners can return to their work later.</p>
          </article>
        </section>

        <section className="remote-download-section" id="downloads">
          <div className="portfolio-section-heading">
            <div><p className="portfolio-eyebrow">Desktop and Android</p><h2>Download Remote Schools</h2></div>
            <p>Download links appear automatically from the latest published Remote Schools release on GitHub.</p>
          </div>
          <div className="remote-release-card">
            <div className="remote-release-heading">
              <div>
                <span className="note-label">Latest release</span>
                <h3>{release?.tag || 'Release downloads'}</h3>
              </div>
              {publishedDate && <span className="release-date">{publishedDate}</span>}
            </div>

            {status === 'loading' && <DownloadSkeleton />}
            {status === 'ready' && release && (
              <div className="download-options">
                {release.apk
                  ? <a className="download-option" href={release.apk.browser_download_url}><span><strong>Android APK</strong><small>{release.apk.name}</small></span><b>Download ↗</b></a>
                  : <div className="download-option unavailable"><span><strong>Android APK</strong><small>Not attached to this release</small></span><b>Unavailable</b></div>}
                {release.exe
                  ? <a className="download-option" href={release.exe.browser_download_url}><span><strong>Windows EXE</strong><small>{release.exe.name}</small></span><b>Download ↗</b></a>
                  : <div className="download-option unavailable"><span><strong>Windows EXE</strong><small>Not attached to this release</small></span><b>Unavailable</b></div>}
              </div>
            )}
            {status === 'empty' && (
              <div className="release-message">
                <p>No Remote Schools release has been published yet. Android and Windows downloads will appear here as soon as the APK and EXE are attached to a published release.</p>
                <span>Expected first tag: <strong>v1.0.26</strong></span>
              </div>
            )}
            {status === 'error' && (
              <div className="release-message">
                <p>Release information could not be loaded right now. You can still open the web version.</p>
                <a href="https://github.com/trebronwayne/trebronwayne.github.io/releases" target="_blank" rel="noreferrer">View GitHub releases ↗</a>
              </div>
            )}
          </div>
          {release?.url && <p className="remote-release-note"><a href={release.url} target="_blank" rel="noreferrer">Release notes on GitHub ↗</a></p>}
        </section>

      </main>
      <RemoteSchoolsFooter />
    </div>
  );
}
