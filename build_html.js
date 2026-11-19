const fs = require('fs');
const spritesData = JSON.parse(fs.readFileSync('sprites_data.json', 'utf8'));

let greenBinsB64 = '';
let yellowBinsB64 = '';
let blueBinsB64 = '';
let purpleBinsB64 = '';
try {
    greenBinsB64 = 'data:image/png;base64,' + fs.readFileSync('Assets/Bins/GreenBins.png').toString('base64');
    yellowBinsB64 = 'data:image/png;base64,' + fs.readFileSync('Assets/Bins/YellowBins.png').toString('base64');
    blueBinsB64 = 'data:image/png;base64,' + fs.readFileSync('Assets/Bins/BlueBins.png').toString('base64');
    purpleBinsB64 = 'data:image/png;base64,' + fs.readFileSync('Assets/Bins/PurpleBins.png').toString('base64');
} catch (e) {
    console.warn('Could not read bin spritesheets:', e.message);
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>ARRC Trash Tycoon - Deluxe Edition</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="phaser.min.js"></script>
    <script>if (typeof Phaser === 'undefined') { document.write('<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js" crossorigin="anonymous"><\\/script>'); }</script>
    <style>
        :root {
            --sat: env(safe-area-inset-top, 0px);
            --sab: env(safe-area-inset-bottom, 0px);
            --sal: env(safe-area-inset-left, 0px);
            --sar: env(safe-area-inset-right, 0px);
        }
        * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: none; box-sizing: border-box; }
        html, body {
            margin: 0; padding: 0;
            position: fixed; inset: 0;
            width: 100%; height: 100%;
            height: 100dvh;
            background-color: #121824; overflow: hidden;
            overscroll-behavior: none;
            display: flex; justify-content: center; align-items: center;
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        #game-container {
            width: 100%; height: 100%;
            position: relative;
            overflow: hidden;
            display: flex; justify-content: center; align-items: center;
        }
        #game-container canvas {
            display: block;
            touch-action: none;
        }
    </style>
