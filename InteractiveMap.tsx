// --- START components/InteractiveMap.tsx ---
import React, { useState } from 'react';

// Define the interface for the structure of mall counts per region.
// Keys are region names (e.g., '서울특별시', '경기도'), values are the counts.
interface RegionMallData {
  [regionName: string]: number;
}

// Define the interface for a single region's SVG path data and associated information.
// This component is designed to accept pre-calculated SVG path data and text coordinates.
interface RegionData {
  name: string;      // The name of the region (must match keys in RegionMallData)
  d: string;         // The SVG path 'd' attribute string
  textX: number;     // X coordinate for placing the text label for this region within the SVG's viewBox
  textY: number;     // Y coordinate for placing the text label for this region within the SVG's viewBox
  id: string;        // A unique ID for the region (can be region name or a generated id)
}

// Define the props for the InteractiveMap component.
interface InteractiveMapProps {
  mallCountsByRegion: RegionMallData; // Data mapping region names to mall counts
  regionPathData: RegionData[];     // Array containing SVG path data and text coordinates for each region
  svgViewBox?: string;              // Optional SVG viewBox string (e.g., "0 0 800 1200")
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mallCountsByRegion,
  regionPathData,
  // Provide a default viewBox if none is provided.
  // NOTE: This default is arbitrary. You MUST provide a viewBox via props
  // that matches the coordinate system of your SVG path data (`regionPathData`).
  svgViewBox = "0 0 800 1200",
}) => {
  // State to track which region is currently hovered, for potential tooltip or dynamic styling
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Handle click event for a region
  const handleRegionClick = (regionName: string) => {
    console.log('Region clicked:', regionName);
    // TODO: Implement actual navigation or filtering based on region click
    // Example: Filter the mall list below the map or navigate to a region-specific page
    // router.push(`/regions/${regionName}`);
  };

  // Determine the fill color based on the number of malls in a region.
  // Uses Tailwind CSS utility classes.
  const getFillColorClass = (count: number): string => {
    if (count === 0) return 'fill-gray-300 dark:fill-gray-600'; // Light gray for no data/0 malls
    if (count > 0 && count <= 5) return 'fill-blue-300 dark:fill-blue-500'; // Lighter blue for low count
    if (count > 5 && count <= 15) return 'fill-blue-500 dark:fill-blue-600'; // Medium blue for moderate count
    if (count > 15) return 'fill-blue-700 dark:fill-blue-800'; // Darker blue for high count
    return 'fill-gray-400 dark:fill-gray-500'; // Default fallback
  };

  // Determine text color based on fill color for readability
  const getTextColorClass = (count: number): string => {
     if (count > 5) return 'fill-white'; // White text for darker blues
     return 'fill-gray-800 dark:fill-gray-200'; // Darker text for lighter fills
  }


  return (
    // Container div for responsive SVG. Use Tailwind's aspect-ratio utilities if plugin is configured.
    // If not using the plugin, padding-bottom hack is necessary for intrinsic aspect ratio.
    // Let's use padding-bottom hack for broader compatibility, assuming standard aspect ratios work.
    // Adjust paddingBottom value based on the aspect ratio of your specific SVG viewBox.
    // For a 800x1200 viewBox (width x height), the ratio is 1200/800 = 1.5 or 150%.
    <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg"> {/* Added shadow and rounded corners */}
      <div style={{ paddingBottom: '150%', height: 0, position: 'relative' }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={svgViewBox}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="South Korea Mall Count Map"
          role="img" // Indicate this is an image/graphic
        >
          {/* Render each region's path and associated text */}
          {regionPathData.map((region) => {
            // Get the mall count for the current region, defaulting to 0 if not found.
            const count = mallCountsByRegion[region.name] || 0;
            // Get the Tailwind CSS class for the fill color based on the count.
            const fillColorClass = getFillColorClass(count);
            const textColorClass = getTextColorClass(count);

            return (
              // Use a group (<g>) to keep the path and text for a single region together.
              <g
                key={region.id} // Use unique ID for key
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick(region.name)}
                // Apply cursor pointer to the group so clicking text/path works
                className="cursor-pointer"
                aria-label={`${region.name}: ${count} Malls`} // Accessibility label for screen readers
              >
                {/* The SVG path for the region */}
                <path
                  d={region.d}
                  className={`
                    ${fillColorClass}
                    stroke-white stroke-1.5
                    hover:fill-yellow-400 hover:stroke-yellow-600
                    transition duration-200 ease-in-out
                  `}
                  // Prevent pointer events on the path itself if using the group for clicks/hover
                  // style={{ pointerEvents: 'none' }}
                />
                {/* Text label for the mall count */}
                {/* Only display count if greater than 0 */}
                {/* Adjust font size and positioning based on map scale if needed */}
                {count > 0 && (
                  <text
                    x={region.textX}
                    y={region.textY}
                    className={`${textColorClass} text-[10px] sm:text-xs font-bold pointer-events-none`} // pointer-events-none ensures clicks/hovers go to the <g> or <path>
                    textAnchor="middle"     // Horizontally center the text at (textX, textY)
                    dominantBaseline="middle" // Vertically center the text at (textX, textY)
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })}
          {/* TODO: Add a legend here if needed to explain the color mapping */}
          {/* <g className="legend">...</g> */}
        </svg>
      </div>

      {/* Optional: Tooltip implementation */}
      {/* For a simple tooltip that appears next to the mouse, you'd typically track mouse position */}
      {/* and conditionally render a div. This is more complex than a simple hover effect on paths. */}
      {/* For now, the hover effect on the region path and the aria-label provide basic feedback. */}

    </div>
  );
};

export default InteractiveMap;
// --- END components/InteractiveMap.tsx ---
