/* 
==========================================================================
_0xDATA: PROJECT DATABASE (ENCRYPTED)
==========================================================================
*/
const _0x7a1b = [
    {
        id: 0x1,
        _t: "Online FPS Multiplayer Shooter",
        _d: "A competitive multiplayer experience powered by Photon Pun 2, featuring fast-paced combat and robust network synchronization.",
        _ts: ["Photon Pun 2", "FPS", "Networking"],
        _th: "assets/project1.png",
        _v: "assets/game1.mp4",
        _l: "https://www.youtube.com/watch?v=MAhPNKZ_MHE",
        _h: true,
        _p: false
    },
    {
        id: 0x2,
        _t: "Thief Long Hand Puzzle",
        _d: "A clever physics-based puzzle game challenging your spatial logic. Available on Play Store.",
        _ts: ["Puzzle", "Play Store", "Logic"],
        _th: "assets/project2.png",
        _v: "assets/game2.mp4",
        _l: "https://play.google.com/store/apps/details?id=com.thief.puzzle.escape.game&pli=1",
        _h: true,
        _p: true
    },
    {
        id: 0x3,
        _t: "Ashes: RPG Adventure",
        _d: "A story-driven medieval action game featuring deep lore, character progression, and immersive environments.",
        _ts: ["Action RPG", "Medieval", "Story-driven"],
        _th: "assets/project3.png",
        _v: "assets/game3.mp4",
        _l: "https://www.youtube.com/watch?v=qu9_ICrAAc8",
        _h: true,
        _p: false
    },
    {
        id: 0x4,
        _t: "Ragdoll Ball Game",
        _d: "Physics-based chaotic fun exploring ragdoll mechanics and dynamic object interactions.",
        _ts: ["Physics", "Casual"],
        _th: "assets/project4.png",
        _v: "assets/game4.mp4",
        _l: "https://drive.google.com/file/d/1GfCZ3f_H86bOCknX3-3AgwR3Nx9ybrqs/view?usp=sharing",
        _h: false,
        _p: true
    },
    {
        id: 0x5,
        _t: "Cube Runner",
        _d: "A fast-paced infinite runner testing your reflexes and spatial awareness.",
        _ts: ["Arcade", "Runner"],
        _th: "assets/project5.png",
        _v: "assets/game5.mp4",
        _l: "https://www.youtube.com/watch?v=omsdky5n_2Q",
        _h: false,
        _p: false
    },
    {
        id: 0x6,
        _t: "Wannabe GTA 6",
        _d: "An ambitious open-world sandbox project exploring complex AI, vehicle physics, and large-scale environments.",
        _ts: ["Open World", "Sandbox"],
        _th: "assets/project6.png",
        _v: "assets/game6.mp4",
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
