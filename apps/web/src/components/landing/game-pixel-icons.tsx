import type { SVGProps } from 'react';

export type PixelIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
  color?: string;
};

/**
 * Pixel-perfect SVG retro gaming icons drawn on a 24x24 / 32x32 pixel grid
 */

// 1. Pixel Gamepad Controller
export function PixelGamepad({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Outer Shell */}
      <path
        d="M4 6h16v2H4V6zm-2 2h2v10H2V8zm18 0h2v10h-2V8zM4 18h16v2H4v-2z"
        fill={color}
        fillOpacity="0.25"
      />
      <path
        d="M5 8h14v8H5V8zm2 2h3v1H7v-1zm1-1h1v3H8V9zm8 1h1v1h-1v-1zm2 2h1v1h-1v-1zm-2 0h1v1h-1v-1zm2-2h1v1h-1v-1z"
        fill={color}
      />
      {/* D-Pad */}
      <path d="M7 11h2v2H7v-2zm-1 1h4v1H6v-1z" fill="#0A0A0A" />
      {/* AB Buttons */}
      <path d="M15 11h1v1h-1v-1zm2 2h1v1h-1v-1z" fill="#0A0A0A" />
      {/* Cable / Grip accent */}
      <path d="M11 6h2v2h-2V6z" fill={color} />
    </svg>
  );
}

// 2. Pixel Heart (Health)
export function PixelHeart({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      <path
        d="M4 4h5v2H4V4zm11 0h5v2h-5V4zM2 6h2v5H2V6zm9 2h2v2h-2V8zm9-2h2v5h-2V6zM4 11h2v3H4v-3zm14 0h2v3h-2v-3zM6 14h2v3H6v-3zm10 0h2v3h-2v-3zM8 17h2v3H8v-3zm6 0h2v3h-2v-3zm-4 3h4v2h-4v-2z"
        fill={color}
        fillOpacity="0.3"
      />
      <path
        d="M4 6h5v5H4V6zm11 0h5v5h-5V6zm-5 5h4v4h-4v-4zm-4 0h4v6H6v-6zm8 0h4v6h-4v-6zm-4 6h4v3h-4v-3z"
        fill={color}
      />
      {/* Pixel highlight */}
      <path d="M5 7h2v2H5V7zm2 2h1v1H7V9z" fill="#FFFFFF" fillOpacity="0.8" />
    </svg>
  );
}

// 3. Pixel Potion / Mana Flask
export function PixelPotion({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Cork & Neck */}
      <path d="M10 2h4v2h-4V2zm1 2h2v4h-2V4z" fill={color} />
      {/* Bottle Body */}
      <path
        d="M8 8h8v2H8V8zM6 10h2v10H6V10zm10 0h2v10h-2V10zM8 20h8v2H8v-2z"
        fill={color}
        fillOpacity="0.3"
      />
      {/* Liquid Contents */}
      <path
        d="M8 13h8v7H8v-7zm1-2h6v2H9v-2z"
        fill={color}
      />
      {/* Bubble Highlight */}
      <path d="M10 14h2v2h-2v-2zm3 3h2v2h-2v-2z" fill="#FFFFFF" fillOpacity="0.75" />
    </svg>
  );
}

// 4. Pixel Master Sword
export function PixelSword({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Blade Tip */}
      <path d="M20 2h2v2h-2V2zm-2 2h2v2h-2V4zm-2 2h2v2h-2V6zm-2 2h2v2h-2V8zm-2 2h2v2h-2v-2zm-2 2h2v2h-2v-2z" fill={color} />
      {/* Blade Body */}
      <path d="M19 3h2v2h-2V3zm-2 2h2v2h-2V5zm-2 2h2v2h-2V7zm-2 2h2v2h-2V9zm-2 2h2v2h-2v-2z" fill="#FFFFFF" fillOpacity="0.9" />
      {/* Crossguard */}
      <path d="M6 14h6v2H6v-2zm2-2h2v6H8v-6zm2 2h2v2h-2v-2zm-4 0h2v2H6v-2z" fill={color} />
      {/* Hilt */}
      <path d="M5 16h2v2H5v-2zm-2 2h2v2H3v-2z" fill={color} fillOpacity="0.6" />
      {/* Pommel */}
      <path d="M2 20h3v2H2v-2z" fill={color} />
    </svg>
  );
}

// 5. Pixel Cartridge
export function PixelCartridge({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Cartridge Outline */}
      <path
        d="M4 3h16v18H4V3zm2 2v14h12V5H6z"
        fill={color}
      />
      {/* Top Notch & Label Window */}
      <path d="M7 6h10v2H7V6zm0 3h10v7H7V9z" fill={color} fillOpacity="0.15" />
      {/* Label Art / Joystick mark */}
      <path d="M9 11h6v3H9v-3zm1 1h2v1h-2v-1z" fill={color} />
      {/* Bottom Pins */}
      <path d="M8 19h2v2H8v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z" fill={color} />
    </svg>
  );
}

