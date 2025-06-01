// --- START pages/index.tsx ---
import { GetStaticProps, NextPage } from 'next';
import Layout from '../components/Layout';
import MallCard from '../components/MallCard';
import InteractiveMap from '../components/InteractiveMap';
import SearchBar from '../components/SearchBar'; // Import the search bar
import path from 'path';
import { promises as fs } from 'fs';
import { useState, useEffect } from 'react'; // Import hooks

// Define the interface for the mall data structure based on the reference
interface MallType {
  id: string; // Ensure ID is string
  name: string;
  url: string;
  region: string;
  city?: string; // Optional, based on malls.json structure
  tags?: string[]; // Optional
  featured?: boolean; // Optional
  isNew?: boolean; // Optional
  clickCount?: number; // Optional
  lastVerified?: string; // Optional
  description?: string; // Optional
  statusPopular?: boolean; // Optional
}

// Define the interface for the structure of mall counts per region.
// Keys are region names (e.g., '서울특별시', '경기도'), values are the counts.
interface RegionMallData {
  [regionName: string]: number;
}

// Define the interface for a single region's SVG path data and associated information.
interface RegionPathDataItem {
  name: string;      // The name of the region (must match keys in RegionMallData)
  d: string;         // The SVG path 'd' attribute string
  textX: number;     // X coordinate for placing the text label for this region within the SVG's viewBox
  textY: number;     // Y coordinate for placing the text label for this region within the SVG's viewBox
  id: string;        // A unique ID for the region
}

// Define the props type for the HomePage component, including mall data and map data
interface HomePageProps {
  malls: MallType[];
  mallCountsByRegion: RegionMallData;
  regionPathData: RegionPathDataItem[];
}

