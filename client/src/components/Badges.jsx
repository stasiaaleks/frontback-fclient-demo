const STATUS_STYLES = {
  draft: 'text-bg-secondary',
  published: 'text-bg-success',
  archived: 'text-bg-dark'
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] ?? 'text-bg-light'}`}>{status}</span>;
}

export function TagBadges({ tags = [] }) {
  return tags.map((tag) => (
    <span key={tag} className="badge rounded-pill text-bg-info me-1">#{tag}</span>
  ));
}

const isLockActive = (lock) => Boolean(lock) && new Date(lock.expiresAt) > new Date();

export function LockBadge({ lock, currentUser }) {
  if (!isLockActive(lock)) return null;
  const mine = lock.owner === currentUser;
  return (
    <span className={`badge ${mine ? 'text-bg-primary' : 'text-bg-warning'}`}>
      {mine ? 'locked by you' : `locked by ${lock.owner}`}
    </span>
  );
}
