// ============================================================
// AUDIOFORGE - COMPLETE WORKING VERSION
// ============================================================

console.log('🎵 AudioForge starting...');

// ============================================================
// AUDIO ENGINE
// ============================================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.osc = null;
        this.gain = null;
        this.master = null;
        this.analyser = null;
        this.isPlaying = false;
        this.dataArray = null;
        
        // Settings
        this.settings = {
            frequency: 440,
            waveform: 'sine',
            volume: 0.5,
            attack: 0.1,
            decay: 0.2,
            sustain: 0.7,
            release: 0.5,
            position: { x: 0, y: 0, z: 0 }
        };
        
        this.init();
    }
    
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            this.master = this.ctx.createGain();
            this.master.gain.value = this.settings.volume;
            this.master.connect(this.ctx.destination);
            
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.analyser.connect(this.master);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.updateStatus('Ready');
            console.log('✅ Audio engine ready');
        } catch (e) {
            console.error('Audio init error:', e);
            this.updateStatus('Error');
        }
    }
    
    startContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                console.log('✅ Audio context resumed');
                this.updateStatus('Running');
            });
        } else if (this.ctx && this.ctx.state === 'running') {
            this.updateStatus('Running');
        }
    }
    
    playNote(freq = 440, waveform = 'sine') {
        this.startContext();
        
        if (!this.ctx || this.ctx.state !== 'running') {
            console.warn('Audio not ready');
            return false;
        }
        
        this.stopNote();
        
        try {
            this.osc = this.ctx.createOscillator();
            this.gain = this.ctx.createGain();
            
            this.gain.gain.value = 0;
            
            this.osc.type = waveform || this.settings.waveform;
            this.osc.frequency.value = freq || this.settings.frequency;
            
            this.osc.connect(this.gain);
            this.gain.connect(this.analyser);
            
            const now = this.ctx.currentTime;
            const a = this.settings.attack;
            const d = this.settings.decay;
            const s = this.settings.sustain;
            
            this.gain.gain.setValueAtTime(0, now);
            this.gain.gain.linearRampToValueAtTime(1, now + a);
            this.gain.gain.linearRampToValueAtTime(s, now + a + d);
            
            this.osc.start(now);
            this.isPlaying = true;
            
            console.log(`🎵 Playing: ${freq}Hz, ${waveform}`);
            this.updateStatus('Playing');
            return true;
        } catch (e) {
            console.error('Play error:', e);
            return false;
        }
    }
    
    stopNote() {
        if (!this.isPlaying || !this.osc) {
            this.isPlaying = false;
            return;
        }
        
        try {
            const now = this.ctx.currentTime;
            const r = this.settings.release;
            
            if (this.gain) {
                this.gain.gain.setValueAtTime(this.gain.gain.value, now);
                this.gain.gain.linearRampToValueAtTime(0, now + r);
            }
            
            setTimeout(() => {
                if (this.osc) {
                    try { this.osc.stop(); this.osc.disconnect(); } catch(e) {}
                    this.osc = null;
                }
                if (this.gain) {
                    try { this.gain.disconnect(); } catch(e) {}
                    this.gain = null;
                }
                this.isPlaying = false;
                this.updateStatus('Ready');
            }, r * 1000 + 50);
            
            console.log('⏹️ Stopped');
        } catch (e) {
            console.error('Stop error:', e);
            this.isPlaying = false;
        }
    }
    
    setFrequency(freq) {
        this.settings.frequency = freq;
        if (this.osc) {
            this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01);
        }
    }
    
    setWaveform(wave) {
        this.settings.waveform = wave;
        if (this.osc) {
            this.osc.type = wave;
        }
    }
    
    setVolume(vol) {
        this.settings.volume = vol;
        if (this.master) {
            this.master.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.01);
        }
    }
    
    getAudioData() {
        if (this.analyser && this.isPlaying) {
            this.analyser.getByteTimeDomainData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }
    
    getFrequencyData() {
        if (this.analyser && this.isPlaying) {
            const arr = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(arr);
            return arr;
        }
        return null;
    }
    
    updateStatus(status) {
        const el = document.getElementById('audio-status');
        if (status === 'Running' || status === 'Playing') {
            el.textContent = '🔊 ' + status;
            el.className = 'running';
        } else if (status === 'Ready') {
            el.textContent = '🔇 Ready';
            el.className = '';
        } else {
            el.textContent = '🔇 ' + status;
            el.className = '';
        }
        document.getElementById('status-text').textContent = status;
    }
    
    // MIDI
    async enableMIDI() {
        try {
            const midi = await navigator.requestMIDIAccess();
            for (const entry of midi.inputs.values()) {
                entry.onmidimessage = (msg) => {
                    const [cmd, note, vel] = msg.data;
                    if (cmd === 144 && vel > 0) {
                        const freq = 440 * Math.pow(2, (note - 69) / 12);
                        this.playNote(freq);
                    } else if (cmd === 128 || (cmd === 144 && vel === 0)) {
                        this.stopNote();
                    }
                };
            }
            document.getElementById('midi-status').textContent = '✅ Connected';
            document.getElementById('midi-toggle').textContent = '🎹 MIDI Active';
            document.getElementById('midi-toggle').classList.add('active');
            console.log('✅ MIDI enabled');
        } catch (e) {
            console.error('MIDI error:', e);
            document.getElementById('midi-status').textContent = '❌ Failed';
        }
    }
    
    // Presets
    savePreset() {
        const p = {
            waveform: document.getElementById('waveform').value,
            frequency: parseFloat(document.getElementById('frequency').value),
            gain: parseFloat(document.getElementById('gain').value),
            attack: parseFloat(document.getElementById('attack').value),
            decay: parseFloat(document.getElementById('decay').value),
            sustain: parseFloat(document.getElementById('sustain').value),
            release: parseFloat(document.getElementById('release').value),
        };
        const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preset_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ Preset saved');
    }
    
    loadPreset(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const p = JSON.parse(e.target.result);
                document.getElementById('waveform').value = p.waveform || 'sine';
                document.getElementById('frequency').value = p.frequency || 440;
                document.getElementById('gain').value = p.gain || 0.5;
                document.getElementById('attack').value = p.attack || 0.1;
                document.getElementById('decay').value = p.decay || 0.2;
                document.getElementById('sustain').value = p.sustain || 0.7;
                document.getElementById('release').value = p.release || 0.5;
                document.querySelectorAll('input, select').forEach(el => el.dispatchEvent(new Event('input')));
                console.log('✅ Preset loaded');
            } catch (err) {
                console.error('Load error:', err);
            }
        };
        reader.readAsText(file);
    }
}

