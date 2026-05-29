/* 
==========================================================================
_0xDATA: PROJECT DATABASE (ENCRYPTED)
==========================================================================
*/
const _0x7a1b = [
    {
        id: 0x7,
        _t: "Parkour System",
        _d: "Proprietary physics and locomotion architecture built for cross-platform scalability, featuring low-overhead dynamic climbing, dynamic wall-running, and modular ledge halting algorithms.",
        _ts: ["Physics", "Movement", "Parkour"],
        _th: "assets/images/projects/project7.png",
        _v: "assets/videos/game7.mp4",
        _l: "https://www.linkedin.com/posts/harshit-ranjan-874659375_i-have-made-a-parkour-system-in-unity-using-ugcPost-7464691263229829120-38P-/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFzSrpgBCVYP0H7eFktlbqBiynqHVOFfSx8",
        _h: true,
        _p: false
    },
    {
        id: 0x1,
        _t: "Online FPS Multiplayer Shooter",
        _d: "Proprietary multiplayer networking framework built for cross-platform scalability, implementing custom client-side prediction, lag compensation history rewinds, and low-latency state synchronization.",
        _ts: ["Photon Pun 2", "FPS", "Networking"],
        _th: "assets/images/projects/project1.png",
        _v: "assets/videos/game1.mp4",
        _l: "https://www.youtube.com/watch?v=MAhPNKZ_MHE",
        _h: true,
        _p: false
    },
    {
        id: 0x2,
        _t: "Thief Long Hand Puzzle",
        _d: "Shipped Commercial Product available on the Google Play Store with proprietary physics-based procedural arm animations and dynamic obstacle segment collision logic.",
        _ts: ["Puzzle", "Play Store", "Logic"],
        _th: "assets/images/projects/project2.png",
        _v: "assets/videos/game2.mp4",
        _l: "https://play.google.com/store/apps/details?id=com.thief.puzzle.escape.game&pli=1",
        _h: true,
        _p: true
    },
    {
        id: 0x3,
        _t: "Ashes: RPG Adventure",
        _d: "Proprietary animation state machine and combat physics architecture featuring frame-perfect active windows and predictive hitbox resolution.",
        _ts: ["Action RPG", "Medieval", "Story-driven"],
        _th: "assets/images/projects/project3.png",
        _v: "assets/videos/game3.mp4",
        _l: "https://www.youtube.com/watch?v=qu9_ICrAAc8",
        _h: true,
        _p: false
    },
    {
        id: 0x4,
        _t: "Ragdoll Ball Game",
        _d: "Proprietary joint-decoupling engine simulating dynamic structural limb stress and collision-induced skeletal partitioning.",
        _ts: ["Physics", "Casual"],
        _th: "assets/images/projects/project4.png",
        _v: "assets/videos/game4.mp4",
        _l: "https://drive.google.com/file/d/1GfCZ3f_H86bOCknX3-3AgwR3Nx9ybrqs/view?usp=sharing",
        _h: false,
        _p: true
    },
    {
        id: 0x5,
        _t: "Cube Runner",
        _d: "Procedurally generated environment engine featuring an exponential speed-scaling curve and high-performance physics-based obstacle layouts.",
        _ts: ["Arcade", "Runner"],
        _th: "assets/images/projects/project5.png",
        _v: "assets/videos/game5.mp4",
        _l: "https://www.youtube.com/watch?v=omsdky5n_2Q",
        _h: false,
        _p: false
    },
    {
        id: 0x6,
        _t: "Wannabe GTA 6",
        _d: "Proprietary real-time vehicle mesh deformation and collision impulse vector distribution model.",
        _ts: ["Open World", "Sandbox"],
        _th: "assets/images/projects/project6.png",
        _v: "assets/videos/game6.mp4",
        _l: "https://www.youtube.com/watch?v=NeQqgua8t_c",
        _h: false,
        _p: false
    }
];

// Reconstruct for application logic
const PROJECT_DATA = _0x7a1b.map(p => ({
    id: p.id,
    title: p._t,
    desc: p._d,
    tags: p._ts,
    thumbnail: p._th,
    video: p._v,
    link: p._l,
    isHighlight: p._h,
    isPortrait: p._p
}));

/* 
==========================================================================
SECURITY & ANTI-DEBUGGING LAYER
==========================================================================
*/
(function() {
    const _0x4f22 = function() {
        try {
            (function(_0x5d21) {
                (function(_0x3e1a) {
                    if (_0x3e1a) return _0x3e1a;
                    else _0x4f22();
                }(_0x5d21));
            }(function() {
                let _0x1b2c;
                try { _0x1b2c = Function('return (function() {}.constructor("debugger")())')(); }
                catch (_0x5a2e) { _0x1b2c = false; }
                return _0x1b2c;
            }()));
        } catch (_0x2d1c) {}
    };
    setInterval(_0x4f22, 500);

    window.addEventListener('keydown', (e) => {
        const forbiddenKeys = ['F12', 'I', 'J', 'C', 'U', 'S', 'P', 'H'];
        if (forbiddenKeys.includes(e.key.toUpperCase()) && (e.ctrlKey || e.shiftKey || e.key === 'F12')) {
            e.preventDefault();
            return false;
        }
    }, true);

    document.addEventListener('contextmenu', (e) => e.preventDefault());
})();
