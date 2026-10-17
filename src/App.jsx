import { useEffect, useMemo, useState } from 'react';

const asset = (path) => (import.meta.env.BASE_URL + path).replace('//assets', '/assets');
const repo = 'https://github.com/trebronwayne/bluebird-release';
const releasesUrl = repo + '/releases';
const latestVersion = '2.3';

const releases = [
  {
    version: '2.3',
    status: 'Latest',
    note: 'Major update',
    date: 'See release page',
    releaseUrl: releasesUrl + '/tag/v2.3'
  },
  {
    version: '2.2',
    status: 'Previous',
    note: 'Major update',
    date: 'See release page',
    releaseUrl: releasesUrl + '/tag/v2.2'
  },
  {
    version: '2.1',
    status: 'Previous',
    note: 'Latest improvements and fixes',
    date: 'September 2026',
    releaseUrl: releasesUrl + '/tag/v2.1',
    fallbackUrl: asset('assets/apks/Bluebird-v2.1.apk')
  },
  {
    version: '2.0',
    status: 'Previous',
    note: 'Desktop-style launcher, refreshed',
    date: 'August 2026',
    releaseUrl: releasesUrl + '/tag/v2.0',
    fallbackUrl: asset('assets/apks/Bluebird-v2.0.apk')
  }
];

const screenshots = [
  { src: 'assets/img/screenshots/desktop.png', title: 'Desktop', description: 'The Android home screen with a taskbar, application shortcuts, wallpaper, and floating windows.', className: 'landscape wide' },
  { src: 'assets/img/screenshots/startmenu.png', title: 'Start menu', description: 'Application, settings, and document search from one location.', className: 'landscape' },
  { src: 'assets/img/screenshots/explorer.png', title: 'File Explorer', description: 'File browsing with folders, quick access, and recent files.', className: 'landscape' },
  { src: 'assets/img/screenshots/editor.png', title: 'Widgets', description: 'Time, photos, tasks, alarms, and network information.', className: 'portrait' },
  { src: 'assets/img/screenshots/settings.png', title: 'Settings', description: 'Controls for the background, appearance, and quick settings.', className: 'landscape' }
];