// ============================================================
// VISUALIZATION ENGINE
// ============================================================
class VisualizationEngine {
    constructor(audio) {
        this.audio = audio;
        this.canvases = {
            waveform: document.getElementById('waveform-canvas'),
            spectrum: document.getElementById('spectrum-canvas'),
            spatial: document.getElementById('spatial-canvas')
        };
        this.ctx = {};
        
        for (const [key, canvas] of Object.entries(this.canvases)) {
            this.ctx[key] = canvas.getContext('2d');
            this.resize(canvas);
        }
        
        this.fps = 0;
        this.frames = 0;
        this.lastFPS = performance.now();
        
        this.loop();
    }
    
    resize(canvas) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = (rect.width - 16) * dpr;
        canvas.height = (rect.height - 30) * dpr;
        canvas.style.width = (rect.width - 16) + 'px';
        canvas.style.height = (rect.height - 30) + 'px';
        this.ctx[Object.keys(this.canvases).find(k => this.canvases[k] === canvas)].scale(dpr, dpr);
    }
    
    drawWaveform() {
        const canvas = this.canvases.waveform;
        const ctx = this.ctx.waveform;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.clearRect(0, 0, w, h);
        
        const data = this.audio.getAudioData();
        if (!data) {
            ctx.fillStyle = '#444';
            ctx.fillRect(0, h/2 - 1, w, 2);
            return;
        }
        
        ctx.beginPath();
        ctx.strokeStyle = '#6c5ce7';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(108,92,231,0.3)';
        ctx.shadowBlur = 10;
        
        const step = Math.floor(data.length / w);
        for (let i = 0; i < w; i++) {
            const idx = Math.min(i * step, data.length - 1);
            const val = (data[idx] - 128) / 128;
            const y = h/2 + val * h * 0.45;
            i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
        }
        ctx.stroke();
    }
    
    drawSpectrum() {
        const canvas = this.canvases.spectrum;
        const ctx = this.ctx.spectrum;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.clearRect(0, 0, w, h);
        
        const data = this.audio.getFrequencyData();
        if (!data) {
            ctx.fillStyle = '#444';
            ctx.fillRect(0, h - 2, w, 2);
            return;
        }
        
        const bars = Math.min(48, data.length);
        const bw = Math.max(2, w / bars);
        const step = Math.floor(data.length / bars);
        
        for (let i = 0; i < bars; i++) {
            const val = data[i * step] / 255;
            const bh = val * h * 0.9;
            const hue = 240 + val * 60;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.3)`;
            ctx.shadowBlur = 8;
            ctx.fillRect(i * bw, h - bh, bw - 1, bh);
        }
    }
    
    drawSpatial() {
        const canvas = this.canvases.spatial;
        const ctx = this.ctx.spatial;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.clearRect(0, 0, w, h);
        
        const cx = w/2, cy = h/2;
        const r = Math.min(w, h) / 2 - 15;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26,26,46,0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        for (let i = r * 0.25; i < r; i += r * 0.25) {
            ctx.beginPath();
            ctx.arc(cx, cy, i, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.stroke();
        }
        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - r, cy);
        ctx.lineTo(cx + r, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx, cy + r);
        ctx.stroke();
        
        const pos = this.audio.settings.position;
        const scale = r / 10;
        const px = cx + pos.x * scale;
        const py = cy - pos.y * scale;
        
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 20);
        grad.addColorStop(0, 'rgba(108,92,231,0.4)');
        grad.addColorStop(1, 'rgba(108,92,231,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px - 20, py - 20, 40, 40);
        
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#6c5ce7';
        ctx.shadowColor = 'rgba(108,92,231,0.5)';
        ctx.shadowBlur = 20;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px monospace';
        ctx.fillText(`(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`, px + 12, py + 4);
    }
    
    loop() {
        this.frames++;
        const now = performance.now();
        if (now - this.lastFPS > 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastFPS = now;
            document.getElementById('fps-display').textContent = `⚡ ${this.fps} FPS`;
        }
        
        this.drawWaveform();
        this.drawSpectrum();
        this.drawSpatial();
        
        requestAnimationFrame(() => this.loop());
    }
}

// ============================================================
// UI CONTROLLER
// ============================================================
class UIController {
    constructor(audio) {
        this.audio = audio;
        this.keyMap = {
            'q': 60, 'w': 61, 'e': 62, 'r': 63, 't': 64,
            'y': 65, 'u': 66, 'i': 67, 'o': 68, 'p': 69, '[': 70, ']': 71
        };
        
        this.setupControls();
        this.setupKeyboard();
        this.setupButtons();
    }
    
    setupControls() {
        // Frequency
        const freq = document.getElementById('frequency');
        freq.addEventListener('input', () => {
            const v = parseFloat(freq.value);
            document.getElementById('frequency-value').textContent = v + ' Hz';
            this.audio.setFrequency(v);
        });
        
        // Waveform
        document.getElementById('waveform').addEventListener('change', (e) => {
            this.audio.setWaveform(e.target.value);
        });
        
        // Volume
        const gain = document.getElementById('gain');
        gain.addEventListener('input', () => {
            const v = parseFloat(gain.value);
            document.getElementById('gain-value').textContent = Math.round(v * 100) + '%';
            this.audio.setVolume(v);
        });
        
        // Envelope
        ['attack', 'decay', 'sustain', 'release'].forEach(p => {
            const el = document.getElementById(p);
            el.addEventListener('input', () => {
                const v = parseFloat(el.value);
                document.getElementById(p + '-value').textContent = 
                    p === 'sustain' ? v.toFixed(2) : v.toFixed(2) + 's';
                this.audio.settings[p] = v;
            });
        });
        
        // 3D Position
        ['pos-x', 'pos-y', 'pos-z'].forEach(p => {
            const el = document.getElementById(p);
            el.addEventListener('input', () => {
                const v = parseFloat(el.value);
                const axis = p.split('-')[1];
                document.getElementById(p + '-value').textContent = v.toFixed(1);
                this.audio.settings.position[axis] = v;
            });
        });
    }
    
    setupKeyboard() {
        const container = document.getElementById('keyboard');
        const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
        const midi = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
        const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'];
        
        notes.forEach((note, i) => {
            const el = document.createElement('div');
            const isBlack = note.includes('#');
            el.className = `key${isBlack ? ' black' : ''}`;
            
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = keys[i];
            el.appendChild(label);
            
            const play = () => {
                const freq = 440 * Math.pow(2, (midi[i] - 69) / 12);
                this.audio.playNote(freq);
                el.classList.add('active');
            };
            
            const stop = () => {
                el.classList.remove('active');
                this.audio.stopNote();
            };
            
            el.addEventListener('mousedown', (e) => { e.preventDefault(); play(); });
            el.addEventListener('mouseup', stop);
            el.addEventListener('mouseleave', stop);
            el.addEventListener('touchstart', (e) => { e.preventDefault(); play(); });
            el.addEventListener('touchend', (e) => { e.preventDefault(); stop(); });
            
            container.appendChild(el);
        });
        
        // QWERTY
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keyMap && !e.repeat) {
                e.preventDefault();
                const note = this.keyMap[key];
                const idx = Object.values(this.keyMap).indexOf(note);
                const freq = 440 * Math.pow(2, (note - 69) / 12);
                this.audio.playNote(freq);
                document.querySelectorAll('.key')[idx]?.classList.add('active');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keyMap) {
                e.preventDefault();
                const note = this.keyMap[key];
                const idx = Object.values(this.keyMap).indexOf(note);
                document.querySelectorAll('.key')[idx]?.classList.remove('active');
                this.audio.stopNote();
            }
        });
    }
    
    setupButtons() {
        // MIDI
        document.getElementById('midi-toggle').addEventListener('click', () => {
            this.audio.enableMIDI();
        });
        
        // Presets
        document.getElementById('save-preset').addEventListener('click', () => {
            this.audio.savePreset();
        });
        
        document.getElementById('load-preset').addEventListener('click', () => {
            document.getElementById('preset-file').click();
        });
        
        document.getElementById('preset-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.audio.loadPreset(e.target.files[0]);
                e.target.value = '';
            }
        });
        
        // TEST AUDIO BUTTONS
        document.getElementById('test-audio-btn').addEventListener('click', () => {
            this.audio.startContext();
            this.audio.playNote(440, 'sine');
            document.getElementById('test-audio-btn').textContent = '🔊 PLAYING...';
            document.getElementById('test-audio-btn').style.background = '#00b894';
            setTimeout(() => {
                document.getElementById('test-audio-btn').textContent = '🔊 PLAY TEST SOUND';
                document.getElementById('test-audio-btn').style.background = '';
            }, 2000);
        });
        
        document.getElementById('stop-test-btn').addEventListener('click', () => {
            this.audio.stopNote();
            document.getElementById('test-audio-btn').textContent = '🔊 PLAY TEST SOUND';
            document.getElementById('test-audio-btn').style.background = '';
        });
    }
}


const audio = new AudioEngine();
const viz = new VisualizationEngine(audio);
const ui = new UIController(audio);

console.log('✅ AudioForge ready!');
console.log('🎹 Press QWERTY keys or click the keyboard to play!');
console.log('🔊 Click "PLAY TEST SOUND" to test audio!');

// Auto-start on any click
document.addEventListener('click', () => audio.startContext(), { once: true });
document.addEventListener('keydown', () => audio.startContext(), { once: true });