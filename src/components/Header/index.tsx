import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.headerContainer}`}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
