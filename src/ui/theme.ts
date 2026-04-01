export const colors = {
  // Backgrounds
  background:         '#F0FDF4',   // green-50
  backgroundGradient: ['#F0FDF4', '#ECFDF5', '#F0FDFA'] as const,
  surface:            '#FFFFFF',
  surfaceElevated:    '#F3F4F6',   // gray-100 — photo upload placeholder bg

  // Borders & dividers
  border:    'rgba(0,0,0,0.10)',
  divider:   '#E5E7EB',            // gray-200
  shadow:    'rgba(0,0,0,0.10)',

  // Brand — primary (dark navy)
  primary:            '#030213',
  primaryForeground:  '#FFFFFF',

  // Brand — green (emerald)
  green:      '#059669',            // emerald-600
  greenLight: '#D1FAE5',            // emerald-100
  greenDark:  '#047857',            // emerald-700

  // Water action — blue
  blue:        '#2563EB',           // blue-600
  blueLight:   '#EFF6FF',           // blue-50
  blueBorder:  '#BFDBFE',           // blue-200

  // Status — due soon (orange)
  orange:      '#EA580C',           // orange-600
  orangeLight: '#FFF7ED',           // orange-50

  // Status — destructive (red)
  danger:       '#D4183D',
  dangerLight:  '#FFF1F2',
  dangerBorder: '#FECDD3',

  // Text
  text:          '#030213',
  textSecondary: '#4B5563',         // gray-600
  textMuted:     '#6B7280',         // gray-500
  textLight:     '#FFFFFF',

  // Misc
  muted:           '#ECECF0',
  mutedForeground: '#717182',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const borderRadius = {
  sm:   6,
  md:   8,
  lg:   10,
  xl:   14,
  full: 9999,
};

export const fontSize = {
  xs:   12,
  sm:   14,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 30,
};

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
  },
};
