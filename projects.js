/* 
==========================================================================
_0xDATA: PROJECT DATABASE (ENCRYPTED)
==========================================================================
*/
const _0x7a1b = [
    {
        id: 0x7,
        _t: "Parkour System",
        _d: "A custom parkour system for Unity — handles climbing, wall-running, ledge grabs, and smooth halting. Built to drop into any project.",
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
        _d: "Online FPS built on Photon PUN 2 with client-side prediction, lag compensation, and smooth state sync. Handles real multiplayer lag.",
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
        _d: "Live on Google Play. A physics puzzle game with stretchy procedural arms and hand-crafted obstacle layouts.",
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
        _d: "An action RPG with tight combat windows, hitbox-based damage, and a custom animation state machine.",
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
        _d: "A ragdoll physics game where limbs detach on impact. Custom joint stress and separation system.",
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
        _d: "An endless runner with procedural level generation, exponential speed ramp, and physics-based obstacle spawning.",
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
        _d: "Open-world sandbox with real-time vehicle deformation on collision. Custom impulse and mesh damage system.",
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
