import React, { useMemo, useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

// ============================================================================
// [PRODUCTION CONFIG] FIREBASE SETUP (Real-time Database)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBL8wVCMCsTJrUukZiHsRXjPUfptJGzvEs",
  authDomain: "pasaya-website.firebaseapp.com",
  projectId: "pasaya-website",
  storageBucket: "pasaya-website.firebasestorage.app",
  messagingSenderId: "639733389194",
  appId: "1:639733389194:web:16fe346bd0c29528091a73"
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error", error);
}

// ============================================================================
// [PRODUCTION CONFIG] CLOUDINARY SETUP
// ============================================================================
const CLOUDINARY_CLOUD_NAME = "dsxpwfujb"; 
const CLOUDINARY_UPLOAD_PRESET = "pasaya_website"; 

// ================= PRESETS (For Smart Media) =================
const IMAGE_PRESETS = [
  { name: 'Original (ต้นฉบับ)', class: '' },
  { name: 'AI Enhanced', class: 'filter brightness-[1.1] contrast-[1.15] saturate-[1.25] drop-shadow-sm' },
  { name: 'Bright & Airy (สว่างโปร่ง)', class: 'filter brightness-110 contrast-105 saturate-110' },
  { name: 'Warm Cozy (อบอุ่น)', class: 'filter sepia-[.3] brightness-105 contrast-110' },
  { name: 'Cool Modern (เย็นสบาย)', class: 'filter hue-rotate-[-15deg] saturate-110 contrast-105' },
  { name: 'Cinematic Dark', class: 'filter contrast-125 brightness-90 saturate-120' },
  { name: 'Vivid Colors (สีสดใส)', class: 'filter saturate-150 contrast-110' },
  { name: 'Soft Pastel (พาสเทล)', class: 'filter brightness-110 contrast-90 saturate-50' },
  { name: 'Monochrome (ขาวดำ)', class: 'filter grayscale contrast-125' },
  { name: 'Luxury Contrast (หรูหรา)', class: 'filter brightness-90 contrast-125 saturate-110' },
  { name: 'Vintage Film (ฟิล์ม)', class: 'filter sepia-[.5] contrast-90 brightness-110 hue-rotate-15' },
];

// ================= MOCK DATA (ข้อมูลตั้งต้น) =================
const MOCK_USERS = [
  { id: "T58121", name: "Admin", role: "admin", password: "Admin" },
  { id: "EMP001", name: "พนักงานขาย 1", role: "employee", password: "1234" }
];
const DEFAULT_FILTERS = ["ทั้งหมด", "ม่านลอน", "ม่านจีบ", "ม่านตาไก่", "ม่านม้วน", "มู่ลี่ไม้", "Black out", "Dim out", "บ้านพักอาศัย", "คอนโด"];

