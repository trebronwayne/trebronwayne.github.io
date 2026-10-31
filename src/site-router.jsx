import { createContext, useContext } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ navigate, children }) {
  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

export function SiteLink({ to, onClick, children, ...props }) {
  const navigate = useContext(NavigationContext);

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      !navigate ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (props.target && props.target !== '_self')
    ) return;

    const destination = new URL(to, window.location.origin);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  return <a href={to} {...props} onClick={handleClick}>{children}</a>;
}
