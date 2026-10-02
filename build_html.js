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
    <script>if (typeof Phaser === 'undefined') { document.write('<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"><\\/script>'); }</script>
    <style>
        * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: none; box-sizing: border-box; }
        html, body {
            margin: 0; padding: 0; width: 100vw; height: 100vh;
            background-color: #121824; overflow: hidden;
            display: flex; justify-content: center; align-items: center;
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        #game-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
    </style>
</head>
<body>
    <div id="game-container"></div>

    <script>
    // Global Error Handler for immediate visual feedback
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        var errDiv = document.getElementById('game-err-banner');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'game-err-banner';
            errDiv.style.position = 'fixed'; errDiv.style.top = '10px'; errDiv.style.left = '10px'; errDiv.style.right = '10px';
            errDiv.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; errDiv.style.color = '#ffffff'; errDiv.style.padding = '14px';
            errDiv.style.fontFamily = "'Outfit', sans-serif"; errDiv.style.zIndex = '999999'; errDiv.style.fontSize = '13px';
            errDiv.style.borderRadius = '8px'; errDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6)';
            document.body.appendChild(errDiv);
        }
        errDiv.innerHTML = '<b>⚠️ GAME ERROR:</b><br>' + msg + '<br>Line: ' + lineNo + ' Col: ' + columnNo + (error && error.stack ? '<br><pre>' + error.stack + '</pre>' : '');
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

                // Customer Arrival Settings (Tuned so player can clear queue and feel cleaned up)
                customerSpawnChance: 0.25,
                spawnDelay: 2500,
                excessTrashCount: 0,
                factoryUnlocked: false,

                // Automation Timers
                isGateAuto: false,
                autoGateSpeed: 5000,
                autoGateTimer: 0,
                unlockedAutoSort: false,
                autoSortDelay: 8000,
                autoSortTimer: 0,
                autoSortPaused: false,

                // Sanitiser Station Stats
                unlockedSanitiser: false,
                sanitiserCooldown: 0,
                sanitiserMaxCooldown: 2500,

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
                    fertilizer: 0, paper_bundle: 0, plastic_pellets: 0, crushed_cullet: 0
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
                            if (bObj && bObj.sprite) {
                                bObj.sprite.setTexture(sheetKey, 0);
                                bObj.sprite.setScale(BIN_SPRITE_CONFIG.scale);
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
                    this.updateSanitiserBtnUI();
                    this.updateUI();
                },
                loop: true
            });

            // Keyboard Shortcuts
            this.input.keyboard.on('keydown', (e) => {
                if (this.arcadeState && this.arcadeState.active) {
                    if (['1','2','3','4','5','6'].includes(e.key)) {
                        const typeMap = { '1': 'organic', '2': 'paper', '3': 'glass', '4': 'plastic', '5': 'metal', '6': 'fabric' };
                        const chosen = typeMap[e.key];
                        if (chosen) this.sortArcadeTrash(chosen);
                    } else if (e.code === 'Space') {
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
                    this.triggerGate();
                } else if (e.code === 'KeyV') {
                    this.triggerSanitiseAction();
                } else if (e.code === 'KeyB') {
                    this.cashInActiveBus();
                }
            });

            // Customer Spawner Loop
            this.spawnerEvent = this.time.addEvent({
                delay: (this.state.spawnDelay || 2500),
                callback: () => {
                    if (Math.random() < this.state.customerSpawnChance) {
                        this.spawnCustomer();
                    }
                },
                loop: true
            });

            // Bus Rush Event Loop with frequency tracking
            this.scheduleBusRush();

            // Auto-Gate Loop
            this.time.addEvent({
                delay: 50,
                callback: () => {
                    if (this.state.isGateAuto) {
                        this.state.autoGateTimer += 50;
                        const progress = Math.min(1, this.state.autoGateTimer / this.state.autoGateSpeed);
                        this.drawAutoGateProgress(progress);
                        if (progress >= 1 && this.customerQueue.length > 0) {
                            this.triggerGate();
                            this.state.autoGateTimer = 0;
                        }
                    }
                },
                loop: true
            });

            // Auto-Sort Loop: Automatically sorts from excess queue (items beyond the 10 visible items)
            this.time.addEvent({
                delay: 50,
                callback: () => {
                    const hasExcess = (this.state.excessTrashCount || 0) > 0;
                    const canAutoSort = this.state.unlockedAutoSort && !this.state.autoSortPaused && hasExcess;
                    if (canAutoSort) {
                        this.state.autoSortTimer += 50;
                        const sortProgress = Math.min(1, this.state.autoSortTimer / this.state.autoSortDelay);
                        this.drawAutoSortProgress(sortProgress);
                        if (sortProgress >= 1) {
                            this.state.excessTrashCount--;
                            const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
                            const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
                            const mult = (Math.random() < this.state.doubleTokenChance) ? 2 : 1;
                            this.state.resources[typeKey] += mult;
                            this.state.money += 1;
                            this.addXP(mult);
                            this.state.autoSortTimer = 0;
                            this.renderHorizontalQueue();
                            this.updateUI();
                        }
                    } else {
                        this.drawAutoSortProgress(0);
                    }
                },
                loop: true
            });

            // Meadow Shop Customer Replenishment Loop (Up to 3 in line above dirt)
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    if (this.shopCustomers && this.shopCustomers.length < 3) {
                        this.spawnShopCustomer(false);
                    }
                },
                loop: true
            });

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
            this.clouds = [];
            const w = this.scale.width || 800;
            for (let i = 0; i < 4; i++) {
                const cx = (w / 4) * i + Phaser.Math.Between(-30, 30);
                const cy = Phaser.Math.Between(20, 85);
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
                if (this.state.busRushUnlocked && Math.random() < 0.65) {
                    this.triggerBusRushEvent();
                }
                this.scheduleBusRush();
            });
        }

        update(time, delta) {
            if (this.clouds && this.clouds.length > 0) {
                const w = this.scale.width || 800;
                this.clouds.forEach(c => {
                    c.x += (c.speed || 0.02) * delta;
                    if (c.x > w + 80) c.x = -80;
                });
            }

            if (this.state && this.state.streakTimer > 0) {
                this.state.streakTimer = Math.max(0, this.state.streakTimer - delta);
                if (this.state.streakTimer <= 0) {
                    this.state.streak = 0;
                    this.state.dumpsterFireActive = false;
                }
                this.renderDumpsterFireBar();
            } else if (this.state) {
                this.renderDumpsterFireBar();
            }

            if (this.state && this.state.sanitiserCooldown > 0) {
                this.state.sanitiserCooldown = Math.max(0, this.state.sanitiserCooldown - delta);
                this.updateSanitiserBtnUI();
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
                this.updateArcade(delta);
            }
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
            const barW = 160;
            const barH = 6;
            const barX = this.dumpsterStreakText.x - (barW / 2);
            const barY = this.dumpsterStreakText.y + 14;

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

            const customerContainer = this.add.container(-50, this.gatePos ? this.gatePos.y : 600, [personSprite, bagSprite]).setDepth(15);
            if (this.mainContainer) this.mainContainer.add(customerContainer);
            this.customerQueue.push(customerContainer);
            this.repositionCustomerQueue();
        }

        repositionCustomerQueue() {
            if (!this.gatePos) return;
            const startX = this.gatePos.x - 45;
            const spacing = 28;

            this.customerQueue.forEach((cust, idx) => {
                const targetX = startX - (idx * spacing);
                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: cust,
                        x: targetX,
                        y: this.gatePos.y,
                        duration: 200
                    });
                } else {
                    cust.x = targetX;
                    cust.y = this.gatePos.y;
                }
            });
        }

        triggerGate() {
            if (this.arcadeState && this.arcadeState.active) return;
            if (this.customerQueue.length === 0) {
                if (this.gatePos) {
                    const cleanTxt = this.add.text(this.gatePos.x, this.gatePos.y - 30, '✨ ALL CLEAN! (No Queue)', {
                        fontSize: '11px', style: 'bold', color: '#38bdf8', backgroundColor: '#0f172a', padding: 4
                    }).setOrigin(0.5).setDepth(20);
                    if (this.tweens && this.tweens.add) {
                        this.tweens.add({ targets: cleanTxt, y: cleanTxt.y - 25, alpha: 0, duration: 750, onComplete: () => cleanTxt.destroy() });
                    } else {
                        cleanTxt.destroy();
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
                    y: cust.y + 80,
                    alpha: 0,
                    duration: 250,
                    onComplete: () => cust.destroy()
                });
            } else {
                popTxt.destroy();
                cust.destroy();
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
                const gap = this.queueGap || 50;
                container.setPosition(this.queueStartX + (itemIdx * gap), this.queueY);

                this.trashQueue.push({
                    container: container,
                    type: typeData.id,
                    multiplier: startMult,
                    spriteKey: container ? container.spriteKey : null
                });
            }
        }

        updateSanitiserBtnUI() {
            if (!this.sanitiserContainer || !this.sanitiserBgGfx || !this.sanitiserBgGfx.scene) return;
            const maxCd = this.state.sanitiserMaxCooldown || 2500;
            const cd = this.state.sanitiserCooldown || 0;
            const pct = Math.min(1, Math.max(0, 1 - (cd / maxCd)));
            const btnSize = 30;

            if (this.sanitiserFillGfx) {
                this.sanitiserFillGfx.clear();
                if (pct < 1) {
                    this.sanitiserFillGfx.fillStyle(0x000000, 0.55);
                    const cdH = Math.round(btnSize * (1 - pct));
                    this.sanitiserFillGfx.fillRoundedRect(0, btnSize - cdH, btnSize, cdH, 6);
                }
            }

            if (this.sanitiserBgGfx) {
                this.sanitiserBgGfx.clear();
                this.sanitiserBgGfx.fillStyle(0x1e293b, 0.95);
                this.sanitiserBgGfx.fillRoundedRect(0, 0, btnSize, btnSize, 6);
                if (pct >= 1) {
                    this.sanitiserBgGfx.lineStyle(2, 0x00e676, 1);
                } else {
                    this.sanitiserBgGfx.lineStyle(1.5, 0x475569, 0.7);
                }
                this.sanitiserBgGfx.strokeRoundedRect(0, 0, btnSize, btnSize, 6);
            }
        }

        triggerSanitiseAction() {
            if (!this.state.unlockedSanitiser || this.state.sanitiserCooldown > 0 || this.trashQueue.length === 0) return;
            const headItem = this.trashQueue[0];
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
                if (this.mainContainer) this.mainContainer.add(newContainer);

                this.state.sanitiserMaxCooldown = 2500;
                this.state.sanitiserCooldown = 2500;
                this.updateSanitiserBtnUI();
                this.renderHorizontalQueue();
            }
        }

        triggerPetClean(typeId, petName) {
            if (this.trashQueue.length === 0) return;
            const matchingIndices = [];
            this.trashQueue.forEach((item, idx) => {
                if (idx < 10 && item.type === typeId) matchingIndices.push(idx);
            });
            if (matchingIndices.length === 0) return;

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

            const targetBin = this.bins.find(b => b.id === typeId);
            const popX = targetBin ? targetBin.x : (this.scale.width / 2);
            const popY = targetBin ? (targetBin.y - 25) : 350;

            const pop = this.add.text(popX, popY, petName + ' CASHOUT! +' + totalTokens + ' ' + TRASH_TYPES[typeId].name, {
                fontSize: '12px', style: 'bold', color: TRASH_TYPES[typeId].colorHex || '#ffd700', backgroundColor: '#111', padding: 5
            }).setOrigin(0.5).setDepth(25);

            if (this.tweens && this.tweens.add) {
                this.tweens.add({ targets: pop, y: pop.y - 35, alpha: 0, duration: 900, onComplete: () => pop.destroy() });
            } else {
                pop.destroy();
            }

            this.fillQueueFromExcess();
            this.updateUI();
            this.renderHorizontalQueue();
        }

        cashInActiveBus() {
            if (this.activeBusContainer && this.activeBusContainer.active && this.activeBusContainer.cashInHandler) {
                this.activeBusContainer.cashInHandler();
            }
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
            if (this.activeBusContainer && this.activeBusContainer.active) return;
            const w = this.scale.width;
            const y = this.gatePos ? this.gatePos.y + 20 : 620;

            const busContainer = this.add.container(-140, y).setDepth(200);
            this.activeBusContainer = busContainer;
            
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

            const labelText = this.add.text(0, 9, '🚌 +10 (TAP/B)', {
                fontSize: '11px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            busContainer.add([busGfx, labelText]);

            // Generous touch hit area (170px wide x 80px tall), perfectly centered directly on the 126x44 visual bus
            busContainer.setSize(170, 80);
            busContainer.setInteractive({
                useHandCursor: true
            });

            let busClicked = false;

            const handleCashIn = () => {
                if (busClicked) return;
                busClicked = true;

                for (let i = 0; i < 10; i++) {
                    this.addTrashToConveyor();
                }
                this.updateUI();

                const floatTxt = this.add.text(busContainer.x, busContainer.y - 20, '🚌 +10 RUBBISH ON CONVEYOR! 🚌', {
                    fontSize: '15px', style: 'bold', color: '#ff9800', backgroundColor: '#000000', padding: 6
                }).setOrigin(0.5).setDepth(230);

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
                        onComplete: () => {
                            busContainer.destroy();
                            this.activeBusContainer = null;
                        }
                    });
                } else {
                    floatTxt.destroy();
                    busContainer.destroy();
                    this.activeBusContainer = null;
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
                        this.activeBusContainer = null;
                    }
                });
            }
        }

        getCurrentBuyerTokens(customer) {
            if (!customer || !customer.order) return 0;
            const o = customer.order;
            if (o.isRecipe) {
                const reqTokens = o.costTokens || {};
                const key = Object.keys(reqTokens)[0];
                return this.state.resources[key] || 0;
            }
            return this.state.resources[o.itemKey] || 0;
        }

        generateBuyerOrderData() {
            const unlockedRecipeKeys = [];
            if (this.state.unlockedRecipes) {
                Object.keys(this.state.unlockedRecipes).forEach(rKey => {
                    if (this.state.unlockedRecipes[rKey]) unlockedRecipeKeys.push(rKey);
                });
            }

            const wantRecipe = (unlockedRecipeKeys.length > 0) && (Math.random() < 0.35);

            if (wantRecipe) {
                const rKey = unlockedRecipeKeys[Math.floor(Math.random() * unlockedRecipeKeys.length)];
                const rData = RECIPES_DATA[rKey];
                return {
                    isRecipe: true,
                    itemKey: rKey,
                    itemName: rData.name,
                    icon: '🌱',
                    qty: 1,
                    costTokens: rData.costTokens,
                    rewardCash: rData.sellPrice,
                    rewardXP: rData.xpReward
                };
            }

            const activeKeys = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]);
            const typeKey = (activeKeys.length > 0) ? activeKeys[Math.floor(Math.random() * activeKeys.length)] : 'organic';
            const typeData = TRASH_TYPES[typeKey];
            const qty = Phaser.Math.Between(2, 4);
            const cash = (qty * 5) + Phaser.Math.Between(2, 6);
            const xp = (qty * 8) + 6;

            const icons = {
                organic: '🟢',
                paper: '🔵',
                plastic: '🟡',
                glass: '🟣',
                metal: '⚪',
                fabric: '🌸'
            };

            return {
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
            const person = this.add.sprite(0, 0, 'person').setOrigin(0.5, 0.5);

            const haveTokens = this.getCurrentBuyerTokens(customer);
            const canAfford = haveTokens >= customer.order.qty;

            const bubbleGfx = this.add.graphics();
            bubbleGfx.fillStyle(0x0f172a, 0.95);
            bubbleGfx.fillRoundedRect(-38, -70, 76, 46, 5);
            bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
            bubbleGfx.strokeRoundedRect(-38, -70, 76, 46, 5);
            bubbleGfx.fillStyle(0x0f172a, 0.95);
            bubbleGfx.fillTriangle(-4, -24, 4, -24, 0, -19);
            bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
            bubbleGfx.lineBetween(-4, -24, 0, -19);
            bubbleGfx.lineBetween(0, -19, 4, -24);

            const orderTxt = this.add.text(0, -62, customer.order.icon + ' x' + customer.order.qty + ' (+$' + customer.order.rewardCash + ')', {
                fontSize: '9.5px', style: 'bold', color: '#ffca28'
            }).setOrigin(0.5);

            const stockTxt = this.add.text(0, -50, 'Have: ' + haveTokens + '/' + customer.order.qty, {
                fontSize: '8.5px', style: 'bold', color: canAfford ? '#4ade80' : '#f87171'
            }).setOrigin(0.5);

            // Accept button on LEFT (-17), Reject button on RIGHT (+17)
            const btnAccept = this.add.text(-17, -35, '✓', {
                fontSize: '11px', style: 'bold',
                backgroundColor: canAfford ? '#15803d' : '#334155',
                color: canAfford ? '#ffffff' : '#9ca3af',
                padding: { x: 6, y: 1 }
            }).setOrigin(0.5);

            const btnReject = this.add.text(17, -35, '✕', {
                fontSize: '11px', style: 'bold',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                padding: { x: 5, y: 1 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            if (canAfford) {
                btnAccept.setInteractive({ useHandCursor: true });
            }

            btnAccept.on('pointerup', () => this.fulfillBuyerOrder(customer));
            btnReject.on('pointerup', () => this.rejectBuyerOrder(customer));

            const custContainer = this.add.container(startX, walkY, [
                person, bubbleGfx, orderTxt, stockTxt, btnAccept, btnReject
            ]).setDepth(15);

            customer.container = custContainer;
            customer.bubbleGfx = bubbleGfx;
            customer.orderTxt = orderTxt;
            customer.stockTxt = stockTxt;
            customer.btnAccept = btnAccept;
            customer.btnReject = btnReject;

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

                if (cust.stockTxt) {
                    cust.stockTxt.setText('Have: ' + haveTokens + '/' + reqTokens);
                    cust.stockTxt.setColor(canAfford ? '#4ade80' : '#f87171');
                }

                if (cust.bubbleGfx) {
                    cust.bubbleGfx.clear();
                    cust.bubbleGfx.fillStyle(0x0f172a, 0.95);
                    cust.bubbleGfx.fillRoundedRect(-38, -70, 76, 46, 5);
                    cust.bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
                    cust.bubbleGfx.strokeRoundedRect(-38, -70, 76, 46, 5);
                    cust.bubbleGfx.fillStyle(0x0f172a, 0.95);
                    cust.bubbleGfx.fillTriangle(-4, -24, 4, -24, 0, -19);
                    cust.bubbleGfx.lineStyle(1.5, canAfford ? 0x22c55e : 0x38bdf8, 1);
                    cust.bubbleGfx.lineBetween(-4, -24, 0, -19);
                    cust.bubbleGfx.lineBetween(0, -19, 4, -24);
                }

                if (cust.btnAccept) {
                    cust.btnAccept.setStyle({
                        backgroundColor: canAfford ? '#15803d' : '#334155',
                        color: canAfford ? '#ffffff' : '#9ca3af'
                    });
                    if (canAfford) {
                        cust.btnAccept.setInteractive({ useHandCursor: true });
                    } else {
                        if (cust.btnAccept.input) cust.btnAccept.disableInteractive();
                    }
                }
            });
        }

        getShopQueueSlotX(slotIndex) {
            const width = this.scale.width || 800;
            const pageCenter = Math.round(width / 2);
            const storeX = Math.round(pageCenter - 65);
            const slotSpacing = 68;
            return Math.round((storeX - 48) - (slotIndex * slotSpacing));
        }

        spawnShopCustomer(instant = false) {
            if (!this.shopCustomers) this.shopCustomers = [];
            if (this.shopCustomers.length >= 3) return;

            const slotIndex = this.shopCustomers.length;
            const targetX = this.getShopQueueSlotX(slotIndex);
            const walkY = (this.splitY || 240) - 20;

            const orderData = this.generateBuyerOrderData();
            const customer = {
                id: 'cust_' + Date.now() + '_' + Math.random(),
                order: orderData,
                targetSlot: slotIndex,
                leaving: false,
                container: null
            };

            const width = this.scale.width || 800;
            const mobileWidth = Math.min(width, 480);
            const mobileLeft = Math.round((width - mobileWidth) / 2);
            const startX = instant ? targetX : Math.min(targetX - 70, mobileLeft - 35);

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
            if (customer.order.isRecipe) {
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

            if (this.tweens && this.tweens.add) {
                this.tweens.add({ targets: popTxt, y: popTxt.y - 25, alpha: 0, duration: 800, onComplete: () => popTxt.destroy() });
            } else {
                popTxt.destroy();
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

        handleResize(gameSize) {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setSize(gameSize.width, gameSize.height);
                this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
            }
            this.layoutRebuildPending = false;
            this.buildLayout();
        }

        buildLayout() {
            if (this.mainContainer) this.mainContainer.destroy(true);
            this.mainContainer = this.add.container(0, 0).setDepth(10);

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
            const isMobile = (height > width && width < 600) || width < 520;
            const isSmallScreen = height < 650;

            const topBarY = (height < 600) ? 26 : 34;
            const questY = topBarY + (isSmallScreen ? 70 : 85);

            if (this.state.tutorial.active && this.state.tutorial.step > 0) {
                this.renderTutorialBanner(width, questY + 105);
            }

            const binH = isSmallScreen ? 85 : 100;
            const binBaselineY = height - (isSmallScreen ? 32 : 44);
            const binCenterY = binBaselineY - (binH / 2);
            const queueY = binBaselineY - binH - (isSmallScreen ? 44 : 54);
            const toolbarY = queueY - 36;
            const splitY = Math.max(topBarY + 85, toolbarY - (isSmallScreen ? 35 : 45));

            if (this.skyGfx) this.skyGfx.destroy();
            if (this.groundGfx) this.groundGfx.destroy();

            // Sky gradient at depth 0 (clouds at depth 1 drift above the sky)
            this.skyGfx = this.add.graphics().setDepth(0);
            this.skyGfx.fillStyle(0x64b5f6, 1);
            this.skyGfx.fillRect(0, 0, width, splitY);
            this.skyGfx.fillStyle(0x90caf9, 0.45);
            this.skyGfx.fillRect(0, splitY - 45, width, 45);

            if (this.clouds) {
                this.clouds.forEach(c => c.setDepth(1));
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

            const activeBinCount = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]).length;
            const binSpacing = Math.min(Math.floor((width - 30) / activeBinCount), isSmallScreen ? 70 : 88);
            const startBinX = Math.round((width - (binSpacing * (activeBinCount - 1))) / 2);

            this.renderCenteredXPBar(width, topBarY);
            this.renderTopHUDBar(width, topBarY, isMobile);
            this.createTopNavButtons(width);

            // 1. WALKING MEADOW CUSTOMERS (Above dirt, up to 3 in line)
            this.renderMeadowShopLine(width, splitY);

            // 3. QUEUE ROW
            this.queueY = queueY;
            const maxQueueW = width - (isMobile ? 44 : 64);
            const queueGap = Math.min(isSmallScreen ? 44 : 50, Math.max(34, Math.floor(maxQueueW / 10)));
            this.queueGap = queueGap;
            this.itemDisplaySize = Math.min(48, queueGap);
            const queueTotalSpan = 10 * queueGap;
            this.queueStartX = Math.max(isMobile ? 16 : 24, Math.round((width - queueTotalSpan) / 2));

            const hs = this.itemDisplaySize + 6;
            this.queueHighlight = this.add.graphics().setDepth(15);
            this.queueHighlight.lineStyle(3, 0xffd700, 1);
            this.queueHighlight.strokeRect(-hs / 2, -hs / 2, hs, hs);
            this.queueHighlight.setVisible(false);

            // Dedicated container for all visible conveyor items inside mainContainer
            this.conveyorContainer = this.add.container(0, 0).setDepth(12);

            // Dark grey overflow block to the right of the queue
            this.overflowBlockContainer = this.add.container(0, 0).setDepth(20).setVisible(false);
            const obSize = Math.min(46, this.itemDisplaySize);
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

            // Toolbar above conveyor: Sanitiser station, Pet helpers (Center-aligned, matching compact 30x30 size!) & Auto-Sort toggle
            const btnSize = 30;
            const btnSpacing = 7;

            // Collect active action buttons
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

            // Center align the entire cluster of queue action buttons!
            const totalActionW = (activeActionButtons.length * btnSize) + Math.max(0, (activeActionButtons.length - 1) * btnSpacing);
            const clusterStartX = Math.round((width - totalActionW) / 2);

            activeActionButtons.forEach((act, idx) => {
                const bx = clusterStartX + (idx * (btnSize + btnSpacing));
                const btnContainer = this.add.container(bx, toolbarY).setDepth(20);

                const bgGfx = this.add.graphics();
                bgGfx.fillStyle(0x1e293b, 0.95);
                bgGfx.fillRoundedRect(0, 0, btnSize, btnSize, 6);
                bgGfx.lineStyle(1.5, 0x475569, 1);
                bgGfx.strokeRoundedRect(0, 0, btnSize, btnSize, 6);

                const iconTxt = this.add.text(btnSize / 2, btnSize / 2, act.icon, {
                    fontSize: '15px'
                }).setOrigin(0.5);

                btnContainer.add([bgGfx, iconTxt]);

                if (act.type === 'sanitiser') {
                    this.sanitiserContainer = btnContainer;
                    this.sanitiserBgGfx = bgGfx;
                    this.sanitiserFillGfx = this.add.graphics();
                    btnContainer.add(this.sanitiserFillGfx);
                    this.updateSanitiserBtnUI();
                }

                btnContainer.setSize(btnSize, btnSize);
                btnContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnSize, btnSize), Phaser.Geom.Rectangle.Contains);
                btnContainer.on('pointerup', () => act.action());

                this.mainContainer.add(btnContainer);
            });

            // Auto-Sort Pause/Resume Toggle (placed to the right, aligning near overflow block)
            if (this.state.unlockedAutoSort) {
                const autoSortLabel = this.state.autoSortPaused ? '▶️ Auto-Sort: OFF' : ('⏸️ Auto-Sort: ' + (this.state.autoSortDelay / 1000).toFixed(1) + 's');
                const autoSortX = Math.min(width - 65, this.queueStartX + (10 * this.queueGap) + 55);
                const btnAutoSort = this.add.text(autoSortX, toolbarY + (btnSize / 2), autoSortLabel, {
                    fontSize: '10px', style: 'bold',
                    backgroundColor: this.state.autoSortPaused ? '#374151' : '#1e3a8a',
                    color: '#ffffff', padding: { x: 7, y: 4 }
                }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

                btnAutoSort.on('pointerup', () => {
                    this.state.autoSortPaused = !this.state.autoSortPaused;
                    this.requestLayoutRebuild();
                });
                this.mainContainer.add(btnAutoSort);
            }

            // 4. BINS (Includes animated Green, Blue, Purple & Yellow wheelie bins!)
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

            const binSpriteScale = isSmallScreen ? (BIN_SPRITE_CONFIG.scale * 0.85) : BIN_SPRITE_CONFIG.scale;
            binData.forEach((b, idx) => {
                const bx = Math.round(startBinX + (idx * binSpacing));
                const isSheet = !!(b.sheetKey && this.textures.exists(b.sheetKey));
                let sprite;
                if (isSheet) {
                    sprite = this.add.sprite(bx, binBaselineY, b.sheetKey, 0)
                        .setOrigin(0.5, 1)
                        .setScale(binSpriteScale)
                        .setInteractive({ useHandCursor: true });
                } else {
                    sprite = this.add.sprite(bx, binBaselineY, b.sprite)
                        .setOrigin(0.5, 1)
                        .setDisplaySize(isSmallScreen ? 68 : 78, binH)
                        .setInteractive({ useHandCursor: true });
                }

                const labelY = binBaselineY - binH - 12;
                const label = this.add.text(bx, labelY, '[' + b.key + '] ' + b.name, { fontSize: '11px', color: '#fff', style: 'bold' }).setOrigin(0.5);
                const countY = binBaselineY - (binH * 0.42);
                const countText = this.add.text(bx, countY, '' + b.count, {
                    fontSize: '15px', color: '#ffffff', stroke: '#000000', strokeThickness: 4, style: 'bold'
                }).setOrigin(0.5).setDepth(2);

                const binHighlightGfx = this.add.graphics();
                binHighlightGfx.lineStyle(3, 0xffd700, 1);
                binHighlightGfx.strokeRoundedRect(bx - 38, binBaselineY - binH - 4, 76, binH + 8, 8);
                binHighlightGfx.setVisible(false);

                sprite.on('pointerdown', () => this.sortHeadTrash(b.id, 0));
                if (b.animKey) {
                    sprite.on('animationcomplete', () => {
                        sprite.setFrame(0);
                        sprite.setOrigin(0.5, 1);
                        sprite.setScale(binSpriteScale);
                    });
                }
                this.bins.push({ sprite, id: b.id, x: bx, y: binCenterY, baselineY: binBaselineY, countText, highlightGfx: binHighlightGfx, sheetKey: b.sheetKey, animKey: b.animKey });
                this.mainContainer.add([sprite, label, countText, binHighlightGfx]);
            });

            // Streak Score Text & Streak Bar Setup
            this.dumpsterStreakText = this.add.text(Math.round(width / 2), binBaselineY + 22, '🔥 STREAK: ' + this.state.streak + '  |  BEST: ' + this.state.streakHighScore, {
                fontSize: '11px', style: 'bold', color: '#ffca28', backgroundColor: '#111827', padding: { x: 10, y: 3 }
            }).setOrigin(0.5).setDepth(15);
            this.dumpsterBarGfx = this.add.graphics().setDepth(15);
            this.mainContainer.add([this.dumpsterStreakText, this.dumpsterBarGfx]);

            // 5. GATE (Direct Intake onto Conveyor Belt)
            const gateX = isMobile ? Math.max(36, this.queueStartX - 15) : Math.round(width * 0.16);
            this.gatePos = { x: gateX, y: binBaselineY - 10 };

            this.gateSprite = this.add.sprite(this.gatePos.x, this.gatePos.y, 'gate').setInteractive({ useHandCursor: true }).setDepth(1);
            this.gateText = this.add.text(this.gatePos.x, this.gatePos.y - 36, 'GATE [SPACE]', { fontSize: '11px', color: '#00ff00', style: 'bold' }).setOrigin(0.5);

            this.autoGateGfx = this.add.graphics();
            this.autoSortGfx = this.add.graphics().setDepth(25);
            this.longPressGfx = this.add.graphics().setDepth(10);
            this.tutorialIndicatorsGfx = this.add.graphics().setDepth(25);

            this.setupLongPress(this.gateSprite, 'gate');

            this.mainContainer.add([
                this.gateSprite, this.gateText, this.autoGateGfx, this.autoSortGfx,
                this.longPressGfx, this.tutorialIndicatorsGfx
            ]);

            if (!this.customerQueue || this.customerQueue.length === 0) {
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
                    this.tutorialIndicatorsGfx.strokeRect(this.btnUpgrades.x - 110, this.btnUpgrades.y - 2, 115, 28);
                }
            }
        }

        renderConveyorHUD(w, y) {
            let statusText = '⚙️ Conveyor Idle';
            if (this.currentCraftJob) {
                const nextNames = this.craftingConveyor.map(j => j.recipeName).join(' ➔ ');
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
            const walkY = splitY - 20;

            const pageCenter = Math.round(w / 2);
            const storeX = Math.round(pageCenter - 65);
            const factoryX = Math.round(pageCenter + 65);

            // Render temporary representative blocks for Store and Factory
            this.renderRepresentativeBlocks(storeX, factoryX, splitY - 24);

            if (!this.shopCustomers) this.shopCustomers = [];

            // Rebuild visual containers for active customers on new mainContainer
            this.shopCustomers.forEach((cust, idx) => {
                if (cust.container) {
                    cust.container.destroy();
                    cust.container = null;
                }
                const targetX = this.getShopQueueSlotX(idx);
                this.createBuyerContainer(cust, idx, walkY, targetX);
            });

            // Populate up to 3 customers if needed
            while (this.shopCustomers.length < 3) {
                this.spawnShopCustomer(true);
            }
        }

        renderRepresentativeBlocks(storeX, factoryX, blockY) {
            const bw = 54, bh = 44;

            // STORE BLOCK (Temporary representative building)
            const storeContainer = this.add.container(storeX, blockY).setDepth(6);
            const sGfx = this.add.graphics();
            sGfx.fillStyle(0x1e293b, 0.95);
            sGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
            sGfx.lineStyle(2, 0x475569, 1);
            sGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
            // Green & white awning
            sGfx.fillStyle(0x15803d, 1);
            sGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, 10, 3);
            sGfx.fillStyle(0xffffff, 0.35);
            sGfx.fillRect(-bw / 2 + 10, -bh / 2, 8, 10);
            sGfx.fillRect(-bw / 2 + 28, -bh / 2, 8, 10);

            const storeIcon = this.add.text(0, -5, '🏪', { fontSize: '18px' }).setOrigin(0.5);
            const storeLabel = this.add.text(0, 13, 'STORE', { fontSize: '8.5px', style: 'bold', color: '#86efac' }).setOrigin(0.5);
            storeContainer.add([sGfx, storeIcon, storeLabel]);
            storeContainer.setSize(bw, bh);
            storeContainer.setInteractive({ useHandCursor: true });
            storeContainer.on('pointerup', () => {
                this.refreshBuyerBubbles();
            });

            // FACTORY BLOCK (Click to enter Factory Crafting Workshop)
            const factoryContainer = this.add.container(factoryX, blockY).setDepth(6);
            const fGfx = this.add.graphics();
            fGfx.fillStyle(0x334155, 0.95);
            fGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
            fGfx.lineStyle(2, this.state.factoryUnlocked ? 0x38bdf8 : 0x64748b, 1);
            fGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
            // Chimney stack
            fGfx.fillStyle(0x475569, 1);
            fGfx.fillRect(bw / 2 - 14, -bh / 2 - 8, 8, 8);
            fGfx.lineStyle(1.5, 0x94a3b8, 0.8);
            fGfx.strokeRect(bw / 2 - 14, -bh / 2 - 8, 8, 8);

            const factoryIcon = this.add.text(0, -5, '🏭', { fontSize: '18px' }).setOrigin(0.5);
            const isFactUnlocked = !!this.state.factoryUnlocked;
            const factoryLabel = this.add.text(0, 13, isFactUnlocked ? 'FACTORY' : 'FACTORY 🔒', {
                fontSize: '8px', style: 'bold', color: isFactUnlocked ? '#93c5fd' : '#f59e0b'
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
            if (this.currentCraftJob || this.craftingConveyor.length === 0) return;

            this.currentCraftJob = this.craftingConveyor.shift();
            this.requestLayoutRebuild();

            this.time.delayedCall(1000, () => {
                this.state.crafted[this.currentCraftJob.recipeKey]++;
                this.addXP(10);
                this.currentCraftJob = null;
                this.requestLayoutRebuild();

                this.processCraftingConveyor();
            });
        }

        renderCenteredXPBar(w, y) {
            const barW = Math.min(w * 0.55, 240);
            const barH = 18;
            const bx = (w - barW) / 2;

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
            this.xpBarText = this.add.text(w / 2, y + (barH / 2), 'LEVEL ' + this.state.level + ' (' + this.state.xp + '/' + neededXP + ' XP)  ⭐ ' + sp + ' SP', {
                fontSize: '11px', style: 'bold', color: '#ffffff'
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
            this.xpBarText.setText('LEVEL ' + this.state.level + ' (' + this.state.xp + '/' + neededXP + ' XP)  ⭐ ' + sp + ' SP');
        }

        renderTopHUDBar(w, topBarY, isMobile) {
            const cardX = 20;
            const cardY = isMobile ? topBarY + 20 : 28;
            const cardW = isMobile ? (w - 24) : 265;
            const hasExtraTypes = (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric);
            const cardH = hasExtraTypes ? 74 : 60;

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

            this.hudTextObj = this.add.text(cardX + 10, cardY + 7, text, {
                fontSize: '11px', style: 'bold', color: '#ffffff', lineSpacing: 3
            });

            this.mainContainer.add([cardBg, this.hudTextObj]);
        }

        drawAutoGateProgress(progress) {
            if (!this.autoGateGfx) return;
            this.autoGateGfx.clear();
            if (!this.state.isGateAuto) return;

            const cx = this.gatePos.x - 48; const cy = this.gatePos.y + 26;
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

        setupLongPress(sprite, targetType) {
            sprite.on('pointerdown', (pointer) => {
                this.isHolding = true;
                const downTime = pointer.downTime;

                this.pressTimer = this.time.addEvent({
                    delay: 30,
                    repeat: 20,
                    callback: () => {
                        if (!this.isHolding) return;
                        const elapsed = this.time.now - downTime;

                        if (elapsed >= 300) {
                            const progress = (elapsed - 300) / 300;
                            this.drawLongPressFill(sprite.x, sprite.y, progress);
                        }

                        if (elapsed >= 600) {
                            this.clearLongPress();
                            this.openModal('upgrades', targetType);
                        }
                    }
                });
            });

            sprite.on('pointerup', (pointer) => {
                const totalHold = this.time.now - pointer.downTime;
                this.clearLongPress();

                if (totalHold < 500) {
                    if (targetType === 'gate') this.triggerGate();
                    else if (targetType === 'tip') this.queueTrashFromTip();
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

        createTopNavButtons(w) {
            const btnDecor = this.add.text(w - 20, 26, '🪴 DECOR', { fontSize: '11px', style: 'bold', color: '#a5d6a7', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openModal('decorations'));

            const hasAnyAfford = this.hasCategoryAffordable('gate') || this.hasCategoryAffordable('conveyor') || this.hasCategoryAffordable('skills');
            this.btnUpgrades = this.add.text(w - 20, 56, hasAnyAfford ? '🛠️ UPGRADES (!)' : '🛠️ UPGRADES', { fontSize: '11px', style: 'bold', color: '#4fc3f7', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                    this.openModal('upgrades', 'gate');
                });

            const btnArcade = this.add.text(w - 20, 86, '🕹️ ARCADE', { fontSize: '11px', style: 'bold', color: '#ffeb3b', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                    this.openArcadeModal();
                });

            this.mainContainer.add([btnDecor, this.btnUpgrades, btnArcade]);
        }

        createItemGraphic(typeId, itemName, forcedMultiplier = 1, fixedSpriteKey = null) {
            const typeData = TRASH_TYPES[typeId];
            const container = this.add.container(0, 0).setDepth(10);
            if (this.conveyorContainer) this.conveyorContainer.add(container);
            else if (this.mainContainer) this.mainContainer.add(container);
            const isBgUnlocked = this.state.binUpgrades[typeId].bgUnlocked;

            const spriteKey = fixedSpriteKey || typeData.sprites[Math.floor(Math.random() * typeData.sprites.length)];
            const multiplier = forcedMultiplier;
            const baseSz = this.itemDisplaySize || 46;

            if (multiplier === 4) {
                // QUADRUPLE: Pile of 4 identical PNG icons
                const off = Math.round(baseSz * 0.22);
                const iconSz = Math.round(baseSz * 0.52);
                const bgR = Math.round(baseSz * 0.26);
                const offsets = [ {x: -off, y: -off}, {x: off, y: -off}, {x: -off, y: off}, {x: off, y: off} ];
                offsets.forEach(pos => {
                    if (isBgUnlocked) {
                        const circleGfx = this.add.graphics();
                        circleGfx.fillStyle(typeData.color, 1);
                        circleGfx.fillCircle(pos.x, pos.y, bgR);
                        circleGfx.lineStyle(2, 0x000000, 1);
                        circleGfx.strokeCircle(pos.x, pos.y, bgR);
                        container.add(circleGfx);
                    }
                    const img = this.add.image(pos.x, pos.y, spriteKey).setDisplaySize(iconSz, iconSz);
                    container.add(img);
                });
            } else if (multiplier === 2) {
                // DOUBLE: 2 identical PNG icons (top-right & bottom-left)
                const off = Math.round(baseSz * 0.16);
                const iconSz = Math.round(baseSz * 0.72);
                const bgR = Math.round(baseSz * 0.36);
                const offsets = [ {x: off, y: -off, sz: iconSz}, {x: -off, y: off, sz: iconSz} ];
                offsets.forEach(pos => {
                    if (isBgUnlocked) {
                        const circleGfx = this.add.graphics();
                        circleGfx.fillStyle(typeData.color, 1);
                        circleGfx.fillCircle(pos.x, pos.y, bgR);
                        circleGfx.lineStyle(2.5, 0x000000, 1);
                        circleGfx.strokeCircle(pos.x, pos.y, bgR);
                        container.add(circleGfx);
                    }
                    const img = this.add.image(pos.x, pos.y, spriteKey).setDisplaySize(pos.sz, pos.sz);
                    container.add(img);
                });
            } else {
                // SINGLE: 1 icon centered
                const iconSz = Math.round(baseSz * 0.88);
                const bgR = Math.round(baseSz * 0.44);
                if (isBgUnlocked) {
                    const circleGfx = this.add.graphics();
                    circleGfx.fillStyle(typeData.color, 1);
                    circleGfx.fillCircle(0, 0, bgR);
                    circleGfx.lineStyle(2.5, 0x000000, 1);
                    circleGfx.strokeCircle(0, 0, bgR);
                    container.add(circleGfx);
                }
                const img = this.add.image(0, 0, spriteKey).setDisplaySize(iconSz, iconSz);
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

        renderHorizontalQueue() {
            const gap = this.queueGap || 50;
            const qStartX = this.queueStartX;
            const qY = this.queueY;
            const itemSz = this.itemDisplaySize || 50;

            const excess = this.state.excessTrashCount || 0;
            if (this.overflowBlockContainer) {
                if (excess > 0) {
                    const overflowX = qStartX + (10 * gap);
                    this.overflowBlockContainer.setPosition(overflowX, qY);
                    this.overflowNumText.setText('+' + excess);
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

            this.trashQueue.forEach((item, index) => {
                if (index < 10) {
                    const targetX = qStartX + (index * gap);
                    if (!item.container || !item.container.scene) {
                        const fixedKey = item.spriteKey || (item.container && item.container.spriteKey);
                        item.spriteKey = fixedKey;
                        item.container = this.createItemGraphic(item.type, null, item.multiplier || 1, fixedKey);
                        item.container.setPosition(targetX, qY);
                    }

                    let itemAlpha = 1;
                    if (index >= 6) itemAlpha = Math.max(0.2, 1 - ((index - 5) * 0.2));

                    if (this.tweens) {
                        this.tweens.killTweensOf(item.container);
                        this.tweens.add({
                            targets: item.container,
                            x: targetX,
                            y: qY,
                            alpha: itemAlpha,
                            duration: 100
                        });
                    } else {
                        item.container.x = targetX;
                        item.container.y = qY;
                        item.container.alpha = itemAlpha;
                    }

                    if (index === 0) {
                        const hs = itemSz + 6;
                        this.queueHighlight.clear();
                        this.queueHighlight.lineStyle(3, 0xffd700, 1);
                        this.queueHighlight.strokeRect(-hs / 2, -hs / 2, hs, hs);
                        this.queueHighlight.setVisible(true);
                        this.queueHighlight.setPosition(targetX, qY);

                        item.container.setSize(itemSz, itemSz);
                        item.container.setInteractive({ draggable: true });
                        this.input.setDraggable(item.container);

                        item.container.off('drag');
                        item.container.off('dragstart');
                        item.container.off('dragend');

                        item.container.on('dragstart', () => {
                            this.draggedItem = item;
                            const correctBin = this.bins.find(b => b.id === item.type);
                            if (correctBin) correctBin.highlightGfx.setVisible(true);
                        });

                        item.container.on('drag', (pointer, dragX, dragY) => {
                            item.container.x = dragX;
                            item.container.y = dragY;
                        });

                        item.container.on('dragend', () => {
                            this.bins.forEach(b => b.highlightGfx.setVisible(false));
                            this.draggedItem = null;

                            let droppedBin = null;
                            this.bins.forEach(b => {
                                const dist = Phaser.Math.Distance.Between(item.container.x, item.container.y, b.x, b.y);
                                if (dist < 75) {
                                    droppedBin = b;
                                }
                            });

                            if (droppedBin) {
                                this.sortHeadTrash(droppedBin.id, 0);
                            } else {
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

                        if (this.tweens && this.tweens.add) {
                            this.tweens.add({ targets: popOne, y: popOne.y - 30, alpha: 0, duration: 850, onComplete: () => popOne.destroy() });
                        } else {
                            popOne.destroy();
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
            const needed = this.state.level * 20;
            if (this.state.xp >= needed) {
                this.state.xp -= needed;
                this.state.level++;
                this.state.skillPoints = (this.state.skillPoints || 0) + 1;

                const lvlText = this.add.text(this.scale.width / 2, this.scale.height / 2, \`🎉 LEVEL UP! (Lv. \${this.state.level}) +1 Skill Point! 🎉\`, {
                    fontSize: '22px', style: 'bold', color: '#ffd700', backgroundColor: '#000000', padding: 12
                }).setOrigin(0.5).setDepth(30);

                if (this.tweens && this.tweens.add) {
                    this.tweens.add({ targets: lvlText, scale: 1.25, alpha: 0, duration: 1600, onComplete: () => lvlText.destroy() });
                } else {
                    lvlText.destroy();
                }
            }
            this.updateUI();
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
            const boxW = Math.min(w * 0.94, 520);
            const maxModalBottom = this.queueY ? (this.queueY - 65) : (h * 0.44);
            const modalH = Math.round(Math.min(maxModalBottom, Math.min(h * 0.45, 365)));

            this.modalContainer = this.add.container(0, 0).setDepth(100);

            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.75);
            overlay.fillRect(0, 0, w, modalH);

            const box = this.add.graphics();
            box.fillStyle(0x1a1a1a, 1);
            box.fillRect((w - boxW) / 2, 10, boxW, modalH - 20);
            box.lineStyle(2, 0x4fc3f7, 1);
            box.strokeRect((w - boxW) / 2, 10, boxW, modalH - 20);

            const closeX = ((w - boxW) / 2) + boxW - 45;
            const closeY = modalH - 25;
            const btnClose = this.add.text(closeX, closeY, '[ X ] CLOSE', {
                fontSize: '12px', style: 'bold', color: '#ff5555', backgroundColor: '#222222', padding: { x: 8, y: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btnClose.on('pointerup', () => this.closeModal());

            this.modalContainer.add([overlay, box, btnClose]);

            if (type === 'upgrades') this.renderTopHalfUpgradesModal(w, modalH, boxW);
            if (type === 'decorations') this.renderDecorationsModal(w, modalH, boxW);
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
                            if (this.state.customerSpawnChance >= 0.70) {
                                this.state.spawnDelay = Math.max(1200, this.state.spawnDelay - 200);
                            }
                            if (this.spawnerEvent) {
                                this.spawnerEvent.delay = this.state.spawnDelay;
                            }
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
                    }
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
                const isLevelMet = (this.state.level >= u.reqLvl);
                const isPrevUnlocked = (i === 0) || (list[i - 1].lvl > 0);
                const isNotMax = (u.lvl < u.max);
                if (isLevelMet && isPrevUnlocked && isNotMax && u.canAfford) {
                    return true;
                }
            }
            return false;
        }

        renderTopHalfUpgradesModal(w, modalH, boxW) {
            const boxLeft = (w - boxW) / 2;
            const sidebarW = 125;

            const title = this.add.text(boxLeft + 15, 18, '🛠️ UPGRADES & STATIONS', { fontSize: '14px', style: 'bold', color: '#4fc3f7' });
            this.modalWalletTxt = this.add.text(boxLeft + boxW - 140, 18, '$' + this.state.money + ' | ⭐' + (this.state.skillPoints || 0) + ' SP', { fontSize: '11px', style: 'bold', color: '#00ff00' });
            this.modalContainer.add([title, this.modalWalletTxt]);

            let currY = 46;

            const isGateSel = (this.activeUpgradeCategory === 'gate');
            const hasGateAff = this.hasCategoryAffordable('gate');
            const btnGate = this.add.text(boxLeft + 12, currY, hasGateAff ? '🚪 Gate (!)' : '🚪 Gate', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isGateSel ? '#0288d1' : '#2b2b2b',
                color: isGateSel ? '#ffffff' : (hasGateAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnGate.baseLabel = '🚪 Gate';
            btnGate.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'gate'; this.openModal('upgrades', 'gate'); });
            this.modalContainer.add(btnGate);
            currY += 28;

            const isConveyorSel = (this.activeUpgradeCategory === 'conveyor');
            const hasConveyorAff = this.hasCategoryAffordable('conveyor');
            const btnConveyor = this.add.text(boxLeft + 12, currY, hasConveyorAff ? '🔄 Conveyor (!)' : '🔄 Conveyor', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isConveyorSel ? '#0288d1' : '#2b2b2b',
                color: isConveyorSel ? '#ffffff' : (hasConveyorAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnConveyor.baseLabel = '🔄 Conveyor';
            btnConveyor.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'conveyor'; this.openModal('upgrades', 'conveyor'); });
            this.modalContainer.add(btnConveyor);
            currY += 28;

            const isBinsSel = (this.activeUpgradeCategory === 'bins');
            const hasBinsAff = this.hasCategoryAffordable('bins');
            const btnBins = this.add.text(boxLeft + 12, currY, hasBinsAff ? '🗑️ Bins (!)' : '🗑️ Bins', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isBinsSel ? '#0288d1' : '#2b2b2b',
                color: isBinsSel ? '#ffffff' : (hasBinsAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnBins.baseLabel = '🗑️ Bins';
            btnBins.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'bins'; this.openModal('upgrades', 'bins'); });
            this.modalContainer.add(btnBins);
            currY += 28;

            const isSkillsSel = (this.activeUpgradeCategory === 'skills');
            const hasSkillsAff = this.hasCategoryAffordable('skills');
            const btnSkills = this.add.text(boxLeft + 12, currY, hasSkillsAff ? '⭐ Skills (!)' : '⭐ Skills', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isSkillsSel ? '#0288d1' : '#2b2b2b',
                color: isSkillsSel ? '#ffffff' : (hasSkillsAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
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
            divGfx.lineBetween(boxLeft + sidebarW, 40, boxLeft + sidebarW, modalH - 35);
            this.modalContainer.add(divGfx);

            const startX = boxLeft + sidebarW + 15;
            const upgradeList = this.getUpgradeListForCategory(this.activeUpgradeCategory);

            // Viewport bounds for the upgrades list
            const viewX = boxLeft + sidebarW + 2;
            const viewY = 40;
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

            const itemHeight = 48;
            let totalDragDistance = 0;
            this.activeUpgradeCards = [];

            upgradeList.forEach((uItem, idx) => {
                const uy = viewY + 6 + (idx * itemHeight);
                const isLevelMet = (this.state.level >= uItem.reqLvl);
                let isPrevUnlocked = true;
                if (this.activeUpgradeCategory === 'skills') {
                    isPrevUnlocked = (idx === 0) || (upgradeList[idx - 1].lvl > 0);
                } else if (this.activeUpgradeCategory === 'bins') {
                    const tierIdx = idx % 4;
                    if (tierIdx === 2) isPrevUnlocked = (upgradeList[idx - 1].lvl > 0);
                    if (tierIdx === 3) isPrevUnlocked = (upgradeList[idx - 1].lvl > 0);
                }

                if (!isLevelMet) {
                    const nameTxt = this.add.text(startX, uy + 6, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const lockBadge = this.add.text(boxLeft + boxW - 35, uy + 6, `[ Requires Level ${uItem.reqLvl} ]`, {
                        fontSize: '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, 0);

                    this.upgradeListContainer.add([nameTxt, lockBadge]);
                } else if (!isPrevUnlocked) {
                    const nameTxt = this.add.text(startX, uy + 6, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const prevLockBadge = this.add.text(boxLeft + boxW - 35, uy + 6, '[ Need previous upgrade ]', {
                        fontSize: '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, 0);

                    this.upgradeListContainer.add([nameTxt, prevLockBadge]);
                } else {
                    const infoTxt = this.add.text(startX, uy, \`\${uItem.name}\n\${uItem.desc}\`, { fontSize: '10.5px', color: '#fff', lineSpacing: 2 });

                    if (uItem.lvl >= uItem.max) {
                        const maxBadge = this.add.text(boxLeft + boxW - 35, uy + 6, \`[ Lvl \${uItem.lvl}/\${uItem.max} MAX ]\`, { fontSize: '11px', style: 'bold', color: '#00ff00' }).setOrigin(1, 0);
                        this.upgradeListContainer.add([infoTxt, maxBadge]);
                    } else {
                        const lvlBadgeStr = uItem.max > 1 ? \`Lvl \${uItem.lvl}/\${uItem.max} \` : '';
                        const btnBuy = this.add.text(boxLeft + boxW - 35, uy + 4, \`\${lvlBadgeStr}BUY (\${uItem.cost})\`, {
                            fontSize: '10px', style: 'bold',
                            backgroundColor: uItem.canAfford ? '#00e676' : '#424242',
                            color: uItem.canAfford ? '#000' : '#aaa', padding: 4
                        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

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
            const boxLeft = (w - boxW) / 2;
            const title = this.add.text(w / 2, 22, '🪴 DECORATIONS', { fontSize: '16px', style: 'bold', color: '#a5d6a7' }).setOrigin(0.5);
            const r = this.state.resources;
            this.decorWalletTxt = this.add.text(w / 2, modalH * 0.86, '🟢 ' + r.organic + '  🔵 ' + r.paper + '  🟡 ' + r.plastic + '  🟣 ' + r.glass, {
                fontSize: '12px', style: 'bold', color: '#ffd700'
            }).setOrigin(0.5);

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

            decors.forEach((d, idx) => {
                const dy = 50 + (idx * 44);
                const infoTxt = this.add.text(boxLeft + 25, dy, d.name + '\\n' + d.desc, { fontSize: '11px', color: '#fff', lineSpacing: 2 });

                if (d.bought) {
                    const boughtBadge = this.add.text(boxLeft + boxW - 35, dy + 6, '[ OWNED ]', { fontSize: '11px', style: 'bold', color: '#00ff00' }).setOrigin(1, 0);
                    this.modalContainer.add([infoTxt, boughtBadge]);
                } else if (d.locked) {
                    const lockBadge = this.add.text(boxLeft + boxW - 35, dy + 6, '[ LOCKED ]', {
                        fontSize: '10.5px', style: 'bold',
                        backgroundColor: '#374151', color: '#9ca3af', padding: 4
                    }).setOrigin(1, 0);
                    this.modalContainer.add([infoTxt, lockBadge]);
                } else {
                    const btn = this.add.text(boxLeft + boxW - 35, dy + 6, 'BUY (' + d.costText + ')', {
                        fontSize: '10.5px', style: 'bold',
                        backgroundColor: d.canAfford ? '#00e676' : '#424242',
                        color: d.canAfford ? '#000' : '#aaa', padding: 4
                    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

                    if (d.canAfford) {
                        btn.on('pointerup', () => {
                            d.action();
                            this.updateUI();
                            this.requestLayoutRebuild();
                            this.openModal('decorations');
                        });
                    }
                    this.modalContainer.add([infoTxt, btn]);
                }
            });
        }

        openArcadeModal() {
            if (this.modalContainer) this.modalContainer.destroy();
            const w = this.scale.width;
            const h = this.scale.height;

            this.modalContainer = this.add.container(0, 0).setDepth(100);
            const overlay = this.add.graphics();
            overlay.fillStyle(0x000000, 0.75);
            overlay.fillRect(0, 0, w, h);
            overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

            const modalW = Math.min(w * 0.92, 460);
            const modalH = Math.min(h * 0.85, 420);
            const modalX = (w - modalW) / 2;
            const modalY = (h - modalH) / 2;

            const box = this.add.graphics();
            box.fillStyle(0x161c28, 0.98);
            box.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
            box.lineStyle(2, 0xffca28, 1);
            box.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);

            const title = this.add.text(w / 2, modalY + 26, '🕹️ ARCADE CHALLENGES', {
                fontSize: '18px', style: 'bold', color: '#ffca28'
            }).setOrigin(0.5);

            const sub = this.add.text(w / 2, modalY + 50, 'Pure sorting skill - Does NOT affect main game save!', {
                fontSize: '11px', color: '#aaaaaa'
            }).setOrigin(0.5);

            // Dumpster Fire Frenzy Card
            const card1Y = modalY + 74;
            const cardW = modalW - 40;
            const cardH = 110;
            const c1Box = this.add.graphics();
            c1Box.fillStyle(0x221814, 0.95);
            c1Box.fillRoundedRect(modalX + 20, card1Y, cardW, cardH, 8);
            c1Box.lineStyle(1.5, 0xff5722, 1);
            c1Box.strokeRoundedRect(modalX + 20, card1Y, cardW, cardH, 8);

            const c1Title = this.add.text(modalX + 32, card1Y + 12, '🔥 Dumpster Fire Frenzy', {
                fontSize: '14px', style: 'bold', color: '#ff7043'
            });
            const c1Desc = this.add.text(modalX + 32, card1Y + 34, 'Start with maxed streak & fire active (2X speed!).\\nDecaying streak bar drains fast - sort or burn out!', {
                fontSize: '11px', color: '#ffffff', lineSpacing: 3
            });
            const bestStreak = localStorage.getItem('arrc_arcade_best_streak') || 0;
            const c1Record = this.add.text(modalX + 32, card1Y + 78, '🏆 Personal Best: ' + bestStreak + ' streak', {
                fontSize: '11px', style: 'bold', color: '#ffd54f'
            });

            const btnPlay1 = this.add.text(modalX + cardW - 10, card1Y + 76, '▶ PLAY', {
                fontSize: '12px', style: 'bold', backgroundColor: '#ff5722', color: '#ffffff', padding: { x: 14, y: 6 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnPlay1.on('pointerup', () => {
                this.modalContainer.destroy();
                this.startArcadeChallenge('dumpster');
            });

            // 500-Piece Clean Up Card
            const card2Y = modalY + 196;
            const c2Box = this.add.graphics();
            c2Box.fillStyle(0x142022, 0.95);
            c2Box.fillRoundedRect(modalX + 20, card2Y, cardW, cardH, 8);
            c2Box.lineStyle(1.5, 0x00bcd4, 1);
            c2Box.strokeRoundedRect(modalX + 20, card2Y, cardW, cardH, 8);

            const c2Title = this.add.text(modalX + 32, card2Y + 12, '🧹 500-Piece Speed Clean', {
                fontSize: '14px', style: 'bold', color: '#4dd0e1'
            });
            const c2Desc = this.add.text(modalX + 32, card2Y + 34, 'Gigantic stockpile of 500 trash items!\\nSort them all as fast as humanly possible.', {
                fontSize: '11px', color: '#ffffff', lineSpacing: 3
            });
            const bestTime = localStorage.getItem('arrc_arcade_best_time');
            const bestTimeStr = bestTime ? (Math.floor(bestTime / 60000) + 'm ' + Math.floor((bestTime % 60000)/1000) + 's') : '--:--';
            const c2Record = this.add.text(modalX + 32, card2Y + 78, '⏱️ Record Time: ' + bestTimeStr, {
                fontSize: '11px', style: 'bold', color: '#80deea'
            });

            const btnPlay2 = this.add.text(modalX + cardW - 10, card2Y + 76, '▶ PLAY', {
                fontSize: '12px', style: 'bold', backgroundColor: '#0097a7', color: '#ffffff', padding: { x: 14, y: 6 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnPlay2.on('pointerup', () => {
                this.modalContainer.destroy();
                this.startArcadeChallenge('cleanup');
            });

            const btnClose = this.add.text(w / 2, modalY + modalH - 24, '✖ CLOSE', {
                fontSize: '12px', style: 'bold', backgroundColor: '#333333', color: '#ffffff', padding: { x: 20, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btnClose.on('pointerup', () => {
                this.modalContainer.destroy();
            });

            this.modalContainer.add([overlay, box, title, sub, c1Box, c1Title, c1Desc, c1Record, btnPlay1, c2Box, c2Title, c2Desc, c2Record, btnPlay2, btnClose]);
        }

        startArcadeChallenge(mode) {
            if (this.mainContainer) this.mainContainer.setVisible(false);
            if (this.arcadeContainer) this.arcadeContainer.destroy();

            const w = this.scale.width;
            const h = this.scale.height;

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
                sortedCount: 0,
                cleanupRemaining: 500,
                cleanupElapsed: 0,
                queue: initialQueue,
                gameOver: false
            };

            this.arcadeContainer = this.add.container(0, 0).setDepth(80);

            // Full-screen interactive background to absorb all clicks and prevent click-through to main game
            const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x0a0e17, 1).setInteractive();
            bg.on('pointerdown', () => {});
            this.arcadeContainer.add(bg);

            // Header info
            const headerY = 25;
            const challengeTitle = (mode === 'dumpster') ? '🔥 DUMPSTER FIRE FRENZY' : '🧹 500-PIECE CLEAN UP';
            const titleTxt = this.add.text(w / 2, headerY, challengeTitle, {
                fontSize: '18px', style: 'bold', color: (mode === 'dumpster' ? '#ff7043' : '#4dd0e1')
            }).setOrigin(0.5);

            this.arcadeStatsTxt = this.add.text(w / 2, headerY + 28, '', {
                fontSize: '13px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            this.arcadeBarGfx = this.add.graphics();

            const btnExit = this.add.text(w - 18, headerY, '✖ EXIT', {
                fontSize: '11px', style: 'bold', backgroundColor: '#374151', color: '#ffffff', padding: { x: 10, y: 5 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            btnExit.on('pointerup', () => this.exitArcade());

            this.arcadeContainer.add([titleTxt, this.arcadeStatsTxt, this.arcadeBarGfx, btnExit]);

            // Queue display area
            this.arcadeQueueItems = [];
            this.arcadeQueueContainer = this.add.container(0, 0);
            this.arcadeContainer.add(this.arcadeQueueContainer);

            // Bins Row - Authentic styled bins matching main game with arcade labels
            const binY = h * 0.72;
            const binSpacing = Math.min(w / 4.6, 75);
            const startBinX = (w - (3 * binSpacing)) / 2;

            const bins = [
                { id: 'organic', key: '1', name: 'GREEN', sprite: 'bin_green', color: 0x4caf50 },
                { id: 'paper', key: '2', name: 'PAPER', sprite: 'bin_blue', color: 0x2196f3 },
                { id: 'glass', key: '3', name: 'GLASS', sprite: 'bin_purple', color: 0x9c27b0 },
                { id: 'plastic', key: '4', name: 'PLASTIC', sprite: 'bin_yellow', color: 0xffeb3b }
            ];

            bins.forEach((b, idx) => {
                const bx = startBinX + (idx * binSpacing);
                if (this.textures.exists(b.sprite)) {
                    const binSprite = this.add.sprite(bx, binY, b.sprite).setDisplaySize(50, 68);
                    this.arcadeContainer.add(binSprite);
                } else {
                    const bBox = this.add.graphics();
                    bBox.fillStyle(b.color, 0.85);
                    bBox.fillRoundedRect(bx - 26, binY - 26, 52, 52, 8);
                    bBox.lineStyle(2, 0xffffff, 0.9);
                    bBox.strokeRoundedRect(bx - 26, binY - 26, 52, 52, 8);
                    this.arcadeContainer.add(bBox);
                }

                const bLabel = this.add.text(bx, binY - 44, '[' + b.key + '] ' + b.name, {
                    fontSize: '10.5px', style: 'bold', color: '#ffffff', backgroundColor: '#111827', padding: { x: 4, y: 2 }
                }).setOrigin(0.5);

                const hitZone = this.add.rectangle(bx, binY, 60, 74, 0x000000, 0.001).setInteractive({ useHandCursor: true });
                hitZone.on('pointerdown', () => this.sortArcadeTrash(b.id));

                this.arcadeContainer.add([bLabel, hitZone]);
            });

            this.renderArcadeQueue();
        }

        renderArcadeQueue() {
            if (!this.arcadeState || !this.arcadeState.active) return;
            this.arcadeQueueContainer.removeAll(true);

            const w = this.scale.width;
            const h = this.scale.height;
            const queueCenterY = h * 0.42;
            const gap = 52;
            const startX = w / 2;

            this.arcadeState.queue.slice(0, 7).forEach((item, idx) => {
                const qx = startX + (idx * gap);
                const isHero = (idx === 0);

                const itemCont = this.add.container(qx, queueCenterY);
                const bgCircle = this.add.graphics();
                bgCircle.fillStyle(TRASH_TYPES[item.type].color, 1);
                bgCircle.fillCircle(0, 0, 24);
                bgCircle.lineStyle(2, 0x000000, 1);
                bgCircle.strokeCircle(0, 0, 24);
                itemCont.add(bgCircle);

                if (this.textures.exists(item.spriteKey)) {
                    const img = this.add.image(0, 0, item.spriteKey).setDisplaySize(42, 42);
                    itemCont.add(img);
                }

                if (isHero) {
                    itemCont.setScale(1.2);
                    const heroRing = this.add.graphics();
                    heroRing.lineStyle(3, 0xffd700, 1);
                    heroRing.strokeCircle(0, 0, 29);
                    itemCont.add(heroRing);
                } else {
                    itemCont.setScale(0.85);
                    itemCont.setAlpha(0.65 - (idx * 0.07));
                }

                this.arcadeQueueContainer.add(itemCont);
            });
        }

        sortArcadeTrash(targetType) {
            if (!this.arcadeState || !this.arcadeState.active || this.arcadeState.gameOver) return;
            if (this.arcadeState.queue.length === 0) return;

            const item = this.arcadeState.queue[0];
            const isCorrect = (item.type === targetType);

            if (isCorrect) {
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
                    this.arcadeState.streakTimer = Math.min(3500, this.arcadeState.streakTimer + 1000);
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

        updateArcade(delta) {
            if (!this.arcadeState || !this.arcadeState.active || this.arcadeState.gameOver) return;

            const w = this.scale.width;
            const h = this.scale.height;

            if (this.arcadeState.mode === 'dumpster') {
                this.arcadeState.streakTimer -= delta;
                if (this.arcadeState.streakTimer <= 0) {
                    this.endArcade(false);
                    return;
                }

                if (this.arcadeStatsTxt) {
                    this.arcadeStatsTxt.setText('🔥 STREAK: ' + this.arcadeState.streak + '  |  SORTED: ' + this.arcadeState.sortedCount);
                }

                if (this.arcadeBarGfx) {
                    this.arcadeBarGfx.clear();
                    const barW = Math.min(w * 0.7, 320);
                    const barH = 12;
                    const barX = (w - barW) / 2;
                    const barY = 82;
                    const ratio = Math.max(0, this.arcadeState.streakTimer / this.arcadeState.streakMax);

                    this.arcadeBarGfx.fillStyle(0x222222, 0.9);
                    this.arcadeBarGfx.fillRect(barX, barY, barW, barH);
                    this.arcadeBarGfx.fillStyle(ratio < 0.35 ? 0xf44336 : 0xff7043, 1);
                    this.arcadeBarGfx.fillRect(barX, barY, barW * ratio, barH);
                    this.arcadeBarGfx.lineStyle(1.5, 0xffca28, 1);
                    this.arcadeBarGfx.strokeRect(barX, barY, barW, barH);
                }
            } else {
                this.arcadeState.cleanupElapsed += delta;
                const totalSec = Math.floor(this.arcadeState.cleanupElapsed / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                const timeStr = m + ':' + (s < 10 ? '0' : '') + s;

                if (this.arcadeStatsTxt) {
                    this.arcadeStatsTxt.setText('REMAINING: ' + this.arcadeState.cleanupRemaining + ' / 500  |  TIME: ' + timeStr);
                }

                if (this.arcadeBarGfx) {
                    this.arcadeBarGfx.clear();
                    const barW = Math.min(w * 0.7, 320);
                    const barH = 12;
                    const barX = (w - barW) / 2;
                    const barY = 82;
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
                        btn.setText(hasAff ? (iconMap[cat] + ' (!)') : iconMap[cat]);
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

    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        resolution: window.devicePixelRatio || 1,
        render: {
            antialias: true,
            roundPixels: true
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%'
        },
        scene: [MainScene]
    };

    const game = new Phaser.Game(config);
    </script>
</body>
</html>`;

fs.writeFileSync('index.html', htmlContent);
console.log('Successfully updated build_html.js & generated index.html!');
