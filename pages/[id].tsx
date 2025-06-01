// --- START pages/malls/[id].tsx ---
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link'; // Import Link for navigation
import Head from 'next/head'; // For page title and meta tags
import Layout from '../../components/Layout'; // Assuming Layout component exists
import path from 'path';
import { promises as fs } from 'fs';
import dayjs from 'dayjs'; // Using dayjs for date formatting
import 'dayjs/locale/ko'; // Import Korean locale
dayjs.locale('ko'); // Set locale to Korean

// Define the interface for the mall data structure, matching the data source
interface MallType {
  id: string; // Using string ID for routing
  name: string;
  url: string;
  region: string;
  city?: string; // Added based on sample JSON
  tags?: string[];
  featured?: boolean;
  isNew?: boolean; // For 'New' status
  clickCount?: number; // For tracking, potentially display
  lastVerified?: string; // For 'Last Verified' status (date string)
  description?: string; // For mall description
  statusPopular?: boolean; // For 'Popular' status
  // Add other fields from your malls.json if needed here (e.g., 'address' if it existed)
}

// Props type for the dynamic page component
interface MallDetailPageProps {
  mall: MallType | null; // Mall data, or null if not found
}

const MallDetailPage: NextPage<MallDetailPageProps> = ({ mall }) => {
  // If mall data is not found, Next.js's getStaticProps with notFound: true
  // would typically render a 404 page automatically.
  // This null check is primarily for type safety and local development
  // if `notFound: true` wasn't used or for fallback pages.
  if (!mall) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">마켓 정보를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-gray-700">요청하신 마켓의 정보를 불러오는데 실패했습니다.</p>
          <div className="mt-6">
             <Link href="/" passHref legacyBehavior>
              <a className="text-blue-700 hover:text-blue-800 transition duration-300 ease-in-out flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                목록으로 돌아가기
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Format the last verified date if available
  const formattedLastVerified = mall.lastVerified
    ? dayjs(mall.lastVerified).format('YYYY년 MM월 DD일') // Example format: 2023년 11월 01일
    : null;

  return (
    <Layout>
      <Head>
        {/* Set dynamic page title based on mall name */}
        <title>{`${mall.name} - e-Paldogangsan`}</title>
        {/* Set dynamic meta description */}
        <meta name="description" content={`Find details about ${mall.name}, a local government online mall in ${mall.region}${mall.city ? `, ${mall.city}` : ''}.`} />
         {/* Add Open Graph tags for social sharing if needed */}
         {/* <meta property="og:title" content={`${mall.name} - e-Paldogangsan`} /> */}
         {/* <meta property="og:description" content={`Details about ${mall.name}...`} /> */}
         {/* <meta property="og:url" content={`https://yourwebsite.com/malls/${mall.id}`} /> */}
         {/* <meta property="og:type" content="website" /> */}
         {/* <meta property="og:image" content="[URL to preview image]" /> */}
      </Head>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to List Link */}
        <div className="mb-6">
          <Link href="/" passHref legacyBehavior>
            <a className="text-blue-700 hover:text-blue-800 transition duration-300 ease-in-out flex items-center text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              전체 마켓 목록으로 돌아가기
            </a>
          </Link>
        </div>

        {/* Mall Detail Content */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200"> {/* Enhanced styling */}
          {/* Mall Name and Status Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 border-b pb-4"> {/* Use flex-col on mobile, row on sm+ */}
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue flex-grow mb-4 sm:mb-0 sm:mr-6"> {/* Adjust spacing */}
              {mall.name}
            </h1>
            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2 flex-shrink-0"> {/* Use flex-wrap and gap */}
              {mall.isNew && (
                <span className="px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full">
                  새로운 마켓
                </span>
              )}
              {mall.statusPopular && (
                <span className="px-3 py-1 text-sm font-bold text-red-800 bg-red-100 rounded-full">
                  인기 마켓
                </span>
              )}
              {formattedLastVerified && (
                <span className="px-3 py-1 text-sm font-bold text-green-800 bg-green-100 rounded-full">
                  확인일: {formattedLastVerified}
                </span>
              )}
            </div>
          </div>

          {/* Mall Details */}
          <div className="text-gray-700 space-y-4 text-base"> {/* Added space-y and text size */}
            <p>
              <strong className="font-semibold text-gray-800">지역:</strong> {mall.region}{mall.city ? ` (${mall.city})` : ''}
            </p>
            {/* Address placeholder - field not present in provided JSON schema */}
            {/* {mall.address && (
               <p>
                 <strong className="font-semibold text-gray-800">주소:</strong> {mall.address}
               </p>
            )} */}
            <p>
              <strong className="font-semibold text-gray-800">공식 웹사이트:</strong>{' '}
              <a
                href={mall.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all" // break-all for long URLs
                aria-label={`${mall.name} 공식 웹사이트`}
              >
                {mall.url}
              </a>
            </p>
            {mall.description && (
              <p>
                <strong className="font-semibold text-gray-800">설명:</strong> {mall.description}
              </p>
            )}
            {mall.tags && mall.tags.length > 0 && (
              <p>
                 <strong className="font-semibold text-gray-800">태그:</strong>{' '}
                 {/* Map tags into styled spans */}
                 {mall.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2 last:mr-0 last:mb-0">
                       #{tag}
                    </span>
                 ))}
              </p>
            )}
            {typeof mall.clickCount === 'number' && (
               <p>
                 <strong className="font-semibold text-gray-800">누적 방문 클릭 수:</strong> {mall.clickCount} 회
               </p>
            )}

            {/* You can add other details here based on the MallType interface */}
          </div>

          {/* Direct Visit Button */}
          <div className="mt-8 text-center">
             {/* Use a normal anchor tag for the external link */}
             {/* Add basic click tracking here if you didn't track on the card */}
             <a
               href={mall.url}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-block bg-blue-600 text-white text-lg py-3 px-8 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-medium"
               aria-label={`Visit ${mall.name} official website`}
             >
               공식 웹사이트 바로가기
             </a>
          </div>

        </div>
      </div>
    </Layout>
  );
};

