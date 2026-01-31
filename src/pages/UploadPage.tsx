import MediaUpload from '../components/MediaUpload';
import styles from './UploadPage.module.css';

export default function UploadPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <MediaUpload />
      </div>
    </div>
  );
}