// Placeholder region path data - **Replace with actual, accurate SVG path data and coordinates for South Korea**
// This structure and example placeholders are copied from the InteractiveMap reference.
// Ensure the 'name' fields match the 'region' names in malls.json and the keys used in mallCountsByRegion.
// Note: The provided malls.json includes specific municipalities like '달성군', '부안', etc.
// The current KOREA_REGION_PATH_DATA only includes some of these as placeholders.
// For accurate mapping, the regionPathData needs to contain paths for *all* regions present in the malls.json data
// that you wish to display on the map, OR the mall data needs to be mapped to a higher province/metro level
// if the SVG only contains province/metro paths. The current setup counts based on `mall.region`.
const KOREA_REGION_PATH_DATA: RegionPathDataItem[] = [
  // Example placeholder structure (do not use these paths/coords in production):
  // Region names here must match the `region` property in `malls.json` exactly.
  { name: '서울특별시', id: 'seoul', d: 'M100 100 L120 100 L120 120 L100 120 Z', textX: 110, textY: 110 },
  { name: '부산광역시', id: 'busan', d: 'M500 800 L520 800 L520 820 L500 820 Z', textX: 510, textY: 810 },
  { name: '대구광역시', id: 'daegu', d: 'M400 600 L420 600 L420 620 L400 620 Z', textX: 410, textY: 610 },
  { name: '인천광역시', id: 'incheon', d: 'M80 80 L100 80 L100 100 L80 100 Z', textX: 90, textY: 90 },
  { name: '광주광역시', id: 'gwangju', d: 'M250 750 L270 750 L270 770 L250 770 Z', textX: 260, textY: 760 },
  { name: '대전광역시', id: 'daejeon', d: 'M280 480 L300 480 L300 500 L280 500 Z', textX: 290, textY: 490 },
  { name: '울산광역시', id: 'ulsan', d: 'M550 700 L570 700 L570 720 L550 720 Z', textX: 560, textY: 710 },
  { name: '세종특별자치시', id: 'sejong', d: 'M260 450 L280 450 L280 470 L260 470 Z', textX: 270, textY: 460 },
  { name: '경기도', id: 'gyeonggi', d: 'M120 100 L200 100 L200 200 L120 200 Z', textX: 160, textY: 150 },
  { name: '강원도', id: 'gangwon', d: 'M200 50 L350 50 L350 250 L200 250 Z', textX: 275, textY: 150 },
  { name: '충청북도', id: 'chungbuk', d: 'M250 300 L350 300 L350 400 L250 400 Z', textX: 300, textY: 350 },
  { name: '충청남도', id: 'chungnam', d: 'M180 450 L280 450 L280 550 L180 550 Z', textX: 230, textY: 500 },
  { name: '전라북도', id: 'jeonbuk', d: 'M150 600 L280 600 L280 700 L150 700 Z', textX: 215, textY: 650 },
  { name: '전라남도', id: 'jeonnam', d: 'M100 750 L280 750 L280 900 L100 900 Z', textX: 190, textY: 825 },
  { name: '경상북도', id: 'gyeongbuk', d: 'M350 300 L550 300 L550 600 L350 600 Z', textX: 450, textY: 450 },
  { name: '경상남도', id: 'gyeongnam', d: 'M300 650 L550 650 L550 850 L300 850 Z', textX: 425, textY: 750 },
  { name: '제주특별자치도', id: 'jeju', d: 'M200 950 L300 950 L300 1000 L200 1000 Z', textX: 250, textY: 975 },
  // Adding placeholder entries for specific municipalities found in malls.json data structure,
  // although the actual SVG paths are placeholders.
  { name: '달성군', id: 'dalseong', d: 'M410 620 L430 620 L430 640 L410 640 Z', textX: 420, textY: 630 }, // Placeholder
  { name: '부안', id: 'buan', d: 'M160 700 L180 700 L180 720 L160 720 Z', textX: 170, textY: 710 }, // Placeholder
  { name: '정읍', id: 'jeongeup', d: 'M200 700 L220 700 L220 720 L200 720 Z', textX: 210, textY: 710 }, // Placeholder
  { name: '김제', id: 'kimje', d: 'M180 680 L200 680 L200 700 L180 700 Z', textX: 190, textY: 690 }, // Placeholder
   { name: '순창', id: 'sunchang', d: 'M200 740 L220 740 L220 760 L200 760 Z', textX: 210, textY: 750 }, // Placeholder
   { name: '신안', id: 'sinan', d: 'M80 850 L100 850 L100 870 L80 870 Z', textX: 90, textY: 860 }, // Placeholder
   { name: '장흥', id: 'jangheung', d: 'M250 850 L270 850 L270 870 L250 870 Z', textX: 260, textY: 860 }, // Placeholder
   { name: '영암', id: 'yeongam', d: 'M180 880 L200 880 L200 900 L180 900 Z', textX: 190, textY: 890 }, // Placeholder
   { name: '진도', id: 'jindo', d: 'M80 900 L100 900 L100 920 L80 920 Z', textX: 90, textY: 910 }, // Placeholder
   { name: '완도', id: 'wando', d: 'M100 930 L120 930 L120 950 L100 950 Z', textX: 110, textY: 940 }, // Placeholder
   { name: '함평', id: 'hampyeong', d: 'M120 820 L140 820 L140 840 L120 840 Z', textX: 130, textY: 830 }, // Placeholder
   { name: '해남', id: 'haenam', d: 'M130 900 L150 900 L150 920 L130 920 Z', textX: 140, textY: 910 }, // Placeholder
   { name: '담양', id: 'damyang', d: 'M200 800 L220 800 L220 820 L200 820 Z', textX: 210, textY: 810 }, // Placeholder
   { name: '강진', id: 'gangjin', d: 'M180 880 L200 880 L200 900 L180 900 Z', textX: 190, textY: 890 }, // Placeholder - Note: Duplicate coords with Yeongam, need adjustment
   { name: '화순', id: 'hwasun', d: 'M220 820 L240 820 L240 840 L220 840 Z', textX: 230, textY: 830 }, // Placeholder
   { name: '곡성', id: 'gokseong', d: 'M280 800 L300 800 L300 820 L280 820 Z', textX: 290, textY: 810 }, // Placeholder
   { name: '상주', id: 'sangju', d: 'M450 450 L470 450 L470 470 L450 470 Z', textX: 460, textY: 460 }, // Placeholder - Note: Duplicate coords with Gyeongbuk center, need adjustment
   { name: '청도', id: 'cheongdo', d: 'M430 600 L450 600 L450 620 L430 620 Z', textX: 440, textY: 610 }, // Placeholder
   { name: '영주', id: 'yeongju', d: 'M400 350 L420 350 L420 370 L400 370 Z', textX: 410, textY: 360 }, // Placeholder
   { name: '안동', id: 'andong', d: 'M450 400 L470 400 L470 420 L450 420 Z', textX: 460, textY: 410 }, // Placeholder
   { name: '청송', id: 'cheongsong', d: 'M480 420 L500 420 L500 440 L480 440 Z', textX: 490, textY: 430 }, // Placeholder
   { name: '영양', id: 'yeongyang', d: 'M500 380 L520 380 L520 400 L500 400 Z', textX: 510, textY: 390 }, // Placeholder
   { name: '울릉도', id: 'ulleungdo', d: 'M700 200 L720 200 L720 220 L700 220 Z', textX: 710, textY: 210 }, // Placeholder
   { name: '봉화', id: 'bonghwa', d: 'M480 350 L500 350 L500 370 L480 370 Z', textX: 490, textY: 360 }, // Placeholder
   { name: '고령', id: 'goryeong', d: 'M400 650 L420 650 L420 670 L400 670 Z', textX: 410, textY: 660 }, // Placeholder
   { name: '김천', id: 'gimcheon', d: 'M350 550 L370 550 L370 570 L350 570 Z', textX: 360, textY: 560 }, // Placeholder
   { name: '예천', id: 'yecheon', d: 'M400 400 L420 400 L420 420 L400 420 Z', textX: 410, textY: 410 }, // Placeholder - Note: Duplicate coords with Andong, need adjustment
   { name: '문경', id: 'mungyeong', d: 'M380 400 L400 400 L400 420 L380 420 Z', textX: 390, textY: 410 }, // Placeholder
   { name: '칠곡', id: 'chilgok', d: 'M420 600 L440 600 L440 620 L420 620 Z', textX: 430, textY: 610 }, // Placeholder - Note: Duplicate coords with Cheongdo, need adjustment
   { name: '의성', id: 'uiseong', d: 'M450 480 L470 480 L470 500 L450 500 Z', textX: 460, textY: 490 }, // Placeholder
   { name: '울진', id: 'uljin', d: 'M550 380 L570 380 L570 400 L550 400 Z', textX: 560, textY: 390 }, // Placeholder
   { name: '영덕', id: 'yeongdeok', d: 'M550 450 L570 450 L570 470 L550 470 Z', textX: 560, textY: 460 }, // Placeholder
   { name: '경산', id: 'gyeongsan', d: 'M480 600 L500 600 L500 620 L480 620 Z', textX: 490, textY: 610 }, // Placeholder
   { name: '경주', id: 'gyeongju', d: 'M520 550 L540 550 L540 570 L520 570 Z', textX: 530, textY: 560 }, // Placeholder
   { name: '구미', id: 'gumi', d: 'M400 580 L420 580 L420 600 L400 600 Z', textX: 410, textY: 590 }, // Placeholder
   { name: '영천', id: 'yeongcheon', d: 'M480 550 L500 550 L500 570 L480 570 Z', textX: 490, textY: 560 }, // Placeholder
   { name: '포항', id: 'pohang', d: 'M580 500 L600 500 L600 520 L580 520 Z', textX: 590, textY: 510 }, // Placeholder
   { name: '의령', id: 'uiryeong', d: 'M380 700 L400 700 L400 720 L380 720 Z', textX: 390, textY: 710 }, // Placeholder
   { name: '남해', id: 'namhae', d: 'M300 850 L320 850 L320 870 L300 870 Z', textX: 310, textY: 860 }, // Placeholder - Note: Duplicate coords with Gyeongnam center, need adjustment
   { name: '산청', id: 'sancheong', d: 'M350 750 L370 750 L370 770 L350 770 Z', textX: 360, textY: 760 }, // Placeholder
   { name: '고성', id: 'goseong', d: 'M420 800 L440 800 L440 820 L420 820 Z', textX: 430, textY: 810 }, // Placeholder
   { name: '함양', id: 'hamyang', d: 'M300 700 L320 700 L320 720 L300 720 Z', textX: 310, textY: 710 }, // Placeholder
   { name: '진주', id: 'jinju', d: 'M350 780 L370 780 L370 800 L350 800 Z', textX: 360, textY: 790 }, // Placeholder
   { name: '함안', id: 'haman', d: 'M400 750 L420 750 L420 770 L400 770 Z', textX: 410, textY: 760 }, // Placeholder
   { name: '김해', id: 'gimhae', d: 'M450 750 L470 750 L470 770 L450 770 Z', textX: 460, textY: 760 }, // Placeholder
];


