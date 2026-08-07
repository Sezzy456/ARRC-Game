const fs = require('fs');
const spritesData = JSON.parse(fs.readFileSync('sprites_data.json', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>ARRC Trash Tycoon - Progression & Tutorial</title>
    <script src="phaser.min.js"></script>
    <script>if (typeof Phaser === 'undefined') { document.write('<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"><\\/script>'); }</script>
    <style>
        * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: none; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; background-color: #121212; overflow: hidden; display: flex; justify-content: center; align-items: center; font-family: system-ui, -apple-system, sans-serif; }
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
            errDiv.style.fontFamily = 'monospace'; errDiv.style.zIndex = '999999'; errDiv.style.fontSize = '13px';
            errDiv.style.borderRadius = '6px'; errDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
            document.body.appendChild(errDiv);
        }
        errDiv.innerHTML = '<b>⚠️ GAME LOAD ERROR:</b><br>' + msg + '<br>Line: ' + lineNo + ' Col: ' + columnNo + (error && error.stack ? '<br><pre>' + error.stack + '</pre>' : '');
        return false;
    };

    const RUBBISH_SPRITES = ${JSON.stringify(spritesData, null, 2)};

    const TRASH_TYPES = {
        organic: { id: 'organic', name: 'Green', color: 0x4caf50, colorHex: '#4caf50', key: '1', items: ['Apple', 'Banana'], sprites: ['rubbish_green_apple', 'rubbish_green_banana'] },
        paper:   { id: 'paper',   name: 'Paper', color: 0x2196f3, colorHex: '#2196f3', key: '2', items: ['Box', 'Carton', 'Newspaper'], sprites: ['rubbish_paper_box', 'rubbish_paper_carton', 'rubbish_paper_news'] },
        glass:   { id: 'glass',   name: 'Glass', color: 0x9c27b0, colorHex: '#9c27b0', key: '3', items: ['Bottle'], sprites: ['rubbish_glass_bottle'] },
        plastic: { id: 'plastic', name: 'Yellow/Plastic', color: 0xffeb3b, colorHex: '#ffeb3b', key: '4', items: ['Cup'], sprites: ['rubbish_plastic_cup'] }
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
                customerSpawnChance: 0.30, // 30% chance per second
                spawnDelay: 1000,

                // Automation Timers
                isGateAuto: false,
                autoGateSpeed: 5000,
                autoGateTimer: 0,
                unlockedAutoQueue: false,
                autoQueueSpeed: 2500,
                autoQueueTimer: 0,
                unlockedAutoSort: false,
                autoSortDelay: 8000, // 8 seconds per auto-sort
                autoSortTimer: 0,

                // Sanitiser Station Stats
                unlockedSanitiser: false,
                sanitiserCooldown: 0, // In ms

                // Bus Rush Passive Unlocked
                busRushUnlocked: false,

                // Upgrades Tracker
                upgrades: {
                    gateFee: { lvl: 0, max: 10, cost: 2, reqLvl: 1 },
                    footTraffic: { lvl: 0, max: 5, cost: 5, reqLvl: 2 },
                    gateAuto: { lvl: 0, max: 5, cost: 1, reqLvl: 1 },
                    doubleTrash: { lvl: 0, max: 5, cost: 4, reqLvl: 2 },
                    busRush: { lvl: 0, max: 1, cost: 15, reqLvl: 4 },

                    queueCap: { lvl: 0, max: 9, cost: 2, reqLvl: 1 },
                    doubleToken: { lvl: 0, max: 5, cost: 8, reqLvl: 2 },
                    autoQueue: { lvl: 0, max: 5, cost: 5, reqLvl: 2 },
                    sanitiser: { lvl: 0, max: 1, cost: 5, reqLvl: 3 },
                    autoSort: { lvl: 0, max: 5, cost: 15, reqLvl: 4 }
                },

                // Bin Upgrades & Workshop Tier Unlocks
                binUpgrades: {
                    organic: { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    paper:   { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    glass:   { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 },
                    plastic: { bgUnlocked: false, shopUnlocked: false, t1Bought: false, tier2Unlocked: false, tier3Unlocked: false, reqLvlBg: 1, reqLvlShop: 1 }
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
                hasTrees: false,
                hasBunting: false,
                hasFairyLights: false,
                hasDiamonds: false,

                // Color Tokens & Crafted Items
                resources: { organic: 0, paper: 0, glass: 0, plastic: 0 },
                crafted: {
                    fertilizer: 0, biofuel: 0, compost: 0,
                    recycled_paper: 0, cardboard: 0, notebook: 0,
                    glass_vase: 0, mirror: 0, lens: 0,
                    filament: 0, plastic_brick: 0, pipe: 0
                }
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
        }

        preload() {
            this.createPlaceholderTextures();

            // Register Base64 textures directly to TextureManager to prevent Loader deadlock
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
        }

        create() {
            this.scale.on('resize', this.handleResize, this);
            this.generateQuests();
            this.buildLayout();

            for (let i = 0; i < 3; i++) this.spawnCustomer();

            // 1 Second Ticker (Session Time & Sanitiser Cooldown)
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

            // Keyboard Shortcuts: 1-4 for bins, Space for Tip, C for Gate, V for Sanitise, B for Bus Rush
            this.input.keyboard.on('keydown', (e) => {
                if (['1','2','3','4'].includes(e.key)) {
                    const typeMap = { '1': 'organic', '2': 'paper', '3': 'glass', '4': 'plastic' };
                    if (this.state.tutorial.active && this.state.tutorial.step === 2) {
                        this.state.tutorial.interactionMethod = 'free';
                    }
                    this.sortHeadTrash(typeMap[e.key], 0);
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

            // Customer Spawner Loop: Runs every 1 sec with 30% base chance (+upgrade)
            this.spawnerEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    if (Math.random() < this.state.customerSpawnChance) {
                        this.spawnCustomer();
                    }
                },
                loop: true
            });

            // Random Bus Rush Event Loop (Spawns randomly every 12-25s if unlocked)
            this.time.addEvent({
                delay: 12000,
                callback: () => {
                    if (this.state.busRushUnlocked && Math.random() < 0.45) {
                        this.triggerBusRushEvent();
                    }
                },
                loop: true
            });

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

            // Auto-Sort Loop (8 Seconds - Right-to-Left / Last Item in Queue)
            this.time.addEvent({
                delay: 50,
                callback: () => {
                    if (this.state.unlockedAutoSort && this.trashQueue.length > 0) {
                        this.state.autoSortTimer += 50;
                        const sortProgress = Math.min(1, this.state.autoSortTimer / this.state.autoSortDelay);
                        this.drawAutoSortProgress(sortProgress);
                        if (sortProgress >= 1) {
                            const lastIdx = this.trashQueue.length - 1;
                            this.sortHeadTrash(this.trashQueue[lastIdx].type, lastIdx);
                            this.state.autoSortTimer = 0;
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

        update(time, delta) {
            if (this.state && this.state.streakTimer > 0) {
                this.state.streakTimer = Math.max(0, this.state.streakTimer - delta);
                if (this.state.streakTimer <= 0) {
                    this.state.streak = 0;
                    this.state.dumpsterFireActive = false;
                }
                this.renderDumpsterFireBar();
            } else if (this.state && this.state.streak === 0) {
                this.renderDumpsterFireBar();
            }
        }

        renderDumpsterFireBar() {
            if (!this.dumpsterBarGfx) return;
            this.dumpsterBarGfx.clear();

            if (!this.bins || this.bins.length < 4) return;
            const startBinX = this.bins[0].x - 26;
            const endBinX = this.bins[3].x + 26;
            const barW = endBinX - startBinX;
            const barY = this.bins[0].y + 40;
            const barH = 8;

            if (this.state.streakTimer > 0) {
                const ratio = Math.min(1, Math.max(0, this.state.streakTimer / 2000));
                const currentWidth = barW * ratio;

                let colorHex = 0xffd700;
                if (this.state.dumpsterFireActive) colorHex = 0xff3d00;
                else if (ratio < 0.4) colorHex = 0xf44336;
                else if (ratio < 0.7) colorHex = 0xff9800;

                this.dumpsterBarGfx.fillStyle(0x222222, 0.8);
                this.dumpsterBarGfx.fillRect(startBinX, barY, barW, barH);
                this.dumpsterBarGfx.lineStyle(1, 0x444444, 1);
                this.dumpsterBarGfx.strokeRect(startBinX, barY, barW, barH);

                this.dumpsterBarGfx.fillStyle(colorHex, 1);
                this.dumpsterBarGfx.fillRect(startBinX, barY, currentWidth, barH);

                if (this.dumpsterStreakText) {
                    this.dumpsterStreakText.setText('streak: ' + this.state.streak + '\\nhigh score: ' + this.state.streakHighScore);
                    this.dumpsterStreakText.setVisible(true);
                }

                if (this.dumpsterFireBanner) {
                    this.dumpsterFireBanner.setVisible(this.state.dumpsterFireActive);
                }
            } else {
                if (this.dumpsterStreakText) this.dumpsterStreakText.setVisible(false);
                if (this.dumpsterFireBanner) this.dumpsterFireBanner.setVisible(false);
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
            if (!this.btnSanitiser || !this.btnSanitiser.active) return;
            const cdSecs = Math.ceil(this.state.sanitiserCooldown / 1000);
            this.btnSanitiser.setText(cdSecs > 0 ? ('🧪 SAN\\n(' + cdSecs + 's)') : '🧪\\nSAN');
            this.btnSanitiser.setStyle({
                backgroundColor: cdSecs > 0 ? '#424242' : '#2e7d32',
                color: cdSecs > 0 ? '#aaaaaa' : '#ffffff'
            });
        }

        triggerSanitiseAction() {
            if (!this.state.unlockedSanitiser || this.state.sanitiserCooldown > 0 || this.trashQueue.length === 0) return;
            const headItem = this.trashQueue[0];
            const currentMult = headItem.multiplier || 1;

            if (currentMult < 4) {
                const newMult = (currentMult === 1) ? 2 : 4;
                headItem.multiplier = newMult;

                const newContainer = this.createItemGraphic(headItem.type, '', newMult, headItem.spriteKey);
                newContainer.setPosition(headItem.container.x, headItem.container.y);
                headItem.container.destroy();
                headItem.container = newContainer;

                // Set 5-second cooldown
                this.state.sanitiserCooldown = 5000;
                this.updateSanitiserBtnUI();
                this.renderHorizontalQueue();
            }
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

            const busContainer = this.add.container(-110, y).setDepth(15);
            this.activeBusContainer = busContainer;
            
            const busGfx = this.add.graphics();
            busGfx.fillStyle(0xff6f00, 1);
            busGfx.fillRect(0, 0, 100, 32);
            busGfx.lineStyle(3, 0xffeb3b, 1);
            busGfx.strokeRect(0, 0, 100, 32);

            const labelText = this.add.text(50, 16, '🚌 BUS (B/+10)', {
                fontSize: '10px', style: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            busContainer.add([busGfx, labelText]);
            busContainer.setSize(100, 32);
            busContainer.setInteractive({ useHandCursor: true });

            let busClicked = false;

            const handleCashIn = () => {
                if (busClicked) return;
                busClicked = true;

                this.state.tipStockpile += 10;
                this.updateUI();

                const floatTxt = this.add.text(busContainer.x, busContainer.y - 20, '🚌 +10 RUBBISH! 🚌', {
                    fontSize: '18px', style: 'bold', color: '#ff9800', backgroundColor: '#000000', padding: 6
                }).setOrigin(0.5).setDepth(30);

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
            busContainer.on('pointerup', handleCashIn);

            // Bus moves slowly across screen over 9 seconds (9000ms)
            if (this.tweens && this.tweens.add) {
                this.tweens.add({
                    targets: busContainer,
                    x: w + 120,
                    duration: 9000,
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

            const poolTier2 = [
                { id_base: 't2_org', itemKey: 'organic', name: 'Green Tokens', isResource: true, req: 15, rewardCash: 35, color: '#4caf50' },
                { id_base: 't2_pap', itemKey: 'paper', name: 'Paper Tokens', isResource: true, req: 15, rewardCash: 35, color: '#2196f3' },
                { id_base: 't2_gla', itemKey: 'glass', name: 'Glass Tokens', isResource: true, req: 18, rewardCash: 45, color: '#9c27b0' },
                { id_base: 't2_pla', itemKey: 'plastic', name: 'Plastic Tokens', isResource: true, req: 18, rewardCash: 45, color: '#ffeb3b' },
                { id_base: 't2_bio', itemKey: 'biofuel', name: 'Biofuel', isResource: false, req: 2, rewardCash: 60, color: '#81c784' },
                { id_base: 't2_car', itemKey: 'cardboard', name: 'Cardboard', isResource: false, req: 2, rewardCash: 70, color: '#64b5f6' },
                { id_base: 't2_mir', itemKey: 'mirror', name: 'Mirror', isResource: false, req: 2, rewardCash: 70, color: '#ba68c8' },
                { id_base: 't2_bri', itemKey: 'plastic_brick', name: 'Plastic Brick', isResource: false, req: 2, rewardCash: 70, color: '#ffd54f' },
                { id_base: 't2_fer', itemKey: 'fertilizer', name: 'Fertilizer', isResource: false, req: 3, rewardCash: 40, color: '#81c784' },
                { id_base: 't2_rpap', itemKey: 'recycled_paper', name: 'Rec. Paper', isResource: false, req: 3, rewardCash: 45, color: '#64b5f6' },
                { id_base: 't2_vas', itemKey: 'glass_vase', name: 'Glass Vase', isResource: false, req: 3, rewardCash: 45, color: '#ba68c8' },
                { id_base: 't2_fil', itemKey: 'filament', name: '3D Filament', isResource: false, req: 3, rewardCash: 45, color: '#ffd54f' }
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
            if (candidates.length === 0) candidates = pool;

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

            this.renderDecorationsGraphics(width, logicalHeight);

            const topBarY = isMobile ? 30 : 35;
            const questY = topBarY + 85;

            if (this.state.tutorial.active && this.state.tutorial.step > 0) {
                this.renderTutorialBanner(width, questY + 105);
            }

            const workshopHeaderY = questY + (this.state.tutorial.active ? 195 : 95);
            const conveyorY = workshopHeaderY + 24;
            const workshopY = conveyorY + 45;

            const bottomY = isMobile ? logicalHeight - 190 : logicalHeight - 135;
            const binY = bottomY - 78;
            const queueY = binY - 72;

            const binSpacing = Math.min(width * 0.22, 95);
            const startBinX = (width - (binSpacing * 3)) / 2;

            this.renderCenteredXPBar(width, topBarY);
            this.renderTopHUDBar(width, topBarY, isMobile);
            this.createTopNavButtons(width);

            // 1. QUESTS BOARD
            const questTitle = this.state.tutorial.active ? '📜 TUTORIAL QUESTS 📜' : ('📜 QUESTS (Tier ' + this.state.questTier + ') 📜');
            const questHeader = this.add.text(width / 2 - 80, questY - 38, questTitle, { fontSize: '14px', style: 'bold', color: '#ffca28' }).setOrigin(0.5);
            const tokenBadge = this.add.text(width / 2 + 95, questY - 38, '🎟️ ' + this.state.questTokens + ' QUEST TOKENS', {
                fontSize: '12.5px', style: 'bold', color: '#ffd700', backgroundColor: '#1e293b', padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            this.mainContainer.add([questHeader, tokenBadge]);
            this.renderContractsUI(width, questY);

            // 2. WORKSHOPS
            if (!this.state.tutorial.active) {
                if (this.state.unlockedWorkshopsFacility) {
                    const shopHeader = this.add.text(width / 2, workshopHeaderY, '🛠️ WORKSHOPS 🛠️', { fontSize: '16px', style: 'bold', color: '#4fc3f7' }).setOrigin(0.5);
                    this.mainContainer.add(shopHeader);
                    this.renderConveyorHUD(width, conveyorY);
                    this.renderWorkshopsUI(width, logicalHeight, workshopY);
                } else {
                    const canAffordFacility = this.state.questTokens >= 10;
                    const btnUnlockFacility = this.add.text(width / 2, workshopHeaderY + 20, '🛠️ BUY WORKSHOPS (10 Quest Tokens) 🛠️', {
                        fontSize: '12.5px', style: 'bold',
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

            this.queueCounterText = this.add.text(width * 0.72, queueY, \`0/\${this.state.maxTrashQueue}\`, { fontSize: '14px', color: '#00ff00', style: 'bold' }).setOrigin(0.5);
            
            this.queueHighlight = this.add.graphics();
            this.queueHighlight.lineStyle(3, 0xffd700, 1);
            this.queueHighlight.strokeRect(-28, -28, 56, 56);
            this.queueHighlight.setVisible(false);

            const hasQueueUpgrade = this.hasCategoryAffordable('tip');
            const btnCapText = hasQueueUpgrade ? '▲ Queue Upgrades (!)' : '▲ Queue Upgrades';

            this.btnUpgradeCap = this.add.text(width * 0.88, queueY, btnCapText, {
                fontSize: '11px', style: 'bold',
                backgroundColor: hasQueueUpgrade ? '#ff9800' : '#333333',
                color: hasQueueUpgrade ? '#000000' : '#ffffff', padding: { x: 6, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.btnUpgradeCap.on('pointerup', () => {
                this.openModal('upgrades', 'tip');
            });

            // SANITISER BUTTON: Square-shaped button positioned higher up above head item (queueY - 68)
            if (this.state.unlockedSanitiser && this.trashQueue.length > 0) {
                const cdSecs = Math.ceil(this.state.sanitiserCooldown / 1000);
                const btnLabel = cdSecs > 0 ? ('🧪 SAN\\n(' + cdSecs + 's)') : '🧪\\nSAN';

                this.btnSanitiser = this.add.text(startBinX, queueY - 68, btnLabel, {
                    fontSize: '11px', style: 'bold', align: 'center',
                    backgroundColor: cdSecs > 0 ? '#424242' : '#2e7d32',
                    color: cdSecs > 0 ? '#aaaaaa' : '#ffffff', padding: { x: 10, y: 8 }
                }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

                this.btnSanitiser.on('pointerup', () => {
                    this.triggerSanitiseAction();
                });
                this.mainContainer.add(this.btnSanitiser);
            }

            this.mainContainer.add([this.queueCounterText, this.btnUpgradeCap, this.queueHighlight]);

            // 4. BINS
            this.bins = [];
            const binData = [
                { id: 'organic', key: '1', name: 'GREEN', sprite: 'bin_green', count: this.state.resources.organic },
                { id: 'paper', key: '2', name: 'PAPER', sprite: 'bin_blue', count: this.state.resources.paper },
                { id: 'glass', key: '3', name: 'GLASS', sprite: 'bin_purple', count: this.state.resources.glass },
                { id: 'plastic', key: '4', name: 'PLAST', sprite: 'bin_yellow', count: this.state.resources.plastic }
            ];

            binData.forEach((b, idx) => {
                const bx = startBinX + (idx * binSpacing);
                const sprite = this.add.sprite(bx, binY, b.sprite).setInteractive({ useHandCursor: true });
                const label = this.add.text(bx, binY - 32, \`[\${b.key}] \${b.name}\`, { fontSize: '11px', color: '#fff', style: 'bold' }).setOrigin(0.5);
                const countText = this.add.text(bx, binY + 4, \`\${b.count}\`, { fontSize: '15px', color: '#000000', style: 'bold' }).setOrigin(0.5);

                const hasAffordableBinUp = this.hasCategoryAffordable(b.id + '_shop');
                const btnBinUp = this.add.text(bx, binY + 28, hasAffordableBinUp ? '▲ (!)' : '▲', {
                    fontSize: '12px', style: 'bold', color: '#ffd700', backgroundColor: '#222', padding: {x: 6, y: 2}
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                btnBinUp.on('pointerup', () => {
                    this.openModal('upgrades', b.id + '_shop');
                });

                const binHighlightGfx = this.add.graphics();
                binHighlightGfx.lineStyle(3, 0xffd700, 1);
                binHighlightGfx.strokeRect(bx - 26, binY - 26, 52, 52);
                binHighlightGfx.setVisible(false);

                sprite.on('pointerdown', () => this.sortHeadTrash(b.id, 0));
                this.bins.push({ sprite, id: b.id, x: bx, y: binY, countText, highlightGfx: binHighlightGfx, btnBinUp });
                this.mainContainer.add([sprite, label, countText, btnBinUp, binHighlightGfx]);
            });

            // Dumpster Fire Bar Setup directly under bins (binY + 44)
            this.dumpsterBarGfx = this.add.graphics();
            const barStartX = this.bins[0].x - 26;
            const barEndX = this.bins[3].x + 26;
            const barCenter = (barStartX + barEndX) / 2;

            this.dumpsterStreakText = this.add.text(barEndX + 8, binY + 22, '', {
                fontSize: '10px', style: 'bold', color: '#ffca28'
            }).setOrigin(0, 0);

            this.dumpsterFireBanner = this.add.text(barCenter, binY + 54, '🔥 DUMPSTER FIRE (2X TOKENS) 🔥', {
                fontSize: '11px', style: 'bold', color: '#ffffff', backgroundColor: '#ff3d00', padding: { x: 8, y: 2 }
            }).setOrigin(0.5).setVisible(false);

            this.mainContainer.add([this.dumpsterBarGfx, this.dumpsterStreakText, this.dumpsterFireBanner]);

            // 5. GATE & TIP
            this.gatePos = { x: width * 0.35, y: bottomY };
            this.tipPos = { x: width * 0.65, y: bottomY };

            this.gateSprite = this.add.sprite(this.gatePos.x, this.gatePos.y, 'gate').setInteractive({ useHandCursor: true }).setDepth(1);
            this.gateText = this.add.text(this.gatePos.x, bottomY - 40, 'GATE [C]', { fontSize: '11px', color: '#00ff00', style: 'bold' }).setOrigin(0.5);

            const hasGateAffordable = this.hasCategoryAffordable('gate');
            const btnGateUpArrow = this.add.text(this.gatePos.x + 45, bottomY - 18, hasGateAffordable ? '▲ (!)' : '▲', {
                fontSize: '13px', style: 'bold', color: '#ffd700', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                this.openModal('upgrades', 'gate');
            });

            this.autoGateGfx = this.add.graphics();
            this.autoQueueGfx = this.add.graphics();
            this.autoSortGfx = this.add.graphics();
            this.longPressGfx = this.add.graphics().setDepth(10);
            this.tutorialIndicatorsGfx = this.add.graphics().setDepth(25);

            this.setupLongPress(this.gateSprite, 'gate');

            this.tipSprite = this.add.sprite(this.tipPos.x, this.tipPos.y, 'tip').setInteractive({ useHandCursor: true });
            this.tipLabel = this.add.text(this.tipPos.x, bottomY + 38, 'THE TIP [SPACE]', { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
            
            const hasTipAffordable = this.hasCategoryAffordable('tip');
            const btnTipUpArrow = this.add.text(this.tipPos.x + 45, bottomY - 18, hasTipAffordable ? '▲ (!)' : '▲', {
                fontSize: '13px', style: 'bold', color: '#ffd700', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => {
                this.openModal('upgrades', 'tip');
            });

            this.tipStockText = this.add.text(this.tipPos.x, bottomY, \`\${this.state.tipStockpile}\`, { fontSize: '18px', color: '#000000', style: 'bold' }).setOrigin(0.5);

            this.setupLongPress(this.tipSprite, 'tip');

            this.mainContainer.add([
                this.gateSprite, this.gateText, btnGateUpArrow, this.autoGateGfx, this.autoQueueGfx, this.autoSortGfx,
                this.tipSprite, this.tipLabel, btnTipUpArrow, this.tipStockText, this.longPressGfx, this.tutorialIndicatorsGfx
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
                if (this.btnUpgradeCap) {
                    this.tutorialIndicatorsGfx.strokeRect(this.btnUpgradeCap.x - 45, this.btnUpgradeCap.y - 12, 90, 24);
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

        renderDecorationsGraphics(w, h) {
            if (this.state.hasBunting) {
                const gfx = this.add.graphics();
                const colors = [0x2196f3, 0xff1744, 0xffeb3b, 0x4caf50];
                let cIdx = 0;
                for (let x = 15; x < w - 20; x += 25) {
                    gfx.fillStyle(colors[cIdx % 4], 1);
                    gfx.fillTriangle(x, 32, x + 20, 32, x + 10, 50);
                    cIdx++;
                }
                this.mainContainer.add(gfx);
            }

            if (this.state.hasTrees) {
                const gfx = this.add.graphics();
                for (let x = 10; x < w; x += 30) {
                    gfx.fillStyle(0x2e7d32, 1);
                    gfx.fillRect(x, 5, 14, 22);
                    gfx.fillRect(x, h - 27, 14, 22);
                }
                this.mainContainer.add(gfx);
            }

            if (this.state.hasFairyLights) {
                const gfx = this.add.graphics();
                const lightCols = [0xffeb3b, 0x00e676, 0x2196f3, 0xe91e63];
                for (let x = 20; x < w - 20; x += 18) {
                    const col = lightCols[Math.floor(x / 18) % 4];
                    gfx.fillStyle(col, 0.9);
                    gfx.fillCircle(x, 8, 4);
                }
                this.mainContainer.add(gfx);
            }

            if (this.state.hasDiamonds) {
                const gfx = this.add.graphics();
                gfx.fillStyle(0x00e5ff, 0.8);
                gfx.fillTriangle(20, h / 2, 28, h / 2 - 8, 36, h / 2);
                gfx.fillTriangle(20, h / 2, 28, h / 2 + 8, 36, h / 2);

                gfx.fillTriangle(w - 36, h / 2, w - 28, h / 2 - 8, w - 20, h / 2);
                gfx.fillTriangle(w - 36, h / 2, w - 28, h / 2 + 8, w - 20, h / 2);
                this.mainContainer.add(gfx);
            }
        }

        renderContractsUI(w, y) {
            const cardW = Math.min(w * 0.28, 125);
            const cardH = 75;
            const gap = 12;
            const startX = (w - (this.contracts.length * cardW + (this.contracts.length - 1) * gap)) / 2 + (cardW / 2);

            this.questCardPositions = [];

            this.contracts.forEach((c, idx) => {
                if (!c) return;
                const cx = startX + (idx * (cardW + gap));
                this.questCardPositions.push({ x: cx, y: y });

                if (c.isTutorial) {
                    const isDone = (c.currentVal >= c.req);
                    const cardBg = this.add.graphics();
                    cardBg.fillStyle(isDone ? 0x1b5e20 : 0x1e293b, 0.95);
                    cardBg.fillRect(cx - (cardW/2), y - 24, cardW, cardH);
                    cardBg.lineStyle(2, isDone ? 0x00e676 : 0xffd700, 1);
                    cardBg.strokeRect(cx - (cardW/2), y - 24, cardW, cardH);

                    const txt = this.add.text(cx, y - 4, c.name + '\\nProgress: (' + c.currentVal + '/' + c.req + ')', {
                        fontSize: '10.5px', style: 'bold', color: c.color || '#ffffff', align: 'center', wordWrap: { width: cardW - 8 }
                    }).setOrigin(0.5);

                    const btnText = isDone ? '[ COMPLETE ]' : ('(' + c.currentVal + '/' + c.req + ')');
                    const btnStatus = this.add.text(cx, y + 24, btnText, {
                        fontSize: '9.5px', style: 'bold',
                        backgroundColor: isDone ? '#00e676' : '#334155',
                        color: isDone ? '#000' : '#ffd700', padding: {x: 5, y: 2}
                    }).setOrigin(0.5);

                    const cardHitZone = this.add.zone(cx, y + 13, cardW, cardH).setOrigin(0.5);

                    if (isDone) {
                        cardHitZone.setInteractive({ useHandCursor: true }).on('pointerup', () => {
                            this.state.questTokens += 1;
                            if (c.onComplete) c.onComplete();
                        });
                    }

                    this.mainContainer.add([cardBg, txt, btnStatus, cardHitZone]);
                } else {
                    const current = c.isResource ? (this.state.resources[c.itemKey] || 0) : (this.state.crafted[c.itemKey] || 0);
                    const canFulfill = current >= c.req;
                    const outlineColor = Phaser.Display.Color.ValueToColor(c.color).color;

                    const cardBg = this.add.graphics();
                    cardBg.fillStyle(canFulfill ? 0x1b5e20 : 0x222222, 0.95);
                    cardBg.fillRect(cx - (cardW/2), y - 24, cardW, cardH);
                    cardBg.lineStyle(2, outlineColor, 1);
                    cardBg.strokeRect(cx - (cardW/2), y - 24, cardW, cardH);

                    const txt = this.add.text(cx, y - 4, c.req + ' ' + c.name + '\\n(+$' + c.rewardCash + ' | +' + (c.rewardTokens || 1) + ' Tkn)', {
                        fontSize: '10.5px', style: 'bold', color: c.color, align: 'center', wordWrap: { width: cardW - 8 }
                    }).setOrigin(0.5);
                    
                    const btnHandIn = this.add.text(cx, y + 24, canFulfill ? '[ TURN IN ]' : ('(' + current + '/' + c.req + ')'), {
                        fontSize: '10px', style: 'bold', backgroundColor: canFulfill ? '#00e676' : '#424242', color: canFulfill ? '#000' : '#aaa', padding: {x: 5, y: 2}
                    }).setOrigin(0.5);

                    const cardHitZone = this.add.zone(cx, y + 13, cardW, cardH).setOrigin(0.5);

                    if (canFulfill) {
                        cardHitZone.setInteractive({ useHandCursor: true }).on('pointerup', () => {
                            if (c.isResource) this.state.resources[c.itemKey] -= c.req;
                            else this.state.crafted[c.itemKey] -= c.req;

                            this.state.money += c.rewardCash;
                            this.state.questTokens += (c.rewardTokens || 1);
                            this.state.totalQuestsCompleted++;
                            this.state.tutorial.questCompletedCount++;

                            // QUEST TIER PROGRESSION REQUIREMENTS:
                            // Tier 0 -> Tier 1: 3 Quest Tokens
                            // Tier 1 -> Tier 2: 15 Completed Quests Total
                            // Tier 2 -> Tier 3: 30 Completed Quests Total
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
                        });
                    }

                    this.mainContainer.add([cardBg, txt, btnHandIn, cardHitZone]);
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
                    id: 'plastic', name: 'PLAST SHOP', color: '#f57f17',
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
                startX = sidePadding + (boxW / 2);
            } else {
                const maxTotalW = Math.min(w - 40, 850); gap = 18;
                boxW = Math.floor((maxTotalW - (3 * gap)) / 4);
                startX = (w - maxTotalW) / 2 + (boxW / 2);
            }

            const boxH = 90;

            shops.forEach((s, idx) => {
                let sx, sy;
                if (isMobile) {
                    sx = (idx % 2 === 0) ? startX : startX + boxW + gap;
                    sy = y + (Math.floor(idx / 2) * 100);
                } else {
                    sx = startX + (idx * (boxW + gap));
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
            const mins = Math.floor(this.state.sessionSeconds / 60).toString().padStart(2, '0');
            const secs = (this.state.sessionSeconds % 60).toString().padStart(2, '0');

            const textY = isMobile ? topBarY + 28 : 12;
            const r = this.state.resources;
            const tokensStr = \`🟢G:\${r.organic}  🔵P:\${r.paper}  🟣Gl:\${r.glass}  🟡Pl:\${r.plastic}\`;

            this.hudTextObj = this.add.text(14, textY, \`CASH: \$\${this.state.money} | 🎟️QUEST TKNS: \${this.state.questTokens}\nTOKENS: \${tokensStr}\`, {
                fontSize: '11px', style: 'bold', color: '#00ff00', fontFamily: 'monospace', lineSpacing: 3
            });

            this.mainContainer.add(this.hudTextObj);
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
            const targetX = this.queueStartX + (lastIdx * 56);
            const targetY = this.queueY;
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
            const btnDecor = this.add.text(w - 14, 12, '🪴 DECOR', { fontSize: '11px', style: 'bold', color: '#a5d6a7', backgroundColor: '#222', padding: { x: 6, y: 4 } })
                .setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openModal('decorations'));

            const hasAnyAfford = this.hasCategoryAffordable('gate') || this.hasCategoryAffordable('tip') || this.hasCategoryAffordable('organic_shop');
            this.btnUpgrades = this.add.text(w - 14, 40, hasAnyAfford ? '🛠️ UPGRADES (!)' : '🛠️ UPGRADES', { fontSize: '11px', style: 'bold', color: '#4fc3f7', backgroundColor: '#222', padding: { x: 6, y: 4 } })
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
                        circleGfx.lineStyle(4, 0x000000, 1);
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
                        circleGfx.lineStyle(5, 0x000000, 1);
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
                    circleGfx.lineStyle(6, 0x000000, 1);
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

            const keys = Object.keys(TRASH_TYPES);
            const typeKey = keys[Math.floor(Math.random() * keys.length)];
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
            this.queueCounterText.setText(\`\${this.trashQueue.length}/\${cap}\`);

            const gap = 56;

            this.trashQueue.forEach((item, index) => {
                const targetX = this.queueStartX + (index * gap);
                let itemAlpha = 1;
                if (index >= 6) itemAlpha = Math.max(0.15, 1 - ((index - 5) * 0.3));

                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: item.container,
                        x: targetX,
                        y: this.queueY,
                        alpha: itemAlpha,
                        duration: 100
                    });
                } else {
                    item.container.x = targetX;
                    item.container.y = this.queueY;
                    item.container.alpha = itemAlpha;
                }

                if (index === 0) {
                    this.queueHighlight.setVisible(true);
                    this.queueHighlight.setPosition(targetX, this.queueY);

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
                        item.container.x = dragX; item.container.y = dragY;
                    });

                    item.container.on('dragend', () => {
                        this.bins.forEach(b => b.highlightGfx.setVisible(false));
                        this.draggedItem = null;

                        let droppedBin = null;
                        this.bins.forEach(b => {
                            if (Phaser.Math.Distance.Between(item.container.x, item.container.y, b.x, b.y) < 48) droppedBin = b;
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

            if (!isCorrect && this.state.tutorial.active) {
                // In tutorial: return item to hero spot, shake, flash red, do not deduct rubbish
                this.trashQueue.unshift(item);
                this.renderHorizontalQueue();

                if (this.cameras && this.cameras.main) this.cameras.main.flash(120, 255, 0, 0);
                this.wrongBinTipShake = 10;
                if (this.tweens && this.tweens.add) {
                    this.tweens.add({
                        targets: this,
                        wrongBinTipShake: 0,
                        duration: 800,
                        onUpdate: () => this.requestLayoutRebuild()
                    });
                }
                this.requestLayoutRebuild();
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

                                if (this.state.tutorial.active && this.state.tutorial.step === 2) {
                                    this.state.tutorial.sortProgress++;
                                    this.generateQuests();
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
                            } else {
                                this.state.streak = 0;
                                this.state.dumpsterFireActive = false;
                                this.state.streakTimer = 0;
                                if (this.cameras && this.cameras.main) this.cameras.main.flash(120, 255, 0, 0);
                            }
                            this.renderDumpsterFireBar();
                            this.requestLayoutRebuild();
                        }
                    });
                } else {
                    item.container.destroy();
                    if (isCorrect) {
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
                    this.requestLayoutRebuild();
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
            if (this.modalContainer) {
                this.modalContainer.destroy(true);
                this.modalContainer = null;
            }
            this.activeModal = null;
        }

        openModal(type, targetCategory = 'gate') {
            this.activeModal = type;
            this.activeUpgradeCategory = targetCategory;

            if (this.state.tutorial.active && this.state.tutorial.step === 4) {
                this.state.tutorial.visitedCategoriesSet.add(targetCategory);
                this.generateQuests();
                this.requestLayoutRebuild();
            }

            this.closeModal();

            const w = this.scale.width; 
            const h = this.scale.height;
            const boxW = Math.min(w * 0.94, 520);
            const modalH = h * 0.58;

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
                    { id: 'gateFee', name: 'Gate Fee (+$1)', desc: 'Increases cash per customer', cost: '$' + this.state.upgrades.gateFee.cost, lvl: this.state.upgrades.gateFee.lvl, max: 10, reqLvl: 1, canAfford: this.state.money >= this.state.upgrades.gateFee.cost, action: () => { this.state.money -= this.state.upgrades.gateFee.cost; this.state.g1Fee++; this.state.upgrades.gateFee.lvl++; this.state.upgrades.gateFee.cost *= 2; } },
                    { id: 'footTraffic', name: 'Foot Traffic (+10%)', desc: 'Increases customer arrival chance per sec', cost: '$' + this.state.upgrades.footTraffic.cost, lvl: this.state.upgrades.footTraffic.lvl, max: 5, reqLvl: 2, canAfford: this.state.money >= this.state.upgrades.footTraffic.cost, action: () => { this.state.money -= this.state.upgrades.footTraffic.cost; this.state.customerSpawnChance = Math.min(1.0, this.state.customerSpawnChance + 0.10); this.state.upgrades.footTraffic.lvl++; this.state.upgrades.footTraffic.cost *= 2; } },
                    { id: 'gateAuto', name: 'Auto Gate', desc: 'Auto opens gate on timer', cost: !this.state.isGateAuto ? '1 Token' : ('$' + this.state.upgrades.gateAuto.cost), lvl: this.state.upgrades.gateAuto.lvl, max: 5, reqLvl: 3, canAfford: !this.state.isGateAuto ? this.state.questTokens >= 1 : this.state.money >= this.state.upgrades.gateAuto.cost, action: () => { if (!this.state.isGateAuto) { this.state.questTokens -= 1; this.state.isGateAuto = true; } else { this.state.money -= this.state.upgrades.gateAuto.cost; this.state.autoGateSpeed = Math.max(1000, this.state.autoGateSpeed - 400); this.state.upgrades.gateAuto.cost *= 2; } this.state.upgrades.gateAuto.lvl++; } },
                    { id: 'doubleTrash', name: 'Double Rubbish Chance', desc: '+10% chance for double stock', cost: '$' + this.state.upgrades.doubleTrash.cost, lvl: this.state.upgrades.doubleTrash.lvl, max: 5, reqLvl: 2, canAfford: this.state.money >= this.state.upgrades.doubleTrash.cost, action: () => { this.state.money -= this.state.upgrades.doubleTrash.cost; this.state.doubleTrashChance += 0.10; this.state.upgrades.doubleTrash.lvl++; this.state.upgrades.doubleTrash.cost *= 2; } },
                    { id: 'busRush', name: 'Bus Rush Event', desc: 'Unlocks random orange bus events (Tap for +10 Rubbish!)', cost: '$' + this.state.upgrades.busRush.cost, lvl: this.state.upgrades.busRush.lvl, max: 1, reqLvl: 4, canAfford: this.state.money >= this.state.upgrades.busRush.cost, action: () => { this.state.money -= this.state.upgrades.busRush.cost; this.state.upgrades.busRush.lvl = 1; this.state.busRushUnlocked = true; } }
                ];
            } else if (catKey === 'tip') {
                upgradeList = [
                    { id: 'queueCap', name: 'Queue Capacity (+1)', desc: 'Max capacity: ' + this.state.maxTrashQueue, cost: '$' + this.state.upgrades.queueCap.cost, lvl: this.state.upgrades.queueCap.lvl, max: 9, reqLvl: 1, canAfford: this.state.money >= this.state.upgrades.queueCap.cost, action: () => { this.state.money -= this.state.upgrades.queueCap.cost; this.state.maxTrashQueue++; this.state.upgrades.queueCap.lvl++; this.state.upgrades.queueCap.cost *= 2; } },
                    { id: 'doubleToken', name: 'Chance for Double Token', desc: 'Current chance: ' + (this.state.doubleTokenChance * 100).toFixed(0) + '%', cost: '$' + this.state.upgrades.doubleToken.cost, lvl: this.state.upgrades.doubleToken.lvl, max: 5, reqLvl: 2, canAfford: this.state.money >= this.state.upgrades.doubleToken.cost, action: () => { this.state.money -= this.state.upgrades.doubleToken.cost; this.state.doubleTokenChance += 0.02; this.state.upgrades.doubleToken.lvl++; this.state.upgrades.doubleToken.cost *= 2; } },
                    { id: 'autoQueue', name: 'Auto-Queue Feeder', desc: 'Auto draws trash into queue', cost: '$' + this.state.upgrades.autoQueue.cost, lvl: this.state.upgrades.autoQueue.lvl, max: 5, reqLvl: 2, canAfford: this.state.money >= this.state.upgrades.autoQueue.cost, action: () => { this.state.money -= this.state.upgrades.autoQueue.cost; if (!this.state.unlockedAutoQueue) this.state.unlockedAutoQueue = true; else this.state.autoQueueSpeed = Math.max(600, this.state.autoQueueSpeed - 350); this.state.upgrades.autoQueue.lvl++; this.state.upgrades.autoQueue.cost *= 2; } },
                    { id: 'sanitiser', name: 'Sanitiser Station', desc: 'Unlocks SANITISE button (Doubles/Quads head item, 5s CD)', cost: '5 Tokens', lvl: this.state.upgrades.sanitiser.lvl, max: 1, reqLvl: 3, canAfford: !this.state.unlockedSanitiser && this.state.questTokens >= 5, action: () => { this.state.questTokens -= 5; this.state.unlockedSanitiser = true; this.state.upgrades.sanitiser.lvl = 1; } },
                    { id: 'autoSort', name: 'Auto Sort (Right-to-Left, 8s)', desc: 'Auto sorts right-most item every 8 sec', cost: '15 Tokens', lvl: this.state.upgrades.autoSort.lvl, max: 5, reqLvl: 4, canAfford: this.state.questTokens >= 15, action: () => { this.state.questTokens -= 15; this.state.unlockedAutoSort = true; this.state.upgrades.autoSort.lvl++; } }
                ];
            } else {
                const bId = catKey.split('_')[0];
                const bUp = this.state.binUpgrades[bId];
                const typeData = TRASH_TYPES[bId];

                upgradeList = [
                    { id: 'bgUnlocked', name: 'Lvl 1: Sprite Colored Background', desc: '10px black border circle behind item', cost: '10 ' + typeData.name + ' Tokens', lvl: bUp.bgUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.bgUnlocked && this.state.resources[bId] >= 10, action: () => { this.state.resources[bId] -= 10; bUp.bgUnlocked = true; } },
                    { id: 'shopUnlocked', name: 'Lvl 2: Unlock Workshop (Tier 1)', desc: 'Unlocks T1 craftables', cost: '$5 + 5 ' + typeData.name + ' Tokens', lvl: bUp.shopUnlocked ? 1 : 0, max: 1, reqLvl: 1, canAfford: !bUp.shopUnlocked && this.state.money >= 5 && this.state.resources[bId] >= 5, action: () => { this.state.money -= 5; this.state.resources[bId] -= 5; bUp.shopUnlocked = true; this.state.unlockedWorkshopsFacility = true; } },
                    { id: 'tier2Unlocked', name: 'Lvl 3: Unlock Tier 2 Items', desc: 'Unlocks Tier 2 craftable items in shop', cost: '$10 + 10 ' + typeData.name + ' Tokens', lvl: bUp.tier2Unlocked ? 1 : 0, max: 1, reqLvl: 2, canAfford: bUp.shopUnlocked && !bUp.tier2Unlocked && this.state.money >= 10 && this.state.resources[bId] >= 10, action: () => { this.state.money -= 10; this.state.resources[bId] -= 10; bUp.tier2Unlocked = true; } },
                    { id: 'tier3Unlocked', name: 'Lvl 4: Unlock Tier 3 Items', desc: 'Unlocks Tier 3 craftable items in shop', cost: '$15 + 15 ' + typeData.name + ' Tokens', lvl: bUp.tier3Unlocked ? 1 : 0, max: 1, reqLvl: 3, canAfford: bUp.tier2Unlocked && !bUp.tier3Unlocked && this.state.money >= 15 && this.state.resources[bId] >= 15, action: () => { this.state.money -= 15; this.state.resources[bId] -= 15; bUp.tier3Unlocked = true; } }
                ];
            }
            return upgradeList;
        }

        // STRICT ACCURACY FOR '!' NOTIFICATION BADGE:
        // Returns true ONLY IF an upgrade is level-met, previous-unlocked, not maxed out, AND player CAN AFFORD IT!
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
            const walletTxt = this.add.text(boxLeft + boxW - 130, 18, '$' + this.state.money + ' | 🎟️' + this.state.questTokens, { fontSize: '11px', style: 'bold', color: '#00ff00' });
            this.modalContainer.add([title, walletTxt]);

            let currY = 46;

            const isGateSel = (this.activeUpgradeCategory === 'gate');
            const hasGateAff = this.hasCategoryAffordable('gate');
            const btnGate = this.add.text(boxLeft + 12, currY, hasGateAff ? '🚪 Gate (!)' : '🚪 Gate', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isGateSel ? '#0288d1' : '#2b2b2b',
                color: isGateSel ? '#ffffff' : (hasGateAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnGate.on('pointerup', () => { this.activeUpgradeCategory = 'gate'; this.openModal('upgrades', 'gate'); });
            this.modalContainer.add(btnGate);
            currY += 28;

            const isTipSel = (this.activeUpgradeCategory === 'tip');
            const hasTipAff = this.hasCategoryAffordable('tip');
            const btnTip = this.add.text(boxLeft + 12, currY, hasTipAff ? '🗑️ Tip/Queue (!)' : '🗑️ Tip/Queue', {
                fontSize: '11px', style: 'bold',
                backgroundColor: isTipSel ? '#0288d1' : '#2b2b2b',
                color: isTipSel ? '#ffffff' : (hasTipAff ? '#ffd700' : '#aaaaaa'), padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnTip.on('pointerup', () => { this.activeUpgradeCategory = 'tip'; this.openModal('upgrades', 'tip'); });
            this.modalContainer.add(btnTip);
            currY += 28;

            const btnBinsHeader = this.add.text(boxLeft + 12, currY, this.binsSubmenuOpen ? '🚮 Bins ▼' : '🚮 Bins ▶', {
                fontSize: '11px', style: 'bold', backgroundColor: '#1e293b', color: '#ffca28', padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            btnBinsHeader.on('pointerup', () => {
                this.binsSubmenuOpen = !this.binsSubmenuOpen;
                this.openModal('upgrades', this.activeUpgradeCategory);
            });
            this.modalContainer.add(btnBinsHeader);
            currY += 26;

            if (this.binsSubmenuOpen) {
                const binCats = [
                    { id: 'organic_shop', name: '🟢 Green Bin' },
                    { id: 'paper_shop', name: '🔵 Paper Bin' },
                    { id: 'glass_shop', name: '🟣 Glass Bin' },
                    { id: 'plastic_shop', name: '🟡 Plastic Bin' }
                ];

                binCats.forEach((bCat) => {
                    const isBinSel = (this.activeUpgradeCategory === bCat.id);
                    const hasBinAff = this.hasCategoryAffordable(bCat.id);
                    const subBtn = this.add.text(boxLeft + 22, currY, hasBinAff ? \`\${bCat.name} (!)\` : bCat.name, {
                        fontSize: '10.5px', style: 'bold',
                        backgroundColor: isBinSel ? '#0288d1' : '#334155',
                        color: isBinSel ? '#ffffff' : (hasBinAff ? '#ffd700' : '#cccccc'), padding: { x: 6, y: 3 }
                    }).setInteractive({ useHandCursor: true });

                    subBtn.on('pointerup', () => {
                        this.activeUpgradeCategory = bCat.id;
                        this.openModal('upgrades', bCat.id);
                    });
                    this.modalContainer.add(subBtn);
                    currY += 24;
                });
            }

            const divGfx = this.add.graphics();
            divGfx.lineStyle(1.5, 0x444444, 1);
            divGfx.lineBetween(boxLeft + sidebarW, 40, boxLeft + sidebarW, modalH - 35);
            this.modalContainer.add(divGfx);

            const startX = boxLeft + sidebarW + 15;
            const upgradeList = this.getUpgradeListForCategory(this.activeUpgradeCategory);

            upgradeList.forEach((uItem, idx) => {
                const uy = 44 + (idx * 48);
                const isLevelMet = (this.state.level >= uItem.reqLvl);
                const isPrevUnlocked = (idx === 0) || (upgradeList[idx - 1].lvl > 0);

                if (!isLevelMet) {
                    const nameTxt = this.add.text(startX, uy + 6, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const lockBadge = this.add.text(boxLeft + boxW - 35, uy + 6, \`[ Requires Level \${uItem.reqLvl} ]\`, {
                        fontSize: '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, 0);

                    this.modalContainer.add([nameTxt, lockBadge]);
                } else if (!isPrevUnlocked) {
                    const nameTxt = this.add.text(startX, uy + 6, uItem.name, { fontSize: '11px', style: 'bold', color: '#aaaaaa' });
                    const prevLockBadge = this.add.text(boxLeft + boxW - 35, uy + 6, '[ Need previous upgrade ]', {
                        fontSize: '10.5px', style: 'bold', color: '#ff9800'
                    }).setOrigin(1, 0);

                    this.modalContainer.add([nameTxt, prevLockBadge]);
                } else {
                    const infoTxt = this.add.text(startX, uy, \`\${uItem.name}\n\${uItem.desc}\`, { fontSize: '10.5px', color: '#fff', lineSpacing: 2 });

                    if (uItem.lvl >= uItem.max) {
                        const maxBadge = this.add.text(boxLeft + boxW - 35, uy + 6, \`[ Lvl \${uItem.lvl}/\${uItem.max} MAX ]\`, { fontSize: '11px', style: 'bold', color: '#00ff00' }).setOrigin(1, 0);
                        this.modalContainer.add([infoTxt, maxBadge]);
                    } else {
                        const lvlBadgeStr = uItem.max > 1 ? \`Lvl \${uItem.lvl}/\${uItem.max} \` : '';
                        const btnBuy = this.add.text(boxLeft + boxW - 35, uy + 4, \`\${lvlBadgeStr}BUY (\${uItem.cost})\`, {
                            fontSize: '10px', style: 'bold',
                            backgroundColor: uItem.canAfford ? '#00e676' : '#424242',
                            color: uItem.canAfford ? '#000' : '#aaa', padding: 4
                        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

                        if (uItem.canAfford) {
                            btnBuy.on('pointerup', () => {
                                uItem.action();
                                this.requestLayoutRebuild();
                                this.openModal('upgrades', this.activeUpgradeCategory);
                            });
                        }
                        this.modalContainer.add([infoTxt, btnBuy]);
                    }
                }
            });
        }

        renderDecorationsModal(w, modalH, boxW) {
            const boxLeft = (w - boxW) / 2;
            const title = this.add.text(w / 2, 22, '🪴 DECORATIONS', { fontSize: '16px', style: 'bold', color: '#a5d6a7' }).setOrigin(0.5);
            const cashTxt = this.add.text(w / 2, modalH * 0.86, \`Wallet: \$\${this.state.money}\`, { fontSize: '13px', style: 'bold', color: '#00ff00' }).setOrigin(0.5);

            this.modalContainer.add([title, cashTxt]);

            const decors = [
                { name: 'Perimeter Trees', desc: 'Adds green border trees', cost: 25, bought: this.state.hasTrees, action: () => { this.state.hasTrees = true; } },
                { name: 'Festive Bunting', desc: 'Adds colorful flags along top path', cost: 20, bought: this.state.hasBunting, action: () => { this.state.hasBunting = true; } },
                { name: 'Fairy Lights', desc: 'Glowing colored lights along header', cost: 30, bought: this.state.hasFairyLights, action: () => { this.state.hasFairyLights = true; } },
                { name: 'Diamond Accents', desc: 'Cyan diamond icons on screen borders', cost: 35, bought: this.state.hasDiamonds, action: () => { this.state.hasDiamonds = true; } }
            ];

            decors.forEach((d, idx) => {
                const dy = 50 + (idx * 48);
                const infoTxt = this.add.text(boxLeft + 25, dy, \`\${d.name}\n\${d.desc}\`, { fontSize: '11px', color: '#fff', lineSpacing: 2 });

                if (d.bought) {
                    const boughtBadge = this.add.text(boxLeft + boxW - 35, dy + 6, '[ OWNED ]', { fontSize: '11px', style: 'bold', color: '#00ff00' }).setOrigin(1, 0);
                    this.modalContainer.add([infoTxt, boughtBadge]);
                } else {
                    const canAfford = this.state.money >= d.cost;
                    const btn = this.add.text(boxLeft + boxW - 35, dy + 6, \`BUY (\$\${d.cost})\`, {
                        fontSize: '11px', style: 'bold',
                        backgroundColor: canAfford ? '#00e676' : '#424242',
                        color: canAfford ? '#000' : '#aaa', padding: 4
                    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

                    if (canAfford) {
                        btn.on('pointerup', () => {
                            this.state.money -= d.cost;
                            d.action();
                            this.requestLayoutRebuild();
                            this.openModal('decorations');
                        });
                    }
                    this.modalContainer.add([infoTxt, btn]);
                }
            });
        }

        updateUI() {
            if (this.hudTextObj) {
                const mins = Math.floor(this.state.sessionSeconds / 60).toString().padStart(2, '0');
                const secs = (this.state.sessionSeconds % 60).toString().padStart(2, '0');
                const r = this.state.resources;
                const tokensStr = \`🟢G:\${r.organic}  🔵P:\${r.paper}  🟣Gl:\${r.glass}  🟡Pl:\${r.plastic}\`;

                this.hudTextObj.setText(\`CASH: \$\${this.state.money} | 🎟️QUEST TKNS: \${this.state.questTokens}\nTOKENS: \${tokensStr}\`);
            }

            if (this.tipStockText) {
                this.tipStockText.setText(\`\${this.state.tipStockpile}\`);
            }

            if (this.bins) {
                const counts = [this.state.resources.organic, this.state.resources.paper, this.state.resources.glass, this.state.resources.plastic];
                this.bins.forEach((b, idx) => {
                    if (b.countText) b.countText.setText(\`\${counts[idx]}\`);
                });
            }

            if (this.tipSprite) {
                if (this.state.tipStockpile === 0) {
                    this.tipSprite.setAlpha(0.3);
                } else {
                    this.tipSprite.setAlpha(1);
                }
            }
        }
    }

    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
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