// 6. Pixel Memory Card
export function PixelMemoryCard({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Beveled Top */}
      <path d="M7 3h10v2H7V3zm-2 2h2v16H5V5zm14 0h2v16h-2V5zm-2 16H7v-2h10v2z" fill={color} />
      {/* Label Area */}
      <path d="M7 6h10v6H7V6z" fill={color} fillOpacity="0.2" />
      <path d="M9 8h6v2H9V8z" fill={color} />
      {/* LED & Grips */}
      <path d="M9 14h6v1H9v-1zm0 2h6v1H9v-1z" fill={color} fillOpacity="0.5" />
      <path d="M15 4h1v1h-1V4z" fill="#00FF88" />
    </svg>
  );
}

// 7. Pixel Arcade Coin
export function PixelCoin({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      <path
        d="M8 3h8v2H8V3zM5 5h3v2H5V5zm11 0h3v2h-3V5zM3 7h2v10H3V7zm16 0h2v10h-2V7zM5 17h3v2H5v-2zm11 0h3v2h-3v-2zM8 19h8v2H8v-2z"
        fill={color}
      />
      <path d="M8 5h8v14H8V5zM5 7h14v10H5V7z" fill={color} fillOpacity="0.2" />
      {/* Coin Center Star */}
      <path d="M11 8h2v8h-2V8zm-2 2h6v2H9v-2zm1 4h4v2h-4v-2z" fill={color} />
    </svg>
  );
}

// 8. Pixel Skull (Boss fight / Game Over)
export function PixelSkull({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Head Contour */}
      <path
        d="M7 3h10v2H7V3zM4 5h3v2H4V5zm13 0h3v2h-3V5zM3 7h1v8H3V7zm17 0h1v8h-1V7zM4 15h3v3H4v-3zm13 0h3v3h-3v-3zM7 18h10v3H7v-3z"
        fill={color}
      />
      {/* Skull Body Fill */}
      <path d="M5 7h14v8H5V7zm3 8h8v3H8v-3z" fill={color} fillOpacity="0.25" />
      {/* Eye Sockets */}
      <path d="M7 9h3v3H7V9zm7 0h3v3h-3V9z" fill="#0A0A0A" />
      {/* Nose */}
      <path d="M11 13h2v1h-2v-1z" fill="#0A0A0A" />
      {/* Teeth */}
      <path d="M8 19h1v2H8v-2zm3 0h2v2h-2v-2zm4 0h1v2h-1v-2z" fill="#0A0A0A" />
    </svg>
  );
}

// 9. Pixel Dungeon Key
export function PixelKey({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Bow (Key Head) */}
      <path
        d="M15 3h6v6h-6V3zm2 2h2v2h-2V5z"
        fill={color}
      />
      {/* Shaft */}
      <path d="M9 9h6v2H9V9zm-3 3h6v2H6v-2zm-3 3h6v2H3v-2zm1 3h2v2H4v-2z" fill={color} />
      {/* Teeth */}
      <path d="M6 16h2v3H6v-3zm-2 2h2v3H4v-3z" fill={color} />
    </svg>
  );
}

// 10. Pixel Trophy / Achievement
export function PixelTrophy({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Cup Rim & Body */}
      <path d="M6 3h12v2H6V3zm1 2h10v5H7V5zm2 5h6v3H9v-3zm2 3h2v4h-2v-4z" fill={color} />
      {/* Handles */}
      <path d="M4 5h2v4H4V5zm14 0h2v4h-2V5zM3 9h2v1H3V9zm16 0h2v1h-2V9z" fill={color} fillOpacity="0.6" />
      {/* Stem & Base */}
      <path d="M10 17h4v2h-4v-2zm-3 2h10v2H7v-2z" fill={color} />
      {/* Star Highlight */}
      <path d="M11 6h2v2h-2V6z" fill="#FFFFFF" fillOpacity="0.8" />
    </svg>
  );
}

// 11. Pixel CRT TV
export function PixelCRT({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Antenna */}
      <path d="M7 2h2v2H7V2zm8 0h2v2h-2V2zm-4 3h2v2h-2V5z" fill={color} />
      {/* Frame */}
      <path
        d="M3 6h18v14H3V6zm2 2v10h14V8H5z"
        fill={color}
      />
      {/* Screen */}
      <path d="M6 9h9v8H6V9z" fill={color} fillOpacity="0.3" />
      {/* Dials & Buttons */}
      <path d="M16 10h2v2h-2v-2zm0 4h2v2h-2v-2z" fill={color} />
      {/* Scanline reflection */}
      <path d="M7 11h7v1H7v-1zm0 3h5v1H7v-1z" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  );
}

// 12. Pixel Floppy Disk (Save)
export function PixelSave({ size = 24, className = '', color = 'currentColor', ...props }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      {/* Disk Body */}
      <path
        d="M4 3h13l3 3v15H4V3zm2 2v14h12V7.5L15.5 5H6z"
        fill={color}
      />
      {/* Shutter / Top Metal */}
      <path d="M8 5h7v5H8V5zm2 1h2v3h-2V6z" fill={color} fillOpacity="0.75" />
      {/* Label Area */}
      <path d="M7 12h10v6H7v-6zm2 2h6v2H9v-2z" fill={color} fillOpacity="0.25" />
    </svg>
  );
}
