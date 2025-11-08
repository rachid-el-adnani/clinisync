/**
 * Job titles available for clinic staff
 */
const JOB_TITLES = [
  'Physical Therapist',
  'Occupational Therapist',
  'Speech Therapist',
  'Massage Therapist',
  'Sports Therapist',
  'Rehabilitation Therapist',
  'Chiropractor',
  'Secretary',
  'Receptionist',
  'Medical Assistant',
  'Clinic Coordinator',
  'Administrative Assistant',
];

/**
 * Job titles that are considered "therapist" roles
 * These users can be assigned to patient sessions
 */
const THERAPIST_JOB_TITLES = [
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
const SECRETARY_JOB_TITLES = [
  'Secretary',
  'Receptionist',
  'Administrative Assistant',
  'Clinic Coordinator',
];

/**
 * Check if a job title is a therapist role
 */
const isTherapistRole = (jobTitle) => {
  if (!jobTitle) return false;
  return THERAPIST_JOB_TITLES.includes(jobTitle);
};

/**
 * Check if a job title is a secretary role
 */
const isSecretaryRole = (jobTitle) => {
  if (!jobTitle) return false;
  return SECRETARY_JOB_TITLES.some(title => 
    jobTitle.toLowerCase().includes(title.toLowerCase())
  );
};

module.exports = {
  JOB_TITLES,
  THERAPIST_JOB_TITLES,
  SECRETARY_JOB_TITLES,
  isTherapistRole,
  isSecretaryRole,
};

