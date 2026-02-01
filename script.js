// ==================== STATE MANAGEMENT ====================
const state = {
    mode: 'conversion',
    chart: { direction: 'vslice-to-psych', convertedData: null },
    character: { direction: 'vslice-to-psych', convertedData: null },
    stage: { direction: 'vslice-to-psych', convertedData: null },
    generation: { 
        chart: null,
        character: null,
        stage: null,
        lua: null,
        customAnimations: []
    }
};

// ==================== MODE & TAB SWITCHING ====================

/**
 * Switch between Conversion and Generation modes
 * @param {string} mode - The mode to switch to ('conversion' or 'generation')
 */
function switchMode(mode) {
    state.mode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('conversion-mode').style.display = mode === 'conversion' ? 'block' : 'none';
    document.getElementById('generation-mode').style.display = mode === 'generation' ? 'block' : 'none';
}

/**
 * Switch tabs in Conversion mode
 * @param {string} tabName - The tab to switch to ('chart', 'character', 'stage')
 */
function switchTab(tabName) {
    document.querySelectorAll('#conversion-mode .tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#conversion-mode .tab-content').forEach(content => content.classList.remove('active'));

    const tabs = ['chart', 'character', 'stage'];
    const index = tabs.indexOf(tabName);
    if (index !== -1) {
        document.querySelectorAll('#conversion-mode .tab')[index].classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

/**
 * Switch tabs in Generation mode
 * @param {string} tabName - The tab to switch to
 */
function switchGenTab(tabName) {
    document.querySelectorAll('#generation-mode .tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#generation-mode .tab-content').forEach(content => content.classList.remove('active'));

    const tabs = ['gen-chart', 'gen-character', 'gen-stage', 'gen-lua'];
    const index = tabs.indexOf(tabName);
    if (index !== -1) {
        document.querySelectorAll('#generation-mode .tab')[index].classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// ==================== DIRECTION MANAGEMENT ====================

/**
 * Update Chart conversion direction UI and settings
 */
function updateChartDirection() {
    const direction = document.querySelector('input[name="chartDirection"]:checked').value;
    state.chart.direction = direction;
    
    document.getElementById('chartDir1').classList.toggle('active', direction === 'vslice-to-psych');
    document.getElementById('chartDir2').classList.toggle('active', direction === 'psych-to-vslice');

    const isVToP = direction === 'vslice-to-psych';
    document.getElementById('chartConfigVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('chartConfigPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('chartInputVToPsych').style.display = isVToP ? 'grid' : 'none';
    document.getElementById('chartInputPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('chartOutputVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('chartOutputPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('downloadChartText').textContent = isVToP ? 'Download Chart' : 'Download Charts';
    
    clearChart();
}

/**
 * Update Character conversion direction UI and settings
 */
function updateCharDirection() {
    const direction = document.querySelector('input[name="charDirection"]:checked').value;
    state.character.direction = direction;
    
    document.getElementById('charDir1').classList.toggle('active', direction === 'vslice-to-psych');
    document.getElementById('charDir2').classList.toggle('active', direction === 'psych-to-vslice');

    const isVToP = direction === 'vslice-to-psych';
    document.getElementById('charConfigVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('charConfigPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('charInputVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('charInputPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('charOutputVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('charOutputPToV').style.display = isVToP ? 'none' : 'block';
    
    clearCharacter();
}

/**
 * Update Stage conversion direction UI and settings
 */
function updateStageDirection() {
    const direction = document.querySelector('input[name="stageDirection"]:checked').value;
    state.stage.direction = direction;
    
    document.getElementById('stageDir1').classList.toggle('active', direction === 'vslice-to-psych');
    document.getElementById('stageDir2').classList.toggle('active', direction === 'psych-to-vslice');

    const isVToP = direction === 'vslice-to-psych';
    document.getElementById('stageConfigVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('stageConfigPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('stageInputVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('stageInputPToV').style.display = isVToP ? 'none' : 'grid';
    document.getElementById('stageOutputVToPsych').style.display = isVToP ? 'block' : 'none';
    document.getElementById('stageOutputPToV').style.display = isVToP ? 'none' : 'block';
    document.getElementById('downloadStageText').textContent = isVToP ? 'Download Files' : 'Download Stage';
    
    clearStage();
}

// ==================== CHART CONVERTER ====================

/**
 * Main chart conversion handler
 */
function convertChart() {
    try {
        if (state.chart.direction === 'vslice-to-psych') {
            convertChartVSliceToPsych();
        } else {
            convertChartPsychToVSlice();
        }
    } catch (error) {
        showStatus('❌ Conversion error: ' + error.message, 'error', 'chartStatus');
        console.error(error);
    }
}

/**
 * Convert V Slice chart to Psych Engine format
 */
function convertChartVSliceToPsych() {
    const vSliceChartText = document.getElementById('vSliceChart').value;
    const vSliceMetadataText = document.getElementById('vSliceMetadata').value;

    if (!vSliceChartText || !vSliceMetadataText) {
        showStatus('⚠️ Please fill both fields (Chart and Metadata)', 'error', 'chartStatus');
        return;
    }

    const vSliceChart = JSON.parse(vSliceChartText);
    const vSliceMetadata = JSON.parse(vSliceMetadataText);
    const psychChart = vSliceToPsychEngine(vSliceChart, vSliceMetadata);

    document.getElementById('outputChart').value = JSON.stringify(psychChart, null, '\t');
    state.chart.convertedData = psychChart;
    document.getElementById('downloadChartBtn').disabled = false;

    showStatus('✅ Chart converted successfully! (V Slice → Psych Engine)', 'success', 'chartStatus');
}

/**
 * Convert Psych Engine chart to V Slice format
 */
function convertChartPsychToVSlice() {
    const psychChartText = document.getElementById('psychChart').value;

    if (!psychChartText) {
        showStatus('⚠️ Please paste the Psych Engine Chart JSON', 'error', 'chartStatus');
        return;
    }

    const psychChart = JSON.parse(psychChartText);
    const { chart, metadata } = psychToVSlice(psychChart);

    document.getElementById('outputVSliceChart').value = JSON.stringify(chart, null, 2);
    document.getElementById('outputVSliceMetadata').value = JSON.stringify(metadata, null, 2);
    state.chart.convertedData = { chart, metadata };
    document.getElementById('downloadChartBtn').disabled = false;

    showStatus('✅ Chart converted successfully! (Psych Engine → V Slice)', 'success', 'chartStatus');
}

/**
 * Convert V Slice chart data to Psych Engine format
 * @param {Object} vSliceChart - V Slice chart data
 * @param {Object} vSliceMetadata - V Slice metadata
 * @returns {Object} Psych Engine chart structure
 */
function vSliceToPsychEngine(vSliceChart, vSliceMetadata) {
    const bpm = vSliceMetadata.timeChanges[0].bpm;
    const songName = vSliceMetadata.songName || "Unknown";
    const scrollSpeed = vSliceChart.scrollSpeed?.normal || 1;
    const notes = vSliceChart.notes?.normal || [];

    const player1 = document.getElementById('player1').value || 'bf';
    const player2 = document.getElementById('player2').value || 'dad';
    const gfVersion = document.getElementById('gfVersion').value || 'gf';
    const stage = document.getElementById('stage').value || 'stage';

    const msPerBeat = 60000 / bpm;
    const msPerSection = msPerBeat * 4;

    const maxTime = notes.length > 0 ? Math.max(...notes.map(n => n.t + (n.l || 0))) : 0;
    const numSections = Math.ceil(maxTime / msPerSection) || 1;

    const sections = [];
    for (let i = 0; i < numSections; i++) {
        const sectionStartTime = i * msPerSection;
        const sectionEndTime = (i + 1) * msPerSection;

        const sectionNotes = notes
            .filter(note => note.t >= sectionStartTime && note.t < sectionEndTime)
            .map(note => {
                let direction = note.d % 4;
                const isPlayerNote = note.d >= 4;
                const mustHitSection = i % 2 === 1;
                
                if (isPlayerNote !== mustHitSection) {
                    direction += 4;
                }

                return [note.t, direction, note.l || 0];
            });

        sections.push({
            sectionNotes: sectionNotes,
            sectionBeats: 4,
            lengthInSteps: 16,
            mustHitSection: i % 2 === 1,
            bpm: bpm,
            changeBPM: false,
            altAnim: false,
            gfSection: false
        });
    }

    return {
        song: {
            song: songName,
            notes: sections,
            bpm: bpm,
            needsVoices: true,
            player1: player1,
            player2: player2,
            gfVersion: gfVersion,
            speed: scrollSpeed,
            stage: stage,
            validScore: true
        }
    };
}

/**
 * Convert Psych Engine chart to V Slice format
 * @param {Object} psychChart - Psych Engine chart data
 * @returns {Object} Object containing V Slice chart and metadata
 */
function psychToVSlice(psychChart) {
    const song = psychChart.song;
    const bpm = song.bpm || 100;
    const scrollSpeed = parseFloat(document.getElementById('scrollSpeed').value) || song.speed || 1;
    const artist = document.getElementById('artist').value || 'Unknown';
    const charter = document.getElementById('charter').value || 'Converter';

    const notes = [];
    song.notes.forEach((section, index) => {
        section.sectionNotes.forEach(note => {
            const time = note[0];
            let direction = note[1];
            const length = note[2];

            if (direction >= 4) {
                direction = direction % 4;
            }

            if (section.mustHitSection) {
                direction += 4;
            }

            notes.push({
                t: time,
                d: direction,
                l: length,
                p: []
            });
        });
    });

    notes.sort((a, b) => a.t - b.t);

    const chart = {
        version: "2.0.0",
        scrollSpeed: {
            normal: scrollSpeed
        },
        notes: {
            normal: notes
        }
    };

    const metadata = {
        version: "2.2.4",
        songName: song.song || "Unknown",
        artist: artist,
        charter: charter,
        looped: false,
        offsets: {
            instrumental: 0,
            altInstrumentals: {},
            vocals: {},
            altVocals: {}
        },
        playData: {
            songVariations: [],
            difficulties: ["normal"],
            characters: {
                player: song.player1 || "bf",
                girlfriend: song.gfVersion || "gf",
                opponent: song.player2 || "dad",
                instrumental: "",
                opponentVocals: [song.player2 || "dad"],
                playerVocals: [song.player1 || "bf"]
            },
            stage: song.stage || "stage",
            noteStyle: "funkin",
            ratings: {
                easy: 1,
                normal: 3,
                hard: 5
            },
            previewStart: 0,
            previewEnd: 0
        },
        generatedBy: "Funkin' Modding",
        timeFormat: "ms",
        timeChanges: [
            {
                t: 0,
                b: 0,
                bpm: bpm,
                n: 4,
                d: 4,
                bt: [4, 4, 4, 4]
            }
        ]
    };

    return { chart, metadata };
}

/**
 * Download converted chart
 */
function downloadChart() {
    if (!state.chart.convertedData) {
        showStatus('❌ No chart to download', 'error', 'chartStatus');
        return;
    }

    if (state.chart.direction === 'vslice-to-psych') {
        const songName = state.chart.convertedData.song.song || 'converted';
        const filename = `${songName.toLowerCase().replace(/\s+/g, '-')}.json`;
        downloadJSON(state.chart.convertedData, filename);
        showStatus('✅ Psych Engine Chart download started!', 'success', 'chartStatus');
    } else {
        const songName = state.chart.convertedData.metadata.songName || 'converted';
        const baseName = songName.toLowerCase().replace(/\s+/g, '-');
        downloadJSON(state.chart.convertedData.chart, `${baseName}-chart.json`);
        downloadJSON(state.chart.convertedData.metadata, `${baseName}-metadata.json`);
        showStatus('✅ V Slice files download started!', 'success', 'chartStatus');
    }
}

/**
 * Clear chart converter fields
 */
function clearChart() {
    document.getElementById('vSliceChart').value = '';
    document.getElementById('vSliceMetadata').value = '';
    document.getElementById('psychChart').value = '';
    document.getElementById('outputChart').value = '';
    document.getElementById('outputVSliceChart').value = '';
    document.getElementById('outputVSliceMetadata').value = '';
    document.getElementById('downloadChartBtn').disabled = true;
    state.chart.convertedData = null;
    hideStatus('chartStatus');
}

// ==================== CHARACTER CONVERTER ====================

/**
 * Main character conversion handler
 */
function convertCharacter() {
    try {
        if (state.character.direction === 'vslice-to-psych') {
            convertCharacterVSliceToPsych();
        } else {
            convertCharacterPsychToVSlice();
        }
    } catch (error) {
        showStatus('❌ Conversion error: ' + error.message, 'error', 'charStatus');
        console.error(error);
    }
}

/**
 * Convert V Slice character to Psych Engine format
 */
function convertCharacterVSliceToPsych() {
    const vSliceCharText = document.getElementById('vSliceCharacter').value;

    if (!vSliceCharText) {
        showStatus('⚠️ Please paste the V Slice Character JSON', 'error', 'charStatus');
        return;
    }

    const vSliceChar = JSON.parse(vSliceCharText);
    const psychChar = vSliceCharToPsychEngine(vSliceChar);

    document.getElementById('outputCharacter').value = JSON.stringify(psychChar, null, '\t');
    state.character.convertedData = psychChar;
    document.getElementById('downloadCharBtn').disabled = false;

    showStatus('✅ Character converted successfully! (V Slice → Psych Engine)', 'success', 'charStatus');
}

/**
 * Convert Psych Engine character to V Slice format
 */
function convertCharacterPsychToVSlice() {
    const psychCharText = document.getElementById('psychCharacter').value;

    if (!psychCharText) {
        showStatus('⚠️ Please paste the Psych Engine Character JSON', 'error', 'charStatus');
        return;
    }

    const psychChar = JSON.parse(psychCharText);
    const vSliceChar = psychCharToVSlice(psychChar);

    document.getElementById('outputVSliceCharacter').value = JSON.stringify(vSliceChar, null, 2);
    state.character.convertedData = vSliceChar;
    document.getElementById('downloadCharBtn').disabled = false;

    showStatus('✅ Character converted successfully! (Psych Engine → V Slice)', 'success', 'charStatus');
}

/**
 * Convert V Slice character to Psych Engine format
 * @param {Object} vSliceChar - V Slice character data
 * @returns {Object} Psych Engine character structure
 */
function vSliceCharToPsychEngine(vSliceChar) {
    const singDuration = parseFloat(document.getElementById('singDuration').value) || 6.1;
    const danceEvery = parseInt(document.getElementById('danceEvery').value) || 2;
    const noAntialiasing = document.getElementById('noAntialiasing').checked;
    const isPlayer = document.getElementById('isPlayer').checked;
    const healthbarColor = document.getElementById('healthbarColor').value;

    const colorDecimal = parseInt(healthbarColor.replace('#', ''), 16);
    const colorSigned = colorDecimal > 0x7FFFFFFF ? colorDecimal - 0x100000000 : colorDecimal;

    const animationMap = {
        'Left': 'singLEFT',
        'Down': 'singDOWN',
        'Up': 'singUP',
        'Right': 'singRIGHT',
        'Idle0': 'idle',
        'Idle ALT': 'idle-alt',
        'Idle': 'idle'
    };

    const animations = (vSliceChar.animations || []).map(anim => ({
        offsets: anim.offsets || [0, 0],
        flipY: false,
        loop: anim.loop || false,
        fps: anim.fps || 24,
        anim: animationMap[anim.name] || anim.name.toLowerCase(),
        flipX: false,
        indices: [],
        name: anim.name
    }));

    return {
        animations: animations,
        no_antialiasing: noAntialiasing,
        image: vSliceChar.asset || "characters/unknown",
        position: vSliceChar.position || [0, 0],
        dance_every: danceEvery,
        healthicon: vSliceChar.healthIcon || "face",
        flip_x: vSliceChar.flipX || false,
        healthbar_colours: [colorSigned],
        camera_position: vSliceChar.cameraPosition || [0, 0],
        sing_duration: singDuration,
        scale: vSliceChar.scale || 1,
        _editor_isPlayer: isPlayer
    };
}

/**
 * Convert Psych Engine character to V Slice format
 * @param {Object} psychChar - Psych Engine character data
 * @returns {Object} V Slice character structure
 */
function psychCharToVSlice(psychChar) {
    const defaultFPS = parseInt(document.getElementById('defaultFPS').value) || 24;

    const reverseAnimationMap = {
        'singLEFT': 'Left',
        'singDOWN': 'Down',
        'singUP': 'Up',
        'singRIGHT': 'Right',
        'idle': 'Idle0',
        'idle-alt': 'Idle ALT'
    };

    const animations = (psychChar.animations || []).map(anim => ({
        name: reverseAnimationMap[anim.anim] || anim.name || anim.anim,
        fps: anim.fps || defaultFPS,
        loop: anim.loop || false,
        offsets: anim.offsets || [0, 0]
    }));

    let healthColor = psychChar.healthbar_colours ? psychChar.healthbar_colours[0] : psychChar.healthbar_colour || 0;
    if (healthColor < 0) {
        healthColor = healthColor + 0x100000000;
    }
    const healthIcon = psychChar.healthicon || "face";

    return {
        name: healthIcon.charAt(0).toUpperCase() + healthIcon.slice(1),
        asset: psychChar.image || "characters/unknown",
        position: psychChar.position || [0, 0],
        cameraPosition: psychChar.camera_position || [0, 0],
        scale: psychChar.scale || 1,
        flipX: psychChar.flip_x || false,
        healthIcon: healthIcon,
        animations: animations
    };
}

/**
 * Download converted character
 */
function downloadCharacter() {
    if (!state.character.convertedData) {
        showStatus('❌ No character to download', 'error', 'charStatus');
        return;
    }

    if (state.character.direction === 'vslice-to-psych') {
        const charName = state.character.convertedData.healthicon || 'character';
        const filename = `${charName.toLowerCase().replace(/\s+/g, '-')}.json`;
        downloadJSON(state.character.convertedData, filename);
        showStatus('✅ Psych Engine Character download started!', 'success', 'charStatus');
    } else {
        const charName = state.character.convertedData.name || 'Character';
        const filename = `${charName.toLowerCase().replace(/\s+/g, '-')}.json`;
        downloadJSON(state.character.convertedData, filename);
        showStatus('✅ V Slice Character download started!', 'success', 'charStatus');
    }
}

/**
 * Clear character converter fields
 */
function clearCharacter() {
    document.getElementById('vSliceCharacter').value = '';
    document.getElementById('psychCharacter').value = '';
    document.getElementById('outputCharacter').value = '';
    document.getElementById('outputVSliceCharacter').value = '';
    document.getElementById('downloadCharBtn').disabled = true;
    state.character.convertedData = null;
    hideStatus('charStatus');
}

// ==================== STAGE CONVERTER ====================

/**
 * Main stage conversion handler
 */
function convertStage() {
    try {
        if (state.stage.direction === 'vslice-to-psych') {
            convertStageVSliceToPsych();
        } else {
            convertStagePsychToVSlice();
        }
    } catch (error) {
        showStatus('❌ Conversion error: ' + error.message, 'error', 'stageStatus');
        console.error(error);
    }
}

/**
 * Convert V Slice stage to Psych Engine format
 */
function convertStageVSliceToPsych() {
    const vSliceStageText = document.getElementById('vSliceStage').value;

    if (!vSliceStageText) {
        showStatus('⚠️ Please paste the V Slice Stage JSON', 'error', 'stageStatus');
        return;
    }

    const vSliceStage = JSON.parse(vSliceStageText);
    const { json, lua } = vSliceStageToPsychEngine(vSliceStage);

    document.getElementById('outputStageJSON').value = JSON.stringify(json, null, '\t');
    document.getElementById('outputStageLua').value = lua;
    state.stage.convertedData = { json, lua };
    document.getElementById('downloadStageBtn').disabled = false;

    showStatus('✅ Stage converted successfully! (V Slice → Psych Engine)', 'success', 'stageStatus');
}

/**
 * Convert Psych Engine stage to V Slice format
 */
function convertStagePsychToVSlice() {
    const psychStageText = document.getElementById('psychStage').value;
    const psychStageLuaText = document.getElementById('psychStageLua').value;

    if (!psychStageText) {
        showStatus('⚠️ Please paste the Psych Engine Stage JSON', 'error', 'stageStatus');
        return;
    }

    const psychStage = JSON.parse(psychStageText);
    const vSliceStage = psychStageToVSlice(psychStage, psychStageLuaText);

    document.getElementById('outputVSliceStage').value = JSON.stringify(vSliceStage, null, 2);
    state.stage.convertedData = vSliceStage;
    document.getElementById('downloadStageBtn').disabled = false;

    showStatus('✅ Stage converted successfully! (Psych Engine → V Slice)', 'success', 'stageStatus');
}

/**
 * Convert V Slice stage to Psych Engine format
 * @param {Object} vSliceStage - V Slice stage data
 * @returns {Object} Object containing Psych Engine JSON and Lua script
 */
function vSliceStageToPsychEngine(vSliceStage) {
    const generateLua = document.getElementById('generateLua').checked;
    
    const json = {
        directory: vSliceStage.directory || "",
        defaultZoom: vSliceStage.cameraZoom || 0.9,
        isPixelStage: false,
        boyfriend: vSliceStage.characters?.bf?.position || [770, 100],
        girlfriend: vSliceStage.characters?.gf?.position || [400, 130],
        opponent: vSliceStage.characters?.dad?.position || [100, 100],
        hide_girlfriend: false,
        camera_boyfriend: vSliceStage.characters?.bf?.cameraOffsets || [0, 0],
        camera_opponent: vSliceStage.characters?.dad?.cameraOffsets || [0, 0],
        camera_girlfriend: vSliceStage.characters?.gf?.cameraOffsets || [0, 0],
        camera_speed: 1
    };

    let lua = '';
    if (generateLua && vSliceStage.props) {
        lua = `function onCreate()\n`;
        
        const sortedProps = [...vSliceStage.props].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        sortedProps.forEach((prop, index) => {
            const spriteName = prop.name || `sprite${index}`;
            const assetPath = prop.assetPath || `stages/${vSliceStage.directory || 'unknown'}/${spriteName}`;
            const x = prop.position ? prop.position[0] : 0;
            const y = prop.position ? prop.position[1] : 0;
            const scaleX = prop.scale ? prop.scale[0] : 1;
            const scaleY = prop.scale ? prop.scale[1] : 1;
            const alpha = prop.alpha !== undefined ? prop.alpha : 1;
            const scrollX = prop.scroll ? prop.scroll[0] : 1;
            const scrollY = prop.scroll ? prop.scroll[1] : 1;
            
            lua += `\n    makeLuaSprite('${spriteName}', '${assetPath}', ${x}, ${y})\n`;
            
            if (!prop.isPixel) {
                lua += `    setProperty('${spriteName}.antialiasing', getPropertyFromClass('backend.ClientPrefs', 'data.globalAntialiasing'))\n`;
            }
            
            if (scaleX !== 1 || scaleY !== 1) {
                lua += `    scaleObject('${spriteName}', ${scaleX}, ${scaleY})\n`;
            }
            
            if (alpha !== 1) {
                lua += `    setProperty('${spriteName}.alpha', ${alpha})\n`;
            }
            
            if (scrollX !== 1 || scrollY !== 1) {
                lua += `    setScrollFactor('${spriteName}', ${scrollX}, ${scrollY})\n`;
            }
            
            const charZIndex = vSliceStage.characters?.bf?.zIndex || 300;
            const inFront = (prop.zIndex || 0) > charZIndex;
            
            lua += `    addLuaSprite('${spriteName}', ${inFront})\n`;
        });
        
        lua += `end\n`;
    } else {
        lua = `-- No props to convert or Lua generation disabled\nfunction onCreate()\n    -- Add your stage sprites here\nend\n`;
    }

    return { json, lua };
}

/**
 * Convert Psych Engine stage to V Slice format
 * @param {Object} psychStage - Psych Engine stage data
 * @param {string} luaScript - Optional Lua script
 * @returns {Object} V Slice stage structure
 */
function psychStageToVSlice(psychStage, luaScript) {
    const stageName = document.getElementById('stageName').value || 'CustomStage';
    const stageDirectory = document.getElementById('stageDirectory').value || 'custom';
    
    const props = [];
    
    if (luaScript) {
        const sprites = parseLuaSprites(luaScript);
        sprites.forEach((sprite, index) => {
            props.push({
                danceEvery: 0,
                zIndex: sprite.inFront ? 400 : 10 + (index * 10),
                position: sprite.position || [0, 0],
                scale: sprite.scale || [1, 1],
                animType: "sparrow",
                startingAnimation: "",
                name: sprite.name || `prop${index}`,
                isPixel: sprite.isPixel || false,
                assetPath: sprite.assetPath || "",
                scroll: sprite.scroll || [1, 1],
                alpha: sprite.alpha !== undefined ? sprite.alpha : 1,
                animations: []
            });
        });
    }

    return {
        version: "1.0.0",
        name: stageName,
        directory: stageDirectory,
        cameraZoom: psychStage.defaultZoom || 0.9,
        props: props,
        characters: {
            bf: {
                zIndex: 300,
                position: psychStage.boyfriend || [770, 100],
                cameraOffsets: psychStage.camera_boyfriend || [0, 0]
            },
            dad: {
                zIndex: 250,
                position: psychStage.opponent || [100, 100],
                cameraOffsets: psychStage.camera_opponent || [0, 0]
            },
            gf: {
                zIndex: 150,
                position: psychStage.girlfriend || [400, 130],
                cameraOffsets: psychStage.camera_girlfriend || [0, 0]
            }
        }
    };
}

/**
 * Parse Lua script to extract sprite information
 * @param {string} luaScript - Lua script content
 * @returns {Array} Array of sprite objects
 */
function parseLuaSprites(luaScript) {
    const sprites = [];
    const lines = luaScript.split('\n');
    let currentSprite = null;

    lines.forEach(line => {
        line = line.trim();

        const spriteMatch = line.match(/makeLuaSprite\('([^']+)',\s*'([^']+)',\s*([-\d.]+),\s*([-\d.]+)\)/);
        if (spriteMatch) {
            if (currentSprite) sprites.push(currentSprite);
            currentSprite = {
                name: spriteMatch[1],
                assetPath: spriteMatch[2],
                position: [parseFloat(spriteMatch[3]), parseFloat(spriteMatch[4])],
                scale: [1, 1],
                scroll: [1, 1],
                alpha: 1,
                isPixel: false,
                inFront: false
            };
        }

        if (!currentSprite) return;

        const scaleMatch = line.match(/scaleObject\('[^']+',\s*([-\d.]+),\s*([-\d.]+)\)/);
        if (scaleMatch) {
            currentSprite.scale = [parseFloat(scaleMatch[1]), parseFloat(scaleMatch[2])];
        }

        const alphaMatch = line.match(/setProperty\('[^']+\.alpha',\s*([-\d.]+)\)/);
        if (alphaMatch) {
            currentSprite.alpha = parseFloat(alphaMatch[1]);
        }

        const scrollMatch = line.match(/setScrollFactor\('[^']+',\s*([-\d.]+),\s*([-\d.]+)\)/);
        if (scrollMatch) {
            currentSprite.scroll = [parseFloat(scrollMatch[1]), parseFloat(scrollMatch[2])];
        }

        const addMatch = line.match(/addLuaSprite\('[^']+',\s*(true|false)\)/);
        if (addMatch) {
            currentSprite.inFront = addMatch[1] === 'true';
        }

        if (line.includes('antialiasing')) {
            currentSprite.isPixel = false;
        }
    });

    if (currentSprite) sprites.push(currentSprite);
    return sprites;
}

/**
 * Download converted stage
 */
function downloadStage() {
    if (!state.stage.convertedData) {
        showStatus('❌ No stage to download', 'error', 'stageStatus');
        return;
    }

    if (state.stage.direction === 'vslice-to-psych') {
        const stageName = 'stage';
        downloadJSON(state.stage.convertedData.json, `${stageName}.json`);
        downloadText(state.stage.convertedData.lua, `${stageName}.lua`);
        showStatus('✅ Psych Engine Stage files download started!', 'success', 'stageStatus');
    } else {
        const stageName = state.stage.convertedData.name || 'stage';
        const filename = `${stageName.toLowerCase().replace(/\s+/g, '-')}.json`;
        downloadJSON(state.stage.convertedData, filename);
        showStatus('✅ V Slice Stage download started!', 'success', 'stageStatus');
    }
}

/**
 * Clear stage converter fields
 */
function clearStage() {
    document.getElementById('vSliceStage').value = '';
    document.getElementById('psychStage').value = '';
    document.getElementById('psychStageLua').value = '';
    document.getElementById('outputStageJSON').value = '';
    document.getElementById('outputStageLua').value = '';
    document.getElementById('outputVSliceStage').value = '';
    document.getElementById('downloadStageBtn').disabled = true;
    state.stage.convertedData = null;
    hideStatus('stageStatus');
}

// ==================== CHART GENERATOR ====================

/**
 * Update generation mode UI
 */
function updateGenMode() {
    const mode = document.querySelector('input[name="genMode"]:checked').value;
    
    document.getElementById('genMode1').classList.toggle('active', mode === 'empty');
    document.getElementById('genMode2').classList.toggle('active', mode === 'sample');
    document.getElementById('genMode3').classList.toggle('active', mode === 'random');
    
    document.getElementById('randomGenSettings').style.display = mode === 'random' ? 'block' : 'none';
}

/**
 * Generate chart based on user settings
 */
function generateChart() {
    try {
        const songName = document.getElementById('genSongName').value || 'New Song';
        const bpm = parseFloat(document.getElementById('genBPM').value) || 150;
        const speed = parseFloat(document.getElementById('genSpeed').value) || 2.5;
        const numSections = parseInt(document.getElementById('genSections').value) || 8;
        const player1 = document.getElementById('genPlayer1').value || 'bf';
        const player2 = document.getElementById('genPlayer2').value || 'dad';
        const gfVersion = document.getElementById('genGF').value || 'gf';
        const stage = document.getElementById('genStage').value || 'stage';
        const genMode = document.querySelector('input[name="genMode"]:checked').value;

        const sections = [];
        const msPerBeat = 60000 / bpm;
        const msPerSection = msPerBeat * 4;

        for (let i = 0; i < numSections; i++) {
            const sectionStartTime = i * msPerSection;
            let sectionNotes = [];

            if (genMode === 'sample') {
                sectionNotes = generateSampleNotes(sectionStartTime, msPerBeat, i % 2 === 1);
            } else if (genMode === 'random') {
                const density = document.getElementById('genDensity').value;
                const includeSustains = document.getElementById('genSustains').checked;
                sectionNotes = generateRandomNotes(sectionStartTime, msPerBeat, i % 2 === 1, density, includeSustains);
            }

            sections.push({
                sectionNotes: sectionNotes,
                sectionBeats: 4,
                lengthInSteps: 16,
                mustHitSection: i % 2 === 1,
                gfSection: false,
                bpm: bpm,
                changeBPM: false,
                altAnim: false
            });
        }

        const chart = {
            song: {
                song: songName,
                notes: sections,
                bpm: bpm,
                needsVoices: true,
                player1: player1,
                player2: player2,
                gfVersion: gfVersion,
                speed: speed,
                stage: stage,
                validScore: true
            }
        };

        document.getElementById('outputGenChart').value = JSON.stringify(chart, null, '\t');
        state.generation.chart = chart;
        document.getElementById('downloadGenChartBtn').disabled = false;

        showStatus('✅ Chart generated successfully!', 'success', 'genChartStatus');
    } catch (error) {
        showStatus('❌ Generation error: ' + error.message, 'error', 'genChartStatus');
        console.error(error);
    }
}

/**
 * Generate sample notes pattern
 * @param {number} startTime - Section start time
 * @param {number} msPerBeat - Milliseconds per beat
 * @param {boolean} isPlayer - Whether this is a player section
 * @returns {Array} Array of note data
 */
function generateSampleNotes(startTime, msPerBeat, isPlayer) {
    const notes = [];
    const baseOffset = isPlayer ? 4 : 0;

    for (let i = 0; i < 4; i++) {
        const time = startTime + (i * msPerBeat);
        const direction = (i % 4) + baseOffset;
        notes.push([time, direction, 0]);
    }

    return notes;
}

/**
 * Generate random notes
 * @param {number} startTime - Section start time
 * @param {number} msPerBeat - Milliseconds per beat
 * @param {boolean} isPlayer - Whether this is a player section
 * @param {string} density - Note density ('low', 'medium', 'high')
 * @param {boolean} includeSustains - Whether to include sustain notes
 * @returns {Array} Array of note data
 */
function generateRandomNotes(startTime, msPerBeat, isPlayer, density, includeSustains) {
    const notes = [];
    const baseOffset = isPlayer ? 4 : 0;
    
    let noteCount;
    switch(density) {
        case 'low': noteCount = 4; break;
        case 'medium': noteCount = 8; break;
        case 'high': noteCount = 12; break;
        default: noteCount = 8;
    }

    const beatsPerSection = 4;

    for (let i = 0; i < noteCount; i++) {
        const beatPosition = Math.random() * beatsPerSection;
        const time = startTime + (beatPosition * msPerBeat);
        const direction = Math.floor(Math.random() * 4) + baseOffset;
        
        let sustain = 0;
        if (includeSustains && Math.random() > 0.7) {
            sustain = msPerBeat * (Math.random() * 2);
        }

        notes.push([time, direction, sustain]);
    }

    notes.sort((a, b) => a[0] - b[0]);

    return notes;
}

/**
 * Download generated chart
 */
function downloadGenChart() {
    if (!state.generation.chart) {
        showStatus('❌ No chart to download', 'error', 'genChartStatus');
        return;
    }

    const songName = state.generation.chart.song.song || 'new-song';
    const filename = `${songName.toLowerCase().replace(/\s+/g, '-')}.json`;
    downloadJSON(state.generation.chart, filename);
    showStatus('✅ Chart download started!', 'success', 'genChartStatus');
}

/**
 * Clear chart generator fields
 */
function clearGenChart() {
    document.getElementById('outputGenChart').value = '';
    document.getElementById('downloadGenChartBtn').disabled = true;
    state.generation.chart = null;
    hideStatus('genChartStatus');
}

// ==================== CHARACTER GENERATOR ====================

/**
 * Update animation preset UI
 */
function updateAnimPreset() {
    const preset = document.querySelector('input[name="animPreset"]:checked').value;
    
    document.getElementById('animPreset1').classList.toggle('active', preset === 'basic');
    document.getElementById('animPreset2').classList.toggle('active', preset === 'extended');
    document.getElementById('animPreset3').classList.toggle('active', preset === 'custom');
    
    document.getElementById('customAnimSection').style.display = preset === 'custom' ? 'block' : 'none';
    
    if (preset === 'custom') {
        state.generation.customAnimations = [];
        updateAnimationList();
    }
}

/**
 * Add custom animation to the list
 */
function addCustomAnimation() {
    const name = document.getElementById('customAnimName').value.trim();
    const xmlName = document.getElementById('customAnimXML').value.trim();
    const fps = parseInt(document.getElementById('customAnimFPS').value) || 24;
    const loop = document.getElementById('customAnimLoop').checked;
    const offsetX = parseInt(document.getElementById('customAnimOffsetX').value) || 0;
    const offsetY = parseInt(document.getElementById('customAnimOffsetY').value) || 0;

    if (!name || !xmlName) {
        showStatus('⚠️ Please fill Animation Name and XML Name', 'error', 'genCharStatus');
        return;
    }

    const animation = {
        anim: name,
        name: xmlName,
        fps: fps,
        loop: loop,
        offsets: [offsetX, offsetY],
        indices: [],
        flipX: false,
        flipY: false
    };

    state.generation.customAnimations.push(animation);
    
    // Clear fields
    document.getElementById('customAnimName').value = '';
    document.getElementById('customAnimXML').value = '';
    document.getElementById('customAnimFPS').value = '24';
    document.getElementById('customAnimLoop').checked = false;
    document.getElementById('customAnimOffsetX').value = '0';
    document.getElementById('customAnimOffsetY').value = '0';

    updateAnimationList();
    showStatus('✅ Animation added!', 'success', 'genCharStatus');
}

/**
 * Update the animation list display
 */
function updateAnimationList() {
    const container = document.getElementById('animationItems');
    const listDiv = document.getElementById('animationList');
    
    if (state.generation.customAnimations.length === 0) {
        listDiv.style.display = 'none';
        return;
    }

    listDiv.style.display = 'block';
    container.innerHTML = '';

    state.generation.customAnimations.forEach((anim, index) => {
        const item = document.createElement('div');
        item.className = 'animation-item';
        item.innerHTML = `
            <div class="animation-info">
                <strong>${anim.anim}</strong>
                <div class="animation-details">
                    XML: ${anim.name} | FPS: ${anim.fps} | Loop: ${anim.loop ? 'Yes' : 'No'} | Offset: [${anim.offsets[0]}, ${anim.offsets[1]}]
                </div>
            </div>
            <button class="btn-remove" onclick="removeAnimation(${index})">
                <span>🗑️</span>
                <span>Remove</span>
            </button>
        `;
        container.appendChild(item);
    });
}

/**
 * Remove animation from the list
 * @param {number} index - Index of animation to remove
 */
function removeAnimation(index) {
    state.generation.customAnimations.splice(index, 1);
    updateAnimationList();
}

/**
 * Generate character based on user settings
 */
function generateCharacter() {
    try {
        const charName = document.getElementById('genCharName').value || 'mycharacter';
        const imagePath = document.getElementById('genCharImage').value || 'characters/mycharacter';
        const healthIcon = document.getElementById('genCharIcon').value || 'face';
        const singDuration = parseFloat(document.getElementById('genCharSingDuration').value) || 6.1;
        
        const posX = parseInt(document.getElementById('genCharPosX').value) || 0;
        const posY = parseInt(document.getElementById('genCharPosY').value) || 100;
        const camX = parseInt(document.getElementById('genCharCamX').value) || 0;
        const camY = parseInt(document.getElementById('genCharCamY').value) || 0;
        const scale = parseFloat(document.getElementById('genCharScale').value) || 1;
        
        const healthColor = document.getElementById('genCharHealthColor').value;
        const flipX = document.getElementById('genCharFlipX').checked;
        const noAA = document.getElementById('genCharNoAA').checked;
        const isPlayer = document.getElementById('genCharIsPlayer').checked;
        const danceEvery = parseInt(document.getElementById('genCharDanceEvery').value) || 2;

        // Convert hex color to RGB
        const colorHex = healthColor.replace('#', '');
        const r = parseInt(colorHex.substr(0, 2), 16);
        const g = parseInt(colorHex.substr(2, 2), 16);
        const b = parseInt(colorHex.substr(4, 2), 16);

        const preset = document.querySelector('input[name="animPreset"]:checked').value;
        let animations = [];

        if (preset === 'basic') {
            animations = [
                { loop: false, offsets: [0, 0], anim: "idle", fps: 24, name: "Idle0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singLEFT", fps: 24, name: "LEFT0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singDOWN", fps: 24, name: "DOWN0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singUP", fps: 24, name: "UP0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singRIGHT", fps: 24, name: "RIGHT0", indices: [], flipX: false, flipY: false }
            ];
        } else if (preset === 'extended') {
            animations = [
                { loop: false, offsets: [0, 0], anim: "idle", fps: 24, name: "Idle0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singLEFT", fps: 24, name: "LEFT0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singDOWN", fps: 24, name: "DOWN0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singUP", fps: 24, name: "UP0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singRIGHT", fps: 24, name: "RIGHT0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singLEFTmiss", fps: 24, name: "LEFT MISS0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singDOWNmiss", fps: 24, name: "DOWN MISS0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singUPmiss", fps: 24, name: "UP MISS0", indices: [], flipX: false, flipY: false },
                { loop: false, offsets: [0, 0], anim: "singRIGHTmiss", fps: 24, name: "RIGHT MISS0", indices: [], flipX: false, flipY: false }
            ];
        } else if (preset === 'custom') {
            animations = state.generation.customAnimations;
            
            if (animations.length === 0) {
                showStatus('⚠️ Please add at least one animation', 'error', 'genCharStatus');
                return;
            }
        }

        const character = {
            animations: animations,
            vocals_file: "",
            no_antialiasing: noAA,
            image: imagePath,
            position: [posX, posY],
            healthicon: healthIcon,
            flip_x: flipX,
            healthbar_colors: [r, g, b],
            camera_position: [camX, camY],
            sing_duration: singDuration,
            scale: scale,
            dance_every: danceEvery,
            _editor_isPlayer: isPlayer
        };

        document.getElementById('outputGenCharacter').value = JSON.stringify(character, null, '\t');
        state.generation.character = character;
        document.getElementById('downloadGenCharBtn').disabled = false;

        showStatus('✅ Character generated successfully!', 'success', 'genCharStatus');
    } catch (error) {
        showStatus('❌ Generation error: ' + error.message, 'error', 'genCharStatus');
        console.error(error);
    }
}

/**
 * Download generated character
 */
function downloadGenCharacter() {
    if (!state.generation.character) {
        showStatus('❌ No character to download', 'error', 'genCharStatus');
        return;
    }

    const charName = state.generation.character.healthicon || 'character';
    const filename = `${charName.toLowerCase().replace(/\s+/g, '-')}.json`;
    downloadJSON(state.generation.character, filename);
    showStatus('✅ Character download started!', 'success', 'genCharStatus');
}

/**
 * Clear character generator fields
 */
function clearGenCharacter() {
    document.getElementById('outputGenCharacter').value = '';
    document.getElementById('downloadGenCharBtn').disabled = true;
    state.generation.character = null;
    state.generation.customAnimations = [];
    updateAnimationList();
    hideStatus('genCharStatus');
}

// ==================== STAGE GENERATOR ====================

/**
 * Generate stage based on user settings
 */
function generateStage() {
    try {
        const directory = document.getElementById('genStageDir').value || "";
        const defaultZoom = parseFloat(document.getElementById('genStageZoom').value) || 0.9;
        const stageUI = document.getElementById('genStageUI').value || "";
        const camSpeed = parseFloat(document.getElementById('genStageCamSpeed').value) || 1;
        const hideGF = document.getElementById('genStageHideGF').checked;

        const bfX = parseInt(document.getElementById('genStageBFX').value) || 770;
        const bfY = parseInt(document.getElementById('genStageBFY').value) || 100;
        const gfX = parseInt(document.getElementById('genStageGFX').value) || 400;
        const gfY = parseInt(document.getElementById('genStageGFY').value) || 130;
        const dadX = parseInt(document.getElementById('genStageDadX').value) || 100;
        const dadY = parseInt(document.getElementById('genStageDadY').value) || 100;

        const bfCamX = parseInt(document.getElementById('genStageBFCamX').value) || 0;
        const bfCamY = parseInt(document.getElementById('genStageBFCamY').value) || 0;
        const gfCamX = parseInt(document.getElementById('genStageGFCamX').value) || 0;
        const gfCamY = parseInt(document.getElementById('genStageGFCamY').value) || 0;
        const dadCamX = parseInt(document.getElementById('genStageDadCamX').value) || 0;
        const dadCamY = parseInt(document.getElementById('genStageDadCamY').value) || 0;

        const stage = {
            directory: directory,
            defaultZoom: defaultZoom,
            stageUI: stageUI,
            boyfriend: [bfX, bfY],
            girlfriend: [gfX, gfY],
            opponent: [dadX, dadY],
            hide_girlfriend: hideGF,
            camera_boyfriend: [bfCamX, bfCamY],
            camera_opponent: [dadCamX, dadCamY],
            camera_girlfriend: [gfCamX, gfCamY],
            camera_speed: camSpeed,
            preload: {}
        };

        document.getElementById('outputGenStage').value = JSON.stringify(stage, null, '\t');
        state.generation.stage = stage;
        document.getElementById('downloadGenStageBtn').disabled = false;

        showStatus('✅ Stage generated successfully!', 'success', 'genStageStatus');
    } catch (error) {
        showStatus('❌ Generation error: ' + error.message, 'error', 'genStageStatus');
        console.error(error);
    }
}

/**
 * Download generated stage
 */
function downloadGenStage() {
    if (!state.generation.stage) {
        showStatus('❌ No stage to download', 'error', 'genStageStatus');
        return;
    }

    const filename = 'stage.json';
    downloadJSON(state.generation.stage, filename);
    showStatus('✅ Stage download started!', 'success', 'genStageStatus');
}

/**
 * Clear stage generator fields
 */
function clearGenStage() {
    document.getElementById('outputGenStage').value = '';
    document.getElementById('downloadGenStageBtn').disabled = true;
    state.generation.stage = null;
    hideStatus('genStageStatus');
}

// ==================== LUA GENERATOR ====================

/**
 * Update Lua template UI
 */
function updateLuaTemplate() {
    const template = document.querySelector('input[name="luaTemplate"]:checked').value;
    
    document.getElementById('luaTemplate1').classList.toggle('active', template === 'ghost');
    document.getElementById('luaTemplate2').classList.toggle('active', template === 'camera');
    document.getElementById('luaTemplate3').classList.toggle('active', template === 'hud');
    document.getElementById('luaTemplate4').classList.toggle('active', template === 'custom');

    const descriptions = {
        ghost: 'Creates a ghost tapping effect where a semi-transparent copy of the character appears on note hits.',
        camera: 'Adds camera zoom and shake effects synchronized with the music beat.',
        hud: 'Manages HUD visibility, positioning, and custom elements on screen.',
        custom: 'Template for creating custom events that trigger at specific times during the song.'
    };

    document.getElementById('luaDescText').textContent = descriptions[template];
}

/**
 * Generate Lua script based on selected template
 */
function generateLua() {
    try {
        const template = document.querySelector('input[name="luaTemplate"]:checked').value;
        let luaScript = '';

        switch(template) {
            case 'ghost':
                luaScript = getLuaGhostTemplate();
                break;
            case 'camera':
                luaScript = getLuaCameraTemplate();
                break;
            case 'hud':
                luaScript = getLuaHUDTemplate();
                break;
            case 'custom':
                luaScript = getLuaCustomEventTemplate();
                break;
        }

        document.getElementById('outputGenLua').value = luaScript;
        state.generation.lua = luaScript;
        document.getElementById('downloadGenLuaBtn').disabled = false;

        showStatus('✅ Lua script generated successfully!', 'success', 'genLuaStatus');
    } catch (error) {
        showStatus('❌ Generation error: ' + error.message, 'error', 'genLuaStatus');
        console.error(error);
    }
}

/**
 * Get Ghost Tapping Lua template
 * @returns {string} Lua script
 */
function getLuaGhostTemplate() {
    return `local boyfriendGhostData = {}
local dadGhostData = {}
local gfGhostData = {}

function goodNoteHit(id, direction, noteType, isSustainNote)
    local strumTime = getPropertyFromGroup('notes', id, 'strumTime')
    local noteType = getPropertyFromGroup('notes', id, 'noteType')

    local isGF = getPropertyFromGroup('notes', id, 'gfNote') or noteType == 'Gf Sing'

    -- BOYFRIEND or DAD
    if not isSustainNote and not isGF then
        if strumTime == boyfriendGhostData.strumTime then
            createGhost(getProperty('characterPlayingAsDad') and 'dad' or 'boyfriend')
        end

        boyfriendGhostData.strumTime = strumTime
        updateGData(getProperty('characterPlayingAsDad') and 'dad' or 'boyfriend')
    end

    -- GF
    if not isSustainNote and isGF then
        if strumTime == gfGhostData.strumTime then
            createGhost('gf')
        end

        gfGhostData.strumTime = strumTime
        updateGData('gf')
    end
end

function opponentNoteHit(id, direction, noteType, isSustainNote)
    local strumTime = getPropertyFromGroup('notes', id, 'strumTime')
    local noteType = getPropertyFromGroup('notes', id, 'noteType')

    local isGF = getPropertyFromGroup('notes', id, 'gfNote') or noteType == 'Gf Sing'

    -- DAD or BOYFRIEND
    if not isSustainNote and not isGF then
        if strumTime == dadGhostData.strumTime then
            createGhost(getProperty('characterPlayingAsDad') and 'boyfriend' or 'dad')
        end

        dadGhostData.strumTime = strumTime
        updateGData(getProperty('characterPlayingAsDad') and 'boyfriend' or 'dad')
    end

    -- GF
    if not isSustainNote and isGF then
        if strumTime == gfGhostData.strumTime then
            createGhost('gf')
        end

        gfGhostData.strumTime = strumTime
        updateGData('gf')
    end
end

function createGhost(char)
    local songPos = math.floor(math.abs(getSongPosition()))
    local imageFile = getProperty(char .. '.imageFile')
    local animName = getProperty(char .. '.animation.curAnim.name')
    local isMultiAtlas = getProperty(char .. '.isMultiAtlas')
    local newPath = isMultiAtlas and (imageFile:match("(.+)/[^/]+$") or imageFile) .. '/' .. animName or imageFile

    local ghostTag = char .. 'Ghost' .. songPos
    makeAnimatedLuaSprite(ghostTag, newPath, getProperty(char .. '.x'), getProperty(char .. '.y'))
    addLuaSprite(ghostTag, false)

    setProperty(ghostTag .. '.scale.x', getProperty(char .. '.scale.x'))
    setProperty(ghostTag .. '.scale.y', getProperty(char .. '.scale.y'))
    setProperty(ghostTag .. '.flipX', getProperty(char .. '.flipX'))
    setProperty(ghostTag .. '.antialiasing', getProperty(char .. '.antialiasing'))
    if getProperty('inSilhouette') then
        setProperty(ghostTag .. '.color', 0x000000)
    end
    setProperty(ghostTag .. '.alpha', getProperty(char .. '.alpha'))
    setProperty(ghostTag .. '.blend', getProperty(char .. '.blend'))
    setProperty(ghostTag .. '.shader', getProperty(char .. '.shader'))
    doTweenAlpha(ghostTag .. 'delete', ghostTag, 0, 0.4)

    local data = getGhostData(char)
    setProperty(ghostTag .. '.animation.frameName', data.frameName)
    setProperty(ghostTag .. '.offset.x', data.offsetX)
    setProperty(ghostTag .. '.offset.y', data.offsetY)
    setObjectOrder(ghostTag, getObjectOrder(char .. 'Group') - 1)
end

function onTweenCompleted(tag)
    if tag:sub(-6) == 'delete' then
        removeLuaSprite(tag:sub(1, -7), true)
    end
end

function updateGData(char)
    local data = getGhostData(char)
    data.frameName = getProperty(char .. '.animation.frameName')
    data.offsetX = getProperty(char .. '.offset.x')
    data.offsetY = getProperty(char .. '.offset.y')
end

function getGhostData(char)
    if char == 'boyfriend' then
        return boyfriendGhostData
    elseif char == 'dad' then
        return dadGhostData
    elseif char == 'gf' then
        return gfGhostData
    end
end`;
}

/**
 * Get Camera Effects Lua template
 * @returns {string} Lua script
 */
function getLuaCameraTemplate() {
    return `-- Camera Zoom and Shake Script
local zoomAmount = 0.03
local hudZoomAmount = 0.05

function onBeatHit()
    -- Zoom on every beat
    if curBeat % 4 == 0 then
        triggerEvent('Add Camera Zoom', zoomAmount, hudZoomAmount)
    end
end

function onEvent(name, value1, value2)
    if name == 'Camera Shake' then
        -- Custom camera shake event
        local intensity = tonumber(value1) or 0.01
        local duration = tonumber(value2) or 0.5
        
        cameraShake('camGame', intensity, duration)
        cameraShake('camHUD', intensity * 0.5, duration)
    end
end

function onCreate()
    -- Initialize camera settings
    setProperty('camGame.zoom', getProperty('defaultCamZoom'))
end`;
}

/**
 * Get HUD Management Lua template
 * @returns {string} Lua script
 */
function getLuaHUDTemplate() {
    return `-- HUD Management Script
function onCreate()
    -- Create custom HUD elements
    makeLuaText('scoreText', 'Score: 0', 0, 20, 680)
    setTextSize('scoreText', 32)
    setTextAlignment('scoreText', 'left')
    addLuaText('scoreText')
    
    makeLuaText('missText', 'Misses: 0', 0, screenWidth - 200, 680)
    setTextSize('missText', 32)
    setTextAlignment('missText', 'right')
    addLuaText('missText')
end

function onUpdatePost()
    -- Update HUD elements
    setTextString('scoreText', 'Score: ' .. score)
    setTextString('missText', 'Misses: ' .. misses)
end

function onEvent(name, value1, value2)
    if name == 'Toggle HUD' then
        -- Toggle HUD visibility
        local visible = value1 == '1' or value1 == 'true'
        setProperty('camHUD.visible', visible)
    end
end`;
}

/**
 * Get Custom Events Lua template
 * @returns {string} Lua script
 */
function getLuaCustomEventTemplate() {
    return `-- Custom Events Template
function onEvent(name, value1, value2)
    if name == 'My Custom Event' then
        -- Handle your custom event here
        debugPrint('Custom event triggered!')
        debugPrint('Value 1: ' .. value1)
        debugPrint('Value 2: ' .. value2)
        
        -- Example: Flash the screen
        if value1 == 'flash' then
            cameraFlash('camOther', 'FFFFFF', 0.5)
        end
        
        -- Example: Change character alpha
        if value1 == 'fade' then
            local targetAlpha = tonumber(value2) or 1
            doTweenAlpha('characterFade', 'boyfriend', targetAlpha, 1, 'linear')
        end
    end
end

function onCreate()
    -- Setup code here
    debugPrint('Custom event script loaded!')
end

function onCreatePost()
    -- Post-creation code here
end`;
}

/**
 * Download generated Lua script
 */
function downloadGenLua() {
    if (!state.generation.lua) {
        showStatus('❌ No script to download', 'error', 'genLuaStatus');
        return;
    }

    const template = document.querySelector('input[name="luaTemplate"]:checked').value;
    const filenames = {
        ghost: 'ghostTapping.lua',
        camera: 'cameraEffects.lua',
        hud: 'hudManager.lua',
        custom: 'customEvents.lua'
    };

    downloadText(state.generation.lua, filenames[template] || 'script.lua');
    showStatus('✅ Lua script download started!', 'success', 'genLuaStatus');
}

/**
 * Clear Lua generator fields
 */
function clearGenLua() {
    document.getElementById('outputGenLua').value = '';
    document.getElementById('downloadGenLuaBtn').disabled = true;
    state.generation.lua = null;
    hideStatus('genLuaStatus');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Download JSON data as file
 * @param {Object} data - Data to download
 * @param {string} filename - Name of the file
 */
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, '\t');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Download text data as file
 * @param {string} text - Text to download
 * @param {string} filename - Name of the file
 */
function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success' or 'error')
 * @param {string} statusId - ID of status element
 */
function showStatus(message, type, statusId) {
    const statusDiv = document.getElementById(statusId);
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';
}

/**
 * Hide status message
 * @param {string} statusId - ID of status element
 */
function hideStatus(statusId) {
    const statusDiv = document.getElementById(statusId);
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}