// getStaticPaths is required for dynamic routes using SSG
export const getStaticPaths: GetStaticPaths = async () => {
  const filePath = path.join(process.cwd(), 'data', 'malls.json');
  let malls: MallType[] = [];
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    malls = JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading malls.json for getStaticPaths:', error);
    // If data file is essential and missing, you might want to throw or handle differently
  }


  // Map mall data to paths array, ensuring ID is a string for route parameters
  const paths = malls.map((mall) => ({
    params: { id: String(mall.id) }, // Ensure ID is string for the route parameter
  }));

  // fallback: false means only the paths returned here will be generated at build time.
  // Any request for an ID not in 'paths' will result in a 404 page.
  // Set fallback: true or 'blocking' for dynamic server-side rendering or ISR on unfound paths.
  return { paths, fallback: false };
};

// getStaticProps fetches data for each specific path defined in getStaticPaths
export const getStaticProps: GetStaticProps<MallDetailPageProps> = async (context) => {
  const mallId = context.params?.id; // The 'id' from the dynamic route, guaranteed to be a string

  const filePath = path.join(process.cwd(), 'data', 'malls.json');
  let malls: MallType[] = [];
   try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    malls = JSON.parse(jsonData);
     // Ensure IDs are strings for consistent comparison
     malls = malls.map(mall => ({ ...mall, id: String(mall.id) }));
  } catch (error) {
    console.error('Error reading malls.json for getStaticProps:', error);
     // If data file read fails, return notFound: true
     return {
      notFound: true,
    };
  }


  // Find the mall matching the ID, comparing stringified ID from JSON
  const mall = malls.find((m) => m.id === mallId); // Compare string IDs

  if (!mall) {
    // If the mall with the given ID is not found in the data, return 404
    return {
      notFound: true,
    };
  }

  // Return the found mall data as props
  return {
    props: {
      mall,
    },
    // Optional: revalidate data every N seconds (e.g., 86400 for 24 hours)
    // If data changes frequently, use revalidate or switch to getServerSideProps
    // revalidate: 86400,
  };
};

export default MallDetailPage;
// --- END pages/malls/[id].tsx ---
