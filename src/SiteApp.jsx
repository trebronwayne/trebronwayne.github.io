import { useEffect, useState } from 'react';
import BluebirdPage from './App.jsx';
import CvPage from './CvPage.jsx';
import PortfolioPage, { SiteFooter, SiteHeader } from './PortfolioPage.jsx';
import RemoteSchoolsPage from './RemoteSchoolsPage.jsx';
import { NavigationProvider, SiteLink } from './site-router.jsx';

function normalizePath(pathname) {
  const path = pathname.replace(/\/+$/, '');
  return path || '/';
}

function NotFoundPage() {
  return (
    <div className="portfolio-shell">
      <SiteHeader />
      <main className="portfolio-main not-found">
        <p className="portfolio-eyebrow">404 · Page not found</p>
        <h1>This page isn’t here.</h1>
        <p>Check the address, or return to the portfolio.</p>
        <SiteLink className="portfolio-button portfolio-button-primary" to="/">Go to portfolio</SiteLink>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function SiteApp() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (target) => {
    const destination = new URL(target, window.location.origin);
    const nextPath = normalizePath(destination.pathname);
    const nextUrl = `${nextPath}${destination.search}${destination.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) window.history.pushState(null, '', nextUrl);
    setPath(nextPath);

    if (destination.hash) {
      window.setTimeout(() => {
        document.getElementById(decodeURIComponent(destination.hash.slice(1)))?.scrollIntoView();
      }, 0);
    } else {
      window.scrollTo(0, 0);
    }
  };

  let page;
  if (path === '/') page = <PortfolioPage />;
  else if (path === '/cv') page = <CvPage />;
  else if (path === '/remote-schools') page = <RemoteSchoolsPage />;
  else if (path === '/bluebird' || path === '/bluebird/home') page = <BluebirdPage page="home" />;
  else if (path === '/bluebird/about') page = <BluebirdPage page="about" />;
  else if (path === '/bluebird/support') page = <BluebirdPage page="support" />;
  else if (path === '/bluebird/releases') page = <BluebirdPage page="releases" />;
  else page = <NotFoundPage />;

  return <NavigationProvider navigate={navigate}>{page}</NavigationProvider>;
}