const features = [
  { number: '01', title: 'Floating windows', text: 'Open supported applications in resizable windows while keeping the home screen and taskbar available.' },
  { number: '02', title: 'Android launcher', text: 'Set Bluebird as the Android home application. Root access and additional hardware are not required.' },
  { number: '03', title: 'Built-in applications', text: 'Includes Explorer, terminal, word processor, media player, and an application store for lightweight web apps.' }
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function DownloadButton({ release, secondary = false }) {
  const hasApk = Boolean(release.downloadUrl || release.fallbackUrl);
  const href = release.downloadUrl || release.fallbackUrl || release.releaseUrl;
  return (
    <a className={'button ' + (secondary ? 'button-secondary' : 'button-primary')} href={href} download={!release.downloadUrl && Boolean(release.fallbackUrl)}>
      {hasApk ? 'Download APK' : 'View release'} <Arrow />
    </a>
  );
}

function ScreenshotCard({ shot, featured = false }) {
  return (
    <article className={'screenshot-card ' + (featured ? 'featured' : '')}>
      <div className={'screenshot-frame ' + shot.className}>
        <div className="window-bar" aria-hidden="true"><span></span><span></span><span></span><em>{'bluebird / ' + shot.title.toLowerCase()}</em></div>
        <div className="image-wrap"><img src={asset(shot.src)} alt={'Bluebird ' + shot.title + ' screenshot'} loading="lazy" /></div>
      </div>
      <div className="screenshot-copy">
        <h3>{shot.title}</h3>
        <p>{shot.description}</p>
      </div>
    </article>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadData, setDownloadData] = useState(null);
  const [siteViews, setSiteViews] = useState(null);

  useEffect(() => {
    document.title = 'Bluebird — Android launcher releases';
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-MR4ZZ7151Y');

    const goatCounterScript = document.createElement('script');
    goatCounterScript.dataset.goatcounter = 'https://bluebird.goatcounter.com/count';
    goatCounterScript.async = true;
    goatCounterScript.src = 'https://gc.zgo.at/count.js';
    document.head.appendChild(goatCounterScript);

    const googleTagScript = document.createElement('script');
    googleTagScript.async = true;
    googleTagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-MR4ZZ7151Y';
    document.head.appendChild(googleTagScript);

    const viewTimer = window.setTimeout(() => {
      fetch('https://bluebird.goatcounter.com/counter/TOTAL.json', { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          const count = Number(String(data?.count ?? '').replace(/,/g, ''));
          if (Number.isFinite(count)) setSiteViews(count);
        })
        .catch(() => {});
    }, 1500);

    const fallback = fetch(asset('downloads.json'), { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .catch(() => null);
    fetch('https://api.github.com/repos/trebronwayne/bluebird-release/releases?per_page=100', { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('GitHub release data unavailable')))
      .then((githubReleases) => {
        const releaseData = githubReleases.map((release) => {
          const apkAssets = (release.assets || []).filter((item) => item.name.toLowerCase().endsWith('.apk'));
          return {
            version: release.tag_name.replace(/^v/, ''),
            date: new Date(release.published_at || release.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            downloads: apkAssets.reduce((total, item) => total + item.download_count, 0),
            downloadUrl: apkAssets[0]?.browser_download_url,
            releaseUrl: release.html_url
          };
        });
        if (releaseData.length > 0) {
          setDownloadData({
            status: 'live',
            totalApkDownloads: releaseData.reduce((total, release) => total + release.downloads, 0),
            updatedAt: new Date().toISOString(),
            releases: releaseData
          });
        } else {
          return fallback.then((data) => setDownloadData(data));
        }
      })
      .catch(() => fallback.then((data) => setDownloadData(data)));

    return () => window.clearTimeout(viewTimer);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const releaseData = downloadData?.releases || [];
  const mergedReleases = useMemo(() => releases.map((release) => {
    const current = releaseData.find((item) => item.version === release.version);
    return { ...release, ...(current || {}) };
  }), [releaseData]);
  const latestRelease = mergedReleases.find((release) => release.version === latestVersion) || mergedReleases[0];
  const totalDownloads = downloadData?.totalApkDownloads;
  const updatedDate = downloadData?.updatedAt ? new Date(downloadData.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu}>
          <span className="brand-mark"><img src={asset('assets/img/logo_1.png')} alt="" /></span>
          <span><strong>Bluebird</strong><small>Android launcher</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span>
        </button>
        <nav className={menuOpen ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
          <a href="#releases" onClick={closeMenu}>Releases</a>
          <a href="#installation" onClick={closeMenu}>Installation</a>
          <a href="#privacy" onClick={closeMenu}>Privacy</a>
          <a href={repo} target="_blank" rel="noreferrer" onClick={closeMenu}>Source</a>
          <a className="nav-download" href={latestRelease.downloadUrl || latestRelease.fallbackUrl || latestRelease.releaseUrl} download={!latestRelease.downloadUrl && Boolean(latestRelease.fallbackUrl)} onClick={closeMenu}>{latestRelease.downloadUrl || latestRelease.fallbackUrl ? 'Download APK' : 'View latest release'}</a>
        </nav>
      </header>

      <main>
        <section className="hero section" id="home">
          <div className="hero-copy">
            <p className="kicker">Official release site</p>
            <h1>Bluebird for <span>Android.</span></h1>
            <p className="hero-lede">A desktop-style Android launcher with floating windows, a taskbar, and built-in applications.</p>
            <div className="hero-actions">
              <DownloadButton release={latestRelease} />
              <a className="text-link" href="#releases">View release history <Arrow /></a>
            </div>
            <div className="hero-meta"><span>Latest v{latestVersion}</span><i></i><span>Android 8.0+</span><i></i><span>No root required</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-frame">
              <div className="window-bar"><span></span><span></span><span></span><em>bluebird / desktop</em></div>
              <img src={asset('assets/img/screenshots/desktop.png')} alt="Bluebird desktop-style Android home screen" />
            </div>
          </div>
        </section>

        <section className="stats section-compact" aria-label="Release information">
          <div><strong>v{latestVersion}</strong><span>Latest release</span></div>
          <div><strong>26+</strong><span>Android API</span></div>
          <div><strong>{totalDownloads === undefined ? '—' : formatNumber(totalDownloads)}</strong><span>Total APK downloads</span></div>
          <div><strong>0</strong><span>Root permissions</span></div>
          <div><strong>{siteViews === null ? '—' : formatNumber(siteViews)}</strong><span>Site views</span></div>
        </section>

        <section className="section release-section" id="releases">
          <div className="section-heading">
            <div><p className="kicker">Release history</p><h2>Available <span>releases.</span></h2></div>
            <p className="section-intro">APK files and release information for Bluebird. Download counts are provided by GitHub release assets.</p>
          </div>
          <div className="release-summary">
            <div><span className="summary-label">Total APK downloads</span><strong>{totalDownloads === undefined ? '—' : formatNumber(totalDownloads)}</strong><span className="summary-detail">{updatedDate ? 'Updated ' + updatedDate : 'Download data pending first release sync'}</span></div>
            <div><span className="summary-label">Latest version</span><strong>v{latestVersion}</strong><span className="summary-detail">Android 8.0 or later · No root access</span></div>
          </div>
          <div className="release-table" role="table" aria-label="Bluebird releases">
            <div className="release-table-head" role="row"><span>Version</span><span>Release date</span><span>Status</span><span>Downloads</span><span aria-label="Actions"></span></div>
            {mergedReleases.map((release) => <div className="release-row" role="row" key={release.version}>
              <strong>v{release.version}</strong>
              <span>{release.date}</span>
              <span><b className={release.version === latestVersion ? 'status-latest' : 'status-previous'}>{release.status}</b></span>
              <span className="release-count">{release.downloads === undefined ? '—' : formatNumber(release.downloads)}</span>
              <span className="release-actions"><a href={release.downloadUrl || release.fallbackUrl || release.releaseUrl} download={!release.downloadUrl && Boolean(release.fallbackUrl)}>{release.downloadUrl || release.fallbackUrl ? 'Download' : 'APK pending'}</a><a href={release.releaseUrl} target="_blank" rel="noreferrer">Notes</a></span>
            </div>)}
          </div>
          <p className="data-note">Download counts are asset-download totals, not unique users or installations. <a href={repo + '/releases'} target="_blank" rel="noreferrer">View releases on GitHub <Arrow /></a></p>
        </section>

        <section className="section showcase" id="showcase">
          <div className="section-heading">
            <div><p className="kicker">Application overview</p><h2>Included <span>features.</span></h2></div>
            <p className="section-intro">A visual overview of the launcher and its included applications.</p>
          </div>
          <div className="showcase-grid">
            {screenshots.map((shot, index) => <ScreenshotCard key={shot.title} shot={shot} featured={index === 0} />)}
          </div>
        </section>

        <section className="section features" id="features">
          <div className="section-heading split-heading"><div><p className="kicker">Functionality</p><h2>Launcher <span>features.</span></h2></div><p className="section-intro">Bluebird provides a desktop-style surface while remaining an Android home application.</p></div>
          <div className="feature-grid">
            {features.map((feature) => <article className="feature" key={feature.number}><span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
          </div>
        </section>

        <section className="section docs-section" id="installation">
          <div className="docs-panel">
            <div className="section-heading"><div><p className="kicker">Installation</p><h2>Install <span>Bluebird.</span></h2></div><p className="section-intro">Download the APK, install it on an Android device, and select Bluebird as the default home application.</p></div>
            <div className="steps"><div><b>01</b><strong>Download the APK</strong><p>Choose a release from the table above.</p></div><div><b>02</b><strong>Install the package</strong><p>Use the file manager or install with ADB.</p></div><div><b>03</b><strong>Select the home app</strong><p>Settings → Apps → Default Apps → Home App → Bluebird.</p></div></div>
            <div className="code-line"><span>adb install Bluebird-v{latestVersion}.apk</span><button type="button" onClick={() => navigator.clipboard?.writeText('adb install Bluebird-v' + latestVersion + '.apk')}>Copy</button></div>
          </div>
        </section>

        <section className="legal section-compact" id="privacy">
          <div><p className="kicker">Privacy</p><h2>Privacy and<br /><span>data handling.</span></h2></div>
          <p>Bluebird does not collect personal data or telemetry from inside the application. Files, settings, and application data remain on the device. This release site uses GoatCounter and Google Analytics to measure visits; downloads and visits to GitHub are subject to their respective privacy policies.</p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><a className="brand" href="#home"><span className="brand-mark"><img src={asset('assets/img/logo_1.png')} alt="" /></span><span><strong>Bluebird</strong><small>Android launcher</small></span></a><p>Official release information</p><div className="footer-links"><a href={repo} target="_blank" rel="noreferrer">Source</a><a href="#privacy">Privacy</a><a href="#installation">Installation</a></div></div>
        <div className="footer-bottom"><span>© 2024–2026 Bluebird</span><span>Android launcher · Uganda</span></div>
      </footer>
    </div>
  );
}

export default App;