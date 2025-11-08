/**
 * Job titles available for clinic staff
 */
export const JOB_TITLES = [
  { value: 'Physical Therapist', label: 'Physical Therapist' },
  { value: 'Occupational Therapist', label: 'Occupational Therapist' },
  { value: 'Speech Therapist', label: 'Speech Therapist' },
  { value: 'Massage Therapist', label: 'Massage Therapist' },
  { value: 'Sports Therapist', label: 'Sports Therapist' },
  { value: 'Rehabilitation Therapist', label: 'Rehabilitation Therapist' },
  { value: 'Chiropractor', label: 'Chiropractor' },
  { value: 'Secretary', label: 'Secretary' },
  { value: 'Receptionist', label: 'Receptionist' },
  { value: 'Medical Assistant', label: 'Medical Assistant' },
  { value: 'Clinic Coordinator', label: 'Clinic Coordinator' },
  { value: 'Administrative Assistant', label: 'Administrative Assistant' },
];

/**
 * Job titles that are considered "therapist" roles
 * These users can be assigned to patient sessions
 */
export const THERAPIST_JOB_TITLES = [
  'Physical Therapist',
  'Occupational Therapist',
  'Speech Therapist',
  'Massage Therapist',
  'Sports Therapist',
  'Rehabilitation Therapist',
  'Chiropractor',
];

/**
 * Job titles that have secretary-level permissions
 */
export const SECRETARY_JOB_TITLES = [
  'Secretary',
  'Receptionist',
  'Administrative Assistant',
  'Clinic Coordinator',
];

/**
 * Check if a job title is a therapist role
 */
export const isTherapistRole = (jobTitle) => {
  if (!jobTitle) return false;
  return THERAPIST_JOB_TITLES.includes(jobTitle);
};

/**
 * Check if a job title is a secretary role
 */
export const isSecretaryRole = (jobTitle) => {
  if (!jobTitle) return false;
  return SECRETARY_JOB_TITLES.some(title => 
    jobTitle.toLowerCase().includes(title.toLowerCase())
  );
};

