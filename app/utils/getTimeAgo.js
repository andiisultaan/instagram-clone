export const getTimeAgo = createdAt => {
  const postTime = typeof createdAt === "object" && createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (isNaN(postTime.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diff = Math.floor((now - postTime) / 1000); // diff in seconds

  if (diff < 60) {
    return diff === 1 ? "a second ago" : `${diff} seconds ago`;
  }

  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return minutes === 1 ? "a minute ago" : `${minutes} minutes ago`;
  }

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(diff / 86400);
  return days === 1 ? "yesterday" : `${days} days ago`;
};
