import styles from './HealthScore.module.css';

interface HealthScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

function getHealthColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function getHealthLabel(score: number): string {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'At Risk';
  return 'Critical';
}

export default function HealthScore({ score, size = 'medium', showLabel = true }: HealthScoreProps) {
  const color = getHealthColor(score);
  const label = getHealthLabel(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <div className={`${styles.container} ${sizeClasses[size]}`}>
      <svg className={styles.svg} viewBox="0 0 100 100">
        <circle
          className={styles.background}
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
        />
        <circle
          className={styles.progress}
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className={styles.content}>
        <span className={styles.score} style={{ color }}>
          {score}
        </span>
        {showLabel && (
          <span className={styles.label} style={{ color }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
