import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="18" fill="#339898" />
            <path
              d="M12 28C12 28 14 22 20 22C26 22 28 28 28 28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 20C10 20 13 16 20 16C27 16 30 20 30 20"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14 14C14 14 16 12 20 12C24 12 26 14 26 14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="white" />
          </svg>
          <span className={styles.logoText}>ReefWatch AI</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Map
          </Link>
          <a
            href="/#live-feeds"
            className={styles.navLink}
          >
            Live Feed
          </a>
          <Link
            to="/historical"
            className={`${styles.navLink} ${isActive('/historical') ? styles.active : ''}`}
          >
            Historical
          </Link>
          <Link
            to="/alerts"
            className={`${styles.navLink} ${isActive('/alerts') ? styles.active : ''}`}
          >
            Alerts
          </Link>
          <Link
            to="/dashboard"
            className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            className={`${styles.navLink} ${isActive('/upload') ? styles.active : ''}`}
          >
            Upload
          </Link>
        </nav>

        <Link to="/upload" className={styles.uploadBtn}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Upload Video
        </Link>
      </div>
    </header>
  );
}
