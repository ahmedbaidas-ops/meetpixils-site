import * as React from "react";

/**
 * MeetMark — the symbol alone, recoloured per arm.
 *
 * The mark geometry is identical across MeetPixils, MeetBattle, MeetAcademy
 * and MeetExperience; only the colour changes. The shipped arm lockups are
 * JPEGs with a .png extension and no alpha, so they cannot sit on a coloured
 * tile — this draws the mark instead and sets the name in Poppins.
 */
export function MeetMark({
  size = 34,
  color = "#EF5229",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 235 96"
      width={(235 / 96) * size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ display: "block", ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M93.7838 0V47.8009L78.2648 47.7211C75.9043 47.7211 73.5756 47.8168 71.3108 48.0242C57.4028 49.2682 46.9398 61.5335 46.9398 75.7605V95.4423H0.0321426V47.8009H20.2403C20.336 47.8009 20.4317 47.8009 20.5274 47.8009C35.2648 47.753 46.9398 34.8817 46.9398 19.8732V0.0159408H93.7838V0Z" fill={color}/>
      <path d="M234.443 47.8008V95.4262H187.583V79.7C187.583 77.2916 187.503 74.931 187.296 72.6183C186.195 59.8906 176.371 50.0178 164.281 48.1357C150.803 49.7786 140.755 61.8364 140.755 75.7604V95.4422H93.8315V47.8008H114.087C114.183 47.8008 114.295 47.8008 114.391 47.8008C129.128 47.753 140.755 34.8976 140.755 19.8731V0.0158691H187.599V20.9098C187.647 35.9184 200.199 47.8008 214.953 47.8008H234.459H234.443Z" fill={color}/>
    </svg>
  );
}