const MOCK_SETTINGS = {
  heroImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  heroTitle: "รังสรรค์พื้นที่ในฝัน\nด้วยผ้าม่านระดับพรีเมียม",
  heroSubtitle: "ร่วมค้นหาสไตล์ที่ใช่ไปกับเรา ผ่านคอลเลกชันเนื้อผ้าคุณภาพสูง รูปแบบการตัดเย็บที่ประณีต และชมผลงานติดตั้งจริงเพื่อเป็นแรงบันดาลใจให้กับบ้านของคุณ",
  heroPos: { x: 50, y: 50, zoom: 1 },
  cardFabricTitle: "ประเภทเนื้อผ้า",
  cardFabricImage: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80",
  cardFabricPos: { x: 50, y: 50, zoom: 1 },
  cardCurtainTitle: "รูปแบบผ้าม่าน",
  cardCurtainImage: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
  cardCurtainPos: { x: 50, y: 50, zoom: 1 },
  cardWallTitle: "Wall Fabric",
  cardWallImage: "https://images.unsplash.com/photo-1598928506311-c95148c8ab1a?auto=format&fit=crop&w=800&q=80",
  cardWallPos: { x: 50, y: 50, zoom: 1 }
};
const MOCK_FABRIC_TYPES = [
  { id: "blackout", order: 0, title: "Black out", desc: "กันแสง 100% ให้ความเป็นส่วนตัวสูงสุด และช่วยลดอุณหภูมิห้อง", fit: "ห้องนอน, ห้องดูหนัง, โรงแรม", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "dimout", order: 1, title: "Dim out", desc: "กันแสง 80-95% ผ้าพริ้วไหวสวยงาม สีสันหลากหลาย", fit: "ห้องนั่งเล่น, ห้องนอนทั่วไป, คอนโด", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "energy", order: 2, title: "Energy Saving", desc: "เนื้อผ้าทอพิเศษ ช่วยสะท้อนความร้อน ประหยัดพลังงานแอร์", fit: "ห้องที่รับแดดบ่าย, บ้านทิศตะวันตก, ออฟฟิศ", image: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "drapery", order: 3, title: "Drapery", desc: "ผ้าม่านทึบแสงตกแต่งทั่วไป เน้นลวดลายและ Texture ที่หรูหรา", fit: "โถงรับแขก, ห้องนั่งเล่นหลัก", image: "https://images.unsplash.com/photo-1522771731478-44fb509f61b0?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "flame", order: 4, title: "Flame Retardant", desc: "ผ้ากันลามไฟ ปลอดภัยสูงสุด ได้รับมาตรฐานสากล", fit: "โรงแรม, โรงพยาบาล, โครงการสาธารณะ", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "multi", order: 5, title: "Multipurpose", desc: "ผ้าอเนกประสงค์ ใช้งานได้หลากหลาย ทั้งม่านและบุเฟอร์นิเจอร์", fit: "พื้นที่ที่ต้องการความเข้าชุดกันของม่านและเฟอร์นิเจอร์", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "upholstery", order: 6, title: "Upholstery", desc: "ผ้าบุโซฟาและเฟอร์นิเจอร์ ทนทานต่อการเสียดสีสูง", fit: "งานสั่งทำเฟอร์นิเจอร์, ล็อบบี้", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "sheer", order: 7, title: "Sheer", desc: "ผ้าโปร่ง กรองแสงให้นุ่มนวล เพิ่มความพริ้วไหวและหรูหรา", fit: "ซ้อนเป็นม่านชั้นใน, ห้องที่ต้องการแสงธรรมชาติ", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
];
const MOCK_CURTAIN_STYLES = [
  { id: "pleat", order: 0, title: "ม่านจีบ", desc: "คลาสสิก จับจีบ 3 จีบ สวยงามเป็นระเบียบ", tags: ["ม่านจีบ", "classic"], image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "wave", order: 1, title: "ม่านลอน", desc: "ทันสมัย ลอนโค้งสม่ำเสมอ ทิ้งตัวสวย", tags: ["ม่านลอน", "modern"], image: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "eyelet", order: 2, title: "ม่านตาไก่", desc: "ร้อยห่วงตาไก่เข้ากับราง ใช้งานง่ายและดูเรียบหรู", tags: ["ม่านตาไก่", "eyelet"], image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "roman", order: 3, title: "ม่านพับ", desc: "ประหยัดพื้นที่ พับซ้อนกันขึ้นด้านบน", tags: ["ม่านพับ", "roman"], image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "roller", order: 4, title: "ม่านม้วน", desc: "มินิมอล ทำความสะอาดง่าย ม้วนเก็บเนี๊ยบ", tags: ["ม่านม้วน", "minimal"], image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "blinds", order: 5, title: "มู่ลี่", desc: "ปรับทิศทางแสงได้ มีทั้งไม้และอลูมิเนียม", tags: ["มู่ลี่", "blinds"], image: "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "tabtop", order: 6, title: "ม่านคอกระเช้า", desc: "สไตล์โฮมมี่ น่ารัก คล้องหูผ้าเข้ากับรางโดยตรง", tags: ["ม่านคอกระเช้า", "tabtop"], image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
];
const MOCK_WALL_FABRICS = [
  { id: "wall1", order: 0, title: "Wall Fabric Signature", style: "Texture premium", desc: "ใช้แทน Wallpaper ช่วยลดเสียงก้อง เพิ่มมิติและสัมผัสที่หรูหรา", image: "https://images.unsplash.com/photo-1598928506311-c95148c8ab1a?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" },
  { id: "wall2", order: 1, title: "Acoustic Wall Art", style: "Sound Absorbent", desc: "บุผนังซับเสียง เหมาะสำหรับห้องดูหนัง หรือห้องประชุม", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80", textColor: "#FFFFFF" }
];
const MOCK_PORTFOLIO_CARDS = [
  { 
    id: "port1", title: "Luxury Residence", subtitle: "ม่านลอน • Dim out | โปร่ง: ม่านจีบ • Sheer", type: "บ้านพักอาศัย", fabricType: "Dim out", sheerFabric: "Sheer", sheerStyle: "ม่านจีบ", sheerModel: "Sheer White", sheerColor: "White", curtainStyle: "ม่านลอน", model: "Premium Dimout", color: "Warm Beige", 
    tags: ["ม่านลอน", "Dim out", "Sheer", "บ้านพักอาศัย", "Warm Beige", "Luxury"], 
    images: ["https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1400&q=80", "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80"], 
    description: "งานบ้านพักอาศัยระดับ Luxury โชว์ความพลิ้วไหวของเนื้อผ้า ใช้ม่านลอนคู่กับผ้าโปร่งเพื่อความนุ่มนวล สร้างบรรยากาศที่ดูแพงและอบอุ่นในเวลาเดียวกัน",
    mergedIds: ["port1"]
  },
];
const MOCK_TIMELINE_ITEMS = [
  { id: "tl1", year: "1986", title: "The Beginning", text: "ก่อตั้งบริษัท สิ่งทอซาติน จำกัด เริ่มต้นตำนานโรงทอผ้าที่เน้นคุณภาพและเทคโนโลยีการทอระดับสูง พร้อมสร้างมาตรฐานใหม่ให้กับวงการสิ่งทอในประเทศไทย", images: ["https://images.unsplash.com/photo-1616422285623-14ff804e12c5?auto=format&fit=crop&w=1200&q=80"], textAlign: "left" },
  { id: "tl2", year: "2002", title: "Birth of PASAYA", text: "เปิดตัวแบรนด์ PASAYA อย่างเป็นทางการ สร้างปรากฏการณ์ผ้าปูที่นอนและผ้าม่านคุณภาพสูงที่คนไทยภาคภูมิใจ นำเสนอดีไซน์ที่เป็นเอกลักษณ์ผสมผสานกับนวัตกรรม", images: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80"], textAlign: "right" },
];

// ================= CSS UTILITIES =================
const glassCard = "rounded-[24px] md:rounded-[36px] border border-white/45 bg-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-3xl";
const softButton = "rounded-full border border-white/55 bg-white/45 px-4 py-2 text-sm text-neutral-700 backdrop-blur-xl transition hover:bg-white/65 hover:shadow-sm";
const activeButton = "rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-neutral-800";
const inputClass = "w-full rounded-2xl border border-white/55 bg-white/55 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:bg-white/80 transition placeholder:text-neutral-400";
const aiFilterClass = "filter brightness-[1.1] contrast-[1.15] saturate-[1.25] drop-shadow-sm";

// ================= RENDER HELPERS =================
const safeScale = (zoom) => {
  const scale = parseFloat(zoom);
  return isNaN(scale) ? 1 : scale;
};

// ฟังก์ชันป้องกัน Error การแครชเวลาข้อมูลมาจาก Firebase แล้วมี Format ผิดปกติ
const renderString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' && (val === "undefined" || val === "null" || val.trim() === "")) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
};

// ฟังก์ชันลบเว้นวรรคและตัวพิมพ์เล็กใหญ่เพื่อเช็คการซ้ำซ้อนอย่างแม่นยำที่สุด
const norm = (str) => {
  if (!str || str === "-") return "";
  return String(str).toLowerCase().replace(/[\s\-\_]+/g, '');
};

// สร้าง Key สำหรับใช้ Group งานที่เหมือนกันเป๊ะๆ ให้มารวมใน Card เดียวกัน
const getGroupKey = (item) => {
  const hasSheer = !!norm(item.sheerFabric);
  const sheerPart = hasSheer 
    ? `|${norm(item.sheerFabric)}|${norm(item.sheerStyle || 'ม่านจีบ')}|${norm(item.sheerModel)}|${norm(item.sheerColor)}` 
    : `|none|none|none|none`;
  return `${norm(item.curtainStyle)}|${norm(item.fabricType)}|${norm(item.model)}|${norm(item.color)}${sheerPart}`;
};

// Safe rendering tags to prevent React element Object crashes
const getSafeTags = (item) => {
  if (!item) return [];
  let types = [];
  if (Array.isArray(item.type)) {
      types = item.type;
  } else if (typeof item.type === 'string') {
      types = item.type.split(',');
  }
  const rawTags = [
      item.curtainStyle,
      item.fabricType,
      item.sheerFabric,
      ...types
  ];
  return Array.from(new Set(rawTags.filter(Boolean).map(String).map(s => s.trim()).filter(t => t !== 'undefined' && t !== 'null')));
};

const bgStyleObj = (url, pos) => ({
  backgroundImage: `url("${url || ''}")`,
  backgroundPosition: pos ? `${pos.x !== undefined ? pos.x : 50}% ${pos.y !== undefined ? pos.y : 50}%` : 'center',
  backgroundSize: pos?.zoom ? `${safeScale(pos.zoom) * 100}%` : 'cover',
  backgroundRepeat: 'no-repeat'
});

// Used for cropping/zooming perfectly without overflowing the container
const innerBgStyle = (url, pos) => ({
  backgroundImage: `url("${url || ''}")`,
  backgroundPosition: pos ? `${pos.x !== undefined ? pos.x : 50}% ${pos.y !== undefined ? pos.y : 50}%` : 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  transform: `scale(${safeScale(pos?.zoom)})`
});

export default function PasayaCurtainCenterPreview() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [loginError, setLoginError] = useState("");
  
  // Navigation
  const [navHistory, setNavHistory] = useState([]);
  const [activePage, setActivePage] = useState("Home");
  
  // Data States
  const [settings, setSettings] = useState(MOCK_SETTINGS);
  const [usersList, setUsersList] = useState(MOCK_USERS);
  const [portfolioCards, setPortfolioCards] = useState(MOCK_PORTFOLIO_CARDS);
  const [timelineItems, setTimelineItems] = useState(MOCK_TIMELINE_ITEMS);
  const [fabricTypes, setFabricTypes] = useState(MOCK_FABRIC_TYPES);
  const [curtainStyles, setCurtainStyles] = useState(MOCK_CURTAIN_STYLES);
  const [wallFabrics, setWallFabrics] = useState(MOCK_WALL_FABRICS);
  
  // Filters State
  const [portfolioFilters, setPortfolioFilters] = useState(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [newFilterKeyword, setNewFilterKeyword] = useState("");

  // Forms & Selections
  const [newUserForm, setNewUserForm] = useState({ id: "", name: "", role: "employee", password: "" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ id: "", name: "", role: "", password: "" });
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);

  const [productTab, setProductTab] = useState("fabricTypes");
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedWallFabric, setSelectedWallFabric] = useState(null);
  const [selectedPortfolioFilter, setSelectedPortfolioFilter] = useState("ทั้งหมด");
  const [portfolioSearch, setPortfolioSearch] = useState("");
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [aiInput, setAiInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "สวัสดีค่ะ ผู้ช่วยขาย PASAYA ยินดีให้บริการค่ะ ต้องการให้ช่วยวิเคราะห์ความต้องการลูกค้า แนะนำสินค้า หรือขอ Script ช่วยปิดการขาย พิมพ์บอกได้เลยค่ะ" },
  ]);
  const messagesEndRef = useRef(null);

  const [uploadStep, setUploadStep] = useState(1);
  const [uploadQueue, setUploadQueue] = useState([]); 
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

  // Edit Modal (Global for changing images, zoom/pan, text color, card aspect, and preview ratio)
  const [editImageModal, setEditImageModal] = useState({ 
    isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false, 
    pos: { x: 50, y: 50, zoom: 1 }, textColor: '#FFFFFF', cardAspect: 'landscape',
    previewAspect: '4:3', targetItem: null, textTitle: '', textSubtitle: ''
  });
  const fileInputRef = useRef(null);
  const smartMediaInputRef = useRef(null);
  const smartMediaFolderRef = useRef(null);

  // Mouse Dragging State for Edit Modal
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 50, initialPosY: 50 });
  const previewRef = useRef(null);

  // Timeline Modal
  const [timelineModal, setTimelineModal] = useState({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', images: [], textAlign: 'left' }, rawFiles: [], newUrlInput: '' });
  const [confirmDeleteTimelineId, setConfirmDeleteTimelineId] = useState(null);
  const timelineFileRef = useRef(null);

  const getNavItems = () => {
    let items = ["Home", "Products", "Portfolio", "About", "AI Assistant"];
    if (currentUser?.role === 'admin') items.push("Manage Users");
    return items;
  };

  const navigateTo = (page) => {
    if (page !== activePage) {
      setNavHistory(prev => [...prev, activePage]);
      setActivePage(page);
    }
  };

  const handleBack = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(prevHistory => prevHistory.slice(0, -1));
      setActivePage(prev);
    } else {
      setActivePage("Home");
    }
  };

  // ================= REAL-TIME FETCH DATA FROM FIREBASE =================
  useEffect(() => {
    if (!db) return;

    // Use isDeleted flag to completely ignore deleted items AND clean up "undefined" strings
    const mergeData = (dbList, mockList) => {
      const activeDbList = dbList.filter(d => !d.isDeleted);
      const merged = mockList.map(mock => {
        const dbItem = activeDbList.find(d => d.id === mock.id);
        if (!dbItem) return mock;

        const cleanDbItem = {};
        for (const [key, value] of Object.entries(dbItem)) {
          if (value !== 'undefined' && value !== undefined && value !== null) {
            cleanDbItem[key] = value;
          }
        }
        return { ...mock, ...cleanDbItem };
      });
      const newItems = activeDbList.filter(d => !mockList.find(mock => mock.id === d.id));
      return [...merged, ...newItems].filter(d => !d.isDeleted).sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const unsubSettings = onSnapshot(doc(db, "settings", "home"), (docSnap) => {
      if (docSnap.exists()) setSettings({ ...MOCK_SETTINGS, ...docSnap.data() });
    });

    const unsubFilters = onSnapshot(doc(db, "settings", "portfolioFilters"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list?.length > 0) {
        setPortfolioFilters(docSnap.data().list);
      }
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const uList = snapshot.docs.map((doc) => ({ dbId: doc.id, ...doc.data() }));
      setUsersList(uList.length > 0 ? uList : MOCK_USERS);
    }, (error) => console.error("Firebase Users Error:", error));

    const unsubPortfolio = onSnapshot(collection(db, "portfolio"), (snapshot) => {
      if (snapshot.empty) {
        setPortfolioCards([]); 
      } else {
        const dbItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const activeDbItems = dbItems.filter(d => !d.isDeleted);
        const newItems = activeDbItems.filter(d => !MOCK_PORTFOLIO_CARDS.find(mock => mock.id === d.id));
        const mergedMocks = MOCK_PORTFOLIO_CARDS.map(mock => activeDbItems.find(d => d.id === mock.id) || mock).filter(d => !d.isDeleted);
        setPortfolioCards([...newItems.reverse(), ...mergedMocks]);
      }
    });

    const unsubTimeline = onSnapshot(collection(db, "timeline"), (snapshot) => {
      const dbItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const merged = mergeData(dbItems, MOCK_TIMELINE_ITEMS);
      setTimelineItems(merged.sort((a,b) => String(a.year).localeCompare(String(b.year))));
    });

    const unsubFabrics = onSnapshot(collection(db, "fabricTypes"), (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFabricTypes(mergeData(dbItems, MOCK_FABRIC_TYPES));
    });
    
    const unsubStyles = onSnapshot(collection(db, "curtainStyles"), (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCurtainStyles(mergeData(dbItems, MOCK_CURTAIN_STYLES));
    });

    const unsubWalls = onSnapshot(collection(db, "wallFabrics"), (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallFabrics(mergeData(dbItems, MOCK_WALL_FABRICS));
    });

    return () => {
      unsubSettings(); unsubFilters(); unsubUsers(); unsubPortfolio(); unsubTimeline();
      unsubFabrics(); unsubStyles(); unsubWalls();
    };
  }, []);

  // Handle Mouse Wheel for Zoom in Edit Modal
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !editImageModal.isOpen) return;

    const onWheel = (e) => {
      e.preventDefault(); 
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      setEditImageModal(prev => {
        let newZoom = safeScale(prev.pos.zoom) + zoomDelta;
        newZoom = Math.max(1, Math.min(newZoom, 5)); 
        return { ...prev, pos: { ...prev.pos, zoom: newZoom } };
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [editImageModal.isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, isAiTyping]);

  useEffect(() => {
    if (productTab === "fabricTypes" && !selectedFabric) setSelectedFabric(fabricTypes[0]);
    if (productTab === "curtainStyles" && !selectedStyle) setSelectedStyle(curtainStyles[0]);
    if (productTab === "wallFabric" && !selectedWallFabric) setSelectedWallFabric(wallFabrics[0]);
  }, [productTab, fabricTypes, curtainStyles, wallFabrics]);

  const handleLogin = (e) => {
    e.preventDefault();
    const inputId = loginForm.id.trim();
    const inputPassword = loginForm.password.trim();
    
    let user = usersList.find(u => String(u.id).trim().toLowerCase() === inputId.toLowerCase() && String(u.password).trim() === inputPassword);
    
    if (!user && inputId.toUpperCase() === "T58121" && inputPassword === "Admin") {
      user = { id: "T58121", name: "Admin (System)", role: "admin", password: "Admin" };
    }
    
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage("Home");
    setNavHistory([]);
    setLoginForm({ id: "", password: "" });
  };

  const toggleVisibility = async (collectionName, item, currentHiddenState) => {
    if (!db) return;
    try {
      if (collectionName === "portfolio" && item.mergedIds) {
         for (const id of item.mergedIds) {
            await setDoc(doc(db, collectionName, id), { isHidden: !currentHiddenState }, { merge: true });
         }
      } else {
         await setDoc(doc(db, collectionName, item.id), { ...item, isHidden: !currentHiddenState }, { merge: true });
      }
    } catch (e) {
      console.error("Toggle visibility failed", e);
    }
  };

  const handleMoveItem = async (collectionName, items, index, direction, setStateFunc) => {
    if (index + direction < 0 || index + direction >= items.length) return;
    
    const newList = [...items];
    
    // สลับค่าใน Array
    const temp = newList[index];
    newList[index] = newList[index + direction];
    newList[index + direction] = temp;

    // รันเลขลำดับ (Order) ใหม่ทั้งหมดเพื่อลบปัญหาเลขชนกันแล้วเลื่อนไม่สุด
    const updatedList = newList.map((item, idx) => ({ ...item, order: idx }));
    
    setStateFunc(updatedList); // Optimistic Update

    if (db) {
      try {
        await Promise.all(updatedList.map(item => 
          setDoc(doc(db, collectionName, item.id), { order: item.order }, { merge: true })
        ));
      } catch (e) {
        console.error("Reorder error", e);
      }
    }
  };

  // Dynamic Grouping of Portfolio Cards
  const groupedPortfolioCards = useMemo(() => {
    const grouped = [];
    const map = new Map();

    portfolioCards.forEach(item => {
        const key = getGroupKey(item);
        
        if (map.has(key)) {
            const existing = map.get(key);
            // Merge images
            const newImages = item.images.filter(img => !existing.images.includes(img));
            existing.images = [...existing.images, ...newImages];
            // Merge tags
            existing.tags = getSafeTags(existing).concat(getSafeTags(item));
            existing.tags = Array.from(new Set(existing.tags));
            
            // Merge types (บ้าน/คอนโด)
            const typeSet = new Set([
              ...(existing.type ? String(existing.type).split(',').map(s=>s.trim()) : []),
              ...(item.type ? String(item.type).split(',').map(s=>s.trim()) : [])
            ]);
            existing.type = Array.from(typeSet).filter(Boolean).join(', ');
            
            if (!existing.mergedIds) existing.mergedIds = [existing.id];
            if (!existing.mergedIds.includes(item.id)) existing.mergedIds.push(item.id);
        } else {
            const clone = { ...item, images: [...item.images], tags: getSafeTags(item), mergedIds: [item.id] };
            map.set(key, clone);
            grouped.push(clone);
        }
    });
    return grouped;
  }, [portfolioCards]);

  const filteredPortfolio = useMemo(() => {
    let base = groupedPortfolioCards;
    if (currentUser?.role !== 'admin') {
      base = base.filter(item => !item.isHidden);
    }
    if (selectedPortfolioFilter !== "ทั้งหมด") {
      base = base.filter(item => 
        getSafeTags(item).some(tag => String(tag).includes(selectedPortfolioFilter)) || 
        (item.type && String(item.type).includes(selectedPortfolioFilter)) ||
        item.fabricType === selectedPortfolioFilter ||
        item.curtainStyle === selectedPortfolioFilter
      );
    }
    if (portfolioSearch.trim()) {
      const q = portfolioSearch.toLowerCase();
      base = base.filter(item => 
        String(item.title || "").toLowerCase().includes(q) || 
        String(item.subtitle || "").toLowerCase().includes(q) ||
        getSafeTags(item).some(tag => String(tag).toLowerCase().includes(q)) || 
        String(item.model || "").toLowerCase().includes(q) ||
        String(item.color || "").toLowerCase().includes(q)
      );
    }
    return base;
  }, [selectedPortfolioFilter, portfolioSearch, groupedPortfolioCards, currentUser]);

  // ================= CLOUDINARY API =================
  const uploadImageToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_CLOUD_NAME.includes("ใส่_CLOUD_NAME")) {
      return URL.createObjectURL(file);
    }
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(url, { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Upload failed");
      }
      const data = await response.json();
      return data.secure_url; 
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert(`อัปโหลดรูปภาพไม่สำเร็จ: ${error.message}`);
      return null;
    }
  };

  // ================= GLOBAL IMAGE EDITOR =================
  const openEditModal = (type, id, currentObj) => {
    let targetUrl = currentObj.image || '';
    let tTitle = currentObj.title || '';
    let tSub = currentObj.desc || currentObj.subtitle || '';

    if (type === 'portfolioCards') {
       targetUrl = currentObj.images ? currentObj.images[currentImageIndex] : '';
    }
    if (type === 'settings_home') {
       if (id === 'hero') {
         targetUrl = currentObj.heroImage || MOCK_SETTINGS.heroImage;
         tTitle = currentObj.heroTitle || MOCK_SETTINGS.heroTitle;
         tSub = currentObj.heroSubtitle || MOCK_SETTINGS.heroSubtitle;
       } else if (id === 'cardFabric') {
         targetUrl = currentObj.cardFabricImage || MOCK_SETTINGS.cardFabricImage;
         tTitle = currentObj.cardFabricTitle || MOCK_SETTINGS.cardFabricTitle;
       } else if (id === 'cardCurtain') {
         targetUrl = currentObj.cardCurtainImage || MOCK_SETTINGS.cardCurtainImage;
         tTitle = currentObj.cardCurtainTitle || MOCK_SETTINGS.cardCurtainTitle;
       } else if (id === 'cardWall') {
         targetUrl = currentObj.cardWallImage || MOCK_SETTINGS.cardWallImage;
         tTitle = currentObj.cardWallTitle || MOCK_SETTINGS.cardWallTitle;
       }
    }

    setEditImageModal({ 
      isOpen: true, type, id, 
      url: targetUrl, 
      fileObj: null, isSaving: false,
      pos: currentObj.imgPos || currentObj[`${id}Pos`] || { x: 50, y: 50, zoom: 1 },
      textColor: currentObj.textColor || '#FFFFFF',
      textTitle: tTitle,
      textSubtitle: tSub,
      cardAspect: currentObj.cardAspect || 'landscape',
      previewAspect: '4:3', 
      targetItem: currentObj 
    });
  };

  const handleEditModalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageModal(prev => ({ ...prev, url: URL.createObjectURL(file), fileObj: file }));
  };

  const handleSaveImage = async () => {
    const { type, id, url, fileObj, pos, textColor, cardAspect, textTitle, textSubtitle, targetItem } = editImageModal;
    if (!fileObj && !url.trim()) return;

    setEditImageModal(prev => ({ ...prev, isSaving: true }));

    let finalImageUrl = url.trim();
    if (fileObj) {
       const uploadedUrl = await uploadImageToCloudinary(fileObj);
       if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    const payload = { image: finalImageUrl, imgPos: pos, textColor, cardAspect, title: textTitle, desc: textSubtitle };

    try {
      if (type === "settings_home") {
        const updates = {
           [`${id}Image`]: finalImageUrl,
           [`${id}Pos`]: pos,
           [`${id}Title`]: textTitle
        };
        if (id === 'hero') updates[`${id}Subtitle`] = textSubtitle;
        if (db) await setDoc(doc(db, "settings", "home"), updates, { merge: true });
        setSettings(prev => ({...prev, ...updates}));
      } else if (type === "portfolioCards") {
        const pIndex = portfolioCards.findIndex(p => p.id === id);
        if (pIndex > -1) {
           const newImages = [...portfolioCards[pIndex].images];
           newImages[currentImageIndex] = finalImageUrl;
           if (db) await setDoc(doc(db, "portfolio", id), { images: newImages, imgPos: pos, cardAspect }, { merge: true });
        }
      } else {
        const getFallbackItem = () => {
           if(type==='fabricTypes') return MOCK_FABRIC_TYPES.find(i=>i.id===id);
           if(type==='curtainStyles') return MOCK_CURTAIN_STYLES.find(i=>i.id===id);
           if(type==='wallFabrics') return MOCK_WALL_FABRICS.find(i=>i.id===id);
           return {};
        };
        const fullItem = {
           ...(targetItem || getFallbackItem() || {}),
           ...payload
        };
        if (db) await setDoc(doc(db, type, id), fullItem, { merge: true });
      }
    } catch(e) {
      console.error("Save image error", e);
    }
    
    setEditImageModal({ isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false, pos:{x:50,y:50,zoom:1}, textColor:'#FFF', cardAspect:'landscape', previewAspect: '4:3', targetItem: null, textTitle: '', textSubtitle: '' });
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetToDefault = () => {
    const { type, id } = editImageModal;
    let defTitle = '';
    let defSub = '';
    let defUrl = '';

    if (type === 'settings_home') {
      if (id === 'hero') {
         defTitle = MOCK_SETTINGS.heroTitle;
         defSub = MOCK_SETTINGS.heroSubtitle;
         defUrl = MOCK_SETTINGS.heroImage;
      } else if (id === 'cardFabric') {
         defTitle = MOCK_SETTINGS.cardFabricTitle;
         defUrl = MOCK_SETTINGS.cardFabricImage;
      } else if (id === 'cardCurtain') {
         defTitle = MOCK_SETTINGS.cardCurtainTitle;
         defUrl = MOCK_SETTINGS.cardCurtainImage;
      } else if (id === 'cardWall') {
         defTitle = MOCK_SETTINGS.cardWallTitle;
         defUrl = MOCK_SETTINGS.cardWallImage;
      }
    } else {
      const mockList = type === 'fabricTypes' ? MOCK_FABRIC_TYPES : type === 'curtainStyles' ? MOCK_CURTAIN_STYLES : MOCK_WALL_FABRICS;
      const found = mockList.find(i => i.id === id);
      if (found) {
         defTitle = found.title;
         defSub = found.desc;
         defUrl = found.image;
      }
    }

    setEditImageModal(prev => ({
      ...prev,
      url: defUrl || prev.url,
      pos: { x: 50, y: 50, zoom: 1 },
      textColor: '#FFFFFF',
      textTitle: defTitle !== undefined ? defTitle : prev.textTitle,
      textSubtitle: defSub !== undefined ? defSub : prev.textSubtitle
    }));
  };

  // Drag Handlers for Image Preview
  const handleEditMouseDown = (e) => {
    setDragState({ 
      isDragging: true, 
      startX: e.clientX, 
      startY: e.clientY,
      initialPosX: editImageModal.pos.x !== undefined ? editImageModal.pos.x : 50,
      initialPosY: editImageModal.pos.y !== undefined ? editImageModal.pos.y : 50
    });
  };

  const handleEditMouseMove = (e) => {
    if (!dragState.isDragging) return;
    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    setEditImageModal(prev => {
      const zoom = safeScale(prev.pos.zoom);
      const sensitivityX = 100 / 300; 
      const sensitivityY = 100 / 200; 
      
      let newX = dragState.initialPosX - ((deltaX * sensitivityX) / zoom);
      let newY = dragState.initialPosY - ((deltaY * sensitivityY) / zoom);
      
      // เอาข้อจำกัดออกเพื่อเลื่อนอิสระ
      return { ...prev, pos: { ...prev.pos, x: newX, y: newY } };
    });
  };

  const handleEditMouseUp = () => setDragState(prev => ({ ...prev, isDragging: false }));
  
  const handleEditTouchStart = (e) => {
    setDragState({ 
      isDragging: true, 
      startX: e.touches[0].clientX, 
      startY: e.touches[0].clientY,
      initialPosX: editImageModal.pos.x !== undefined ? editImageModal.pos.x : 50,
      initialPosY: editImageModal.pos.y !== undefined ? editImageModal.pos.y : 50
    });
  };

  const handleEditTouchMove = (e) => {
    if (!dragState.isDragging) return;
    const deltaX = e.touches[0].clientX - dragState.startX;
    const deltaY = e.touches[0].clientY - dragState.startY;

    setEditImageModal(prev => {
      const zoom = safeScale(prev.pos.zoom);
      let newX = dragState.initialPosX - ((deltaX * 0.3) / zoom);
      let newY = dragState.initialPosY - ((deltaY * 0.5) / zoom);
      // เอาข้อจำกัดออกเพื่อเลื่อนอิสระ
      return { ...prev, pos: { ...prev.pos, x: newX, y: newY } };
    });
  };

  // Get Aspect Ratio Style for Preview Modal (Inline style matching precise UI display)
  const getPreviewStyle = () => {
    if (editImageModal.type === "settings_home") {
       if (editImageModal.id === 'hero') return { aspectRatio: '5 / 4' };
       return { aspectRatio: '16 / 9' }; 
    }
    if (['wallFabrics', 'fabricTypes', 'curtainStyles'].includes(editImageModal.type)) {
       return { aspectRatio: editImageModal.previewAspect === '16:9' ? '16 / 9' : '4 / 3' };
    }
    if (editImageModal.type === "portfolioCards") {
       return { aspectRatio: editImageModal.cardAspect === 'portrait' ? '3 / 4' : '4 / 3' };
    }
    return { aspectRatio: '4 / 3' };
  };

  // ================= SMART MEDIA LOGIC =================
  const handleSmartMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const grouped = {};
    files.forEach(file => {
      const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
      let folderName = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
      let fileName = file.name;

      const cleanModel = folderName ? fileName.replace(/\.[^/.]+$/, "").replace(/[\s_-]+\d+.*$/, "").trim() : "";
      const cleanColor = fileName.replace(/\.[^/.]+$/, "").replace(/[\s_-]+\d+.*$/, "").trim();

      const key = `${cleanModel}-${cleanColor}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: "draft_" + Math.random().toString(36).substr(2, 9),
          title: folderName || "ผลงานใหม่",
          model: cleanModel,
          color: cleanColor,
          fabricType: "Dim out",
          sheerFabric: "",
          sheerStyle: "ม่านจีบ",
          sheerModel: "",
          sheerColor: "",
          curtainStyle: "ม่านลอน",
          type: "บ้านพักอาศัย",
          images: [], 
          rawFiles: [], 
          presetClass: '',
          cardAspect: 'landscape'
        };
      }
      grouped[key].rawFiles.push(file);
      grouped[key].images.push(URL.createObjectURL(file));
    });

    setUploadQueue(Object.values(grouped));
    setUploadStep(2);
  };

  const updateQueueItem = (index, field, value) => {
    const newQueue = [...uploadQueue];
    newQueue[index][field] = value;
    setUploadQueue(newQueue);
  };

  const saveBulkPortfolio = async () => {
    setIsUploadingToCloud(true);
    try {
      // จับกลุ่มรูปภาพที่มีสเปกตรงกันภายในรอบอัปโหลดเดียวกันก่อน
      const groupedQueue = {};
      for (const item of uploadQueue) {
        const sig = getGroupKey(item);
        if (!groupedQueue[sig]) {
          groupedQueue[sig] = { ...item, rawFiles: [...item.rawFiles], images: [...item.images] };
        } else {
          groupedQueue[sig].rawFiles.push(...item.rawFiles);
          groupedQueue[sig].images.push(...item.images);
          // Combine tags/types
          const mergedTypes = Array.from(new Set([
             ...(groupedQueue[sig].type ? String(groupedQueue[sig].type).split(',').map(s=>s.trim()) : []), 
             ...(item.type ? String(item.type).split(',').map(s=>s.trim()) : [])
          ])).filter(Boolean).join(", ");
          groupedQueue[sig].type = mergedTypes;
        }
      }

      const uniqueItems = Object.values(groupedQueue);

      // Save sequentially to avoid race conditions when matching with DB
      for (const item of uniqueItems) {
        const uploadedUrls = [];
        for (const file of item.rawFiles) {
          const url = await uploadImageToCloudinary(file);
          if (url) uploadedUrls.push(url);
        }
        const finalImages = uploadedUrls.length > 0 ? uploadedUrls : item.images;

        let subtitleText = `${item.curtainStyle} • ${item.fabricType}`;
        if (item.sheerFabric) subtitleText += ` | โปร่ง: ${item.sheerStyle || 'ม่านจีบ'} • ${item.sheerFabric}`;

        const itemTags = getSafeTags(item);

        const cardData = {
          title: item.title || "ผลงานใหม่",
          subtitle: subtitleText,
          type: item.type,
          fabricType: item.fabricType,
          sheerFabric: item.sheerFabric || "",
          sheerStyle: item.sheerStyle || "",
          sheerModel: item.sheerModel || "",
          sheerColor: item.sheerColor || "",
          curtainStyle: item.curtainStyle,
          model: item.model || "-",
          color: item.color || "-",
          tags: itemTags,
          images: finalImages, 
          presetClass: item.presetClass,
          cardAspect: item.cardAspect,
          description: "ผลงานหน้างานจริง อัปโหลดผ่านระบบ Smart Media",
          createdAt: new Date().toISOString(),
          isHidden: false
        };

        // ตรวจสอบว่ามีสเปกที่ตรงกันทุกประการอยู่ในฐานข้อมูลแล้วหรือไม่
        const existingMatch = groupedPortfolioCards.find(p => getGroupKey(p) === getGroupKey(item) && !p.isHidden && !p.isDeleted);

        if (existingMatch && db) {
          const primaryId = existingMatch.mergedIds[0];
          const combinedImages = Array.from(new Set([...existingMatch.images, ...finalImages]));
          const combinedTags = Array.from(new Set([...getSafeTags(existingMatch), ...itemTags]));
          const combinedTypes = Array.from(new Set([
            ...(existingMatch.type ? String(existingMatch.type).split(',').map(s=>s.trim()) : []), 
            ...(item.type ? String(item.type).split(',').map(s=>s.trim()) : [])
          ])).filter(Boolean).join(', ');

          await setDoc(doc(db, "portfolio", primaryId), { 
            images: combinedImages,
            tags: combinedTags,
            type: combinedTypes
          }, { merge: true });
        } else if (db) {
          await addDoc(collection(db, "portfolio"), cardData);
        }
      }
      setUploadStep(4);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการอัปโหลดภาพทั้งหมด");
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  // ================= OTHERS =================
  const confirmDeleteProject = async () => {
    try {
      if (db) {
        const idsToDelete = selectedProject.mergedIds || [selectedProject.id];
        for (const id of idsToDelete) {
           await setDoc(doc(db, "portfolio", id), { isDeleted: true }, { merge: true });
        }
      }
    } catch(e) { console.error("Delete Error", e); }
    closeProjectModal();
    setIsConfirmingDelete(false);
  };

  const saveProjectEdit = async () => {
    let newSubtitle = `${editProjectForm.curtainStyle} • ${editProjectForm.fabricType}`;
    if (editProjectForm.sheerFabric) newSubtitle += ` | โปร่ง: ${editProjectForm.sheerStyle || 'ม่านจีบ'} • ${editProjectForm.sheerFabric}`;

    const uniqueTags = getSafeTags(editProjectForm);
    const updatedData = { ...editProjectForm, subtitle: newSubtitle, tags: uniqueTags };
    
    // Remove mergedIds from payload to DB
    const { mergedIds, ...dataToSave } = updatedData;

    if (db) {
        const idsToUpdate = selectedProject.mergedIds || [selectedProject.id];
        const primaryId = idsToUpdate[0];
        
        await updateDoc(doc(db, "portfolio", primaryId), dataToSave);
        
        // Consolidate others into the primary one by deleting them to clean up DB
        if (idsToUpdate.length > 1) {
            for (let i = 1; i < idsToUpdate.length; i++) {
               await setDoc(doc(db, "portfolio", idsToUpdate[i]), { isDeleted: true }, { merge: true });
            }
        }
    }
    
    setIsEditingProject(false);
    setSelectedProject(null);
  };

  const handleDeepLinkToPortfolio = (tagKeyword) => {
    setPreviousPage("Products");
    setActivePage("Portfolio");
    setSelectedPortfolioFilter("ทั้งหมด");
    setPortfolioSearch(tagKeyword);
  };

  const openProjectModal = (project) => {
    setPreviousPage(activePage); 
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setIsEditingProject(false);
    setIsConfirmingDelete(false);
    
    // Fallback sheer fields for older data
    setSelectedProject({
      ...project,
      sheerFabric: project.sheerFabric || "",
      sheerStyle: project.sheerStyle || "ม่านจีบ",
      sheerModel: project.sheerModel || "",
      sheerColor: project.sheerColor || ""
    });
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setIsFullscreen(false);
  };

  const goBack = () => {
    closeProjectModal();
    if (previousPage) setActivePage(previousPage);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images.length);
      setZoomLevel(1);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
      setZoomLevel(1);
    }
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
  };

  const runAiDemo = () => {
    const input = aiInput.trim();
    if (!input) return;

    setAiMessages((prev) => [...prev, { role: "user", text: input }]);
    setAiInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let recommendation = "จากความต้องการนี้ แนะนำให้เปรียบเทียบฟังก์ชันการใช้งานของผ้าก่อนนะคะ แล้วเลือกรูปแบบการตัดเย็บที่เข้ากับสไตล์ห้องค่ะ";

      if (input.includes("โปร่ง") || input.includes("สว่าง") || input.includes("คอนโด")) {
        recommendation = "เคสนี้แนะนำใช้ผ้าประเภท **Dim out** ควบคู่กับ **Sheer (ผ้าโปร่ง)** ค่ะ ตัดเย็บแบบ **ม่านลอน** จะทำให้ห้องดูสูงและโปร่งขึ้นมาก ตอบโจทย์คอนโดหรือห้องพักที่ต้องการแสงธรรมชาติแต่นุ่มนวลค่ะ";
      } else if (input.includes("โรงแรม") || input.includes("มืด") || input.includes("ทึบ")) {
        recommendation = "สำหรับงานโรงแรมหรือลูกค้าที่ต้องการความมืดสนิท ต้องเป็นผ้า **Black out** เลยค่ะ แนะนำตัดเย็บเป็น **ม่านจีบ** หรือ **ม่านลอน** พร้อมเพิ่มรางดัดโค้งซ่อนแสงรั่วด้านข้างค่ะ";
      } else if (input.includes("ออฟฟิศ") || input.includes("มินิมอล") || input.includes("ร้อน")) {
        recommendation = "แนะนำ **ม่านม้วน (Roller Blinds)** ใช้ผ้าประเภท **Energy Saving** หรือ Sunscreen ค่ะ ช่วยสะท้อนความร้อน ลดแสงจ้าเข้าจอคอม แต่ยังมองเห็นวิวด้านนอก ดูมินิมอลและเป็นระเบียบสุดๆ";
      } else if (input.includes("ผนัง") || input.includes("หรู") || input.includes("เสียง")) {
        recommendation = "ลองนำเสนอ **Wall Fabric Signature** ควบคู่ไปเลยค่ะ นอกจากจะทำให้ห้องดู Luxury ขึ้นมากแล้ว ยังช่วยซับเสียง (Acoustic) ได้ดีกว่าวอลเปเปอร์กระดาษทั่วไปด้วยค่ะ";
      } else if (input.includes("แพง") || input.includes("ราคา") || input.includes("งบ")) {
        recommendation = "💡 **Script ปิดการขาย (Objection: ราคา):**\n'คุณลูกค้าคะ ผ้าม่าน PASAYA เราใช้เนื้อผ้าคุณภาพสูง ทอแน่น สีไม่ซีดจางและไม่เป็นฝุ่นง่าย เมื่อเทียบอายุการใช้งาน 5-10 ปีแล้ว คุ้มค่ากว่ามากค่ะ นอกจากนี้เรายังมีบริการวัดพื้นที่และติดตั้งโดยช่างผู้เชี่ยวชาญ รับประกันงานเนี๊ยบ จบในที่เดียวไม่ต้องปวดหัวแก้ทีหลังค่ะ สนใจรับโปรโมชั่นติดตั้งฟรีของเดือนนี้เลยไหมคะ?'";
      }

      setAiMessages((prev) => [...prev, { role: "assistant", text: recommendation }]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if(newUserForm.id && newUserForm.password) {
      if (db) await addDoc(collection(db, "users"), newUserForm);
      setNewUserForm({ id: "", name: "", role: "employee", password: "" });
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUserId(user.id);
    setEditUserForm({ ...user });
  };

  const saveUserEdit = async () => {
    if (db) {
       const userToEdit = usersList.find(u => u.id === editingUserId);
       if (userToEdit && userToEdit.dbId) await updateDoc(doc(db, "users", userToEdit.dbId), editUserForm);
    }
    setEditingUserId(null);
  };

  const deleteUser = async (id) => {
    if(window.confirm("ยืนยันการลบพนักงานรหัส " + id + "?")) {
      const userToDelete = usersList.find(u => u.id === id);
      if (db && userToDelete && userToDelete.dbId) await deleteDoc(doc(db, "users", userToDelete.dbId));
    }
  };

  const handleTimelineAddUrl = () => {
    if(timelineModal.newUrlInput.trim()) {
      setTimelineModal(prev => ({ 
        ...prev, 
        form: { ...prev.form, images: [...(prev.form.images || []), prev.newUrlInput.trim()] },
        newUrlInput: ''
      }));
    }
  };

  const handleTimelineFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setTimelineModal(prev => ({ 
      ...prev, 
      form: { ...prev.form, images: [...(prev.form.images || []), ...newImageUrls] },
      rawFiles: [...(prev.rawFiles || []), ...files] 
    }));
  };

  const removeTimelineImage = (indexToRemove) => {
    setTimelineModal(prev => {
      const newImages = prev.form.images.filter((_, i) => i !== indexToRemove);
      const newRawFiles = prev.rawFiles ? prev.rawFiles.filter((_, i) => i !== indexToRemove) : [];
      return { ...prev, form: { ...prev.form, images: newImages }, rawFiles: newRawFiles };
    });
  };

  const handleSaveTimeline = async () => {
    const { mode, form, rawFiles } = timelineModal;
    if (!form.year || !form.title) return;
    setIsUploadingToCloud(true);
    try {
      const uploadedUrls = [];
      if (rawFiles && rawFiles.length > 0) {
        for (const file of rawFiles) {
           const url = await uploadImageToCloudinary(file);
           if (url) uploadedUrls.push(url);
        }
      }
      const existingUrls = form.images.filter(img => !img.startsWith('blob:'));
      const finalImages = [...existingUrls, ...uploadedUrls];
      const finalForm = { year: form.year, title: form.title, text: form.text, textAlign: form.textAlign || "left", images: finalImages, isHidden: false };

      if (mode === 'add') {
        if (db) await addDoc(collection(db, "timeline"), finalForm);
      } else {
        if (db) {
          // Check if editing a MOCK item that's not in DB yet
          if (MOCK_TIMELINE_ITEMS.find(m => m.id === form.id) && !form.id.length > 10) {
             await setDoc(doc(db, "timeline", form.id), finalForm, { merge: true });
          } else {
             await updateDoc(doc(db, "timeline", form.id), finalForm);
          }
        }
      }
      setTimelineModal({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', images: [], textAlign: 'left' }, rawFiles: [], newUrlInput: '' });
      if(timelineFileRef.current) timelineFileRef.current.value = "";
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกไทม์ไลน์");
    } finally {
       setIsUploadingToCloud(false);
    }
  };

  const handleDeleteTimeline = async (id) => {
    try {
      if (db) await setDoc(doc(db, "timeline", id), { isDeleted: true }, { merge: true });
      setTimelineItems(prev => prev.filter(t => t.id !== id));
    } catch(e) { console.error(e) }
    setConfirmDeleteTimelineId(null);
  };

  // ================= RENDER LOGIN =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/50">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-700 font-bold mb-2">PASAYA Curtain Center</div>
            <h1 className="text-3xl font-bold text-neutral-900">Sales OS</h1>
            <p className="text-sm text-neutral-500 mt-2">เข้าสู่ระบบสำหรับพนักงาน</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">รหัสพนักงาน</label>
              <input type="text" value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">รหัสผ่าน</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:bg-white" required />
            </div>
            {loginError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</div>}
            <button type="submit" className="w-full bg-neutral-900 text-white rounded-2xl py-3 font-bold shadow-lg hover:bg-neutral-800 transition-colors">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  // ================= MAIN RENDER =================
  return (
    <div className="min-h-screen bg-[#F7F5F2] text-neutral-900 font-sans pb-20 md:pb-0">
      
      {/* Cloud Loading Overlay */}
      {isUploadingToCloud && (
        <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-neutral-900 mb-1">กำลังบันทึกข้อมูล</h3>
          <p className="text-sm text-neutral-500">ระบบกำลังซิงค์ข้อมูล ห้ามปิดหน้าต่างนี้...</p>
        </div>
      )}

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-10 w-[500px] h-[500px] rounded-full bg-white/60 blur-[100px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-stone-200/50 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <header className="sticky top-2 sm:top-4 z-40 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[28px] border border-white/60 bg-white/40 px-4 py-4 md:px-6 shadow-sm backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              {navHistory.length > 0 && activePage !== "Home" && (
                <button onClick={handleBack} className="p-2 bg-white/60 hover:bg-white rounded-full transition-colors border border-neutral-200 shadow-sm" title="ย้อนกลับ">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
              )}
              <div>
                <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">PASAYA Curtain Center</div>
                <div className="text-base md:text-lg font-bold text-neutral-800">Sales OS / Presentation</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center flex-wrap gap-2">
              {getNavItems().map((item) => (
                <button key={item} onClick={() => navigateTo(item)} className={activePage === item ? activeButton : softButton}>{item}</button>
              ))}
              <div className="h-6 w-px bg-neutral-300 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-right hidden lg:block">
                  <div className="font-bold text-neutral-800">{currentUser.name}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">{currentUser.role}</div>
                </div>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full text-xs font-bold transition-colors">ออกจากระบบ</button>
              </div>
            </nav>
          </div>
        </header>

        {/* MOBILE NAV */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-between gap-1 rounded-full border border-white/40 bg-white/80 px-2 py-2 shadow-2xl backdrop-blur-3xl">
          {["Home", "Products", "Portfolio", "AI Assistant"].map((item) => (
            <button key={item} onClick={() => navigateTo(item)} className={`flex-1 rounded-full py-2.5 text-[10px] font-semibold tracking-wide ${activePage === item ? "bg-neutral-900 text-white shadow-md" : "text-neutral-600"}`}>
              {item === "AI Assistant" ? "AI" : item}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
             <button onClick={() => navigateTo("Manage Users")} className={`flex-1 rounded-full py-2.5 text-[10px] font-semibold tracking-wide ${activePage === "Manage Users" ? "bg-neutral-900 text-white shadow-md" : "text-neutral-600"}`}>Users</button>
          )}
        </div>

        {/* ================= HOME PAGE (NEW FIXED FULL-WIDTH LAYOUT) ================= */}
        {activePage === "Home" && (
          <section className="animate-in fade-in duration-700">
            <div className={`p-4 sm:p-8 ${glassCard} flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-[600px]`}>
              {/* LEFT: Hero Section */}
              <div className="flex-[1.3] relative rounded-[24px] overflow-hidden group shadow-inner bg-neutral-100 border border-neutral-200/60 min-h-[300px]">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                   <div className="w-full h-full" style={innerBgStyle(settings?.heroImage || MOCK_SETTINGS.heroImage, settings?.heroPos)} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent pointer-events-none" />
                <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center h-full max-w-lg">
                   <div className="mb-4 inline-flex w-fit rounded-full border border-neutral-200/60 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700 backdrop-blur-md">
                     PASAYA EXPERIENCE
                   </div>
                   <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight whitespace-pre-line">
                     {renderString(settings?.heroTitle || MOCK_SETTINGS.heroTitle)}
                   </h1>
                   <p className="mt-5 text-sm md:text-base leading-relaxed text-neutral-600 whitespace-pre-line">
                     {renderString(settings?.heroSubtitle || MOCK_SETTINGS.heroSubtitle)}
                   </p>
                   <div className="mt-8 flex flex-wrap gap-3">
                     <button onClick={() => navigateTo("Products")} className={activeButton}>ชมแคตตาล็อกสินค้า</button>
                     <button onClick={() => navigateTo("AI Assistant")} className={softButton}>ผู้ช่วยแนะนำสไตล์</button>
                   </div>
                </div>

                {currentUser?.role === 'admin' && (
                  <button onClick={(e) => { e.stopPropagation(); openEditModal("settings_home", "hero", settings || MOCK_SETTINGS); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>

              {/* RIGHT: Recommended Categories */}
              <div className="flex-[0.7] flex flex-col gap-4">
                 <div className="flex items-center justify-between px-2 pb-1">
                   <h3 className="font-semibold text-lg text-neutral-800">หมวดหมู่สินค้าแนะนำ</h3>
                   <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 </div>
                 <div className="flex flex-col gap-3 flex-1">
                   {[
                     { id: "cardFabric", title: settings?.cardFabricTitle || MOCK_SETTINGS.cardFabricTitle, tab: "fabricTypes", image: settings?.cardFabricImage || MOCK_SETTINGS.cardFabricImage, pos: settings?.cardFabricPos || MOCK_SETTINGS.cardFabricPos },
                     { id: "cardCurtain", title: settings?.cardCurtainTitle || MOCK_SETTINGS.cardCurtainTitle, tab: "curtainStyles", image: settings?.cardCurtainImage || MOCK_SETTINGS.cardCurtainImage, pos: settings?.cardCurtainPos || MOCK_SETTINGS.cardCurtainPos },
                     { id: "cardWall", title: settings?.cardWallTitle || MOCK_SETTINGS.cardWallTitle, tab: "wallFabric", image: settings?.cardWallImage || MOCK_SETTINGS.cardWallImage, pos: settings?.cardWallPos || MOCK_SETTINGS.cardWallPos }
                   ].map((item) => (
                     <div key={item.title} className="relative flex-1 rounded-[20px] overflow-hidden group border border-neutral-200/50 shadow-sm min-h-[120px] cursor-pointer bg-neutral-100" onClick={() => { navigateTo("Products"); setProductTab(item.tab); }}>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                           <div className="w-full h-full" style={innerBgStyle(item.image, item.pos)} />
                        </div>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                           <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md text-center">{renderString(item.title, 'ไม่มีชื่อ')}</h3>
                        </div>
                        {currentUser?.role === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); openEditModal("settings_home", item.id, { image: item.image, imgPos: item.pos }); }} className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors opacity-0 group-hover:opacity-100">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PRODUCTS PAGE ================= */}
        {activePage === "Products" && (
          <section className="animate-in fade-in duration-500">
            <div className={`p-4 sm:p-8 ${glassCard}`}>
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">ข้อมูลสินค้าและการนำเสนอ</h2>
                  <p className="mt-2 text-sm text-neutral-500">เลือกหมวดหมู่เพื่อพรีเซนต์รายละเอียดให้ลูกค้า</p>
                </div>
                <div className="flex bg-white/50 p-1 rounded-full border border-white/60 backdrop-blur-md w-fit">
                  {[ { id: "fabricTypes", label: "ประเภทเนื้อผ้า" }, { id: "curtainStyles", label: "รูปแบบผ้าม่าน" }, { id: "wallFabric", label: "Wall Fabric" } ].map(tab => (
                    <button key={tab.id} onClick={() => setProductTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${productTab === tab.id ? "bg-neutral-900 text-white shadow-md" : "text-neutral-600 hover:bg-white/60"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FABRIC TYPES CONTENT */}
              {productTab === "fabricTypes" && selectedFabric && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-10 content-start">
                    {fabricTypes.filter(i => currentUser?.role === 'admin' || !i.isHidden).map((item, index) => (
                      <div key={item.id} onClick={() => setSelectedFabric(item)} className={`cursor-pointer relative w-full pt-[75%] rounded-2xl overflow-hidden group transition-all duration-200 border-2 ${selectedFabric.id === item.id ? "border-neutral-900 shadow-lg ring-2 ring-neutral-900/20" : "border-transparent hover:border-white/80 hover:shadow-sm"} ${item.isHidden ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
                        
                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                           <div className="w-full h-full" style={innerBgStyle(item.image, item.imgPos)} />
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10 pointer-events-none">
                          <div className="font-bold text-sm sm:text-base drop-shadow-md line-clamp-1" style={{ color: item.textColor || '#FFFFFF' }}>{renderString(item.title, 'ไม่มีชื่อ')}</div>
                        </div>

                        {currentUser?.role === 'admin' && (
                          <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem("fabricTypes", fabricTypes, index, -1, setFabricTypes); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนขึ้น">
                              ⬆️
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem("fabricTypes", fabricTypes, index, 1, setFabricTypes); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนลง">
                              ⬇️
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleVisibility("fabricTypes", item, item.isHidden); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title={item.isHidden ? 'แสดง' : 'ซ่อน'}>
                              {item.isHidden ? '👁️‍🗨️' : '👁️'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal("fabricTypes", item.id, item); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="แก้ไขรูป/สีข้อความ">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl h-fit sticky top-24 shadow-md group">
                    <div className="h-56 sm:h-72 w-full relative overflow-hidden">
                      <div className="w-full h-full transition-transform duration-500" style={innerBgStyle(selectedFabric.image, selectedFabric.imgPos)} />
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); openEditModal('fabricTypes', selectedFabric.id, selectedFabric); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 shadow-md z-20 opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Fabric Type</div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4">{renderString(selectedFabric.title, 'ไม่มีชื่อ')}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line">{renderString(selectedFabric.desc, 'ไม่มีรายละเอียด')}</p>
                      <div className="bg-white/80 rounded-[16px] p-4 mb-6 border border-white">
                        <span className="text-xs text-neutral-500 font-semibold block mb-1">เหมาะสำหรับติดตั้งที่:</span>
                        <span className="text-sm font-bold text-neutral-800">{renderString(selectedFabric.fit, '-')}</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleDeepLinkToPortfolio(selectedFabric.title)} className={`w-full ${activeButton}`}>ดูผลงานจริงที่ใช้ผ้าชนิดนี้</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CURTAIN STYLES CONTENT */}
              {productTab === "curtainStyles" && selectedStyle && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-10 content-start">
                    {curtainStyles.filter(i => currentUser?.role === 'admin' || !i.isHidden).map((item, index) => (
                      <div key={item.id} onClick={() => setSelectedStyle(item)} className={`cursor-pointer relative w-full pt-[75%] rounded-2xl overflow-hidden group transition-all duration-200 border-2 ${selectedStyle.id === item.id ? "border-neutral-900 shadow-lg ring-2 ring-neutral-900/20" : "border-transparent hover:border-white/80 hover:shadow-sm"} ${item.isHidden ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
                        
                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                           <div className="w-full h-full" style={innerBgStyle(item.image, item.imgPos)} />
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10 pointer-events-none">
                          <div className="font-bold text-white text-sm sm:text-base drop-shadow-md line-clamp-1" style={{ color: item.textColor || '#FFFFFF' }}>{renderString(item.title, 'ไม่มีชื่อ')}</div>
                        </div>
                        {currentUser?.role === 'admin' && (
                          <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem("curtainStyles", curtainStyles, index, -1, setCurtainStyles); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนขึ้น">
                              ⬆️
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem("curtainStyles", curtainStyles, index, 1, setCurtainStyles); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนลง">
                              ⬇️
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleVisibility("curtainStyles", item, item.isHidden); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title={item.isHidden ? 'แสดง' : 'ซ่อน'}>
                              {item.isHidden ? '👁️‍🗨️' : '👁️'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal("curtainStyles", item.id, item); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="แก้ไขรูป/สีข้อความ">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl h-fit sticky top-24 shadow-md group">
                    <div className="h-56 sm:h-72 w-full relative overflow-hidden">
                      <div className="w-full h-full transition-transform duration-500" style={innerBgStyle(selectedStyle.image, selectedStyle.imgPos)} />
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); openEditModal('curtainStyles', selectedStyle.id, selectedStyle); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 shadow-md z-20 opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Curtain Style</div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4">{renderString(selectedStyle.title, 'ไม่มีชื่อ')}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line">{renderString(selectedStyle.desc, 'ไม่มีรายละเอียด')}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {getSafeTags(selectedStyle).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-700">#{String(tag)}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleDeepLinkToPortfolio(selectedStyle.title)} className={`w-full ${activeButton}`}>ดูงานติดตั้งรูปแบบนี้</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WALL FABRIC CONTENT */}
              {productTab === "wallFabric" && selectedWallFabric && (
                <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10 content-start">
                    {wallFabrics.filter(i => currentUser?.role === 'admin' || !i.isHidden).map((item, index) => (
                      <div key={item.id} onClick={() => setSelectedWallFabric(item)} className={`cursor-pointer relative aspect-[3/2] sm:aspect-[4/3] rounded-2xl overflow-hidden group transition-all duration-200 border-2 ${selectedWallFabric.id === item.id ? "border-neutral-900 shadow-lg ring-2 ring-neutral-900/20" : "border-transparent hover:border-white/80 hover:shadow-sm"} ${item.isHidden ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
                         
                         <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                           <div className="w-full h-full" style={innerBgStyle(item.image, item.imgPos)} />
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors pointer-events-none" />
                         
                         <div className="absolute bottom-0 left-0 p-4 pointer-events-none">
                           <div className="font-bold text-base line-clamp-1" style={{ color: item.textColor || '#FFFFFF' }}>{renderString(item.title, 'ไม่มีชื่อ')}</div>
                           <div className="text-xs text-white/80 mt-1 line-clamp-1">{renderString(item.style, '')}</div>
                         </div>

                         {currentUser?.role === 'admin' && (
                           <div className="absolute top-3 right-3 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); handleMoveItem("wallFabrics", wallFabrics, index, -1, setWallFabrics); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนขึ้น">
                               ⬆️
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); handleMoveItem("wallFabrics", wallFabrics, index, 1, setWallFabrics); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="เลื่อนลง">
                               ⬇️
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); toggleVisibility("wallFabrics", item, item.isHidden); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title={item.isHidden ? 'แสดง' : 'ซ่อน'}>
                               {item.isHidden ? '👁️‍🗨️' : '👁️'}
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); openEditModal("wallFabrics", item.id, item); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="แก้ไขรูป">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl shadow-md h-fit sticky top-24 group">
                    <div className="h-56 sm:h-72 w-full relative overflow-hidden">
                      <div className="w-full h-full transition-transform duration-500" style={innerBgStyle(selectedWallFabric.image, selectedWallFabric.imgPos)} />
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); openEditModal("wallFabrics", selectedWallFabric.id, selectedWallFabric); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 shadow-md z-20 opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <h3 className="text-2xl font-bold mb-2">{renderString(selectedWallFabric.title, 'ไม่มีชื่อ')}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line">{renderString(selectedWallFabric.desc, 'ไม่มีรายละเอียด')}</p>
                      <button onClick={() => handleDeepLinkToPortfolio("Wall Fabric")} className={activeButton}>ดูผลงานหน้างานจริง</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= PORTFOLIO PAGE ================= */}
        {activePage === "Portfolio" && (
          <section className="animate-in fade-in duration-500 space-y-6">
            <div className={`p-6 md:p-8 ${glassCard} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
              <div className="w-full md:w-1/3">
                <h3 className="text-2xl font-bold mb-2">ค้นหาผลงานติดตั้ง</h3>
                <p className="text-sm text-neutral-500">ใช้เป็น Reference นำเสนอลูกค้า</p>
              </div>
              <div className="w-full md:w-2/3 flex flex-col gap-3">
                <input value={portfolioSearch} onChange={(e) => setPortfolioSearch(e.target.value)} className={inputClass} placeholder="ค้นหาชื่อโครงการ, สี, ประเภทผ้า, รูปแบบม่าน (เช่น Black out, ม่านม้วน, Beige)" />
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
                  {portfolioFilters.map((filter) => (
                    <button key={filter} onClick={() => setSelectedPortfolioFilter(filter)} className={`shrink-0 ${selectedPortfolioFilter === filter ? activeButton : softButton}`}>{renderString(filter)}</button>
                  ))}
                  {currentUser?.role === 'admin' && (
                     <button onClick={() => setIsFilterModalOpen(true)} className="ml-auto text-xs font-bold text-neutral-500 hover:text-neutral-900 bg-white/60 px-3 py-1.5 rounded-full border border-white/80 shadow-sm shrink-0">
                       ⚙️ จัดการ Filter
                     </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 md:p-8 ${glassCard}`}>
              <div className="mb-6 flex justify-between items-center">
                <div className="text-sm font-semibold text-neutral-500">พบผลงานทั้งหมด {filteredPortfolio.length} โครงการ</div>
              </div>
              
              {filteredPortfolio.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPortfolio.map((item) => (
                    <div key={item.id} onClick={() => openProjectModal(item)} className={`cursor-pointer group relative overflow-hidden rounded-[24px] border border-white/40 bg-white/60 text-left transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col ${item.isHidden ? 'opacity-50 grayscale hover:grayscale-0' : 'hover:bg-white'}`}>
                      <div className={`${item.cardAspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} w-full shrink-0 relative overflow-hidden bg-neutral-100`}>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                           <div 
                             className={`w-full h-full ${item.presetClass || ''}`} 
                             style={innerBgStyle(item.images?.[0] || 'https://via.placeholder.com/400?text=No+Image', item.imgPos)}
                           />
                        </div>
                        
                        {currentUser?.role === 'admin' && (
                          <div className="absolute top-3 right-3 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); toggleVisibility("portfolio", item, item.isHidden); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title={item.isHidden ? 'แสดง' : 'ซ่อน'}>
                               {item.isHidden ? '👁️‍🗨️' : '👁️'}
                             </button>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal("portfolioCards", item.id, item); }} className="bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 shadow-sm" title="ปรับการซูม / เลือกสัดส่วน">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </div>
                        )}
                        {item.images?.length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1 z-10 pointer-events-none">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {item.images.length}
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white/80 z-10 border-t border-neutral-100">
                        <div>
                          <div className="font-bold text-base sm:text-lg text-neutral-900 line-clamp-1 flex items-center gap-2">
                             {renderString(item.title, 'ไม่มีชื่อ')} {item.isHidden && <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-500">ซ่อน</span>}
                          </div>
                          <div className="mt-1 text-xs text-neutral-500 line-clamp-1">{renderString(item.subtitle, 'ไม่มีคำบรรยาย')}</div>
                        </div>
                        <div className="mt-4 flex flex-col gap-1.5">
                          <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">ทึบ: {renderString(item.fabricType, '-')}</span>
                            <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">รุ่น: {renderString(item.model, '-')}</span>
                            <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">สี: {renderString(item.color, '-')}</span>
                          </div>
                          {item.sheerFabric && (
                            <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                              <span className="shrink-0 px-2 py-0.5 rounded border border-emerald-200/50 bg-emerald-50/50 text-[10px] text-emerald-700 truncate max-w-[140px]">โปร่ง: {renderString(item.sheerFabric, '-')}</span>
                              <span className="shrink-0 px-2 py-0.5 rounded border border-emerald-200/50 bg-emerald-50/50 text-[10px] text-emerald-700 truncate max-w-[140px]">รุ่น: {renderString(item.sheerModel, '-')}</span>
                              <span className="shrink-0 px-2 py-0.5 rounded border border-emerald-200/50 bg-emerald-50/50 text-[10px] text-emerald-700 truncate max-w-[140px]">สี: {renderString(item.sheerColor, '-')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-neutral-400">ไม่พบผลงานที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหาดูนะคะ</div>
              )}
            </div>

            {/* ================= SMART MEDIA UPLOAD (ADMIN ONLY) ================= */}
            {currentUser?.role === 'admin' && (
              <div className={`p-6 md:p-8 ${glassCard} bg-gradient-to-br from-white/60 to-white/30`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/2">
                    <div className="inline-flex rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">Admin Only</div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4">Smart Media Upload</h3>
                    <p className="text-sm sm:text-base leading-relaxed text-neutral-600 mb-6">
                      ระบบอัปโหลดผลงานแบบกลุ่ม พร้อม 11 Presets ให้คุณแต่งสีรูปภาพสไตล์ต่างๆ ได้ในคลิกเดียว
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { step: 1, text: "อัปโหลดภาพ (ทีละหลายรูป หรือ ทั้งโฟลเดอร์)" },
                        { step: 2, text: "เลือก Preset แต่งสีภาพ (หรือใช้รูปต้นฉบับ)" },
                        { step: 3, text: "รีวิวข้อมูลและการจัดกลุ่ม" },
                      ].map((item) => (
                        <div key={item.step} className={`flex items-center gap-4 p-3 rounded-[16px] transition-all ${uploadStep === item.step ? 'bg-white shadow-md border border-white/60' : 'opacity-60'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep >= item.step ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                            {item.step}
                          </div>
                          <span className="text-sm font-semibold">{renderString(item.text)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 bg-white/50 rounded-[28px] p-4 sm:p-6 border border-white/60 shadow-inner min-h-[350px]">
                    {/* STEP 1: Upload Method */}
                    {uploadStep === 1 && (
                      <div className="flex flex-col gap-4 h-full min-h-[250px] justify-center">
                        <button onClick={() => smartMediaInputRef.current?.click()} className="border-2 border-dashed border-neutral-300 rounded-[20px] p-6 flex flex-col items-center justify-center bg-white/40 hover:bg-white/70 transition cursor-pointer">
                          <span className="text-3xl mb-2">📸</span>
                          <span className="font-semibold text-neutral-700">อัปโหลดรูปภาพ (หลายรูป)</span>
                          <input type="file" multiple accept="image/*, .heic, .heif" className="hidden" ref={smartMediaInputRef} onChange={handleSmartMediaUpload} />
                        </button>
                        <div className="text-center text-xs text-neutral-400 font-bold">- หรือ -</div>
                        <button onClick={() => smartMediaFolderRef.current?.click()} className="border-2 border-dashed border-emerald-300 rounded-[20px] p-6 flex flex-col items-center justify-center bg-emerald-50/40 hover:bg-emerald-50/80 transition cursor-pointer">
                          <span className="text-3xl mb-2">📁</span>
                          <span className="font-semibold text-emerald-700">อัปโหลดทั้งโฟลเดอร์</span>
                          <span className="text-[10px] text-emerald-600/70 mt-1 max-w-[200px] text-center">ระบบจะนำชื่อโฟลเดอร์มาเป็นรุ่นผ้า และชื่อไฟล์เป็นสีผ้าให้อัตโนมัติ</span>
                          <input type="file" webkitdirectory="true" multiple className="hidden" ref={smartMediaFolderRef} onChange={handleSmartMediaUpload} />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: Presets */}
                    {uploadStep === 2 && uploadQueue.length > 0 && (
                      <div className="space-y-4 animate-in zoom-in-95 duration-500 flex flex-col h-full">
                        <div>
                          <h4 className="text-lg font-bold mb-1">พบ {uploadQueue.length} โครงการที่อัปโหลด</h4>
                          <p className="text-xs text-neutral-500">เลือก Preset สีเพื่อใช้กับภาพชุดนี้ (ตัวอย่างด้านล่าง)</p>
                        </div>
                        
                        {/* Preset Selector */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1 pb-2">
                           {IMAGE_PRESETS.map((preset, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => {
                                  setUploadQueue(prev => prev.map(i => ({...i, presetClass: preset.class})));
                                  setUploadStep(3);
                                }}
                                className="relative rounded-xl overflow-hidden aspect-[4/3] group border-2 border-transparent hover:border-emerald-400 focus:border-emerald-500 shadow-sm"
                              >
                                <img src={uploadQueue[0].images[0]} className={`w-full h-full object-cover transition-all duration-300 ${preset.class}`} />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-8 pb-2 px-2 text-center text-white text-[10px] font-bold">
                                  {renderString(preset.name)}
                                </div>
                              </button>
                           ))}
                        </div>

                        <button onClick={() => setUploadStep(3)} className="w-full py-3 bg-white border border-neutral-300 text-neutral-600 rounded-xl font-bold transition-colors hover:bg-neutral-50 text-sm mt-auto">
                          ข้ามไปหน้ารีวิวเลย (ใช้ต้นฉบับ)
                        </button>
                      </div>
                    )}

                    {/* STEP 3: Review & Edit Metadata */}
                    {uploadStep === 3 && (
                      <div className="flex flex-col h-full animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">ตรวจสอบข้อมูลก่อนบันทึก</h4>
                          <span className="text-xs bg-neutral-100 px-2 py-1 rounded-md font-bold text-neutral-600">{uploadQueue.length} รายการ</span>
                        </div>
                        
                        <div className="flex-1 max-h-[40vh] overflow-y-auto space-y-4 pr-2 mb-4" style={{scrollbarWidth: 'thin'}}>
                          {uploadQueue.map((item, index) => (
                            <div key={item.id} className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm flex gap-3 sm:gap-4 items-start">
                               <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden relative bg-neutral-100">
                                 <img src={item.images[0]} className={`w-full h-full object-cover ${item.presetClass || ''}`} />
                                 {item.images.length > 1 && (
                                   <div className="absolute top-1 left-1 bg-black/60 px-1.5 rounded text-[10px] font-bold text-white shadow-sm pointer-events-none">
                                     +{item.images.length - 1} รูป
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                 <div className="col-span-1">
                                    <input value={item.title} onChange={e => updateQueueItem(index, 'title', e.target.value)} className="w-full border-b border-neutral-200 px-1 py-1 outline-none font-bold text-neutral-800 placeholder:text-neutral-300 focus:border-neutral-500 transition-colors" placeholder="ชื่อผลงาน (เช่น โครงการคอนโด...)" />
                                 </div>
                                 <div className="col-span-1">
                                    <input value={item.type || ""} onChange={e => updateQueueItem(index, 'type', e.target.value)} className="w-full border-b border-neutral-200 px-1 py-1 outline-none font-bold text-emerald-700 placeholder:text-neutral-300 focus:border-neutral-500 transition-colors" placeholder="สถานที่ (บ้าน/คอนโด)" />
                                 </div>
                                 <div className="col-span-2 border-t border-neutral-100 pt-2 mt-1">
                                    <span className="text-[10px] font-bold text-neutral-400">ม่านทึบ (Main Curtain)</span>
                                 </div>
                                 <div>
                                    <select value={item.fabricType || ''} onChange={e => updateQueueItem(index, 'fabricType', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none bg-white">
                                      {Array.from(new Set([item.fabricType, ...fabricTypes.map(f=>f.title), "มู่ลี่", "Wall Fabric"])).filter(Boolean).filter(v => v !== 'undefined').map(val => (
                                        <option key={val} value={val}>{renderString(val)}</option>
                                      ))}
                                    </select>
                                 </div>
                                 <div>
                                    <select value={item.curtainStyle || ''} onChange={e => updateQueueItem(index, 'curtainStyle', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none bg-white">
                                      {Array.from(new Set([item.curtainStyle, ...curtainStyles.map(s=>s.title), "มู่ลี่ไม้", "บุผนัง"])).filter(Boolean).filter(v => v !== 'undefined').map(val => (
                                        <option key={val} value={val}>{renderString(val)}</option>
                                      ))}
                                    </select>
                                 </div>
                                 <div>
                                   <input value={item.model} onChange={e => updateQueueItem(index, 'model', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none focus:border-neutral-500" placeholder="รุ่น..." />
                                 </div>
                                 <div>
                                   <input value={item.color} onChange={e => updateQueueItem(index, 'color', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none focus:border-neutral-500" placeholder="สี..." />
                                 </div>

                                 <div className="col-span-2 border-t border-neutral-100 pt-2 mt-1 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-emerald-500">ม่านโปร่ง (Sheer Curtain) - ไม่ต้องใส่ถ้าไม่มี</span>
                                 </div>
                                 <div>
                                    <select value={item.sheerFabric || ''} onChange={e => updateQueueItem(index, 'sheerFabric', e.target.value)} className="w-full border border-emerald-200 rounded-md px-2 py-1.5 outline-none bg-emerald-50 text-emerald-800">
                                      <option value="">-- ไม่มีผ้าโปร่ง --</option>
                                      {Array.from(new Set([item.sheerFabric, ...fabricTypes.map(f=>f.title)])).filter(Boolean).filter(v => v !== 'undefined').map(val => (
                                        <option key={val} value={val}>{renderString(val)}</option>
                                      ))}
                                    </select>
                                 </div>
                                 {item.sheerFabric && (
                                   <>
                                     <div>
                                        <select value={item.sheerStyle || ''} onChange={e => updateQueueItem(index, 'sheerStyle', e.target.value)} className="w-full border border-emerald-200 rounded-md px-2 py-1.5 outline-none bg-emerald-50 text-emerald-800">
                                          {Array.from(new Set([item.sheerStyle, ...curtainStyles.map(s=>s.title)])).filter(Boolean).filter(v => v !== 'undefined').map(val => (
                                            <option key={val} value={val}>{renderString(val)}</option>
                                          ))}
                                        </select>
                                     </div>
                                     <div>
                                       <input value={item.sheerModel || ''} onChange={e => updateQueueItem(index, 'sheerModel', e.target.value)} className="w-full border border-emerald-200 rounded-md px-2 py-1.5 outline-none bg-emerald-50 text-emerald-800 placeholder:text-emerald-300/70" placeholder="รุ่นผ้าโปร่ง..." />
                                     </div>
                                     <div>
                                       <input value={item.sheerColor || ''} onChange={e => updateQueueItem(index, 'sheerColor', e.target.value)} className="w-full border border-emerald-200 rounded-md px-2 py-1.5 outline-none bg-emerald-50 text-emerald-800 placeholder:text-emerald-300/70" placeholder="สีผ้าโปร่ง..." />
                                     </div>
                                   </>
                                 )}
                               </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-200">
                           <button onClick={() => {setUploadStep(1); setUploadQueue([]);}} className="w-1/3 py-3 border border-neutral-300 text-neutral-600 font-bold rounded-xl transition-colors hover:bg-neutral-100">ยกเลิก</button>
                           <button onClick={saveBulkPortfolio} className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors">บันทึกทั้งหมดเข้า Portfolio</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Success */}
                    {uploadStep === 4 && (
                      <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">✓</div>
                        <h4 className="font-bold text-lg">บันทึกผลงานเรียบร้อย!</h4>
                        <p className="text-sm text-neutral-500 mt-2 mb-6">ภาพถูกอัปโหลดและบันทึกลงระบบแล้ว</p>
                        <button onClick={() => {setUploadStep(1); setUploadQueue([]);}} className={softButton}>อัปโหลดเพิ่ม</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= ABOUT / TIMELINE ================= */}
        {activePage === "About" && (
          <section className="py-20 md:py-32 bg-white rounded-[36px] shadow-sm animate-in fade-in border border-neutral-100 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 lg:px-12">
              
              <div className="text-center mb-24 md:mb-40">
                <div className="inline-block border border-neutral-300 px-5 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-500 mb-8">
                  Our Heritage
                </div>
                <h2 className="text-5xl md:text-7xl font-serif text-neutral-900 tracking-wide mb-6">
                  PASAYA HISTORY
                </h2>
                <div className="w-16 h-[1px] bg-neutral-800 mx-auto"></div>
              </div>

              <div className="space-y-32 md:space-y-48">
                {timelineItems.filter(i => currentUser?.role === 'admin' || !i.isHidden).map((item, index) => (
                  <div key={item.id} className={`relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                    <div className="absolute -top-12 md:-top-24 left-0 md:left-4 text-[100px] md:text-[180px] font-serif font-bold text-neutral-50/80 z-0 select-none pointer-events-none transition-colors group-hover:text-neutral-100">
                      {renderString(item.year)}
                    </div>
                    
                    {currentUser?.role === 'admin' && (
                      <div className={`absolute -top-4 right-0 z-30 flex gap-2 transition-opacity bg-white/90 p-2 rounded-full shadow-md border opacity-0 group-hover:opacity-100 border-neutral-200`}>
                         {confirmDeleteTimelineId === item.id ? (
                           <div className="flex items-center gap-2 px-1 animate-in zoom-in-95">
                             <span className="text-xs text-red-600 font-bold">ยืนยันลบถาวร?</span>
                             <button onClick={() => handleDeleteTimeline(item.id)} className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700">ลบเลย</button>
                             <button onClick={() => setConfirmDeleteTimelineId(null)} className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-xs font-bold hover:bg-neutral-300">ยกเลิก</button>
                           </div>
                         ) : (
                           <>
                             <button onClick={(e) => { e.stopPropagation(); handleMoveItem("timeline", timelineItems, index, -1, setTimelineItems); }} className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors" title="เลื่อนขึ้น">⬆️</button>
                             <button onClick={(e) => { e.stopPropagation(); handleMoveItem("timeline", timelineItems, index, 1, setTimelineItems); }} className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors" title="เลื่อนลง">⬇️</button>
                             <button onClick={(e) => { e.stopPropagation(); toggleVisibility("timeline", item, item.isHidden); }} className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors" title={item.isHidden ? 'แสดง' : 'ซ่อน'}>
                               {item.isHidden ? '👁️‍🗨️' : '👁️'}
                             </button>
                             <button onClick={() => setTimelineModal({ isOpen: true, mode: 'edit', form: { ...item, images: item.images || [] }, rawFiles: [], newUrlInput: '' })} className="p-2 text-neutral-600 hover:text-emerald-600 bg-neutral-100 hover:bg-emerald-50 rounded-full transition-colors" title="แก้ไข">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </button>
                             <button onClick={() => setConfirmDeleteTimelineId(item.id)} className="p-2 text-neutral-600 hover:text-red-600 bg-neutral-100 hover:bg-red-50 rounded-full transition-colors" title="ลบ">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           </>
                         )}
                      </div>
                    )}

                    <div className="relative z-10 grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                      <div className={`md:col-span-7 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                        {/* Dynamic Image Grid */}
                        <div className={`grid gap-3 ${item.images?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {item.images?.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className={`overflow-hidden bg-neutral-100 rounded-2xl md:rounded-[40px] shadow-lg ${item.images.length === 3 && imgIdx === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-[4/3] md:aspect-[3/2]'}`}>
                              <img src={imgUrl} className={`w-full h-full object-cover filter saturate-[0.9] hover:saturate-100 transition-all duration-700 hover:scale-105 ${item.isHidden ? 'grayscale' : ''}`} alt={`${item.title} - ${imgIdx+1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className={`md:col-span-5 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'} ${item.textAlign === 'center' ? 'items-center text-center' : item.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                        <div className="inline-block text-emerald-700 font-serif text-xl md:text-2xl italic mb-3">
                          {renderString(item.year)}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 font-serif flex items-center gap-2">
                          {renderString(item.title)} {item.isHidden && <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-500 font-sans">ซ่อน</span>}
                        </h3>
                        <div className="text-neutral-600 leading-relaxed text-sm md:text-base whitespace-pre-line break-words max-w-full" style={{ wordBreak: 'break-word' }}>
                          {renderString(item.text)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentUser?.role === 'admin' && (
                <div className="mt-24 flex justify-center">
                  <button 
                    onClick={() => setTimelineModal({ isOpen: true, mode: 'add', form: { id: '', year: '', title: '', text: '', images: [], textAlign: 'left' }, rawFiles: [], newUrlInput: '' })}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    เพิ่มข้อมูลไทม์ไลน์ใหม่
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= AI ASSISTANT ================= */}
        {activePage === "AI Assistant" && (
          <section className="h-[calc(100vh-140px)] md:h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4">
             <div className={`flex-1 flex flex-col overflow-hidden ${glassCard}`}>
              <div className="bg-white/60 backdrop-blur-md border-b border-white/40 p-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">AI</div>
                  <div>
                    <h3 className="font-bold text-neutral-800 leading-tight">Sales Copilot</h3>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Online
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-[20px] px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-sm ${msg.role === "user" ? "bg-neutral-900 text-white rounded-tr-sm" : "bg-white text-neutral-800 border border-white/60 rounded-tl-sm"}`}>
                      {msg.role === "assistant" ? <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} /> : msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-white/60 px-5 py-3.5 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0 hide-scrollbar">
                {["ลูกค้าอยากได้ห้องสไตล์มินิมอล แนะนำผ้าแบบไหน?", "ช่วยคิดคำพูดปิดการขายกรณีลูกค้าบอกแพงหน่อย", "ผ้า Dim out กับ Black out ต่างกันยังไง?", "ห้องทิศตะวันตก แดดร้อนจัด ใช้อะไรดี?"].map((suggestion, i) => (
                  <button key={i} onClick={() => { setAiInput(suggestion); }} className="shrink-0 px-3 py-1.5 bg-white/50 border border-white/80 rounded-full text-xs text-neutral-600 hover:bg-white transition-colors whitespace-nowrap">{suggestion}</button>
                ))}
              </div>

              <div className="p-4 bg-white/40 backdrop-blur-lg border-t border-white/40 shrink-0">
                <div className="relative flex items-center">
                  <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runAiDemo(); }} className="w-full bg-white border border-neutral-200 rounded-full pl-5 pr-12 py-3.5 text-sm outline-none focus:border-neutral-400 transition-colors shadow-sm" placeholder="พิมพ์คำถามหรือสถานการณ์ที่เจอ..." />
                  <button onClick={runAiDemo} disabled={!aiInput.trim() || isAiTyping} className="absolute right-1.5 w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white disabled:bg-neutral-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= MANAGE USERS ================= */}
        {activePage === "Manage Users" && currentUser?.role === 'admin' && (
          <section className="animate-in fade-in duration-500">
            <div className={`p-6 sm:p-10 ${glassCard}`}>
              <div className="mb-8 border-b border-neutral-200/50 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold">จัดการผู้ใช้งาน (User Management)</h2>
                <p className="mt-2 text-sm text-neutral-500">เพิ่ม ลบ และแก้ไขสิทธิ์/รหัสผ่านของพนักงาน</p>
              </div>

              <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-4">รายชื่อพนักงานทั้งหมด</h3>
                  <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                      <thead className="bg-neutral-50/50 border-b border-neutral-200 text-neutral-500">
                        <tr>
                          <th className="p-4 font-semibold w-1/5">รหัสพนักงาน</th>
                          <th className="p-4 font-semibold w-1/4">ชื่อ-นามสกุล</th>
                          <th className="p-4 font-semibold w-1/6">ระดับสิทธิ์</th>
                          <th className="p-4 font-semibold w-1/6">รหัสผ่าน</th>
                          <th className="p-4 font-semibold text-right w-1/5">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {usersList.map(user => {
                          const isEditing = editingUserId === user.id;
                          return (
                            <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-4 font-bold text-neutral-800">{String(user.id)}</td>
                              
                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="w-full border border-neutral-300 rounded px-2 py-1 text-sm outline-none focus:border-neutral-500" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} />
                                ) : (
                                  <span className="text-neutral-600">{String(user.name)}</span>
                                )}
                              </td>
                              
                              <td className="p-4">
                                {isEditing ? (
                                  <select className="w-full border border-neutral-300 rounded px-2 py-1 text-sm outline-none focus:border-neutral-500" value={editUserForm.role} onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}>
                                    <option value="employee">employee</option>
                                    <option value="admin">admin</option>
                                  </select>
                                ) : (
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {String(user.role)}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="w-full border border-neutral-300 rounded px-2 py-1 text-sm outline-none focus:border-neutral-500" value={editUserForm.password} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} />
                                ) : (
                                  <span className="text-neutral-500 font-mono tracking-wider bg-neutral-100 px-2 py-1 rounded text-xs">{String(user.password)}</span>
                                )}
                              </td>

                              <td className="p-4 text-right whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex justify-end gap-2">
                                    <button onClick={saveUserEdit} className="text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded transition-colors">บันทึก</button>
                                    <button onClick={() => setEditingUserId(null)} className="text-neutral-600 font-bold text-xs bg-neutral-200 hover:bg-neutral-300 px-3 py-1.5 rounded transition-colors">ยกเลิก</button>
                                  </div>
                                ) : confirmDeleteUserId === user.id ? (
                                  <div className="flex justify-end gap-2 items-center animate-in fade-in">
                                     <span className="text-xs text-red-500 font-bold">ยืนยันลบ?</span>
                                     <button onClick={() => deleteUser(user.id)} className="text-white font-bold text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors">ลบ</button>
                                     <button onClick={() => setConfirmDeleteUserId(null)} className="text-neutral-600 font-bold text-xs bg-neutral-200 hover:bg-neutral-300 px-3 py-1.5 rounded transition-colors">ยกเลิก</button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEditUserClick(user)} className="text-neutral-700 hover:text-neutral-900 font-bold text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors">แก้ไข</button>
                                    {user.id !== currentUser.id && (
                                      <button onClick={() => setConfirmDeleteUserId(user.id)} className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors">ลบ</button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white/50 p-6 rounded-[24px] border border-white shadow-inner h-fit">
                  <h3 className="font-bold text-lg mb-4">เพิ่มพนักงานใหม่</h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">รหัสพนักงาน (Username)</label>
                      <input 
                        type="text" required value={newUserForm.id} onChange={e => setNewUserForm({...newUserForm, id: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">ชื่อ-นามสกุล</label>
                      <input 
                        type="text" required value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-400" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">ระดับสิทธิ์ (Role)</label>
                      <select 
                        value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
                      >
                        <option value="employee">Employee (พนักงานทั่วไป)</option>
                        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">รหัสผ่าน (Password)</label>
                      <input 
                        type="text" required value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-400" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-3 text-sm font-bold shadow-md transition-colors mt-2">
                      เพิ่มเข้าสู่ระบบ
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ================= PORTFOLIO PROJECT MODAL ================= */}
      {selectedProject && !isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative flex flex-col">
            
            <div className="sticky top-0 z-20 flex flex-wrap justify-between items-center gap-2 p-4 bg-white/90 backdrop-blur-lg border-b border-neutral-100 shadow-sm">
              <button onClick={goBack} className="flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                กลับไปหน้าผลงาน
              </button>
              
              {currentUser?.role === 'admin' && (
                <div className="flex gap-2 items-center">
                  {isConfirmingDelete ? (
                    <div className="flex gap-2 items-center bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-in fade-in zoom-in-95">
                      <span className="text-xs text-red-600 font-bold px-1">ยืนยันการลบถาวร?</span>
                      <button onClick={confirmDeleteProject} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm">ใช่, ลบเลย</button>
                      <button onClick={() => setIsConfirmingDelete(false)} className="bg-white hover:bg-neutral-100 text-neutral-600 px-4 py-1.5 rounded-full text-xs font-bold transition-colors border border-neutral-200">ยกเลิก</button>
                    </div>
                  ) : isEditingProject ? (
                    <button onClick={saveProjectEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm">บันทึกข้อมูล</button>
                  ) : (
                    <>
                      <button onClick={() => {setIsEditingProject(true); setEditProjectForm(selectedProject);}} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-full text-xs font-bold transition-colors">✏️ แก้ไขข้อมูล</button>
                      <button onClick={() => setIsConfirmingDelete(true)} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-bold transition-colors">🗑 ลบผลงานนี้</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-[1.3fr_0.7fr]">
              <div className="relative h-[50vh] sm:h-[65vh] bg-neutral-100/50 flex items-center justify-center group overflow-hidden border-r border-neutral-100">
                <div 
                  className={`absolute inset-4 cursor-zoom-in transition-transform duration-300 ${selectedProject.presetClass || ''}`}
                  style={bgStyleObj(selectedProject.images[currentImageIndex], selectedProject.imgPos)}
                  onClick={toggleFullscreen}
                />
                
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal('portfolioCards', selectedProject.id, selectedProject);
                    }}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors opacity-0 group-hover:opacity-100"
                    title="เปลี่ยนรูป/ปรับการซูม"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}

                {selectedProject.images?.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white text-neutral-800 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNextImage} className="absolute right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white text-neutral-800 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {selectedProject.images.map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> คลิกเพื่อขยาย
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between bg-white">
                {isEditingProject ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">ชื่อโครงการ</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.title || ''} onChange={e => setEditProjectForm({...editProjectForm, title: e.target.value})} />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">ประเภทสถานที่ (Filter)</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.type || ''} onChange={e => setEditProjectForm({...editProjectForm, type: e.target.value})} placeholder="เช่น บ้านพักอาศัย, คอนโด" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 text-xs font-bold text-neutral-400 mt-2 border-b pb-1">ม่านทึบ (Main Curtain)</div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 mb-1 block">ชนิดผ้าทึบ</label>
                        <select value={editProjectForm.fabricType || ''} onChange={e => setEditProjectForm({...editProjectForm, fabricType: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-white">
                          {Array.from(new Set([editProjectForm.fabricType, ...fabricTypes.map(f=>f.title), "มู่ลี่", "Wall Fabric"])).filter(Boolean).map(val => (
                            <option key={val} value={val}>{String(val)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 mb-1 block">รูปแบบการตัดเย็บ</label>
                        <select value={editProjectForm.curtainStyle || ''} onChange={e => setEditProjectForm({...editProjectForm, curtainStyle: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-white">
                          {Array.from(new Set([editProjectForm.curtainStyle, ...curtainStyles.map(s=>s.title), "มู่ลี่ไม้", "บุผนัง"])).filter(Boolean).map(val => (
                            <option key={val} value={val}>{String(val)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 mb-1 block">รหัส/รุ่น</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.model || ''} onChange={e => setEditProjectForm({...editProjectForm, model: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 mb-1 block">สี</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.color || ''} onChange={e => setEditProjectForm({...editProjectForm, color: e.target.value})} />
                      </div>

                      <div className="col-span-2 text-xs font-bold text-emerald-500 mt-2 border-b pb-1 border-emerald-100">ม่านโปร่ง (Sheer Curtain)</div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-600 mb-1 block">ผ้าโปร่ง (ถ้ามี)</label>
                        <select value={editProjectForm.sheerFabric || ''} onChange={e => setEditProjectForm({...editProjectForm, sheerFabric: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-emerald-50 text-emerald-800">
                          <option value="">-- ไม่มีผ้าโปร่ง --</option>
                          {Array.from(new Set([editProjectForm.sheerFabric, ...fabricTypes.map(f=>f.title)])).filter(Boolean).map(val => (
                            <option key={val} value={val}>{String(val)}</option>
                          ))}
                        </select>
                      </div>
                      {editProjectForm.sheerFabric && (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-emerald-600 mb-1 block">รูปแบบผ้าโปร่ง</label>
                            <select value={editProjectForm.sheerStyle || ''} onChange={e => setEditProjectForm({...editProjectForm, sheerStyle: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-emerald-50 text-emerald-800">
                              {Array.from(new Set([editProjectForm.sheerStyle, ...curtainStyles.map(s=>s.title)])).filter(Boolean).map(val => (
                                <option key={val} value={val}>{String(val)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-emerald-600 mb-1 block">รหัส/รุ่นผ้าโปร่ง</label>
                            <input type="text" className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-emerald-50 text-emerald-800 placeholder:text-emerald-300/70" value={editProjectForm.sheerModel || ''} onChange={e => setEditProjectForm({...editProjectForm, sheerModel: e.target.value})} placeholder="รุ่นผ้าโปร่ง..." />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-emerald-600 mb-1 block">สีผ้าโปร่ง</label>
                            <input type="text" className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-emerald-50 text-emerald-800 placeholder:text-emerald-300/70" value={editProjectForm.sheerColor || ''} onChange={e => setEditProjectForm({...editProjectForm, sheerColor: e.target.value})} placeholder="สีผ้าโปร่ง..." />
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500 mb-1 block mt-2">รายละเอียดเพิ่มเติม</label>
                      <textarea className="w-full p-2 border rounded-lg text-sm h-24 resize-none" value={editProjectForm.description || ''} onChange={e => setEditProjectForm({...editProjectForm, description: e.target.value})}></textarea>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-2xl font-bold text-neutral-900 mb-1">{String(selectedProject.title || '')}</h4>
                    <div className="text-sm font-medium text-neutral-500 mb-4">{String(selectedProject.subtitle || '')}</div>
                    <p className="text-sm leading-relaxed text-neutral-600 mb-6 pb-6 border-b border-neutral-100">
                      {String(selectedProject.description || '')}
                    </p>
                    
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 mb-4">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">ม่านทึบ (Main Curtain)</div>
                      <div className="text-sm font-bold text-neutral-800">{String(selectedProject.curtainStyle || '')} ({String(selectedProject.fabricType || '')})</div>
                      <div className="text-sm text-neutral-600 mt-1">รุ่น: {String(selectedProject.model || '-')} | สี: {String(selectedProject.color || '-')}</div>
                    </div>

                    {selectedProject.sheerFabric && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-6">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">ม่านโปร่ง (Sheer Curtain)</div>
                        <div className="text-sm font-bold text-emerald-800">{String(selectedProject.sheerStyle || 'ม่านจีบ')} ({String(selectedProject.sheerFabric || '')})</div>
                        <div className="text-sm text-emerald-700 mt-1">รุ่น: {String(selectedProject.sheerModel || '-')} | สี: {String(selectedProject.sheerColor || '-')}</div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-8">
                      {getSafeTags(selectedProject).map((tag) => (
                        <span key={tag} className="rounded-md bg-neutral-200/60 border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!isEditingProject && (
                  <div className="flex flex-col gap-2 mt-auto">
                    <button onClick={() => { 
                      setSelectedProject(null); 
                      navigateTo("Products");
                      setProductTab(String(selectedProject.model || '').includes("Wall Fabric") ? "wallFabric" : "fabricTypes");
                    }} className={`w-full py-3 ${activeButton} text-center`}>
                      ดูสเปกสินค้าที่ใช้ในงานนี้
                    </button>
                    <button onClick={() => { 
                      setSelectedProject(null); 
                      navigateTo("AI Assistant"); 
                      setAiInput(`ช่วยสรุปจุดขายและคิดคำพูดสำหรับนำเสนอลูกค้าที่สนใจงานสไตล์ ${String(selectedProject.title || '')} (ผ้า ${String(selectedProject.model || '')}) ให้หน่อยค่ะ`); 
                    }} className={`w-full py-3 ${softButton} text-center bg-white border-neutral-200`}>
                      ให้ AI ช่วยคิด Script พรีเซนต์งานนี้
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN ZOOM OVERLAY ================= */}
      {isFullscreen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden animate-in fade-in duration-200">
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-50">
            <div className="flex gap-2 bg-white/10 p-1.5 rounded-full backdrop-blur-md">
              <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(1, prev - 0.5)); }} className="w-10 h-10 rounded-full bg-transparent hover:bg-white/20 text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
              </button>
              <div className="w-16 flex items-center justify-center text-white text-xs font-bold font-mono">{Math.round(zoomLevel * 100)}%</div>
              <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(3, prev + 0.5)); }} className="w-10 h-10 rounded-full bg-transparent hover:bg-white/20 text-white flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              </button>
            </div>
            <button onClick={toggleFullscreen} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="w-full h-full overflow-auto flex items-center justify-center cursor-move p-4 sm:p-12" onClick={toggleFullscreen}>
            <img 
              src={selectedProject.images[currentImageIndex]} alt={selectedProject.title}
              className={`max-w-full max-h-full object-contain transition-transform duration-200 ease-out ${selectedProject.presetClass || ''}`}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {selectedProject.images.length > 1 && zoomLevel === 1 && (
            <>
              <button onClick={handlePrevImage} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNextImage} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= EDIT IMAGE / CROP MODAL (Global) ================= */}
      {editImageModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            
            {editImageModal.isSaving && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-3xl flex flex-col items-center justify-center">
                 <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
                 <span className="text-sm font-bold text-neutral-700">กำลังบันทึกข้อมูล...</span>
              </div>
            )}

            <h3 className="text-xl font-bold mb-2 text-neutral-800">ปรับแต่งรูปภาพและการแสดงผล</h3>
            <p className="text-sm text-neutral-500 mb-5">เปลี่ยนรูปภาพ จัดสัดส่วน เลื่อน และเลือกสีตัวหนังสือ</p>
            
            <div className="mb-6 space-y-5">
              
              {/* Card Aspect Toggle (เฉพาะหน้าพอร์ต) */}
              {editImageModal.type === 'portfolioCards' && (
                <div className="flex gap-2">
                  <button onClick={() => setEditImageModal(prev => ({...prev, cardAspect: 'landscape', previewAspect: '4:3'}))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${editImageModal.cardAspect === 'landscape' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>แนวนอน (4:3)</button>
                  <button onClick={() => setEditImageModal(prev => ({...prev, cardAspect: 'portrait', previewAspect: '3:4'}))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${editImageModal.cardAspect === 'portrait' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>แนวตั้ง (3:4)</button>
                </div>
              )}

              {/* Preview Toggle for Products (Small Card vs Big Panel) */}
              {['fabricTypes', 'curtainStyles', 'wallFabrics'].includes(editImageModal.type) && (
                <div className="flex gap-2">
                  <button onClick={() => setEditImageModal(prev => ({...prev, previewAspect: '4:3'}))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${editImageModal.previewAspect === '4:3' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>พรีวิวหน้าการ์ด (4:3)</button>
                  <button onClick={() => setEditImageModal(prev => ({...prev, previewAspect: '16:9'}))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${editImageModal.previewAspect === '16:9' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>พรีวิวแถบขวา (16:9)</button>
                </div>
              )}

              {/* Preview Box with Mouse Drag Editing (No Sliders) */}
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-emerald-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                <span>ลากเมาส์เพื่อเลื่อนภาพ | หมุน Scroll เมาส์เพื่อซูม</span>
              </div>

              <div 
                ref={previewRef}
                onMouseDown={handleEditMouseDown}
                onMouseMove={handleEditMouseMove}
                onMouseUp={handleEditMouseUp}
                onMouseLeave={handleEditMouseUp}
                onTouchStart={handleEditTouchStart}
                onTouchMove={handleEditTouchMove}
                onTouchEnd={handleEditMouseUp}
                className={`w-full rounded-2xl bg-neutral-200 border border-neutral-300 overflow-hidden relative shadow-inner mx-auto transition-all cursor-move select-none touch-none`}
                style={getPreviewStyle()}
              >
                 <div className="w-full h-full pointer-events-none" style={innerBgStyle(editImageModal.url, editImageModal.pos)} />
                 
                 {/* Live Text Color Preview for specific types */}
                 {['fabricTypes', 'curtainStyles', 'wallFabrics'].includes(editImageModal.type) && (
                   <>
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-bold text-lg drop-shadow-md" style={{ color: editImageModal.textColor }}>{editImageModal.textTitle || 'ข้อความตัวอย่าง'}</span>
                    </div>
                   </>
                 )}
              </div>

              {/* Settings and Category Editor */}
              {['settings_home', 'fabricTypes', 'curtainStyles', 'wallFabrics'].includes(editImageModal.type) && (
                <div className="space-y-3">
                  <div className="h-px bg-neutral-200 w-full my-4" />
                  
                  {editImageModal.type !== 'settings_home' && (
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-neutral-600">สีตัวหนังสือทับรูป:</label>
                      <div className="flex gap-2">
                        <button onClick={() => setEditImageModal(prev => ({...prev, textColor: '#FFFFFF'}))} className={`w-6 h-6 rounded-full border-2 bg-white ${editImageModal.textColor === '#FFFFFF' ? 'border-emerald-500' : 'border-neutral-200'}`}></button>
                        <button onClick={() => setEditImageModal(prev => ({...prev, textColor: '#000000'}))} className={`w-6 h-6 rounded-full border-2 bg-black ${editImageModal.textColor === '#000000' ? 'border-emerald-500' : 'border-neutral-200'}`}></button>
                        <input type="color" value={editImageModal.textColor} onChange={e => setEditImageModal(prev => ({...prev, textColor: e.target.value}))} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-neutral-600 mb-1 block">หัวข้อ (Title)</label>
                    <input type="text" value={editImageModal.textTitle} onChange={e => setEditImageModal(prev => ({...prev, textTitle: e.target.value}))} className={inputClass} />
                  </div>
                  
                  {editImageModal.type !== 'settings_home' || editImageModal.id === 'hero' ? (
                    <div>
                      <label className="text-xs font-bold text-neutral-600 mb-1 block">รายละเอียด (Subtitle/Description)</label>
                      <textarea value={editImageModal.textSubtitle} onChange={e => setEditImageModal(prev => ({...prev, textSubtitle: e.target.value}))} className={`${inputClass} h-20 resize-none`} />
                    </div>
                  ) : null}
                </div>
              )}

              <div className="h-px bg-neutral-200 w-full" />

              <div>
                <label className="text-xs font-bold text-neutral-600 mb-1 block">เปลี่ยนรูป (ไฟล์จากเครื่อง)</label>
                <input type="file" accept="image/*, .heic, .heif" ref={fileInputRef} onChange={handleEditModalFileUpload} className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="relative flex items-center py-1">
                 <div className="flex-grow border-t border-neutral-200"></div><span className="flex-shrink-0 mx-4 text-neutral-400 text-[10px]">หรือลิงก์ URL</span><div className="flex-grow border-t border-neutral-200"></div>
              </div>
              <div>
                <input type="text" value={editImageModal.url} onChange={(e) => setEditImageModal(prev => ({...prev, url: e.target.value, fileObj: null}))} className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neutral-500" placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={handleResetToDefault} className="px-4 py-2.5 rounded-full text-neutral-500 text-xs font-bold hover:bg-neutral-100 transition-colors mr-auto">↺ คืนค่าเริ่มต้น</button>
              <button onClick={() => {setEditImageModal({ isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false, pos:{x:50,y:50,zoom:1}, textColor:'#FFF', cardAspect:'landscape', previewAspect: '4:3', targetItem: null, textTitle: '', textSubtitle: '' }); if(fileInputRef.current) fileInputRef.current.value = "";}} className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSaveImage} className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow-md">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FILTER MANAGEMENT MODAL (Admin Only) ================= */}
      {isFilterModalOpen && currentUser?.role === 'admin' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <h3 className="text-xl font-bold mb-2 text-neutral-800">จัดการ Filter ผลงาน</h3>
            <p className="text-sm text-neutral-500 mb-5">เพิ่ม ลบ หรือแก้ไขตัวกรองในหน้าพอร์ตฟอลิโอ</p>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" value={newFilterKeyword} onChange={e => setNewFilterKeyword(e.target.value)} 
                className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" 
                placeholder="พิมพ์ชื่อ Filter ใหม่..." 
              />
              <button 
                onClick={() => {
                  if (newFilterKeyword.trim() && !portfolioFilters.includes(newFilterKeyword.trim())) {
                    const newList = [...portfolioFilters, newFilterKeyword.trim()];
                    if (db) setDoc(doc(db, "settings", "portfolioFilters"), { list: newList });
                    setNewFilterKeyword("");
                  }
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold"
              >
                เพิ่ม
              </button>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto mb-6 pr-2">
              {portfolioFilters.map(f => (
                <div key={f} className="flex justify-between items-center bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                  <span className="text-sm font-semibold text-neutral-700">{String(f)}</span>
                  {f !== 'ทั้งหมด' && (
                    <button 
                      onClick={() => {
                        const newList = portfolioFilters.filter(x => x !== f);
                        if (db) setDoc(doc(db, "settings", "portfolioFilters"), { list: newList });
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ลบทิ้ง
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button onClick={() => setIsFilterModalOpen(false)} className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow-md">เสร็จสิ้น</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TIMELINE EDIT MODAL (Admin Only) ================= */}
      {timelineModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-xl font-bold mb-2 text-neutral-800">
              {timelineModal.mode === 'add' ? 'เพิ่มไทม์ไลน์ใหม่' : 'แก้ไขข้อมูลไทม์ไลน์'}
            </h3>
            <p className="text-sm text-neutral-500 mb-5">จัดการข้อมูลประวัติแบรนด์และอัปโหลดรูปภาพได้หลายรูป</p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-600 mb-1 block">ปี (Year)</label>
                  <input 
                    type="text" value={timelineModal.form.year} 
                    onChange={e => setTimelineModal(prev => ({...prev, form: {...prev.form, year: e.target.value}}))}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-neutral-500" placeholder="เช่น 2024 หรือ Today"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-600 mb-1 block">หัวข้อ (Title)</label>
                  <input 
                    type="text" value={timelineModal.form.title} 
                    onChange={e => setTimelineModal(prev => ({...prev, form: {...prev.form, title: e.target.value}}))}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-neutral-500" placeholder="เช่น Smart Living"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold text-neutral-600 block">รายละเอียด (Description)</label>
                  <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                    {['left', 'center', 'right'].map(align => (
                       <button 
                         key={align} type="button"
                         onClick={() => setTimelineModal(prev => ({...prev, form: {...prev.form, textAlign: align}}))}
                         className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${timelineModal.form.textAlign === align ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-400 hover:text-neutral-600'}`}
                       >
                         {align === 'left' ? 'ชิดซ้าย' : align === 'center' ? 'กึ่งกลาง' : 'ชิดขวา'}
                       </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  value={timelineModal.form.text} 
                  onChange={e => setTimelineModal(prev => ({...prev, form: {...prev.form, text: e.target.value}}))}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm h-24 resize-none outline-none focus:border-neutral-500"
                  placeholder="เขียนรายละเอียดเรื่องราว..."
                  style={{ textAlign: timelineModal.form.textAlign || 'left' }}
                />
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <label className="text-xs font-bold text-neutral-600 mb-3 block">จัดการรูปภาพ (เพิ่มได้หลายรูป)</label>
                
                {/* Image Previews */}
                {timelineModal.form.images && timelineModal.form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                    {timelineModal.form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl bg-white border border-neutral-200 overflow-hidden group shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => removeTimelineImage(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full py-4 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-5 h-5 mb-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-[11px] text-neutral-500"><span className="font-bold text-emerald-600">อัปโหลดรูปจากเครื่อง</span> (เลือกได้หลายรูป)</p>
                      </div>
                      <input ref={timelineFileRef} type="file" className="hidden" multiple accept="image/*" onChange={handleTimelineFileUpload} />
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" value={timelineModal.newUrlInput} onChange={e => setTimelineModal(prev => ({...prev, newUrlInput: e.target.value}))}
                      className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-emerald-500" placeholder="หรือวางลิงก์รูปภาพ (URL) ที่นี่..."
                    />
                    <button type="button" onClick={handleTimelineAddUrl} disabled={!timelineModal.newUrlInput.trim()} className="px-3 py-2 bg-neutral-800 text-white rounded-xl text-[11px] font-bold disabled:bg-neutral-300 whitespace-nowrap">เพิ่มลิงก์</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
              <button onClick={() => {setTimelineModal({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', images: [], textAlign: 'left' }, rawFiles: [], newUrlInput: '' }); if(timelineFileRef.current) timelineFileRef.current.value = "";}} className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">ยกเลิก</button>
              <button 
                onClick={handleSaveTimeline} 
                disabled={!timelineModal.form.year || !timelineModal.form.title}
                className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow-md disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}