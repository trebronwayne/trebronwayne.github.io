import { useEffect, useMemo, useState } from 'react';
import supporterSnapshot from './supportersSnapshot.json';
import { SiteLink } from './site-router.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useNavigationDismissal } from './useNavigationDismissal.js';

const asset = (path) => `/${path.replace(/^\/+/, '')}`;
const releaseRepo = 'https://github.com/trebronwayne/trebronwayne.github.io';
const sourceRepo = 'https://github.com/trebronwayne/bluebird';
const sourceApi = 'https://api.github.com/repos/trebronwayne/bluebird';
const releasesUrl = releaseRepo + '/releases';
const fallbackLatestVersion = '2.4';
const uptodownUrl = 'https://bluebird-desktop-pc-launcher.en.uptodown.com/android';
const uptodownBadgeUrl = 'https://stc.utdstc.com/img/mediakit/download-aao-small-w.png';

const releases = [
  {
    version: '2.4',
    status: 'Latest',
    note: 'See release page',
    date: 'See release page',
    releaseUrl: releasesUrl + '/tag/v2.4'
  },
  {
    version: '2.3',
    status: 'Previous',
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
    releaseUrl: releasesUrl + '/tag/v2.1'
  },
  {
    version: '2.0',
    status: 'Previous',
    note: 'Desktop-style launcher, refreshed',
    date: 'August 2026',
    releaseUrl: releasesUrl + '/tag/v2.0'
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

function DownloadButton({ secondary = false }) {
  return (
    <a className={'button ' + (secondary ? 'button-secondary' : 'button-primary')} href={uptodownUrl} target="_blank" rel="noopener noreferrer">
      Download on Uptodown <Arrow />
    </a>
  );
}

function UptodownBadge() {
  return (
    <a
      className="uptodown-badge"
      href={uptodownUrl}
      title="Download Bluebird - Desktop PC Launcher"
      aria-label="Download Bluebird - Desktop PC Launcher from Uptodown"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={uptodownBadgeUrl} alt="Download Bluebird - Desktop PC Launcher" loading="lazy" />
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

async function fetchAllGitHubPages(endpoint) {
  const items = [];
  let page = 1;

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(endpoint + separator + 'per_page=100&page=' + page, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error('GitHub community data unavailable');

    const pageItems = await response.json();
    if (!Array.isArray(pageItems)) throw new Error('Unexpected GitHub response');
    items.push(...pageItems);
    if (pageItems.length < 100) return items;
    page += 1;
  }
}

function buildSupporterMembers(stargazers, issueRecords) {
  const membersByLogin = new Map();
  const getMember = (user) => {
    if (!user?.login || user.type === 'Bot') return null;
    const key = user.login.toLowerCase();
    if (!membersByLogin.has(key)) {
      membersByLogin.set(key, {
        login: user.login,
        htmlUrl: 'https://github.com/' + encodeURIComponent(user.login),
        avatarUrl: user.avatar_url,
        starred: false,
        issuesOpened: 0
      });
    }
    return membersByLogin.get(key);
  };

  stargazers.forEach((user) => {
    const member = getMember(user);
    if (member) member.starred = true;
  });

  issueRecords.forEach((issue) => {
    if (issue.pull_request) return;
    const member = getMember(issue.user || issue);
    if (member) member.issuesOpened += Number.isInteger(issue.count) ? issue.count : 1;
  });

  return [...membersByLogin.values()].sort((a, b) =>
    b.issuesOpened - a.issuesOpened ||
    Number(b.starred) - Number(a.starred) ||
    a.login.localeCompare(b.login)
  );
}

function BluebirdPage({ page = 'home' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState([]);
  const [manualUserTotal, setManualUserTotal] = useState(998);
  const [siteViews, setSiteViews] = useState(null);
  const [showPreviousReleases, setShowPreviousReleases] = useState(false);
  const [supporterData, setSupporterData] = useState(() => ({
    members: buildSupporterMembers(supporterSnapshot.stargazers, supporterSnapshot.issueOpeners),
    stars: supporterSnapshot.stargazers.length,
    issueCount: supporterSnapshot.issueCount,
    issueRefreshFailed: false
  }));
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const pageTitles = {
      home: 'Bluebird — Android launcher',
      about: 'About Bluebird — Android launcher',
      support: 'Bluebird support and installation',
      releases: 'Bluebird releases'
    };
    const pageDescriptions = {
      home: 'Bluebird is a desktop-style Android launcher with floating windows, a taskbar, and built-in applications.',
      about: 'Explore Bluebird features, screenshots, and privacy information.',
      support: 'Installation steps and community support for the Bluebird Android launcher.',
      releases: 'Bluebird release history and Uptodown downloads for the Android launcher.'
    };
    document.title = pageTitles[page] || pageTitles.home;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = pageDescriptions[page] || pageDescriptions.home;
  }, [page]);

  useEffect(() => {
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

    fetch(asset('downloads.json'), { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const count = Number(data?.totalUsers);
        if (Number.isSafeInteger(count) && count >= 0) setManualUserTotal(count);
      })
      .catch(() => {});

    fetch('https://api.github.com/repos/trebronwayne/trebronwayne.github.io/releases?per_page=100', { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('GitHub release data unavailable')))
      .then((githubReleases) => {
        const apiReleases = githubReleases
          .filter((release) => !release.draft && !release.prerelease)
          .map((release) => {
          const assets = release.assets || [];
          const isBluebird = /bluebird/i.test([release.name, release.tag_name, ...assets.map((item) => item.name)].filter(Boolean).join(' '));
          if (!isBluebird) return null;
          return {
            version: (release.tag_name || '').replace(/^v/i, ''),
            status: 'Previous',
            date: new Date(release.published_at || release.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            releaseUrl: release.html_url,
            publishedAt: release.published_at || release.created_at
          };
        })
          .filter(Boolean)
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        if (apiReleases.length > 0) setReleaseInfo(apiReleases);
      })
      .catch(() => {});

    return () => window.clearTimeout(viewTimer);
  }, []);

  useEffect(() => {
    if (page !== 'support') return undefined;
    let cancelled = false;

    fetchAllGitHubPages(sourceApi + '/issues?state=all&direction=desc&sort=created').then((issues) => {
      const issueRecords = issues.filter((issue) => !issue.pull_request && issue.user?.login);
      if (!cancelled) setSupporterData({
        members: buildSupporterMembers(supporterSnapshot.stargazers, issueRecords),
        stars: supporterSnapshot.stargazers.length,
        issueCount: issueRecords.length,
        issueRefreshFailed: false
      });
    }).catch(() => {
      if (!cancelled) setSupporterData((current) => ({ ...current, issueRefreshFailed: true }));
    });

    return () => { cancelled = true; };
  }, [page]);

  const closeMenu = () => setMenuOpen(false);
  useNavigationDismissal(menuOpen, closeMenu, '.site-header');
  const shareBluebird = async () => {
    const shareUrl = 'https://trebronwayne.github.io/bluebird';
    const shareData = {
      title: 'Bluebird — Android launcher',
      text: 'Try Bluebird, a desktop-style Android launcher with floating windows and a taskbar.',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Thanks for helping Bluebird reach more people.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Site link copied. Share it with someone who might enjoy Bluebird.');
      } else {
        setShareMessage('Share Bluebird: ' + shareUrl);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Copy this link to share Bluebird: ' + shareUrl);
    }
  };
  const mergedReleases = useMemo(() => {
    if (releaseInfo.length > 0) {
      return releaseInfo.map((release, index) => ({
        ...release,
        status: index === 0 ? 'Latest' : 'Previous'
      }));
    }
    return releases;
  }, [releaseInfo]);
  const latestRelease = mergedReleases[0] || releases[0];
  const latestVersion = latestRelease?.version || fallbackLatestVersion;

  return (
    <div className="site-shell">
      <header className="site-header">
        <SiteLink className="brand" to="/bluebird/home" onClick={closeMenu}>
          <span className="brand-mark"><img src={asset('assets/img/logo_1.png')} alt="" /></span>
          <span><strong>Bluebird</strong><small>Android launcher</small></span>
        </SiteLink>
        <nav id="bluebird-navigation" className={menuOpen ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
          <SiteLink to="/bluebird/home" onClick={closeMenu}>Home</SiteLink>
          <SiteLink to="/bluebird/releases" onClick={closeMenu}>Releases</SiteLink>
          <SiteLink to="/bluebird/about" onClick={closeMenu}>About</SiteLink>
          <SiteLink to="/bluebird/support" onClick={closeMenu}>Support</SiteLink>
          <a href={sourceRepo} target="_blank" rel="noreferrer" onClick={closeMenu}>Source</a>
          <a className="nav-download" href={uptodownUrl} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Download on Uptodown</a>
        </nav>
        <div className="site-header-actions">
          <div className="bluebird-theme-toggle"><ThemeToggle /></div>
          <button
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="bluebird-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true"></span><span aria-hidden="true"></span>
          </button>
        </div>
      </header>

      <main>
        {page === 'home' && <section className="hero section" id="home">
          <div className="hero-copy">
            <p className="kicker">Official release site</p>
            <h1>Bluebird for <span>Android.</span></h1>
            <p className="hero-lede">A desktop-style Android launcher with floating windows, a taskbar, and built-in applications.</p>
            <div className="hero-actions">
              <UptodownBadge />
              <SiteLink className="text-link" to="/bluebird/releases">View release history <Arrow /></SiteLink>
            </div>
            <div className="hero-meta"><span>Latest v{latestVersion}</span><i></i><span>Android 8.0+</span><i></i><span>No root required</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-frame">
              <div className="window-bar"><span></span><span></span><span></span><em>bluebird / desktop</em></div>
              <img src={asset('assets/img/screenshots/desktop.png')} alt="Bluebird desktop-style Android home screen" />
            </div>
          </div>
        </section>}

        {page === 'home' && <section className="stats section-compact" aria-label="Release information">
          <div><strong>v{latestVersion}</strong><span>Latest release</span></div>
          <div><strong>26+</strong><span>Android API</span></div>
          <div><strong>{formatNumber(manualUserTotal)}</strong><span>Total users across channels</span></div>
          <div><strong>0</strong><span>Root permissions</span></div>
          <div><strong>{siteViews === null ? <span className="bluebird-skeleton" aria-hidden="true"></span> : formatNumber(siteViews)}</strong><span>Site views</span></div>
        </section>}

        {page === 'home' && <section className="section bluebird-latest">
          <div>
            <p className="kicker">Latest release</p>
            <h2>Bluebird <span>v{latestVersion}.</span></h2>
            <p className="section-intro">A desktop-style Android launcher with floating windows, a taskbar, and built-in applications.</p>
          </div>
          <div className="bluebird-latest-actions">
            <DownloadButton />
            <SiteLink className="text-link" to="/bluebird/releases">View all releases <Arrow /></SiteLink>
          </div>
        </section>}

        {page === 'releases' && <section className="section release-section" id="releases">
          <div className="section-heading">
            <div><p className="kicker">Release history</p><h2>Available <span>releases.</span></h2></div>
            <p className="section-intro">Browse Bluebird release history and get the app from its official Uptodown store page.</p>
          </div>
          <div className="release-summary">
            <div><span className="summary-label">Total users across channels</span><strong>{formatNumber(manualUserTotal)}</strong><span className="summary-detail">Manually reported across all distribution channels</span></div>
            <div><span className="summary-label">Latest version</span><strong>v{latestVersion}</strong><span className="summary-detail">Android 8.0 or later · No root access</span></div>
          </div>
          <div className="release-table" role="table" aria-label="Bluebird release history">
            <div className="release-table-head" role="row"><span>Version</span><span>Release date</span><span>Status</span><span aria-label="Actions"></span></div>
            {(showPreviousReleases ? mergedReleases : mergedReleases.slice(0, 1)).map((release) => <div className="release-row" role="row" key={release.version}>
              <strong>v{release.version}</strong>
              <span>{release.date}</span>
              <span><b className={release.version === latestVersion ? 'status-latest' : 'status-previous'}>{release.status}</b></span>
              <span className="release-actions"><a href={uptodownUrl} target="_blank" rel="noopener noreferrer">Get on Uptodown</a><a href={release.releaseUrl} target="_blank" rel="noreferrer">Notes</a></span>
            </div>)}
          </div>
          <button className="release-toggle" type="button" aria-expanded={showPreviousReleases} onClick={() => setShowPreviousReleases(!showPreviousReleases)}>
            {showPreviousReleases ? 'Hide previous versions' : 'Show previous versions'} <span aria-hidden="true">{showPreviousReleases ? '−' : '+'}</span>
          </button>
          <p className="data-note">The 998 figure is a manually reported total of users across all distribution channels, not an automated download counter. <a href={releaseRepo + '/releases'} target="_blank" rel="noreferrer">View release notes on GitHub <Arrow /></a></p>
        </section>}

        {page === 'about' && <section className="section showcase" id="showcase">
          <div className="section-heading">
            <div><p className="kicker">Application overview</p><h2>Included <span>features.</span></h2></div>
            <p className="section-intro">A visual overview of the launcher and its included applications.</p>
          </div>
          <div className="showcase-grid">
            {screenshots.map((shot, index) => <ScreenshotCard key={shot.title} shot={shot} featured={index === 0} />)}
          </div>
        </section>}

        {page === 'about' && <section className="section features" id="features">
          <div className="section-heading split-heading"><div><p className="kicker">Functionality</p><h2>Launcher <span>features.</span></h2></div><p className="section-intro">Bluebird provides a desktop-style surface while remaining an Android home application.</p></div>
          <div className="feature-grid">
            {features.map((feature) => <article className="feature" key={feature.number}><span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
          </div>
        </section>}

        {page === 'support' && <section className="section support-section" id="support">
          <div className="support-panel">
            <div className="section-heading">
              <div><p className="kicker">Community</p><h2>Help Bluebird <span>grow.</span></h2></div>
              <p className="section-intro">Bluebird grows when people share it, star the open-source project, and help improve it. Every recommendation and useful issue helps the next person find Bluebird.</p>
            </div>
            <div className="support-actions">
              <button className="button button-primary" type="button" onClick={shareBluebird}>Share Bluebird <Arrow /></button>
              <a className="button button-secondary" href={sourceRepo} target="_blank" rel="noreferrer">Star on GitHub <Arrow /></a>
              <a className="support-issue-link" href={sourceRepo + '/issues/new'} target="_blank" rel="noreferrer">Report an issue <Arrow /></a>
            </div>
            {shareMessage && <p className="support-feedback" aria-live="polite">{shareMessage}</p>}
            <div className="member-heading">
              <div><p className="kicker">Bluebird members</p><h3>People moving Bluebird forward.</h3></div>
              <p>{formatNumber(supporterData.members.length)} members · {formatNumber(supporterData.stars)} stars · {formatNumber(supporterData.issueCount)} issues opened</p>
            </div>
            {supporterData.members.length === 0 && <p className="member-state">Be the first community member—star the project or open an issue.</p>}
            {supporterData.members.length > 0 && <div className="member-grid">
              {supporterData.members.map((member) => (
                <a className="member-card" href={member.htmlUrl} target="_blank" rel="noreferrer" key={member.login}>
                  <img src={member.avatarUrl} alt="" loading="lazy" />
                  <span className="member-copy">
                    <strong>{member.login}</strong>
                    <span>{member.issuesOpened ? formatNumber(member.issuesOpened) + ' ' + (member.issuesOpened === 1 ? 'issue opened' : 'issues opened') : 'Community stargazer'}</span>
                    <span className="member-badges">
                      {member.starred && <b>Stargazer</b>}
                      {member.login.toLowerCase() === 'trebronwayne' && <b>Maintainer</b>}
                    </span>
                  </span>
                  <Arrow />
                </a>
              ))}
            </div>}
            {supporterData.issueRefreshFailed && <p className="member-state">Live issue-opener counts could not be refreshed; the latest saved credits are still shown.</p>}
            <p className="data-note">Stargazers are a snapshot from {supporterSnapshot.updatedAt}; issue-opener credits refresh from GitHub. Issue openers are ranked by the number of issues they opened. Shares are not tracked, so no account is listed for sharing alone.</p>
          </div>
        </section>}

        {page === 'support' && <section className="section docs-section" id="installation">
          <div className="docs-panel">
            <div className="section-heading"><div><p className="kicker">Installation</p><h2>Install <span>Bluebird.</span></h2></div><p className="section-intro">Download the APK, install it on an Android device, and select Bluebird as the default home application.</p></div>
            <div className="steps"><div><b>01</b><strong>Get the APK</strong><p><a href={uptodownUrl} target="_blank" rel="noopener noreferrer">Download Bluebird from Uptodown</a>.</p></div><div><b>02</b><strong>Install the package</strong><p>Use the file manager or install with ADB.</p></div><div><b>03</b><strong>Select the home app</strong><p>Settings → Apps → Default Apps → Home App → Bluebird.</p></div></div>
            <div className="code-line"><span>adb install Bluebird-v{latestVersion}.apk</span><button type="button" onClick={() => navigator.clipboard?.writeText('adb install Bluebird-v' + latestVersion + '.apk')}>Copy</button></div>
          </div>
        </section>}

        {page === 'about' && <section className="legal section-compact" id="privacy">
          <div><p className="kicker">Privacy</p><h2>Privacy and<br /><span>data handling.</span></h2></div>
          <p>Bluebird does not collect personal data or telemetry from inside the application. Files, settings, and application data remain on the device. This release site uses GoatCounter and Google Analytics to measure visits; app downloads are handled by Uptodown and are subject to its privacy policy.</p>
        </section>}
      </main>

      <footer className="site-footer">
        <div className="footer-main"><SiteLink className="brand" to="/bluebird/home"><span className="brand-mark"><img src={asset('assets/img/logo_1.png')} alt="" /></span><span><strong>Bluebird</strong><small>Android launcher</small></span></SiteLink><p>Official release information</p><div className="footer-links"><a href={sourceRepo} target="_blank" rel="noreferrer">Source</a><SiteLink to="/bluebird/support">Support</SiteLink><SiteLink to="/bluebird/about#privacy">Privacy</SiteLink><SiteLink to="/bluebird/support#installation">Installation</SiteLink></div></div>
        <div className="footer-bottom"><span>© 2024–2026 Bluebird</span><span>Android launcher · Uganda</span></div>
      </footer>
    </div>
  );
}

export default BluebirdPage;