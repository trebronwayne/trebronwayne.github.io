import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useNavigationDismissal } from './useNavigationDismissal.js';

const repositoryUrl = 'https://github.com/trebronwayne/DropLink';
const releasesUrl = `${repositoryUrl}/releases`;
const releasesEndpoint = 'https://api.github.com/repos/trebronwayne/DropLink/releases?per_page=30';

const screenshots = [
  {
    src: '/assets/droplink/home.png',
    title: 'Home server',
    description: 'Start hosting and make this phone available on your local network.',
    alt: 'DropLink dark home screen showing the local server and network workspace.'
  },
  {
    src: '/assets/droplink/player-library.png',
    title: 'Media player',
    description: 'Browse and play music stored on your devices.',
    alt: 'DropLink player screen with a list of music tracks.'
  },
  {
    src: '/assets/droplink/continue-watching.png',
    title: 'Resume playback',
    description: 'Pick up from where you left off in the player.',
    alt: 'DropLink player screen with a continue-watching control.'
  },
  {
    src: '/assets/droplink/devices.png',
    title: 'Paired devices',
    description: 'Choose how each paired device can access files and device services.',
    alt: 'DropLink devices screen showing paired devices and permissions.'
  },
  {
    src: '/assets/droplink/transfers.png',
    title: 'File transfers',
    description: 'Send files directly to devices on your local network.',
    alt: 'DropLink transfers screen for sending files to paired devices.'
  }
];

function DropLinkHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useNavigationDismissal(menuOpen, closeMenu, '.droplink-header');

  return (
    <header className="droplink-header">
      <a className="droplink-brand" href="#overview" aria-label="DropLink overview" onClick={closeMenu}>
        <span className="droplink-brand-mark" aria-hidden="true">DL</span>
        <span className="droplink-brand-copy"><strong>DropLink</strong><small>Your phone. Your server. Your network.</small></span>
      </a>
      <nav id="droplink-navigation" className={`droplink-nav ${menuOpen ? 'droplink-nav--open' : ''}`} aria-label="DropLink navigation">
        <a href="#features" onClick={closeMenu}>Features</a>
        <a href="#screenshots" onClick={closeMenu}>Screenshots</a>
        <a className="droplink-nav-cta" href="#download" onClick={closeMenu}>Get DropLink <span aria-hidden="true">↓</span></a>
      </nav>
      <div className="droplink-header-actions">
        <ThemeToggle />
        <button
          className={`droplink-menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="droplink-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function loadLatestDropLinkRelease() {
  const response = await fetch(releasesEndpoint, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Release information is temporarily unavailable.');

  const releases = await response.json();
  if (!Array.isArray(releases)) throw new Error('Unexpected release response.');

  return releases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release) => ({
      ...release,
      apk: (release.assets || []).find((asset) => /\.apk$/i.test(asset.name || '')),
      checksum: (release.assets || []).find((asset) => /sha256sums?\.txt$/i.test(asset.name || ''))
    }))
    .filter((release) => release.apk)
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))[0] || null;
}

export default function DropLinkPage() {
  const [release, setRelease] = useState(null);
  const [releaseStatus, setReleaseStatus] = useState('loading');

  useEffect(() => {
    document.title = 'DropLink — Your phone. Your server. Your network.';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = 'Turn an Android phone into a private local server. DropLink lets nearby devices share files, play media, and connect over Wi-Fi.';
    }

    let active = true;
    loadLatestDropLinkRelease()
      .then((latest) => {
        if (!active) return;
        setRelease(latest);
        setReleaseStatus(latest ? 'ready' : 'empty');
      })
      .catch(() => {
        if (active) setReleaseStatus('error');
      });

    return () => { active = false; };
  }, []);

  const releaseDate = release?.published_at
    ? new Date(release.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const downloadUrl = release?.apk?.browser_download_url || releasesUrl;
  const downloadLabel = releaseStatus === 'loading'
    ? 'Finding the latest release'
    : release?.apk
      ? 'Download Android APK'
      : 'View DropLink releases';

  return (
    <div className="portfolio-shell droplink-shell">
      <DropLinkHeader />
      <main className="droplink-main">
        <section className="droplink-hero" id="overview">
          <div className="droplink-hero-copy">
            <p className="droplink-eyebrow">Android · Local networking</p>
            <h1>Your phone.<br /><span>Your server. Your network.</span></h1>
            <p>DropLink turns an Android phone into a private server for nearby devices. Share files, stream media, and host a local web page over Wi-Fi—without a cloud account or data plan.</p>
            <div className="droplink-latest-label" aria-live="polite">
              <span>Latest Android release</span>
              <strong>{release?.tag_name || (releaseStatus === 'loading' ? 'Checking…' : 'See GitHub releases')}</strong>
            </div>
            <div className="droplink-actions">
              <a className="droplink-primary" href={downloadUrl} target="_blank" rel="noreferrer">
                <span className="droplink-primary-icon" aria-hidden="true">↓</span>
                <span>
                  <strong>{downloadLabel}</strong>
                  <small>{release?.apk ? `${release.tag_name} · ${formatSize(release.apk.size)}` : 'Release downloads on GitHub'}</small>
                </span>
              </a>
              <a className="droplink-secondary" href={repositoryUrl} target="_blank" rel="noreferrer">View source ↗</a>
            </div>
            {releaseStatus === 'error' && <p className="droplink-release-error">Live release lookup is unavailable right now. The GitHub releases link still works.</p>}
          </div>
          <figure className="droplink-hero-media">
            <img src={screenshots[0].src} alt={screenshots[0].alt} fetchPriority="high" />
            <figcaption>Your phone. Your server. Your network.</figcaption>
          </figure>
        </section>

        <section className="droplink-features" id="features" aria-label="DropLink features">
          <article>
            <span className="droplink-feature-number">01</span>
            <h2>Host locally</h2>
            <p>Make your phone a private server other devices can reach on the same Wi-Fi or hotspot.</p>
          </article>
          <article>
            <span className="droplink-feature-number">02</span>
            <h2>Send files directly</h2>
            <p>Transfer files between paired devices, with resumable downloads.</p>
          </article>
          <article>
            <span className="droplink-feature-number">03</span>
            <h2>Play your media</h2>
            <p>Browse and stream music and video shared across your local network.</p>
          </article>
          <article>
            <span className="droplink-feature-number">04</span>
            <h2>Control access</h2>
            <p>Manage paired devices and choose which services each device can use.</p>
          </article>
        </section>

        <section className="droplink-section" id="screenshots">
          <div className="droplink-section-heading">
            <div><p className="droplink-eyebrow">Inside the app</p><h2>Built for your local network.</h2></div>
            <p>Explore the home server, player, paired devices, and transfer screens.</p>
          </div>
          <div className="droplink-screenshot-grid">
            {screenshots.map((shot) => (
              <figure className="droplink-screenshot-card" key={shot.src}>
                <a href={shot.src} target="_blank" rel="noreferrer" aria-label={`View full screenshot: ${shot.title}`}>
                  <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
                </a>
                <figcaption><strong>{shot.title}</strong><p>{shot.description}</p></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="droplink-download-panel" id="download">
          <div className="droplink-download-copy">
            <p className="droplink-eyebrow">Latest release</p>
            <h2>{release?.tag_name || (releaseStatus === 'loading' ? 'Checking GitHub…' : 'Get DropLink')}</h2>
            <p>{releaseDate ? `Published ${releaseDate}` : 'The page checks GitHub for the latest release whenever it loads.'}{release?.apk ? ` · Android APK · ${formatSize(release.apk.size)}` : ''}</p>
          </div>
          <div className="droplink-download-actions">
            <a className="droplink-primary" href={downloadUrl} target="_blank" rel="noreferrer">
              <span className="droplink-primary-icon" aria-hidden="true">↓</span>
              <span><strong>{downloadLabel}</strong><small>{release?.apk?.name || 'GitHub releases'}</small></span>
            </a>
            <div className="droplink-download-links">
              {release?.url && <a href={release.url} target="_blank" rel="noreferrer">Release notes</a>}
              {release?.checksum?.browser_download_url && <a href={release.checksum.browser_download_url} target="_blank" rel="noreferrer">SHA-256 checksums</a>}
              <a href={releasesUrl} target="_blank" rel="noreferrer">All releases</a>
            </div>
          </div>
        </section>
      </main>
      <footer className="droplink-footer">
        <span>DropLink · Private networking between your devices</span>
        <nav aria-label="DropLink footer navigation">
          <a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a href={releasesUrl} target="_blank" rel="noreferrer">Releases</a>
          <a href="/">Portfolio</a>
        </nav>
      </footer>
    </div>
  );
}