const HomePage: NextPage<HomePageProps> = ({ malls, mallCountsByRegion, regionPathData }) => {
  const svgViewBox = "0 0 800 1200"; // Should match the coordinate system of regionPathData

  // State for search query and filtered malls
  const [searchQuery, setSearchQuery] = useState('');
  // Initialize filteredMalls with all malls, ensure mall IDs are strings for consistency
  const [filteredMalls, setFilteredMalls] = useState<MallType[]>(
     malls.map(m => ({ ...m, id: String(m.id) })) // Ensure IDs are strings
  );

  // Effect to perform search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If query is empty, show all malls (ensure IDs are strings)
      setFilteredMalls(malls.map(m => ({ ...m, id: String(m.id) })));
    } else {
      // Perform simple search filtering
      const query = searchQuery.trim().toLowerCase();
      const filtered = malls.filter(mall => {
        return (
          mall.name.toLowerCase().includes(query) ||
          mall.region.toLowerCase().includes(query) ||
          (mall.city && mall.city.toLowerCase().includes(query)) ||
          (mall.tags && mall.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      });
      // Ensure IDs are strings in the filtered results
      setFilteredMalls(filtered.map(m => ({ ...m, id: String(m.id) })));
    }
  }, [searchQuery, malls]); // Dependencies: searchQuery, original malls list

  // Handler for the search bar input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8"> {/* Use gap for vertical spacing */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary-blue">
          전국 지자체 온라인 마켓 찾기
        </h1>

        {/* Search Bar Section */}
        <SearchBar onSearchChange={handleSearchChange} value={searchQuery} placeholder="지역 또는 마켓 이름을 검색하세요..." />

        {/* Map Section */}
        {/* The map still displays counts for ALL malls loaded via getStaticProps */}
        <section className="flex flex-col items-center"> {/* Center map content */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">지역별 마켓 수</h2>
          <InteractiveMap
            mallCountsByRegion={mallCountsByRegion}
            regionPathData={regionPathData}
            svgViewBox={svgViewBox}
          />
        </section>

        {/* Mall List Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
            {searchQuery ? `&apos;${searchQuery}&apos; 검색 결과` : '전체 마켓 목록'}
          </h2>
          {filteredMalls.length === 0 && searchQuery !== '' ? (
            <p className="text-center text-gray-600 text-lg mt-8">
              &apos;{searchQuery}&apos;에 해당하는 마켓을 찾을 수 없습니다.
            </p>
          ) : (
            // Use responsive grid columns for the mall list
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMalls.map((mall) => (
                // Pass individual mall properties explicitly to MallCard
                <MallCard
                  key={mall.id} // Key is essential for lists
                  id={mall.id}
                  name={mall.name}
                  url={mall.url}
                  region={mall.region}
                  isNew={mall.isNew} // Pass optional props if they exist
                  statusPopular={mall.statusPopular} // Pass optional props
                  lastVerified={mall.lastVerified} // Pass optional props
                  description={mall.description} // Pass optional props
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

// Use getStaticProps to fetch the data at build time
export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  // Use fs.readFile for robust build-time data loading
  const filePath = path.join(process.cwd(), 'data', 'malls.json');
  let malls: MallType[] = [];
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    malls = JSON.parse(jsonData);
    // Ensure IDs are strings for consistency throughout the app, especially for routing and keys
    malls = malls.map(mall => ({ ...mall, id: String(mall.id) }));
  } catch (error) {
    console.error('Error reading malls.json:', error);
    // Return empty data if file reading fails, or throw an error if preferred
  }

  // Calculate mall counts by region for the map (based on ALL malls loaded)
  const mallCountsByRegion: RegionMallData = {};
  malls.forEach((mall) => {
    // Use the region field directly from the mall data
    const region = mall.region;
    if (region) { // Ensure region is not null or undefined
      mallCountsByRegion[region] = (mallCountsByRegion[region] || 0) + 1;
    }
  });

  // Pass the calculated data and the defined region path data to the page component
  return {
    props: {
      malls, // Pass the full list for client-side filtering
      mallCountsByRegion, // Pass region counts for the map
      regionPathData: KOREA_REGION_PATH_DATA, // Pass the defined constant for map SVG
    },
    // Optional: revalidate data every N seconds (e.g., 86400 for 24 hours)
    // revalidate: 86400,
  };
};

export default HomePage;
// --- END pages/index.tsx ---
