import VideoUpload from '../components/VideoUpload';
import styles from './UploadPage.module.css';

export default function UploadPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <VideoUpload />
      </div>
    </div>
  );
}
