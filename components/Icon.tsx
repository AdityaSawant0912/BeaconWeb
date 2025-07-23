import React, { Suspense, lazy } from 'react';

// IMPORTANT: When using React.lazy with react-icons, you need to be explicit
// about which icon library each icon comes from, and map it to a specific
// dynamic import.

// This object maps your chosen icon name (string) to a dynamically imported
// React component.
//
// The structure `lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaIconName })))`
// is necessary because react-icons exports named exports, and React.lazy
// expects a default export.

// https://react-icons.github.io/react-icons/

const LazyIconComponents = {
  // --- Font Awesome (from 'react-icons/fa') ---
  'map': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaMapMarkerAlt }))),
  'cog': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaCog }))),
  'plus': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaPlus }))),
  'user': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaUser }))), // Example: for a user avatar
  'arrow-right': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaArrowRight }))),
  'check': lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaCheck  }))),

  // --- Material Design Icons (from 'react-icons/md') ---
  'settings-md': lazy(() => import('react-icons/md').then(mod => ({ default: mod.MdSettings }))),
  'add-person': lazy(() => import('react-icons/md').then(mod => ({ default: mod.MdPersonAdd }))),
  'center-focus': lazy(() => import('react-icons/md').then(mod => ({ default: mod.MdCenterFocusStrong }))),
  'delete': lazy(() => import('react-icons/md').then(mod => ({ default: mod.MdDeleteOutline }))),

  // --- Example: Ionicons v5 (from 'react-icons/io5') ---
  'settings-outline': lazy(() => import('react-icons/io5').then(mod => ({ default: mod.IoSettingsOutline }))),
  'add-circle': lazy(() => import('react-icons/io5').then(mod => ({ default: mod.IoAddCircleOutline }))),
  'close': lazy(() => import('react-icons/io5').then(mod => ({ default: mod.IoCloseSharp  }))),
  'pause': lazy(() => import('react-icons/io5').then(mod => ({ default: mod.IoPause   }))),
  'play': lazy(() => import('react-icons/io5').then(mod => ({ default: mod.IoPlay   }))),

  // Add more icons from different libraries as you need them
  // e.g., 'calendar': lazy(() => import('react-icons/fi').then(mod => ({ default: mod.FiCalendar }))), // Feather Icons
};

// Define the type for the 'name' prop, ensuring type safety
export type IconName = keyof typeof LazyIconComponents;

// Define props for the Icon component
interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: string | number; // Optional size prop, defaults to '1em'
  color?: string;       // Optional color prop, defaults to 'currentColor'
  // What to display while the icon component is being loaded (e.g., a spinner or just nothing)
  fallback?: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ name, size = '1em', color = 'currentColor', fallback = null, ...rest }) => {
  const LazyLoadedIconComponent = LazyIconComponents[name];

  if (!LazyLoadedIconComponent) {
    // Fallback for an unknown icon name during development/typo
    console.warn(`Icon with name "${name}" not found in LazyIconComponents.`);
    return fallback; // Or throw an error, or return a default placeholder icon
  }

  return (
    // Suspense is required to show fallback content while the lazy-loaded component loads
    <Suspense fallback={fallback}>
      <LazyLoadedIconComponent
        size={size}
        color={color}
        {...rest} // Spread any additional SVG props (className, style, onClick, etc.)
      />
    </Suspense>
  );
};

export default Icon;