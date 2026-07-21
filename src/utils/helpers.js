import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const getStatusClass = (status) => {
  const map = {
    New: 'status-new',
    Contacted: 'status-contacted',
    Qualified: 'status-qualified',
    Converted: 'status-converted',
    Closed: 'status-closed',
  };
  return map[status] || 'status-new';
};

export const getStatusColor = (status) => {
  const map = {
    New: '#60A5FA',
    Contacted: '#C084FC',
    Qualified: '#EAB308',
    Converted: '#4ADE80',
    Closed: '#94A3B8',
  };
  return map[status] || '#60A5FA';
};

export const getPriorityClass = (priority) => {
  const map = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  };
  return map[priority] || 'priority-medium';
};




export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const generateAvatar = (name) => {
  if (!name) return 'AD';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};

export const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'];
export const SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Phone Call',
  'Trade Show',
  'Other',
];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
