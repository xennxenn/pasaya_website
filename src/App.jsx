import React, { useMemo, useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// ============================================================================
// [PRODUCTION CONFIG] FIREBASE SETUP (ฐานข้อมูลของคุณ)
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
// [PRODUCTION CONFIG] CLOUDINARY SETUP (เก็บรูปภาพ)
// ============================================================================
const CLOUDINARY_CLOUD_NAME = "dsxpwfujb"; 
const CLOUDINARY_UPLOAD_PRESET = "pasaya_website"; 

// ... MOCK DATA (ใช้เป็นข้อมูลตั้งต้นหาก Database ยังว่างอยู่) ...
const MOCK_USERS = [
  { id: "T58121", name: "Admin", role: "admin", password: "Admin" },
  { id: "EMP001", name: "พนักงานขาย 1", role: "employee", password: "1234" }
];
const MOCK_FABRIC_TYPES = [
  { id: "blackout", title: "Black out", desc: "กันแสง 100% ให้ความเป็นส่วนตัวสูงสุด และช่วยลดอุณหภูมิห้อง", fit: "ห้องนอน, ห้องดูหนัง, โรงแรม", image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80" },
  { id: "dimout", title: "Dim out", desc: "กันแสง 80-95% ผ้าพริ้วไหวสวยงาม สีสันหลากหลาย", fit: "ห้องนั่งเล่น, ห้องนอนทั่วไป, คอนโด", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80" },
  { id: "energy", title: "Energy Saving", desc: "เนื้อผ้าทอพิเศษ ช่วยสะท้อนความร้อน ประหยัดพลังงานแอร์", fit: "ห้องที่รับแดดบ่าย, บ้านทิศตะวันตก, ออฟฟิศ", image: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80" },
  { id: "drapery", title: "Drapery", desc: "ผ้าม่านทึบแสงตกแต่งทั่วไป เน้นลวดลายและ Texture ที่หรูหรา", fit: "โถงรับแขก, ห้องนั่งเล่นหลัก", image: "https://images.unsplash.com/photo-1522771731478-44fb509f61b0?auto=format&fit=crop&w=800&q=80" },
  { id: "flame", title: "Flame Retardant", desc: "ผ้ากันลามไฟ ปลอดภัยสูงสุด ได้รับมาตรฐานสากล", fit: "โรงแรม, โรงพยาบาล, โครงการสาธารณะ", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
  { id: "multi", title: "Multipurpose", desc: "ผ้าอเนกประสงค์ ใช้งานได้หลากหลาย ทั้งม่านและบุเฟอร์นิเจอร์", fit: "พื้นที่ที่ต้องการความเข้าชุดกันของม่านและเฟอร์นิเจอร์", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
  { id: "upholstery", title: "Upholstery", desc: "ผ้าบุโซฟาและเฟอร์นิเจอร์ ทนทานต่อการเสียดสีสูง", fit: "งานสั่งทำเฟอร์นิเจอร์, ล็อบบี้", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80" },
  { id: "sheer", title: "Sheer", desc: "ผ้าโปร่ง กรองแสงให้นุ่มนวล เพิ่มความพริ้วไหวและหรูหรา", fit: "ซ้อนเป็นม่านชั้นใน, ห้องที่ต้องการแสงธรรมชาติ", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80" },
];
const MOCK_CURTAIN_STYLES = [
  { id: "pleat", title: "ม่านจีบ", desc: "คลาสสิก จับจีบ 3 จีบ สวยงามเป็นระเบียบ", tags: ["ม่านจีบ", "classic"], image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80" },
  { id: "wave", title: "ม่านลอน", desc: "ทันสมัย ลอนโค้งสม่ำเสมอ ทิ้งตัวสวย", tags: ["ม่านลอน", "modern"], image: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80" },
  { id: "roman", title: "ม่านพับ", desc: "ประหยัดพื้นที่ พับซ้อนกันขึ้นด้านบน", tags: ["ม่านพับ", "roman"], image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
  { id: "roller", title: "ม่านม้วน", desc: "มินิมอล ทำความสะอาดง่าย ม้วนเก็บเนี๊ยบ", tags: ["ม่านม้วน", "minimal"], image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80" },
  { id: "eyelet", title: "ม่านตาไก่", desc: "สอดห่วงโลหะเข้ากับราง ใช้งานง่าย ดูโปร่ง", tags: ["ตาไก่", "eyelet"], image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
  { id: "loop", title: "คอกระเช้า", desc: "ใช้หูผ้าคล้องกับราง สไตล์โฮมมี่/รีสอร์ท", tags: ["คอกระเช้า", "resort"], image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80" },
  { id: "louis", title: "ม่านหลุยส์", desc: "หรูหราอลังการ มีจับจีบตกแต่งระบาย", tags: ["ม่านหลุยส์", "luxury classic"], image: "https://images.unsplash.com/photo-1522771731478-44fb509f61b0?auto=format&fit=crop&w=800&q=80" },
  { id: "blinds", title: "มู่ลี่", desc: "ปรับทิศทางแสงได้ มีทั้งไม้และอลูมิเนียม", tags: ["มู่ลี่", "blinds"], image: "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&w=800&q=80" },
  { id: "hook", title: "ม่านเสียบตะขอ", desc: "รูปแบบมาตรฐานดั้งเดิม ใช้ตะขอเสียบ", tags: ["ตะขอ", "standard"], image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80" },
  { id: "hospital", title: "ม่านโรงพยาบาล", desc: "ตาข่ายระบายอากาศด้านบน รูดเปิดปิดง่าย", tags: ["โรงพยาบาล", "hospital"], image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" },
];
const MOCK_WALL_FABRICS = [
  { id: "wall1", title: "Wall Fabric Signature", style: "Texture premium", desc: "ใช้แทน Wallpaper ช่วยลดเสียงก้อง เพิ่มมิติและสัมผัสที่หรูหรา", image: "https://images.unsplash.com/photo-1598928506311-c95148c8ab1a?auto=format&fit=crop&w=800&q=80" },
  { id: "wall2", title: "Acoustic Wall Art", style: "Sound Absorbent", desc: "บุผนังซับเสียง เหมาะสำหรับห้องดูหนัง หรือห้องประชุม", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80" }
];

export default function PasayaCurtainCenterPreview() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [loginError, setLoginError] = useState("");
  
  // Data States
  const [usersList, setUsersList] = useState(MOCK_USERS);
  const [portfolioCards, setPortfolioCards] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [fabricTypes, setFabricTypes] = useState(MOCK_FABRIC_TYPES);
  const [curtainStyles, setCurtainStyles] = useState(MOCK_CURTAIN_STYLES);
  const [wallFabrics, setWallFabrics] = useState(MOCK_WALL_FABRICS);

  const [newUserForm, setNewUserForm] = useState({ id: "", name: "", role: "employee", password: "" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ id: "", name: "", role: "", password: "" });
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);

  const [activePage, setActivePage] = useState("Home");
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

  const [editImageModal, setEditImageModal] = useState({ isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false });
  const fileInputRef = useRef(null);
  const smartMediaInputRef = useRef(null);
  const smartMediaFolderRef = useRef(null);

  const [timelineModal, setTimelineModal] = useState({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', image: '' }, fileObj: null });
  const [confirmDeleteTimelineId, setConfirmDeleteTimelineId] = useState(null);
  const timelineFileRef = useRef(null);

  const getNavItems = () => {
    let items = ["Home", "Products", "Portfolio", "About", "AI Assistant"];
    if (currentUser?.role === 'admin') items.push("Manage Users");
    return items;
  };

  // ================= FETCH DATA FROM FIREBASE =================
  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      try {
        // Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        const uList = [];
        usersSnap.forEach((doc) => uList.push({ dbId: doc.id, ...doc.data() }));
        if (uList.length > 0) setUsersList(uList);

        // Fetch Portfolio
        const portSnap = await getDocs(collection(db, "portfolio"));
        const portItems = [];
        portSnap.forEach((doc) => portItems.push({ id: doc.id, ...doc.data() }));
        setPortfolioCards(portItems); // Load from DB (empty array if no data yet)

        // Fetch Timeline
        const tlSnap = await getDocs(collection(db, "timeline"));
        const tlItems = [];
        tlSnap.forEach((doc) => tlItems.push({ id: doc.id, ...doc.data() }));
        setTimelineItems(tlItems);
      } catch (error) {
        console.error("Firebase fetch error:", error);
      }
    };
    fetchData();
  }, []);

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
    const user = usersList.find(u => u.id === loginForm.id && u.password === loginForm.password);
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
    setLoginForm({ id: "", password: "" });
  };

  const filteredPortfolio = useMemo(() => {
    let base = portfolioCards;
    if (selectedPortfolioFilter !== "ทั้งหมด") {
      base = base.filter(item => 
        item.tags?.some(tag => tag.includes(selectedPortfolioFilter)) || 
        item.type === selectedPortfolioFilter ||
        item.fabricType === selectedPortfolioFilter ||
        item.curtainStyle === selectedPortfolioFilter
      );
    }
    if (portfolioSearch.trim()) {
      const q = portfolioSearch.toLowerCase();
      base = base.filter(item => 
        item.title?.toLowerCase().includes(q) || 
        item.subtitle?.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q)) || 
        item.model?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        item.fabricType?.toLowerCase().includes(q) ||
        item.curtainStyle?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [selectedPortfolioFilter, portfolioSearch, portfolioCards]);

  // ================= CLOUDINARY API HELPER =================
  const uploadImageToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_CLOUD_NAME.includes("ใส่_CLOUD_NAME")) {
      console.warn("Cloudinary is not configured yet. Using local Blob URL for preview.");
      return URL.createObjectURL(file);
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(url, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return data.secure_url; 
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่");
      return null;
    }
  };

  // ================= SINGLE IMAGE EDIT =================
  const handleEditModalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setEditImageModal(prev => ({ ...prev, url: objectUrl, fileObj: file }));
  };

  const handleSaveImage = async () => {
    const { type, id, url, fileObj } = editImageModal;
    if (!fileObj && !url.trim()) return;

    setEditImageModal(prev => ({ ...prev, isSaving: true }));

    let finalImageUrl = url.trim();
    if (fileObj) {
       const uploadedUrl = await uploadImageToCloudinary(fileObj);
       if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    if (type === "fabricTypes") {
      setFabricTypes(prev => prev.map(item => item.id === id ? { ...item, image: finalImageUrl } : item));
      if (selectedFabric?.id === id) setSelectedFabric(prev => ({ ...prev, image: finalImageUrl }));
    } else if (type === "curtainStyles") {
      setCurtainStyles(prev => prev.map(item => item.id === id ? { ...item, image: finalImageUrl } : item));
      if (selectedStyle?.id === id) setSelectedStyle(prev => ({ ...prev, image: finalImageUrl }));
    } else if (type === "wallFabrics") {
      setWallFabrics(prev => prev.map(item => item.id === id ? { ...item, image: finalImageUrl } : item));
      if (selectedWallFabric?.id === id) setSelectedWallFabric(prev => ({ ...prev, image: finalImageUrl }));
    } else if (type === "portfolioCards") {
      
      // Update DB and State
      const pIndex = portfolioCards.findIndex(p => p.id === id);
      if (pIndex > -1) {
         const newImages = [...portfolioCards[pIndex].images];
         newImages[currentImageIndex] = finalImageUrl;
         
         if (db) await updateDoc(doc(db, "portfolio", id), { images: newImages });

         setPortfolioCards(prev => prev.map(item => item.id === id ? { ...item, images: newImages } : item));
         if (selectedProject?.id === id) setSelectedProject(prev => ({ ...prev, images: newImages }));
      }
    }
    
    setEditImageModal({ isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false });
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= SMART MEDIA LOGIC =================
  const cleanNameString = (name) => {
    let cleaned = name.replace(/\.[^/.]+$/, ""); 
    cleaned = cleaned.replace(/[\s_-]+\d+.*$/, ""); 
    return cleaned.trim();
  };

  const handleSmartMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const grouped = {};
    files.forEach(file => {
      const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
      let folderName = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
      let fileName = file.name;

      const cleanModel = folderName ? cleanNameString(folderName) : "";
      const cleanColor = cleanNameString(fileName);

      const key = `${cleanModel}-${cleanColor}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: "draft_" + Math.random().toString(36).substr(2, 9),
          title: cleanModel ? `โครงการ: รุ่น ${cleanModel}` : "ผลงานใหม่",
          model: cleanModel,
          color: cleanColor,
          fabricType: "Dim out",
          curtainStyle: "ม่านลอน",
          type: "บ้านพักอาศัย",
          images: [], 
          rawFiles: [], 
          isEnhanced: false
        };
      }
      grouped[key].rawFiles.push(file);
      grouped[key].images.push(URL.createObjectURL(file));
    });

    setUploadQueue(Object.values(grouped));
    setUploadStep(2);
    
    if(smartMediaInputRef.current) smartMediaInputRef.current.value = "";
    if(smartMediaFolderRef.current) smartMediaFolderRef.current.value = "";
  };

  const processQueueAI = async (useAI) => {
    if (!useAI) {
      setUploadStep(3);
      return;
    }
    setIsEnhancing(true);
    await new Promise(resolve => setTimeout(resolve, 1500 + (uploadQueue.length * 200)));
    
    setUploadQueue(prev => prev.map(item => ({ ...item, isEnhanced: true })));
    setIsEnhancing(false);
    setUploadStep(3);
  };

  const updateQueueItem = (index, field, value) => {
    const newQueue = [...uploadQueue];
    newQueue[index][field] = value;
    setUploadQueue(newQueue);
  };

  const saveBulkPortfolio = async () => {
    setIsUploadingToCloud(true);

    try {
      const newCards = await Promise.all(uploadQueue.map(async (item) => {
        const uploadedUrls = [];
        for (const file of item.rawFiles) {
          const url = await uploadImageToCloudinary(file);
          if (url) uploadedUrls.push(url);
        }
        const finalImages = uploadedUrls.length > 0 ? uploadedUrls : item.images;

        const cardData = {
          title: item.title || "ผลงานใหม่",
          subtitle: `${item.curtainStyle} • ${item.fabricType}`,
          type: item.type,
          fabricType: item.fabricType,
          curtainStyle: item.curtainStyle,
          model: item.model || "-",
          color: item.color || "-",
          tags: [item.curtainStyle, item.fabricType, item.type],
          images: finalImages, 
          isEnhanced: item.isEnhanced,
          description: "ผลงานหน้างานจริง อัปโหลดผ่านระบบ Smart Media",
          createdAt: new Date().toISOString()
        };

        // Firebase Save
        if (db) {
           const docRef = await addDoc(collection(db, "portfolio"), cardData);
           return { id: docRef.id, ...cardData };
        }
        return { id: "port_" + Math.random().toString(36).substr(2, 9), ...cardData };
      }));

      setPortfolioCards([...newCards, ...portfolioCards]);
      setUploadStep(4);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการอัปโหลดภาพทั้งหมด");
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (db) await deleteDoc(doc(db, "portfolio", selectedProject.id));
    setPortfolioCards(prev => prev.filter(p => p.id !== selectedProject.id));
    closeProjectModal();
    setIsConfirmingDelete(false);
  };

  const saveProjectEdit = async () => {
    const updatedData = { ...editProjectForm, subtitle: `${editProjectForm.curtainStyle} • ${editProjectForm.fabricType}` };
    if (db) await updateDoc(doc(db, "portfolio", selectedProject.id), updatedData);
    
    setPortfolioCards(prev => prev.map(p => p.id === selectedProject.id ? { ...p, ...updatedData } : p));
    setSelectedProject(prev => ({ ...prev, ...updatedData }));
    setIsEditingProject(false);
  };

  // ================= MISC FUNCTIONS =================
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
    setSelectedProject(project);
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
      if (db) {
         const docRef = await addDoc(collection(db, "users"), newUserForm);
         setUsersList([...usersList, { dbId: docRef.id, ...newUserForm }]);
      } else {
         setUsersList([...usersList, newUserForm]);
      }
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
    setUsersList(usersList.map(u => u.id === editingUserId ? { ...editUserForm, dbId: u.dbId } : u));
    setEditingUserId(null);
  };

  const deleteUser = async (id) => {
    if(window.confirm("ยืนยันการลบพนักงานรหัส " + id + "?")) {
      const userToDelete = usersList.find(u => u.id === id);
      if (db && userToDelete && userToDelete.dbId) await deleteDoc(doc(db, "users", userToDelete.dbId));
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const handleTimelineFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setTimelineModal(prev => ({ ...prev, form: { ...prev.form, image: objectUrl }, fileObj: file }));
  };

  const handleSaveTimeline = async () => {
    const { mode, form, fileObj } = timelineModal;
    if (!form.year || !form.title) return;

    let finalImageUrl = form.image;
    if (fileObj) {
      const uploadedUrl = await uploadImageToCloudinary(fileObj);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }
    const finalForm = { ...form, image: finalImageUrl };

    if (mode === 'add') {
      if (db) {
         const docRef = await addDoc(collection(db, "timeline"), finalForm);
         setTimelineItems([...timelineItems, { ...finalForm, id: docRef.id }]);
      } else {
         setTimelineItems([...timelineItems, { ...finalForm, id: "tl" + Date.now() }]);
      }
    } else {
      if (db) await updateDoc(doc(db, "timeline", form.id), finalForm);
      setTimelineItems(timelineItems.map(item => item.id === form.id ? finalForm : item));
    }
    setTimelineModal({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', image: '' }, fileObj: null });
    if(timelineFileRef.current) timelineFileRef.current.value = "";
  };

  const handleDeleteTimeline = async (id) => {
    if (db) await deleteDoc(doc(db, "timeline", id));
    setTimelineItems(timelineItems.filter(t => t.id !== id));
    setConfirmDeleteTimelineId(null);
  };

  const aiFilterClass = "filter brightness-[1.1] contrast-[1.15] saturate-[1.25] drop-shadow-sm";
  const glassCard = "rounded-[24px] md:rounded-[36px] border border-white/45 bg-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-3xl";
  const softButton = "rounded-full border border-white/55 bg-white/45 px-4 py-2 text-sm text-neutral-700 backdrop-blur-xl transition hover:bg-white/65 hover:shadow-sm";
  const activeButton = "rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-neutral-800";
  const inputClass = "w-full rounded-2xl border border-white/55 bg-white/55 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:bg-white/80 transition placeholder:text-neutral-400";

  // ================= LOGIN SCREEN =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/50 my-8">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-700 font-bold mb-2">PASAYA Curtain Center</div>
            <h1 className="text-3xl font-bold text-neutral-900">Sales OS</h1>
            <p className="text-sm text-neutral-500 mt-2">กรุณาเข้าสู่ระบบสำหรับพนักงาน</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 ml-1">รหัสพนักงาน (Employee ID)</label>
              <input 
                type="text" 
                value={loginForm.id}
                onChange={e => setLoginForm({...loginForm, id: e.target.value})}
                className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-neutral-400 focus:bg-white transition-all shadow-inner"
                placeholder="กรอกรหัสพนักงาน"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 ml-1">รหัสผ่าน (Password)</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-neutral-400 focus:bg-white transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</div>}
            <button type="submit" className="w-full bg-neutral-900 text-white rounded-2xl py-3.5 font-bold shadow-lg hover:bg-neutral-800 transition-colors mt-2">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-20 md:pb-0">
      
      {isUploadingToCloud && (
        <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-neutral-900 mb-1">กำลังบันทึกข้อมูล</h3>
          <p className="text-sm text-neutral-500">กำลังอัปโหลดรูปภาพและบันทึกเข้าฐานข้อมูล ห้ามปิดหน้าต่างนี้...</p>
        </div>
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-10 w-[500px] h-[500px] rounded-full bg-white/60 blur-[100px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-stone-200/50 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <header className="sticky top-2 sm:top-4 z-40 mb-6 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[28px] border border-white/60 bg-white/40 px-4 py-4 md:px-6 shadow-sm backdrop-blur-2xl">
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">PASAYA Curtain Center</div>
              <div className="text-base md:text-lg font-bold text-neutral-800">Sales OS / Presentation</div>
            </div>
            <nav className="hidden md:flex items-center flex-wrap gap-2">
              {getNavItems().map((item) => (
                <button key={item} onClick={() => setActivePage(item)} className={activePage === item ? activeButton : softButton}>{item}</button>
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

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-between rounded-full border border-white/40 bg-white/80 px-2 py-2 shadow-2xl backdrop-blur-3xl">
          {["Home", "Products", "Portfolio", "AI Assistant"].map((item) => (
            <button key={item} onClick={() => setActivePage(item)} className={`flex-1 rounded-full py-2.5 text-[11px] font-semibold tracking-wide ${activePage === item ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>
              {item === "AI Assistant" ? "AI" : item}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
             <button onClick={() => setActivePage("Manage Users")} className={`flex-1 rounded-full py-2.5 text-[11px] font-semibold tracking-wide ${activePage === "Manage Users" ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>Users</button>
          )}
        </div>

        {/* ================= HOME PAGE ================= */}
        {activePage === "Home" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className={`overflow-hidden ${glassCard}`}>
                <div className="grid md:grid-cols-[1.1fr_0.9fr] h-full">
                  <div className="p-6 md:p-10 flex flex-col justify-center">
                    <div className="mb-4 inline-flex w-fit rounded-full border border-neutral-200/60 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700 backdrop-blur-md">
                      PASAYA EXPERIENCE
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                      รังสรรค์พื้นที่ในฝัน<br/><span className="text-neutral-500">ด้วยผ้าม่านระดับพรีเมียม</span>
                    </h1>
                    <p className="mt-5 text-sm md:text-base leading-relaxed text-neutral-600 max-w-md">
                      ร่วมค้นหาสไตล์ที่ใช่ไปกับเรา ผ่านคอลเลกชันเนื้อผ้าคุณภาพสูง รูปแบบการตัดเย็บที่ประณีต และชมผลงานติดตั้งจริงเพื่อเป็นแรงบันดาลใจให้กับบ้านของคุณ
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button onClick={() => setActivePage("Products")} className={activeButton}>ชมแคตตาล็อกสินค้า</button>
                      <button onClick={() => setActivePage("AI Assistant")} className={softButton}>ผู้ช่วยแนะนำสไตล์</button>
                    </div>
                  </div>
                  <div className="min-h-[250px] md:min-h-full bg-cover bg-center" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80")` }} />
                </div>
              </div>

              <div className="grid gap-4">
                <div className={`p-6 ${glassCard} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">หมวดหมู่สินค้าแนะนำ</h3>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="grid gap-3">
                      {[
                        { title: "ประเภทเนื้อผ้า (Fabric Types)", desc: "Black out, Dim out, Sheer...", tab: "fabricTypes" },
                        { title: "รูปแบบผ้าม่าน (Curtain Styles)", desc: "ม่านลอน, ม่านจีบ, มู่ลี่...", tab: "curtainStyles" },
                        { title: "Wall Fabric", desc: "ผ้าบุผนังเพื่อความหรูหรา", tab: "wallFabric" }
                      ].map((item) => (
                        <button key={item.title} onClick={() => { setActivePage("Products"); setProductTab(item.tab); }} className="group relative overflow-hidden rounded-[20px] border border-white/50 bg-white/40 p-4 text-left transition-all hover:bg-white/80 hover:shadow-md">
                          <div className="font-semibold text-neutral-800">{item.title}</div>
                          <div className="mt-1 text-xs text-neutral-500">{item.desc}</div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">→</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleLogout} className="md:hidden mt-4 w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm">ออกจากระบบ</button>
                </div>
              </div>
            </section>
          </div>
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
                  {[
                    { id: "fabricTypes", label: "ประเภทเนื้อผ้า" },
                    { id: "curtainStyles", label: "รูปแบบผ้าม่าน" },
                    { id: "wallFabric", label: "Wall Fabric" }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setProductTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${productTab === tab.id ? "bg-neutral-900 text-white shadow-md" : "text-neutral-600 hover:bg-white/60"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FABRIC TYPES CONTENT */}
              {productTab === "fabricTypes" && selectedFabric && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-10">
                    {fabricTypes.map(item => (
                      <div key={item.id} onClick={() => setSelectedFabric(item)} className={`cursor-pointer relative w-full pt-[75%] rounded-2xl overflow-hidden group transition-all duration-200 border-2 ${selectedFabric.id === item.id ? "border-neutral-900 shadow-lg ring-2 ring-neutral-900/20" : "border-transparent hover:border-white/80 hover:shadow-sm"}`}>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${item.image}")` }} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10">
                          <div className="font-bold text-white text-sm sm:text-base drop-shadow-md line-clamp-1">{item.title}</div>
                        </div>
                        {currentUser?.role === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'fabricTypes', id: item.id, url: item.image, fileObj: null, isSaving: false }); }} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm z-20 transition-colors" title="เปลี่ยนรูปภาพ">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl h-fit sticky top-24 shadow-md">
                    <div className="h-56 sm:h-72 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${selectedFabric.image}")` }}>
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'fabricTypes', id: selectedFabric.id, url: selectedFabric.image, fileObj: null, isSaving: false }); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Fabric Type</div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4">{selectedFabric.title}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6">{selectedFabric.desc}</p>
                      <div className="bg-white/80 rounded-[16px] p-4 mb-6 border border-white">
                        <span className="text-xs text-neutral-500 font-semibold block mb-1">เหมาะสำหรับติดตั้งที่:</span>
                        <span className="text-sm font-bold text-neutral-800">{selectedFabric.fit}</span>
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
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-10">
                    {curtainStyles.map(item => (
                      <div key={item.id} onClick={() => setSelectedStyle(item)} className={`cursor-pointer relative w-full pt-[75%] rounded-2xl overflow-hidden group transition-all duration-200 border-2 ${selectedStyle.id === item.id ? "border-neutral-900 shadow-lg ring-2 ring-neutral-900/20" : "border-transparent hover:border-white/80 hover:shadow-sm"}`}>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${item.image}")` }} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10">
                          <div className="font-bold text-white text-sm sm:text-base drop-shadow-md line-clamp-1">{item.title}</div>
                        </div>
                        {currentUser?.role === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'curtainStyles', id: item.id, url: item.image, fileObj: null, isSaving: false }); }} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm z-20 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl h-fit sticky top-24 shadow-md">
                    <div className="h-56 sm:h-72 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${selectedStyle.image}")` }}>
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'curtainStyles', id: selectedStyle.id, url: selectedStyle.image, fileObj: null, isSaving: false }); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Curtain Style</div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4">{selectedStyle.title}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6">{selectedStyle.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedStyle.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-700">#{tag}</span>
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
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in">
                  <div className="grid gap-4">
                    {wallFabrics.map(item => (
                      <div key={item.id} onClick={() => setSelectedWallFabric(item)} className={`cursor-pointer p-4 text-left rounded-[24px] border flex items-center gap-4 transition-all relative ${selectedWallFabric.id === item.id ? "border-neutral-900 bg-white shadow-md" : "border-white/50 bg-white/40 hover:bg-white/70"}`}>
                         <div className="h-20 w-20 rounded-[12px] shrink-0 bg-cover bg-center" style={{backgroundImage: `url("${item.image}")`}} />
                         <div>
                           <div className="font-bold text-base">{item.title}</div>
                           <div className="text-sm text-neutral-500 mt-1">{item.style}</div>
                         </div>
                         {currentUser?.role === 'admin' && (
                           <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'wallFabrics', id: item.id, url: item.image, fileObj: null, isSaving: false }); }} className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm z-20 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                         )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 border border-white/60 rounded-[28px] overflow-hidden backdrop-blur-xl shadow-md">
                    <div className="h-56 sm:h-72 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${selectedWallFabric.image}")` }}>
                      {currentUser?.role === 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'wallFabrics', id: selectedWallFabric.id, url: selectedWallFabric.image, fileObj: null, isSaving: false }); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="p-6 sm:p-8">
                      <h3 className="text-2xl font-bold mb-2">{selectedWallFabric.title}</h3>
                      <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6">{selectedWallFabric.desc}</p>
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
              <div className="w-full md:w-2/3">
                <input value={portfolioSearch} onChange={(e) => setPortfolioSearch(e.target.value)} className={inputClass} placeholder="ค้นหาชื่อโครงการ, สี, ประเภทผ้า, รูปแบบม่าน (เช่น Black out, ม่านม้วน, Beige)" />
                <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto pb-2">
                  {["ทั้งหมด", "ม่านลอน", "ม่านจีบ", "ม่านม้วน", "มู่ลี่ไม้", "Black out", "Dim out", "บ้านพักอาศัย", "คอนโด"].map((filter) => (
                    <button key={filter} onClick={() => setSelectedPortfolioFilter(filter)} className={`shrink-0 ${selectedPortfolioFilter === filter ? activeButton : softButton}`}>{filter}</button>
                  ))}
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
                    <div key={item.id} onClick={() => openProjectModal(item)} className="cursor-pointer group relative overflow-hidden rounded-[24px] border border-white/40 bg-white/60 text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-white flex flex-col">
                      <div className="aspect-[4/3] w-full shrink-0 relative overflow-hidden bg-neutral-100">
                        <img 
                          src={item.images[0]} 
                          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${item.isEnhanced ? aiFilterClass : ''}`} 
                          alt={item.title} 
                        />
                        {currentUser?.role === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); setEditImageModal({ isOpen: true, type: 'portfolioCards', id: item.id, url: item.images[0], fileObj: null, isSaving: false }); }} className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm z-20 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                        {item.images.length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1 z-10 pointer-events-none">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {item.images.length}
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white z-10 border-t border-neutral-100">
                        <div>
                          <div className="font-bold text-base sm:text-lg text-neutral-900 line-clamp-1">{item.title}</div>
                          <div className="mt-1 text-xs text-neutral-500 line-clamp-1">{item.subtitle}</div>
                        </div>
                        <div className="mt-4 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">ชนิด: {item.fabricType}</span>
                          <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">แบบ: {item.curtainStyle}</span>
                          <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 truncate max-w-[140px]">สี: {item.color}</span>
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
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4">Smart Media AI (อัปโหลดงาน)</h3>
                    <p className="text-sm sm:text-base leading-relaxed text-neutral-600 mb-6">
                      ระบบประมวลผลการอัปโหลดไฟล์/โฟลเดอร์แบบกลุ่ม (Batch) พร้อม AI ปรับแต่งแสงเงาภาพให้สวยงามเป็นมืออาชีพ
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { step: 1, text: "อัปโหลดภาพ (ทีละหลายรูป หรือ ทั้งโฟลเดอร์)" },
                        { step: 2, text: "ยืนยันการตกแต่งด้วย AI (หรือใช้รูปต้นฉบับ)" },
                        { step: 3, text: "รีวิวข้อมูลและการจัดกลุ่ม" },
                      ].map((item) => (
                        <div key={item.step} className={`flex items-center gap-4 p-3 rounded-[16px] transition-all ${uploadStep === item.step ? 'bg-white shadow-md border border-white/60' : 'opacity-60'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep >= item.step ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                            {item.step}
                          </div>
                          <span className="text-sm font-semibold">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 bg-white/50 rounded-[28px] p-4 sm:p-6 border border-white/60 shadow-inner min-h-[350px]">
                    {/* STEP 1: Upload Method */}
                    {uploadStep === 1 && (
                      <div className="flex flex-col gap-4 h-full min-h-[250px] justify-center">
                        <button 
                          onClick={() => smartMediaInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-300 rounded-[20px] p-6 flex flex-col items-center justify-center bg-white/40 hover:bg-white/70 transition cursor-pointer"
                        >
                          <span className="text-3xl mb-2">📸</span>
                          <span className="font-semibold text-neutral-700">อัปโหลดรูปภาพ (หลายรูป)</span>
                          <input type="file" multiple accept="image/*, .heic, .heif" className="hidden" ref={smartMediaInputRef} onChange={handleSmartMediaUpload} />
                        </button>
                        <div className="text-center text-xs text-neutral-400 font-bold">- หรือ -</div>
                        <button 
                          onClick={() => smartMediaFolderRef.current?.click()}
                          className="border-2 border-dashed border-emerald-300 rounded-[20px] p-6 flex flex-col items-center justify-center bg-emerald-50/40 hover:bg-emerald-50/80 transition cursor-pointer"
                        >
                          <span className="text-3xl mb-2">📁</span>
                          <span className="font-semibold text-emerald-700">อัปโหลดทั้งโฟลเดอร์</span>
                          <span className="text-[10px] text-emerald-600/70 mt-1 max-w-[200px] text-center">ระบบจะนำชื่อโฟลเดอร์มาเป็นรุ่นผ้า และชื่อไฟล์เป็นสีผ้าให้อัตโนมัติ</span>
                          <input type="file" webkitdirectory="true" multiple className="hidden" ref={smartMediaFolderRef} onChange={handleSmartMediaUpload} />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: AI Option */}
                    {uploadStep === 2 && uploadQueue.length > 0 && (
                      <div className="space-y-6 animate-in zoom-in-95 duration-500 flex flex-col h-full justify-center text-center">
                        <div>
                          <h4 className="text-xl font-bold mb-2">พบ {uploadQueue.length} รายการที่อัปโหลด</h4>
                          <p className="text-sm text-neutral-500">ระบบได้จัดกลุ่มรูปภาพที่สี/รุ่นเดียวกันเข้าด้วยกันเรียบร้อยแล้ว ต้องการให้ AI ช่วยตกแต่งรูปภาพให้สวยงามขึ้นไหม?</p>
                        </div>
                        
                        <div className="flex gap-2">
                           <div className="h-24 w-1/2 rounded-xl bg-neutral-100 overflow-hidden relative border border-neutral-200">
                             <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded backdrop-blur-md">Original</div>
                             <img src={uploadQueue[0].images[0]} className="w-full h-full object-cover" />
                           </div>
                           <div className="h-24 w-1/2 rounded-xl overflow-hidden relative border-2 border-emerald-400">
                             <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 rounded shadow-sm">AI Demo</div>
                             <img src={uploadQueue[0].images[0]} className={`w-full h-full object-cover ${aiFilterClass}`} />
                           </div>
                        </div>

                        {isEnhancing ? (
                           <div className="py-4 flex flex-col items-center space-y-2">
                              <div className="w-6 h-6 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                              <span className="text-xs font-semibold text-emerald-600 animate-pulse">AI กำลังปรับแต่งแสงเงา...</span>
                           </div>
                        ) : (
                           <div className="space-y-3">
                             <button onClick={() => processQueueAI(true)} className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-bold shadow-md transition-colors hover:bg-neutral-800 flex justify-center items-center gap-2">
                               ✨ ใช้ AI ตกแต่งภาพอัตโนมัติ
                             </button>
                             <button onClick={() => processQueueAI(false)} className="w-full py-3 bg-white border border-neutral-300 text-neutral-600 rounded-xl font-bold transition-colors hover:bg-neutral-50">
                               ข้ามการตกแต่ง (Original)
                             </button>
                           </div>
                        )}
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
                                 <img src={item.images[0]} className={`w-full h-full object-cover ${item.isEnhanced ? aiFilterClass : ''}`} />
                                 {item.images.length > 1 && (
                                   <div className="absolute top-1 left-1 bg-black/60 px-1.5 rounded text-[10px] font-bold text-white shadow-sm pointer-events-none">
                                     +{item.images.length - 1} รูป
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                 <div className="col-span-2">
                                    <input value={item.title} onChange={e => updateQueueItem(index, 'title', e.target.value)} className="w-full border-b border-neutral-200 px-1 py-1 outline-none font-bold text-neutral-800 placeholder:text-neutral-300 focus:border-neutral-500 transition-colors" placeholder="ชื่อผลงาน (เช่น โครงการคอนโด...)" />
                                 </div>
                                 <div>
                                   <label className="block text-[10px] text-neutral-500 font-bold mb-0.5">รุ่น/ผ้า</label>
                                   <input value={item.model} onChange={e => updateQueueItem(index, 'model', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none focus:border-neutral-500" placeholder="รุ่น..." />
                                 </div>
                                 <div>
                                   <label className="block text-[10px] text-neutral-500 font-bold mb-0.5">สี</label>
                                   <input value={item.color} onChange={e => updateQueueItem(index, 'color', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none focus:border-neutral-500" placeholder="สี..." />
                                 </div>
                                 <div>
                                    <select value={item.fabricType} onChange={e => updateQueueItem(index, 'fabricType', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none bg-white">
                                      {fabricTypes.map(f => <option key={f.id} value={f.title}>{f.title}</option>)}
                                      <option value="มู่ลี่">มู่ลี่</option>
                                      <option value="Wall Fabric">Wall Fabric</option>
                                    </select>
                                 </div>
                                 <div>
                                    <select value={item.curtainStyle} onChange={e => updateQueueItem(index, 'curtainStyle', e.target.value)} className="w-full border rounded-md px-2 py-1.5 outline-none bg-white">
                                      {curtainStyles.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                                      <option value="มู่ลี่ไม้">มู่ลี่ไม้</option>
                                      <option value="บุผนัง">บุผนัง</option>
                                    </select>
                                 </div>
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
                        <p className="text-sm text-neutral-500 mt-2 mb-6">ภาพถูกอัปโหลดขึ้นคลาวด์และบันทึกลง Database แล้ว</p>
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
          <section className="py-20 md:py-32 bg-white rounded-[36px] shadow-sm animate-in fade-in border border-neutral-100">
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
                {timelineItems.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -top-12 md:-top-24 left-0 md:left-4 text-[100px] md:text-[180px] font-serif font-bold text-neutral-50/80 z-0 select-none pointer-events-none transition-colors group-hover:text-neutral-100">
                      {item.year}
                    </div>
                    
                    {currentUser?.role === 'admin' && (
                      <div className={`absolute -top-4 right-0 z-30 flex gap-2 transition-opacity bg-white/90 p-2 rounded-full shadow-md border ${confirmDeleteTimelineId === item.id ? 'opacity-100 border-red-200' : 'opacity-0 group-hover:opacity-100 border-neutral-200'}`}>
                        {confirmDeleteTimelineId === item.id ? (
                          <div className="flex items-center gap-2 px-1 animate-in zoom-in-95">
                            <span className="text-xs text-red-600 font-bold">ยืนยันลบ?</span>
                            <button onClick={() => handleDeleteTimeline(item.id)} className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700">ลบเลย</button>
                            <button onClick={() => setConfirmDeleteTimelineId(null)} className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-xs font-bold hover:bg-neutral-300">ยกเลิก</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setTimelineModal({ isOpen: true, mode: 'edit', form: item, fileObj: null })} className="p-2 text-neutral-600 hover:text-emerald-600 bg-neutral-100 hover:bg-emerald-50 rounded-full transition-colors" title="แก้ไข">
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
                        <div className="overflow-hidden bg-neutral-100 aspect-[4/3] md:aspect-[3/2] w-full rounded-2xl md:rounded-[40px] shadow-2xl">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover filter saturate-[0.9] hover:saturate-100 transition-all duration-700 hover:scale-105" />
                        </div>
                      </div>
                      
                      <div className={`md:col-span-5 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1 text-left md:text-right'}`}>
                        <div className="inline-block text-emerald-700 font-serif text-xl md:text-2xl italic mb-3">
                          {item.year}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 font-serif">
                          {item.title}
                        </h3>
                        <p className="text-neutral-600 leading-loose text-sm md:text-base whitespace-pre-line">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentUser?.role === 'admin' && (
                <div className="mt-24 flex justify-center">
                  <button 
                    onClick={() => setTimelineModal({ isOpen: true, mode: 'add', form: { id: '', year: '', title: '', text: '', image: '' }, fileObj: null })}
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

        {/* ================= MANAGE USERS PAGE (ADMIN ONLY) ================= */}
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
                              <td className="p-4 font-bold text-neutral-800">{user.id}</td>
                              
                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="w-full border border-neutral-300 rounded px-2 py-1 text-sm outline-none focus:border-neutral-500" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} />
                                ) : (
                                  <span className="text-neutral-600">{user.name}</span>
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
                                    {user.role}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="w-full border border-neutral-300 rounded px-2 py-1 text-sm outline-none focus:border-neutral-500" value={editUserForm.password} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} />
                                ) : (
                                  <span className="text-neutral-500 font-mono tracking-wider bg-neutral-100 px-2 py-1 rounded text-xs">{user.password}</span>
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
                      <span className="text-xs text-red-600 font-bold px-1">ยืนยันการลบ?</span>
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
                  className={`absolute inset-4 cursor-zoom-in transition-transform duration-300 ${selectedProject.isEnhanced ? aiFilterClass : ''}`}
                  style={{ 
                    backgroundImage: `url("${selectedProject.images[currentImageIndex]}")`,
                    backgroundSize: 'contain', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat'
                  }}
                  onClick={toggleFullscreen}
                />
                
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditImageModal({ isOpen: true, type: 'portfolioCards', id: selectedProject.id, url: selectedProject.images[currentImageIndex], fileObj: null, isSaving: false });
                    }}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-md z-20 transition-colors opacity-0 group-hover:opacity-100"
                    title="เปลี่ยนรูปภาพหน้านี้"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}

                {selectedProject.images.length > 1 && (
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
                    <div>
                      <label className="text-xs font-bold text-neutral-500 mb-1 block">ชื่อโครงการ</label>
                      <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.title} onChange={e => setEditProjectForm({...editProjectForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">ชนิดผ้า</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.fabricType} onChange={e => setEditProjectForm({...editProjectForm, fabricType: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">รูปแบบ</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.curtainStyle} onChange={e => setEditProjectForm({...editProjectForm, curtainStyle: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">รหัส/รุ่น</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.model} onChange={e => setEditProjectForm({...editProjectForm, model: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1 block">สี</label>
                        <input type="text" className="w-full p-2 border rounded-lg text-sm" value={editProjectForm.color} onChange={e => setEditProjectForm({...editProjectForm, color: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500 mb-1 block">รายละเอียด</label>
                      <textarea className="w-full p-2 border rounded-lg text-sm h-24 resize-none" value={editProjectForm.description} onChange={e => setEditProjectForm({...editProjectForm, description: e.target.value})}></textarea>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-2xl font-bold text-neutral-900 mb-1">{selectedProject.title}</h4>
                    <div className="text-sm font-medium text-neutral-500 mb-4">{selectedProject.subtitle}</div>
                    <p className="text-sm leading-relaxed text-neutral-600 mb-6 pb-6 border-b border-neutral-100">
                      {selectedProject.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Fabric & Style</div>
                        <div className="text-sm font-bold text-neutral-800">{selectedProject.curtainStyle} ({selectedProject.fabricType})</div>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Model & Color</div>
                        <div className="text-sm font-bold text-neutral-800">{selectedProject.model} - {selectedProject.color}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-8">
                      {selectedProject.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-neutral-200/60 border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!isEditingProject && (
                  <div className="flex flex-col gap-2 mt-auto">
                    <button onClick={() => { 
                      setSelectedProject(null); 
                      setActivePage("Products");
                      setProductTab(selectedProject.model.includes("Wall Fabric") ? "wallFabric" : "fabricTypes");
                    }} className={`w-full py-3 ${activeButton} text-center`}>
                      ดูสเปกสินค้าที่ใช้ในงานนี้
                    </button>
                    <button onClick={() => { 
                      setSelectedProject(null); 
                      setActivePage("AI Assistant"); 
                      setAiInput(`ช่วยสรุปจุดขายและคิดคำพูดสำหรับนำเสนอลูกค้าที่สนใจงานสไตล์ ${selectedProject.title} (ผ้า ${selectedProject.model}) ให้หน่อยค่ะ`); 
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
              className={`max-w-full max-h-full object-contain transition-transform duration-200 ease-out ${selectedProject.isEnhanced ? aiFilterClass : ''}`}
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

      {/* ================= IMAGE EDIT MODAL ================= */}
      {editImageModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative">
            
            {editImageModal.isSaving && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-3xl flex flex-col items-center justify-center">
                 <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
                 <span className="text-sm font-bold text-neutral-700">กำลังอัปโหลดรูปภาพ...</span>
              </div>
            )}

            <h3 className="text-xl font-bold mb-2 text-neutral-800">เปลี่ยนรูปภาพ</h3>
            <p className="text-sm text-neutral-500 mb-5">อัปโหลดไฟล์จากเครื่อง หรือนำลิงก์ (URL) มาวางที่นี่</p>
            
            <div className="mb-6 space-y-4">
              <div className="h-40 w-full rounded-2xl bg-neutral-100 border border-neutral-200" style={{ backgroundImage: `url("${editImageModal.url}")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
              
              <div>
                <label className="text-xs font-bold text-neutral-600 mb-1 block">อัปโหลดไฟล์จากเครื่อง</label>
                <input 
                  type="file" accept="image/*, .heic, .heif" 
                  ref={fileInputRef}
                  onChange={handleEditModalFileUpload}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="relative flex items-center py-1">
                 <div className="flex-grow border-t border-neutral-200"></div>
                 <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs">หรือใช้ลิงก์ URL</span>
                 <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              <div>
                <input 
                  type="text" 
                  value={editImageModal.url}
                  onChange={(e) => setEditImageModal(prev => ({...prev, url: e.target.value, fileObj: null}))}
                  className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => {setEditImageModal({ isOpen: false, type: '', id: '', url: '', fileObj: null, isSaving: false }); if(fileInputRef.current) fileInputRef.current.value = "";}} className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSaveImage} className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow-md">บันทึกรูปภาพ</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TIMELINE EDIT MODAL (Admin Only) ================= */}
      {timelineModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2 text-neutral-800">
              {timelineModal.mode === 'add' ? 'เพิ่มไทม์ไลน์ใหม่' : 'แก้ไขข้อมูลไทม์ไลน์'}
            </h3>
            <p className="text-sm text-neutral-500 mb-5">จัดการข้อมูลประวัติแบรนด์และอัปโหลดรูปภาพ</p>
            
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
                <label className="text-xs font-bold text-neutral-600 mb-1 block">รายละเอียด (Description)</label>
                <textarea 
                  value={timelineModal.form.text} 
                  onChange={e => setTimelineModal(prev => ({...prev, form: {...prev.form, text: e.target.value}}))}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm h-24 resize-none outline-none focus:border-neutral-500"
                  placeholder="เขียนรายละเอียดเรื่องราว..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-600 mb-1 block">รูปภาพประกอบ</label>
                {timelineModal.form.image && (
                  <div className="h-32 w-full rounded-xl bg-neutral-100 mb-3 border border-neutral-200 overflow-hidden relative">
                     <img src={timelineModal.form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-3">
                  <input 
                    type="file" accept="image/*, .heic, .heif" 
                    ref={timelineFileRef}
                    onChange={handleTimelineFileUpload}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm"
                  />
                  <div className="relative flex items-center py-1">
                     <div className="flex-grow border-t border-neutral-200"></div>
                     <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs">หรือวางลิงก์ URL</span>
                     <div className="flex-grow border-t border-neutral-200"></div>
                  </div>
                  <input 
                    type="text" 
                    value={timelineModal.form.image}
                    onChange={(e) => setTimelineModal(prev => ({...prev, form: {...prev.form, image: e.target.value}}))}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
              <button onClick={() => {setTimelineModal({ isOpen: false, mode: 'add', form: { id: '', year: '', title: '', text: '', image: '' }, fileObj: null }); if(timelineFileRef.current) timelineFileRef.current.value = "";}} className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">ยกเลิก</button>
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