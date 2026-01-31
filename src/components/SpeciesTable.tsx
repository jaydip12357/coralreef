import type { SpeciesCount } from '../types';
import styles from './SpeciesTable.module.css';

interface SpeciesTableProps {
  species: SpeciesCount[];
}

function getCategoryIcon(category: 'fish' | 'coral' | 'invertebrate'): string {
  switch (category) {
    case 'fish':
      return '🐠';
    case 'coral':
      return '🪸';
    case 'invertebrate':
      return '🦑';
    default:
      return '🌊';
  }
}

function getCategoryColor(category: 'fish' | 'coral' | 'invertebrate'): string {
  switch (category) {
    case 'fish':
      return '#3b82f6';
    case 'coral':
      return '#f97316';
    case 'invertebrate':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
}

export default function SpeciesTable({ species }: SpeciesTableProps) {
  const sortedSpecies = [...species].sort((a, b) => b.count - a.count);
  const totalCount = species.reduce((sum, s) => sum + s.count, 0);

  const categoryCounts = species.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{species.length}</span>
          <span className={styles.summaryLabel}>Species</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{totalCount}</span>
          <span className={styles.summaryLabel}>Individuals</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{categoryCounts['fish'] || 0}</span>
          <span className={styles.summaryLabel}>Fish Types</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{categoryCounts['coral'] || 0}</span>
          <span className={styles.summaryLabel}>Coral Types</span>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Species</th>
            <th>Category</th>
            <th>Count</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {sortedSpecies.map((s, index) => (
            <tr key={index}>
              <td className={styles.speciesName}>
                <span className={styles.speciesIcon}>{getCategoryIcon(s.category)}</span>
                {s.name}
              </td>
              <td>
                <span
                  className={styles.categoryBadge}
                  style={{ backgroundColor: getCategoryColor(s.category) }}
                >
                  {s.category}
                </span>
              </td>
              <td className={styles.count}>{s.count}</td>
              <td className={styles.distribution}>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(s.count / Math.max(...species.map((sp) => sp.count))) * 100}%`,
                      backgroundColor: getCategoryColor(s.category),
                    }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