</head>
<body>
    <div id="game-container"></div>

    <script>
    function getSafeInsets() {
        const out = { top: 0, bottom: 0, left: 0, right: 0 };
        try {
            const cs = getComputedStyle(document.documentElement);
            const parsePx = (v) => {
                const n = parseFloat(v);
                return Number.isFinite(n) ? Math.max(0, Math.min(64, Math.round(n))) : 0;
            };
            out.top = parsePx(cs.getPropertyValue('--sat'));
            out.bottom = parsePx(cs.getPropertyValue('--sab'));
            out.left = parsePx(cs.getPropertyValue('--sal'));
            out.right = parsePx(cs.getPropertyValue('--sar'));
        } catch (e) {}
        return out;
    }

    function getVisibleViewportSize() {
        const vv = window.visualViewport;
        const w = Math.floor(vv ? vv.width : (window.innerWidth || document.documentElement.clientWidth || 800));
        const h = Math.floor(vv ? vv.height : (window.innerHeight || document.documentElement.clientHeight || 600));
        return { width: Math.max(280, w), height: Math.max(300, h) };
    }

    // Global Error Handler for immediate visual feedback
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        var errDiv = document.getElementById('game-err-banner');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'game-err-banner';
            errDiv.style.position = 'fixed'; errDiv.style.top = '10px'; errDiv.style.left = '10px'; errDiv.style.right = '10px';
            errDiv.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; errDiv.style.color = '#ffffff'; errDiv.style.padding = '14px 44px 14px 14px';
            errDiv.style.fontFamily = "'Outfit', sans-serif"; errDiv.style.zIndex = '999999'; errDiv.style.fontSize = '13px';
            errDiv.style.borderRadius = '8px'; errDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6)';
            
            var closeBtn = document.createElement('button');
            closeBtn.id = 'game-err-close-btn';
            closeBtn.innerHTML = '✕';
            closeBtn.style.position = 'absolute'; closeBtn.style.top = '10px'; closeBtn.style.right = '12px';
            closeBtn.style.background = 'rgba(0,0,0,0.35)'; closeBtn.style.border = 'none'; closeBtn.style.color = '#fff';
            closeBtn.style.fontSize = '16px'; closeBtn.style.cursor = 'pointer'; closeBtn.style.borderRadius = '4px';
            closeBtn.style.width = '28px'; closeBtn.style.height = '28px'; closeBtn.style.lineHeight = '28px';
            closeBtn.style.textAlign = 'center';
            closeBtn.onclick = function() { errDiv.style.display = 'none'; };
            errDiv.appendChild(closeBtn);

            var contentDiv = document.createElement('div');
            contentDiv.id = 'game-err-content';
            errDiv.appendChild(contentDiv);
            document.body.appendChild(errDiv);
        }
        errDiv.style.display = 'block';
        var contentDiv = document.getElementById('game-err-content') || errDiv;
        contentDiv.innerHTML = '<b>⚠️ GAME ERROR:</b><br>' + msg + '<br>Line: ' + lineNo + ' Col: ' + columnNo + (error && error.stack ? '<br><pre style="max-height:180px;overflow:auto;margin:6px 0 0 0;">' + error.stack + '</pre>' : '');
        return false;
    };

    const RUBBISH_SPRITES = ${JSON.stringify(spritesData, null, 2)};
    const GREEN_BINS_B64 = "${greenBinsB64}";
    const YELLOW_BINS_B64 = "${yellowBinsB64}";
    const BLUE_BINS_B64 = "${blueBinsB64}";
    const PURPLE_BINS_B64 = "${purpleBinsB64}";

    // ==========================================
    // BIN SPRITES & ANIMATION CONFIGURATION
    // Change scale, frame dimensions, or animation frameRate here:
    // ==========================================
    const BIN_SPRITE_CONFIG = {
        frameWidth: 743,   // Native width of each frame in the spritesheet
        frameHeight: 997,  // Native height of each frame in the spritesheet
        scale: 0.105,      // Enlarged scale (~78px wide x ~105px tall, unconfined 743:997 aspect ratio)
        animFrameRate: 20  // Animation speed (20 frames per second)
    };

    const TRASH_TYPES = {
        organic: { id: 'organic', name: 'Green', color: 0x4caf50, colorHex: '#4caf50', key: '1', items: ['Apple', 'Banana'], sprites: ['rubbish_green_apple', 'rubbish_green_banana'] },
        paper:   { id: 'paper',   name: 'Paper', color: 0x2196f3, colorHex: '#2196f3', key: '2', items: ['Box', 'Carton', 'Newspaper'], sprites: ['rubbish_paper_box', 'rubbish_paper_carton', 'rubbish_paper_news'] },
        glass:   { id: 'glass',   name: 'Glass', color: 0x9c27b0, colorHex: '#9c27b0', key: '3', items: ['Bottle'], sprites: ['rubbish_glass_bottle'] },
        plastic: { id: 'plastic', name: 'Yellow/Plastic', color: 0xffeb3b, colorHex: '#ffeb3b', key: '4', items: ['Cup'], sprites: ['rubbish_plastic_cup'] },
        metal:   { id: 'metal',   name: 'Metal', color: 0x9e9e9e, colorHex: '#9e9e9e', key: '5', items: ['Tin Can', 'Metal Foil'], sprites: ['rubbish_metal_can'] },
        fabric:  { id: 'fabric',  name: 'Fabric', color: 0xe91e63, colorHex: '#e91e63', key: '6', items: ['Cloth', 'Old Shirt'], sprites: ['rubbish_fabric_cloth'] }
    };

    const CAPACITY_TIERS = [5, 6, 7, 8, 9, 10, 20, 30, 50, 100, 200, 300, 500, Infinity];
    const CAPACITY_COSTS = [15, 30, 50, 80, 120, 250, 500, 1000, 2500, 6000, 15000, 35000, 100000];

    const RECIPES_DATA = {
        fertilizer: {
            id: 'fertilizer',
            name: '🌱 Organic Fertilizer',
            desc: 'Enriched soil additive crafted from 3 Green tokens. Sells for $30 + 35 XP!',
            costTokens: { organic: 3 },
            sellPrice: 30,
            xpReward: 35,
            reqSP: 1
        },
        paper_bundle: {
            id: 'paper_bundle',
            name: '📦 Recycled Paper Bundle',
            desc: 'Compressed paper sheets crafted from 3 Paper tokens. Sells for $30 + 35 XP!',
            costTokens: { paper: 3 },
            sellPrice: 30,
            xpReward: 35,
            reqSP: 1
        },
        plastic_pellets: {
            id: 'plastic_pellets',
            name: '🟡 Plastic Pellets',
            desc: 'Melted raw polymer beads crafted from 3 Plastic tokens. Sells for $30 + 35 XP!',
            costTokens: { plastic: 3 },
            sellPrice: 30,
            xpReward: 35,
            reqSP: 1
        },
        crushed_cullet: {
            id: 'crushed_cullet',
            name: '💎 Crushed Glass Cullet',
            desc: 'Washed recycled glass shards crafted from 3 Glass tokens. Sells for $30 + 35 XP!',
            costTokens: { glass: 3 },
            sellPrice: 30,
            xpReward: 35,
            reqSP: 1
        }
    };

    const FACTORY_RECIPES = [
        { name: '🌱 Fertilizer', key: 'fertilizer', icon: '🌱', req: '5 🟢', costVal: 5, resKey: 'organic', binId: 'organic', tier: 1, sellPrice: 40, xpReward: 45 },
        { name: '🛢️ Biofuel', key: 'biofuel', icon: '🛢️', req: '10 🟢', costVal: 10, resKey: 'organic', binId: 'organic', tier: 2, sellPrice: 90, xpReward: 100 },
        { name: '🍂 Compost', key: 'compost', icon: '🍂', req: '15 🟢', costVal: 15, resKey: 'organic', binId: 'organic', tier: 3, sellPrice: 150, xpReward: 160 },
        { name: '📄 Rec.Paper', key: 'recycled_paper', icon: '📄', req: '5 🔵', costVal: 5, resKey: 'paper', binId: 'paper', tier: 1, sellPrice: 40, xpReward: 45 },
        { name: '📦 Cardboard', key: 'cardboard', icon: '📦', req: '10 🔵', costVal: 10, resKey: 'paper', binId: 'paper', tier: 2, sellPrice: 90, xpReward: 100 },
        { name: '📓 Notebook', key: 'notebook', icon: '📓', req: '15 🔵', costVal: 15, resKey: 'paper', binId: 'paper', tier: 3, sellPrice: 150, xpReward: 160 },
        { name: '🏺 Glass Vase', key: 'glass_vase', icon: '🏺', req: '5 🟣', costVal: 5, resKey: 'glass', binId: 'glass', tier: 1, sellPrice: 40, xpReward: 45 },
        { name: '🪞 Mirror', key: 'mirror', icon: '🪞', req: '10 🟣', costVal: 10, resKey: 'glass', binId: 'glass', tier: 2, sellPrice: 90, xpReward: 100 },
        { name: '🔍 Lens', key: 'lens', icon: '🔍', req: '15 🟣', costVal: 15, resKey: 'glass', binId: 'glass', tier: 3, sellPrice: 150, xpReward: 160 },
        { name: '🧵 Filament', key: 'filament', icon: '🧵', req: '5 🟡', costVal: 5, resKey: 'plastic', binId: 'plastic', tier: 1, sellPrice: 40, xpReward: 45 },
        { name: '🧱 Brick', key: 'plastic_brick', icon: '🧱', req: '10 🟡', costVal: 10, resKey: 'plastic', binId: 'plastic', tier: 2, sellPrice: 90, xpReward: 100 },
        { name: '🧪 Pipe', key: 'pipe', icon: '🧪', req: '15 🟡', costVal: 15, resKey: 'plastic', binId: 'plastic', tier: 3, sellPrice: 150, xpReward: 160 }
    ];

    class MainScene extends Phaser.Scene {
        constructor() { super({ key: 'MainScene' }); }

        init() {
            this.state = {
                money: 20,
                xp: 0,
                level: 1,
                skillPoints: 0,
                unlockedRecipes: {
                    fertilizer: false,
                    paper_bundle: false,
                    plastic_pellets: false,
                    crushed_cullet: false
                },
                perkLuckyGate: false,
                perkLuckyBelt: false,
                sessionSeconds: 0,
                totalQuestsCompleted: 0,
                questTokens: 0,

                // Facility Stats
                g1Fee: 1,
                bagValue: 1,
                doubleTrashChance: 0.00,
                doubleTokenChance: 0.00,
                maxTrashQueue: Infinity, // Conveyor displays 10 visible items with permanent overflow queue buffer!

                // Streak System (Dumpster fire removed)
                streak: 0,
                streakHighScore: 0,
                streakTimer: 0,

                // Customer Arrival Settings (Fast original arrival rate: 85% every 1000ms)
                customerSpawnChance: 0.85,
                spawnDelay: 1000,
                excessTrashCount: 0,
                factoryUnlocked: false,

                // Automation Timers & Pauses
                isGateAuto: false,
                autoGateSpeed: 5000,
                autoGateTimer: 0,
                autoGatePaused: false,
                unlockedAutoSort: false,
                autoSortDelay: 8000,
                autoSortTimer: 0,
                autoSortPaused: false,
                busRushPaused: false,

                // Sanitiser Station Stats (5s cooldown)
                unlockedSanitiser: false,
                sanitiserCooldown: 0,
                sanitiserMaxCooldown: 5000,
                petCooldowns: {},

                // Pet Queue Helpers
                pets: {
                    dog: false,        // Paper (Blue)
                    chicken: false,    // Organic (Green)
                    turtle: false,     // Plastic (Yellow)
                    flashlight: false, // Glass (Purple)
                    cat: false,        // Fabric (Pink)
                    magnet: false      // Metal (Gray)
                },

                // Rubbish Types Active/Unlocked
                unlockedTypes: {
                    metal: false,
                    fabric: false
                },
                activeTypes: {
                    organic: true,
                    paper: true,
                    glass: true,
                    plastic: true,
                    metal: false,
                    fabric: false
                },

                // Bus Rush Stats
                busRushUnlocked: true,
                busRushInterval: 25000,

                // Upgrades Tracker
                upgrades: {
                    gateFee: { lvl: 0, max: 10, cost: 2, reqLvl: 1 },
                    footTraffic: { lvl: 0, max: 7, cost: 5, reqLvl: 2 },
                    gateAuto: { lvl: 0, max: 8, cost: 10, reqLvl: 1 },
                    doubleTrash: { lvl: 0, max: 5, cost: 4, reqLvl: 2 },
                    busRush: { lvl: 0, max: 5, cost: 15, reqLvl: 4 },

                    queueCap: { lvl: 0, max: 0, cost: 0, reqLvl: 1 },
                    doubleToken: { lvl: 0, max: 6, cost: 8, reqLvl: 2 },
                    sanitiser: { lvl: 0, max: 1, cost: 5, reqLvl: 2 },
                    autoSort: { lvl: 0, max: 8, cost: 20, reqLvl: 2 },

                    // Pets Upgrades
                    petDog: { lvl: 0, max: 1, cost: 12, reqLvl: 2 },
                    petChicken: { lvl: 0, max: 1, cost: 12, reqLvl: 2 },
                    petTurtle: { lvl: 0, max: 1, cost: 15, reqLvl: 2 },
                    petFlashlight: { lvl: 0, max: 1, cost: 15, reqLvl: 3 },
                    petCat: { lvl: 0, max: 1, cost: 20, reqLvl: 3 },
                    petMagnet: { lvl: 0, max: 1, cost: 20, reqLvl: 3 },

                    // Type Unlock Upgrades
                    unlockMetal: { lvl: 0, max: 1, cost: 25, reqLvl: 3 },
                    unlockFabric: { lvl: 0, max: 1, cost: 25, reqLvl: 3 }
                },

                // Bin Upgrades
                binUpgrades: {
                    organic: { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    paper:   { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    glass:   { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    plastic: { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    metal:   { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 2, reqLvlShop: 2 },
                    fabric:  { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 2, reqLvlShop: 2 }
                },

                // Tutorial State
                tutorial: {
                    active: false,
                    step: 0,
                    visitedCategoriesSet: new Set(),
                    interactionMethod: 'drag'
                },

                // Facilities Unlocked
                unlockedWorkshopsFacility: false,

                // Decorations
                hasGrass: false,
                hasTrees: false,
                hasBunting: false,
                hasFairyLights: false,
                hasDiamonds: false,

                // Color Tokens & Crafted Items
                resources: { organic: 0, paper: 0, glass: 0, plastic: 0, metal: 0, fabric: 0 },
                crafted: {
                    fertilizer: 0, biofuel: 0, compost: 0,
                    recycled_paper: 0, cardboard: 0, notebook: 0,
                    glass_vase: 0, mirror: 0, lens: 0,
                    filament: 0, plastic_brick: 0, pipe: 0,
                    paper_bundle: 0, plastic_pellets: 0, crushed_cullet: 0
                },

                // Arcade Challenges Highscores
                arcadeBestStreak: 0,
                arcadeBestCleanupTime: null
            };

            this.trashQueue = [];
            this.customerQueue = [];
            this.shopCustomers = []; // Up to 3 walking meadow customers
            this.currentCustomer = null;
            this.customerCooldown = 0;
            this.craftingConveyor = [];
            this.currentCraftJob = null;
            this.activeModal = null;
            this.activeUpgradeCategory = 'gate';
            this.binsSubmenuOpen = true;

            this.pressTimer = null;
            this.isHolding = false;
            this.layoutRebuildPending = false;
            this.draggedItem = null;
            this.wrongBinTipShake = 0;
            this.pulsePhase = false;

            this.clouds = [];
            this.activeBuses = [];
            this.activeBusContainer = null;
            this.arcadeState = {
                active: false,
                mode: null,
                streak: 0,
                streakTimer: 0,
                streakMax: 3500,
                cleanupRemaining: 500,
                cleanupElapsed: 0,
                queue: [],
                gameOver: false
            };

            const origAddText = this.add.text.bind(this.add);
            this.add.text = (x, y, text, style) => {
                const s = Object.assign({
                    fontFamily: "'Outfit', 'Segoe UI', system-ui, -apple-system, sans-serif"
                }, style);

                // High-DPI Ultra Sharp Text: 3x-4x high-DPI canvas buffer prevents any fuzziness
                if (!s.resolution) {
                    s.resolution = Math.max(3, Math.ceil(window.devicePixelRatio || 1) * 2);
                }

                // Fix Phaser bug: Phaser uses fontStyle ('bold'), ignoring style ('bold')
                if (s.style && !s.fontStyle) {
                    s.fontStyle = s.style;
                }

                // Fix fuzzy subpixel font sizes on canvas (e.g. 10.5px -> 11px, 11.5px -> 12px)
                if (s.fontSize && typeof s.fontSize === 'string') {
                    s.fontSize = s.fontSize.replace(/(\d+)\.\d+px/, (match, p1) => (parseInt(p1, 10) + 1) + 'px');
                }

                if (!s.fontFamily || s.fontFamily === 'Courier' || s.fontFamily === 'monospace') {
                    s.fontFamily = "'Outfit', 'Segoe UI', system-ui, -apple-system, sans-serif";
                }

                // Prevent edge glyph clipping on small labels & icons
                if (!s.padding) {
                    s.padding = { x: 3, y: 2 };
                }

                const txtObj = origAddText(Math.round(x), Math.round(y), text, s);

                // Pixel-snapping hooks: Snap origin offsets to exact whole integer screen pixels!
                // This eliminates fractional pixel boundary blur (the root cause of fuzzy centered labels)
                const origSetOrigin = txtObj.setOrigin.bind(txtObj);
                txtObj.setOrigin = function(ox, oy) {
                    origSetOrigin(ox, oy);
                    this.displayOriginX = Math.round(this.displayOriginX);
                    this.displayOriginY = Math.round(this.displayOriginY);
                    return this;
                };

                const origSetText = txtObj.setText.bind(txtObj);
                txtObj.setText = function(val) {
                    origSetText(val);
                    this.displayOriginX = Math.round(this.displayOriginX);
                    this.displayOriginY = Math.round(this.displayOriginY);
                    return this;
                };

                return txtObj;
            };
        }

        preload() {
            this.createPlaceholderTextures();

            // Register Base64 textures
            Object.entries(RUBBISH_SPRITES).forEach(([key, b64Data]) => {
                this.textures.addBase64(key, b64Data);
            });
        }

        createPlaceholderTextures() {
            const makeRect = (key, color, w = 40, h = 40) => {
                const gfx = this.make.graphics({ x: 0, y: 0, add: false });
                gfx.fillStyle(color, 1);
                gfx.fillRect(0, 0, w, h);
                gfx.generateTexture(key, w, h);
            };

            makeRect('person', 0xe91e63, 22, 38);
            makeRect('bag', 0x222222, 14, 18);
            makeRect('gate', 0x795548, 65, 65);
            makeRect('tip', 0x8d6e63, 65, 65);
            makeRect('bin_green', TRASH_TYPES.organic.color, 48, 48);
            makeRect('bin_blue', TRASH_TYPES.paper.color, 48, 48);
            makeRect('bin_purple', TRASH_TYPES.glass.color, 48, 48);
            makeRect('bin_yellow', TRASH_TYPES.plastic.color, 48, 48);
            makeRect('bin_metal', TRASH_TYPES.metal.color, 48, 48);
            makeRect('bin_fabric', TRASH_TYPES.fabric.color, 48, 48);

            // Distinct procedural item icons for metal and fabric
            const makeItemIcon = (key, drawFn) => {
                const gfx = this.make.graphics({ x: 0, y: 0, add: false });
                drawFn(gfx);
                gfx.generateTexture(key, 48, 48);
            };

            makeItemIcon('rubbish_metal_can', (gfx) => {
                gfx.fillStyle(0xb0bec5, 1);
                gfx.fillRoundedRect(10, 6, 28, 36, 6);
                gfx.fillStyle(0xe0e0e0, 1);
                gfx.fillRect(14, 10, 8, 28);
                gfx.lineStyle(2, 0x455a64, 1);
                gfx.strokeRoundedRect(10, 6, 28, 36, 6);
            });

            makeItemIcon('rubbish_fabric_cloth', (gfx) => {
                gfx.fillStyle(0xec407a, 1);
                gfx.fillRoundedRect(8, 8, 32, 32, 6);
                gfx.lineStyle(2, 0x880e4f, 1);
                gfx.strokeRoundedRect(8, 8, 32, 32, 6);
                gfx.lineStyle(1.5, 0xffffff, 0.7);
                gfx.lineBetween(14, 14, 34, 34);
                gfx.lineBetween(14, 34, 34, 14);
            });
        }

        create() {
            this.scale.on('resize', this.handleResize, this);

            // Immediate, responsive touch & mouse dragging
            this.input.dragDistanceThreshold = 0;
            this.input.dragTimeThreshold = 0;
            this.input.topOnly = true;

            // Safely recover from interrupted touch gestures (edge swipes, OS overlays, pointer leaving canvas)
            this.input.on('pointerupoutside', () => {
                if (this.draggedItem) this.cancelActiveDrag();
            });
            this.input.on('gameout', () => {
                if (this.draggedItem && this.input.activePointer && !this.input.activePointer.isDown) {
                    this.cancelActiveDrag();
                }
            });
            if (typeof window !== 'undefined') {
                window.addEventListener('pointercancel', () => {
                    if (this.draggedItem) this.cancelActiveDrag();
                });
            }

            // Register bin spritesheets & animations reliably using browser Image
            const registerBinSheet = (sheetKey, animKey, b64Data) => {
                if (!b64Data) return;
                const img = new Image();
                img.onload = () => {
                    try {
                        if (this.textures.exists(sheetKey)) {
                            this.textures.remove(sheetKey);
                        }
                        this.textures.addSpriteSheet(sheetKey, img, {
                            frameWidth: BIN_SPRITE_CONFIG.frameWidth,
                            frameHeight: BIN_SPRITE_CONFIG.frameHeight
                        });
                        if (this.anims.exists(animKey)) {
                            this.anims.remove(animKey);
                        }
                        this.anims.create({
                            key: animKey,
                            frames: this.anims.generateFrameNumbers(sheetKey, { frames: [0, 1, 2, 3, 4, 3, 2, 1, 0] }),
                            frameRate: BIN_SPRITE_CONFIG.animFrameRate,
                            repeat: 0
                        });
                        if (this.bins) {
                            const bObj = this.bins.find(b => b.sheetKey === sheetKey);
                            if (bObj && bObj.sprite && bObj.sprite.scene) {
                                bObj.sprite.setTexture(sheetKey, 0);
                                bObj.sprite.setOrigin(0.5, 1);
                                bObj.sprite.setScale(bObj.baseScale || this.currentBinSpriteScale || BIN_SPRITE_CONFIG.scale);
                            }
                        }
                    } catch (err) {
                        console.warn('Error slicing bin spritesheet:', err);
                    }
                };
                img.src = b64Data;
            };

            registerBinSheet('bin_green_sheet', 'bin_green_anim', GREEN_BINS_B64);
            registerBinSheet('bin_blue_sheet', 'bin_blue_anim', BLUE_BINS_B64);
            registerBinSheet('bin_purple_sheet', 'bin_purple_anim', PURPLE_BINS_B64);
            registerBinSheet('bin_yellow_sheet', 'bin_yellow_anim', YELLOW_BINS_B64);

            // Create gentle clouds
            this.initClouds();

            this.buildLayout();

            for (let i = 0; i < 2; i++) this.spawnCustomer();

            // 1 Second Ticker
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.state.sessionSeconds++;
                    if (this.state.sanitiserCooldown > 0) {
                        this.state.sanitiserCooldown = Math.max(0, this.state.sanitiserCooldown - 1000);
                    }
                    if (this.state.petCooldowns) {
                        Object.keys(this.state.petCooldowns).forEach(k => {
                            if (this.state.petCooldowns[k] > 0) {
                                this.state.petCooldowns[k] = Math.max(0, this.state.petCooldowns[k] - 1000);
                            }
                        });
                    }
                    this.updateToolbarCooldownsUI();
                    this.updateUI();
                },
                loop: true
            });

            // Keyboard Shortcuts
            this.input.keyboard.on('keydown', (e) => {
                if (this.arcadeState && this.arcadeState.active) {
                    if (['1','2','3','4','5','6'].includes(e.key)) {
                        if (e.repeat) return;
                        const typeMap = { '1': 'organic', '2': 'paper', '3': 'glass', '4': 'plastic', '5': 'metal', '6': 'fabric' };
                        const chosen = typeMap[e.key];
                        if (chosen) this.sortArcadeTrash(chosen);
                    } else if (e.code === 'Space') {
                        if (e.repeat) return;
                        if (this.arcadeState.queue && this.arcadeState.queue.length > 0) {
                            this.sortArcadeTrash(this.arcadeState.queue[0].type);
                        }
                    } else if (e.code === 'Escape') {
                        this.exitArcade();
                    }
                    return;
                }

                if (['1','2','3','4','5','6'].includes(e.key)) {
                    const typeMap = { '1': 'organic', '2': 'paper', '3': 'glass', '4': 'plastic', '5': 'metal', '6': 'fabric' };
                    const chosen = typeMap[e.key];
                    if (chosen && this.state.activeTypes[chosen]) {
                        this.sortHeadTrash(chosen, 0);
                    }
                } else if (e.code === 'Space') {
                    // Require discrete presses instead of holding Space to bypass auto-gate
                    if (e.repeat) return;
                    this.triggerGate();
                } else if (e.code === 'KeyV' || e.key === 'v' || e.key === 'V') {
                    if (e.repeat) return;
                    this.triggerSanitiseAction();
                } else if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
                    if (e.repeat) return;
                    this.cashInActiveBus();
                }
            });

            // Prevent Phaser from auto-pausing on blur/hidden for genuine idle/AFK execution
            if (this.game) {
                if (this.game.events) {
                    this.game.events.off(Phaser.Core.Events.HIDDEN);
                    this.game.events.off(Phaser.Core.Events.BLUR);
                }
                this.game.onHidden = function() {};
                this.game.onBlur = function() {};
                if (this.game.loop) {
                    this.game.loop.pause = function() {};
                }
            }

            // Centralized Real-Time Simulation Clock with unthrottled Web Worker Heartbeat
            this.lastTickTime = Date.now();
            if (typeof window !== 'undefined') {
                if (this.bgWorker) {
                    try { this.bgWorker.terminate(); } catch (e) {}
                    this.bgWorker = null;
                }
                if (this.afkInterval) clearInterval(this.afkInterval);

                const onHeartbeat = () => {
                    const now = Date.now();
                    const dt = Math.max(0, now - (this.lastTickTime || now));
                    if (dt >= 120) {
                        this.lastTickTime = now;
                        this.tickGameSimulation(dt);
                    }
                };

                let workerStarted = false;
                try {
                    const workerBlob = new Blob([
                        'var timer = null;' +
                        'self.onmessage = function(e) {' +
                        '  if (e.data === "start") {' +
                        '    if (timer) clearInterval(timer);' +
                        '    timer = setInterval(function() { self.postMessage("tick"); }, 200);' +
                        '  } else if (e.data === "stop") {' +
                        '    if (timer) clearInterval(timer); timer = null;' +
                        '  }' +
                        '};'
                    ], { type: 'application/javascript' });
                    this.bgWorker = new Worker(URL.createObjectURL(workerBlob));
                    this.bgWorker.onmessage = (e) => {
                        if (e.data === 'tick') onHeartbeat();
                    };
                    this.bgWorker.postMessage('start');
                    workerStarted = true;
                } catch (err) {
                    workerStarted = false;
                }

                if (!workerStarted) {
                    this.afkInterval = setInterval(onHeartbeat, 150);
                }

                window.addEventListener('focus', () => {
                    const now = Date.now();
                    const dt = Math.max(0, now - (this.lastTickTime || now));
                    this.lastTickTime = now;
                    if (this.arcadeState && this.arcadeState.active) {
                        this.updateArcade();
                        return;
                    }
                    if (dt > 100) {
                        this.tickGameSimulation(dt);
                    }
                    this.repositionCustomerQueue();
                    this.renderHorizontalQueue();
                    this.updateUI();
                });
            }

            // Bus Rush Event Loop with frequency tracking
            this.scheduleBusRush();

            // Pulsing Indicators Loop
            this.time.addEvent({
                delay: 500,
                callback: () => {
                    this.pulsePhase = !this.pulsePhase;
                    this.updateIndicators();
                },
                loop: true
            });
        }

        initClouds() {
            if (this.clouds && this.clouds.length > 0) {
                this.clouds.forEach(c => { if (c && c.destroy) c.destroy(); });
            }
            this.clouds = [];
            const w = this.scale.width || 800;
            const h = this.scale.height || 600;
            const isMobile = (h > w && w < 600) || w < 520;
            const splitY = this.splitY || (Math.round(h * 0.50) - 44);

            for (let i = 0; i < 4; i++) {
                const cx = (w / 4) * i + Phaser.Math.Between(-30, 30);
                let cy;
                if (isMobile) {
                    // On mobile, render clouds in the clear sky band below the wallet and top nav buttons (~128-140)
                    // and comfortably above the meadow horizon (splitY)
                    const minCloudY = 142;
                    const maxCloudY = Math.max(minCloudY + 15, splitY - 55);
                    cy = Phaser.Math.Between(minCloudY, maxCloudY);
                } else {
                    cy = Phaser.Math.Between(24, Math.min(85, splitY - 50));
                }
                const cloud = this.add.graphics().setDepth(1);
                cloud.fillStyle(0xffffff, 0.60);
                cloud.fillCircle(0, 0, 22);
                cloud.fillCircle(18, -6, 18);
                cloud.fillCircle(36, 0, 20);
                cloud.fillRoundedRect(-12, 6, 62, 14, 7);
                cloud.x = cx;
                cloud.y = cy;
                cloud.speed = 0.015 + (i * 0.006);
                this.clouds.push(cloud);
            }
        }

        scheduleBusRush() {
            const delay = this.state.busRushInterval || 25000;
            this.time.delayedCall(delay, () => {
                const inArcade = !!(this.arcadeState && this.arcadeState.active);
                if (!inArcade && this.state.busRushUnlocked && !this.state.busRushPaused && Math.random() < 0.65) {
                    this.triggerBusRushEvent();
                }
                this.scheduleBusRush();
            });
        }

        update(time, delta) {
            const now = Date.now();
            const dt = Math.max(0, Math.min(2000, now - (this.lastTickTime || now)));
            this.lastTickTime = now;
            this.tickGameSimulation(dt);

            if (this.clouds && this.clouds.length > 0) {
                const w = this.scale.width || 800;
                this.clouds.forEach(c => {
                    c.x += (c.speed || 0.02) * delta;
                    if (c.x > w + 80) c.x = -80;
                });
            }

            if (this.activeModal === 'upgrades') {
                const curM = this.state.money;
                const curSP = this.state.skillPoints || 0;
                if (curM !== this.lastModalMoney || curSP !== this.lastModalSP) {
                    this.lastModalMoney = curM;
                    this.lastModalSP = curSP;
                    if (this.modalWalletTxt) this.modalWalletTxt.setText('$' + curM + ' | ⭐' + curSP + ' SP');
                    this.refreshUpgradeModalAffordances();
                }
            }

            if (this.arcadeState && this.arcadeState.active) {
                this.updateArcade();
            }
        }

        tickGameSimulation(dt) {
            if (!this.state) return;
            if (this.arcadeState && this.arcadeState.active) {
                // Keep arcade timers running on real wall-clock time even when tab is hidden
                this.updateArcade();
                return;
            }

            // 1. Customer Arrivals (Original fast rate: 85% every 1000ms)
            this.spawnAccumulator = (this.spawnAccumulator || 0) + dt;
            const sDelay = this.state.spawnDelay || 1000;
            while (this.spawnAccumulator >= sDelay) {
                this.spawnAccumulator -= sDelay;
                if (Math.random() < this.state.customerSpawnChance) {
                    if (this.customerQueue.length < 8) {
                        this.spawnCustomer();
                    }
                }
            }

            // 2. Auto-Gate System (Checks autoGatePaused toggle)
            if (this.state.isGateAuto && !this.state.autoGatePaused) {
                this.state.autoGateTimer = (this.state.autoGateTimer || 0) + dt;
                while (this.state.autoGateTimer >= this.state.autoGateSpeed && this.customerQueue.length > 0) {
                    this.state.autoGateTimer -= this.state.autoGateSpeed;
                    this.triggerGate();
                }
                if (this.customerQueue.length === 0 && this.state.autoGateTimer > this.state.autoGateSpeed) {
                    this.state.autoGateTimer = this.state.autoGateSpeed;
                }
                const progress = Math.min(1, this.state.autoGateTimer / this.state.autoGateSpeed);
                this.drawAutoGateProgress(progress);
            } else {
                this.drawAutoGateProgress(0);
            }

            // 3. Auto-Sort System (pulls from excess queue items beyond visible 10)
            const hasExcess = (this.state.excessTrashCount || 0) > 0;
            const canAutoSort = this.state.unlockedAutoSort && !this.state.autoSortPaused && hasExcess;
            if (canAutoSort) {
                const isHidden = (typeof document !== 'undefined') && (document.hidden || document.visibilityState === 'hidden');
                this.state.autoSortTimer = (this.state.autoSortTimer || 0) + dt;
                let autoSortedVisualCount = 0;
                while (this.state.autoSortTimer >= this.state.autoSortDelay && (this.state.excessTrashCount || 0) > 0) {
                    this.state.autoSortTimer -= this.state.autoSortDelay;
                    this.state.excessTrashCount--;
                    const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
                    const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
                    const mult = (Math.random() < this.state.doubleTokenChance) ? 2 : 1;
                    this.state.resources[typeKey] += mult;
                    this.state.money += 1;

                    // Floating "+1 Glass" / "+2 Green" feedback on Auto-Sort (capped per tick for AFK catchup)
                    if (!isHidden && autoSortedVisualCount < 3) {
                        autoSortedVisualCount++;
                        const tData = TRASH_TYPES[typeKey] || { name: typeKey, colorHex: '#00e676' };
                        const shortName = typeKey === 'plastic' ? 'Plastic' : tData.name;
                        const targetBin = this.bins && this.bins.find(b => b.id === typeKey);
                        const popX = targetBin ? targetBin.x : ((this.overflowBlockContainer && this.overflowBlockContainer.visible) ? this.overflowBlockContainer.x : (this.scale.width / 2));
                        const popY = targetBin ? (targetBin.y - 26) : ((this.queueY || 300) - 24);
                        const popTxt = this.add.text(popX, popY, '🤖 +' + mult + ' ' + shortName, {
                            fontSize: '12px', style: 'bold', color: tData.colorHex || '#00e676',
                            stroke: '#000000', strokeThickness: 3
                        }).setOrigin(0.5).setDepth(35);
                        const cleanPop = () => { if (popTxt && popTxt.active) popTxt.destroy(); };
                        setTimeout(cleanPop, 1000);
                        if (this.tweens && this.tweens.add) {
                            this.tweens.add({ targets: popTxt, y: popY - 30, alpha: 0, duration: 850, onComplete: cleanPop });
                        } else {
                            cleanPop();
                        }
                    }

                    this.renderHorizontalQueue();
                }
                const sortProgress = Math.min(1, this.state.autoSortTimer / this.state.autoSortDelay);
                this.drawAutoSortProgress(sortProgress);
            } else {
                this.drawAutoSortProgress(0);
            }

            // 4. Streak Timer & Bar
            if (this.state.streakTimer > 0) {
                this.state.streakTimer = Math.max(0, this.state.streakTimer - dt);
                if (this.state.streakTimer <= 0) {
                    this.state.streak = 0;
                    this.state.dumpsterFireActive = false;
                }
            }
            this.renderDumpsterFireBar();

            // 5. Queue Abilities Cooldown (Sanitiser & Pet Sweeps)
            if (this.state.sanitiserCooldown > 0) {
                this.state.sanitiserCooldown = Math.max(0, this.state.sanitiserCooldown - dt);
            }
            if (this.state.petCooldowns) {
                Object.keys(this.state.petCooldowns).forEach(k => {
                    if (this.state.petCooldowns[k] > 0) {
                        this.state.petCooldowns[k] = Math.max(0, this.state.petCooldowns[k] - dt);
                    }
                });
            }
            this.updateToolbarCooldownsUI();

            // 6. Meadow Shop Customer Replenishment (Up to 3 in line above horizon)
            this.shopCustTimer = (this.shopCustTimer || 0) + dt;
            if (this.shopCustTimer >= 2000) {
                this.shopCustTimer = 0;
                if (!this.shopCustomers || this.shopCustomers.length < 3) {
                    this.spawnShopCustomer(false);
                }
            }

            // 7. Ensure waiting customers stay visibly on screen and never freeze
            if (this.customerQueue && this.customerQueue.length > 0) {
                const firstCust = this.customerQueue[0];
                if (firstCust && firstCust.x < 10 && (!this.tweens || !this.tweens.isTweening(firstCust))) {
                    this.repositionCustomerQueue();
                }
            }

            this.updateUI();
        }

        renderDumpsterFireBar() {
            const hasStreakLine = (this.state && this.state.streak >= 5 && this.state.streakTimer > 0);
            const is2XActive = (this.state && this.state.streak >= 10 && this.state.streakTimer > 0);

            // Always update streak text (so high score is permanently visible!)
            if (this.dumpsterStreakText) {
                let streakLabel = '🔥 STREAK: ' + this.state.streak;
                if (is2XActive) {
                    streakLabel = '🔥 2X STREAK: ' + this.state.streak + ' (2X BONUS!)';
                }
                this.dumpsterStreakText.setText(streakLabel + '  |  BEST: ' + this.state.streakHighScore);
                this.dumpsterStreakText.setColor(is2XActive ? '#ff5722' : (hasStreakLine ? '#ffca28' : '#9ca3af'));
                this.dumpsterStreakText.setVisible(true);
            }

            if (!this.dumpsterBarGfx || !this.dumpsterStreakText) return;
            this.dumpsterBarGfx.clear();

            // The streak line is ONLY supposed to show if streak is 5 or more!
            if (!hasStreakLine) return;

            // Center streak timer bar directly below the streak badge
            const barW = Math.min(160, Math.max(110, (this.scale ? this.scale.width : 360) - 40));
            const barH = 5;
            const barX = this.dumpsterStreakText.x - (barW / 2);
            const barY = this.dumpsterStreakText.y + 11;

            // Background slot
            this.dumpsterBarGfx.fillStyle(0x1f2937, 0.9);
            this.dumpsterBarGfx.fillRoundedRect(barX, barY, barW, barH, 3);
            this.dumpsterBarGfx.lineStyle(1, 0x475569, 0.8);
            this.dumpsterBarGfx.strokeRoundedRect(barX, barY, barW, barH, 3);

            const ratio = Math.min(1, Math.max(0, this.state.streakTimer / 2000));
            const currentWidth = Math.max(4, barW * ratio);

            let colorHex = 0x22c55e;
            if (this.state.streak >= 10) colorHex = 0xff3d00;
            else if (ratio < 0.35) colorHex = 0xef4444;
            else if (ratio < 0.65) colorHex = 0xf59e0b;

            this.dumpsterBarGfx.fillStyle(colorHex, 1);
            this.dumpsterBarGfx.fillRoundedRect(barX, barY, currentWidth, barH, 3);
        }

        spawnCustomer() {
            if (this.customerQueue.length >= 8) return;

            const personSprite = this.add.sprite(0, 0, 'person');
            const bagSprite = this.add.sprite(0, 10, 'bag');

            const customerContainer = this.add.container(-25, this.gatePos ? this.gatePos.y : 600, [personSprite, bagSprite]).setDepth(15);
            if (this.mainContainer) this.mainContainer.add(customerContainer);
            this.customerQueue.push(customerContainer);
            this.repositionCustomerQueue();
        }

        repositionCustomerQueue() {
            if (!this.gatePos || !this.customerQueue) return;
            const count = this.customerQueue.length;
            const width = (this.scale && this.scale.width) ? this.scale.width : (window.innerWidth || 800);
            const height = (this.scale && this.scale.height) ? this.scale.height : (window.innerHeight || 600);
            const isMobile = (height > width && width < 640) || width < 560;
            const gateSz = this.currentGateSize || 62;
            const custScale = this.layoutMetrics ? this.layoutMetrics.gateScale : 1;

            // Customer 0 stands on the left outside the gate entrance
            const gateOffset = Math.round(gateSz * 0.5) + (isMobile ? 16 : 20);
            const startX = this.gatePos.x - gateOffset;
            const minMargin = (this.layoutMetrics ? this.layoutMetrics.safeLeft : 0) + (isMobile ? 14 : 18);
            const availableW = Math.max(50, startX - minMargin);
            const maxSpacing = isMobile ? 22 : 28;
            const spacing = count > 1 ? Math.min(maxSpacing, availableW / (count - 1)) : maxSpacing;

            const isHidden = (typeof document !== 'undefined') && (document.hidden || document.visibilityState === 'hidden');

            this.customerQueue.forEach((cust, idx) => {
                if (!cust || !cust.scene) return;
                const targetX = Math.round(startX - (idx * spacing));
                cust.setAlpha(1);
                cust.setVisible(true);
                cust.setScale(custScale);
                cust.setDepth(15 + (count - idx));

                if (!isHidden && this.tweens) {
                    this.tweens.killTweensOf(cust);
                    const dist = Math.abs(cust.x - targetX);
                    const duration = Math.min(260, Math.max(80, Math.round(dist * 0.9)));
                    this.tweens.add({
                        targets: cust,
                        x: targetX,
                        y: this.gatePos.y,
                        duration: duration,
                        ease: 'Power1'
                    });
                } else {
                    if (this.tweens) this.tweens.killTweensOf(cust);
                    cust.x = targetX;
                    cust.y = this.gatePos.y;
                }
            });
        }

        triggerGate() {
            if (this.arcadeState && this.arcadeState.active) return;
            const isHidden = (typeof document !== 'undefined') && (document.hidden || document.visibilityState === 'hidden');

            if (!this.customerQueue || this.customerQueue.length === 0) {
                if (!isHidden && this.gatePos) {
                    const cleanTxt = this.add.text(this.gatePos.x, this.gatePos.y - 30, '✨ ALL CLEAN! (No Queue)', {
                        fontSize: '11px', style: 'bold', color: '#38bdf8', backgroundColor: '#0f172a', padding: 4
                    }).setOrigin(0.5).setDepth(20);
                    const cleanClean = () => { if (cleanTxt && cleanTxt.active) cleanTxt.destroy(); };
                    setTimeout(cleanClean, 1000);
                    if (this.tweens && this.tweens.add) {
                        this.tweens.add({ targets: cleanTxt, y: cleanTxt.y - 25, alpha: 0, duration: 750, onComplete: cleanClean });
                    } else {
                        cleanClean();
                    }
                }
                return;
            }

            const cust = this.customerQueue.shift();
            
            this.state.money += this.state.g1Fee;
            let trashGained = 1;
            if (Math.random() < this.state.doubleTrashChance) trashGained = 2;

            for (let i = 0; i < trashGained; i++) {
                this.addTrashToConveyor();
            }

            if (!isHidden) {
                const popTxt = this.add.text(this.gatePos.x, this.gatePos.y - 30, '+$' + this.state.g1Fee + ' | +' + trashGained + ' Rubbish', {
                    fontSize: '13px', style: 'bold', color: '#00ff00'
                }).setOrigin(0.5).setDepth(20);

                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: popTxt,
                        y: popTxt.y - 35,
                        alpha: 0,
                        duration: 900,
                        onComplete: () => popTxt.destroy()
                    });

                    this.tweens.add({
                        targets: cust,
                        y: cust.y + 28,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => cust.destroy()
                    });
                } else {
                    popTxt.destroy();
                    cust.destroy();
                }
            } else {
                if (cust && cust.destroy) cust.destroy();
            }

            this.repositionCustomerQueue();
            this.updateUI();
        }

        addTrashToConveyor(forcedMult = null) {
            if (this.trashQueue.length < 10) {
                const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
                const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
                const typeData = TRASH_TYPES[typeKey];
                const itemName = typeData.items[Math.floor(Math.random() * typeData.items.length)];

                let startMult = forcedMult;
                if (!startMult) {
                    startMult = (Math.random() < this.state.doubleTokenChance) ? 2 : 1;
                }

                const container = this.createItemGraphic(typeData.id, itemName, startMult);
                container.setPosition(this.gatePos ? this.gatePos.x : 100, this.gatePos ? this.gatePos.y : 500);

                this.trashQueue.push({
                    container: container,
                    type: typeData.id,
                    multiplier: startMult,
                    spriteKey: container ? container.spriteKey : null
                });
            } else {
                // Excess items: raw count only! Sprite, type, and tokens are calculated ONLY when entering visible queue!
                this.state.excessTrashCount = (this.state.excessTrashCount || 0) + 1;
            }

            this.renderHorizontalQueue();
            this.updateUI();
        }

        fillQueueFromExcess() {
            while (this.trashQueue.length < 10 && (this.state.excessTrashCount || 0) > 0) {
                this.state.excessTrashCount--;
                const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
                const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
                const typeData = TRASH_TYPES[typeKey];
                const itemName = typeData.items[Math.floor(Math.random() * typeData.items.length)];
                const startMult = (Math.random() < this.state.doubleTokenChance) ? 2 : 1;
                const container = this.createItemGraphic(typeData.id, itemName, startMult);
                const itemIdx = this.trashQueue.length;
                container.setPosition(this.getQueueSlotX(itemIdx), this.queueY);

                this.trashQueue.push({
                    container: container,
                    type: typeData.id,
                    multiplier: startMult,
                    spriteKey: container ? container.spriteKey : null
                });
            }
        }

        updateSanitiserBtnUI() {
            this.updateToolbarCooldownsUI();
        }

        updateToolbarCooldownsUI() {
            if (!this.activeToolbarButtons || this.activeToolbarButtons.length === 0) return;
            const maxCd = 5000;
            this.activeToolbarButtons.forEach(act => {
                if (!act.fillGfx || !act.bgGfx || !act.fillGfx.scene) return;
                const cd = act.type === 'sanitiser' ? (this.state.sanitiserCooldown || 0) : ((this.state.petCooldowns && this.state.petCooldowns[act.targetType]) || 0);
                const btnSize = act.btnSize || 28;
                act.fillGfx.clear();
                act.bgGfx.clear();
                act.bgGfx.fillStyle(0x1e293b, 0.95);
                act.bgGfx.fillRoundedRect(0, 0, btnSize, btnSize, 6);

                if (cd > 0) {
                    const pct = Math.min(1, Math.max(0, cd / maxCd));
                    const cdH = Math.round(pct * btnSize);
                    act.fillGfx.fillStyle(0x000000, 0.65);
                    act.fillGfx.fillRoundedRect(0, btnSize - cdH, btnSize, cdH, 6);
                    act.bgGfx.lineStyle(1.5, 0x475569, 0.6);
                    act.bgGfx.strokeRoundedRect(0, 0, btnSize, btnSize, 6);
                } else {
                    act.bgGfx.lineStyle(2, 0x00e676, 1);
                    act.bgGfx.strokeRoundedRect(0, 0, btnSize, btnSize, 6);
                }
            });
        }

        triggerSanitiseAction() {
            if (!this.state.unlockedSanitiser || (this.state.sanitiserCooldown || 0) > 0 || this.trashQueue.length === 0) return;
            const headItem = this.trashQueue[0];
            if (this.draggedItem === headItem) this.cancelActiveDrag();
            const currentMult = headItem.multiplier || 1;

            if (currentMult < 4) {
                const newMult = (currentMult === 1) ? 2 : 4;
                headItem.multiplier = newMult;

                const fixedKey = headItem.spriteKey || (headItem.container && headItem.container.spriteKey);
                headItem.spriteKey = fixedKey;

                const newContainer = this.createItemGraphic(headItem.type, '', newMult, fixedKey);
                newContainer.setPosition(headItem.container.x, headItem.container.y);
                headItem.container.destroy();
                headItem.container = newContainer;

                this.state.sanitiserMaxCooldown = 5000;
                this.state.sanitiserCooldown = 5000;
                this.updateToolbarCooldownsUI();
                this.renderHorizontalQueue();
            }
        }

        triggerPetClean(typeId, petName) {
            if (!this.state.petCooldowns) this.state.petCooldowns = {};
            if ((this.state.petCooldowns[typeId] || 0) > 0) return;
            if (this.trashQueue.length === 0) return;
            const matchingIndices = [];
            this.trashQueue.forEach((item, idx) => {
                if (idx < 10 && item.type === typeId) matchingIndices.push(idx);
            });
            if (matchingIndices.length === 0) return;

            if (this.draggedItem && this.draggedItem.type === typeId) {
                this.cancelActiveDrag();
            }

            let totalTokens = 0;
            for (let i = matchingIndices.length - 1; i >= 0; i--) {
                const idx = matchingIndices[i];
                const item = this.trashQueue.splice(idx, 1)[0];
                const mult = item.multiplier || 1;
                totalTokens += mult;
                if (item.container) item.container.destroy();
            }

            this.state.resources[typeId] += totalTokens;
            this.addXP(totalTokens);

            // Trigger 5-second ability cooldown for this pet helper
            this.state.petCooldowns[typeId] = 5000;
            this.updateToolbarCooldownsUI();

            const targetBin = this.bins.find(b => b.id === typeId);
            const popX = targetBin ? targetBin.x : (this.scale.width / 2);
            const popY = targetBin ? (targetBin.y - 25) : 350;

            const pop = this.add.text(popX, popY, petName + ' CASHOUT! +' + totalTokens + ' ' + TRASH_TYPES[typeId].name, {
                fontSize: '12px', style: 'bold', color: TRASH_TYPES[typeId].colorHex || '#ffd700', backgroundColor: '#111', padding: 5
            }).setOrigin(0.5).setDepth(25);

            const cleanPop = () => { if (pop && pop.active) pop.destroy(); };
            setTimeout(cleanPop, 1200);
            if (this.tweens && this.tweens.add) {
                this.tweens.add({ targets: pop, y: pop.y - 35, alpha: 0, duration: 900, onComplete: cleanPop });
            } else {
                cleanPop();
            }

            this.fillQueueFromExcess();
            this.updateUI();
            this.renderHorizontalQueue();
        }

        cashInActiveBus() {
            if (!this.activeBuses) this.activeBuses = [];
            if (this.activeBusContainer && !this.activeBuses.includes(this.activeBusContainer)) {
                this.activeBuses.push(this.activeBusContainer);
            }
            const validBuses = this.activeBuses.filter(b => b && b.active && b.cashInHandler && !b.isCashedIn);
            if (validBuses.length === 0) return;
            // Front bus is the one furthest along the screen (highest x position travelling rightward)
            validBuses.sort((a, b) => b.x - a.x);
            const frontBus = validBuses[0];
            frontBus.cashInHandler();
        }

        requestLayoutRebuild() {
            if (this.layoutRebuildPending) return;
            this.layoutRebuildPending = true;
            this.time.delayedCall(40, () => {
                this.layoutRebuildPending = false;
                this.buildLayout();
            });
        }

        triggerTutorialStepFanfare(stepNumber) {
            const fanfareText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, '🎉 TUTORIAL STEP ' + stepNumber + ' COMPLETE! 🎉', {
                fontSize: '22px', style: 'bold', color: '#ffd700', backgroundColor: '#000000', padding: 14
            }).setOrigin(0.5).setDepth(60);

            if (this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: fanfareText,
                    y: fanfareText.y - 50,
                    scale: 1.25,
                    alpha: 0,
                    duration: 1900,
                    onComplete: () => fanfareText.destroy()
                });
            } else {
                fanfareText.destroy();
            }
        }

        triggerBusRushEvent() {
            if (this.state.busRushPaused) return;
            if (this.arcadeState && this.arcadeState.active) return;
            if (!this.activeBuses) this.activeBuses = [];
            // Cap at 3 concurrent buses
            const activeCount = this.activeBuses.filter(b => b && b.active && !b.isCashedIn).length;
            if (activeCount >= 3) return;

            const w = this.scale.width;
            const y = this.busY || (this.scale.height - 60);
            const busScale = this.busScale || 1;

            const busContainer = this.add.container(-140, y).setDepth(200).setScale(busScale);
            this.activeBusContainer = busContainer;
            this.activeBuses.push(busContainer);
            
            const busGfx = this.add.graphics();
            busGfx.fillStyle(0xff6f00, 1);
            busGfx.fillRoundedRect(-63, -22, 126, 44, 8);
            busGfx.lineStyle(3, 0xffeb3b, 1);
            busGfx.strokeRoundedRect(-63, -22, 126, 44, 8);

            // Windows
            busGfx.fillStyle(0x81d4fa, 1);
            busGfx.fillRoundedRect(-53, -14, 22, 14, 3);
            busGfx.fillRoundedRect(-27, -14, 22, 14, 3);
            busGfx.fillRoundedRect(-1, -14, 22, 14, 3);
            busGfx.fillRoundedRect(25, -14, 26, 14, 3);

            // Wheels
            busGfx.fillStyle(0x212121, 1);
            busGfx.fillCircle(-39, 22, 7);
            busGfx.fillCircle(39, 22, 7);

            const isMobileBus = (this.scale.height > this.scale.width && this.scale.width < 640) || this.scale.width < 560;
            const labelText = this.add.text(0, 9, isMobileBus ? '🚌 +10 (TAP)' : '🚌 +10 (TAP/B)', {
                fontSize: '11px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            busContainer.add([busGfx, labelText]);

            // Generous touch hit area (180px wide x 88px tall), perfectly centered directly on the 126x44 visual bus
            busContainer.setSize(180, 88);
            busContainer.setInteractive({
                useHandCursor: true
            });

            let busClicked = false;

            const handleCashIn = () => {
                if (busClicked || busContainer.isCashedIn) return;
                busClicked = true;
                busContainer.isCashedIn = true;

                for (let i = 0; i < 10; i++) {
                    this.addTrashToConveyor();
                }
                this.updateUI();

                const popX = Phaser.Math.Clamp(busContainer.x, 115, Math.max(115, this.scale.width - 115));
                const floatTxt = this.add.text(popX, busContainer.y - 24, '🚌 +10 RUBBISH ON CONVEYOR!', {
                    fontSize: isMobileBus ? '12px' : '15px', style: 'bold', color: '#ff9800', backgroundColor: '#000000', padding: 6
                }).setOrigin(0.5).setDepth(230);

                const removeBus = () => {
                    if (busContainer && busContainer.destroy) busContainer.destroy();
                    const rIdx = this.activeBuses.indexOf(busContainer);
                    if (rIdx !== -1) this.activeBuses.splice(rIdx, 1);
                    if (this.activeBusContainer === busContainer) {
                        this.activeBusContainer = this.activeBuses[0] || null;
                    }
                };

                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: floatTxt,
                        y: floatTxt.y - 45,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => floatTxt.destroy()
                    });

                    this.tweens.add({
                        targets: busContainer,
                        scale: 0.2,
                        alpha: 0,
                        duration: 250,
                        onComplete: removeBus
                    });
                } else {
                    floatTxt.destroy();
                    removeBus();
                }
            };

            busContainer.cashInHandler = handleCashIn;
            busContainer.on('pointerdown', handleCashIn);
            busContainer.on('pointerup', handleCashIn);

            // Bus cruises smoothly across screen over 12.5 seconds
            if (this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: busContainer,
                    x: w + 160,
                    duration: 12500,
                    onComplete: () => {
                        if (busContainer && busContainer.active) busContainer.destroy();
                        const rIdx = this.activeBuses.indexOf(busContainer);
                        if (rIdx !== -1) this.activeBuses.splice(rIdx, 1);
                        if (this.activeBusContainer === busContainer) {
                            this.activeBusContainer = this.activeBuses[0] || null;
                        }
                    }
                });
            }
        }

        getCurrentBuyerTokens(customer) {
            if (!customer || !customer.order) return 0;
            const o = customer.order;
            if (o.isCraftedItem) {
                return (this.state.crafted && this.state.crafted[o.itemKey]) || 0;
            }
            if (o.isRecipe) {
                const reqTokens = o.costTokens || {};
                const key = Object.keys(reqTokens)[0];
                return this.state.resources[key] || 0;
            }
            return this.state.resources[o.itemKey] || 0;
        }

        generateBuyerOrderData() {
            const completed = this.state.totalQuestsCompleted || 0;

            const tier1FactoryItems = [
                { name: '🌱 Fertilizer', key: 'fertilizer', icon: '🌱', sellPrice: 40, xpReward: 45 },
                { name: '📄 Rec.Paper', key: 'recycled_paper', icon: '📄', sellPrice: 40, xpReward: 45 },
                { name: '🏺 Glass Vase', key: 'glass_vase', icon: '🏺', sellPrice: 40, xpReward: 45 },
                { name: '🧵 Filament', key: 'filament', icon: '🧵', sellPrice: 40, xpReward: 45 }
            ];

            const tier2And3FactoryItems = [
                { name: '🛢️ Biofuel', key: 'biofuel', icon: '🛢️', sellPrice: 90, xpReward: 100 },
                { name: '🍂 Compost', key: 'compost', icon: '🍂', sellPrice: 150, xpReward: 160 },
                { name: '📦 Cardboard', key: 'cardboard', icon: '📦', sellPrice: 90, xpReward: 100 },
                { name: '📓 Notebook', key: 'notebook', icon: '📓', sellPrice: 150, xpReward: 160 },
                { name: '🪞 Mirror', key: 'mirror', icon: '🪞', sellPrice: 90, xpReward: 100 },
                { name: '🔍 Lens', key: 'lens', icon: '🔍', sellPrice: 150, xpReward: 160 },
                { name: '🧱 Brick', key: 'plastic_brick', icon: '🧱', sellPrice: 90, xpReward: 100 },
                { name: '🧪 Pipe', key: 'pipe', icon: '🧪', sellPrice: 150, xpReward: 160 }
            ];

            let shouldOrderCrafted = false;
            let chosenItem = null;

            if (completed >= 20) {
                // After 20 orders: 60% chance for factory items (tier 2/3 expensive items), 40% for large token batches (10-16 tokens)
                if (Math.random() < 0.60) {
                    shouldOrderCrafted = true;
                    if (Math.random() < 0.55) {
                        chosenItem = tier2And3FactoryItems[Math.floor(Math.random() * tier2And3FactoryItems.length)];
                    } else {
                        chosenItem = tier1FactoryItems[Math.floor(Math.random() * tier1FactoryItems.length)];
                    }
                }
            } else if (completed >= 10) {
                // After 10 orders: 45% chance for tier 1 factory items, 55% for 4-8 tokens
                if (Math.random() < 0.45) {
                    shouldOrderCrafted = true;
                    chosenItem = tier1FactoryItems[Math.floor(Math.random() * tier1FactoryItems.length)];
                }
            }

            if (shouldOrderCrafted && chosenItem) {
                const qty = 1;
                return {
                    isCraftedItem: true,
                    isRecipe: false,
                    itemKey: chosenItem.key,
                    itemName: chosenItem.name,
                    icon: chosenItem.icon,
                    qty: qty,
                    rewardCash: chosenItem.sellPrice,
                    rewardXP: chosenItem.xpReward
                };
            }

            const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
            const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
            const typeData = TRASH_TYPES[typeKey] || { name: 'Organic' };

            let qty;
            if (completed >= 20) {
                // Large token orders (10-16 tokens)
                qty = Phaser.Math.Between(10, 16);
            } else if (completed >= 10) {
                qty = Phaser.Math.Between(4, 8);
            } else {
                qty = Phaser.Math.Between(2, 4);
            }

            const cash = Math.round((qty * 5.5) + Phaser.Math.Between(3, 8));
            const xp = Math.round((qty * 8) + 6);

            const icons = {
                organic: '🟢',
                paper: '🔵',
                plastic: '🟡',
                glass: '🟣',
                metal: '⚪',
                fabric: '🌸'
            };

            return {
                isCraftedItem: false,
                isRecipe: false,
                itemKey: typeKey,
                itemName: typeData.name,
                icon: icons[typeKey] || '🗑️',
                qty: qty,
                rewardCash: cash,
                rewardXP: xp
            };
        }

        createBuyerContainer(customer, slotIndex, walkY, startX) {
            const metrics = this.getShopLayoutMetrics(this.scale ? this.scale.width : window.innerWidth);
            const bubbleW = metrics.bubbleW || 76;
            const halfBW = Math.round(bubbleW / 2);
            const shopScale = metrics.shopScale || 1;
            const btnOffsetX = Math.max(13, Math.round(bubbleW * 0.22));
            const isNarrowBubble = bubbleW < 68;

            const person = this.add.sprite(0, 0, 'person').setOrigin(0.5, 0.5);

            const haveTokens = this.getCurrentBuyerTokens(customer);
            const canAfford = haveTokens >= customer.order.qty;

            const bubbleGfx = this.add.graphics();
            bubbleGfx.fillStyle(0x0f172a, 0.95);
            bubbleGfx.fillRoundedRect(-halfBW, -68, bubbleW, 46, 5);
            bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
            bubbleGfx.strokeRoundedRect(-halfBW, -68, bubbleW, 46, 5);
            bubbleGfx.fillStyle(0x0f172a, 0.95);
            bubbleGfx.fillTriangle(-4, -22, 4, -22, 0, -17);
            bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
            bubbleGfx.lineBetween(-4, -22, 0, -17);
            bubbleGfx.lineBetween(0, -17, 4, -22);

            // Top line: Item icon + amount requested
            const orderTxt = this.add.text(0, -56, customer.order.icon + ' x' + customer.order.qty, {
                fontSize: isNarrowBubble ? '11px' : '12px', style: 'bold', color: '#ffca28'
            }).setOrigin(0.5);

            // Second line: Amount they'll pay below it
            const rewardTxt = this.add.text(0, -42, '+$' + customer.order.rewardCash, {
                fontSize: isNarrowBubble ? '9.5px' : '10px', style: 'bold', color: '#4ade80'
            }).setOrigin(0.5);

            // Action buttons: Tick on left, Cross on right, with generous mobile touch zones
            const btnAccept = this.add.text(-btnOffsetX, -28, '✓', {
                fontSize: '11px', style: 'bold',
                backgroundColor: canAfford ? '#15803d' : '#334155',
                color: canAfford ? '#ffffff' : '#9ca3af',
                padding: { x: 5, y: 1 }
            }).setOrigin(0.5);

            const btnReject = this.add.text(btnOffsetX, -28, '✕', {
                fontSize: '11px', style: 'bold',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                padding: { x: 5, y: 1 }
            }).setOrigin(0.5);

            const hitW = Math.max(24, Math.floor(bubbleW * 0.48));
            const acceptHit = this.add.zone(-btnOffsetX, -28, hitW, 24).setOrigin(0.5);
            const rejectHit = this.add.zone(btnOffsetX, -28, hitW, 24).setOrigin(0.5).setInteractive({ useHandCursor: true });

            if (canAfford) {
                acceptHit.setInteractive({ useHandCursor: true });
            }

            acceptHit.on('pointerup', () => this.fulfillBuyerOrder(customer));
            rejectHit.on('pointerup', () => this.rejectBuyerOrder(customer));

            const custContainer = this.add.container(startX, walkY, [
                person, bubbleGfx, orderTxt, rewardTxt, btnAccept, btnReject, acceptHit, rejectHit
            ]).setDepth(15).setScale(shopScale);

            customer.container = custContainer;
            customer.bubbleGfx = bubbleGfx;
            customer.bubbleW = bubbleW;
            customer.orderTxt = orderTxt;
            customer.rewardTxt = rewardTxt;
            customer.btnAccept = btnAccept;
            customer.btnReject = btnReject;
            customer.acceptHit = acceptHit;
            customer.rejectHit = rejectHit;

            if (this.mainContainer) {
                this.mainContainer.add(custContainer);
            }
        }

        refreshBuyerBubbles() {
            if (!this.shopCustomers) return;
            this.shopCustomers.forEach(cust => {
                if (cust.leaving || !cust.container || !cust.container.scene) return;
                const haveTokens = this.getCurrentBuyerTokens(cust);
                const reqTokens = cust.order.qty;
                const canAfford = haveTokens >= reqTokens;
                const bubbleW = cust.bubbleW || 76;
                const halfBW = Math.round(bubbleW / 2);

                if (cust.orderTxt) {
                    cust.orderTxt.setText(cust.order.icon + ' x' + cust.order.qty);
                }

                if (cust.rewardTxt) {
                    cust.rewardTxt.setText('+$' + cust.order.rewardCash);
                }

                if (cust.bubbleGfx) {
                    cust.bubbleGfx.clear();
                    cust.bubbleGfx.fillStyle(0x0f172a, 0.95);
                    cust.bubbleGfx.fillRoundedRect(-halfBW, -68, bubbleW, 46, 5);
                    cust.bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
                    cust.bubbleGfx.strokeRoundedRect(-halfBW, -68, bubbleW, 46, 5);
                    cust.bubbleGfx.fillStyle(0x0f172a, 0.95);
                    cust.bubbleGfx.fillTriangle(-4, -22, 4, -22, 0, -17);
                    cust.bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
                    cust.bubbleGfx.lineBetween(-4, -22, 0, -17);
                    cust.bubbleGfx.lineBetween(0, -17, 4, -22);
                }

                if (cust.btnAccept) {
                    cust.btnAccept.setStyle({
                        backgroundColor: canAfford ? '#15803d' : '#334155',
                        color: canAfford ? '#ffffff' : '#9ca3af'
                    });
                }
                if (cust.acceptHit) {
                    if (canAfford) {
                        cust.acceptHit.setInteractive({ useHandCursor: true });
                    } else {
                        if (cust.acceptHit.input) cust.acceptHit.disableInteractive();
                    }
                }
            });
        }

        getShopLayoutMetrics(w) {
            const width = (this.scale && this.scale.width) ? this.scale.width : (w || window.innerWidth || 800);
            const height = (this.scale && this.scale.height) ? this.scale.height : (window.innerHeight || 600);
            const lm = this.layoutMetrics;
            const safeLeft = lm ? lm.safeLeft : 0;
            const safeRight = lm ? lm.safeRight : 0;
            const shopScale = lm ? lm.shopScale : 1;
            const isMobile = (height > width && width < 640) || width < 560;

            const usableW = Math.max(280, width - safeLeft - safeRight);

            if (isMobile) {
                // Fit 3 buyers + Store + Factory cleanly side-by-side with zero overlap or edge clipping
                const sideMargin = 6;
                const buildingGap = 6;
                const bw = Math.round(Math.min(58, Math.max(46, usableW * 0.145)));
                const bh = Math.round(46 * shopScale);

                const factoryX = Math.round(width - safeRight - sideMargin - (bw / 2));
                const storeX = Math.round(factoryX - bw - buildingGap);

                const storeLeft = storeX - (bw / 2);
                const queueLeft = safeLeft + sideMargin;
                const queueRight = storeLeft - 6;
                const queueW = Math.max(150, queueRight - queueLeft);

                const slotPitch = Math.floor(queueW / 3);
                const bubbleW = Math.min(76, Math.max(54, Math.floor((slotPitch - 4) / shopScale)));
                const halfScaledBubble = Math.round((bubbleW * shopScale) / 2);

                const slot2X = Math.round(queueLeft + halfScaledBubble);
                const slot0X = Math.round(queueRight - halfScaledBubble);
                const slotSpacing = Math.max(Math.round(bubbleW * shopScale) + 2, Math.floor((slot0X - slot2X) / 2));
                const cust0X = slot0X;

                return {
                    bw, bh, bubbleW, shopScale,
                    storeX,
                    factoryX,
                    cust0X,
                    slotSpacing,
                    getSlotX: (idx) => Math.round(cust0X - (idx * slotSpacing))
                };
            } else {
                const bw = Math.round(72 * shopScale);
                const bh = Math.round(56 * shopScale);
                const bubbleW = 76;
                const slotSpacing = Math.round(84 * shopScale);
                const buildingGap = Math.round(24 * shopScale);
                const storeGap = Math.round(44 * shopScale);
                // Center the whole shop + 3-buyer group cleanly inside usableW
                const totalGroupW = (2 * slotSpacing) + Math.round(bubbleW * shopScale) + storeGap + (2 * bw) + buildingGap;
                const groupLeft = Math.round(safeLeft + Math.max(12, (usableW - totalGroupW) / 2));
                const slot2X = groupLeft + Math.round((bubbleW * shopScale) / 2);
                const cust0X = slot2X + (2 * slotSpacing);
                const storeX = cust0X + storeGap + Math.round(bw / 2);
                const factoryX = storeX + bw + buildingGap;

                return {
                    bw, bh, bubbleW, shopScale,
                    storeX,
                    factoryX,
                    cust0X,
                    slotSpacing,
                    getSlotX: (idx) => Math.round(cust0X - (idx * slotSpacing))
                };
            }
        }

        getShopQueueSlotX(slotIndex) {
            const metrics = this.getShopLayoutMetrics(this.scale.width);
            return metrics.getSlotX(slotIndex);
        }

        spawnShopCustomer(instant = false) {
            if (!this.shopCustomers) this.shopCustomers = [];
            if (this.shopCustomers.length >= 3) return;

            const slotIndex = this.shopCustomers.length;
            const targetX = this.getShopQueueSlotX(slotIndex);
            const walkY = this.shopWalkY || ((this.splitY || 240) - 24);

            const orderData = this.generateBuyerOrderData();
            const customer = {
                id: 'cust_' + Date.now() + '_' + Math.random(),
                order: orderData,
                targetSlot: slotIndex,
                leaving: false,
                container: null
            };

            const startX = instant ? targetX : -40;

            this.createBuyerContainer(customer, slotIndex, walkY, startX);
            this.shopCustomers.push(customer);

            if (!instant && customer.container && this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: customer.container,
                    x: targetX,
                    duration: 600,
                    ease: 'Power1'
                });
            }
        }

        fulfillBuyerOrder(customer) {
            if (customer.leaving) return;
            const haveTokens = this.getCurrentBuyerTokens(customer);
            if (haveTokens < customer.order.qty) return;

            customer.leaving = true;
            if (customer.order.isCraftedItem) {
                if (!this.state.crafted) this.state.crafted = {};
                this.state.crafted[customer.order.itemKey] = Math.max(0, (this.state.crafted[customer.order.itemKey] || 0) - customer.order.qty);
            } else if (customer.order.isRecipe) {
                Object.keys(customer.order.costTokens).forEach(tKey => {
                    this.state.resources[tKey] -= customer.order.costTokens[tKey];
                });
            } else {
                this.state.resources[customer.order.itemKey] -= customer.order.qty;
            }

            this.state.money += customer.order.rewardCash;
            this.addXP(customer.order.rewardXP);
            this.state.totalQuestsCompleted = (this.state.totalQuestsCompleted || 0) + 1;

            const popX = customer.container ? customer.container.x : 100;
            const popY = customer.container ? customer.container.y - 75 : 200;
            const popTxt = this.add.text(popX, popY, '+$' + customer.order.rewardCash + ' ⭐+' + customer.order.rewardXP + ' XP!', {
                fontSize: '12px', style: 'bold', color: '#00e676', backgroundColor: '#000000', padding: 3
            }).setOrigin(0.5).setDepth(40);

            const cleanPopTxt = () => { if (popTxt && popTxt.active) popTxt.destroy(); };
            setTimeout(cleanPopTxt, 1100);
            if (this.tweens && this.tweens.add) {
                this.tweens.add({ targets: popTxt, y: popTxt.y - 25, alpha: 0, duration: 800, onComplete: cleanPopTxt });
            } else {
                cleanPopTxt();
            }

            if (customer.container && this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: customer.container,
                    x: customer.container.x + 40,
                    alpha: 0,
                    duration: 350,
                    onComplete: () => {
                        if (customer.container) customer.container.destroy();
                    }
                });
            } else if (customer.container) {
                customer.container.destroy();
            }

            const idx = this.shopCustomers.indexOf(customer);
            if (idx !== -1) this.shopCustomers.splice(idx, 1);

            this.repositionShopCustomers();
            this.updateUI();
            this.refreshBuyerBubbles();
        }

        rejectBuyerOrder(customer) {
            if (customer.leaving) return;
            customer.leaving = true;

            if (customer.container && this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: customer.container,
                    y: customer.container.y + 25,
                    alpha: 0,
                    duration: 250,
                    onComplete: () => {
                        if (customer.container) customer.container.destroy();
                    }
                });
            } else if (customer.container) {
                customer.container.destroy();
            }

            const idx = this.shopCustomers.indexOf(customer);
            if (idx !== -1) this.shopCustomers.splice(idx, 1);

            this.repositionShopCustomers();
            this.updateUI();
            this.refreshBuyerBubbles();
        }

        repositionShopCustomers() {
            this.shopCustomers.forEach((cust, index) => {
                if (cust.leaving) return;
                const targetX = this.getShopQueueSlotX(index);
                cust.targetSlot = index;
                if (cust.container && cust.container.scene) {
                    if (this.tweens && this.tweens.add) {
                        this.tweens.add({
                            targets: cust.container,
                            x: targetX,
                            duration: 300,
                            ease: 'Power1'
                        });
                    } else {
                        cust.container.x = targetX;
                    }
                }
            });
        }

        computeLayoutMetrics(width, height) {
            const insets = (typeof getSafeInsets === 'function') ? getSafeInsets() : { top: 0, bottom: 0, left: 0, right: 0 };
            const safeTop = insets.top || 0;
            const safeBottom = insets.bottom || 0;
            const safeLeft = insets.left || 0;
            const safeRight = insets.right || 0;

            const usableTop = safeTop;
            const usableBottom = height - safeBottom;
            const usableH = Math.max(300, usableBottom - usableTop);
            const usableW = Math.max(280, width - safeLeft - safeRight);

            const isPortrait = height > width;
            const isMobile = (isPortrait && width < 640) || width < 560;
            const isShortLandscape = !isPortrait && usableH < 520;
            const isShortHeight = usableH < 660;
            const isSmallScreen = usableH < 680 || width < 400;

            const hasExtraTypes = !!(this.state && this.state.unlockedTypes && (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric));
            const topBarY = usableTop + (isShortLandscape ? 4 : (isMobile ? 8 : 14));

            // 1. Header zone height (XP bar + HUD card + Nav buttons)
            let hudCardY, hudCardH, hudBottomY, navY, navH, headerBottomY;
            if (isMobile) {
                hudCardY = topBarY + 22;
                hudCardH = hasExtraTypes ? 68 : 54;
                hudBottomY = hudCardY + hudCardH;
                navY = hudBottomY + 5;
                navH = 28;
                headerBottomY = navY + navH;
            } else {
                hudCardY = topBarY;
                hudCardH = hasExtraTypes ? (isShortLandscape ? 58 : 68) : (isShortLandscape ? 48 : 56);
                hudBottomY = hudCardY + hudCardH;
                navY = topBarY;
                navH = isShortLandscape ? 24 : 86;
                headerBottomY = Math.max(hudBottomY, topBarY + navH);
            }

            // 2. Determine shop scale & minimum sky height so buyer bubbles NEVER touch the header
            const shopScale = isShortLandscape ? Math.max(0.62, Math.min(0.84, usableH / 520)) : (usableH < 600 ? 0.90 : 1.0);
            const shopClearH = Math.round(90 * shopScale);
            const minSplitY = headerBottomY + shopClearH + (isShortLandscape ? 2 : 8);

            // 3. Determine whether toolbar has active buttons
            const hasPets = this.state && this.state.pets && Object.values(this.state.pets).some(Boolean);
            const hasToolbarItems = !!(this.state && (this.state.unlockedSanitiser || hasPets || this.state.unlockedAutoSort));

            // 4. Ideal bottom-half band heights (at scale 1.0)
            const baseToolbarPad = 6;
            const baseToolbarH = hasToolbarItems ? 28 : 8;
            const baseGapToolbarToQueue = hasToolbarItems ? 8 : 4;
            const baseQueueH = 56; // 52px item + highlight border
            const baseGapQueueToBinLabel = 12;
            const baseBinLabelH = 14;
            const baseBinH = isShortHeight ? 68 : 80;
            const baseGapBinToStreak = 12;
            const baseStreakH = 26; // badge (18) + gap + timer bar (6)
            const baseGapStreakToGateLabel = 8;
            const baseGateLabelH = 14;
            const baseGateH = isShortHeight ? 54 : 62;
            const baseGapGateToBus = 16;
            const baseBusH = 52; // body 44 + wheels 7
            const baseBottomPad = 10;

            const idealBottomH = baseToolbarPad + baseToolbarH + baseGapToolbarToQueue +
                baseQueueH + baseGapQueueToBinLabel + baseBinLabelH + baseBinH +
                baseGapBinToStreak + baseStreakH + baseGapStreakToGateLabel +
                baseGateLabelH + baseGateH + baseGapGateToBus + baseBusH + baseBottomPad;

            const maxAvailBottomH = Math.max(180, usableBottom - minSplitY);
            const vScale = Math.max(0.42, Math.min(1.0, maxAvailBottomH / idealBottomH));

            // 5. Place horizon splitY cleanly so BOTH top half and bottom half have generous space
            const neededBottomH = Math.round(idealBottomH * vScale);
            const targetSplitY = Math.round(usableTop + usableH * (isPortrait ? 0.41 : 0.42));
            const maxSplitY = Math.max(minSplitY, usableBottom - neededBottomH);
            const splitY = Phaser.Math.Clamp(targetSplitY, minSplitY, maxSplitY);

            // 6. Compute exact non-overlapping Y positions for every element below splitY
            const tight = vScale < 0.7;
            const s = (v, minVal = 2) => Math.max(tight ? Math.min(minVal, Math.max(2, Math.floor(v * vScale))) : minVal, Math.round(v * vScale));
            const queueScale = Math.max(tight ? 0.56 : 0.72, Math.min(1.0, vScale * (tight ? 0.95 : 1.06)));
            const gateScale = Math.max(tight ? 0.56 : 0.72, Math.min(1.0, vScale * (tight ? 0.95 : 1.05)));
            const busScale = Math.max(tight ? 0.56 : 0.72, Math.min(1.0, vScale * (tight ? 0.92 : 1.05)));

            const toolbarY = splitY + s(baseToolbarPad, 3);
            const toolbarH = hasToolbarItems ? s(baseToolbarH, tight ? 16 : 22) : s(baseToolbarH, 4);
            const queueHalfH = Math.round((baseQueueH * queueScale) / 2);
            const queueY = toolbarY + toolbarH + s(baseGapToolbarToQueue, 3) + queueHalfH;

            const binLabelH = s(baseBinLabelH, tight ? 9 : 10);
            const binLabelY = queueY + queueHalfH + s(baseGapQueueToBinLabel, tight ? 4 : 6) + Math.round(binLabelH / 2);
            const binTopY = binLabelY + Math.round(binLabelH / 2) + (tight ? 2 : 3);
            const binH = s(baseBinH, tight ? 32 : 44);
            const binBaselineY = binTopY + binH;
            const binCenterY = Math.round(binTopY + (binH / 2));

            const streakY = binBaselineY + s(baseGapBinToStreak, tight ? 5 : 7) + (tight ? 4 : 6);
            const streakBottomY = streakY + s(20, tight ? 10 : 14);

            const gateSize = s(baseGateH, tight ? 28 : 38);
            const gateLabelH = s(baseGateLabelH, tight ? 8 : 10);
            const gateLabelY = streakBottomY + s(baseGapStreakToGateLabel, tight ? 3 : 4) + Math.round(gateLabelH / 2);
            const gateY = gateLabelY + Math.round(gateLabelH / 2) + Math.round(gateSize / 2) + (tight ? 2 : 3);
            const gateBottomY = gateY + Math.round(gateSize / 2);

            // 7. BUS ROAD LANE: Centered cleanly BETWEEN the bottom of the gate and the bottom of the visible viewport!
            // Never clipped by browser toolbars or gesture bars on Flip 4 / A80 / iPhone.
            const busTopHalf = Math.round(23 * busScale);
            const busBottomHalf = Math.round(30 * busScale); // includes wheel radius (22 + 7)
            const busMinY = gateBottomY + s(10, tight ? 2 : 4) + busTopHalf;
            const busMaxY = usableBottom - Math.max(tight ? 3 : 8, Math.round(10 * busScale)) - busBottomHalf;
            const busMidY = Math.round((gateBottomY + usableBottom) / 2);
            const busY = (busMinY <= busMaxY)
                ? Phaser.Math.Clamp(busMidY, busMinY, busMaxY)
                : Math.round(Math.min(usableBottom - busBottomHalf - 1, Math.max(gateBottomY + busTopHalf + 1, busMidY)));

            return {
                width, height, usableW, usableH,
                safeTop, safeBottom, safeLeft, safeRight, usableTop, usableBottom,
                isPortrait, isMobile, isShortLandscape, isSmallScreen,
                topBarY, hudCardY, hudCardH, hudBottomY, navY, navH, headerBottomY,
                shopScale, vScale, queueScale, gateScale, busScale,
                splitY, toolbarY, toolbarH, hasToolbarItems,
                queueY, queueHalfH,
                binLabelY, binTopY, binH, binBaselineY, binCenterY,
                streakY, streakBottomY,
                gateLabelY, gateY, gateSize, gateBottomY,
                busY
            };
        }

        handleResize(gameSize) {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setSize(gameSize.width, gameSize.height);
                this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
            }
            this.layoutRebuildPending = false;
            const reopenedModal = this.activeModal;
            const reopenedCat = this.activeUpgradeCategory || 'gate';
            this.buildLayout();
            if (reopenedModal) {
                this.openModal(reopenedModal, reopenedCat, true);
            }
            if (this.arcadeState && this.arcadeState.active && !this.arcadeState.gameOver) {
                this.renderArcadeQueue();
            }
        }

        buildLayout() {
            if (this.draggedItem) {
                this.draggedItem = null;
                this.hoveredDropBin = null;
            }
            if (this.dragLayer) {
                this.dragLayer.destroy(true);
                this.dragLayer = null;
            }
            if (this.mainContainer) this.mainContainer.destroy(true);
            this.mainContainer = this.add.container(0, 0).setDepth(10);
            if (this.arcadeState && this.arcadeState.active) {
                this.mainContainer.setVisible(false);
            }
            this.dragLayer = this.add.container(0, 0).setDepth(95);

            // Cleanly reset trash container references so they are rebuilt at exact new scale and positions
            if (this.trashQueue) {
                this.trashQueue.forEach(item => {
                    if (item.container) {
                        item.container.destroy();
                        item.container = null;
                    }
                });
            }

            const width = (this.scale && this.scale.width) ? this.scale.width : (window.innerWidth || 800);
            const height = (this.scale && this.scale.height) ? this.scale.height : (window.innerHeight || 600);
            const lm = this.computeLayoutMetrics(width, height);
            this.layoutMetrics = lm;

            const isMobile = lm.isMobile;
            const isSmallScreen = lm.isSmallScreen;
            const topBarY = lm.topBarY;
            const splitY = lm.splitY;
            const toolbarY = lm.toolbarY;
            const queueY = lm.queueY;
            this.queueY = queueY;
            const binH = lm.binH;
            const binTopY = lm.binTopY;
            const binBaselineY = lm.binBaselineY;
            const binCenterY = lm.binCenterY;
            const streakY = lm.streakY;
            const streakX = Math.round(width / 2);
            const busY = lm.busY;
            this.busY = busY;
            this.busScale = lm.busScale;
            this.currentGateSize = lm.gateSize;
            const bottomY = lm.gateY;

            // Keep any currently driving buses aligned in the updated bus lane
            if (this.activeBuses && this.activeBuses.length > 0) {
                this.activeBuses.forEach(b => {
                    if (b && b.active) {
                        b.y = busY;
                        b.setScale(lm.busScale);
                    }
                });
            }

            if (this.lvlUpText && this.lvlUpText.active) {
                this.lvlUpText.setPosition(width / 2, height / 2);
            }

            if (this.state.tutorial.active && this.state.tutorial.step > 0) {
                const tutY = Math.round(lm.headerBottomY + Math.max(24, (splitY - Math.round(90 * lm.shopScale) - lm.headerBottomY) / 2));
                this.renderTutorialBanner(width, tutY);
            }

            if (this.skyGfx) this.skyGfx.destroy();
            if (this.groundGfx) this.groundGfx.destroy();

            // Sky gradient at depth 0 (clouds at depth 1 drift above the sky)
            this.skyGfx = this.add.graphics().setDepth(0);
            this.skyGfx.fillStyle(0x64b5f6, 1);
            this.skyGfx.fillRect(0, 0, width, splitY);
            this.skyGfx.fillStyle(0x90caf9, 0.45);
            this.skyGfx.fillRect(0, Math.max(0, splitY - 45), width, Math.min(45, splitY));

            if (this.clouds) {
                this.clouds.forEach(c => {
                    c.setDepth(1);
                    const minCloudY = lm.headerBottomY + 14;
                    const maxCloudY = Math.max(minCloudY + 12, splitY - Math.round(55 * lm.shopScale));
                    if (c.y < minCloudY || c.y > maxCloudY) {
                        c.y = Phaser.Math.Between(minCloudY, maxCloudY);
                    }
                });
            }

            // Ground: depth 2 (above clouds, below mainContainer depth 10)
            this.groundGfx = this.add.graphics().setDepth(2);
            if (this.state.hasGrass) {
                this.groundGfx.fillStyle(0x3e7b42, 1); // Natural meadow green
                this.groundGfx.fillRect(0, splitY, width, height - splitY);
                this.groundGfx.fillStyle(0x336936, 1); // Deep meadow rim
                this.groundGfx.fillRect(0, splitY, width, 14);

                // Grass variety tufts
                this.groundGfx.fillStyle(0x558b2f, 0.45);
                for (let gx = 18; gx < width - 18; gx += 42) {
                    const gy1 = splitY + 28 + ((gx * 7) % 65);
                    const gy2 = splitY + 110 + ((gx * 13) % 80);
                    this.groundGfx.fillRoundedRect(gx, gy1, 14, 5, 2);
                    this.groundGfx.fillRoundedRect(gx + 12, gy2, 18, 6, 3);
                }

                // Tiny wildflower accents
                for (let fx = 32; fx < width - 32; fx += 58) {
                    const fy = splitY + 20 + ((fx * 17) % 130);
                    const flowerType = (fx % 3);
                    if (flowerType === 0) {
                        this.groundGfx.fillStyle(0xffffff, 0.9);
                        this.groundGfx.fillCircle(fx, fy, 3);
                        this.groundGfx.fillStyle(0xffd54f, 1);
                        this.groundGfx.fillCircle(fx, fy, 1.2);
                    } else if (flowerType === 1) {
                        this.groundGfx.fillStyle(0xf48fb1, 0.9);
                        this.groundGfx.fillCircle(fx, fy, 2.5);
                        this.groundGfx.fillStyle(0xffffff, 1);
                        this.groundGfx.fillCircle(fx, fy, 1);
                    } else {
                        this.groundGfx.fillStyle(0xffeb3b, 0.95);
                        this.groundGfx.fillCircle(fx, fy, 2.5);
                    }
                }
            } else {
                this.groundGfx.fillStyle(0x5d4037, 1); // Rich soil brown
                this.groundGfx.fillRect(0, splitY, width, height - splitY);
                this.groundGfx.fillStyle(0x4e342e, 1); // Dirt rim
                this.groundGfx.fillRect(0, splitY, width, 14);
            }

            // Render decorations AFTER the environment so they are never covered up!
            this.renderDecorationsGraphics(width, height, splitY);

            const activeBinCount = Math.max(1, Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]).length);
            const binSideMargin = isMobile ? 8 : 16;
            const binAvailW = Math.max(240, lm.usableW - (2 * binSideMargin));
            const maxBinSpacing = isSmallScreen ? 86 : 96;
            const binSpacing = Math.min(Math.floor(binAvailW / activeBinCount), maxBinSpacing);
            const startBinX = Math.round(lm.safeLeft + (lm.usableW - (binSpacing * (activeBinCount - 1))) / 2);
            this.currentBinSpacing = binSpacing;
            this.currentBinTopY = binTopY;
            this.currentBinBaselineY = binBaselineY;

            this.renderCenteredXPBar(width, topBarY);
            const hudBottomY = this.renderTopHUDBar(width, topBarY, isMobile);
            this.createTopNavButtons(width, isMobile, hudBottomY);

            // 1. WALKING MEADOW CUSTOMERS (Above dirt, up to 3 in line)
            this.renderMeadowShopLine(width, splitY);

            // 3. QUEUE ROW (Center aligned with equal padding on left and right sides)
            const qScale = lm.queueScale || 1;
            const minPad = lm.safeLeft + (isMobile ? 10 : 18);
            const baseGap = Math.round(56 * qScale);
            const availAssemblyW = Math.max(240, lm.usableW - (isMobile ? 20 : 36));
            const availQueueSpan = Math.max(140, availAssemblyW - Math.round(84 * qScale));
            const actualQueueSpan = Math.min(9 * baseGap, availQueueSpan);
            const overflowGap = (actualQueueSpan >= 9 * baseGap) ? Math.round(44 * qScale) : Math.round(34 * qScale);
            const totalQueueW = Math.round(28 * qScale) + actualQueueSpan + overflowGap + Math.round(22 * qScale);
            const sidePadding = Math.max(minPad, Math.floor(lm.safeLeft + (lm.usableW - totalQueueW) / 2));
            this.queueStartX = sidePadding + Math.round(28 * qScale);
            this.queueActualSpan = actualQueueSpan;
            this.queueOverflowGap = overflowGap;

            const hlSize = Math.round(58 * qScale);
            const hlHalf = Math.round(hlSize / 2);
            this.queueHighlight = this.add.graphics().setDepth(25);
            this.queueHighlight.lineStyle(4, 0x000000, 0.45);
            this.queueHighlight.strokeRoundedRect(-hlHalf, -hlHalf, hlSize, hlSize, 8);
            this.queueHighlight.lineStyle(3, 0xffd700, 1);
            this.queueHighlight.strokeRoundedRect(-hlHalf, -hlHalf, hlSize, hlSize, 8);
            this.queueHighlight.setVisible(false);

            // Dedicated container for all visible conveyor items inside mainContainer
            this.conveyorContainer = this.add.container(0, 0).setDepth(12);

            // Dark grey overflow block to the right of the queue
            this.overflowBlockContainer = this.add.container(0, 0).setDepth(20).setVisible(false).setScale(qScale);
            const obSize = 44;
            const overflowBg = this.add.graphics();
            overflowBg.fillStyle(0x1e293b, 0.95);
            overflowBg.fillRoundedRect(-obSize / 2, -obSize / 2, obSize, obSize, 8);
            overflowBg.lineStyle(2, 0x475569, 1);
            overflowBg.strokeRoundedRect(-obSize / 2, -obSize / 2, obSize, obSize, 8);

            this.overflowNumText = this.add.text(0, -6, '+0', {
                fontSize: '15px', style: 'bold', color: '#38bdf8'
            }).setOrigin(0.5);

            const overflowLabel = this.add.text(0, 11, 'QUEUED', {
                fontSize: '8px', style: 'bold', color: '#94a3b8'
            }).setOrigin(0.5);

            this.overflowBlockContainer.add([overflowBg, this.overflowNumText, overflowLabel]);
            this.mainContainer.add([this.conveyorContainer, this.queueHighlight, this.overflowBlockContainer]);

            // Toolbar above conveyor: Sanitiser station, Pet helpers & Auto-Sort toggle (strictly non-overlapping!)
            const btnSize = Math.max(22, Math.min(28, lm.toolbarH));
            const btnSpacing = isMobile ? 5 : 7;

            const activeActionButtons = [];
            if (this.state.unlockedSanitiser) {
                activeActionButtons.push({
                    id: 'sanitiser',
                    type: 'sanitiser',
                    icon: '🧼',
                    action: () => this.triggerSanitiseAction()
                });
            }

            const petDefs = [
                { id: 'dog', name: 'Dog', icon: '🐶', targetType: 'paper', col: '#2196f3' },
                { id: 'chicken', name: 'Chicken', icon: '🐔', targetType: 'organic', col: '#4caf50' },
                { id: 'turtle', name: 'Turtle', icon: '🐢', targetType: 'plastic', col: '#ffeb3b' },
                { id: 'flashlight', name: 'Torch', icon: '🔦', targetType: 'glass', col: '#9c27b0' },
                { id: 'cat', name: 'Cat', icon: '🐱', targetType: 'fabric', col: '#e91e63' },
                { id: 'magnet', name: 'Magnet', icon: '🧲', targetType: 'metal', col: '#9e9e9e' }
            ];

            petDefs.forEach(p => {
                if (this.state.pets[p.id]) {
                    activeActionButtons.push({
                        id: p.id,
                        type: 'pet',
                        icon: p.icon,
                        targetType: p.targetType,
                        name: p.name,
                        action: () => this.triggerPetClean(p.targetType, p.icon + ' ' + p.name)
                    });
                }
            });

            const autoSortReserveW = this.state.unlockedAutoSort ? (isMobile ? 104 : 122) : 0;
            const totalActionW = (activeActionButtons.length * btnSize) + Math.max(0, (activeActionButtons.length - 1) * btnSpacing);
            const combinedToolbarW = totalActionW + (autoSortReserveW > 0 && totalActionW > 0 ? 10 : 0) + autoSortReserveW;
            let clusterStartX = Math.round(lm.safeLeft + (lm.usableW - combinedToolbarW) / 2);
            clusterStartX = Math.max(lm.safeLeft + 8, clusterStartX);

            this.activeToolbarButtons = [];
            activeActionButtons.forEach((act, idx) => {
                const bx = clusterStartX + (idx * (btnSize + btnSpacing));
                const btnContainer = this.add.container(bx, toolbarY).setDepth(20);

                const bgGfx = this.add.graphics();
                bgGfx.fillStyle(0x1e293b, 0.95);
                bgGfx.fillRoundedRect(0, 0, btnSize, btnSize, 6);
                bgGfx.lineStyle(1.5, 0x475569, 1);
                bgGfx.strokeRoundedRect(0, 0, btnSize, btnSize, 6);

                const iconTxt = this.add.text(btnSize / 2, btnSize / 2, act.icon, {
                    fontSize: btnSize < 25 ? '13px' : '15px'
                }).setOrigin(0.5);

                const fillGfx = this.add.graphics();
                btnContainer.add([bgGfx, iconTxt, fillGfx]);

                act.btnContainer = btnContainer;
                act.bgGfx = bgGfx;
                act.fillGfx = fillGfx;
                act.btnSize = btnSize;
                this.activeToolbarButtons.push(act);

                if (act.type === 'sanitiser') {
                    this.sanitiserContainer = btnContainer;
                    this.sanitiserBgGfx = bgGfx;
                    this.sanitiserFillGfx = fillGfx;
                }

                // Slightly enlarged vertical touch pad around toolbar buttons for mobile comfort
                btnContainer.setSize(btnSize + 4, btnSize + 4);
                btnContainer.setInteractive(new Phaser.Geom.Rectangle(-2, -2, btnSize + 4, btnSize + 4), Phaser.Geom.Rectangle.Contains);
                btnContainer.on('pointerup', () => {
                    const cd = act.type === 'sanitiser' ? (this.state.sanitiserCooldown || 0) : ((this.state.petCooldowns && this.state.petCooldowns[act.targetType]) || 0);
                    if (cd > 0) return;
                    act.action();
                });

                this.mainContainer.add(btnContainer);
            });
            this.updateToolbarCooldownsUI();

            // Auto-Sort Pause/Resume Toggle (cleanly placed beside action buttons with zero overlap)
            if (this.state.unlockedAutoSort) {
                const autoSortLabel = this.state.autoSortPaused
                    ? (isMobile ? '▶️ Auto: OFF' : '▶️ Auto-Sort: OFF')
                    : ((isMobile ? '⏸️ Auto: ' : '⏸️ Auto-Sort: ') + (this.state.autoSortDelay / 1000).toFixed(1) + 's');
                const autoSortX = totalActionW > 0
                    ? Math.min(width - lm.safeRight - 56, clusterStartX + totalActionW + 10 + Math.round(autoSortReserveW / 2))
                    : Math.round(width / 2);
                const btnAutoSort = this.add.text(autoSortX, toolbarY + (btnSize / 2), autoSortLabel, {
                    fontSize: isMobile ? '9.5px' : '10px', style: 'bold',
                    backgroundColor: this.state.autoSortPaused ? '#374151' : '#1e3a8a',
                    color: '#ffffff', padding: { x: 7, y: 4 }
                }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

                btnAutoSort.on('pointerup', () => {
                    this.state.autoSortPaused = !this.state.autoSortPaused;
                    this.requestLayoutRebuild();
                });
                this.mainContainer.add(btnAutoSort);
            }

            // 4. BINS (Animated Green, Blue, Purple, Yellow + Metal/Fabric, scaled cleanly to never overlap!)
            this.bins = [];
            const binData = [
                { id: 'organic', key: '1', name: 'GREEN', sprite: 'bin_green', count: this.state.resources.organic, sheetKey: 'bin_green_sheet', animKey: 'bin_green_anim' },
                { id: 'paper', key: '2', name: 'PAPER', sprite: 'bin_blue', count: this.state.resources.paper, sheetKey: 'bin_blue_sheet', animKey: 'bin_blue_anim' },
                { id: 'glass', key: '3', name: 'GLASS', sprite: 'bin_purple', count: this.state.resources.glass, sheetKey: 'bin_purple_sheet', animKey: 'bin_purple_anim' },
                { id: 'plastic', key: '4', name: 'PLASTIC', sprite: 'bin_yellow', count: this.state.resources.plastic, sheetKey: 'bin_yellow_sheet', animKey: 'bin_yellow_anim' }
            ];
            if (this.state.activeTypes.metal) {
                binData.push({ id: 'metal', key: '5', name: 'METAL', sprite: 'bin_metal', count: this.state.resources.metal });
            }
            if (this.state.activeTypes.fabric) {
                binData.push({ id: 'fabric', key: '6', name: 'FABRIC', sprite: 'bin_fabric', count: this.state.resources.fabric });
            }

            const maxBinVisualW = Math.min(isSmallScreen ? 72 : 82, Math.max(44, binSpacing - 6));
            const binSpriteScale = Math.min(
                BIN_SPRITE_CONFIG.scale,
                maxBinVisualW / BIN_SPRITE_CONFIG.frameWidth,
                binH / BIN_SPRITE_CONFIG.frameHeight
            );
            this.currentBinSpriteScale = binSpriteScale;
            const visualBinW = Math.round(BIN_SPRITE_CONFIG.frameWidth * binSpriteScale);
            const visualBinH = Math.round(BIN_SPRITE_CONFIG.frameHeight * binSpriteScale);
            const compactLabels = isMobile || binSpacing < 72;

            binData.forEach((b, idx) => {
                const bx = Math.round(startBinX + (idx * binSpacing));
                const isSheet = !!(b.sheetKey && this.textures.exists(b.sheetKey));
                let sprite;
                if (isSheet) {
                    sprite = this.add.sprite(bx, binBaselineY, b.sheetKey, 0)
                        .setOrigin(0.5, 1)
                        .setScale(binSpriteScale);
                } else {
                    sprite = this.add.sprite(bx, binBaselineY, b.sprite)
                        .setOrigin(0.5, 1)
                        .setDisplaySize(visualBinW, Math.min(binH, visualBinH));
                }

                const labelTextStr = compactLabels ? b.name : ('[' + b.key + '] ' + b.name);
                const labelFontSize = (binSpacing < 60) ? '9px' : ((binSpacing < 72) ? '10px' : '11px');
                const label = this.add.text(bx, lm.binLabelY, labelTextStr, {
                    fontSize: labelFontSize, color: '#fff', style: 'bold'
                }).setOrigin(0.5);

                const countY = binBaselineY - Math.round(Math.min(binH, visualBinH) * 0.42);
                const countText = this.add.text(bx, countY, '' + b.count, {
                    fontSize: (binH < 56) ? '12px' : '15px',
                    color: '#ffffff', stroke: '#000000', strokeThickness: 4, style: 'bold'
                }).setOrigin(0.5).setDepth(2);

                const hlW = Math.max(46, Math.min(binSpacing - 4, visualBinW + 10));
                const hlH = Math.min(binH, visualBinH) + 8;

                // Golden hint outline (shows correct bin during drag)
                const binHighlightGfx = this.add.graphics();
                binHighlightGfx.lineStyle(3, 0xffd700, 1);
                binHighlightGfx.strokeRoundedRect(bx - (hlW / 2), binBaselineY - hlH + 4, hlW, hlH, 8);
                binHighlightGfx.setVisible(false);

                // Bright cyan target glow (shows exact bin your dragged item will drop into right now!)
                const binHoverGfx = this.add.graphics();
                binHoverGfx.fillStyle(0x38bdf8, 0.22);
                binHoverGfx.fillRoundedRect(bx - (hlW / 2) - 2, binBaselineY - hlH + 2, hlW + 4, hlH + 4, 10);
                binHoverGfx.lineStyle(3, 0x38bdf8, 1);
                binHoverGfx.strokeRoundedRect(bx - (hlW / 2) - 2, binBaselineY - hlH + 2, hlW + 4, hlH + 4, 10);
                binHoverGfx.setVisible(false);

                // Generous full-column tap target covering bin label + bin body
                const touchZoneW = Math.max(46, binSpacing - 2);
                const touchZoneH = (binBaselineY - lm.binLabelY) + 18;
                const touchZoneY = Math.round((lm.binLabelY + binBaselineY) / 2);
                const binTouchZone = this.add.zone(bx, touchZoneY, touchZoneW, touchZoneH)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true });

                // Tap = sort head trash into bin; Hold = open this bin's settings/upgrades!
                this.setupLongPress(binTouchZone, b.id + '_bin', () => {
                    if (this.draggedItem) return;
                    this.sortHeadTrash(b.id, 0);
                }, bx, binCenterY);

                if (b.animKey) {
                    sprite.on('animationcomplete', () => {
                        sprite.setFrame(0);
                        sprite.setOrigin(0.5, 1);
                        sprite.setScale(binSpriteScale);
                    });
                }

                this.bins.push({
                    sprite, id: b.id, x: bx, y: binCenterY, baselineY: binBaselineY,
                    width: visualBinW, height: Math.min(binH, visualBinH),
                    baseScale: binSpriteScale, isSheet,
                    countText, highlightGfx: binHighlightGfx, hoverGfx: binHoverGfx,
                    sheetKey: b.sheetKey, animKey: b.animKey
                });
                this.mainContainer.add([binHoverGfx, sprite, label, countText, binHighlightGfx, binTouchZone]);
            });

            // Streak Score Text & Streak Bar Setup (Centered directly under the bins, strictly above gate!)
            this.dumpsterStreakText = this.add.text(streakX, streakY, '🔥 STREAK: ' + this.state.streak + '  |  BEST: ' + this.state.streakHighScore, {
                fontSize: isSmallScreen ? '10px' : '11px', style: 'bold', color: '#ffca28', backgroundColor: '#111827', padding: { x: 10, y: 2 }
            }).setOrigin(0.5).setDepth(15);
            this.dumpsterBarGfx = this.add.graphics().setDepth(15);
            this.mainContainer.add([this.dumpsterStreakText, this.dumpsterBarGfx]);

            // 5. GATE (Direct Intake onto Conveyor Belt)
            const gateX = isMobile ? Math.round(lm.safeLeft + lm.usableW * 0.56) : Math.max(lm.safeLeft + 235, Math.round(width * 0.30));
            this.gatePos = { x: gateX, y: bottomY };

            this.gateSprite = this.add.sprite(this.gatePos.x, this.gatePos.y, 'gate')
                .setDisplaySize(lm.gateSize, lm.gateSize)
                .setDepth(1);
            // Generous touch zone on gate for easy mobile tapping & long-press
            const gateHitSz = Math.max(66, lm.gateSize + 12);
            this.gateTouchZone = this.add.zone(this.gatePos.x, this.gatePos.y, gateHitSz, gateHitSz)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            const gateLabel = isMobile ? 'GATE (TAP)' : 'GATE [SPACE]';
            this.gateText = this.add.text(this.gatePos.x, lm.gateLabelY, gateLabel, {
                fontSize: isSmallScreen ? '10px' : '11px', color: '#00ff00', style: 'bold'
            }).setOrigin(0.5);

            this.autoGateGfx = this.add.graphics();
            this.autoSortGfx = this.add.graphics().setDepth(25);
            this.longPressGfx = this.add.graphics().setDepth(10);
            this.tutorialIndicatorsGfx = this.add.graphics().setDepth(25);

            this.setupLongPress(this.gateTouchZone, 'gate');

            this.mainContainer.add([
                this.gateSprite, this.gateTouchZone, this.gateText, this.autoGateGfx, this.autoSortGfx,
                this.longPressGfx, this.tutorialIndicatorsGfx
            ]);

            // Rebuild customer visual containers so they are never destroyed or invisible on rebuild
            if (this.customerQueue && this.customerQueue.length > 0) {
                const count = this.customerQueue.length;
                this.customerQueue.forEach(c => {
                    if (c && c.destroy) c.destroy();
                });
                this.customerQueue = [];
                for (let i = 0; i < count; i++) {
                    const personSprite = this.add.sprite(0, 0, 'person');
                    const bagSprite = this.add.sprite(0, 10, 'bag');
                    const customerContainer = this.add.container(-25, this.gatePos ? this.gatePos.y : 600, [personSprite, bagSprite]).setDepth(15);
                    if (this.mainContainer) this.mainContainer.add(customerContainer);
                    this.customerQueue.push(customerContainer);
                }
            } else {
                this.customerQueue = [];
                for (let i = 0; i < 2; i++) this.spawnCustomer();
            }

            this.updateUI();
            this.renderHorizontalQueue();
            this.repositionCustomerQueue();
            this.updateIndicators();
        }

        renderTutorialBanner(w, y) {
            const step = this.state.tutorial.step;
            let title = '', tipMsg = '', iconStr = '💡';

            if (step === 1) {
                title = 'TUTORIAL STEP 1: TIP';
                tipMsg = 'Tap on the Tip at the bottom to draw rubbish into your queue!';
                iconStr = '⛏️';
            } else if (step === 2) {
                title = 'TUTORIAL STEP 2: SORT';
                if (this.state.tutorial.interactionMethod === 'drag') {
                    tipMsg = '💡 TIP: if you don’t know where it goes, you can hold and drag it and it will highlight the correct bin.';
                } else if (this.state.tutorial.interactionMethod === 'tap') {
                    tipMsg = 'Great! You can also tap the bin directly to sort!';
                } else {
                    tipMsg = 'On PC, you can press numbers [1, 2, 3, 4] or spacebar!';
                }
                iconStr = '♻️';
            } else if (step === 3) {
                title = 'TUTORIAL STEP 3: GATE';
                tipMsg = 'Tap the Gate to take rubbish from customers and collect cash!';
                iconStr = '🚪';
            } else if (step === 4) {
                title = 'TUTORIAL STEP 4: UPGRADES';
                tipMsg = 'Ooh money! Fill 3 queue items to complete this step!';
                iconStr = '💰';
            } else if (step === 5) {
                title = 'TUTORIAL STEP 5: QUESTS';
                tipMsg = 'These are quests. Turn in any quest to complete the tutorial!';
                iconStr = '📜';
            }

            const boxW = Math.min(w * 0.9, 440);
            const bannerBg = this.add.graphics();
            const isWrongShake = (this.wrongBinTipShake > 0);

            bannerBg.fillStyle(isWrongShake ? 0x4a0000 : 0x1f2937, 0.95);
            bannerBg.fillRect((w - boxW) / 2, y - 20, boxW, 52);
            bannerBg.lineStyle(isWrongShake ? 3 : 2, isWrongShake ? 0xffeb3b : 0x4fc3f7, 1);
            bannerBg.strokeRect((w - boxW) / 2, y - 20, boxW, 52);

            const tText = this.add.text(w / 2, y - 10, \`\${iconStr} \${title}\`, {
                fontSize: '12px', style: 'bold', color: '#ffca28'
            }).setOrigin(0.5);

            const msgText = this.add.text(w / 2, y + 12, tipMsg, {
                fontSize: '10.5px', color: '#ffffff', align: 'center', wordWrap: { width: boxW - 20 }
            }).setOrigin(0.5);

            this.mainContainer.add([bannerBg, tText, msgText]);
        }

        updateIndicators() {
            if (!this.tutorialIndicatorsGfx) return;
            this.tutorialIndicatorsGfx.clear();

            if (!this.state.tutorial.active || this.state.tutorial.step === 0) return;

            const pulse = this.pulsePhase;
            const color = 0xffd700;
            const alpha = pulse ? 1 : 0.4;
            this.tutorialIndicatorsGfx.lineStyle(3, color, alpha);

            const step = this.state.tutorial.step;
            const activeContract = this.contracts && this.contracts[0];
            const isStepCompleted = activeContract && (activeContract.currentVal >= activeContract.req);

            if (isStepCompleted && this.questCardPositions && this.questCardPositions[0]) {
                const cardPos = this.questCardPositions[0];
                this.tutorialIndicatorsGfx.strokeCircle(cardPos.x, cardPos.y, 45);
                return;
            }

            if (step === 1) {
                this.tutorialIndicatorsGfx.strokeCircle(this.tipPos.x, this.tipPos.y, 40);
            } else if (step === 3) {
                this.tutorialIndicatorsGfx.strokeCircle(this.gatePos.x, this.gatePos.y, 40);
            } else if (step === 4) {
                if (this.btnUpgrades) {
                    if (this.btnUpgrades.originX === 0.5) {
                        this.tutorialIndicatorsGfx.strokeRoundedRect(this.btnUpgrades.x - 50, this.btnUpgrades.y - 13, 100, 26, 6);
                    } else {
                        this.tutorialIndicatorsGfx.strokeRect(this.btnUpgrades.x - 110, this.btnUpgrades.y - 2, 115, 28);
                    }
                }
            }
        }

        renderConveyorHUD(w, y) {
            let statusText = '⚙️ Conveyor Idle';
            if (this.currentCraftJob) {
                const nextNames = (this.craftingConveyor || []).map(j => j.recipeName).join(' ➔ ');
                statusText = \`🔥 COOKING: \${this.currentCraftJob.recipeName}\${nextNames ? ' | NEXT: ' + nextNames : ''}\`;
            }

            const hudBox = this.add.text(w / 2, y, statusText, {
                fontSize: '11px', style: 'bold', color: this.currentCraftJob ? '#ffca28' : '#777777',
                backgroundColor: '#111111', padding: { x: 8, y: 3 }
            }).setOrigin(0.5);

            this.mainContainer.add(hudBox);
        }

        renderDecorationsGraphics(w, h, splitY) {
            if (this.decorationsGfx) this.decorationsGfx.destroy();
            this.decorationsGfx = this.add.graphics().setDepth(3);

            // 1. Festive Bunting: Colorful triangular pennants strung across top of screen (clear of XP bar, reaches edges 0 to w!)
            if (this.state.hasBunting) {
                const colors = [0x2196f3, 0xff1744, 0xffeb3b, 0x4caf50];
                let cIdx = 0;
                const ropeY = 8;
                this.decorationsGfx.lineStyle(1.5, 0xffffff, 0.7);
                this.decorationsGfx.lineBetween(0, ropeY, w, ropeY);
                for (let x = 0; x < w; x += 18) {
                    const triW = Math.min(16, w - x);
                    this.decorationsGfx.fillStyle(colors[cIdx % 4], 0.95);
                    this.decorationsGfx.fillTriangle(x, ropeY, x + triW, ropeY, x + (triW / 2), ropeY + 11);
                    cIdx++;
                }
            }

            // 2. Perimeter Bushes / Trees: Anchored directly flush to splitY ground horizon across full width
            if (this.state.hasTrees) {
                const baseY = (splitY || 280);
                for (let x = -5; x <= w + 10; x += 28) {
                    // Deep forest base - flush to ground horizon
                    this.decorationsGfx.fillStyle(0x1b5e20, 1);
                    this.decorationsGfx.fillRoundedRect(x, baseY - 22, 26, 24, 6);
                    // Mid-tone rich foliage
                    this.decorationsGfx.fillStyle(0x2e7d32, 1);
                    this.decorationsGfx.fillCircle(x + 13, baseY - 15, 11);
                    // Top vibrant foliage highlight
                    this.decorationsGfx.fillStyle(0x388e3c, 1);
                    this.decorationsGfx.fillCircle(x + 13, baseY - 21, 7.5);
                }
            }

            // 3. Fairy Lights: Warm glowing fairy lights nestled into the taller bushes
            if (this.state.hasFairyLights && this.state.hasTrees) {
                const baseY = (splitY || 280);
                for (let x = -5; x <= w + 10; x += 28) {
                    // Staggered light 1 (upper left)
                    const lx1 = x + 6, ly1 = baseY - 20;
                    this.decorationsGfx.fillStyle(0xffeb3b, 0.35);
                    this.decorationsGfx.fillCircle(lx1, ly1, 5);
                    this.decorationsGfx.fillStyle(0xfff9c4, 1);
                    this.decorationsGfx.fillCircle(lx1, ly1, 2);

                    // Staggered light 2 (mid right)
                    const lx2 = x + 19, ly2 = baseY - 13;
                    this.decorationsGfx.fillStyle(0xffeb3b, 0.35);
                    this.decorationsGfx.fillCircle(lx2, ly2, 5);
                    this.decorationsGfx.fillStyle(0xfff9c4, 1);
                    this.decorationsGfx.fillCircle(lx2, ly2, 2);

                    // Staggered light 3 (center peak)
                    const lx3 = x + 13, ly3 = baseY - 24;
                    this.decorationsGfx.fillStyle(0xffd54f, 0.4);
                    this.decorationsGfx.fillCircle(lx3, ly3, 4);
                    this.decorationsGfx.fillStyle(0xffffff, 1);
                    this.decorationsGfx.fillCircle(lx3, ly3, 1.8);
                }
            }

            // 4. Diamond Accents
            if (this.state.hasDiamonds) {
                this.decorationsGfx.fillStyle(0x00e5ff, 0.85);
                this.decorationsGfx.fillTriangle(14, h / 2, 22, h / 2 - 8, 30, h / 2);
                this.decorationsGfx.fillTriangle(14, h / 2, 22, h / 2 + 8, 30, h / 2);
                this.decorationsGfx.fillTriangle(w - 30, h / 2, w - 22, h / 2 - 8, w - 14, h / 2);
                this.decorationsGfx.fillTriangle(w - 30, h / 2, w - 22, h / 2 + 8, w - 14, h / 2);
            }
        }

        renderMeadowShopLine(w, splitY) {
            this.splitY = splitY;
            const metrics = this.getShopLayoutMetrics(w);
            const shopScale = metrics.shopScale || 1;
            const walkY = splitY - Math.round(22 * shopScale);
            const blockY = splitY - Math.round(metrics.bh / 2);
            this.shopWalkY = walkY;

            this.renderRepresentativeBlocks(metrics.storeX, metrics.factoryX, blockY, metrics.bw, metrics.bh);

            if (!this.shopCustomers) this.shopCustomers = [];

            // Rebuild visual containers for active customers on new mainContainer
            this.shopCustomers.forEach((cust, idx) => {
                if (cust.container) {
                    cust.container.destroy();
                    cust.container = null;
                }
                const targetX = metrics.getSlotX(idx);
                this.createBuyerContainer(cust, idx, walkY, targetX);
            });

            // Populate up to 3 customers if needed
            while (this.shopCustomers.length < 3) {
                this.spawnShopCustomer(true);
            }
        }

        renderRepresentativeBlocks(storeX, factoryX, blockY, bw = 72, bh = 56) {
            // STORE BLOCK
            const storeContainer = this.add.container(storeX, blockY).setDepth(6);
            const sGfx = this.add.graphics();
            sGfx.fillStyle(0x1e293b, 0.95);
            sGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 7);
            sGfx.lineStyle(2, 0x475569, 1);
            sGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 7);
            // Green & white awning
            const awningH = 11;
            sGfx.fillStyle(0x15803d, 1);
            sGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, awningH, 3);
            sGfx.fillStyle(0xffffff, 0.35);
            sGfx.fillRect(-bw / 2 + Math.round(bw * 0.18), -bh / 2, Math.round(bw * 0.16), awningH);
            sGfx.fillRect(-bw / 2 + Math.round(bw * 0.52), -bh / 2, Math.round(bw * 0.16), awningH);

            const storeIcon = this.add.text(0, -6, '🏪', { fontSize: bw < 60 ? '20px' : '23px' }).setOrigin(0.5);
            const storeLabel = this.add.text(0, Math.round(bh / 2) - 10, 'STORE', {
                fontSize: bw < 60 ? '9.5px' : '11px', style: 'bold', color: '#86efac'
            }).setOrigin(0.5);
            storeContainer.add([sGfx, storeIcon, storeLabel]);
            storeContainer.setSize(bw, bh);
            storeContainer.setInteractive({ useHandCursor: true });
            storeContainer.on('pointerup', () => {
                this.refreshBuyerBubbles();
            });

            // FACTORY BLOCK (Click to enter Factory Crafting Workshop)
            const isFactUnlocked = !!this.state.factoryUnlocked;
            const factoryContainer = this.add.container(factoryX, blockY).setDepth(6);
            const fGfx = this.add.graphics();

            // When unlocked: NOT greyed out! Rich industrial slate/cyan metallic look
            const factBgColor = isFactUnlocked ? 0x0f2a4a : 0x242d38;
            const factBorderColor = isFactUnlocked ? 0x00e5ff : 0x475569;
            const factChimneyColor = isFactUnlocked ? 0x0284c7 : 0x334155;
            const factTrimColor = isFactUnlocked ? 0x38bdf8 : 0x64748b;

            fGfx.fillStyle(factBgColor, 0.95);
            fGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 7);
            fGfx.lineStyle(2, factBorderColor, 1);
            fGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 7);

            // Chimney stack
            fGfx.fillStyle(factChimneyColor, 1);
            fGfx.fillRect(bw / 2 - 16, -bh / 2 - 10, 10, 10);
            fGfx.lineStyle(1.5, factTrimColor, 0.9);
            fGfx.strokeRect(bw / 2 - 16, -bh / 2 - 10, 10, 10);

            // Unlocked roof indicator bar
            if (isFactUnlocked) {
                fGfx.fillStyle(0x0284c7, 1);
                fGfx.fillRoundedRect(-bw / 2 + 3, -bh / 2 + 2, bw - 6, 4, 2);
            }

            const factoryIcon = this.add.text(0, -6, '🏭', {
                fontSize: bw < 60 ? '20px' : '23px'
            }).setOrigin(0.5);
            if (!isFactUnlocked) {
                factoryIcon.setAlpha(0.65);
            }

            const factoryLabel = this.add.text(0, Math.round(bh / 2) - 10, isFactUnlocked ? 'FACTORY' : 'FACTORY 🔒', {
                fontSize: bw < 60 ? '9.5px' : '10.5px',
                style: 'bold',
                color: isFactUnlocked ? '#38bdf8' : '#f59e0b'
            }).setOrigin(0.5);

            factoryContainer.add([fGfx, factoryIcon, factoryLabel]);
            factoryContainer.setSize(bw, bh);
            factoryContainer.setInteractive({ useHandCursor: true });
            factoryContainer.on('pointerup', () => {
                this.openModal('factory');
            });

            this.mainContainer.add([storeContainer, factoryContainer]);
        }

        updateCustomerShopUI() {
            this.refreshBuyerBubbles();
        }

        renderWorkshopsUI(w, h, y) {
            const isMobile = h > w && w < 600;
            const shops = [
                {
                    id: 'organic', name: 'GREEN SHOP', color: '#2e7d32',
                    unlocked: this.state.binUpgrades.organic.shopUnlocked,
                    tier2Unlocked: this.state.binUpgrades.organic.tier2Unlocked,
                    tier3Unlocked: this.state.binUpgrades.organic.tier3Unlocked,
                    recipes: [
                        { name: 'Fertilizer', key: 'fertilizer', req: '5G', costVal: 5, resKey: 'organic', tier: 1 },
                        { name: 'Biofuel', key: 'biofuel', req: '10G', costVal: 10, resKey: 'organic', tier: 2 },
                        { name: 'Compost', key: 'compost', req: '15G', costVal: 15, resKey: 'organic', tier: 3 }
                    ]
                },
                {
                    id: 'paper', name: 'PAPER SHOP', color: '#1565c0',
                    unlocked: this.state.binUpgrades.paper.shopUnlocked,
                    tier2Unlocked: this.state.binUpgrades.paper.tier2Unlocked,
                    tier3Unlocked: this.state.binUpgrades.paper.tier3Unlocked,
                    recipes: [
                        { name: 'Rec.Paper', key: 'recycled_paper', req: '5P', costVal: 5, resKey: 'paper', tier: 1 },
                        { name: 'Cardboard', key: 'cardboard', req: '10P', costVal: 10, resKey: 'paper', tier: 2 },
                        { name: 'Notebook', key: 'notebook', req: '15P', costVal: 15, resKey: 'paper', tier: 3 }
                    ]
                },
                {
                    id: 'glass', name: 'GLASS SHOP', color: '#6a1b9a',
                    unlocked: this.state.binUpgrades.glass.shopUnlocked,
                    tier2Unlocked: this.state.binUpgrades.glass.tier2Unlocked,
                    tier3Unlocked: this.state.binUpgrades.glass.tier3Unlocked,
                    recipes: [
                        { name: 'Glass Vase', key: 'glass_vase', req: '5Gl', costVal: 5, resKey: 'glass', tier: 1 },
                        { name: 'Mirror', key: 'mirror', req: '10Gl', costVal: 10, resKey: 'glass', tier: 2 },
                        { name: 'Lens', key: 'lens', req: '15Gl', costVal: 15, resKey: 'glass', tier: 3 }
                    ]
                },
                {
                    id: 'plastic', name: 'PLASTIC SHOP', color: '#f57f17',
                    unlocked: this.state.binUpgrades.plastic.shopUnlocked,
                    tier2Unlocked: this.state.binUpgrades.plastic.tier2Unlocked,
                    tier3Unlocked: this.state.binUpgrades.plastic.tier3Unlocked,
                    recipes: [
                        { name: 'Filament', key: 'filament', req: '5Pl', costVal: 5, resKey: 'plastic', tier: 1 },
                        { name: 'Brick', key: 'plastic_brick', req: '10Pl', costVal: 10, resKey: 'plastic', tier: 2 },
                        { name: 'Pipe', key: 'pipe', req: '15Pl', costVal: 15, resKey: 'plastic', tier: 3 }
                    ]
                }
            ];

            let boxW, gap, startX;

            if (isMobile) {
                const sidePadding = 18; gap = 12;
                boxW = Math.floor((w - (sidePadding * 2) - gap) / 2);
                startX = Math.round(sidePadding + (boxW / 2));
            } else {
                const maxTotalW = Math.min(w - 40, 850); gap = 18;
                boxW = Math.floor((maxTotalW - (3 * gap)) / 4);
                startX = Math.round((w - maxTotalW) / 2 + (boxW / 2));
            }

            const boxH = 90;

            shops.forEach((s, idx) => {
                let sx, sy;
                if (isMobile) {
                    sx = Math.round((idx % 2 === 0) ? startX : startX + boxW + gap);
                    sy = y + (Math.floor(idx / 2) * 100);
                } else {
                    sx = Math.round(startX + (idx * (boxW + gap)));
                    sy = y;
                }

                const hexCol = Phaser.Display.Color.ValueToColor(s.color).color;

                if (s.unlocked) {
                    const shopYPos = sy + 18;

                    const box = this.add.graphics();
                    box.lineStyle(2, hexCol, 1);
                    box.strokeRect(sx - (boxW/2), shopYPos - 18, boxW, boxH);

                    const header = this.add.graphics();
                    header.fillStyle(hexCol, 1);
                    header.fillRect(sx - (boxW/2), shopYPos - 18, boxW, 20);

                    const title = this.add.text(sx, shopYPos - 8, s.name, { fontSize: '12px', style: 'bold', color: '#fff' }).setOrigin(0.5);
                    this.mainContainer.add([box, header, title]);

                    s.recipes.forEach((r, rIdx) => {
                        const ry = shopYPos + 12 + (rIdx * 22);
                        const bUp = this.state.binUpgrades[s.id];
                        const isTierUnlocked = (r.tier === 1 && bUp.t1Bought) || (r.tier === 2 && bUp.tier2Unlocked) || (r.tier === 3 && bUp.tier3Unlocked);

                        if (!isTierUnlocked) {
                            let lockText = '';
                            let canAffordTier = false;
                            let unlockFn = () => {};

                            if (r.tier === 1) {
                                lockText = '[T1 Locked] $5 + 5 Tokens';
                                canAffordTier = this.state.money >= 5 && this.state.resources[s.id] >= 5;
                                unlockFn = () => {
                                    if (canAffordTier) {
                                        this.state.money -= 5;
                                        this.state.resources[s.id] -= 5;
                                        bUp.t1Bought = true;
                                        this.requestLayoutRebuild();
                                    }
                                };
                            } else if (r.tier === 2) {
                                lockText = '[T2 Locked] $10 + 10 Tokens';
                                canAffordTier = bUp.t1Bought && this.state.money >= 10 && this.state.resources[s.id] >= 10;
                                unlockFn = () => {
                                    if (canAffordTier) {
                                        this.state.money -= 10;
                                        this.state.resources[s.id] -= 10;
                                        bUp.tier2Unlocked = true;
                                        this.requestLayoutRebuild();
                                    }
                                };
                            } else if (r.tier === 3) {
                                lockText = '[T3 Locked] $15 + 15 Tokens';
                                canAffordTier = bUp.tier2Unlocked && this.state.money >= 15 && this.state.resources[s.id] >= 15;
                                unlockFn = () => {
                                    if (canAffordTier) {
                                        this.state.money -= 15;
                                        this.state.resources[s.id] -= 15;
                                        bUp.tier3Unlocked = true;
                                        this.requestLayoutRebuild();
                                    }
                                };
                            }

                            const btnLockTier = this.add.text(sx, ry, lockText, {
                                fontSize: '9px', style: 'bold',
                                backgroundColor: canAffordTier ? '#ff9800' : '#2b2b2b',
                                color: canAffordTier ? '#000000' : '#aaaaaa',
                                padding: { x: 3, y: 1 }
                            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                            btnLockTier.on('pointerup', unlockFn);
                            this.mainContainer.add(btnLockTier);
                        } else {
                            const ownedCount = this.state.crafted[r.key] || 0;
                            const canCraft = this.state.resources[r.resKey] >= r.costVal;

                            const label = this.add.text(sx - (boxW/2) + 6, ry, '(' + ownedCount + ') ' + r.name, { fontSize: '10.5px', color: '#fff', style: 'bold' }).setOrigin(0, 0.5);
                            const btnCraft = this.add.text(sx + (boxW/2) - 6, ry, r.req, {
                                fontSize: '10.5px', style: 'bold',
                                backgroundColor: canCraft ? '#00e676' : '#424242',
                                color: canCraft ? '#000' : '#aaa', padding: {x: 4, y: 1}
                            }).setOrigin(1, 0.5);

                            if (canCraft) {
                                btnCraft.setInteractive({ useHandCursor: true }).on('pointerup', () => {
                                    this.state.resources[r.resKey] -= r.costVal;
                                    if (!this.craftingConveyor) this.craftingConveyor = [];
                                    this.craftingConveyor.push({ shopId: s.id, recipeKey: r.key, recipeName: r.name });
                                    this.processCraftingConveyor();
                                    this.requestLayoutRebuild();
                                });
                            }
                            this.mainContainer.add([label, btnCraft]);
                        }
                    });

                } else {
                    const emptyBox = this.add.graphics();
                    emptyBox.lineStyle(1.5, 0x444444, 1);
                    emptyBox.strokeRect(sx - (boxW/2), sy - 18, boxW, boxH);

                    const title = this.add.text(sx, sy + 10, s.name + '\\n(Locked)', { fontSize: '11px', style: 'bold', color: '#666', align: 'center' }).setOrigin(0.5);

                    const btnBuy = this.add.text(sx, sy - 2, 'BUY WORKSHOPS FACILITY\\n($50 Cash)', {
                        fontSize: '9.5px', style: 'bold', backgroundColor: '#333', color: '#ffd700', align: 'center', padding: 4
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                    btnBuy.on('pointerup', () => {
                        if (this.state.money >= 50) {
                            this.state.money -= 50;
                            this.state.unlockedWorkshopsFacility = true;
                            Object.keys(this.state.binUpgrades).forEach(bId => {
                                this.state.binUpgrades[bId].shopUnlocked = true;
                            });
                            this.requestLayoutRebuild();
                        }
                    });

                    this.mainContainer.add([emptyBox, title, btnBuy]);
                }
            });
        }

        processCraftingConveyor() {
            if (!this.craftingConveyor) this.craftingConveyor = [];
            if (this.currentCraftJob || this.craftingConveyor.length === 0) return;

            this.currentCraftJob = this.craftingConveyor.shift();
            this.requestLayoutRebuild();

            this.time.delayedCall(1000, () => {
                if (this.currentCraftJob) {
                    if (!this.state.crafted) this.state.crafted = {};
                    this.state.crafted[this.currentCraftJob.recipeKey] = (this.state.crafted[this.currentCraftJob.recipeKey] || 0) + 1;
                    this.addXP(10);
                    this.currentCraftJob = null;
                }
                this.requestLayoutRebuild();

                this.processCraftingConveyor();
            });
        }

        renderCenteredXPBar(w, y) {
            const lm = this.layoutMetrics;
            const isMobile = lm ? lm.isMobile : (w < 560);
            const safeLeft = lm ? lm.safeLeft : 0;
            const safeRight = lm ? lm.safeRight : 0;
            const usableW = Math.max(260, w - safeLeft - safeRight);

            let barW, bx;
            if (isMobile) {
                barW = Math.min(usableW - 24, 280);
                bx = Math.round(safeLeft + (usableW - barW) / 2);
            } else {
                // Keep XP bar cleanly between HUD card (left) and nav buttons (right) even on narrow landscape / tablets
                const hudRight = safeLeft + 16 + Math.min(250, Math.round(usableW * 0.34)) + 10;
                const navLeft = (lm && lm.isShortLandscape)
                    ? (w - safeRight - 240)
                    : (w - safeRight - 135);
                const freeW = navLeft - hudRight;
                if (freeW >= 150) {
                    barW = Math.min(240, freeW - 8);
                    const centeredX = Math.round((w - barW) / 2);
                    bx = Phaser.Math.Clamp(centeredX, hudRight + 4, navLeft - barW - 4);
                } else {
                    barW = Math.min(210, Math.max(140, usableW * 0.34));
                    bx = Math.round((w - barW) / 2);
                }
            }
            const barH = 18;

            const neededXP = this.state.level * 20;
            const pct = Math.min(1, Math.max(0, this.state.xp / neededXP));

            const bgGfx = this.add.graphics();
            bgGfx.fillStyle(0x222222, 1);
            bgGfx.fillRect(bx, y, barW, barH);
            bgGfx.lineStyle(1.5, 0x00ff00, 1);
            bgGfx.strokeRect(bx, y, barW, barH);

            this.xpBarFillGfx = this.add.graphics();
            this.xpBarFillGfx.fillStyle(0x2e7d32, 1);
            this.xpBarFillGfx.fillRect(bx + 1, y + 1, (barW - 2) * pct, barH - 2);

            const sp = this.state.skillPoints || 0;
            this.xpBarText = this.add.text(bx + (barW / 2), y + (barH / 2), 'LVL ' + this.state.level + ' (' + this.state.xp + '/' + neededXP + ' XP) ⭐' + sp + ' SP', {
                fontSize: barW < 185 ? '9.5px' : '10.5px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            this.xpBarConfig = { bx, y, barW, barH, w };

            this.mainContainer.add([bgGfx, this.xpBarFillGfx, this.xpBarText]);
        }

        updateXPBarUI() {
            if (!this.xpBarFillGfx || !this.xpBarText || !this.xpBarConfig) return;
            const { bx, y, barW, barH, w } = this.xpBarConfig;
            const neededXP = this.state.level * 20;
            const pct = Math.min(1, Math.max(0, this.state.xp / neededXP));

            this.xpBarFillGfx.clear();
            this.xpBarFillGfx.fillStyle(0x2e7d32, 1);
            this.xpBarFillGfx.fillRect(bx + 1, y + 1, (barW - 2) * pct, barH - 2);

            const sp = this.state.skillPoints || 0;
            this.xpBarText.setText('LVL ' + this.state.level + ' (' + this.state.xp + '/' + neededXP + ' XP) ⭐' + sp + ' SP');
        }

        renderTopHUDBar(w, topBarY, isMobile) {
            const lm = this.layoutMetrics;
            const safeLeft = lm ? lm.safeLeft : 0;
            const usableW = lm ? lm.usableW : w;
            const cardX = isMobile ? (safeLeft + 10) : (safeLeft + 16);
            const cardY = lm ? lm.hudCardY : (isMobile ? (topBarY + 22) : 20);
            const cardW = isMobile ? (usableW - 20) : Math.min(255, Math.round(usableW * 0.36));
            const hasExtraTypes = (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric);
            const cardH = lm ? lm.hudCardH : (hasExtraTypes ? 68 : 54);

            const cardBg = this.add.graphics();
            // Solid dark charcoal background for maximum contrast against blue sky
            cardBg.fillStyle(0x131a26, 0.94);
            cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
            // Rich brown outer border
            cardBg.lineStyle(2, 0x6d4c41, 1);
            cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);
            // Subtle dark inner trim
            cardBg.lineStyle(1, 0x1f2937, 0.8);
            cardBg.strokeRoundedRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4, 6);

            const r = this.state.resources;
            let text = '💵 Cash: $' + this.state.money + '  |  ⭐ SP: ' + (this.state.skillPoints || 0) + '\\n' +
                       '🟢 Organic: ' + r.organic + '   🔵 Paper: ' + r.paper + '\\n' +
                       '🟡 Plastic: ' + r.plastic + '   🟣 Glass: ' + r.glass;
            if (hasExtraTypes) {
                text += '\\n';
                if (this.state.unlockedTypes.metal) text += '⚪ Metal: ' + (r.metal || 0) + '   ';
                if (this.state.unlockedTypes.fabric) text += '🌸 Fabric: ' + (r.fabric || 0);
            }

            this.hudTextObj = this.add.text(cardX + 9, cardY + 5, text, {
                fontSize: (cardW < 235 || w < 350) ? '10px' : '11px', style: 'bold', color: '#ffffff', lineSpacing: 2
            });

            this.mainContainer.add([cardBg, this.hudTextObj]);
            return cardY + cardH;
        }

        drawAutoGateProgress(progress) {
            if (!this.autoGateGfx) return;
            this.autoGateGfx.clear();
            if (!this.state.isGateAuto) return;

            const gSz = this.currentGateSize || 62;
            const cx = this.gatePos.x - Math.round(gSz * 0.72);
            const cy = this.gatePos.y + Math.round(gSz * 0.35);
            this.autoGateGfx.lineStyle(2, 0x555555, 1);
            this.autoGateGfx.strokeCircle(cx, cy, 9);

            if (progress > 0) {
                this.autoGateGfx.lineStyle(3, 0x00ff00, 1);
                this.autoGateGfx.beginPath();
                this.autoGateGfx.arc(cx, cy, 9, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * progress)), false);
                this.autoGateGfx.strokePath();
            }
        }

        drawAutoQueueProgress(progress) {
            if (!this.autoQueueGfx) return;
            this.autoQueueGfx.clear();
            if (!this.state.unlockedAutoQueue) return;

            const cx = this.tipPos.x + 48; const cy = this.tipPos.y + 16;
            this.autoQueueGfx.lineStyle(2, 0x555555, 1);
            this.autoQueueGfx.strokeCircle(cx, cy, 9);

            if (progress > 0) {
                this.autoQueueGfx.lineStyle(3, 0x00e676, 1);
                this.autoQueueGfx.beginPath();
                this.autoQueueGfx.arc(cx, cy, 9, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * progress)), false);
                this.autoQueueGfx.strokePath();
            }
        }

        drawAutoSortProgress(progress) {
            if (!this.autoSortGfx) return;
            this.autoSortGfx.clear();
            const excess = this.state.excessTrashCount || 0;
            if (!this.state.unlockedAutoSort || excess <= 0) return;

            const targetX = (this.overflowBlockContainer && this.overflowBlockContainer.visible) ?
                this.overflowBlockContainer.x : (this.queueStartX + 500);
            const targetY = this.queueY;

            if (progress > 0) {
                this.autoSortGfx.lineStyle(3, 0x00e676, 1);
                this.autoSortGfx.beginPath();
                this.autoSortGfx.arc(targetX, targetY, 28, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * progress)), false);
                this.autoSortGfx.strokePath();
            }
        }

        setupLongPress(sprite, targetType, tapCallback = null, ringX = null, ringY = null) {
            sprite.on('pointerdown', () => {
                if (this.draggedItem) return;
                this.clearLongPress();
                this.isHolding = true;
                this.longPressTriggered = false;
                const downWallTime = Date.now();
                const cx = (ringX !== null) ? ringX : sprite.x;
                const cy = (ringY !== null) ? ringY : sprite.y;

                this.pressTimer = this.time.addEvent({
                    delay: 25,
                    repeat: 30,
                    callback: () => {
                        if (!this.isHolding) return;
                        const elapsed = Date.now() - downWallTime;

                        if (elapsed >= 250) {
                            const progress = (elapsed - 250) / 300;
                            this.drawLongPressFill(cx, cy, progress);
                        }

                        if (elapsed >= 550) {
                            this.longPressTriggered = true;
                            this.clearLongPress();
                            this.openModal('upgrades', targetType);
                        }
                    }
                });
            });

            sprite.on('pointerup', () => {
                const wasHolding = this.isHolding;
                const didLongPress = this.longPressTriggered;
                this.clearLongPress();

                if (wasHolding && !didLongPress) {
                    if (typeof tapCallback === 'function') {
                        tapCallback();
                    } else if (targetType === 'gate') {
                        this.triggerGate();
                    } else if (targetType === 'tip') {
                        this.queueTrashFromTip();
                    }
                }
            });

            sprite.on('pointerout', () => this.clearLongPress());
        }

        drawLongPressFill(x, y, progress) {
            this.longPressGfx.clear();
            this.longPressGfx.lineStyle(3, 0x00ff00, 1);
            this.longPressGfx.beginPath();
            this.longPressGfx.arc(x, y, 35, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * Math.min(1, progress))), false);
            this.longPressGfx.strokePath();
        }

        clearLongPress() {
            this.isHolding = false;
            if (this.pressTimer) this.pressTimer.destroy();
            this.pressTimer = null;
            if (this.longPressGfx) this.longPressGfx.clear();
        }

        createTopNavButtons(w, isMobile = false, hudBottomY = 90) {
            const hasAnyAfford = this.hasCategoryAffordable('gate') || this.hasCategoryAffordable('conveyor') || this.hasCategoryAffordable('skills');
            const lm = this.layoutMetrics;
            const safeLeft = lm ? lm.safeLeft : 0;
            const safeRight = lm ? lm.safeRight : 0;
            const usableW = lm ? lm.usableW : w;

            if (isMobile) {
                const sideMargin = 10;
                const gap = 6;
                const btnW = Math.floor((usableW - (2 * sideMargin) - (2 * gap)) / 3);
                const btnH = lm ? lm.navH : 28;
                const navY = lm ? lm.navY : (hudBottomY + 5);

                const makeMobileNavBtn = (centerX, label, color, onClick) => {
                    const btnGfx = this.add.graphics();
                    btnGfx.fillStyle(0x1e293b, 0.95);
                    btnGfx.fillRoundedRect(centerX - (btnW / 2), navY, btnW, btnH, 6);
                    btnGfx.lineStyle(1.5, 0x475569, 1);
                    btnGfx.strokeRoundedRect(centerX - (btnW / 2), navY, btnW, btnH, 6);

                    const txt = this.add.text(centerX, navY + (btnH / 2), label, {
                        fontSize: (usableW < 360) ? '9.5px' : '10.5px',
                        style: 'bold',
                        color: color
                    }).setOrigin(0.5);

                    const hitZone = this.add.zone(centerX, navY + (btnH / 2), btnW, Math.max(32, btnH))
                        .setInteractive({ useHandCursor: true });
                    hitZone.on('pointerup', onClick);

                    this.mainContainer.add([btnGfx, txt, hitZone]);
                    return { txt, hitZone, btnGfx };
                };

                const x1 = Math.round(safeLeft + sideMargin + (btnW / 2));
                const x2 = Math.round(safeLeft + (usableW / 2));
                const x3 = Math.round(w - safeRight - sideMargin - (btnW / 2));

                makeMobileNavBtn(x1, '🪴 DECOR', '#a5d6a7', () => this.openModal('decorations'));

                const upgObj = makeMobileNavBtn(x2, hasAnyAfford ? '🛠️ UPGRADE!' : '🛠️ UPGRADES', '#4fc3f7', () => {
                    this.openModal('upgrades', 'gate');
                });
                this.btnUpgrades = upgObj.txt;

                makeMobileNavBtn(x3, '🕹️ ARCADE', '#ffeb3b', () => this.openArcadeModal());
            } else if (lm && lm.isShortLandscape) {
                // Horizontal compact row in top-right for short landscape devices (phones rotated sideways)
                const navY = lm.topBarY;
                let rx = w - safeRight - 14;
                const btnArcade = this.add.text(rx, navY, '🕹️ ARCADE', { fontSize: '10px', style: 'bold', color: '#ffeb3b', backgroundColor: '#1e293b', padding: { x: 6, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openArcadeModal());
                rx -= (btnArcade.width + 6);
                this.btnUpgrades = this.add.text(rx, navY, hasAnyAfford ? '🛠️ UPGRADE!' : '🛠️ UPGRADES', { fontSize: '10px', style: 'bold', color: '#4fc3f7', backgroundColor: '#1e293b', padding: { x: 6, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openModal('upgrades', 'gate'));
                rx -= (this.btnUpgrades.width + 6);
                const btnDecor = this.add.text(rx, navY, '🪴 DECOR', { fontSize: '10px', style: 'bold', color: '#a5d6a7', backgroundColor: '#1e293b', padding: { x: 6, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openModal('decorations'));

                this.mainContainer.add([btnDecor, this.btnUpgrades, btnArcade]);
            } else {
                const rx = w - safeRight - 16;
                const y0 = lm ? lm.topBarY : 20;
                const btnDecor = this.add.text(rx, y0, '🪴 DECOR', { fontSize: '11px', style: 'bold', color: '#a5d6a7', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openModal('decorations'));

                this.btnUpgrades = this.add.text(rx, y0 + 30, hasAnyAfford ? '🛠️ UPGRADES (!)' : '🛠️ UPGRADES', { fontSize: '11px', style: 'bold', color: '#4fc3f7', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                        this.openModal('upgrades', 'gate');
                    });

                const btnArcade = this.add.text(rx, y0 + 60, '🕹️ ARCADE', { fontSize: '11px', style: 'bold', color: '#ffeb3b', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                    .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                        this.openArcadeModal();
                    });

                this.mainContainer.add([btnDecor, this.btnUpgrades, btnArcade]);
            }
        }

        createItemGraphic(typeId, itemName, forcedMultiplier = 1, fixedSpriteKey = null) {
            const typeData = TRASH_TYPES[typeId];
            const container = this.add.container(0, 0).setDepth(10);
            if (this.conveyorContainer) this.conveyorContainer.add(container);
            else if (this.mainContainer) this.mainContainer.add(container);
            const isBgUnlocked = this.state.binUpgrades[typeId].bgUnlocked;

            const spriteKey = fixedSpriteKey || typeData.sprites[Math.floor(Math.random() * typeData.sprites.length)];
            const multiplier = forcedMultiplier;

            if (multiplier === 4) {
                // QUADRUPLE: Pile of 4 identical PNG icons
                const offsets = [ {x: -12, y: -12}, {x: 12, y: -12}, {x: -12, y: 12}, {x: 12, y: 12} ];
                offsets.forEach(pos => {
                    if (isBgUnlocked) {
                        const circleGfx = this.add.graphics();
                        circleGfx.fillStyle(typeData.color, 1);
                        circleGfx.fillCircle(pos.x, pos.y, 14);
                        circleGfx.lineStyle(2, 0x000000, 1);
                        circleGfx.strokeCircle(pos.x, pos.y, 14);
                        container.add(circleGfx);
                    }
                    const img = this.add.image(pos.x, pos.y, spriteKey).setDisplaySize(30, 30);
                    container.add(img);
                });
            } else if (multiplier === 2) {
                // DOUBLE: 2 identical PNG icons (top-right & bottom-left)
                const offsets = [ {x: 8, y: -8, sz: 40}, {x: -6, y: 6, sz: 44} ];
                offsets.forEach(pos => {
                    if (isBgUnlocked) {
                        const circleGfx = this.add.graphics();
                        circleGfx.fillStyle(typeData.color, 1);
                        circleGfx.fillCircle(pos.x, pos.y, 20);
                        circleGfx.lineStyle(2.5, 0x000000, 1);
                        circleGfx.strokeCircle(pos.x, pos.y, 20);
                        container.add(circleGfx);
                    }
                    const img = this.add.image(pos.x, pos.y, spriteKey).setDisplaySize(pos.sz, pos.sz);
                    container.add(img);
                });
            } else {
                // SINGLE: 1 icon centered at full original 52x52 size
                if (isBgUnlocked) {
                    const circleGfx = this.add.graphics();
                    circleGfx.fillStyle(typeData.color, 1);
                    circleGfx.fillCircle(0, 0, 26);
                    circleGfx.lineStyle(3, 0x000000, 1);
                    circleGfx.strokeCircle(0, 0, 26);
                    container.add(circleGfx);
                }
                const img = this.add.image(0, 0, spriteKey).setDisplaySize(52, 52);
                container.add(img);
            }

            container.spriteKey = spriteKey;
            container.multiplier = multiplier;
            return container;
        }

        queueTrashFromTip() {
            if (this.state.tipStockpile <= 0) return;
            if (this.trashQueue.length >= this.state.maxTrashQueue) return;

            if (this.state.tutorial.active && this.state.tutorial.step === 1) {
                this.state.tutorial.tipTapped = 1;
                this.generateQuests();
                this.requestLayoutRebuild();
            }

            this.state.tipStockpile -= 1;

            const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
            const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
            const typeData = TRASH_TYPES[typeKey];
            const itemName = typeData.items[Math.floor(Math.random() * typeData.items.length)];

            const startMult = (Math.random() < this.state.doubleTokenChance) ? 2 : 1;
            const container = this.createItemGraphic(typeData.id, itemName, startMult);
            container.setPosition(this.tipPos.x, this.tipPos.y);

            this.trashQueue.push({ container, type: typeData.id, multiplier: startMult, spriteKey: container.spriteKey });

            if (this.state.tutorial.active && this.state.tutorial.step === 4) {
                this.generateQuests();
                this.requestLayoutRebuild();
            }

            this.renderHorizontalQueue();
            this.updateUI();
        }

        getQueueSlotX(idx) {
            const width = (this.scale && this.scale.width) ? this.scale.width : (window.innerWidth || 800);
            const height = (this.scale && this.scale.height) ? this.scale.height : (window.innerHeight || 600);
            const lm = this.layoutMetrics;
            const isMobile = lm ? lm.isMobile : ((height > width && width < 640) || width < 560);
            const safeLeft = lm ? lm.safeLeft : 0;
            const usableW = lm ? lm.usableW : width;
            const qScale = lm ? (lm.queueScale || 1) : 1;

            const minPad = safeLeft + (isMobile ? 10 : 18);
            const baseGap = Math.round(56 * qScale);
            const weights = [1.0, 0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25];
            const totalWeight = 5.8;

            const availAssemblyW = Math.max(240, usableW - (isMobile ? 20 : 36));
            const availQueueSpan = Math.max(140, availAssemblyW - Math.round(84 * qScale));
            const actualQueueSpan = Math.min(9 * baseGap, availQueueSpan);
            const overflowGap = (actualQueueSpan >= 9 * baseGap) ? Math.round(44 * qScale) : Math.round(34 * qScale);
            const totalQueueW = Math.round(28 * qScale) + actualQueueSpan + overflowGap + Math.round(22 * qScale);
            const sidePadding = Math.max(minPad, Math.floor(safeLeft + (usableW - totalQueueW) / 2));
            const qStartX = sidePadding + Math.round(28 * qScale);

            if (idx === 0) return qStartX;
            if (actualQueueSpan >= 9 * baseGap) {
                return qStartX + (idx * baseGap);
            }
            let x = qStartX;
            for (let i = 0; i < idx; i++) {
                x += (weights[i] / totalWeight) * actualQueueSpan;
            }
            return Math.round(x);
        }

        findDropTargetBin(itemX, itemY, pointerX, pointerY) {
            if (!this.bins || this.bins.length === 0) return null;
            const spacing = this.currentBinSpacing || 80;
            const binTop = this.currentBinTopY || (this.bins[0].y - 40);
            const binBottom = this.currentBinBaselineY || (this.bins[0].y + 40);

            const candidates = [];
            if (typeof pointerX === 'number' && typeof pointerY === 'number') {
                candidates.push({ x: pointerX, y: pointerY });
            }
            candidates.push({ x: itemX, y: itemY });

            // Generous vertical drop band covering above bin labels to well below bin base
            const zoneTop = binTop - 38;
            const zoneBottom = binBottom + 48;
            const halfColW = Math.max(spacing * 0.56, 42);

            for (const pt of candidates) {
                if (pt.y >= zoneTop && pt.y <= zoneBottom) {
                    let bestBin = null;
                    let bestDx = Infinity;
                    for (const b of this.bins) {
                        const dx = Math.abs(pt.x - b.x);
                        if (dx <= halfColW && dx < bestDx) {
                            bestDx = dx;
                            bestBin = b;
                        }
                    }
                    if (bestBin) return bestBin;
                }
            }

            // Fallback: strictly nearest bin within a generous radial zone
            const maxRadial = Math.max(68, Math.min(96, spacing * 0.85));
            let nearest = null;
            let minDist = Infinity;
            for (const pt of candidates) {
                for (const b of this.bins) {
                    const dist = Phaser.Math.Distance.Between(pt.x, pt.y, b.x, b.y);
                    if (dist < maxRadial && dist < minDist) {
                        minDist = dist;
                        nearest = b;
                    }
                }
            }
            return nearest;
        }

        clearDragBinFeedback() {
            if (!this.bins) return;
            this.bins.forEach(b => {
                if (b.highlightGfx && b.highlightGfx.scene) b.highlightGfx.setVisible(false);
                if (b.hoverGfx && b.hoverGfx.scene) b.hoverGfx.setVisible(false);
                if (b.sprite && b.sprite.scene && b.isSheet && b.baseScale) {
                    b.sprite.setScale(b.baseScale);
                }
            });
            this.hoveredDropBin = null;
        }

        updateDragHoverFeedback(itemX, itemY, pointerX, pointerY) {
            const target = this.findDropTargetBin(itemX, itemY, pointerX, pointerY);
            if (target === this.hoveredDropBin) return;

            if (this.hoveredDropBin) {
                if (this.hoveredDropBin.hoverGfx && this.hoveredDropBin.hoverGfx.scene) {
                    this.hoveredDropBin.hoverGfx.setVisible(false);
                }
                if (this.hoveredDropBin.sprite && this.hoveredDropBin.sprite.scene && this.hoveredDropBin.isSheet && this.hoveredDropBin.baseScale) {
                    this.hoveredDropBin.sprite.setScale(this.hoveredDropBin.baseScale);
                }
            }

            this.hoveredDropBin = target;

            if (target) {
                if (target.hoverGfx && target.hoverGfx.scene) {
                    target.hoverGfx.setVisible(true);
                }
                if (target.sprite && target.sprite.scene && target.isSheet && target.baseScale) {
                    target.sprite.setScale(target.baseScale * 1.07);
                }
            }
        }

        cancelActiveDrag() {
            const item = this.draggedItem;
            this.draggedItem = null;
            this.clearDragBinFeedback();
            if (item && item.container && item.container.scene) {
                const qScale = (this.layoutMetrics && this.layoutMetrics.queueScale) ? this.layoutMetrics.queueScale : 1;
                item.container.setScale(qScale);
                if (this.conveyorContainer && this.conveyorContainer.scene && item.container.parentContainer !== this.conveyorContainer) {
                    this.conveyorContainer.add(item.container);
                }
            }
            this.renderHorizontalQueue();
        }

        renderHorizontalQueue() {
            if (!this.conveyorContainer) return;

            const width = (this.scale && this.scale.width) ? this.scale.width : (window.innerWidth || 800);
            const lm = this.layoutMetrics;
            const isMobile = lm ? lm.isMobile : ((this.scale && this.scale.height > width && width < 640) || width < 560);
            const qScale = lm ? (lm.queueScale || 1) : 1;
            const qY = this.queueY;

            this.fillQueueFromExcess();

            const excess = this.state.excessTrashCount || 0;
            if (this.overflowBlockContainer) {
                if (excess > 0) {
                    const overflowGap = this.queueOverflowGap || Math.round(34 * qScale);
                    const overflowX = Math.min(
                        width - (lm ? lm.safeRight : 0) - Math.round(24 * qScale),
                        this.getQueueSlotX(9) + overflowGap
                    );
                    this.overflowBlockContainer.setPosition(overflowX, qY);
                    const excessLabel = excess > 999 ? '999+' : ('+' + excess);
                    this.overflowNumText.setText(excessLabel);
                    if (excess > 999) {
                        this.overflowNumText.setFontSize('9.5px');
                    } else {
                        this.overflowNumText.setFontSize('11px');
                    }
                    this.overflowBlockContainer.setVisible(true);
                } else {
                    this.overflowBlockContainer.setVisible(false);
                }
            }

            if (this.queueCounterText) {
                this.queueCounterText.setVisible(false);
            }

            if (this.trashQueue.length === 0) {
                if (this.queueHighlight) this.queueHighlight.setVisible(false);
                return;
            }

            const hlSize = Math.round(58 * qScale);
            const hlHalf = Math.round(hlSize / 2);

            this.trashQueue.forEach((item, index) => {
                if (index < 10) {
                    const targetX = this.getQueueSlotX(index);
                    const isBeingDragged = (this.draggedItem === item);

                    if (!item.container || !item.container.scene) {
                        const fixedKey = item.spriteKey || (item.container && item.container.spriteKey);
                        item.spriteKey = fixedKey;
                        item.container = this.createItemGraphic(item.type, null, item.multiplier || 1, fixedKey);
                        item.container.setPosition(targetX, qY);
                    }

                    // NEVER rip an actively dragged item back to the conveyor or strip its drag handlers!
                    if (isBeingDragged) {
                        if (index === 0 && this.queueHighlight) {
                            this.queueHighlight.setVisible(true);
                            this.queueHighlight.setPosition(targetX, qY);
                        }
                        return;
                    }

                    if (this.conveyorContainer && item.container.parentContainer !== this.conveyorContainer) {
                        this.conveyorContainer.add(item.container);
                    }

                    // Stack depth: earlier items sit on top of later bunched items
                    item.container.setDepth(20 - index);
                    item.container.setScale(qScale);

                    let itemAlpha = 1;
                    if (index >= 6) itemAlpha = Math.max(0.2, 1 - ((index - 5) * 0.2));

                    const isHidden = (typeof document !== 'undefined') && (document.hidden || document.visibilityState === 'hidden');
                    if (!isHidden && this.tweens) {
                        this.tweens.killTweensOf(item.container);
                        this.tweens.add({
                            targets: item.container,
                            x: targetX,
                            y: qY,
                            alpha: itemAlpha,
                            duration: 100
                        });
                    } else {
                        if (this.tweens) this.tweens.killTweensOf(item.container);
                        item.container.x = targetX;
                        item.container.y = qY;
                        item.container.alpha = itemAlpha;
                    }

                    if (index === 0) {
                        this.queueHighlight.clear();
                        this.queueHighlight.setDepth(25);
                        this.queueHighlight.lineStyle(4, 0x000000, 0.45);
                        this.queueHighlight.strokeRoundedRect(-hlHalf, -hlHalf, hlSize, hlSize, 8);
                        this.queueHighlight.lineStyle(3, 0xffd700, 1);
                        this.queueHighlight.strokeRoundedRect(-hlHalf, -hlHalf, hlSize, hlSize, 8);
                        this.queueHighlight.setVisible(true);
                        this.queueHighlight.setPosition(targetX, qY);

                        // Generous touch-friendly grab area centered on the hero rubbish item
                        const hitSize = isMobile ? 88 : 74;
                        item.container.setSize(hitSize, hitSize);
                        item.container.setInteractive({ draggable: true, useHandCursor: true });
                        this.input.setDraggable(item.container);

                        item.container.off('drag');
                        item.container.off('dragstart');
                        item.container.off('dragend');

                        item.container.on('dragstart', (pointer) => {
                            if (this.tweens) this.tweens.killTweensOf(item.container);
                            this.draggedItem = item;
                            this.hoveredDropBin = null;

                            // Lift item onto top dragLayer so it ALWAYS draws ABOVE bins & labels!
                            if (this.dragLayer && this.dragLayer.scene) {
                                this.dragLayer.add(item.container);
                            }
                            item.container.setAlpha(1);
                            item.container.setScale(qScale * 1.16);

                            const isTouch = !!(pointer && (pointer.wasTouch || pointer.pointerType === 'touch'));
                            if (pointer) {
                                item.container.x = pointer.x;
                                item.container.y = pointer.y + (isTouch ? -18 : 0);
                            }

                            const correctBin = this.bins.find(b => b.id === item.type);
                            if (correctBin && correctBin.highlightGfx) correctBin.highlightGfx.setVisible(true);
                            this.updateDragHoverFeedback(
                                item.container.x, item.container.y,
                                pointer ? pointer.x : undefined,
                                pointer ? pointer.y : undefined
                            );
                        });

                        item.container.on('drag', (pointer, dragX, dragY) => {
                            if (this.draggedItem !== item) return;
                            const isTouch = !!(pointer && (pointer.wasTouch || pointer.pointerType === 'touch'));
                            const liftY = isTouch ? -18 : 0;
                            const px = pointer ? pointer.x : dragX;
                            const py = pointer ? pointer.y : dragY;
                            item.container.x = px;
                            item.container.y = py + liftY;
                            this.updateDragHoverFeedback(item.container.x, item.container.y, px, py);
                        });

                        item.container.on('dragend', (pointer) => {
                            if (this.draggedItem !== item) return;
                            const px = pointer ? pointer.x : undefined;
                            const py = pointer ? pointer.y : undefined;
                            const droppedBin = this.findDropTargetBin(item.container.x, item.container.y, px, py);

                            this.clearDragBinFeedback();
                            this.draggedItem = null;
                            item.container.setScale(qScale);

                            if (droppedBin && this.trashQueue[0] === item) {
                                this.sortHeadTrash(droppedBin.id, 0);
                            } else {
                                if (this.conveyorContainer && this.conveyorContainer.scene && item.container.scene) {
                                    this.conveyorContainer.add(item.container);
                                }
                                this.renderHorizontalQueue();
                            }
                        });
                    } else {
                        if (item.container.input) item.container.disableInteractive();
                    }
                } else {
                    if (item.container) {
                        item.container.destroy();
                        item.container = null;
                    }
                }
            });

            if (this.trashQueue.length === 0) this.queueHighlight.setVisible(false);
        }

        sortHeadTrash(targetType, itemIndex = 0) {
            if (this.arcadeState && this.arcadeState.active) return;
            if (this.trashQueue.length === 0 || itemIndex >= this.trashQueue.length) return;

            const isManualSort = (itemIndex === 0);
            const item = this.trashQueue.splice(itemIndex, 1)[0];
            if (this.draggedItem === item) {
                this.draggedItem = null;
                this.clearDragBinFeedback();
            }
            const targetBin = this.bins.find(b => b.id === targetType);
            const isCorrect = (item.type === targetType);

            // Tutorial Step 2: Hero rubbish shakes left-to-right on wrong sort
            if (!isCorrect && this.state.tutorial.active && this.state.tutorial.step === 2 && item.container) {
                this.trashQueue.unshift(item);
                this.renderHorizontalQueue();

                const origX = item.container.x;
                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: item.container,
                        x: origX - 12,
                        duration: 55,
                        yoyo: true,
                        repeat: 3,
                        onComplete: () => {
                            item.container.x = origX;
                        }
                    });
                }
                return;
            }

            this.fillQueueFromExcess();
            this.renderHorizontalQueue();

            const hasContainer = !!(item && item.container && item.container.scene);
            const onSortComplete = () => {
                if (hasContainer) item.container.destroy();

                if (isCorrect) {
                    const liveBin = (this.bins && this.bins.find(b => b.id === targetType)) || targetBin;
                    if (liveBin && liveBin.sprite && liveBin.sprite.scene && liveBin.sprite.anims && liveBin.animKey && this.anims && this.anims.exists(liveBin.animKey)) {
                        try { liveBin.sprite.play(liveBin.animKey); } catch (e) {}
                    }

                    if (isManualSort) {
                        this.state.streak++;
                        this.state.streakHighScore = Math.max(this.state.streakHighScore, this.state.streak);
                        this.state.streakTimer = 2000;
                    }

                    let mult = item.multiplier || 1;
                    if (this.state.streak >= 10) {
                        mult *= 2;
                    }
                    this.state.resources[targetType] += mult;
                    this.addXP(mult);

                    if (targetBin) {
                        let popText = '+1 Token';
                        if (this.state.streak >= 10) {
                            popText = '🔥 +' + mult + ' Tokens (2X STREAK!)';
                        } else if (mult > 1) {
                            popText = '+' + mult + ' Tokens (' + mult + 'X!)';
                        }
                        const popOne = this.add.text(targetBin.x, targetBin.y - 15, popText, {
                            fontSize: '14px', style: 'bold', color: mult > 1 ? '#ffd700' : '#00ff00'
                        }).setOrigin(0.5).setDepth(20);

                        const cleanPopOne = () => { if (popOne && popOne.active) popOne.destroy(); };
                        setTimeout(cleanPopOne, 1100);
                        if (this.tweens && this.tweens.add) {
                            this.tweens.add({ targets: popOne, y: popOne.y - 30, alpha: 0, duration: 850, onComplete: cleanPopOne });
                        } else {
                            cleanPopOne();
                        }
                    }
                } else {
                    this.state.streak = 0;
                    this.state.streakTimer = 0;
                    if (this.cameras && this.cameras.main) this.cameras.main.flash(120, 255, 0, 0);
                }

                if (this.dumpsterStreakText) {
                    let streakLabel = '🔥 STREAK: ' + this.state.streak;
                    if (this.state.streak >= 10 && this.state.streakTimer > 0) {
                        streakLabel = '🔥 2X STREAK: ' + this.state.streak + ' (2X BONUS!)';
                    }
                    this.dumpsterStreakText.setText(streakLabel + '  |  BEST: ' + this.state.streakHighScore);
                }
                this.updateUI();
                this.renderHorizontalQueue();
            };

            if (hasContainer && targetBin && this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: item.container,
                    x: targetBin.x,
                    y: targetBin.y,
                    scale: 0.1,
                    duration: 110,
                    onComplete: onSortComplete
                });
            } else {
                onSortComplete();
            }
        }

        addXP(amount) {
            this.state.xp += amount;
            let leveledUp = false;
            let gainedPoints = 0;
            while (this.state.xp >= this.state.level * 20) {
                this.state.xp -= this.state.level * 20;
                this.state.level++;
                this.state.skillPoints = (this.state.skillPoints || 0) + 1;
                gainedPoints++;
                leveledUp = true;
            }

            if (leveledUp) {
                this.showLevelUpNotification(this.state.level, gainedPoints);
            }
            this.updateUI();
        }

        showLevelUpNotification(level, gainedPoints = 1) {
            if (this.lvlUpText) {
                if (this.lvlUpTimeout) {
                    clearTimeout(this.lvlUpTimeout);
                    this.lvlUpTimeout = null;
                }
                if (this.tweens) {
                    this.tweens.killTweensOf(this.lvlUpText);
                }
                if (this.lvlUpText.destroy) {
                    this.lvlUpText.destroy();
                }
                this.lvlUpText = null;
            }

            const ptsText = gainedPoints > 1 ? \`+\${gainedPoints} Skill Points!\` : \`+1 Skill Point!\`;
            const width = (this.scale && this.scale.width) ? this.scale.width : (window.innerWidth || 800);
            const height = (this.scale && this.scale.height) ? this.scale.height : (window.innerHeight || 600);

            const lvlText = this.add.text(width / 2, height / 2, \`🎉 LEVEL UP! (Lv. \${level}) \${ptsText} 🎉\`, {
                fontSize: '22px', style: 'bold', color: '#ffd700', backgroundColor: '#000000', padding: 12
            }).setOrigin(0.5).setDepth(30);

            this.lvlUpText = lvlText;

            const cleanup = () => {
                if (this.lvlUpTimeout) {
                    clearTimeout(this.lvlUpTimeout);
                    this.lvlUpTimeout = null;
                }
                if (this.lvlUpText === lvlText) {
                    this.lvlUpText = null;
                }
                if (lvlText && lvlText.active) {
                    lvlText.destroy();
                }
            };

            this.lvlUpTimeout = setTimeout(cleanup, 1800);

            if (this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: lvlText,
                    scale: 1.25,
                    alpha: 0,
                    duration: 1600,
                    onComplete: cleanup
                });
            } else {
                cleanup();
            }
        }

        closeModal() {
            if (this.modalWheelHandler) {
                this.input.off('wheel', this.modalWheelHandler);
                this.modalWheelHandler = null;
            }
            if (this.modalPointerDownHandler) {
                this.input.off('pointerdown', this.modalPointerDownHandler);
                this.modalPointerDownHandler = null;
            }
            if (this.modalPointerMoveHandler) {
                this.input.off('pointermove', this.modalPointerMoveHandler);
                this.modalPointerMoveHandler = null;
            }
            if (this.modalPointerUpHandler) {
                this.input.off('pointerup', this.modalPointerUpHandler);
                this.modalPointerUpHandler = null;
            }
            if (this.modalMaskGfx) {
                this.modalMaskGfx.destroy();
                this.modalMaskGfx = null;
            }
            if (this.modalContainer) {
                this.modalContainer.destroy(true);
                this.modalContainer = null;
            }
            this.modalWalletTxt = null;
            this.activeModal = null;
        }

        openModal(type, targetCategory = 'gate', preserveScroll = false) {
            this.closeModal();

            this.activeModal = type;
            this.activeUpgradeCategory = targetCategory;
            if (!preserveScroll) {
                this.upgradeScrollY = 0;
            }

            if (this.state.tutorial.active && this.state.tutorial.step === 4) {
                this.state.tutorial.visitedCategoriesSet.add(targetCategory);
                this.generateQuests();
                this.requestLayoutRebuild();
            }

            const w = this.scale.width; 
            const h = this.scale.height;
            const lm = this.layoutMetrics;
            const safeTop = lm ? lm.safeTop : 0;
            const usableW = lm ? lm.usableW : w;
            // Wider, more comfortable modals on PC / wide screens so upgrade descriptions aren't cut off
            const maxModalW = (w >= 900) ? 760 : ((w >= 680) ? 640 : 520);
            const boxW = Math.min(usableW - 16, maxModalW);
            // Fill the exact sky area right down to the horizon line (splitY) with no awkward gap!
            const skyBottomY = (typeof this.splitY === 'number' && this.splitY > 0) ? Math.round(this.splitY) : Math.round(h * 0.42);
            // On very short landscape screens where the sky is tiny (< 210px), allow enough height to read & scroll comfortably
            const modalH = (skyBottomY < 210) ? Math.min(h - 12, 300) : skyBottomY;
            const modalTop = safeTop + 6;
            const boxLeft = Math.round((w - boxW) / 2);

            this.modalContainer = this.add.container(0, 0).setDepth(100);

            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.78);
            overlay.fillRect(0, 0, w, modalH);
            const overlayHit = this.add.zone(w / 2, modalH / 2, w, modalH).setInteractive();
            overlayHit.on('pointerdown', () => {});

            const box = this.add.graphics();
            box.fillStyle(0x1a1a1a, 1);
            box.fillRect(boxLeft, modalTop, boxW, modalH - modalTop - 6);
            box.lineStyle(2, 0x4fc3f7, 1);
            box.strokeRect(boxLeft, modalTop, boxW, modalH - modalTop - 6);

            const closeX = boxLeft + boxW - 46;
            const closeY = modalH - 22;
            const btnClose = this.add.text(closeX, closeY, '[ X ] CLOSE', {
                fontSize: '11.5px', style: 'bold', color: '#ff5555', backgroundColor: '#222222', padding: { x: 8, y: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btnClose.on('pointerup', () => this.closeModal());

            this.modalContainer.add([overlay, overlayHit, box, btnClose]);

            if (type === 'upgrades') this.renderTopHalfUpgradesModal(w, modalH, boxW);
            if (type === 'decorations') this.renderDecorationsModal(w, modalH, boxW);
            if (type === 'factory') this.renderFactoryModal(w, modalH, boxW);
        }

        getUpgradeListForCategory(catKey) {
            let upgradeList = [];
            if (catKey === 'gate') {
                upgradeList = [
                    {
                        id: 'gateFee',
                        name: 'Gate Fee (+$1)',
                        desc: \`Income: \$\${this.state.g1Fee} ➔ \$\${this.state.g1Fee + 1} per customer (+ \$1)\`,
                        cost: '$' + this.state.upgrades.gateFee.cost,
                        lvl: this.state.upgrades.gateFee.lvl, max: 10, reqLvl: 1,
                        canAfford: this.state.money >= this.state.upgrades.gateFee.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.gateFee.cost;
                            this.state.g1Fee++;
                            this.state.upgrades.gateFee.lvl++;
                            this.state.upgrades.gateFee.cost *= 2;
                        }
                    },
                    {
                        id: 'footTraffic',
                        name: 'Foot Traffic (+10%)',
                        desc: \`Arrival: \${(this.state.customerSpawnChance * 100).toFixed(0)}% / \${(this.state.spawnDelay / 1000).toFixed(1)}s ➔ \${Math.min(100, (this.state.customerSpawnChance + 0.10) * 100).toFixed(0)}% (+10%)\`,
                        cost: '$' + this.state.upgrades.footTraffic.cost,
                        lvl: this.state.upgrades.footTraffic.lvl, max: 7, reqLvl: 2,
                        canAfford: this.state.upgrades.footTraffic.lvl < 7 && this.state.money >= this.state.upgrades.footTraffic.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.footTraffic.cost;
                            this.state.customerSpawnChance = Math.min(1.0, this.state.customerSpawnChance + 0.10);
                            this.state.spawnDelay = Math.max(500, (this.state.spawnDelay || 1000) - 100);
                            this.state.upgrades.footTraffic.lvl++;
                            this.state.upgrades.footTraffic.cost *= 2;
                        }
                    },
                    {
                        id: 'gateAuto',
                        name: 'Auto Gate Speed',
                        desc: !this.state.isGateAuto
                            ? 'Unlocks automated gate opening ($10)'
                            : ('Interval: ' + (this.state.autoGateSpeed / 1000).toFixed(1) + 's ➔ ' + (Math.max(200, this.state.autoGateSpeed - 600) / 1000).toFixed(1) + 's (-0.6s)'),
                        cost: '$' + this.state.upgrades.gateAuto.cost,
                        lvl: this.state.upgrades.gateAuto.lvl, max: 8, reqLvl: 1,
                        canAfford: this.state.money >= this.state.upgrades.gateAuto.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.gateAuto.cost;
                            if (!this.state.isGateAuto) {
                                this.state.isGateAuto = true;
                            } else {
                                this.state.autoGateSpeed = Math.max(200, this.state.autoGateSpeed - 600);
                                this.state.upgrades.gateAuto.cost *= 2;
                            }
                            this.state.upgrades.gateAuto.lvl++;
                        }
                    },
                    {
                        id: 'doubleTrash',
                        name: 'Double Rubbish Chance',
                        desc: \`Double stock: \${(this.state.doubleTrashChance * 100).toFixed(0)}% ➔ \${(this.state.doubleTrashChance * 100 + 10).toFixed(0)}% (+10%)\`,
                        cost: '$' + this.state.upgrades.doubleTrash.cost,
                        lvl: this.state.upgrades.doubleTrash.lvl, max: 5, reqLvl: 2,
                        canAfford: this.state.money >= this.state.upgrades.doubleTrash.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.doubleTrash.cost;
                            this.state.doubleTrashChance += 0.10;
                            this.state.upgrades.doubleTrash.lvl++;
                            this.state.upgrades.doubleTrash.cost *= 2;
                        }
                    },
                    {
                        id: 'busRush',
                        name: 'Bus Rush Frequency',
                        desc: !this.state.busRushUnlocked
                            ? 'Unlocks orange bus events (Tap for +10 Rubbish!)'
                            : \`Frequency: ~\${(this.state.busRushInterval / 1000).toFixed(0)}s ➔ ~\${(Math.max(5000, this.state.busRushInterval - 5000) / 1000).toFixed(0)}s (-5s)\`,
                        cost: '$' + this.state.upgrades.busRush.cost,
                        lvl: this.state.upgrades.busRush.lvl, max: 5, reqLvl: 4,
                        canAfford: this.state.money >= this.state.upgrades.busRush.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.busRush.cost;
                            this.state.busRushUnlocked = true;
                            this.state.upgrades.busRush.lvl++;
                            this.state.busRushInterval = Math.max(5000, 25000 - ((this.state.upgrades.busRush.lvl - 1) * 5000));
                            this.state.upgrades.busRush.cost *= 2;
                        }
                    },
                    ...(this.state.isGateAuto ? [{
                        id: 'toggleGateAuto',
                        name: '⚙️ Auto-Gate',
                        desc: this.state.autoGatePaused ? 'Status: PAUSED. Tap to resume.' : 'Status: RUNNING. Tap to pause.',
                        cost: this.state.autoGatePaused ? 'RESUME' : 'PAUSE',
                        lvl: this.state.autoGatePaused ? 0 : 1, max: 1, reqLvl: 1,
                        isToggle: true,
                        isPaused: !!this.state.autoGatePaused,
                        canAfford: true,
                        action: () => {
                            this.state.autoGatePaused = !this.state.autoGatePaused;
                        }
                    }] : []),
                    ...(this.state.busRushUnlocked ? [{
                        id: 'toggleBusRush',
                        name: '🚌 Buses Event',
                        desc: this.state.busRushPaused ? 'Status: PAUSED. Tap to resume.' : 'Status: RUNNING. Tap to pause.',
                        cost: this.state.busRushPaused ? 'RESUME' : 'PAUSE',
                        lvl: this.state.busRushPaused ? 0 : 1, max: 1, reqLvl: 4,
                        isToggle: true,
                        isPaused: !!this.state.busRushPaused,
                        canAfford: true,
                        action: () => {
                            this.state.busRushPaused = !this.state.busRushPaused;
                        }
                    }] : [])
                ];
            } else if (catKey === 'conveyor') {
                upgradeList = [
                    {
                        id: 'doubleToken',
                        name: 'Double Token Chance (+2%)',
                        desc: \`Belts have a \${(this.state.doubleTokenChance * 100).toFixed(0)}% ➔ \${(this.state.doubleTokenChance * 100 + 2).toFixed(0)}% chance to spawn with 2X multiplier!\`,
                        cost: '$' + this.state.upgrades.doubleToken.cost,
                        lvl: this.state.upgrades.doubleToken.lvl, max: 6, reqLvl: 2,
                        canAfford: this.state.money >= this.state.upgrades.doubleToken.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.doubleToken.cost;
                            this.state.doubleTokenChance += 0.02;
                            this.state.upgrades.doubleToken.lvl++;
                            this.state.upgrades.doubleToken.cost *= 2;
                        }
                    },
                    {
                        id: 'sanitiser',
                        name: 'Sanitiser Station',
                        desc: 'Unlocks SANITISE button: Double (2X) or Quad (4X) head item tokens on conveyor!',
                        cost: '$15',
                        lvl: this.state.upgrades.sanitiser.lvl, max: 1, reqLvl: 2,
                        canAfford: !this.state.unlockedSanitiser && this.state.money >= 15,
                        action: () => {
                            this.state.money -= 15;
                            this.state.unlockedSanitiser = true;
                            this.state.upgrades.sanitiser.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'autoSort',
                        name: !this.state.unlockedAutoSort
                            ? 'Auto-Sort From Excess (8s)'
                            : (this.state.upgrades.autoSort.lvl >= (this.state.upgrades.autoSort.max || 8)
                                ? 'Auto-Sort Speed (MAX)'
                                : ('Auto-Sort Speed (Lv. ' + this.state.upgrades.autoSort.lvl + ')')),
                        desc: !this.state.unlockedAutoSort
                            ? 'Sorts items from excess queue (+queued) right-to-left every 8.0s while leaving visible 10 items untouched!'
                            : (this.state.upgrades.autoSort.lvl >= (this.state.upgrades.autoSort.max || 8)
                                ? ('Maximum sorting speed reached (' + (this.state.autoSortDelay / 1000).toFixed(1) + 's interval)!')
                                : ('Interval: ' + (this.state.autoSortDelay / 1000).toFixed(1) + 's ➔ ' + (Math.max(1600, this.state.autoSortDelay - 800) / 1000).toFixed(1) + 's (-0.8s)')),
                        cost: (this.state.upgrades.autoSort.lvl >= (this.state.upgrades.autoSort.max || 8))
                            ? 'MAX'
                            : ('$' + this.state.upgrades.autoSort.cost),
                        lvl: this.state.upgrades.autoSort.lvl, max: 8, reqLvl: 2,
                        canAfford: this.state.upgrades.autoSort.lvl < (this.state.upgrades.autoSort.max || 8) && this.state.money >= this.state.upgrades.autoSort.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.autoSort.cost;
                            if (!this.state.unlockedAutoSort) {
                                this.state.unlockedAutoSort = true;
                                this.state.autoSortDelay = 8000;
                                this.state.upgrades.autoSort.lvl = 1;
                                this.state.upgrades.autoSort.cost = 25;
                            } else {
                                this.state.autoSortDelay = Math.max(1600, this.state.autoSortDelay - 800);
                                this.state.upgrades.autoSort.lvl++;
                                this.state.upgrades.autoSort.cost = Math.round(this.state.upgrades.autoSort.cost * 1.6);
                            }
                            this.requestLayoutRebuild();
                        }
                    },
                    ...(this.state.unlockedAutoSort ? [{
                        id: 'toggleAutoSort',
                        name: '🤖 Auto-Sort Excess',
                        desc: this.state.autoSortPaused ? 'Status: PAUSED. Tap to resume.' : 'Status: RUNNING. Tap to pause.',
                        cost: this.state.autoSortPaused ? 'RESUME' : 'PAUSE',
                        lvl: this.state.autoSortPaused ? 0 : 1, max: 1, reqLvl: 2,
                        isToggle: true,
                        isPaused: !!this.state.autoSortPaused,
                        canAfford: true,
                        action: () => {
                            this.state.autoSortPaused = !this.state.autoSortPaused;
                            this.requestLayoutRebuild();
                        }
                    }] : []),
                    // PET CONVEYOR HELPERS
                    {
                        id: 'petDog',
                        name: '🐶 Dog Helper',
                        desc: 'Button sweeps & cashes in ALL Paper (Blue) items from conveyor!',
                        cost: '$' + this.state.upgrades.petDog.cost,
                        lvl: this.state.pets.dog ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.dog && this.state.money >= this.state.upgrades.petDog.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petDog.cost;
                            this.state.pets.dog = true;
                            this.state.upgrades.petDog.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'petChicken',
                        name: '🐔 Chicken Helper',
                        desc: 'Button sweeps & cashes in ALL Organic (Green) items from conveyor!',
                        cost: '$' + this.state.upgrades.petChicken.cost,
                        lvl: this.state.pets.chicken ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.chicken && this.state.money >= this.state.upgrades.petChicken.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petChicken.cost;
                            this.state.pets.chicken = true;
                            this.state.upgrades.petChicken.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'petTurtle',
                        name: '🐢 Turtle Helper',
                        desc: 'Button sweeps & cashes in ALL Plastic (Yellow) items from conveyor!',
                        cost: '$' + this.state.upgrades.petTurtle.cost,
                        lvl: this.state.pets.turtle ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.turtle && this.state.money >= this.state.upgrades.petTurtle.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petTurtle.cost;
                            this.state.pets.turtle = true;
                            this.state.upgrades.petTurtle.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'petFlashlight',
                        name: '🔦 Torch Helper',
                        desc: 'Button sweeps & cashes in ALL Glass (Purple) items from conveyor!',
                        cost: '$' + this.state.upgrades.petFlashlight.cost,
                        lvl: this.state.pets.flashlight ? 1 : 0, max: 1, reqLvl: 3,
                        canAfford: !this.state.pets.flashlight && this.state.money >= this.state.upgrades.petFlashlight.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petFlashlight.cost;
                            this.state.pets.flashlight = true;
                            this.state.upgrades.petFlashlight.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'unlockMetal',
                        name: '🔩 Unlock Metal Rubbish',
                        desc: 'Adds Metal (Cans, Foil) to sortable rubbish pool (+Magnet Pet)',
                        cost: '$' + this.state.upgrades.unlockMetal.cost,
                        lvl: this.state.unlockedTypes.metal ? 1 : 0, max: 1, reqLvl: 3,
                        canAfford: !this.state.unlockedTypes.metal && this.state.money >= this.state.upgrades.unlockMetal.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.unlockMetal.cost;
                            this.state.unlockedTypes.metal = true;
                            this.state.activeTypes.metal = true;
                            this.state.pets.magnet = true;
                            this.state.upgrades.unlockMetal.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    },
                    {
                        id: 'unlockFabric',
                        name: '🧶 Unlock Fabric Rubbish',
                        desc: 'Adds Fabric (Cloth, Shirts) to sortable rubbish pool (+Cat Pet)',
                        cost: '$' + this.state.upgrades.unlockFabric.cost,
                        lvl: this.state.unlockedTypes.fabric ? 1 : 0, max: 1, reqLvl: 3,
                        canAfford: !this.state.unlockedTypes.fabric && this.state.money >= this.state.upgrades.unlockFabric.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.unlockFabric.cost;
                            this.state.unlockedTypes.fabric = true;
                            this.state.activeTypes.fabric = true;
                            this.state.pets.cat = true;
                            this.state.upgrades.unlockFabric.lvl = 1;
                            this.requestLayoutRebuild();
                        }
                    }
                ];
            } else if (catKey === 'skills') {
                const sp = this.state.skillPoints || 0;
                upgradeList = [
                    {
                        id: 'skill_fertilizer',
                        name: RECIPES_DATA.fertilizer.name,
                        desc: RECIPES_DATA.fertilizer.desc,
                        cost: '1 SP',
                        lvl: this.state.unlockedRecipes.fertilizer ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.unlockedRecipes.fertilizer && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.unlockedRecipes.fertilizer = true;
                        }
                    },
                    {
                        id: 'skill_paper',
                        name: RECIPES_DATA.paper_bundle.name,
                        desc: RECIPES_DATA.paper_bundle.desc,
                        cost: '1 SP',
                        lvl: this.state.unlockedRecipes.paper_bundle ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.unlockedRecipes.paper_bundle && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.unlockedRecipes.paper_bundle = true;
                        }
                    },
                    {
                        id: 'skill_plastic',
                        name: RECIPES_DATA.plastic_pellets.name,
                        desc: RECIPES_DATA.plastic_pellets.desc,
                        cost: '1 SP',
                        lvl: this.state.unlockedRecipes.plastic_pellets ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.unlockedRecipes.plastic_pellets && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.unlockedRecipes.plastic_pellets = true;
                        }
                    },
                    {
                        id: 'skill_cullet',
                        name: RECIPES_DATA.crushed_cullet.name,
                        desc: RECIPES_DATA.crushed_cullet.desc,
                        cost: '1 SP',
                        lvl: this.state.unlockedRecipes.crushed_cullet ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.unlockedRecipes.crushed_cullet && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.unlockedRecipes.crushed_cullet = true;
                        }
                    },
                    {
                        id: 'skill_lucky_gate',
                        name: '🍀 Lucky Gate (+15% Double Rubbish)',
                        desc: 'Passive: Boosts Gate Double Rubbish chance by +15%!',
                        cost: '1 SP',
                        lvl: this.state.perkLuckyGate ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.perkLuckyGate && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.perkLuckyGate = true;
                            this.state.doubleTrashChance += 0.15;
                        }
                    },
                    {
                        id: 'skill_lucky_belt',
                        name: '⚡ Lucky Belt (+15% Double Tokens)',
                        desc: 'Passive: Boosts Conveyor Double Token chance by +15%!',
                        cost: '1 SP',
                        lvl: this.state.perkLuckyBelt ? 1 : 0, max: 1, reqLvl: 1,
                        canAfford: !this.state.perkLuckyBelt && sp >= 1,
                        action: () => {
                            this.state.skillPoints -= 1;
                            this.state.perkLuckyBelt = true;
                            this.state.doubleTokenChance += 0.15;
                        }
                    }
                ];
            } else if (catKey === 'bins') {
                const binKeys = [
                    { id: 'organic', name: '🟢 Green Bin', tokenName: 'Green' },
                    { id: 'paper', name: '🔵 Paper Bin', tokenName: 'Paper' },
                    { id: 'glass', name: '🟣 Glass Bin', tokenName: 'Glass' },
                    { id: 'plastic', name: '🟡 Plastic Bin', tokenName: 'Plastic' }
                ];
                if (this.state.unlockedTypes.metal) binKeys.push({ id: 'metal', name: '⚪ Metal Bin', tokenName: 'Metal' });
                if (this.state.unlockedTypes.fabric) binKeys.push({ id: 'fabric', name: '🌸 Fabric Bin', tokenName: 'Fabric' });

                upgradeList = [];
                binKeys.forEach(b => {
                    const bId = b.id;
                    const bUp = this.state.binUpgrades[bId] || { bgUnlocked: false, shopUnlocked: false, tier2Unlocked: false, tier3Unlocked: false };
                    const tName = b.tokenName;

                    upgradeList.push(
                        { id: bId + '_bgUnlocked', name: b.name + ' (Lvl 1: Colored Background)', desc: '10px circular colored backing under item', cost: '10 ' + tName + ' Tokens', lvl: bUp.bgUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.bgUnlocked && this.state.resources[bId] >= 10, action: () => { this.state.resources[bId] -= 10; bUp.bgUnlocked = true; } },
                        { id: bId + '_shopUnlocked', name: b.name + ' (Lvl 2: Unlock Workshop T1)', desc: 'Unlocks T1 craftables in workshop', cost: '$5 + 5 ' + tName + ' Tokens', lvl: bUp.shopUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.shopUnlocked && this.state.money >= 5 && this.state.resources[bId] >= 5, action: () => { this.state.money -= 5; this.state.resources[bId] -= 5; bUp.shopUnlocked = true; this.state.unlockedWorkshopsFacility = true; } },
                        { id: bId + '_tier2Unlocked', name: b.name + ' (Lvl 3: Unlock Tier 2)', desc: 'Unlocks Tier 2 craftable recipes', cost: '$10 + 10 ' + tName + ' Tokens', lvl: bUp.tier2Unlocked ? 1 : 0, max: 1, reqLvl: 2, canAfford: bUp.shopUnlocked && !bUp.tier2Unlocked && this.state.money >= 10 && this.state.resources[bId] >= 10, action: () => { this.state.money -= 10; this.state.resources[bId] -= 10; bUp.tier2Unlocked = true; } },
                        { id: bId + '_tier3Unlocked', name: b.name + ' (Lvl 4: Unlock Tier 3)', desc: 'Unlocks Tier 3 advanced craftables', cost: '$15 + 15 ' + tName + ' Tokens', lvl: bUp.tier3Unlocked ? 1 : 0, max: 1, reqLvl: 3, canAfford: bUp.tier2Unlocked && !bUp.tier3Unlocked && this.state.money >= 15 && this.state.resources[bId] >= 15, action: () => { this.state.money -= 15; this.state.resources[bId] -= 15; bUp.tier3Unlocked = true; } }
                    );
                });
            } else {
                const bId = catKey.split('_')[0];
                const bUp = this.state.binUpgrades[bId] || { bgUnlocked: false, shopUnlocked: false, tier2Unlocked: false, tier3Unlocked: false };
                const typeData = TRASH_TYPES[bId] || { name: bId };

                upgradeList = [
                    { id: 'bgUnlocked', name: 'Lvl 1: Sprite Colored Background', desc: '10px circular colored backing under item', cost: '10 ' + typeData.name + ' Tokens', lvl: bUp.bgUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.bgUnlocked && this.state.resources[bId] >= 10, action: () => { this.state.resources[bId] -= 10; bUp.bgUnlocked = true; } },
                    { id: 'shopUnlocked', name: 'Lvl 2: Unlock Workshop (Tier 1)', desc: 'Unlocks T1 craftables in workshop', cost: '$5 + 5 ' + typeData.name + ' Tokens', lvl: bUp.shopUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.shopUnlocked && this.state.money >= 5 && this.state.resources[bId] >= 5, action: () => { this.state.money -= 5; this.state.resources[bId] -= 5; bUp.shopUnlocked = true; this.state.unlockedWorkshopsFacility = true; } },
                    { id: 'tier2Unlocked', name: 'Lvl 3: Unlock Tier 2 Items', desc: 'Unlocks Tier 2 craftable recipes', cost: '$10 + 10 ' + typeData.name + ' Tokens', lvl: bUp.tier2Unlocked ? 1 : 0, max: 1, reqLvl: 2, canAfford: bUp.shopUnlocked && !bUp.tier2Unlocked && this.state.money >= 10 && this.state.resources[bId] >= 10, action: () => { this.state.money -= 10; this.state.resources[bId] -= 10; bUp.tier2Unlocked = true; } },
                    { id: 'tier3Unlocked', name: 'Lvl 4: Unlock Tier 3 Items', desc: 'Unlocks Tier 3 advanced craftables', cost: '$15 + 15 ' + typeData.name + ' Tokens', lvl: bUp.tier3Unlocked ? 1 : 0, max: 1, reqLvl: 3, canAfford: bUp.tier2Unlocked && !bUp.tier3Unlocked && this.state.money >= 15 && this.state.resources[bId] >= 15, action: () => { this.state.money -= 15; this.state.resources[bId] -= 15; bUp.tier3Unlocked = true; } }
                ];
            }
            return upgradeList;
        }

        hasCategoryAffordable(catKey) {
            const list = this.getUpgradeListForCategory(catKey);
            for (let i = 0; i < list.length; i++) {
                const u = list[i];
                if (u.isToggle) continue;
                const isLevelMet = (this.state.level >= u.reqLvl);
                let isPrevUnlocked = true;
                if (catKey === 'skills') {
                    isPrevUnlocked = (i === 0) || (list[i - 1].lvl > 0);
                } else if (catKey === 'bins' || (typeof catKey === 'string' && catKey.endsWith('_bin'))) {
                    const tierIdx = i % 4;
                    if (tierIdx === 2 || tierIdx === 3) isPrevUnlocked = (list[i - 1].lvl > 0);
                }
                const isNotMax = (u.lvl < u.max);
                if (isLevelMet && isPrevUnlocked && isNotMax && u.canAfford) {
                    return true;
                }
            }
            return false;
        }

        renderTopHalfUpgradesModal(w, modalH, boxW) {
            const boxLeft = Math.round((w - boxW) / 2);
            const isNarrowModal = boxW < 400;
            const sidebarW = isNarrowModal ? 96 : (boxW >= 680 ? 140 : 125);
            const safeTop = this.layoutMetrics ? this.layoutMetrics.safeTop : 0;
            const headerY = safeTop + 14;

            const isSingleBinCat = (typeof this.activeUpgradeCategory === 'string' && this.activeUpgradeCategory.endsWith('_bin'));
            let modalTitleStr = isNarrowModal ? '🛠️ UPGRADES' : '🛠️ UPGRADES & STATIONS';
            if (isSingleBinCat) {
                const bId = this.activeUpgradeCategory.split('_')[0];
                const tData = TRASH_TYPES[bId];
                const bName = tData ? tData.name.toUpperCase() : bId.toUpperCase();
                modalTitleStr = isNarrowModal ? ('🗑️ ' + bName + ' BIN') : ('🗑️ ' + bName + ' BIN SETTINGS');
            }

            const title = this.add.text(boxLeft + 12, headerY, modalTitleStr, {
                fontSize: isNarrowModal ? '12.5px' : '14px', style: 'bold', color: '#4fc3f7'
            });
            this.modalWalletTxt = this.add.text(boxLeft + boxW - 12, headerY, '$' + this.state.money + ' | ⭐' + (this.state.skillPoints || 0) + ' SP', {
                fontSize: isNarrowModal ? '10px' : '11px', style: 'bold', color: '#00ff00'
            }).setOrigin(1, 0);
            this.modalContainer.add([title, this.modalWalletTxt]);

            let currY = headerY + 28;
            const sideBtnFont = isNarrowModal ? '10px' : '11px';
            const sideBtnPad = isNarrowModal ? { x: 5, y: 4 } : { x: 8, y: 4 };

            const isGateSel = (this.activeUpgradeCategory === 'gate');
            const hasGateAff = this.hasCategoryAffordable('gate');
            const btnGate = this.add.text(boxLeft + 8, currY, hasGateAff ? '🚪 Gate (!)' : '🚪 Gate', {
                fontSize: sideBtnFont, style: 'bold',
                backgroundColor: isGateSel ? '#0288d1' : '#2b2b2b',
                color: isGateSel ? '#ffffff' : (hasGateAff ? '#ffd700' : '#aaaaaa'), padding: sideBtnPad
            }).setInteractive({ useHandCursor: true });
            btnGate.baseLabel = '🚪 Gate';
            btnGate.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'gate'; this.openModal('upgrades', 'gate'); });
            this.modalContainer.add(btnGate);
            currY += 28;

            const isConveyorSel = (this.activeUpgradeCategory === 'conveyor');
            const hasConveyorAff = this.hasCategoryAffordable('conveyor');
            const btnConveyor = this.add.text(boxLeft + 8, currY, hasConveyorAff ? '🔄 Belt (!)' : (isNarrowModal ? '🔄 Belt' : '🔄 Conveyor'), {
                fontSize: sideBtnFont, style: 'bold',
                backgroundColor: isConveyorSel ? '#0288d1' : '#2b2b2b',
                color: isConveyorSel ? '#ffffff' : (hasConveyorAff ? '#ffd700' : '#aaaaaa'), padding: sideBtnPad
            }).setInteractive({ useHandCursor: true });
            btnConveyor.baseLabel = isNarrowModal ? '🔄 Belt' : '🔄 Conveyor';
            btnConveyor.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'conveyor'; this.openModal('upgrades', 'conveyor'); });
            this.modalContainer.add(btnConveyor);
            currY += 28;

            const isBinsSel = (this.activeUpgradeCategory === 'bins' || isSingleBinCat);
            const hasBinsAff = this.hasCategoryAffordable('bins');
            const btnBins = this.add.text(boxLeft + 8, currY, hasBinsAff ? '🗑️ Bins (!)' : '🗑️ Bins', {
                fontSize: sideBtnFont, style: 'bold',
                backgroundColor: isBinsSel ? '#0288d1' : '#2b2b2b',
                color: isBinsSel ? '#ffffff' : (hasBinsAff ? '#ffd700' : '#aaaaaa'), padding: sideBtnPad
            }).setInteractive({ useHandCursor: true });
            btnBins.baseLabel = '🗑️ Bins';
            btnBins.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'bins'; this.openModal('upgrades', 'bins'); });
            this.modalContainer.add(btnBins);
            currY += 28;

            const isSkillsSel = (this.activeUpgradeCategory === 'skills');
            const hasSkillsAff = this.hasCategoryAffordable('skills');
            const btnSkills = this.add.text(boxLeft + 8, currY, hasSkillsAff ? '⭐ Skills (!)' : '⭐ Skills', {
                fontSize: sideBtnFont, style: 'bold',
                backgroundColor: isSkillsSel ? '#0288d1' : '#2b2b2b',
                color: isSkillsSel ? '#ffffff' : (hasSkillsAff ? '#ffd700' : '#aaaaaa'), padding: sideBtnPad
            }).setInteractive({ useHandCursor: true });
            btnSkills.baseLabel = '⭐ Skills';
            btnSkills.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'skills'; this.openModal('upgrades', 'skills'); });
            this.modalContainer.add(btnSkills);
            this.sidebarCategoryBtns = { gate: btnGate, conveyor: btnConveyor, bins: btnBins, skills: btnSkills };
            currY += 28;

            if (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric) {
                currY += 4;
                const toggleTitle = this.add.text(boxLeft + 12, currY, 'Active Types:', { fontSize: '9px', style: 'bold', color: '#888888' });
                this.modalContainer.add(toggleTitle);
                currY += 15;
                ['metal', 'fabric'].forEach(typeId => {
                    if (this.state.unlockedTypes[typeId]) {
                        const isActive = this.state.activeTypes[typeId];
                        const name = typeId === 'metal' ? '⚪ Metal' : '🌸 Fabric';
                        const toggleBtn = this.add.text(boxLeft + 12, currY, name + ': ' + (isActive ? '[ON]' : '[OFF]'), {
                            fontSize: '9px', style: 'bold',
                            backgroundColor: isActive ? '#00e676' : '#555555',
                            color: isActive ? '#000000' : '#ffffff', padding: 2
                        }).setInteractive({ useHandCursor: true });
                        toggleBtn.on('pointerup', () => {
                            const activeCount = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]).length;
                            if (isActive && activeCount <= 4) {
                                alert('⚠️ You must keep at least 4 active rubbish types!');
                                return;
                            }
                            this.state.activeTypes[typeId] = !isActive;
                            this.requestLayoutRebuild();
                            this.openModal('upgrades', this.activeUpgradeCategory, true);
                        });
                        this.modalContainer.add(toggleBtn);
                        currY += 18;
                    }
                });
            }

            const divGfx = this.add.graphics();
            divGfx.lineStyle(1.5, 0x444444, 1);
            divGfx.lineBetween(boxLeft + sidebarW, headerY + 22, boxLeft + sidebarW, modalH - 35);
            this.modalContainer.add(divGfx);

            const startX = boxLeft + sidebarW + (isNarrowModal ? 10 : 15);
            const upgradeList = this.getUpgradeListForCategory(this.activeUpgradeCategory);

            // Viewport bounds for the upgrades list
            const viewX = boxLeft + sidebarW + 2;
            const viewY = headerY + 22;
            const viewW = boxW - sidebarW - 4;
            const viewBottomY = modalH - 38;
            const viewH = Math.max(10, viewBottomY - viewY);

            // Container for scrollable items
            this.upgradeListContainer = this.add.container(0, 0);
            this.modalContainer.add(this.upgradeListContainer);

            // Mask so overflowing items stay inside the modal bounds
            this.modalMaskGfx = this.make.graphics();
            this.modalMaskGfx.fillStyle(0xffffff, 1);
            this.modalMaskGfx.fillRect(viewX, viewY, viewW, viewH);
            const mask = this.modalMaskGfx.createGeometryMask();
            this.upgradeListContainer.setMask(mask);

            const isSmallScreenModal = (this.scale && this.scale.height > this.scale.width && this.scale.width < 600) || viewW < 320;
            const itemHeight = isSmallScreenModal ? 64 : 48;
            let totalDragDistance = 0;
            this.activeUpgradeCards = [];

            upgradeList.forEach((uItem, idx) => {
                const uy = viewY + 6 + (idx * itemHeight);
                const isLevelMet = (this.state.level >= uItem.reqLvl);
                let isPrevUnlocked = true;
                if (this.activeUpgradeCategory === 'skills') {
                    isPrevUnlocked = (idx === 0) || (upgradeList[idx - 1].lvl > 0);
                } else if (this.activeUpgradeCategory === 'bins' || isSingleBinCat) {
                    const tierIdx = idx % 4;
                    if (tierIdx === 2) isPrevUnlocked = (upgradeList[idx - 1].lvl > 0);
                    if (tierIdx === 3) isPrevUnlocked = (upgradeList[idx - 1].lvl > 0);
                }

                if (isSmallScreenModal) {
                    const itemCardGfx = this.add.graphics();
                    itemCardGfx.fillStyle(0x1e293b, 0.45);
                    itemCardGfx.fillRoundedRect(startX - 6, uy, viewW - 14, itemHeight - 5, 5);
                    this.upgradeListContainer.add(itemCardGfx);
                }

                const actionRightX = boxLeft + boxW - 20;
                const actionY = isSmallScreenModal ? (uy + itemHeight - 9) : (uy + 4);
                const actionOriginY = isSmallScreenModal ? 1 : 0;

                if (!isLevelMet) {
                    const nameTxt = this.add.text(startX, uy + 4, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const lockBadge = this.add.text(actionRightX, actionY, '[ Req Level ' + uItem.reqLvl + ' ]', {
                        fontSize: isSmallScreenModal ? '9.5px' : '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, actionOriginY);

                    this.upgradeListContainer.add([nameTxt, lockBadge]);
                } else if (!isPrevUnlocked) {
                    const nameTxt = this.add.text(startX, uy + 4, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const prevLockBadge = this.add.text(actionRightX, actionY, '[ Need prev upgrade ]', {
                        fontSize: isSmallScreenModal ? '9.5px' : '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, actionOriginY);

                    this.upgradeListContainer.add([nameTxt, prevLockBadge]);
                } else if (uItem.isToggle) {
                    const infoTxt = this.add.text(startX, uy + 3, \`\${uItem.name}\n\${uItem.desc}\`, {
                        fontSize: isSmallScreenModal ? '10px' : '10.5px', color: '#fff', lineSpacing: 2,
                        wordWrap: { width: isSmallScreenModal ? (viewW - 20) : (viewW - 120) }
                    });

                    const btnToggle = this.add.text(actionRightX, actionY, uItem.cost, {
                        fontSize: '10px', style: 'bold',
                        backgroundColor: uItem.isPaused ? '#dc2626' : '#16a34a',
                        color: '#ffffff', padding: { x: 8, y: 3 }
                    }).setOrigin(1, actionOriginY).setInteractive({ useHandCursor: true });

                    btnToggle.on('pointerup', (pointer) => {
                        if (totalDragDistance > 8) return;
                        if (pointer.y < viewY || pointer.y > viewBottomY) return;
                        uItem.action();
                        this.requestLayoutRebuild();
                        this.openModal('upgrades', this.activeUpgradeCategory, true);
                    });

                    this.upgradeListContainer.add([infoTxt, btnToggle]);
                } else {
                    const infoTxt = this.add.text(startX, uy + 3, \`\${uItem.name}\n\${uItem.desc}\`, {
                        fontSize: isSmallScreenModal ? '10px' : '10.5px', color: '#fff', lineSpacing: 2,
                        wordWrap: { width: isSmallScreenModal ? (viewW - 20) : (viewW - 120) }
                    });

                    if (uItem.lvl >= uItem.max) {
                        const maxBadge = this.add.text(actionRightX, actionY, \`[ Lvl \${uItem.lvl}/\${uItem.max} MAX ]\`, {
                            fontSize: isSmallScreenModal ? '9.5px' : '11px', style: 'bold', color: '#00ff00'
                        }).setOrigin(1, actionOriginY);
                        this.upgradeListContainer.add([infoTxt, maxBadge]);
                    } else {
                        const lvlBadgeStr = uItem.max > 1 ? \`Lvl \${uItem.lvl}/\${uItem.max} \` : '';
                        const btnBuy = this.add.text(actionRightX, actionY, \`\${lvlBadgeStr}BUY (\${uItem.cost})\`, {
                            fontSize: isSmallScreenModal ? '9.5px' : '10px', style: 'bold',
                            backgroundColor: uItem.canAfford ? '#00e676' : '#424242',
                            color: uItem.canAfford ? '#000' : '#aaa', padding: { x: 5, y: 3 }
                        }).setOrigin(1, actionOriginY).setInteractive({ useHandCursor: true });

                        btnBuy.on('pointerup', (pointer) => {
                            if (totalDragDistance > 8) return;
                            if (pointer.y < viewY || pointer.y > viewBottomY) return;
                            const curList = this.getUpgradeListForCategory(this.activeUpgradeCategory);
                            const curItem = curList[idx];
                            if (curItem && curItem.canAfford) {
                                curItem.action();
                                if (this.modalWalletTxt) this.modalWalletTxt.setText('$' + this.state.money + ' | ⭐' + (this.state.skillPoints || 0) + ' SP');
                                this.requestLayoutRebuild();
                                this.openModal('upgrades', this.activeUpgradeCategory, true);
                            }
                        });
                        this.upgradeListContainer.add([infoTxt, btnBuy]);
                        this.activeUpgradeCards.push({ btnBuy, idx });
                    }
                }
            });

            // Calculate scroll limits
            const totalContentH = (upgradeList.length * itemHeight) + 16;
            const maxScroll = Math.max(0, totalContentH - viewH);

            this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY || 0, -maxScroll, 0);
            this.upgradeListContainer.y = this.upgradeScrollY;

            let updateScrollThumb = () => {};

            if (maxScroll > 0) {
                const trackX = boxLeft + boxW - 14;
                const trackY = viewY + 4;
                const trackW = 5;
                const trackH = viewH - 8;

                const trackGfx = this.add.graphics();
                trackGfx.fillStyle(0x222630, 0.85);
                trackGfx.fillRoundedRect(trackX, trackY, trackW, trackH, 2.5);
                this.modalContainer.add(trackGfx);

                const thumbGfx = this.add.graphics();
                const thumbH = Math.max(24, (viewH / totalContentH) * trackH);
                this.modalContainer.add(thumbGfx);

                updateScrollThumb = () => {
                    thumbGfx.clear();
                    const ratio = maxScroll > 0 ? (-this.upgradeScrollY / maxScroll) : 0;
                    const thumbY = trackY + ratio * (trackH - thumbH);
                    thumbGfx.fillStyle(0x4fc3f7, 0.9);
                    thumbGfx.fillRoundedRect(trackX, thumbY, trackW, thumbH, 2.5);
                };
                updateScrollThumb();
            }

            let isDraggingList = false;
            let dragStartY = 0;
            let dragStartScroll = 0;

            this.modalWheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= boxLeft + sidebarW && pointer.x <= boxLeft + boxW &&
                    pointer.y >= viewY && pointer.y <= viewBottomY) {
                    this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY - deltaY * 0.6, -maxScroll, 0);
                    this.upgradeListContainer.y = this.upgradeScrollY;
                    updateScrollThumb();
                }
            };
            this.input.on('wheel', this.modalWheelHandler);

            this.modalPointerDownHandler = (pointer) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= boxLeft + sidebarW && pointer.x <= boxLeft + boxW &&
                    pointer.y >= viewY && pointer.y <= viewBottomY) {
                    isDraggingList = true;
                    dragStartY = pointer.y;
                    dragStartScroll = this.upgradeScrollY;
                    totalDragDistance = 0;
                }
            };

            this.modalPointerMoveHandler = (pointer) => {
                if (!isDraggingList) return;
                const dy = pointer.y - dragStartY;
                if (pointer.prevPosition) {
                    totalDragDistance += Math.abs(pointer.position.y - pointer.prevPosition.y);
                }
                this.upgradeScrollY = Phaser.Math.Clamp(dragStartScroll + dy, -maxScroll, 0);
                this.upgradeListContainer.y = this.upgradeScrollY;
                updateScrollThumb();
            };

            this.modalPointerUpHandler = () => {
                isDraggingList = false;
            };

            this.input.on('pointerdown', this.modalPointerDownHandler);
            this.input.on('pointermove', this.modalPointerMoveHandler);
            this.input.on('pointerup', this.modalPointerUpHandler);
        }

        renderDecorationsModal(w, modalH, boxW) {
            const boxLeft = Math.round((w - boxW) / 2);
            const safeTop = this.layoutMetrics ? this.layoutMetrics.safeTop : 0;
            const title = this.add.text(w / 2, safeTop + 20, '🪴 DECORATIONS', { fontSize: '15px', style: 'bold', color: '#a5d6a7' }).setOrigin(0.5);
            const r = this.state.resources;
            this.decorWalletTxt = this.add.text(boxLeft + 14, modalH - 22, '🟢' + r.organic + ' 🔵' + r.paper + ' 🟡' + r.plastic + ' 🟣' + r.glass, {
                fontSize: boxW < 360 ? '10px' : '11.5px', style: 'bold', color: '#ffd700'
            }).setOrigin(0, 0.5);

            this.modalContainer.add([title, this.decorWalletTxt]);

            const decors = [
                {
                    name: '🌱 Lush Grass Lawn',
                    desc: 'Converts dusty soil ground into rich green lawn!',
                    costText: '15 Green',
                    canAfford: this.state.resources.organic >= 15,
                    bought: this.state.hasGrass,
                    action: () => { this.state.resources.organic -= 15; this.state.hasGrass = true; }
                },
                {
                    name: '🌳 Perimeter Bushes',
                    desc: 'Adds green shrub hedges along the ground horizon!',
                    costText: '20 Green',
                    canAfford: this.state.resources.organic >= 20,
                    bought: this.state.hasTrees,
                    action: () => { this.state.resources.organic -= 20; this.state.hasTrees = true; }
                },
                {
                    name: '💡 Fairy Lights',
                    desc: this.state.hasTrees ? 'Glowing warm lights on the horizon bushes!' : 'Requires Perimeter Bushes first!',
                    costText: '25 Plastic',
                    canAfford: this.state.hasTrees && (this.state.resources.plastic >= 25),
                    bought: this.state.hasFairyLights,
                    locked: !this.state.hasTrees,
                    action: () => {
                        if (this.state.hasTrees && this.state.resources.plastic >= 25) {
                            this.state.resources.plastic -= 25;
                            this.state.hasFairyLights = true;
                        }
                    }
                },
                {
                    name: '🚩 Festive Bunting',
                    desc: 'Colorful triangle pennant flags across top of screen!',
                    costText: '20 Paper',
                    canAfford: this.state.resources.paper >= 20,
                    bought: this.state.hasBunting,
                    action: () => { this.state.resources.paper -= 20; this.state.hasBunting = true; }
                },
                {
                    name: '💎 Diamond Accents',
                    desc: 'Cyan diamond icons on screen borders',
                    costText: '30 Glass',
                    canAfford: this.state.resources.glass >= 30,
                    bought: this.state.hasDiamonds,
                    action: () => { this.state.resources.glass -= 30; this.state.hasDiamonds = true; }
                }
            ];

            const viewX = boxLeft + 10;
            const viewY = safeTop + 36;
            const viewW = boxW - 20;
            const viewBottomY = modalH - 40;
            const viewH = Math.max(40, viewBottomY - viewY);

            this.upgradeListContainer = this.add.container(0, 0);
            this.modalContainer.add(this.upgradeListContainer);

            this.modalMaskGfx = this.make.graphics();
            this.modalMaskGfx.fillStyle(0xffffff, 1);
            this.modalMaskGfx.fillRect(viewX, viewY, viewW, viewH);
            this.upgradeListContainer.setMask(this.modalMaskGfx.createGeometryMask());

            const rowH = boxW < 400 ? 50 : 44;
            const textWrapW = Math.max(120, viewW - 122);
            let totalDragDistance = 0;

            decors.forEach((d, idx) => {
                const dy = viewY + 4 + (idx * rowH);
                const infoTxt = this.add.text(viewX + 6, dy, d.name + '\\n' + d.desc, {
                    fontSize: boxW < 380 ? '10px' : '11px', color: '#fff', lineSpacing: 2,
                    wordWrap: { width: textWrapW }
                });

                const btnX = viewX + viewW - 14;
                if (d.bought) {
                    const boughtBadge = this.add.text(btnX, dy + 8, '[ OWNED ]', { fontSize: '10.5px', style: 'bold', color: '#00ff00' }).setOrigin(1, 0);
                    this.upgradeListContainer.add([infoTxt, boughtBadge]);
                } else if (d.locked) {
                    const lockBadge = this.add.text(btnX, dy + 8, '[ LOCKED ]', {
                        fontSize: '10px', style: 'bold',
                        backgroundColor: '#374151', color: '#9ca3af', padding: 4
                    }).setOrigin(1, 0);
                    this.upgradeListContainer.add([infoTxt, lockBadge]);
                } else {
                    const btn = this.add.text(btnX, dy + 8, 'BUY (' + d.costText + ')', {
                        fontSize: '10px', style: 'bold',
                        backgroundColor: d.canAfford ? '#00e676' : '#424242',
                        color: d.canAfford ? '#000' : '#aaa', padding: 4
                    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

                    if (d.canAfford) {
                        btn.on('pointerup', (pointer) => {
                            if (totalDragDistance > 8) return;
                            if (pointer.y < viewY || pointer.y > viewBottomY) return;
                            d.action();
                            this.updateUI();
                            this.requestLayoutRebuild();
                            this.openModal('decorations');
                        });
                    }
                    this.upgradeListContainer.add([infoTxt, btn]);
                }
            });

            const totalContentH = (decors.length * rowH) + 8;
            const maxScroll = Math.max(0, totalContentH - viewH);
            this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY || 0, -maxScroll, 0);
            this.upgradeListContainer.y = this.upgradeScrollY;

            let isDraggingList = false;
            let dragStartY = 0;
            let dragStartScroll = 0;

            this.modalWheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= viewX && pointer.x <= viewX + viewW && pointer.y >= viewY && pointer.y <= viewBottomY) {
                    this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY - deltaY * 0.6, -maxScroll, 0);
                    this.upgradeListContainer.y = this.upgradeScrollY;
                }
            };
            this.modalPointerDownHandler = (pointer) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= viewX && pointer.x <= viewX + viewW && pointer.y >= viewY && pointer.y <= viewBottomY) {
                    isDraggingList = true;
                    dragStartY = pointer.y;
                    dragStartScroll = this.upgradeScrollY;
                    totalDragDistance = 0;
                }
            };
            this.modalPointerMoveHandler = (pointer) => {
                if (!isDraggingList) return;
                const dy = pointer.y - dragStartY;
                if (pointer.prevPosition) totalDragDistance += Math.abs(pointer.position.y - pointer.prevPosition.y);
                this.upgradeScrollY = Phaser.Math.Clamp(dragStartScroll + dy, -maxScroll, 0);
                this.upgradeListContainer.y = this.upgradeScrollY;
            };
            this.modalPointerUpHandler = () => { isDraggingList = false; };

            this.input.on('wheel', this.modalWheelHandler);
            this.input.on('pointerdown', this.modalPointerDownHandler);
            this.input.on('pointermove', this.modalPointerMoveHandler);
            this.input.on('pointerup', this.modalPointerUpHandler);
        }

        renderFactoryModal(w, modalH, boxW) {
            const boxLeft = Math.round((w - boxW) / 2);
            const safeTop = this.layoutMetrics ? this.layoutMetrics.safeTop : 0;
            const isNarrowModal = boxW < 400;
            const headerY = safeTop + 14;
            const title = this.add.text(boxLeft + 12, headerY, isNarrowModal ? '🏭 FACTORY' : '🏭 RECYCLING FACTORY & WORKSHOP', {
                fontSize: isNarrowModal ? '12.5px' : '13px', style: 'bold', color: '#38bdf8'
            });
            const r = this.state.resources;
            const walletTxt = this.add.text(boxLeft + boxW - 12, headerY, '$' + this.state.money + ' | 🟢' + r.organic + ' 🔵' + r.paper, {
                fontSize: isNarrowModal ? '10px' : '10.5px', style: 'bold', color: '#00e676'
            }).setOrigin(1, 0);
            this.modalContainer.add([title, walletTxt]);

            if (!this.state.factoryUnlocked) {
                // Factory Purchase Screen
                const centerBoxY = Math.round((headerY + modalH - 30) / 2);
                const desc = this.add.text(w / 2, centerBoxY - 22, 'Industrial Manufacturing Facility\\nConvert sorted rubbish tokens into high-value craft goods to fulfill customer trade orders!', {
                    fontSize: '11px', color: '#ffffff', align: 'center', lineSpacing: 4,
                    wordWrap: { width: boxW - 32 }
                }).setOrigin(0.5);

                const canAffordFactory = (this.state.money >= 25);
                const btnBuyFactory = this.add.text(w / 2, centerBoxY + 34, '🏭 UNLOCK FACTORY ($25)', {
                    fontSize: '13px', style: 'bold',
                    backgroundColor: canAffordFactory ? '#00e676' : '#424242',
                    color: canAffordFactory ? '#000000' : '#aaaaaa', padding: { x: 16, y: 8 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                btnBuyFactory.on('pointerup', () => {
                    if (this.state.money >= 25) {
                        this.state.money -= 25;
                        this.state.factoryUnlocked = true;
                        this.state.unlockedWorkshopsFacility = true;
                        this.updateUI();
                        this.requestLayoutRebuild();
                        this.openModal('factory', 'factory', true);
                    }
                });

                this.modalContainer.add([desc, btnBuyFactory]);
                return;
            }

            // Viewport for responsive 2- or 3-across Crafting Catalog
            const viewX = boxLeft + 12;
            const viewY = headerY + 24;
            const viewW = boxW - 24;
            const viewBottomY = modalH - 36;
            const viewH = Math.max(10, viewBottomY - viewY);

            this.upgradeListContainer = this.add.container(0, 0);
            this.modalContainer.add(this.upgradeListContainer);

            this.modalMaskGfx = this.make.graphics();
            this.modalMaskGfx.fillStyle(0xffffff, 1);
            this.modalMaskGfx.fillRect(viewX, viewY, viewW, viewH);
            const mask = this.modalMaskGfx.createGeometryMask();
            this.upgradeListContainer.setMask(mask);

            const recipes = FACTORY_RECIPES;

            const cols = (viewW < 360) ? 2 : 3;
            const colGap = 8;
            const rowGap = 8;
            const cardW = Math.floor((viewW - ((cols - 1) * colGap) - 10) / cols);
            const cardH = 68;
            let totalDragDistance = 0;

            recipes.forEach((rec, idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const cx = viewX + (col * (cardW + colGap));
                const cy = viewY + (row * (cardH + rowGap));

                const bUp = this.state.binUpgrades[rec.binId] || { shopUnlocked: false, tier2Unlocked: false, tier3Unlocked: false };
                const isUnlocked = (rec.tier === 1 ? bUp.shopUnlocked : (rec.tier === 2 ? bUp.tier2Unlocked : bUp.tier3Unlocked));
                const canAfford = isUnlocked && ((this.state.resources[rec.resKey] || 0) >= rec.costVal);
                const owned = (this.state.crafted && this.state.crafted[rec.key]) || 0;

                const cardBg = this.add.graphics();
                cardBg.fillStyle(isUnlocked ? 0x1e293b : 0x0f172a, 0.95);
                cardBg.fillRoundedRect(cx, cy, cardW, cardH, 6);
                cardBg.lineStyle(1.5, isUnlocked ? (canAfford ? 0x38bdf8 : 0x475569) : 0x334155, 1);
                cardBg.strokeRoundedRect(cx, cy, cardW, cardH, 6);

                const nameTxt = this.add.text(cx + 6, cy + 5, rec.name, {
                    fontSize: '10px', style: 'bold', color: isUnlocked ? '#ffffff' : '#64748b'
                });

                const costTxt = this.add.text(cx + 6, cy + 22, isUnlocked ? ('Cost: ' + rec.req) : '[ Locked in Bins ]', {
                    fontSize: '9px', color: isUnlocked ? '#cbd5e1' : '#f59e0b'
                });

                const ownedTxt = this.add.text(cx + 6, cy + 38, 'Have: ' + owned, {
                    fontSize: '9px', style: 'bold', color: '#38bdf8'
                });

                this.upgradeListContainer.add([cardBg, nameTxt, costTxt, ownedTxt]);

                if (isUnlocked) {
                    const btnCraft = this.add.text(cx + cardW - 6, cy + cardH - 8, 'CRAFT', {
                        fontSize: '9.5px', style: 'bold',
                        backgroundColor: canAfford ? '#00e676' : '#475569',
                        color: canAfford ? '#000000' : '#94a3b8', padding: { x: 6, y: 3 }
                    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

                    btnCraft.on('pointerup', (pointer) => {
                        if (totalDragDistance > 8) return;
                        if (pointer.y < viewY || pointer.y > viewBottomY) return;
                        if (canAfford) {
                            this.state.resources[rec.resKey] -= rec.costVal;
                            if (!this.craftingConveyor) this.craftingConveyor = [];
                            this.craftingConveyor.push({ shopId: rec.resKey, recipeKey: rec.key, recipeName: rec.name });
                            this.processCraftingConveyor();
                            this.updateUI();
                            this.openModal('factory', 'factory', true);
                        }
                    });
                    this.upgradeListContainer.add(btnCraft);
                }
            });

            const totalRows = Math.ceil(recipes.length / cols);
            const totalContentH = (totalRows * (cardH + rowGap)) + 10;
            const maxScroll = Math.max(0, totalContentH - viewH);

            this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY || 0, -maxScroll, 0);
            this.upgradeListContainer.y = this.upgradeScrollY;

            let updateScrollThumb = () => {};
            if (maxScroll > 0) {
                const trackX = boxLeft + boxW - 12;
                const trackY = viewY + 2;
                const trackW = 4;
                const trackH = viewH - 4;

                const trackGfx = this.add.graphics();
                trackGfx.fillStyle(0x222222, 0.7);
                trackGfx.fillRoundedRect(trackX, trackY, trackW, trackH, 2);
                this.modalContainer.add(trackGfx);

                const thumbGfx = this.add.graphics();
                const thumbH = Math.max(20, (viewH / totalContentH) * trackH);
                this.modalContainer.add(thumbGfx);

                updateScrollThumb = () => {
                    thumbGfx.clear();
                    const ratio = maxScroll > 0 ? (-this.upgradeScrollY / maxScroll) : 0;
                    const thumbY = trackY + ratio * (trackH - thumbH);
                    thumbGfx.fillStyle(0x38bdf8, 0.9);
                    thumbGfx.fillRoundedRect(trackX, thumbY, trackW, thumbH, 2);
                };
                updateScrollThumb();
            }

            let isDraggingList = false;
            let dragStartY = 0;
            let dragStartScroll = 0;

            this.modalWheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= viewX && pointer.x <= viewX + viewW &&
                    pointer.y >= viewY && pointer.y <= viewBottomY) {
                    this.upgradeScrollY = Phaser.Math.Clamp(this.upgradeScrollY - deltaY * 0.6, -maxScroll, 0);
                    this.upgradeListContainer.y = this.upgradeScrollY;
                    updateScrollThumb();
                }
            };
            this.input.on('wheel', this.modalWheelHandler);

            this.modalPointerDownHandler = (pointer) => {
                if (maxScroll <= 0) return;
                if (pointer.x >= viewX && pointer.x <= viewX + viewW &&
                    pointer.y >= viewY && pointer.y <= viewBottomY) {
                    isDraggingList = true;
                    dragStartY = pointer.y;
                    dragStartScroll = this.upgradeScrollY;
                    totalDragDistance = 0;
                }
            };

            this.modalPointerMoveHandler = (pointer) => {
                if (!isDraggingList) return;
                const dy = pointer.y - dragStartY;
                if (pointer.prevPosition) {
                    totalDragDistance += Math.abs(pointer.position.y - pointer.prevPosition.y);
                }
                this.upgradeScrollY = Phaser.Math.Clamp(dragStartScroll + dy, -maxScroll, 0);
                this.upgradeListContainer.y = this.upgradeScrollY;
                updateScrollThumb();
            };

            this.modalPointerUpHandler = () => {
                isDraggingList = false;
            };

            this.input.on('pointerdown', this.modalPointerDownHandler);
            this.input.on('pointermove', this.modalPointerMoveHandler);
            this.input.on('pointerup', this.modalPointerUpHandler);
        }

        openArcadeModal() {
            if (this.modalContainer) this.modalContainer.destroy();
            const w = this.scale.width;
            const h = this.scale.height;
            const lm = this.layoutMetrics;
            const usableW = lm ? lm.usableW : w;
            const usableH = lm ? lm.usableH : h;

            this.modalContainer = this.add.container(0, 0).setDepth(100);
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.75);
            overlay.fillRect(0, 0, w, h);
            overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

            const modalW = Math.min(usableW - 16, 460);
            const modalH = Math.min(usableH - 16, 400);
            const modalX = Math.round((w - modalW) / 2);
            const modalY = Math.round((h - modalH) / 2);
            const compactArcade = modalH < 360 || modalW < 360;

            const box = this.add.graphics();
            box.fillStyle(0x161c28, 0.98);
            box.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
            box.lineStyle(2, 0xffca28, 1);
            box.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

            const title = this.add.text(w / 2, modalY + 22, '🕹️ ARCADE CHALLENGES', {
                fontSize: compactArcade ? '15px' : '18px', style: 'bold', color: '#ffca28'
            }).setOrigin(0.5);

            const sub = this.add.text(w / 2, modalY + 44, 'Pure sorting skill - Does NOT affect main game save!', {
                fontSize: compactArcade ? '10px' : '11px', color: '#aaaaaa', align: 'center',
                wordWrap: { width: modalW - 24 }
            }).setOrigin(0.5);

            const cardPadX = 14;
            const cardW = modalW - (2 * cardPadX);
            const cardH = Math.min(112, Math.floor((modalH - 118) / 2));
            const descWrapW = cardW - 24;

            // Dumpster Fire Frenzy Card
            const card1Y = modalY + 62;
            const c1Box = this.add.graphics();
            c1Box.fillStyle(0x221814, 0.95);
            c1Box.fillRoundedRect(modalX + cardPadX, card1Y, cardW, cardH, 8);
            c1Box.lineStyle(1.5, 0xff5722, 1);
            c1Box.strokeRoundedRect(modalX + cardPadX, card1Y, cardW, cardH, 8);

            const c1Title = this.add.text(modalX + cardPadX + 10, card1Y + 8, '🔥 Dumpster Fire Frenzy', {
                fontSize: compactArcade ? '12.5px' : '14px', style: 'bold', color: '#ff7043'
            });
            const c1Desc = this.add.text(modalX + cardPadX + 10, card1Y + 28, 'Start with maxed streak & fire active! Decaying streak bar drains fast - sort or burn out!', {
                fontSize: compactArcade ? '10px' : '11px', color: '#ffffff', lineSpacing: 2,
                wordWrap: { width: descWrapW }
            });
            const bestStreak = localStorage.getItem('arrc_arcade_best_streak') || 0;
            const c1Record = this.add.text(modalX + cardPadX + 10, card1Y + cardH - 18, '🏆 Best: ' + bestStreak + ' streak', {
                fontSize: '10.5px', style: 'bold', color: '#ffd54f'
            }).setOrigin(0, 0.5);

            const btnPlay1 = this.add.text(modalX + cardPadX + cardW - 10, card1Y + cardH - 18, '▶ PLAY', {
                fontSize: '11.5px', style: 'bold', backgroundColor: '#ff5722', color: '#ffffff', padding: { x: 12, y: 5 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnPlay1.on('pointerup', () => {
                this.modalContainer.destroy();
                this.startArcadeChallenge('dumpster');
            });

            // 500-Piece Clean Up Card
            const card2Y = card1Y + cardH + 10;
            const c2Box = this.add.graphics();
            c2Box.fillStyle(0x142022, 0.95);
            c2Box.fillRoundedRect(modalX + cardPadX, card2Y, cardW, cardH, 8);
            c2Box.lineStyle(1.5, 0x00bcd4, 1);
            c2Box.strokeRoundedRect(modalX + cardPadX, card2Y, cardW, cardH, 8);

            const c2Title = this.add.text(modalX + cardPadX + 10, card2Y + 8, '🧹 500-Piece Speed Clean', {
                fontSize: compactArcade ? '12.5px' : '14px', style: 'bold', color: '#4dd0e1'
            });
            const c2Desc = this.add.text(modalX + cardPadX + 10, card2Y + 28, 'Gigantic stockpile of 500 trash items! Sort them all as fast as humanly possible.', {
                fontSize: compactArcade ? '10px' : '11px', color: '#ffffff', lineSpacing: 2,
                wordWrap: { width: descWrapW }
            });
            const bestTime = localStorage.getItem('arrc_arcade_best_time');
            const bestTimeStr = bestTime ? (Math.floor(bestTime / 60000) + 'm ' + Math.floor((bestTime % 60000)/1000) + 's') : '--:--';
            const c2Record = this.add.text(modalX + cardPadX + 10, card2Y + cardH - 18, '⏱️ Record: ' + bestTimeStr, {
                fontSize: '10.5px', style: 'bold', color: '#80deea'
            }).setOrigin(0, 0.5);

            const btnPlay2 = this.add.text(modalX + cardPadX + cardW - 10, card2Y + cardH - 18, '▶ PLAY', {
                fontSize: '11.5px', style: 'bold', backgroundColor: '#0097a7', color: '#ffffff', padding: { x: 12, y: 5 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnPlay2.on('pointerup', () => {
                this.modalContainer.destroy();
                this.startArcadeChallenge('cleanup');
            });

            const btnClose = this.add.text(w / 2, modalY + modalH - 20, '✖ CLOSE', {
                fontSize: '12px', style: 'bold', backgroundColor: '#333333', color: '#ffffff', padding: { x: 20, y: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btnClose.on('pointerup', () => {
                this.modalContainer.destroy();
            });

            this.modalContainer.add([overlay, box, title, sub, c1Box, c1Title, c1Desc, c1Record, btnPlay1, c2Box, c2Title, c2Desc, c2Record, btnPlay2, btnClose]);
        }

        startArcadeChallenge(mode) {
            if (this.mainContainer) this.mainContainer.setVisible(false);
            if (this.arcadeContainer) this.arcadeContainer.destroy();

            // Hide any active main-game buses so they never visually pass across the arcade screen
            if (this.activeBuses && this.activeBuses.length > 0) {
                this.activeBuses.forEach(b => {
                    if (b && b.active) b.setVisible(false);
                });
            }

            if (typeof this.arcadeShowColorBg === 'undefined') {
                this.arcadeShowColorBg = false;
            }

            const w = this.scale.width;
            const h = this.scale.height;
            const lm = this.layoutMetrics;
            const safeTop = lm ? lm.safeTop : 0;
            const safeBottom = lm ? lm.safeBottom : 0;
            const usableW = lm ? lm.usableW : w;
            const isNarrow = w < 480;

            const types = ['organic', 'paper', 'glass', 'plastic'];
            const generateArcadeItem = () => {
                const t = types[Math.floor(Math.random() * types.length)];
                const tData = TRASH_TYPES[t];
                const spriteKey = (tData && tData.sprites && tData.sprites.length > 0)
                    ? tData.sprites[Math.floor(Math.random() * tData.sprites.length)]
                    : 'person';
                return { type: t, spriteKey: spriteKey };
            };

            const initialQueue = [];
            for (let i = 0; i < 15; i++) initialQueue.push(generateArcadeItem());

            this.arcadeState = {
                active: true,
                mode: mode,
                streak: (mode === 'dumpster' ? 10 : 0),
                streakTimer: (mode === 'dumpster' ? 3500 : 0),
                streakMax: 3500,
                speedMult: 1.0,
                sortedCount: 0,
                cleanupRemaining: 500,
                cleanupElapsed: 0,
                lastWallTime: Date.now(),
                queue: initialQueue,
                gameOver: false
            };

            this.arcadeContainer = this.add.container(0, 0).setDepth(80);

            // Transparent hit-absorber zone so main game sky, clouds, ground & unlocked decorations shine through!
            const bgHit = this.add.zone(w / 2, h / 2, w, h).setInteractive();
            bgHit.on('pointerdown', () => {});
            this.arcadeContainer.add(bgHit);

            // Clean semi-transparent top HUD panel so title, stats & progress bar pop crisply over the sky
            const headerTop = safeTop + 6;
            const headerPanelH = isNarrow ? 94 : 92;
            const headerPanelW = Math.min(usableW - 16, 620);
            const headerPanelX = Math.round((w - headerPanelW) / 2);
            const headerPanel = this.add.graphics();
            headerPanel.fillStyle(0x0f172a, 0.86);
            headerPanel.fillRoundedRect(headerPanelX, headerTop, headerPanelW, headerPanelH, 10);
            headerPanel.lineStyle(1.5, mode === 'dumpster' ? 0xff7043 : 0x38bdf8, 0.9);
            headerPanel.strokeRoundedRect(headerPanelX, headerTop, headerPanelW, headerPanelH, 10);
            this.arcadeContainer.add(headerPanel);

            // Header info (zero overlap between title, BG toggle, and EXIT button on narrow phones!)
            const headerY = headerTop + 18;
            const challengeTitle = (mode === 'dumpster')
                ? (isNarrow ? '🔥 DUMPSTER FRENZY' : '🔥 DUMPSTER FIRE FRENZY')
                : (isNarrow ? '🧹 500 CLEAN' : '🧹 500-PIECE SPEED CLEAN');
            const titleTxt = this.add.text(headerPanelX + 12, headerY, challengeTitle, {
                fontSize: isNarrow ? '12.5px' : '16px', style: 'bold', color: (mode === 'dumpster' ? '#ff7043' : '#4dd0e1')
            }).setOrigin(0, 0.5);

            const btnExit = this.add.text(headerPanelX + headerPanelW - 10, headerY, '✖ EXIT', {
                fontSize: isNarrow ? '10px' : '11px', style: 'bold', backgroundColor: '#374151', color: '#ffffff', padding: { x: 8, y: 4 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
            btnExit.on('pointerup', () => this.exitArcade());

            // Toggleable colored rubbish background button (OFF by default)
            const bgBtnLabel = () => this.arcadeShowColorBg ? '🎨 BG: ON' : '🎨 BG: OFF';
            const btnBgToggle = this.add.text(headerPanelX + headerPanelW - btnExit.width - 16, headerY, bgBtnLabel(), {
                fontSize: isNarrow ? '10px' : '11px', style: 'bold',
                backgroundColor: this.arcadeShowColorBg ? '#15803d' : '#1e293b',
                color: this.arcadeShowColorBg ? '#ffffff' : '#cbd5e1',
                padding: { x: 7, y: 4 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnBgToggle.on('pointerup', () => {
                this.arcadeShowColorBg = !this.arcadeShowColorBg;
                btnBgToggle.setText(bgBtnLabel());
                btnBgToggle.setStyle({
                    backgroundColor: this.arcadeShowColorBg ? '#15803d' : '#1e293b',
                    color: this.arcadeShowColorBg ? '#ffffff' : '#cbd5e1'
                });
                this.renderArcadeQueue();
            });

            this.arcadeStatsTxt = this.add.text(w / 2, headerTop + 44, '', {
                fontSize: isNarrow ? '11.5px' : '13px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            this.arcadeBarY = headerTop + 64;
            this.arcadeBarGfx = this.add.graphics();

            this.arcadeContainer.add([titleTxt, btnBgToggle, btnExit, this.arcadeStatsTxt, this.arcadeBarGfx]);

            // Bins Row - Authentic animated wheelie bin sprites matching main game!
            const splitY = this.splitY || Math.round(h * 0.42);
            const binBaselineY = Math.min(h - safeBottom - 26, Math.max(Math.round(h * 0.78), splitY + 170));
            const binSpacing = Math.min(Math.floor((usableW - 24) / 4), 104);
            const startBinX = Math.round((w - (3 * binSpacing)) / 2);
            const maxBinW = Math.min(78, Math.max(48, binSpacing - 8));
            const maxBinH = Math.min(98, Math.round((h - safeBottom - splitY) * 0.38));
            const binScale = Math.min(
                BIN_SPRITE_CONFIG.scale,
                maxBinW / BIN_SPRITE_CONFIG.frameWidth,
                maxBinH / BIN_SPRITE_CONFIG.frameHeight
            );
            const visualBinW = Math.round(BIN_SPRITE_CONFIG.frameWidth * binScale);
            const visualBinH = Math.round(BIN_SPRITE_CONFIG.frameHeight * binScale);
            const binCenterY = binBaselineY - Math.round(visualBinH / 2);

            this.arcadeBins = [];

            const bins = [
                { id: 'organic', key: '1', name: 'GREEN', sprite: 'bin_green', sheetKey: 'bin_green_sheet', animKey: 'bin_green_anim', color: 0x4caf50 },
                { id: 'paper', key: '2', name: 'PAPER', sprite: 'bin_blue', sheetKey: 'bin_blue_sheet', animKey: 'bin_blue_anim', color: 0x2196f3 },
                { id: 'glass', key: '3', name: 'GLASS', sprite: 'bin_purple', sheetKey: 'bin_purple_sheet', animKey: 'bin_purple_anim', color: 0x9c27b0 },
                { id: 'plastic', key: '4', name: 'PLASTIC', sprite: 'bin_yellow', sheetKey: 'bin_yellow_sheet', animKey: 'bin_yellow_anim', color: 0xffeb3b }
            ];

            bins.forEach((b, idx) => {
                const bx = Math.round(startBinX + (idx * binSpacing));
                let binSprite = null;
                const hasSheet = !!(b.sheetKey && this.textures.exists(b.sheetKey));

                if (hasSheet) {
                    binSprite = this.add.sprite(bx, binBaselineY, b.sheetKey, 0)
                        .setOrigin(0.5, 1)
                        .setScale(binScale);
                    if (b.animKey) {
                        binSprite.on('animationcomplete', () => {
                            if (binSprite && binSprite.scene) {
                                binSprite.setFrame(0);
                                binSprite.setOrigin(0.5, 1);
                                binSprite.setScale(binScale);
                            }
                        });
                    }
                    this.arcadeContainer.add(binSprite);
                } else if (this.textures.exists(b.sprite)) {
                    binSprite = this.add.sprite(bx, binBaselineY, b.sprite)
                        .setOrigin(0.5, 1)
                        .setDisplaySize(visualBinW, visualBinH);
                    this.arcadeContainer.add(binSprite);
                }

                const bLabel = this.add.text(bx, binBaselineY - visualBinH - 12, isNarrow ? b.name : ('[' + b.key + '] ' + b.name), {
                    fontSize: isNarrow ? '10px' : '11px', style: 'bold', color: '#ffffff',
                    backgroundColor: '#111827', padding: { x: 5, y: 2 }
                }).setOrigin(0.5);

                const hitZone = this.add.zone(bx, binCenterY, Math.max(54, binSpacing - 2), visualBinH + 44)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true });
                hitZone.on('pointerdown', () => this.sortArcadeTrash(b.id));

                this.arcadeBins.push({
                    id: b.id, x: bx, y: binCenterY, baselineY: binBaselineY,
                    spacing: binSpacing, h: visualBinH,
                    sprite: binSprite, animKey: b.animKey, baseScale: binScale
                });
                this.arcadeContainer.add([bLabel, hitZone]);
            });

            // Queue display area (added AFTER bins so dragged arcade item renders ABOVE bins!)
            this.arcadeQueueItems = [];
            this.arcadeQueueContainer = this.add.container(0, 0);
            this.arcadeContainer.add(this.arcadeQueueContainer);

            this.renderArcadeQueue();
            this.updateArcade();
        }

        renderArcadeQueue() {
            if (!this.arcadeState || !this.arcadeState.active) return;
            this.arcadeQueueContainer.removeAll(true);

            const w = this.scale.width;
            const h = this.scale.height;
            const splitY = this.splitY || Math.round(h * 0.42);
            const firstBin = (this.arcadeBins && this.arcadeBins[0]) ? this.arcadeBins[0] : null;
            const binTop = firstBin ? (firstBin.baselineY - firstBin.h - 24) : Math.round(h * 0.62);
            const queueCenterY = Math.round(Math.max(splitY + 42, Math.min(binTop - 52, splitY + 62)));
            const gap = Math.min(54, Math.max(38, Math.floor(w / 8)));
            const startX = Math.round(w / 2);

            // Render back-to-front so hero item (idx 0) is always on top
            const visibleSlice = this.arcadeState.queue.slice(0, 7);
            for (let idx = visibleSlice.length - 1; idx >= 0; idx--) {
                const item = visibleSlice[idx];
                const qx = startX + (idx * gap);
                const isHero = (idx === 0);

                const itemCont = this.add.container(qx, queueCenterY);

                // Optional colored circle backing (controlled by Arcade BG toggle, OFF by default)
                if (this.arcadeShowColorBg) {
                    const bgCircle = this.add.graphics();
                    bgCircle.fillStyle(TRASH_TYPES[item.type].color, 1);
                    bgCircle.fillCircle(0, 0, 24);
                    bgCircle.lineStyle(2, 0x000000, 1);
                    bgCircle.strokeCircle(0, 0, 24);
                    itemCont.add(bgCircle);
                }

                if (this.textures.exists(item.spriteKey)) {
                    const img = this.add.image(0, 0, item.spriteKey).setDisplaySize(48, 48);
                    itemCont.add(img);
                }

                if (isHero) {
                    itemCont.setScale(1.18);
                    const heroRing = this.add.graphics();
                    heroRing.lineStyle(4, 0x000000, 0.45);
                    heroRing.strokeRoundedRect(-29, -29, 58, 58, 8);
                    heroRing.lineStyle(3, 0xffd700, 1);
                    heroRing.strokeRoundedRect(-29, -29, 58, 58, 8);
                    itemCont.add(heroRing);

                    // Allow dragging the hero item into arcade bins as well as tapping bins!
                    itemCont.setSize(84, 84);
                    itemCont.setInteractive({ draggable: true, useHandCursor: true });
                    this.input.setDraggable(itemCont);
                    itemCont.on('drag', (pointer, dragX, dragY) => {
                        const isTouch = !!(pointer && (pointer.wasTouch || pointer.pointerType === 'touch'));
                        itemCont.x = pointer ? pointer.x : dragX;
                        itemCont.y = (pointer ? pointer.y : dragY) + (isTouch ? -18 : 0);
                    });
                    itemCont.on('dragend', (pointer) => {
                        if (!this.arcadeBins || !this.arcadeState || !this.arcadeState.active) return;
                        const px = pointer ? pointer.x : itemCont.x;
                        const py = pointer ? pointer.y : itemCont.y;
                        let bestBin = null;
                        let bestDist = Infinity;
                        for (const ab of this.arcadeBins) {
                            const d = Phaser.Math.Distance.Between(px, py, ab.x, ab.y);
                            if (d < Math.max(82, ab.spacing * 0.85) && d < bestDist) {
                                bestDist = d;
                                bestBin = ab;
                            }
                        }
                        if (bestBin) {
                            this.sortArcadeTrash(bestBin.id);
                        } else {
                            this.renderArcadeQueue();
                        }
                    });
                } else {
                    itemCont.setScale(0.85);
                    itemCont.setAlpha(0.70 - (idx * 0.08));
                }

                this.arcadeQueueContainer.add(itemCont);
            }
        }

        sortArcadeTrash(targetType) {
            if (!this.arcadeState || !this.arcadeState.active || this.arcadeState.gameOver) return;
            if (this.arcadeState.queue.length === 0) return;

            const item = this.arcadeState.queue[0];
            const isCorrect = (item.type === targetType);

            if (isCorrect) {
                // Play the real bin lid animation!
                const targetBin = this.arcadeBins && this.arcadeBins.find(b => b.id === targetType);
                if (targetBin && targetBin.sprite && targetBin.sprite.scene && targetBin.sprite.anims && targetBin.animKey && this.anims && this.anims.exists(targetBin.animKey)) {
                    try { targetBin.sprite.play(targetBin.animKey); } catch (e) {}
                }

                this.arcadeState.queue.shift();
                const types = ['organic', 'paper', 'glass', 'plastic'];
                const nextType = types[Math.floor(Math.random() * types.length)];
                const nextTData = TRASH_TYPES[nextType];
                const nextSprite = (nextTData && nextTData.sprites && nextTData.sprites.length > 0)
                    ? nextTData.sprites[Math.floor(Math.random() * nextTData.sprites.length)]
                    : 'person';
                this.arcadeState.queue.push({ type: nextType, spriteKey: nextSprite });

                if (this.arcadeState.mode === 'dumpster') {
                    this.arcadeState.streak++;
                    this.arcadeState.sortedCount++;
                    // Refill shrinks smoothly as speed escalates so high streaks reward real sorting speed & accuracy!
                    const refill = Math.max(340, 800 - (this.arcadeState.sortedCount * 6));
                    this.arcadeState.streakTimer = Math.min(this.arcadeState.streakMax, this.arcadeState.streakTimer + refill);
                    const best = Math.max(Number(localStorage.getItem('arrc_arcade_best_streak') || 0), this.arcadeState.streak);
                    localStorage.setItem('arrc_arcade_best_streak', best);
                } else {
                    this.arcadeState.cleanupRemaining--;
                    this.arcadeState.sortedCount++;
                    if (this.arcadeState.cleanupRemaining <= 0) {
                        this.endArcade(true);
                        return;
                    }
                }
            } else {
                if (this.arcadeState.mode === 'dumpster') {
                    if (this.cameras && this.cameras.main) this.cameras.main.flash(100, 255, 0, 0);
                    this.endArcade(false);
                    return;
                } else {
                    this.arcadeState.cleanupElapsed += 2000;
                    if (this.cameras && this.cameras.main) this.cameras.main.flash(80, 255, 0, 0);
                }
            }

            this.renderArcadeQueue();
        }

        updateArcade() {
            if (!this.arcadeState || !this.arcadeState.active || this.arcadeState.gameOver) return;

            // Always advance using wall-clock time so tabbing out NEVER pauses arcade timers!
            const now = Date.now();
            const realDelta = Math.max(0, now - (this.arcadeState.lastWallTime || now));
            this.arcadeState.lastWallTime = now;

            const w = this.scale.width;
            const barY = this.arcadeBarY || 82;

            if (this.arcadeState.mode === 'dumpster') {
                const sc = this.arcadeState.sortedCount || 0;
                // Progressive speed ramp: starts 1.0x, hits ~1.6x by 12, ~2.4x by 28, ~3.4x by 48, caps at 4.0x
                const speedMult = 1 + Math.min(3.0, (sc * 0.04) + (Math.pow(sc / 40, 1.35) * 0.5));
                this.arcadeState.speedMult = speedMult;

                this.arcadeState.streakTimer -= (realDelta * speedMult);
                if (this.arcadeState.streakTimer <= 0) {
                    this.arcadeState.streakTimer = 0;
                    this.endArcade(false);
                    return;
                }

                if (this.arcadeStatsTxt) {
                    this.arcadeStatsTxt.setText('🔥 STREAK: ' + this.arcadeState.streak + '  |  SORTED: ' + sc + '  |  ⚡ ' + speedMult.toFixed(1) + 'x');
                }

                if (this.arcadeBarGfx) {
                    this.arcadeBarGfx.clear();
                    const barW = Math.min(w * 0.72, 340);
                    const barH = 12;
                    const barX = Math.round((w - barW) / 2);
                    const ratio = Math.max(0, this.arcadeState.streakTimer / this.arcadeState.streakMax);

                    this.arcadeBarGfx.fillStyle(0x222222, 0.9);
                    this.arcadeBarGfx.fillRect(barX, barY, barW, barH);
                    this.arcadeBarGfx.fillStyle(ratio < 0.35 ? 0xf44336 : 0xff7043, 1);
                    this.arcadeBarGfx.fillRect(barX, barY, barW * ratio, barH);
                    this.arcadeBarGfx.lineStyle(1.5, 0xffca28, 1);
                    this.arcadeBarGfx.strokeRect(barX, barY, barW, barH);
                }
            } else {
                this.arcadeState.cleanupElapsed += realDelta;
                const totalSec = Math.floor(this.arcadeState.cleanupElapsed / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                const timeStr = m + ':' + (s < 10 ? '0' : '') + s;

                if (this.arcadeStatsTxt) {
                    this.arcadeStatsTxt.setText('REMAINING: ' + this.arcadeState.cleanupRemaining + ' / 500  |  TIME: ' + timeStr);
                }

                if (this.arcadeBarGfx) {
                    this.arcadeBarGfx.clear();
                    const barW = Math.min(w * 0.72, 340);
                    const barH = 12;
                    const barX = Math.round((w - barW) / 2);
                    const ratio = (500 - this.arcadeState.cleanupRemaining) / 500;

                    this.arcadeBarGfx.fillStyle(0x222222, 0.9);
                    this.arcadeBarGfx.fillRect(barX, barY, barW, barH);
                    this.arcadeBarGfx.fillStyle(0x00e676, 1);
                    this.arcadeBarGfx.fillRect(barX, barY, barW * ratio, barH);
                    this.arcadeBarGfx.lineStyle(1.5, 0x4dd0e1, 1);
                    this.arcadeBarGfx.strokeRect(barX, barY, barW, barH);
                }
            }
        }

        endArcade(isWin) {
            if (!this.arcadeState) return;
            this.arcadeState.gameOver = true;
            const w = this.scale.width;
            const h = this.scale.height;

            const modalW = Math.min(w * 0.88, 380);
            const modalH = 220;
            const mx = (w - modalW) / 2;
            const my = (h - modalH) / 2;

            const box = this.add.graphics();
            box.fillStyle(0x111827, 0.96);
            box.fillRoundedRect(mx, my, modalW, modalH, 12);
            box.lineStyle(2, isWin ? 0x00e676 : 0xff5722, 1);
            box.strokeRoundedRect(mx, my, modalW, modalH, 12);

            const title = this.add.text(w / 2, my + 30, isWin ? '🎉 CHALLENGE COMPLETE! 🎉' : '🔥 CHALLENGE OVER 🔥', {
                fontSize: '16px', style: 'bold', color: isWin ? '#00e676' : '#ff5722'
            }).setOrigin(0.5);

            let scoreMsg = '';
            if (this.arcadeState.mode === 'dumpster') {
                scoreMsg = 'Final Streak: ' + this.arcadeState.streak + '\\nTotal Items: ' + this.arcadeState.sortedCount;
            } else {
                const totalSec = Math.floor(this.arcadeState.cleanupElapsed / 1000);
                scoreMsg = (isWin ? 'Completed in: ' : 'Time elapsed: ') + Math.floor(totalSec / 60) + 'm ' + (totalSec % 60) + 's\\nItems Left: ' + this.arcadeState.cleanupRemaining;
            }

            const msg = this.add.text(w / 2, my + 85, scoreMsg, {
                fontSize: '13px', color: '#ffffff', align: 'center', lineSpacing: 4
            }).setOrigin(0.5);

            const btnRetry = this.add.text(mx + 45, my + modalH - 35, '🔄 PLAY AGAIN', {
                fontSize: '11.5px', style: 'bold', backgroundColor: '#2563eb', color: '#fff', padding: { x: 12, y: 7 }
            }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

            btnRetry.on('pointerup', () => {
                this.startArcadeChallenge(this.arcadeState.mode);
            });

            const btnExit = this.add.text(mx + modalW - 45, my + modalH - 35, '🚪 EXIT', {
                fontSize: '11.5px', style: 'bold', backgroundColor: '#374151', color: '#fff', padding: { x: 16, y: 7 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnExit.on('pointerup', () => {
                this.exitArcade();
            });

            this.arcadeContainer.add([box, title, msg, btnRetry, btnExit]);
        }

        exitArcade() {
            if (this.arcadeKeyHandler) {
                window.removeEventListener('keydown', this.arcadeKeyHandler);
                this.arcadeKeyHandler = null;
            }
            if (this.arcadeContainer) {
                this.arcadeContainer.destroy();
                this.arcadeContainer = null;
            }
            this.arcadeState.active = false;
            if (this.activeBuses && this.activeBuses.length > 0) {
                this.activeBuses.forEach(b => {
                    if (b && b.active) b.setVisible(true);
                });
            }
            if (this.mainContainer) this.mainContainer.setVisible(true);
            this.requestLayoutRebuild();
        }

        refreshUpgradeModalAffordances() {
            if (!this.activeUpgradeCards || this.activeModal !== 'upgrades') return;
            const currentList = this.getUpgradeListForCategory(this.activeUpgradeCategory);
            this.activeUpgradeCards.forEach(c => {
                const item = currentList[c.idx];
                if (item && c.btnBuy && c.btnBuy.scene) {
                    c.btnBuy.setBackgroundColor(item.canAfford ? '#00e676' : '#424242');
                    c.btnBuy.setColor(item.canAfford ? '#000000' : '#aaaaaa');
                }
            });
            if (this.sidebarCategoryBtns) {
                const cats = ['gate', 'conveyor', 'bins', 'skills'];
                const iconMap = { gate: '🚪 Gate', conveyor: '🔄 Conveyor', bins: '🗑️ Bins', skills: '⭐ Skills' };
                cats.forEach(cat => {
                    const btn = this.sidebarCategoryBtns[cat];
                    if (btn && btn.scene) {
                        const hasAff = this.hasCategoryAffordable(cat);
                        const isSel = (this.activeUpgradeCategory === cat);
                        const baseLbl = btn.baseLabel || iconMap[cat];
                        btn.setText(hasAff ? (baseLbl + ' (!)') : baseLbl);
                        if (!isSel) btn.setColor(hasAff ? '#ffd700' : '#aaaaaa');
                    }
                });
            }
        }

        updateUI() {
            if (this.hudTextObj) {
                const r = this.state.resources;
                const hasExtraTypes = (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric);
                let text = '💵 Cash: $' + this.state.money + '  |  ⭐ SP: ' + (this.state.skillPoints || 0) + '\\n' +
                           '🟢 Organic: ' + r.organic + '   🔵 Paper: ' + r.paper + '\\n' +
                           '🟡 Plastic: ' + r.plastic + '   🟣 Glass: ' + r.glass;
                if (hasExtraTypes) {
                    text += '\\n';
                    if (this.state.unlockedTypes.metal) text += '⚪ Metal: ' + (r.metal || 0) + '   ';
                    if (this.state.unlockedTypes.fabric) text += '🌸 Fabric: ' + (r.fabric || 0);
                }
                this.hudTextObj.setText(text);
            }
            if (this.modalWalletTxt && this.activeModal === 'upgrades') {
                this.modalWalletTxt.setText('$' + this.state.money + ' | ⭐' + (this.state.skillPoints || 0) + ' SP');
                this.refreshUpgradeModalAffordances();
            }

            if (this.bins) {
                this.bins.forEach(b => {
                    if (b.countText && this.state.resources[b.id] !== undefined) {
                        b.countText.setText('' + this.state.resources[b.id]);
                    }
                });
            }

            if (this.dumpsterStreakText) {
                let streakLabel = '🔥 STREAK: ' + this.state.streak;
                if (this.state.streak >= 10 && this.state.streakTimer > 0) {
                    streakLabel = '🔥 2X STREAK: ' + this.state.streak + ' (2X BONUS!)';
                }
                this.dumpsterStreakText.setText(streakLabel + '  |  BEST: ' + this.state.streakHighScore);
            }

            this.updateXPBarUI();
            this.updateCustomerShopUI();
        }
    }

    const initVp = getVisibleViewportSize();
    const initContainer = document.getElementById('game-container');
    if (initContainer) {
        initContainer.style.width = initVp.width + 'px';
        initContainer.style.height = initVp.height + 'px';
    }

    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        resolution: window.devicePixelRatio || 1,
        autoFocus: false,
        input: {
            activePointers: 3
        },
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
        render: {
            antialias: true,
            roundPixels: true
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: initVp.width,
            height: initVp.height
        },
        scene: [MainScene]
    };

    const game = new Phaser.Game(config);

    // Keep Phaser canvas strictly matched to the real visible viewport on mobile browsers
    // (handles Chrome/Samsung Internet toolbars, Flip 4 fold/unfold, and orientation changes)
    let vpSyncTimer = null;
    function syncGameToVisibleViewport() {
        const vp = getVisibleViewportSize();
        const container = document.getElementById('game-container');
        if (container) {
            container.style.width = vp.width + 'px';
            container.style.height = vp.height + 'px';
        }
        // Only resize Phaser once its canvas & ScaleManager have finished booting!
        if (game && game.isBooted && game.canvas && game.scale &&
            (game.scale.width !== vp.width || game.scale.height !== vp.height)) {
            game.scale.resize(vp.width, vp.height);
        }
    }
    function scheduleViewportSync() {
        if (vpSyncTimer) clearTimeout(vpSyncTimer);
        vpSyncTimer = setTimeout(syncGameToVisibleViewport, 60);
    }
    if (game && game.events) {
        game.events.once('ready', syncGameToVisibleViewport);
    }
    window.addEventListener('resize', scheduleViewportSync);
    window.addEventListener('orientationchange', () => {
        setTimeout(syncGameToVisibleViewport, 120);
        setTimeout(syncGameToVisibleViewport, 350);
    });
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleViewportSync);
    }
    </script>
</body>
</html>`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully updated build_html.js & generated index.html!');
