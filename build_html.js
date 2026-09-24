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

    class MainScene extends Phaser.Scene {
        constructor() { super({ key: 'MainScene' }); }

        init() {
            this.state = {
                money: 20,
                xp: 0,
                level: 1,
                sessionSeconds: 0,
                totalQuestsCompleted: 0,
                questTokens: 0,
                questTier: 0,

                // Facility Stats
                g1Fee: 1,
                bagValue: 1,
                tipStockpile: 5,
                doubleTrashChance: 0.00,
                doubleTokenChance: 0.00,
                maxTrashQueue: 1,

                // Streak & Dumpster Fire System
                streak: 0,
                streakHighScore: 0,
                streakTimer: 0,
                dumpsterFireActive: false,

                // Customer Arrival Settings
                customerSpawnChance: 0.30,
                spawnDelay: 1000,

                // Automation Timers
                isGateAuto: false,
                autoGateSpeed: 5000,
                autoGateTimer: 0,
                unlockedAutoQueue: false,
                autoQueueSpeed: 2500,
                autoQueueTimer: 0,
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
                    footTraffic: { lvl: 0, max: 5, cost: 5, reqLvl: 2 },
                    gateAuto: { lvl: 0, max: 8, cost: 1, reqLvl: 1 },
                    doubleTrash: { lvl: 0, max: 5, cost: 4, reqLvl: 2 },
                    busRush: { lvl: 0, max: 5, cost: 15, reqLvl: 4 },

                    queueCap: { lvl: 0, max: 9, cost: 2, reqLvl: 1 },
                    doubleToken: { lvl: 0, max: 5, cost: 8, reqLvl: 2 },
                    autoQueue: { lvl: 0, max: 8, cost: 5, reqLvl: 2 },
                    sanitiser: { lvl: 0, max: 1, cost: 5, reqLvl: 3 },
                    autoSort: { lvl: 0, max: 5, cost: 15, reqLvl: 4 },

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

                // Bin Upgrades & Workshop Tier Unlocks
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
                    active: true,
                    step: 1, // 1: Tip, 2: Sort, 3: Gate, 4: Upgrades, 5: Quests, 0: Done
                    tipTapped: 0,
                    sortProgress: 0,
                    gateProgress: 0,
                    visitedCategoriesSet: new Set(),
                    step4BComplete: false,
                    questCompletedCount: 0,
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
                    filament: 0, plastic_brick: 0, pipe: 0
                },

                // Arcade Challenges Highscores
                arcadeBestStreak: 0,
                arcadeBestCleanupTime: null
            };

            this.trashQueue = [];
            this.customerQueue = [];
            this.contracts = [];
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

            this.generateQuests();
            this.buildLayout();

            for (let i = 0; i < 3; i++) this.spawnCustomer();

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
                if (['1','2','3','4','5','6'].includes(e.key)) {
                    const typeMap = { '1': 'organic', '2': 'paper', '3': 'glass', '4': 'plastic', '5': 'metal', '6': 'fabric' };
                    const chosen = typeMap[e.key];
                    if (chosen && this.state.activeTypes[chosen]) {
                        if (this.state.tutorial.active && this.state.tutorial.step === 2) {
                            this.state.tutorial.interactionMethod = 'free';
                        }
                        this.sortHeadTrash(chosen, 0);
                    }
                } else if (e.code === 'Space') {
                    this.queueTrashFromTip();
                } else if (e.code === 'KeyC') {
                    this.triggerGate();
                } else if (e.code === 'KeyV') {
                    this.triggerSanitiseAction();
                } else if (e.code === 'KeyB') {
                    this.cashInActiveBus();
                }
            });

            // Customer Spawner Loop
            this.spawnerEvent = this.time.addEvent({
                delay: 1000,
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

            // Auto-Queue Loop
            this.time.addEvent({
                delay: 50,
                callback: () => {
                    if (this.state.unlockedAutoQueue) {
                        this.state.autoQueueTimer += 50;
                        const qProgress = Math.min(1, this.state.autoQueueTimer / this.state.autoQueueSpeed);
                        this.drawAutoQueueProgress(qProgress);
                        if (qProgress >= 1 && this.state.tipStockpile > 0 && this.trashQueue.length < this.state.maxTrashQueue) {
                            this.queueTrashFromTip();
                            this.state.autoQueueTimer = 0;
                        }
                    }
                },
                loop: true
            });

            // Auto-Sort Loop: Automatically sorts from right-to-left (tail of queue toward head)
            this.time.addEvent({
                delay: 50,
                callback: () => {
                    const canAutoSort = this.state.unlockedAutoSort && !this.state.autoSortPaused && this.trashQueue.length > 0;
                    if (canAutoSort) {
                        this.state.autoSortTimer += 50;
                        const sortProgress = Math.min(1, this.state.autoSortTimer / this.state.autoSortDelay);
                        this.drawAutoSortProgress(sortProgress);
                        if (sortProgress >= 1) {
                            const lastIdx = this.trashQueue.length - 1;
                            // Ensure we don't snatch an item currently being dragged
                            if (!this.draggedItem || this.draggedItem !== this.trashQueue[lastIdx]) {
                                this.sortHeadTrash(this.trashQueue[lastIdx].type, lastIdx);
                                this.state.autoSortTimer = 0;
                            }
                        }
                    } else {
                        this.drawAutoSortProgress(0);
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
                const cloud = this.add.graphics().setDepth(2);
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
            if (this.arcadeState && this.arcadeState.active) {
                this.updateArcade(delta);
                return;
            }

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

            if (this.arcadeState && this.arcadeState.active) {
                this.updateArcade(delta);
            }
        }

        renderDumpsterFireBar() {
            // Always update streak text (so high score is permanently visible!)
            if (this.dumpsterStreakText) {
                this.dumpsterStreakText.setText('🔥 STREAK: ' + this.state.streak + '  |  BEST: ' + this.state.streakHighScore);
                this.dumpsterStreakText.setVisible(true);
            }

            if (!this.dumpsterBarGfx) return;
            this.dumpsterBarGfx.clear();

            // ONLY show depleting bar when streak is 5 or more!
            const shouldShowBar = (this.state.streak >= 5 && this.state.streakTimer > 0);
            if (!shouldShowBar) {
                if (this.dumpsterFireBanner) this.dumpsterFireBanner.setVisible(false);
                return;
            }

            if (!this.bins || this.bins.length === 0) return;
            const startBinX = this.bins[0].x - 26;
            const lastBinIdx = Math.min(this.bins.length - 1, 3);
            const endBinX = this.bins[lastBinIdx].x + 26;
            const barW = endBinX - startBinX;
            const barY = this.bins[0].y + 46;
            const barH = 8;

            const ratio = Math.min(1, Math.max(0, this.state.streakTimer / 2000));
            const currentWidth = barW * ratio;

            let colorHex = 0xffd700;
            if (this.state.dumpsterFireActive) colorHex = 0xff3d00;
            else if (ratio < 0.4) colorHex = 0xf44336;
            else if (ratio < 0.7) colorHex = 0xff9800;

            this.dumpsterBarGfx.fillStyle(0x222222, 0.85);
            this.dumpsterBarGfx.fillRect(startBinX, barY, barW, barH);
            this.dumpsterBarGfx.lineStyle(1, 0x555555, 1);
            this.dumpsterBarGfx.strokeRect(startBinX, barY, barW, barH);

            this.dumpsterBarGfx.fillStyle(colorHex, 1);
            this.dumpsterBarGfx.fillRect(startBinX, barY, currentWidth, barH);

            if (this.dumpsterFireBanner) {
                this.dumpsterFireBanner.setVisible(this.state.dumpsterFireActive);
            }
        }

        spawnCustomer() {
            if (this.customerQueue.length >= 8) return;

            const personSprite = this.add.sprite(0, 0, 'person');
            const bagSprite = this.add.sprite(0, 10, 'bag');

            const customerContainer = this.add.container(-50, this.gatePos ? this.gatePos.y : 600, [personSprite, bagSprite]).setDepth(5);
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
            if (this.customerQueue.length === 0) return;

            const cust = this.customerQueue.shift();
            
            this.state.money += this.state.g1Fee;
            let trashGained = 1;
            if (Math.random() < this.state.doubleTrashChance) trashGained = 2;

            this.state.tipStockpile += trashGained;

            if (this.state.tutorial.active && this.state.tutorial.step === 3) {
                this.state.tutorial.gateProgress++;
                this.generateQuests();
            }

            const popTxt = this.add.text(this.gatePos.x, this.gatePos.y - 30, \`+\$\${this.state.g1Fee} | +\${trashGained} Rubbish\`, {
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
            this.requestLayoutRebuild();
        }

        updateSanitiserBtnUI() {
            if (!this.sanitiserFillGfx || !this.sanitiserFillGfx.scene) return;
            const maxCd = this.state.sanitiserMaxCooldown || 2500;
            const cd = this.state.sanitiserCooldown || 0;
            const pct = Math.min(1, Math.max(0, 1 - (cd / maxCd)));
            const btnW = 104;
            const btnH = 26;

            this.sanitiserFillGfx.clear();
            if (pct > 0) {
                // Vibrant green fill grows smoothly until full
                this.sanitiserFillGfx.fillStyle(pct >= 1 ? 0x2e7d32 : 0x388e3c, 1);
                this.sanitiserFillGfx.fillRoundedRect(0, 0, Math.max(4, Math.round(btnW * pct)), btnH, 5);
            }

            if (this.btnSanitiserText) {
                const headItem = this.trashQueue && this.trashQueue[0];
                const currentMult = headItem ? (headItem.multiplier || 1) : 1;
                const targetMult = (currentMult === 1) ? 2 : 4;
                const label = (currentMult >= 4) ? '🧪 MAX (4x)' : ('🧪 Sanitise x' + targetMult);
                this.btnSanitiserText.setText(label);
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
                if (item.type === typeId) matchingIndices.push(idx);
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

                this.state.tipStockpile += 10;
                this.updateUI();

                const floatTxt = this.add.text(busContainer.x, busContainer.y - 20, '🚌 +10 RUBBISH! 🚌', {
                    fontSize: '18px', style: 'bold', color: '#ff9800', backgroundColor: '#000000', padding: 6
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

        getQuestPoolForTier(tier) {
            const poolTier0 = [
                { id_base: 't0_org', itemKey: 'organic', name: 'Green Tokens', isResource: true, req: 5, rewardCash: 5, color: '#4caf50' },
                { id_base: 't0_pap', itemKey: 'paper', name: 'Paper Tokens', isResource: true, req: 5, rewardCash: 5, color: '#2196f3' },
                { id_base: 't0_gla', itemKey: 'glass', name: 'Glass Tokens', isResource: true, req: 5, rewardCash: 5, color: '#9c27b0' },
                { id_base: 't0_pla', itemKey: 'plastic', name: 'Plastic Tokens', isResource: true, req: 5, rewardCash: 5, color: '#ffeb3b' }
            ];

            const poolTier1 = [
                { id_base: 't1_org', itemKey: 'organic', name: 'Green Tokens', isResource: true, req: 10, rewardCash: 15, color: '#4caf50' },
                { id_base: 't1_pap', itemKey: 'paper', name: 'Paper Tokens', isResource: true, req: 10, rewardCash: 15, color: '#2196f3' },
                { id_base: 't1_gla', itemKey: 'glass', name: 'Glass Tokens', isResource: true, req: 10, rewardCash: 15, color: '#9c27b0' },
                { id_base: 't1_pla', itemKey: 'plastic', name: 'Plastic Tokens', isResource: true, req: 10, rewardCash: 15, color: '#ffeb3b' },
                { id_base: 't1_fer', itemKey: 'fertilizer', name: 'Fertilizer', isResource: false, req: 2, rewardCash: 25, color: '#81c784' },
                { id_base: 't1_rpap', itemKey: 'recycled_paper', name: 'Rec. Paper', isResource: false, req: 2, rewardCash: 30, color: '#64b5f6' },
                { id_base: 't1_vas', itemKey: 'glass_vase', name: 'Glass Vase', isResource: false, req: 2, rewardCash: 30, color: '#ba68c8' },
                { id_base: 't1_fil', itemKey: 'filament', name: '3D Filament', isResource: false, req: 2, rewardCash: 30, color: '#ffd54f' }
            ];

            // Tier 2: 7-10 tokens (capped at 10) & 1-3 crafted items
            const poolTier2 = [
                { id_base: 't2_org', itemKey: 'organic', name: 'Green Tokens', isResource: true, req: 8, rewardCash: 25, color: '#4caf50' },
                { id_base: 't2_pap', itemKey: 'paper', name: 'Paper Tokens', isResource: true, req: 8, rewardCash: 25, color: '#2196f3' },
                { id_base: 't2_gla', itemKey: 'glass', name: 'Glass Tokens', isResource: true, req: 10, rewardCash: 30, color: '#9c27b0' },
                { id_base: 't2_pla', itemKey: 'plastic', name: 'Plastic Tokens', isResource: true, req: 10, rewardCash: 30, color: '#ffeb3b' },
                { id_base: 't2_bio', itemKey: 'biofuel', name: 'Biofuel', isResource: false, req: 1, rewardCash: 50, color: '#81c784' },
                { id_base: 't2_car', itemKey: 'cardboard', name: 'Cardboard', isResource: false, req: 2, rewardCash: 60, color: '#64b5f6' },
                { id_base: 't2_mir', itemKey: 'mirror', name: 'Mirror', isResource: false, req: 1, rewardCash: 60, color: '#ba68c8' },
                { id_base: 't2_bri', itemKey: 'plastic_brick', name: 'Plastic Brick', isResource: false, req: 2, rewardCash: 60, color: '#ffd54f' },
                { id_base: 't2_fer', itemKey: 'fertilizer', name: 'Fertilizer', isResource: false, req: 2, rewardCash: 35, color: '#81c784' },
                { id_base: 't2_rpap', itemKey: 'recycled_paper', name: 'Rec. Paper', isResource: false, req: 2, rewardCash: 40, color: '#64b5f6' },
                { id_base: 't2_vas', itemKey: 'glass_vase', name: 'Glass Vase', isResource: false, req: 2, rewardCash: 40, color: '#ba68c8' },
                { id_base: 't2_fil', itemKey: 'filament', name: '3D Filament', isResource: false, req: 2, rewardCash: 40, color: '#ffd54f' }
            ];

            const poolTier3 = [
                { id_base: 't3_com', itemKey: 'compost', name: 'Compost', isResource: false, req: 3, rewardCash: 120, color: '#81c784' },
                { id_base: 't3_not', itemKey: 'notebook', name: 'Notebook', isResource: false, req: 3, rewardCash: 130, color: '#64b5f6' },
                { id_base: 't3_len', itemKey: 'lens', name: 'Lens', isResource: false, req: 3, rewardCash: 140, color: '#ba68c8' },
                { id_base: 't3_pip', itemKey: 'pipe', name: 'Pipe', isResource: false, req: 3, rewardCash: 150, color: '#ffd54f' },
                { id_base: 't3_bio', itemKey: 'biofuel', name: 'Biofuel', isResource: false, req: 3, rewardCash: 90, color: '#81c784' },
                { id_base: 't3_car', itemKey: 'cardboard', name: 'Cardboard', isResource: false, req: 3, rewardCash: 100, color: '#64b5f6' },
                { id_base: 't3_mir', itemKey: 'mirror', name: 'Mirror', isResource: false, req: 3, rewardCash: 105, color: '#ba68c8' },
                { id_base: 't3_bri', itemKey: 'plastic_brick', name: 'Plastic Brick', isResource: false, req: 3, rewardCash: 105, color: '#ffd54f' },
                { id_base: 't3_org', itemKey: 'organic', name: 'Green Tokens', isResource: true, req: 20, rewardCash: 50, color: '#4caf50' },
                { id_base: 't3_pap', itemKey: 'paper', name: 'Paper Tokens', isResource: true, req: 20, rewardCash: 50, color: '#2196f3' },
                { id_base: 't3_gla', itemKey: 'glass', name: 'Glass Tokens', isResource: true, req: 20, rewardCash: 60, color: '#9c27b0' },
                { id_base: 't3_pla', itemKey: 'plastic', name: 'Plastic Tokens', isResource: true, req: 20, rewardCash: 60, color: '#ffeb3b' }
            ];

            return (tier === 0) ? poolTier0 : (tier === 1) ? poolTier1 : (tier === 2) ? poolTier2 : poolTier3;
        }

        createQuestObject(template) {
            const uniqueId = template.id_base + '_' + Date.now() + '_' + Math.floor(Math.random()*1000);
            return {
                id: uniqueId,
                itemKey: template.itemKey,
                name: template.name,
                isResource: template.isResource,
                req: template.req,
                rewardCash: template.rewardCash,
                rewardTokens: 1,
                color: template.color
            };
        }

        replaceQuestSlot(slotIndex) {
            const pool = this.getQuestPoolForTier(this.state.questTier);
            const activeKeys = this.contracts
                .filter((c, idx) => idx !== slotIndex && c && c.itemKey)
                .map(c => c.itemKey);

            let candidates = pool.filter(template => !activeKeys.includes(template.itemKey));
            if (candidates.length === 0) candidates = pool.slice();

            // CRITICAL: Prevent soft-lock! No crafting quests until player has unlocked workshops OR has at least 10 quest tokens
            const canCraft = (this.state.unlockedWorkshopsFacility || this.state.questTokens >= 10);
            if (!canCraft) {
                candidates = candidates.filter(template => template.isResource === true);
            }

            // Only request active/unlocked resource types
            candidates = candidates.filter(template => {
                if (!template.isResource) return true;
                return !this.state.activeTypes || this.state.activeTypes[template.itemKey] !== false;
            });

            if (candidates.length === 0) {
                candidates = pool.filter(template => template.isResource === true);
            }

            const template = candidates[Math.floor(Math.random() * candidates.length)];
            this.contracts[slotIndex] = this.createQuestObject(template);
        }

        generateQuests() {
            if (this.state.tutorial.active && this.state.tutorial.step > 0) {
                const step = this.state.tutorial.step;

                if (step === 1) {
                    this.contracts = [{
                        id: 'tut_1', name: 'Look through rubbish', req: 1, currentVal: this.state.tutorial.tipTapped,
                        rewardCash: 5, rewardTokens: 0, color: '#4fc3f7', isTutorial: true,
                        onComplete: () => {
                            this.triggerTutorialStepFanfare(1);
                            this.state.tutorial.step = 2;
                            this.generateQuests();
                            this.requestLayoutRebuild();
                        }
                    }];
                } else if (step === 2) {
                    this.contracts = [{
                        id: 'tut_2', name: 'Sort rubbish correctly', req: 5, currentVal: this.state.tutorial.sortProgress,
                        rewardCash: 10, rewardTokens: 0, color: '#00e676', isTutorial: true,
                        onComplete: () => {
                            this.triggerTutorialStepFanfare(2);
                            this.state.tutorial.step = 3;
                            this.generateQuests();
                            this.requestLayoutRebuild();
                        }
                    }];
                } else if (step === 3) {
                    this.contracts = [{
                        id: 'tut_3', name: 'Get paid at Gate', req: 5, currentVal: this.state.tutorial.gateProgress,
                        rewardCash: 15, rewardTokens: 0, color: '#ffb74d', isTutorial: true,
                        onComplete: () => {
                            this.triggerTutorialStepFanfare(3);
                            this.state.tutorial.step = 4;
                            this.generateQuests();
                            this.requestLayoutRebuild();
                        }
                    }];
                } else if (step === 4) {
                    const queueCount = this.trashQueue.length;
                    this.contracts = [{
                        id: 'tut_4b', name: 'Fill 3 Queue Items', req: 3, currentVal: queueCount,
                        rewardCash: 10, rewardTokens: 0, color: '#4fc3f7', isTutorial: true,
                        onComplete: () => {
                            this.triggerTutorialStepFanfare(4);
                            this.state.tutorial.step = 5;
                            this.generateQuests();
                            this.requestLayoutRebuild();
                        }
                    }];
                } else if (step === 5) {
                    if (this.contracts.length === 0 || !this.contracts.some(c => c && c.id === 'tut_5a')) {
                        this.contracts = [{
                            id: 'tut_5a', name: 'Complete a quest', req: 1, currentVal: this.state.tutorial.questCompletedCount,
                            rewardCash: 15, rewardTokens: 0, color: '#ffd700', isTutorial: true,
                            onComplete: () => {
                                this.triggerTutorialStepFanfare(5);
                                this.state.tutorial.step = 0;
                                this.state.tutorial.active = false;
                                this.replaceQuestSlot(0);
                                this.requestLayoutRebuild();
                            }
                        }];

                        const allTypes = ['organic', 'paper', 'glass', 'plastic'].sort(() => 0.5 - Math.random());
                        for (let i = 0; i < 2; i++) {
                            const t = allTypes[i];
                            const amount = Math.floor(Math.random() * 3) + 4;
                            this.contracts.push({
                                id: 'tut_t0_' + i, itemKey: t, name: TRASH_TYPES[t].name + ' Tokens',
                                isResource: true, req: amount, rewardTokens: 0, rewardCash: 5, color: TRASH_TYPES[t].colorHex
                            });
                        }
                    } else {
                        if (this.contracts[0] && this.contracts[0].id === 'tut_5a') {
                            this.contracts[0].currentVal = this.state.tutorial.questCompletedCount;
                        }
                    }
                }
                return;
            }

            // Progression Quests: MAINTAIN EXACTLY 3 FIXED QUEST SLOTS
            if (this.contracts.some(c => c && c.isTutorial)) {
                this.contracts = [];
            }

            while (this.contracts.length < 3) {
                const nextIdx = this.contracts.length;
                this.contracts.push(null);
                this.replaceQuestSlot(nextIdx);
            }

            // AUTO-HEAL SOFT LOCK: If player cannot craft yet, replace any crafted item quests!
            const canCraft = (this.state.unlockedWorkshopsFacility || this.state.questTokens >= 10);
            if (!canCraft && this.contracts) {
                this.contracts.forEach((c, idx) => {
                    if (c && !c.isResource && !c.isTutorial) {
                        this.replaceQuestSlot(idx);
                    }
                });
            }
        }

        handleResize(gameSize) {
            this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
            this.requestLayoutRebuild();
        }

        buildLayout() {
            if (this.mainContainer) this.mainContainer.destroy(true);
            this.mainContainer = this.add.container(0, 0);

            const width = this.scale.width || window.innerWidth || 800;
            const height = this.scale.height || window.innerHeight || 600;
            const isMobile = height > width && width < 600;

            const targetMinHeight = isMobile ? 840 : 720;
            const scaleFactor = Math.min(1, height / targetMinHeight);
            const logicalHeight = Math.max(height, targetMinHeight);

            const topBarY = isMobile ? 30 : 35;
            const questY = topBarY + 85;

            if (this.state.tutorial.active && this.state.tutorial.step > 0) {
                this.renderTutorialBanner(width, questY + 105);
            }

            const bottomY = isMobile ? logicalHeight - 190 : logicalHeight - 135;
            const binBaselineY = bottomY - 34; // Exact bottom baseline anchor for bins
            const binH = 105;
            const binCenterY = binBaselineY - (binH / 2);
            const queueY = binBaselineY - 170; // Raised by 40px so conveyor items never overlap bin titles!

            const workshopHeaderY = questY + (this.state.tutorial.active ? 195 : 95);
            const conveyorY = workshopHeaderY + 24;
            const workshopY = conveyorY + 45;

            // Environmental Sky & Ground Layer:
            // The horizon line is fixed at a permanent, stable position relative to the ground elements (queueY - 85).
            // It remains completely stationary when the tutorial ends and when workshops are unlocked!
            const splitY = isMobile ? Math.round(logicalHeight * 0.44) : (queueY - 85);
            const envGfx = this.add.graphics();
            // Sky gradient
            envGfx.fillStyle(0x64b5f6, 1);
            envGfx.fillRect(0, 0, width, splitY);
            envGfx.fillStyle(0x90caf9, 0.45);
            envGfx.fillRect(0, splitY - 45, width, 45);

            // Ground: Starts as earthy dirt brown; transitions to natural meadow when grass decoration is bought!
            if (this.state.hasGrass) {
                envGfx.fillStyle(0x3e7b42, 1); // Natural meadow green (soft, grounded, not neon)
                envGfx.fillRect(0, splitY, width, logicalHeight - splitY);
                envGfx.fillStyle(0x336936, 1); // Deep meadow rim
                envGfx.fillRect(0, splitY, width, 14);

                // Grass variety: subtle tufts of softer green splattered across the lawn
                envGfx.fillStyle(0x558b2f, 0.45);
                for (let gx = 18; gx < width - 18; gx += 42) {
                    const gy1 = splitY + 28 + ((gx * 7) % 65);
                    const gy2 = splitY + 110 + ((gx * 13) % 80);
                    envGfx.fillRoundedRect(gx, gy1, 14, 5, 2);
                    envGfx.fillRoundedRect(gx + 12, gy2, 18, 6, 3);
                }

                // Cute tiny wildflower accents dotted across the lawn (white daisies, pastel pink, buttercups)
                for (let fx = 32; fx < width - 32; fx += 58) {
                    const fy = splitY + 20 + ((fx * 17) % 130);
                    const flowerType = (fx % 3);
                    if (flowerType === 0) {
                        // White daisy with tiny yellow center
                        envGfx.fillStyle(0xffffff, 0.9);
                        envGfx.fillCircle(fx, fy, 3);
                        envGfx.fillStyle(0xffd54f, 1);
                        envGfx.fillCircle(fx, fy, 1.2);
                    } else if (flowerType === 1) {
                        // Soft pastel pink blossom
                        envGfx.fillStyle(0xf48fb1, 0.9);
                        envGfx.fillCircle(fx, fy, 2.5);
                        envGfx.fillStyle(0xffffff, 1);
                        envGfx.fillCircle(fx, fy, 1);
                    } else {
                        // Buttercup gold
                        envGfx.fillStyle(0xffeb3b, 0.95);
                        envGfx.fillCircle(fx, fy, 2.5);
                    }
                }
            } else {
                envGfx.fillStyle(0x5d4037, 1); // Rich soil brown
                envGfx.fillRect(0, splitY, width, logicalHeight - splitY);
                envGfx.fillStyle(0x4e342e, 1); // Dirt rim
                envGfx.fillRect(0, splitY, width, 14);
            }
            this.mainContainer.add(envGfx);

            // Render decorations AFTER the environment so they are never covered up!
            this.renderDecorationsGraphics(width, logicalHeight, splitY);

            const activeBinCount = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]).length;
            const binSpacing = Math.min(width * (1 / (activeBinCount + 0.8)), 88);
            const startBinX = (width - (binSpacing * (activeBinCount - 1))) / 2;

            this.renderCenteredXPBar(width, topBarY);
            this.renderTopHUDBar(width, topBarY, isMobile);
            this.createTopNavButtons(width);

            // 1. QUESTS BOARD & ARCADE BUTTON
            const questTitle = this.state.tutorial.active ? '📜 TUTORIAL QUESTS 📜' : ('📜 QUESTS (Tier ' + this.state.questTier + ') 📜');
            const questHeader = this.add.text(width / 2 - 40, questY - 38, questTitle, { fontSize: '13px', style: 'bold', color: '#ffca28' }).setOrigin(0.5);
            const tokenBadge = this.add.text(width / 2 + 115, questY - 38, '🎟️ ' + this.state.questTokens + ' QUEST TOKENS', {
                fontSize: '11.5px', style: 'bold', color: '#ffd700', backgroundColor: '#1e293b', padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            // Arcade Launcher Button (to the left of quests)
            const btnArcade = this.add.text(width / 2 - 165, questY - 38, '🕹️ ARCADE', {
                fontSize: '11px', style: 'bold', color: '#ffeb3b', backgroundColor: '#1e293b', padding: { x: 7, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            btnArcade.on('pointerup', () => this.openArcadeModal());

            this.mainContainer.add([btnArcade, questHeader, tokenBadge]);
            this.renderContractsUI(width, questY);

            // 2. WORKSHOPS
            if (!this.state.tutorial.active) {
                if (this.state.unlockedWorkshopsFacility) {
                    const shopHeader = this.add.text(width / 2, workshopHeaderY, '🛠️ WORKSHOPS 🛠️', { fontSize: '15px', style: 'bold', color: '#4fc3f7' }).setOrigin(0.5);
                    this.mainContainer.add(shopHeader);
                    this.renderConveyorHUD(width, conveyorY);
                    this.renderWorkshopsUI(width, logicalHeight, workshopY);
                } else {
                    const canAffordFacility = this.state.questTokens >= 10;
                    const btnUnlockFacility = this.add.text(width / 2, workshopHeaderY + 20, '🛠️ BUY WORKSHOPS (10 Quest Tokens) 🛠️', {
                        fontSize: '12px', style: 'bold',
                        backgroundColor: canAffordFacility ? '#00e676' : '#334155',
                        color: canAffordFacility ? '#000000' : '#ffd700',
                        padding: { x: 12, y: 7 }
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                    btnUnlockFacility.on('pointerup', () => {
                        if (this.state.questTokens >= 10) {
                            this.state.questTokens -= 10;
                            this.state.unlockedWorkshopsFacility = true;
                            Object.keys(this.state.binUpgrades).forEach(bId => {
                                this.state.binUpgrades[bId].shopUnlocked = true;
                            });
                            this.requestLayoutRebuild();
                        }
                    });
                    this.mainContainer.add(btnUnlockFacility);
                }
            }

            // 3. QUEUE ROW
            this.queueY = queueY;
            this.queueStartX = startBinX;

            this.queueCounterText = this.add.text(width * 0.72, queueY, '0/' + this.state.maxTrashQueue, { fontSize: '13px', color: '#00ff00', style: 'bold' }).setOrigin(0.5);
            
            this.queueHighlight = this.add.graphics();
            this.queueHighlight.lineStyle(3, 0xffd700, 1);
            this.queueHighlight.strokeRect(-28, -28, 56, 56);
            this.queueHighlight.setVisible(false);

            this.mainContainer.add([this.queueCounterText, this.queueHighlight]);

            // Toolbar above conveyor: Sanitiser station, Pet helpers & Auto-Sort toggle
            const toolbarY = queueY - 48;

            if (this.state.unlockedSanitiser) {
                const sBoxW = 104;
                const sBoxH = 26;
                this.sanitiserContainer = this.add.container(startBinX - 20, toolbarY).setDepth(20);

                this.sanitiserBgGfx = this.add.graphics();
                this.sanitiserBgGfx.fillStyle(0x1e293b, 1);
                this.sanitiserBgGfx.fillRoundedRect(0, 0, sBoxW, sBoxH, 5);
                this.sanitiserBgGfx.lineStyle(1.5, 0x334155, 1);
                this.sanitiserBgGfx.strokeRoundedRect(0, 0, sBoxW, sBoxH, 5);

                this.sanitiserFillGfx = this.add.graphics();

                const headItem = this.trashQueue && this.trashQueue[0];
                const currentMult = headItem ? (headItem.multiplier || 1) : 1;
                const targetMult = (currentMult === 1) ? 2 : 4;
                const initLabel = (currentMult >= 4) ? '🧪 MAX (4x)' : ('🧪 Sanitise x' + targetMult);

                this.btnSanitiserText = this.add.text(sBoxW / 2, sBoxH / 2, initLabel, {
                    fontSize: '10.5px', style: 'bold', color: '#ffffff'
                }).setOrigin(0.5);

                this.sanitiserContainer.add([this.sanitiserBgGfx, this.sanitiserFillGfx, this.btnSanitiserText]);
                this.sanitiserContainer.setSize(sBoxW, sBoxH);
                this.sanitiserContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, sBoxW, sBoxH), Phaser.Geom.Rectangle.Contains);
                this.sanitiserContainer.on('pointerup', () => this.triggerSanitiseAction());

                this.mainContainer.add(this.sanitiserContainer);
                this.updateSanitiserBtnUI();
            }

            // Pet Helper Buttons
            const petDefs = [
                { id: 'dog', name: 'Dog', icon: '🐶', targetType: 'paper', col: '#2196f3' },
                { id: 'chicken', name: 'Chicken', icon: '🐔', targetType: 'organic', col: '#4caf50' },
                { id: 'turtle', name: 'Turtle', icon: '🐢', targetType: 'plastic', col: '#ffeb3b' },
                { id: 'flashlight', name: 'Torch', icon: '🔦', targetType: 'glass', col: '#9c27b0' },
                { id: 'cat', name: 'Cat', icon: '🐱', targetType: 'fabric', col: '#e91e63' },
                { id: 'magnet', name: 'Magnet', icon: '🧲', targetType: 'metal', col: '#9e9e9e' }
            ];

            const petStartX = this.state.unlockedSanitiser ? (startBinX + 96) : startBinX;
            let petIdx = 0;
            petDefs.forEach(p => {
                if (this.state.pets[p.id]) {
                    const px = petStartX + (petIdx * 42);
                    const btnPet = this.add.text(px, toolbarY + 13, p.icon, {
                        fontSize: '15px', backgroundColor: '#1e293b', padding: { x: 6, y: 4 }
                    }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

                    btnPet.on('pointerup', () => {
                        this.triggerPetClean(p.targetType, p.icon + ' ' + p.name);
                    });
                    this.mainContainer.add(btnPet);
                    petIdx++;
                }
            });

            // Auto-Sort Pause/Resume Toggle
            if (this.state.unlockedAutoSort) {
                const autoSortLabel = this.state.autoSortPaused ? '▶️ Auto-Sort: OFF' : '⏸️ Auto-Sort: ON';
                const btnAutoSort = this.add.text(width * 0.88, toolbarY + 13, autoSortLabel, {
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

            binData.forEach((b, idx) => {
                const bx = Math.round(startBinX + (idx * binSpacing));
                const isSheet = !!(b.sheetKey && this.textures.exists(b.sheetKey));
                let sprite;
                if (isSheet) {
                    sprite = this.add.sprite(bx, binBaselineY, b.sheetKey, 0)
                        .setOrigin(0.5, 1)
                        .setScale(BIN_SPRITE_CONFIG.scale)
                        .setInteractive({ useHandCursor: true });
                } else {
                    sprite = this.add.sprite(bx, binBaselineY, b.sprite)
                        .setOrigin(0.5, 1)
                        .setDisplaySize(78, binH)
                        .setInteractive({ useHandCursor: true });
                }

                const labelY = binBaselineY - binH - 12;
                const label = this.add.text(bx, labelY, '[' + b.key + '] ' + b.name, { fontSize: '11px', color: '#fff', style: 'bold' }).setOrigin(0.5);
                const countY = binBaselineY - 45;
                const countText = this.add.text(bx, countY, '' + b.count, {
                    fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 4, style: 'bold'
                }).setOrigin(0.5).setDepth(2);

                const binHighlightGfx = this.add.graphics();
                binHighlightGfx.lineStyle(3, 0xffd700, 1);
                binHighlightGfx.strokeRoundedRect(bx - 42, binBaselineY - binH - 4, 84, binH + 8, 8);
                binHighlightGfx.setVisible(false);

                sprite.on('pointerdown', () => this.sortHeadTrash(b.id, 0));
                if (b.animKey) {
                    sprite.on('animationcomplete', () => {
                        sprite.setFrame(0);
                        sprite.setOrigin(0.5, 1);
                        sprite.setScale(BIN_SPRITE_CONFIG.scale);
                    });
                }
                this.bins.push({ sprite, id: b.id, x: bx, y: binCenterY, baselineY: binBaselineY, countText, highlightGfx: binHighlightGfx, sheetKey: b.sheetKey, animKey: b.animKey });
                this.mainContainer.add([sprite, label, countText, binHighlightGfx]);
            });

            // Streak Score Text & Dumpster Fire Bar Setup
            this.dumpsterBarGfx = this.add.graphics();
            const barStartX = this.bins[0].x - 38;
            const lastBinIdx = Math.min(this.bins.length - 1, 3);
            const barEndX = this.bins[lastBinIdx].x + 38;
            const barCenter = Math.round((barStartX + barEndX) / 2);

            // Permanent Responsive Streak & High Score Badge
            this.dumpsterStreakText = this.add.text(Math.round(width / 2), binBaselineY + 36, '🔥 STREAK: ' + this.state.streak + '  |  BEST: ' + this.state.streakHighScore, {
                fontSize: '12px', style: 'bold', color: '#ffca28', backgroundColor: '#111827', padding: { x: 10, y: 4 }
            }).setOrigin(0.5);

            this.dumpsterFireBanner = this.add.text(barCenter, binBaselineY + 56, '🔥 DUMPSTER FIRE (2X TOKENS) 🔥', {
                fontSize: '11px', style: 'bold', color: '#ffffff', backgroundColor: '#ff3d00', padding: { x: 8, y: 2 }
            }).setOrigin(0.5).setVisible(false);

            this.mainContainer.add([this.dumpsterBarGfx, this.dumpsterStreakText, this.dumpsterFireBanner]);

            // 5. GATE & TIP
            this.gatePos = { x: Math.round(width * 0.35), y: bottomY };
            this.tipPos = { x: Math.round(width * 0.65), y: bottomY };

            this.gateSprite = this.add.sprite(this.gatePos.x, this.gatePos.y, 'gate').setInteractive({ useHandCursor: true }).setDepth(1);
            this.gateText = this.add.text(this.gatePos.x, bottomY - 40, 'GATE [C]', { fontSize: '11px', color: '#00ff00', style: 'bold' }).setOrigin(0.5);

            this.autoGateGfx = this.add.graphics();
            this.autoQueueGfx = this.add.graphics();
            this.autoSortGfx = this.add.graphics().setDepth(25);
            this.longPressGfx = this.add.graphics().setDepth(10);
            this.tutorialIndicatorsGfx = this.add.graphics().setDepth(25);

            this.setupLongPress(this.gateSprite, 'gate');

            this.tipSprite = this.add.sprite(this.tipPos.x, this.tipPos.y, 'tip').setInteractive({ useHandCursor: true });
            this.tipLabel = this.add.text(this.tipPos.x, bottomY + 38, 'THE TIP [SPACE]', {
                fontSize: '11px', style: 'bold', color: '#ffffff', backgroundColor: '#111827', padding: { x: 6, y: 3 }
            }).setOrigin(0.5);

            this.tipStockText = this.add.text(this.tipPos.x, bottomY, '' + this.state.tipStockpile, { fontSize: '18px', color: '#000000', style: 'bold' }).setOrigin(0.5);

            this.setupLongPress(this.tipSprite, 'tip');

            this.mainContainer.add([
                this.gateSprite, this.gateText, this.autoGateGfx, this.autoQueueGfx, this.autoSortGfx,
                this.tipSprite, this.tipLabel, this.tipStockText, this.longPressGfx, this.tutorialIndicatorsGfx
            ]);

            if (scaleFactor < 1) {
                this.mainContainer.setScale(scaleFactor);
                this.mainContainer.x = (width - (width * scaleFactor)) / 2;
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
            // 1. Festive Bunting: Colorful triangular pennants strung high across top of screen (clear of XP bar!)
            if (this.state.hasBunting) {
                const gfx = this.add.graphics();
                const colors = [0x2196f3, 0xff1744, 0xffeb3b, 0x4caf50];
                let cIdx = 0;
                const ropeY = 8; // Raised well above XP bar (XP bar starts at y=35)
                gfx.lineStyle(1.5, 0xffffff, 0.6);
                gfx.lineBetween(10, ropeY, w - 10, ropeY);
                for (let x = 16; x < w - 24; x += 22) {
                    gfx.fillStyle(colors[cIdx % 4], 0.95);
                    gfx.fillTriangle(x, ropeY, x + 14, ropeY, x + 7, ropeY + 11);
                    cIdx++;
                }
                this.mainContainer.add(gfx);
            }

            // 2. Perimeter Bushes / Trees: Lush, taller green shrub hedges along the ground horizon
            if (this.state.hasTrees) {
                const gfx = this.add.graphics();
                const baseY = (splitY || 280);
                for (let x = 8; x < w - 8; x += 32) {
                    // Deep forest base
                    gfx.fillStyle(0x1b5e20, 1);
                    gfx.fillRoundedRect(x, baseY - 26, 26, 28, 7);
                    // Mid-tone rich foliage
                    gfx.fillStyle(0x2e7d32, 1);
                    gfx.fillCircle(x + 13, baseY - 18, 12);
                    // Top vibrant foliage highlight
                    gfx.fillStyle(0x388e3c, 1);
                    gfx.fillCircle(x + 13, baseY - 25, 8);
                }
                this.mainContainer.add(gfx);
            }

            // 3. Fairy Lights: Warm glowing fairy lights nestled into the taller bushes
            if (this.state.hasFairyLights && this.state.hasTrees) {
                const gfx = this.add.graphics();
                const baseY = (splitY || 280);
                for (let x = 8; x < w - 8; x += 32) {
                    // Staggered light 1 (upper left)
                    const lx1 = x + 7, ly1 = baseY - 24;
                    gfx.fillStyle(0xffeb3b, 0.35);
                    gfx.fillCircle(lx1, ly1, 5);
                    gfx.fillStyle(0xfff9c4, 1);
                    gfx.fillCircle(lx1, ly1, 2);

                    // Staggered light 2 (mid right)
                    const lx2 = x + 19, ly2 = baseY - 16;
                    gfx.fillStyle(0xffeb3b, 0.35);
                    gfx.fillCircle(lx2, ly2, 5);
                    gfx.fillStyle(0xfff9c4, 1);
                    gfx.fillCircle(lx2, ly2, 2);

                    // Staggered light 3 (center peak)
                    const lx3 = x + 13, ly3 = baseY - 29;
                    gfx.fillStyle(0xffd54f, 0.4);
                    gfx.fillCircle(lx3, ly3, 4);
                    gfx.fillStyle(0xffffff, 1);
                    gfx.fillCircle(lx3, ly3, 1.8);
                }
                this.mainContainer.add(gfx);
            }

            // 4. Diamond Accents
            if (this.state.hasDiamonds) {
                const gfx = this.add.graphics();
                gfx.fillStyle(0x00e5ff, 0.85);
                gfx.fillTriangle(14, h / 2, 22, h / 2 - 8, 30, h / 2);
                gfx.fillTriangle(14, h / 2, 22, h / 2 + 8, 30, h / 2);

                gfx.fillTriangle(w - 30, h / 2, w - 22, h / 2 - 8, w - 14, h / 2);
                gfx.fillTriangle(w - 30, h / 2, w - 22, h / 2 + 8, w - 14, h / 2);
                this.mainContainer.add(gfx);
            }
        }

        renderContractsUI(w, y) {
            const cardW = Math.min(w * 0.28, 125);
            const cardH = 75;
            const gap = 12;
            const startX = (w - (this.contracts.length * cardW + (this.contracts.length - 1) * gap)) / 2 + (cardW / 2);

            this.questCardPositions = [];
            this.contractCardViews = [];

            this.contracts.forEach((c, idx) => {
                if (!c) return;
                const cx = startX + (idx * (cardW + gap));
                this.questCardPositions.push({ x: cx, y: y });

                const cardBg = this.add.graphics();
                const cardHitZone = this.add.zone(cx, y + 13, cardW, cardH).setOrigin(0.5);

                let txt, btnHandIn, outlineColor;

                if (c.isTutorial) {
                    const isDone = (c.currentVal >= c.req);
                    outlineColor = 0xffd700;

                    txt = this.add.text(cx, y - 4, c.name + '\\nProgress: (' + c.currentVal + '/' + c.req + ')', {
                        fontSize: '11px', style: 'bold', color: c.color || '#ffffff', align: 'center', wordWrap: { width: cardW - 8 }
                    }).setOrigin(0.5);

                    const btnText = isDone ? '[ COMPLETE ]' : ('(' + c.currentVal + '/' + c.req + ')');
                    btnHandIn = this.add.text(cx, y + 24, btnText, {
                        fontSize: '10px', style: 'bold',
                        backgroundColor: isDone ? '#00e676' : '#334155',
                        color: isDone ? '#000000' : '#ffd700', padding: { x: 5, y: 2 }
                    }).setOrigin(0.5);

                    cardHitZone.setInteractive({ useHandCursor: true }).on('pointerup', () => {
                        if (c.currentVal >= c.req) {
                            this.state.questTokens += 1;
                            if (c.onComplete) c.onComplete();
                        }
                    });
                } else {
                    const current = c.isResource ? (this.state.resources[c.itemKey] || 0) : (this.state.crafted[c.itemKey] || 0);
                    const canFulfill = current >= c.req;
                    outlineColor = Phaser.Display.Color.ValueToColor(c.color).color;

                    txt = this.add.text(cx, y - 4, c.req + ' ' + c.name + '\\n(+$' + c.rewardCash + ' | +' + (c.rewardTokens || 1) + ' Tkn)', {
                        fontSize: '11px', style: 'bold', color: c.color, align: 'center', wordWrap: { width: cardW - 8 }
                    }).setOrigin(0.5);

                    btnHandIn = this.add.text(cx, y + 24, canFulfill ? '[ TURN IN ]' : ('(' + current + '/' + c.req + ')'), {
                        fontSize: '10px', style: 'bold',
                        backgroundColor: canFulfill ? '#00e676' : '#424242',
                        color: canFulfill ? '#000000' : '#aaaaaa', padding: { x: 5, y: 2 }
                    }).setOrigin(0.5);

                    cardHitZone.setInteractive({ useHandCursor: true }).on('pointerup', () => {
                        const nowCount = c.isResource ? (this.state.resources[c.itemKey] || 0) : (this.state.crafted[c.itemKey] || 0);
                        if (nowCount >= c.req) {
                            if (c.isResource) this.state.resources[c.itemKey] -= c.req;
                            else this.state.crafted[c.itemKey] -= c.req;

                            this.state.money += c.rewardCash;
                            this.state.questTokens += (c.rewardTokens || 1);
                            this.state.totalQuestsCompleted++;
                            this.state.tutorial.questCompletedCount++;

                            // QUEST TIER PROGRESSION REQUIREMENTS:
                            if (this.state.questTier === 0 && this.state.questTokens >= 3) {
                                this.state.questTier = 1;
                            } else if (this.state.questTier <= 1 && this.state.totalQuestsCompleted >= 15) {
                                this.state.questTier = 2;
                            } else if (this.state.questTier === 2 && this.state.totalQuestsCompleted >= 30) {
                                this.state.questTier = 3;
                            }

                            this.replaceQuestSlot(idx);
                            this.generateQuests();
                            this.requestLayoutRebuild();
                        }
                    });
                }

                this.mainContainer.add([cardBg, txt, btnHandIn, cardHitZone]);
                this.contractCardViews.push({
                    contract: c,
                    idx: idx,
                    cx: cx,
                    y: y,
                    cardW: cardW,
                    cardH: cardH,
                    cardBg: cardBg,
                    txt: txt,
                    btnHandIn: btnHandIn,
                    cardHitZone: cardHitZone,
                    outlineColor: outlineColor
                });
            });

            this.updateContractsUI();
        }

        updateContractsUI() {
            if (!this.contractCardViews || this.contractCardViews.length === 0) return;
            this.contractCardViews.forEach(v => {
                if (!v.contract || !v.cardBg || !v.btnHandIn || !v.cardBg.scene) return;
                const c = v.contract;
                if (c.isTutorial) {
                    const isDone = (c.currentVal >= c.req);
                    v.cardBg.clear();
                    v.cardBg.fillStyle(isDone ? 0x1b5e20 : 0x1e293b, 0.95);
                    v.cardBg.fillRect(v.cx - (v.cardW / 2), v.y - 24, v.cardW, v.cardH);
                    v.cardBg.lineStyle(2, isDone ? 0x00e676 : 0xffd700, 1);
                    v.cardBg.strokeRect(v.cx - (v.cardW / 2), v.y - 24, v.cardW, v.cardH);

                    v.btnHandIn.setText(isDone ? '[ COMPLETE ]' : ('(' + c.currentVal + '/' + c.req + ')'));
                    v.btnHandIn.setBackgroundColor(isDone ? '#00e676' : '#334155');
                    v.btnHandIn.setColor(isDone ? '#000000' : '#ffd700');
                } else {
                    const current = c.isResource ? (this.state.resources[c.itemKey] || 0) : (this.state.crafted[c.itemKey] || 0);
                    const canFulfill = current >= c.req;

                    v.cardBg.clear();
                    v.cardBg.fillStyle(canFulfill ? 0x1b5e20 : 0x222222, 0.95);
                    v.cardBg.fillRect(v.cx - (v.cardW / 2), v.y - 24, v.cardW, v.cardH);
                    v.cardBg.lineStyle(canFulfill ? 3 : 2, canFulfill ? 0x00e676 : v.outlineColor, 1);
                    v.cardBg.strokeRect(v.cx - (v.cardW / 2), v.y - 24, v.cardW, v.cardH);

                    v.btnHandIn.setText(canFulfill ? '[ TURN IN ]' : ('(' + current + '/' + c.req + ')'));
                    v.btnHandIn.setBackgroundColor(canFulfill ? '#00e676' : '#424242');
                    v.btnHandIn.setColor(canFulfill ? '#000000' : '#aaaaaa');
                }
            });
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

                    const btnBuy = this.add.text(sx, sy - 2, 'BUY WORKSHOPS FACILITY\\n(10 Quest Tokens)', {
                        fontSize: '9.5px', style: 'bold', backgroundColor: '#333', color: '#ffd700', align: 'center', padding: 4
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                    btnBuy.on('pointerup', () => {
                        if (this.state.questTokens >= 10) {
                            this.state.questTokens -= 10;
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
            const pct = Math.min(1, this.state.xp / neededXP);

            const bgGfx = this.add.graphics();
            bgGfx.fillStyle(0x222222, 1);
            bgGfx.fillRect(bx, y, barW, barH);
            bgGfx.lineStyle(1.5, 0x00ff00, 1);
            bgGfx.strokeRect(bx, y, barW, barH);

            const fillGfx = this.add.graphics();
            fillGfx.fillStyle(0x2e7d32, 1);
            fillGfx.fillRect(bx + 1, y + 1, (barW - 2) * pct, barH - 2);

            const barText = this.add.text(w / 2, y + (barH / 2), \`LEVEL \${this.state.level} (\${this.state.xp}/\${neededXP} XP)\`, {
                fontSize: '11px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            this.mainContainer.add([bgGfx, fillGfx, barText]);
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
            let text = '💵 Cash: $' + this.state.money + '  |  🎟️ Tkns: ' + this.state.questTokens + '\\n' +
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
            if (!this.state.unlockedAutoSort || this.trashQueue.length === 0) return;

            const lastIdx = this.trashQueue.length - 1;
            const lastItem = this.trashQueue[lastIdx];
            const targetX = (lastItem && lastItem.container) ? lastItem.container.x : (this.queueStartX + (lastIdx * 56));
            const targetY = (lastItem && lastItem.container) ? lastItem.container.y : this.queueY;
            if (progress > 0) {
                this.autoSortGfx.lineStyle(3, 0x00e676, 1);
                this.autoSortGfx.beginPath();
                this.autoSortGfx.arc(targetX, targetY, 30, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * progress)), false);
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

            const hasAnyAfford = this.hasCategoryAffordable('gate') || this.hasCategoryAffordable('tip') || this.hasCategoryAffordable('organic_shop');
            this.btnUpgrades = this.add.text(w - 20, 58, hasAnyAfford ? '🛠️ UPGRADES (!)' : '🛠️ UPGRADES', { fontSize: '11px', style: 'bold', color: '#4fc3f7', backgroundColor: '#1e293b', padding: { x: 7, y: 5 } })
                .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                    this.openModal('upgrades', 'gate');
                });

            this.mainContainer.add([btnDecor, this.btnUpgrades]);
        }

        createItemGraphic(typeId, itemName, forcedMultiplier = 1, fixedSpriteKey = null) {
            const typeData = TRASH_TYPES[typeId];
            const container = this.add.container(0, 0).setDepth(10);
            const isBgUnlocked = this.state.binUpgrades[typeId].bgUnlocked;

            const spriteKey = fixedSpriteKey || typeData.sprites[Math.floor(Math.random() * typeData.sprites.length)];
            const multiplier = forcedMultiplier;

            if (multiplier === 4) {
                // QUADRUPLE: Pile of 4 identical PNG icons (one in each corner)
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
                // SINGLE: 1 icon centered
                if (isBgUnlocked) {
                    const circleGfx = this.add.graphics();
                    circleGfx.fillStyle(typeData.color, 1);
                    circleGfx.fillCircle(0, 0, 26);
                    circleGfx.lineStyle(3, 0x000000, 1); // 3px outline mimicking rubbish sprite cartoon border
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

        renderHorizontalQueue() {
            if (!this.queueCounterText) return;
            const cap = Math.min(10, this.state.maxTrashQueue);
            this.queueCounterText.setText(this.trashQueue.length + '/' + cap);

            const sFactor = (this.mainContainer && this.mainContainer.scaleX) ? this.mainContainer.scaleX : 1;
            const gap = 56 * sFactor;
            const qStartX = this.queueStartX * sFactor;
            const qY = this.queueY * sFactor;

            this.trashQueue.forEach((item, index) => {
                if (!item.container || !item.container.scene) {
                    const fixedKey = item.spriteKey || (item.container && item.container.spriteKey);
                    item.spriteKey = fixedKey;
                    item.container = this.createItemGraphic(item.type, null, item.multiplier || 1, fixedKey);
                }

                item.container.setScale(sFactor);

                const targetX = qStartX + (index * gap);
                let itemAlpha = 1;
                if (index >= 6) itemAlpha = Math.max(0.15, 1 - ((index - 5) * 0.3));

                if (this.tweens && this.tweens.add) {
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
                    this.queueHighlight.setVisible(true);
                    this.queueHighlight.setPosition(this.queueStartX, this.queueY);

                    item.container.setSize(52, 52);
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
                            const binWorldX = b.x * sFactor;
                            const binWorldY = b.y * sFactor;
                            const hitDist = 65 * sFactor;
                            if (Phaser.Math.Distance.Between(item.container.x, item.container.y, binWorldX, binWorldY) < hitDist) {
                                droppedBin = b;
                            }
                        });

                        if (droppedBin) {
                            if (this.state.tutorial.active && this.state.tutorial.step === 2) {
                                this.state.tutorial.interactionMethod = 'tap';
                            }
                            this.sortHeadTrash(droppedBin.id, 0);
                        } else {
                            this.renderHorizontalQueue();
                        }
                    });
                } else {
                    if (item.container.input) item.container.disableInteractive();
                }
            });

            if (this.trashQueue.length === 0) this.queueHighlight.setVisible(false);
        }

        sortHeadTrash(targetType, itemIndex = 0) {
            if (this.trashQueue.length === 0 || itemIndex >= this.trashQueue.length) return;

            const isManualSort = (itemIndex === 0);
            const item = this.trashQueue.splice(itemIndex, 1)[0];
            const targetBin = this.bins.find(b => b.id === targetType);
            const isCorrect = (item.type === targetType);

            if (this.state.tutorial.active && this.state.tutorial.step === 4) {
                this.generateQuests();
                this.requestLayoutRebuild();
            }

            // Tutorial Step 2: Hero rubbish shakes left-to-right and stays in hero spot on wrong sort!
            if (!isCorrect && this.state.tutorial.active && this.state.tutorial.step === 2) {
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

            this.renderHorizontalQueue();

            if (targetBin) {
                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: item.container,
                        x: targetBin.x,
                        y: targetBin.y,
                        scale: 0.1,
                        duration: 110,
                        onComplete: () => {
                            item.container.destroy();
                            if (isCorrect) {
                                // Play animated bin celebration safely on live bin
                                const liveBin = (this.bins && this.bins.find(b => b.id === targetType)) || targetBin;
                                if (liveBin && liveBin.sprite && liveBin.sprite.scene && liveBin.sprite.anims && liveBin.animKey && this.anims && this.anims.exists(liveBin.animKey)) {
                                    try {
                                        liveBin.sprite.play(liveBin.animKey);
                                    } catch (e) {}
                                }

                                if (isManualSort) {
                                    this.state.streak++;
                                    this.state.streakHighScore = Math.max(this.state.streakHighScore, this.state.streak);
                                    this.state.streakTimer = 2000;
                                    if (this.state.streak >= 10) {
                                        this.state.dumpsterFireActive = true;
                                    }
                                }

                                let mult = item.multiplier || 1;
                                if (this.state.dumpsterFireActive) mult *= 2;

                                this.state.resources[targetType] += mult;
                                this.addXP(mult);

                                let tutorialStepCompleted = false;
                                if (this.state.tutorial.active && this.state.tutorial.step === 2) {
                                    this.state.tutorial.sortProgress++;
                                    this.generateQuests();
                                    tutorialStepCompleted = true;
                                }

                                const isFire = this.state.dumpsterFireActive;
                                const popText = isFire ? ('+' + mult + ' Tokens (FIRE 2X!)') : (mult > 1 ? ('+' + mult + ' Tokens (' + mult + 'X!)') : '+1 Token');
                                const popOne = this.add.text(targetBin.x, targetBin.y - 15, popText, {
                                    fontSize: '14px', style: 'bold', color: isFire ? '#ff3d00' : (mult > 1 ? '#ffd700' : '#00ff00')
                                }).setOrigin(0.5).setDepth(20);

                                if (this.tweens && this.tweens.add) {
                                    this.tweens.add({ targets: popOne, y: popOne.y - 30, alpha: 0, duration: 850, onComplete: () => popOne.destroy() });
                                } else {
                                    popOne.destroy();
                                }

                                if (tutorialStepCompleted) {
                                    this.requestLayoutRebuild();
                                }
                            } else {
                                this.state.streak = 0;
                                this.state.dumpsterFireActive = false;
                                this.state.streakTimer = 0;
                                if (this.cameras && this.cameras.main) this.cameras.main.flash(120, 255, 0, 0);
                            }
                            this.renderDumpsterFireBar();
                            this.updateUI();
                            this.renderHorizontalQueue();
                        }
                    });
                } else {
                    item.container.destroy();
                    if (isCorrect) {
                        const liveBin = (this.bins && this.bins.find(b => b.id === targetType)) || targetBin;
                        if (liveBin && liveBin.sprite && liveBin.sprite.scene && liveBin.sprite.anims && liveBin.animKey && this.anims && this.anims.exists(liveBin.animKey)) {
                            try {
                                liveBin.sprite.play(liveBin.animKey);
                            } catch (e) {}
                        }
                        if (isManualSort) {
                            this.state.streak++;
                            this.state.streakHighScore = Math.max(this.state.streakHighScore, this.state.streak);
                            this.state.streakTimer = 2000;
                            if (this.state.streak >= 10) this.state.dumpsterFireActive = true;
                        }
                        let mult = item.multiplier || 1;
                        if (this.state.dumpsterFireActive) mult *= 2;
                        this.state.resources[targetType] += mult;
                        this.addXP(mult);
                    } else {
                        this.state.streak = 0;
                        this.state.dumpsterFireActive = false;
                        this.state.streakTimer = 0;
                    }
                    this.renderDumpsterFireBar();
                    this.updateUI();
                    this.renderHorizontalQueue();
                }
            }
        }

        addXP(amount) {
            this.state.xp += amount;
            const needed = this.state.level * 20;
            if (this.state.xp >= needed) {
                this.state.xp -= needed;
                this.state.level++;

                const lvlText = this.add.text(this.scale.width / 2, this.scale.height / 2, \`🎉 LEVEL UP! (\${this.state.level}) 🎉\`, {
                    fontSize: '26px', style: 'bold', color: '#ffd700', backgroundColor: '#000', padding: 14
                }).setOrigin(0.5).setDepth(30);

                if (this.tweens && this.tweens.add) {
                    this.tweens.add({ targets: lvlText, scale: 1.3, alpha: 0, duration: 1600, onComplete: () => lvlText.destroy() });
                } else {
                    lvlText.destroy();
                }
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
                        desc: \`Arrival: \${(this.state.customerSpawnChance * 100).toFixed(0)}%/s ➔ \${Math.min(100, (this.state.customerSpawnChance + 0.10) * 100).toFixed(0)}%/s (+10%)\`,
                        cost: '$' + this.state.upgrades.footTraffic.cost,
                        lvl: this.state.upgrades.footTraffic.lvl, max: 5, reqLvl: 2,
                        canAfford: this.state.money >= this.state.upgrades.footTraffic.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.footTraffic.cost;
                            this.state.customerSpawnChance = Math.min(1.0, this.state.customerSpawnChance + 0.10);
                            this.state.upgrades.footTraffic.lvl++;
                            this.state.upgrades.footTraffic.cost *= 2;
                        }
                    },
                    {
                        id: 'gateAuto',
                        name: 'Auto Gate Speed',
                        desc: !this.state.isGateAuto
                            ? 'Unlocks automated gate opening (1 Quest Token)'
                            : \`Interval: \${(this.state.autoGateSpeed / 1000).toFixed(1)}s ➔ \${(Math.max(200, this.state.autoGateSpeed - 600) / 1000).toFixed(1)}s (-0.6s)\`,
                        cost: !this.state.isGateAuto ? '1 Token' : ('$' + this.state.upgrades.gateAuto.cost),
                        lvl: this.state.upgrades.gateAuto.lvl, max: 8, reqLvl: 1,
                        canAfford: !this.state.isGateAuto ? this.state.questTokens >= 1 : this.state.money >= this.state.upgrades.gateAuto.cost,
                        action: () => {
                            if (!this.state.isGateAuto) {
                                this.state.questTokens -= 1;
                                this.state.isGateAuto = true;
                            } else {
                                this.state.money -= this.state.upgrades.gateAuto.cost;
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
            } else if (catKey === 'tip') {
                upgradeList = [
                    {
                        id: 'queueCap',
                        name: 'Queue Capacity (+1)',
                        desc: \`Cap: \${this.state.maxTrashQueue} ➔ \${this.state.maxTrashQueue + 1} (+1 trash slot)\`,
                        cost: '$' + this.state.upgrades.queueCap.cost,
                        lvl: this.state.upgrades.queueCap.lvl, max: 9, reqLvl: 1,
                        canAfford: this.state.money >= this.state.upgrades.queueCap.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.queueCap.cost;
                            this.state.maxTrashQueue++;
                            this.state.upgrades.queueCap.lvl++;
                            this.state.upgrades.queueCap.cost *= 2;
                        }
                    },
                    {
                        id: 'doubleToken',
                        name: 'Double Token Chance',
                        desc: \`Double chance: \${(this.state.doubleTokenChance * 100).toFixed(0)}% ➔ \${(this.state.doubleTokenChance * 100 + 2).toFixed(0)}% (+2%)\`,
                        cost: '$' + this.state.upgrades.doubleToken.cost,
                        lvl: this.state.upgrades.doubleToken.lvl, max: 5, reqLvl: 2,
                        canAfford: this.state.money >= this.state.upgrades.doubleToken.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.doubleToken.cost;
                            this.state.doubleTokenChance += 0.02;
                            this.state.upgrades.doubleToken.lvl++;
                            this.state.upgrades.doubleToken.cost *= 2;
                        }
                    },
                    {
                        id: 'autoQueue',
                        name: 'Auto-Queue Feeder',
                        desc: !this.state.unlockedAutoQueue
                            ? 'Unlocks automated queue drawer from tip'
                            : \`Speed: \${(this.state.autoQueueSpeed / 1000).toFixed(1)}s ➔ \${(Math.max(200, this.state.autoQueueSpeed - 350) / 1000).toFixed(1)}s (-0.35s)\`,
                        cost: '$' + this.state.upgrades.autoQueue.cost,
                        lvl: this.state.upgrades.autoQueue.lvl, max: 8, reqLvl: 2,
                        canAfford: this.state.money >= this.state.upgrades.autoQueue.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.autoQueue.cost;
                            if (!this.state.unlockedAutoQueue) this.state.unlockedAutoQueue = true;
                            else this.state.autoQueueSpeed = Math.max(200, this.state.autoQueueSpeed - 350);
                            this.state.upgrades.autoQueue.lvl++;
                            this.state.upgrades.autoQueue.cost *= 2;
                        }
                    },
                    {
                        id: 'sanitiser',
                        name: 'Sanitiser Station',
                        desc: 'Unlocks SANITISE button: Double (2X) or Quad (4X) head item tokens!',
                        cost: '5 Tokens',
                        lvl: this.state.upgrades.sanitiser.lvl, max: 1, reqLvl: 3,
                        canAfford: !this.state.unlockedSanitiser && this.state.questTokens >= 5,
                        action: () => {
                            this.state.questTokens -= 5;
                            this.state.unlockedSanitiser = true;
                            this.state.upgrades.sanitiser.lvl = 1;
                        }
                    },
                    {
                        id: 'autoSort',
                        name: 'Auto Sort (Right-to-Left, 8s)',
                        desc: 'Auto sorts right-most queue item every 8 seconds',
                        cost: '15 Tokens',
                        lvl: this.state.upgrades.autoSort.lvl, max: 5, reqLvl: 4,
                        canAfford: this.state.questTokens >= 15,
                        action: () => {
                            this.state.questTokens -= 15;
                            this.state.unlockedAutoSort = true;
                            this.state.upgrades.autoSort.lvl++;
                        }
                    },
                    // PET QUEUE HELPERS
                    {
                        id: 'petDog',
                        name: '🐶 Dog Helper',
                        desc: 'Button sweeps & cashes in ALL Paper (Blue) items from queue!',
                        cost: '$' + this.state.upgrades.petDog.cost,
                        lvl: this.state.pets.dog ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.dog && this.state.money >= this.state.upgrades.petDog.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petDog.cost;
                            this.state.pets.dog = true;
                            this.state.upgrades.petDog.lvl = 1;
                        }
                    },
                    {
                        id: 'petChicken',
                        name: '🐔 Chicken Helper',
                        desc: 'Button sweeps & cashes in ALL Organic (Green) items from queue!',
                        cost: '$' + this.state.upgrades.petChicken.cost,
                        lvl: this.state.pets.chicken ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.chicken && this.state.money >= this.state.upgrades.petChicken.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petChicken.cost;
                            this.state.pets.chicken = true;
                            this.state.upgrades.petChicken.lvl = 1;
                        }
                    },
                    {
                        id: 'petTurtle',
                        name: '🐢 Turtle Helper',
                        desc: 'Button sweeps & cashes in ALL Plastic (Yellow) items from queue!',
                        cost: '$' + this.state.upgrades.petTurtle.cost,
                        lvl: this.state.pets.turtle ? 1 : 0, max: 1, reqLvl: 2,
                        canAfford: !this.state.pets.turtle && this.state.money >= this.state.upgrades.petTurtle.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petTurtle.cost;
                            this.state.pets.turtle = true;
                            this.state.upgrades.petTurtle.lvl = 1;
                        }
                    },
                    {
                        id: 'petFlashlight',
                        name: '🔦 Torch Helper',
                        desc: 'Button sweeps & cashes in ALL Glass (Purple) items from queue!',
                        cost: '$' + this.state.upgrades.petFlashlight.cost,
                        lvl: this.state.pets.flashlight ? 1 : 0, max: 1, reqLvl: 3,
                        canAfford: !this.state.pets.flashlight && this.state.money >= this.state.upgrades.petFlashlight.cost,
                        action: () => {
                            this.state.money -= this.state.upgrades.petFlashlight.cost;
                            this.state.pets.flashlight = true;
                            this.state.upgrades.petFlashlight.lvl = 1;
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
                        }
                    }
                ];
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
            this.modalWalletTxt = this.add.text(boxLeft + boxW - 130, 18, '$' + this.state.money + ' | 🎟️' + this.state.questTokens, { fontSize: '11px', style: 'bold', color: '#00ff00' });
            this.modalContainer.add([title, this.modalWalletTxt]);

            let currY = 46;

            const isGateSel = (this.activeUpgradeCategory === 'gate');
            const hasGateAff = this.hasCategoryAffordable('gate');
            const btnGate = this.add.text(boxLeft + 12, currY, hasGateAff ? '🚪 Gate (!)' : '🚪 Gate', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isGateSel ? '#0288d1' : '#2b2b2b',
                color: isGateSel ? '#ffffff' : (hasGateAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnGate.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'gate'; this.openModal('upgrades', 'gate'); });
            this.modalContainer.add(btnGate);
            currY += 28;

            const isTipSel = (this.activeUpgradeCategory === 'tip');
            const hasTipAff = this.hasCategoryAffordable('tip');
            const btnTip = this.add.text(boxLeft + 12, currY, hasTipAff ? '🗑️ Tip/Queue (!)' : '🗑️ Tip/Queue', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isTipSel ? '#0288d1' : '#2b2b2b',
                color: isTipSel ? '#ffffff' : (hasTipAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnTip.on('pointerup', () => { this.upgradeScrollY = 0; this.activeUpgradeCategory = 'tip'; this.openModal('upgrades', 'tip'); });
            this.modalContainer.add(btnTip);
            currY += 28;

            const btnBinsHeader = this.add.text(boxLeft + 12, currY, this.binsSubmenuOpen ? '🚮 Bins ▼' : '🚮 Bins ▶', {
                fontSize: '11px', style: 'bold', backgroundColor: '#1e293b', color: '#ffca28', padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnBinsHeader.on('pointerup', () => {
                this.binsSubmenuOpen = !this.binsSubmenuOpen;
                this.openModal('upgrades', this.activeUpgradeCategory, true);
            });
            this.modalContainer.add(btnBinsHeader);
            currY += 26;

            if (this.binsSubmenuOpen) {
                const binCats = [
                    { id: 'organic_shop', typeId: 'organic', name: '🟢 Green Bin' },
                    { id: 'paper_shop', typeId: 'paper', name: '🔵 Paper Bin' },
                    { id: 'glass_shop', typeId: 'glass', name: '🟣 Glass Bin' },
                    { id: 'plastic_shop', typeId: 'plastic', name: '🟡 Plastic Bin' }
                ];
                if (this.state.unlockedTypes.metal) binCats.push({ id: 'metal_shop', typeId: 'metal', name: '⚪ Metal Bin' });
                if (this.state.unlockedTypes.fabric) binCats.push({ id: 'fabric_shop', typeId: 'fabric', name: '🌸 Fabric Bin' });

                binCats.forEach((bCat) => {
                    const isBinSel = (this.activeUpgradeCategory === bCat.id);
                    const hasBinAff = this.hasCategoryAffordable(bCat.id);
                    const subBtn = this.add.text(boxLeft + 22, currY, hasBinAff ? \`\${bCat.name} (!)\` : bCat.name, {
                        fontSize: '10.5px', style: 'bold',
                        backgroundColor: isBinSel ? '#0288d1' : '#334155',
                        color: isBinSel ? '#ffffff' : (hasBinAff ? '#ffd700' : '#cccccc'), padding: { x: 6, y: 3 }
                    }).setInteractive({ useHandCursor: true });

                    subBtn.on('pointerup', () => {
                        this.upgradeScrollY = 0;
                        this.activeUpgradeCategory = bCat.id;
                        this.openModal('upgrades', bCat.id);
                    });
                    this.modalContainer.add(subBtn);

                    // Add toggle ON/OFF switch if metal/fabric
                    if (bCat.typeId === 'metal' || bCat.typeId === 'fabric') {
                        const isActive = this.state.activeTypes[bCat.typeId];
                        const toggleBtn = this.add.text(boxLeft + sidebarW - 14, currY, isActive ? '[ON]' : '[OFF]', {
                            fontSize: '9px', style: 'bold',
                            backgroundColor: isActive ? '#00e676' : '#555555',
                            color: isActive ? '#000000' : '#ffffff', padding: 2
                        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

                        toggleBtn.on('pointerup', () => {
                            const activeCount = Object.keys(this.state.activeTypes).filter(k => this.state.activeTypes[k]).length;
                            if (isActive && activeCount <= 4) {
                                alert('⚠️ You must keep at least 4 active rubbish types!');
                                return;
                            }
                            this.state.activeTypes[bCat.typeId] = !isActive;
                            this.requestLayoutRebuild();
                            this.openModal('upgrades', this.activeUpgradeCategory, true);
                        });
                        this.modalContainer.add(toggleBtn);
                    }

                    currY += 24;
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

            upgradeList.forEach((uItem, idx) => {
                const uy = viewY + 6 + (idx * itemHeight);
                const isLevelMet = (this.state.level >= uItem.reqLvl);
                const isPrevUnlocked = (idx === 0) || (upgradeList[idx - 1].lvl > 0);

                if (!isLevelMet) {
                    const nameTxt = this.add.text(startX, uy + 6, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const lockBadge = this.add.text(boxLeft + boxW - 35, uy + 6, \`[ Requires Level \${uItem.reqLvl} ]\`, {
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

                        if (uItem.canAfford) {
                            btnBuy.on('pointerup', (pointer) => {
                                if (totalDragDistance > 8) return;
                                if (pointer.y < viewY || pointer.y > viewBottomY) return;
                                uItem.action();
                                if (this.modalWalletTxt) this.modalWalletTxt.setText('$' + this.state.money + ' | 🎟️' + this.state.questTokens);
                                this.requestLayoutRebuild();
                                this.openModal('upgrades', this.activeUpgradeCategory, true);
                            });
                        }
                        this.upgradeListContainer.add([infoTxt, btnBuy]);
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
                const spriteKey = TRASH_TYPES[t] ? TRASH_TYPES[t].sprite : 'person';
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

            // Background
            const bg = this.add.graphics();
            bg.fillStyle(0x0a0e17, 1);
            bg.fillRect(0, 0, w, h);
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

            // Bins Row
            const binY = h * 0.72;
            const binSpacing = Math.min(w / 4.6, 75);
            const startBinX = (w - (3 * binSpacing)) / 2;

            const bins = [
                { id: 'organic', key: '1', name: 'GREEN', color: 0x4caf50 },
                { id: 'paper', key: '2', name: 'PAPER', color: 0x2196f3 },
                { id: 'glass', key: '3', name: 'GLASS', color: 0x9c27b0 },
                { id: 'plastic', key: '4', name: 'PLAST', color: 0xffeb3b }
            ];

            bins.forEach((b, idx) => {
                const bx = startBinX + (idx * binSpacing);
                const bBox = this.add.graphics();
                bBox.fillStyle(b.color, 0.85);
                bBox.fillRoundedRect(bx - 26, binY - 26, 52, 52, 8);
                bBox.lineStyle(2, 0xffffff, 0.9);
                bBox.strokeRoundedRect(bx - 26, binY - 26, 52, 52, 8);

                const bLabel = this.add.text(bx, binY - 34, '[' + b.key + '] ' + b.name, {
                    fontSize: '11px', style: 'bold', color: '#ffffff'
                }).setOrigin(0.5);

                const hitZone = this.add.rectangle(bx, binY, 56, 56, 0x000000, 0.001).setInteractive({ useHandCursor: true });
                hitZone.on('pointerdown', () => this.sortArcadeTrash(b.id));

                this.arcadeContainer.add([bBox, bLabel, hitZone]);
            });

            // Keyboard binds
            this.arcadeKeyHandler = (event) => {
                if (!this.arcadeState || !this.arcadeState.active) return;
                if (event.key === '1') this.sortArcadeTrash('organic');
                else if (event.key === '2') this.sortArcadeTrash('paper');
                else if (event.key === '3') this.sortArcadeTrash('glass');
                else if (event.key === '4') this.sortArcadeTrash('plastic');
                else if (event.key === 'Escape') this.exitArcade();
            };
            window.addEventListener('keydown', this.arcadeKeyHandler);

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

                let sprite;
                if (this.textures.exists(item.spriteKey)) {
                    sprite = this.add.sprite(qx, queueCenterY, item.spriteKey);
                } else {
                    sprite = this.add.rectangle(qx, queueCenterY, 36, 36, TRASH_TYPES[item.type].color);
                }

                if (isHero) {
                    sprite.setScale(1.2);
                    const heroRing = this.add.graphics();
                    heroRing.lineStyle(3, 0xffd700, 1);
                    heroRing.strokeCircle(qx, queueCenterY, 28);
                    this.arcadeQueueContainer.add(heroRing);
                } else {
                    sprite.setScale(0.85);
                    sprite.setAlpha(0.65 - (idx * 0.07));
                }

                this.arcadeQueueContainer.add(sprite);
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
                this.arcadeState.queue.push({ type: nextType, spriteKey: TRASH_TYPES[nextType].sprite });

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

        updateUI() {
            if (this.hudTextObj) {
                const r = this.state.resources;
                const hasExtraTypes = (this.state.unlockedTypes.metal || this.state.unlockedTypes.fabric);
                let text = '💵 Cash: $' + this.state.money + '  |  🎟️ Tkns: ' + this.state.questTokens + '\\n' +
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
                this.modalWalletTxt.setText('$' + this.state.money + ' | 🎟️' + this.state.questTokens);
            }

            if (this.tipStockText) {
                this.tipStockText.setText('' + this.state.tipStockpile);
            }

            if (this.bins) {
                this.bins.forEach(b => {
                    if (b.countText && this.state.resources[b.id] !== undefined) {
                        b.countText.setText('' + this.state.resources[b.id]);
                    }
                });
            }

            if (this.tipSprite) {
                if (this.state.tipStockpile === 0) {
                    this.tipSprite.setAlpha(0.3);
                } else {
                    this.tipSprite.setAlpha(1);
                }
            }

            this.updateContractsUI();
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
