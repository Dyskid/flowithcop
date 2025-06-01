// --- START components/MallCard.tsx ---
import React from 'react';
import Link from 'next/link'; // Import Link for navigation
import dayjs from 'dayjs'; // Using dayjs for date formatting
import 'dayjs/locale/ko'; // Import Korean locale
dayjs.locale('ko'); // Set locale to Korean

// Define the interface based on the documented structure for a mall item
// Including fields needed for display on the card and for linking
interface MallCardProps {
  id: string; // Assuming string ID for routing based on Next.js dynamic routes [id].tsx
  name: string;
  url: string;
  region: string;
  isNew?: boolean; // Optional, for 'New' status indicator
  lastVerified?: string; // Optional, for 'Last Verified' status indicator (as date string)
  statusPopular?: boolean; // Optional, for 'Popular' status indicator
  description?: string; // Optional, to potentially show a snippet
}

const MallCard: React.FC<MallCardProps> = ({
  id,
  name,
  url,
  region,
  isNew,
  lastVerified,
  statusPopular,
  description, // Added description to potentially use it
}) => {

  // Handles the click event for the "Visit" button
  // Keeping the click tracking logic from the previous reference
  const handleVisitClick = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the parent Link click from triggering when button is clicked

    // Basic client-side duplicate click prevention (e.g., ignore rapid clicks)
    // A more robust solution involves server-side tracking and potentially user sessions.
    const localStorageKey = `clicked_mall_${id}`;
    const lastClickTime = localStorage.getItem(localStorageKey);
    const now = Date.now();
    const COOLDOWN_PERIOD = 5 * 1000; // 5 seconds cooldown to prevent accidental double clicks

    if (!lastClickTime || (now - parseInt(lastClickTime, 10) > COOLDOWN_PERIOD)) {
       localStorage.setItem(localStorageKey, now.toString());

      try {
        // Call the API route to track the click on the server
        // NOTE: This API endpoint '/api/track-click' needs to be implemented separately
        // and handle updating the data source (e.g., malls.json).
        const response = await fetch('/api/track-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mallId: id }),
        });

        if (!response.ok) {
           console.error(`Failed to track click for mall ID: ${id}. Status: ${response.status}`);
        }

      } catch (error) {
        console.error(`Error calling track-click API for mall ID: ${id}`, error);
      }
    }

    // Always navigate to the mall URL in a new tab after handling tracking logic
    window.open(url, '_blank');
  };

  // Format the last verified date if available
  const formattedLastVerified = lastVerified
    ? dayjs(lastVerified).format('YYYY년 MM월 DD일') // Example format: 2023년 11월 01일
    : null;

  return (
    // Wrap the card content in a Next.js Link component to make the card clickable
    // This links to the detail page for the mall.
    <Link href={`/malls/${id}`} passHref legacyBehavior>
      {/* Use an anchor tag as the child of Link for proper behavior */}
      {/* Apply styles to the anchor tag */}
      <a className="block border border-gray-200 rounded-lg shadow-sm p-5 bg-white transition transform hover:-translate-y-1 hover:shadow-lg flex flex-col h-full cursor-pointer">
        {/* Card Header: Name and Status Badges */}
        <div className="flex items-start mb-3 min-h-[3rem]"> {/* Added min-height for visual consistency */}
          {/* Mall Name - Flex grow to push badges to the right */}
          <h2 className="text-lg font-semibold text-gray-800 flex-grow mr-3">
            {name}
          </h2>
          {/* Status Badges Container - flex-shrink-0 prevents badges from shrinking */}
          <div className="flex flex-wrap justify-end gap-1 flex-shrink-0"> {/* Use flex-wrap and gap for smaller screens */}
            {isNew && (
              <span className="px-2 py-0.5 text-xs font-bold text-blue-800 bg-blue-100 rounded">
                새로운
              </span>
            )}
             {statusPopular && (
              <span className="px-2 py-0.5 text-xs font-bold text-red-800 bg-red-100 rounded">
                인기
              </span>
            )}
          </div>
        </div>

        {/* Region Information */}
        <p className="text-gray-600 text-sm mb-3">{region}</p>

         {/* Optional Description Snippet */}
         {/* Use line-clamp if you want to truncate description */}
         {/* {description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{description}</p>
         )} */}

        {/* Last Verified Date */}
        {formattedLastVerified && (
           <p className="text-gray-500 text-xs mb-4">
             <strong className="font-medium">확인일:</strong> {formattedLastVerified}
           </p>
        )}


        {/* Visit Button - Needs to be clickable independently of the card link */}
        {/* Placed outside the main link area or use event.stopPropagation() as done */}
        <button
          onClick={handleVisitClick}
          className="mt-auto w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
          aria-label={`Visit ${name} official website`} // Accessibility for the button
        >
          공식 웹사이트 방문하기
        </button>
      </a>
    </Link>
  );
};

export default MallCard;
// --- END components/MallCard.tsx ---
