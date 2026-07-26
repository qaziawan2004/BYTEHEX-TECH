  'use strict';

  /* ============================================================
     STATE
  ============================================================ */
  const state = {
    waveform:'sine',
    octave:0,
    oscDetune:0,        // cents
    oscGlide:0,         // seconds
    filterCutoff:2400,  // Hz
    filterQ:1,
    envAttack:0.02,
    envDecay:0.18,
    envSustain:0.65,
    envRelease:0.3,
    spatialX:0,          // -1..1
    spatialZ:0,          // -1..1 (0 = default distance)
    spatialElevation:0,  // -1..1
    masterVolume:0.7,
    micDrive:0.3,
    micDelay:0.25,
    micFeedback:0.3,
    micMix:0.8,
    seqTempo:120
  };

  let audioCtx=null, masterGain=null, filterNode=null, pannerNode=null, analyser=null;
  let waveData=null, freqData=null;
  let micStream=null, micSource=null, micGain=null, micDriveNode=null, micDelayNode=null, micFeedbackGain=null, micWetGain=null;
  let recDest=null, recorder=null, recChunks=[], recStartTime=0, recTimerId=null;
  let noiseBufferCache=null;
  const activeVoices = new Map();
  let lastFreq = 261.63;

  /* ============================================================
     KNOB COMPONENT
  ============================================================ */
  // Fixed 270-degree arc path (gap at bottom), r=40, center (50,50)
  const ARC_D = "M 21.716 78.284 A 40 40 0 1 1 78.284 78.284";

  function formatVal(v, decimals, unit){
    return v.toFixed(decimals) + (unit||'');
  }

  function createKnob(container, opts){
    // opts: id,label,min,max,value,curve('linear'|'exp'),decimals,unit,onChange
    const curve = opts.curve || 'linear';
    const decimals = opts.decimals != null ? opts.decimals : 2;

    const wrap = document.createElement('div');
    wrap.className = 'knob-unit';
    wrap.innerHTML =
      '<div class="knob">' +
        '<svg viewBox="0 0 100 100">' +
          '<path class="knob-track" d="'+ARC_D+'"></path>' +
          '<path class="knob-fill" d="'+ARC_D+'"></path>' +
        '</svg>' +
        '<div class="knob-body"><div class="knob-pointer"></div></div>' +
      '</div>' +
      '<div class="knob-value"></div>' +
      '<div class="knob-label">'+opts.label+'</div>';
    container.appendChild(wrap);

    const knobEl = wrap.querySelector('.knob');
    const fillPath = wrap.querySelector('.knob-fill');
    const pointer = wrap.querySelector('.knob-pointer');
    const valueEl = wrap.querySelector('.knob-value');
    const fillLen = fillPath.getTotalLength();
    fillPath.style.strokeDasharray = fillLen;

    function toFrac(v){
      if(curve==='exp'){
        return Math.log(v/opts.min) / Math.log(opts.max/opts.min);
      }
      return (v - opts.min) / (opts.max - opts.min);
    }
    function fromFrac(f){
      f = Math.min(1, Math.max(0, f));
      if(curve==='exp'){
        return opts.min * Math.pow(opts.max/opts.min, f);
      }
      return opts.min + f * (opts.max - opts.min);
    }

    let frac = toFrac(opts.value);

    function render(){
      const offset = fillLen * (1 - frac);
      fillPath.style.strokeDashoffset = offset;
      const deg = -135 + frac * 270;
      pointer.style.transform = 'translateX(-50%) rotate(' + deg + 'deg)';
      const actual = fromFrac(frac);
      valueEl.textContent = formatVal(actual, decimals, opts.unit);
      return actual;
    }

    const api = {
      value: opts.value,
      setValue(v, silent){
        frac = toFrac(v);
        const actual = render();
        api.value = actual;
        if(!silent && opts.onChange) opts.onChange(actual);
      }
    };
    render();

    let dragging=false, startY=0, startFrac=0;
    function pointerDown(e){
      dragging=true; startY = e.clientY; startFrac = frac;
      knobEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
    function pointerMove(e){
      if(!dragging) return;
      const dy = startY - e.clientY;
      frac = Math.min(1, Math.max(0, startFrac + dy/140));
      const actual = render();
      api.value = actual;
      if(opts.onChange) opts.onChange(actual);
    }
    function pointerUp(e){
      dragging=false;
      try{ knobEl.releasePointerCapture(e.pointerId); }catch(err){}
    }
    knobEl.addEventListener('pointerdown', pointerDown);
    knobEl.addEventListener('pointermove', pointerMove);
    knobEl.addEventListener('pointerup', pointerUp);
    knobEl.addEventListener('pointercancel', pointerUp);
    knobEl.addEventListener('wheel', function(e){
      e.preventDefault();
      frac = Math.min(1, Math.max(0, frac - Math.sign(e.deltaY)*0.02));
      const actual = render();
      api.value = actual;
      if(opts.onChange) opts.onChange(actual);
    }, {passive:false});

    return api;
  }

  /* ============================================================
     BUILD KNOBS
  ============================================================ */
  const knobs = {};

  knobs.oscDetune = createKnob(document.getElementById('oscKnobs'), {
    label:'Detune', min:-50, max:50, value:state.oscDetune, decimals:0, unit:'ct',
    onChange:(v)=>{ state.oscDetune = v; }
  });
  knobs.oscGlide = createKnob(document.getElementById('oscKnobs'), {
    label:'Glide', min:0, max:0.5, value:state.oscGlide, decimals:2, unit:'s',
    onChange:(v)=>{ state.oscGlide = v; }
  });

  knobs.filterCutoff = createKnob(document.getElementById('filterKnobs'), {
    label:'Cutoff', min:80, max:12000, value:state.filterCutoff, curve:'exp', decimals:0, unit:'Hz',
    onChange:(v)=>{ state.filterCutoff = v; if(filterNode) filterNode.frequency.setTargetAtTime(v, audioCtx.currentTime, 0.01); }
  });
  knobs.filterQ = createKnob(document.getElementById('filterKnobs'), {
    label:'Resonance', min:0.1, max:20, value:state.filterQ, decimals:1, unit:'',
    onChange:(v)=>{ state.filterQ = v; if(filterNode) filterNode.Q.setTargetAtTime(v, audioCtx.currentTime, 0.01); }
  });

  knobs.envAttack = createKnob(document.getElementById('envKnobs'), {
    label:'Attack', min:0.001, max:2, value:state.envAttack, curve:'exp', decimals:3, unit:'s',
    onChange:(v)=>{ state.envAttack = v; }
  });
  knobs.envDecay = createKnob(document.getElementById('envKnobs'), {
    label:'Decay', min:0.001, max:2, value:state.envDecay, curve:'exp', decimals:3, unit:'s',
    onChange:(v)=>{ state.envDecay = v; }
  });
  knobs.envSustain = createKnob(document.getElementById('envKnobs'), {
    label:'Sustain', min:0, max:1, value:state.envSustain, decimals:2, unit:'',
    onChange:(v)=>{ state.envSustain = v; }
  });
  knobs.envRelease = createKnob(document.getElementById('envKnobs'), {
    label:'Release', min:0.001, max:3, value:state.envRelease, curve:'exp', decimals:3, unit:'s',
    onChange:(v)=>{ state.envRelease = v; }
  });

  knobs.spatialElevation = createKnob(document.getElementById('spatialKnobs'), {
    label:'Elevation', min:-1, max:1, value:state.spatialElevation, decimals:2, unit:'',
    onChange:(v)=>{ state.spatialElevation = v; updatePanner(); }
  });

  knobs.masterVolume = createKnob(document.getElementById('masterKnobs'), {
    label:'Volume', min:0, max:1, value:state.masterVolume, decimals:2, unit:'',
    onChange:(v)=>{ state.masterVolume = v; if(masterGain) masterGain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.01); }
  });

  knobs.micDrive = createKnob(document.getElementById('micKnobs'), {
    label:'Drive', min:0, max:1, value:state.micDrive, decimals:2, unit:'',
    onChange:(v)=>{ state.micDrive = v; if(micDriveNode) micDriveNode.curve = makeDistortionCurve(v); }
  });
  knobs.micDelay = createKnob(document.getElementById('micKnobs'), {
    label:'Delay', min:0.02, max:0.6, value:state.micDelay, decimals:2, unit:'s',
    onChange:(v)=>{ state.micDelay = v; if(micDelayNode) micDelayNode.delayTime.setTargetAtTime(v, audioCtx.currentTime, 0.02); }
  });
  knobs.micFeedback = createKnob(document.getElementById('micKnobs'), {
    label:'Feedback', min:0, max:0.85, value:state.micFeedback, decimals:2, unit:'',
    onChange:(v)=>{ state.micFeedback = v; if(micFeedbackGain) micFeedbackGain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.02); }
  });
  knobs.micMix = createKnob(document.getElementById('micKnobs'), {
    label:'Mix', min:0, max:1, value:state.micMix, decimals:2, unit:'',
    onChange:(v)=>{ state.micMix = v; if(micWetGain) micWetGain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.02); }
  });

  knobs.seqTempo = createKnob(document.getElementById('seqKnobs'), {
    label:'Tempo', min:60, max:200, value:state.seqTempo, decimals:0, unit:'bpm',
    onChange:(v)=>{ state.seqTempo = v; }
  });

  /* ============================================================
     WAVEFORM + OCTAVE CONTROLS
  ============================================================ */
  document.getElementById('waveSelect').addEventListener('click', (e)=>{
    const btn = e.target.closest('.wave-btn');
    if(!btn) return;
    document.querySelectorAll('.wave-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.waveform = btn.dataset.wave;
  });

  const octValEl = document.getElementById('octVal');
  document.getElementById('octUp').addEventListener('click', ()=>{
    state.octave = Math.min(3, state.octave+1); octValEl.textContent = state.octave;
  });
  document.getElementById('octDown').addEventListener('click', ()=>{
    state.octave = Math.max(-3, state.octave-1); octValEl.textContent = state.octave;
  });

  /* ============================================================
     XY PAD (SPATIAL)
  ============================================================ */
  const xyPad = document.getElementById('xyPad');
  const xyDot = document.getElementById('xyDot');
  function setXY(fracX, fracZ){
    // fracX/fracZ in -1..1
    state.spatialX = fracX;
    state.spatialZ = fracZ;
    xyDot.style.left = ((fracX+1)/2*100) + '%';
    xyDot.style.top = ((fracZ+1)/2*100) + '%';
    updatePanner();
  }
  function xyFromEvent(e){
    const rect = xyPad.getBoundingClientRect();
    const fx = ((e.clientX - rect.left)/rect.width)*2 - 1;
    const fy = ((e.clientY - rect.top)/rect.height)*2 - 1;
    setXY(Math.min(1,Math.max(-1,fx)), Math.min(1,Math.max(-1,fy)));
  }
  let xyDragging=false;
  xyPad.addEventListener('pointerdown', (e)=>{ xyDragging=true; xyPad.setPointerCapture(e.pointerId); xyFromEvent(e); });
  xyPad.addEventListener('pointermove', (e)=>{ if(xyDragging) xyFromEvent(e); });
  xyPad.addEventListener('pointerup', (e)=>{ xyDragging=false; try{xyPad.releasePointerCapture(e.pointerId);}catch(err){} });
  setXY(0,0);

  function updatePanner(){
    if(!pannerNode) return;
    const x = state.spatialX * 4;
    const z = state.spatialZ * 4;
    const y = state.spatialElevation * 3;
    const now = audioCtx.currentTime;
    if(pannerNode.positionX){
      pannerNode.positionX.setTargetAtTime(x, now, 0.02);
      pannerNode.positionY.setTargetAtTime(y, now, 0.02);
      pannerNode.positionZ.setTargetAtTime(z, now, 0.02);
    } else {
      pannerNode.setPosition(x,y,z);
    }
  }

  /* ============================================================
     AUDIO ENGINE
  ============================================================ */
  function initAudio(){
    if(audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint:'interactive' });

    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.masterVolume;

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = state.filterCutoff;
    filterNode.Q.value = state.filterQ;

    pannerNode = audioCtx.createPanner();
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 12;
    pannerNode.rolloffFactor = 1;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;
    waveData = new Uint8Array(analyser.fftSize);
    freqData = new Uint8Array(analyser.frequencyBinCount);

    filterNode.connect(pannerNode);
    pannerNode.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    recDest = audioCtx.createMediaStreamDestination();
    analyser.connect(recDest);

    // Mic FX chain: micGain -> waveshaper(drive) -> delay(+feedback) -> micWetGain -> masterGain
    micGain = audioCtx.createGain();
    micGain.gain.value = 1;
    micDriveNode = audioCtx.createWaveShaper();
    micDriveNode.curve = makeDistortionCurve(state.micDrive);
    micDriveNode.oversample = '2x';
    micDelayNode = audioCtx.createDelay(1.0);
    micDelayNode.delayTime.value = state.micDelay;
    micFeedbackGain = audioCtx.createGain();
    micFeedbackGain.gain.value = state.micFeedback;
    micWetGain = audioCtx.createGain();
    micWetGain.gain.value = state.micMix;

    micGain.connect(micDriveNode);
    micDriveNode.connect(micDelayNode);
    micDelayNode.connect(micFeedbackGain);
    micFeedbackGain.connect(micDelayNode);
    micDriveNode.connect(micWetGain);
    micDelayNode.connect(micWetGain);
    micWetGain.connect(masterGain);

    updatePanner();
    initMIDI();
  }

  function makeDistortionCurve(amount){
    const k = amount * 100;
    const n = 2048;
    const curve = new Float32Array(n);
    for(let i=0;i<n;i++){
      const x = (i*2)/n - 1;
      curve[i] = k <= 0.001 ? x : ((3+k)*x*20*(Math.PI/180)) / (Math.PI + k*Math.abs(x));
    }
    return curve;
  }

  function midiToFreq(note){ return 440 * Math.pow(2, (note-69)/12); }

  function noteOn(id, freq){
    if(!audioCtx) return;
    if(activeVoices.has(id)) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = state.waveform;
    const detuneMul = Math.pow(2, state.oscDetune/1200);
    const target = freq * detuneMul;
    if(state.oscGlide > 0){
      osc.frequency.setValueAtTime(lastFreq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1,target), now + state.oscGlide);
    } else {
      osc.frequency.setValueAtTime(target, now);
    }
    lastFreq = target;

    const envGain = audioCtx.createGain();
    envGain.gain.setValueAtTime(0, now);
    envGain.gain.linearRampToValueAtTime(1, now + state.envAttack);
    envGain.gain.linearRampToValueAtTime(
      Math.max(0.0001, state.envSustain),
      now + state.envAttack + state.envDecay
    );

    osc.connect(envGain);
    envGain.connect(filterNode);
    osc.start();

    activeVoices.set(id, { osc, envGain });
  }

  function noteOff(id){
    if(!audioCtx) return;
    const voice = activeVoices.get(id);
    if(!voice) return;
    const now = audioCtx.currentTime;
    const g = voice.envGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0001, now + state.envRelease);
    voice.osc.stop(now + state.envRelease + 0.03);
    activeVoices.delete(id);
  }

  /* ============================================================
     MIC FX (live microphone effects)
  ============================================================ */
  const micToggleBtn = document.getElementById('micToggle');
  const micStatusEl = document.getElementById('micStatus');
  let micOn = false;

  micToggleBtn.addEventListener('click', async ()=>{
    initAudio();
    if(!micOn){
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        micStatusEl.textContent = 'Mic — not supported in this browser';
        return;
      }
      try{
        micStream = await navigator.mediaDevices.getUserMedia({ audio:true });
        micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(micGain);
        micOn = true;
        micToggleBtn.textContent = 'DISABLE MIC';
        micStatusEl.textContent = 'Mic — live. Use headphones to avoid feedback.';
      }catch(err){
        micStatusEl.textContent = 'Mic — unavailable (' + (err && err.message ? err.message : 'permission denied') + ')';
      }
    } else {
      if(micSource) micSource.disconnect();
      if(micStream) micStream.getTracks().forEach(t=>t.stop());
      micStream = null; micSource = null;
      micOn = false;
      micToggleBtn.textContent = 'ENABLE MIC';
      micStatusEl.textContent = 'Mic — off. Use headphones to avoid feedback.';
    }
  });

  /* ============================================================
     RECORDER (captures everything through Master)
  ============================================================ */
  const recToggleBtn = document.getElementById('recToggle');
  const recTimeEl = document.getElementById('recTime');
  const recNoteEl = document.getElementById('recNote');
  const recDownloadWrap = document.getElementById('recDownloadWrap');
  const recPlaybackEl = document.getElementById('recPlayback');
  const recDownloadLink = document.getElementById('recDownloadLink');
  let recording = false;

  function pickRecMime(){
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for(const m of candidates){
      if(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) return m;
    }
    return '';
  }

  function formatRecTime(ms){
    const totalSec = Math.floor(ms/1000);
    const m = String(Math.floor(totalSec/60)).padStart(2,'0');
    const s = String(totalSec%60).padStart(2,'0');
    return m+':'+s;
  }

  function tickRecTimer(){
    recTimeEl.textContent = formatRecTime(performance.now() - recStartTime);
  }

  recToggleBtn.addEventListener('click', ()=>{
    initAudio();
    if(audioCtx.state !== 'running') audioCtx.resume();

    if(!window.MediaRecorder || !recDest){
      recNoteEl.textContent = 'Recording is not supported in this browser.';
      return;
    }

    if(!recording){
      recDownloadWrap.hidden = true;
      recChunks = [];
      const mime = pickRecMime();
      try{
        recorder = mime ? new MediaRecorder(recDest.stream, { mimeType: mime }) : new MediaRecorder(recDest.stream);
      }catch(err){
        recNoteEl.textContent = 'Could not start recorder: ' + (err && err.message ? err.message : 'unknown error');
        return;
      }
      recorder.ondataavailable = (e)=>{ if(e.data && e.data.size) recChunks.push(e.data); };
      recorder.onstop = ()=>{
        const blob = new Blob(recChunks, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        recPlaybackEl.src = url;
        const ext = (recorder.mimeType || '').includes('mp4') ? 'm4a' : (recorder.mimeType || '').includes('ogg') ? 'ogg' : 'webm';
        recDownloadLink.href = url;
        recDownloadLink.download = 'signal-rack-take-' + Date.now() + '.' + ext;
        recDownloadWrap.hidden = false;
        recNoteEl.textContent = 'Recording ready — play it back or download it below.';
      };
      recorder.start();
      recStartTime = performance.now();
      recTimerId = setInterval(tickRecTimer, 250);
      recording = true;
      recToggleBtn.classList.add('recording');
      recNoteEl.textContent = 'Recording everything through Master…';
    } else {
      recorder.stop();
      clearInterval(recTimerId);
      recTimerId = null;
      recording = false;
      recToggleBtn.classList.remove('recording');
    }
  });


  /* ============================================================
     DRUM SYNTHESIS (for the sequencer)
  ============================================================ */
  function getNoiseBuffer(){
    if(noiseBufferCache) return noiseBufferCache;
    const bufferSize = audioCtx.sampleRate * 1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2-1;
    noiseBufferCache = buffer;
    return buffer;
  }

  function triggerKick(time){
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time+0.15);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(1, time);
    g.gain.exponentialRampToValueAtTime(0.001, time+0.28);
    osc.connect(g); g.connect(masterGain);
    osc.start(time); osc.stop(time+0.3);
  }

  function triggerSnare(time){
    const noise = audioCtx.createBufferSource();
    noise.buffer = getNoiseBuffer();
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.9;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.9, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time+0.18);
    noise.connect(bp); bp.connect(ng); ng.connect(masterGain);
    noise.start(time); noise.stop(time+0.2);

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(180, time);
    const og = audioCtx.createGain();
    og.gain.setValueAtTime(0.5, time);
    og.gain.exponentialRampToValueAtTime(0.001, time+0.12);
    osc.connect(og); og.connect(masterGain);
    osc.start(time); osc.stop(time+0.14);
  }

  function triggerHat(time){
    const noise = audioCtx.createBufferSource();
    noise.buffer = getNoiseBuffer();
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time+0.05);
    noise.connect(hp); hp.connect(g); g.connect(masterGain);
    noise.start(time); noise.stop(time+0.06);
  }

  function triggerSeqLead(time, freq){
    const dur = seqStepSeconds() * 0.9;
    const osc = audioCtx.createOscillator();
    osc.type = state.waveform;
    osc.frequency.setValueAtTime(freq * Math.pow(2, state.oscDetune/1200), time);
    const envGain = audioCtx.createGain();
    envGain.gain.setValueAtTime(0, time);
    envGain.gain.linearRampToValueAtTime(1, time + Math.min(state.envAttack, dur*0.4));
    envGain.gain.linearRampToValueAtTime(Math.max(0.0001, state.envSustain), time + Math.min(state.envAttack+state.envDecay, dur*0.7));
    const releaseStart = time + dur;
    envGain.gain.setTargetAtTime(0.0001, releaseStart, Math.max(0.02, state.envRelease/3));
    osc.connect(envGain); envGain.connect(filterNode);
    osc.start(time);
    osc.stop(releaseStart + state.envRelease + 0.05);
  }

  /* ============================================================
     SEQUENCER (multi-track, sample-accurate lookahead clock)
  ============================================================ */
  const SEQ_STEPS = 16;
  const seq = {
    playing:false,
    currentStep:0,
    nextNoteTime:0,
    timerId:null,
    tracks:{
      kick:new Array(SEQ_STEPS).fill(false),
      snare:new Array(SEQ_STEPS).fill(false),
      hat:new Array(SEQ_STEPS).fill(false),
      lead:new Array(SEQ_STEPS).fill(false)
    }
  };
  const SEQ_TRACK_ORDER = ['kick','snare','hat','lead'];
  const SEQ_LEAD_NOTE = 261.63; // C4, shifted by the Oscillator module's octave control

  function seqStepSeconds(){
    return 60 / state.seqTempo / 4; // 16th notes
  }

  function seqScheduleStep(step, time){
    if(seq.tracks.kick[step]) triggerKick(time);
    if(seq.tracks.snare[step]) triggerSnare(time);
    if(seq.tracks.hat[step]) triggerHat(time);
    if(seq.tracks.lead[step]) triggerSeqLead(time, SEQ_LEAD_NOTE * Math.pow(2, state.octave));

    const delayMs = Math.max(0, (time - audioCtx.currentTime) * 1000);
    setTimeout(()=> seqUpdatePlayhead(step), delayMs);
  }

  function seqScheduler(){
    while(seq.nextNoteTime < audioCtx.currentTime + 0.1){
      seqScheduleStep(seq.currentStep, seq.nextNoteTime);
      seq.nextNoteTime += seqStepSeconds();
      seq.currentStep = (seq.currentStep + 1) % SEQ_STEPS;
    }
  }

  function seqUpdatePlayhead(step){
    document.querySelectorAll('.seq-cell').forEach(c=>c.classList.remove('playhead'));
    if(!seq.playing) return;
    document.querySelectorAll('.seq-cell[data-step="'+step+'"]').forEach(c=>c.classList.add('playhead'));
  }

  const seqPlayBtn = document.getElementById('seqPlay');
  seqPlayBtn.addEventListener('click', ()=>{
    initAudio();
    if(audioCtx.state !== 'running') audioCtx.resume();
    if(!seq.playing){
      seq.playing = true;
      seq.currentStep = 0;
      seq.nextNoteTime = audioCtx.currentTime + 0.05;
      seq.timerId = setInterval(seqScheduler, 25);
      seqPlayBtn.textContent = 'STOP';
    } else {
      seq.playing = false;
      clearInterval(seq.timerId);
      seq.timerId = null;
      seqPlayBtn.textContent = 'PLAY';
      document.querySelectorAll('.seq-cell').forEach(c=>c.classList.remove('playhead'));
    }
  });

  const seqGridEl = document.getElementById('seqGrid');
  SEQ_TRACK_ORDER.forEach(track=>{
    const row = document.createElement('div');
    row.className = 'seq-row';
    const label = document.createElement('span');
    label.className = 'seq-row-label';
    label.textContent = track;
    row.appendChild(label);
    for(let i=0;i<SEQ_STEPS;i++){
      const cell = document.createElement('button');
      cell.className = 'seq-cell' + (i % 4 === 0 ? ' beat' : '');
      cell.dataset.track = track;
      cell.dataset.step = i;
      cell.addEventListener('click', ()=>{
        const on = !seq.tracks[track][i];
        seq.tracks[track][i] = on;
        cell.classList.toggle('on', on);
      });
      row.appendChild(cell);
    }
    seqGridEl.appendChild(row);
  });

  /* ============================================================
     POWER
  ============================================================ */
  const powerLed = document.getElementById('powerLed');
  const ctxStatus = document.getElementById('ctxStatus');
  const ctxStatusText = document.getElementById('ctxStatusText');

  function updatePowerUI(){
    const running = audioCtx && audioCtx.state === 'running';
    powerLed.classList.toggle('on', !!running);
    ctxStatus.classList.toggle('live', !!running);
    ctxStatusText.textContent = running ? 'LIVE' : 'STANDBY';
  }

  document.getElementById('powerBtn').addEventListener('click', async ()=>{
    initAudio();
    try{
      if(audioCtx.state === 'running'){ await audioCtx.suspend(); }
      else { await audioCtx.resume(); }
    }catch(err){}
    updatePowerUI();
  });

  /* ============================================================
     PIANO KEYBOARD (on-screen)
  ============================================================ */
  // semitone offsets from C, whether black key, and computer-key label
  const KEY_DEFS = [
    {semi:0, name:'C', key:'A', black:false},
    {semi:1, name:'C#', key:'W', black:true},
    {semi:2, name:'D', key:'S', black:false},
    {semi:3, name:'D#', key:'E', black:true},
    {semi:4, name:'E', key:'D', black:false},
    {semi:5, name:'F', key:'F', black:false},
    {semi:6, name:'F#', key:'T', black:true},
    {semi:7, name:'G', key:'G', black:false},
    {semi:8, name:'G#', key:'Y', black:true},
    {semi:9, name:'A', key:'H', black:false},
    {semi:10,name:'A#', key:'U', black:true},
    {semi:11,name:'B', key:'J', black:false},
    {semi:12,name:'C', key:'K', black:false}
  ];
  const BASE_C4 = 261.63;

  const piano = document.getElementById('piano');
  const whiteDefs = KEY_DEFS.filter(k=>!k.black);
  const blackDefs = KEY_DEFS.filter(k=>k.black);

  whiteDefs.forEach((def)=>{
    const el = document.createElement('div');
    el.className = 'pkey white';
    el.dataset.semi = def.semi;
    el.innerHTML = '<span class="pkey-label">'+def.key+'</span>';
    piano.appendChild(el);
  });
  const whiteWidthPct = 100 / whiteDefs.length;
  blackDefs.forEach((def)=>{
    // position black key based on how many white keys precede it
    const precedingWhites = whiteDefs.filter(w=>w.semi < def.semi).length;
    const el = document.createElement('div');
    el.className = 'pkey black';
    el.dataset.semi = def.semi;
    el.style.left = (precedingWhites*whiteWidthPct - whiteWidthPct*0.31) + '%';
    el.innerHTML = '<span class="pkey-label">'+def.key+'</span>';
    piano.appendChild(el);
  });

  function freqForSemi(semi){
    return BASE_C4 * Math.pow(2, (semi + state.octave*12)/12);
  }
  function highlightSemi(semi, on){
    const el = piano.querySelector('.pkey[data-semi="'+semi+'"]');
    if(el) el.classList.toggle('active', on);
  }

  piano.addEventListener('pointerdown', (e)=>{
    const el = e.target.closest('.pkey');
    if(!el) return;
    initAudio();
    if(audioCtx.state !== 'running') audioCtx.resume();
    const semi = parseInt(el.dataset.semi,10);
    noteOn('note-'+semi, freqForSemi(semi));
    highlightSemi(semi, true);
    el.setPointerCapture(e.pointerId);
  });
  piano.addEventListener('pointerup', (e)=>{
    const el = e.target.closest('.pkey');
    if(!el) return;
    const semi = parseInt(el.dataset.semi,10);
    noteOff('note-'+semi);
    highlightSemi(semi, false);
  });
  piano.addEventListener('pointerleave', (e)=>{
    const el = e.target.closest('.pkey');
    if(!el) return;
    const semi = parseInt(el.dataset.semi,10);
    noteOff('note-'+semi);
    highlightSemi(semi, false);
  }, true);

  /* ============================================================
     COMPUTER KEYBOARD
  ============================================================ */
  const keyToSemi = {};
  KEY_DEFS.forEach(d=>{ keyToSemi[d.key.toLowerCase()] = d.semi; });
  const heldKeys = new Set();

  window.addEventListener('keydown', (e)=>{
    const tag = (e.target.tagName || '').toLowerCase();
    if(tag === 'input' || tag === 'select' || tag === 'textarea') return;
    const k = e.key.toLowerCase();
    if(e.repeat || heldKeys.has(k)) return;
    if(!(k in keyToSemi)) return;
    heldKeys.add(k);
    initAudio();
    if(audioCtx.state !== 'running') audioCtx.resume();
    const semi = keyToSemi[k];
    noteOn('note-'+semi, freqForSemi(semi));
    highlightSemi(semi, true);
  });
  window.addEventListener('keyup', (e)=>{
    const k = e.key.toLowerCase();
    if(!(k in keyToSemi)) return;
    heldKeys.delete(k);
    const semi = keyToSemi[k];
    noteOff('note-'+semi);
    highlightSemi(semi, false);
  });

  /* ============================================================
     MIDI
  ============================================================ */
  const midiStatusEl = document.getElementById('midiStatus');

  function handleMIDIMessage(msg){
    const data = msg.data;
    if(data.length < 2) return;
    const cmd = data[0] & 0xf0;
    const note = data[1];
    const vel = data[2] || 0;
    initAudio();
    if(cmd === 0x90 && vel > 0){
      noteOn('midi-'+note, midiToFreq(note));
    } else if(cmd === 0x80 || (cmd === 0x90 && vel === 0)){
      noteOff('midi-'+note);
    }
  }

  function attachMIDIInputs(access){
    const inputs = Array.from(access.inputs.values());
    inputs.forEach(inp=>{ inp.onmidimessage = handleMIDIMessage; });
    midiStatusEl.textContent = inputs.length
      ? 'MIDI — ' + inputs.length + ' device(s) connected'
      : 'MIDI — ready, no device connected';
  }

  function initMIDI(){
    if(!navigator.requestMIDIAccess){
      midiStatusEl.textContent = 'MIDI — not supported in this browser';
      return;
    }
    navigator.requestMIDIAccess().then((access)=>{
      attachMIDIInputs(access);
      access.onstatechange = ()=> attachMIDIInputs(access);
    }).catch((err)=>{
      midiStatusEl.textContent = 'MIDI — unavailable (' + (err && err.message ? err.message : 'blocked') + ')';
    });
  }
  midiStatusEl.textContent = 'MIDI — power on to connect';

  /* ============================================================
     PRESETS (uses window.storage — private per user)
     Falls back to an in-memory store if window.storage isn't
     available (e.g. this file opened directly outside the
     Claude artifact panel, rather than as a downloaded file).
  ============================================================ */
  const presetNameInput = document.getElementById('presetName');
  const presetListEl = document.getElementById('presetList');
  const presetNoteEl = document.getElementById('presetNote');

  const hasCloudStorage = !!(window.storage && typeof window.storage.set === 'function');
  let storageAPI = window.storage;

  if(!hasCloudStorage){
    // Local, in-memory fallback so the feature still works this session.
    const mem = new Map();
    storageAPI = {
      async set(key, value){ mem.set(key, value); return {key, value, shared:false}; },
      async get(key){
        if(!mem.has(key)) throw new Error('not found');
        return {key, value: mem.get(key), shared:false};
      },
      async delete(key){ mem.delete(key); return {key, deleted:true, shared:false}; },
      async list(prefix){
        const keys = Array.from(mem.keys()).filter(k => !prefix || k.startsWith(prefix));
        return {keys, prefix, shared:false};
      }
    };
    presetNoteEl.textContent = 'Cloud sync unavailable here — presets are saved for this session only.';
  }

  function collectState(){
    return {
      waveform: state.waveform,
      octave: state.octave,
      oscDetune: state.oscDetune,
      oscGlide: state.oscGlide,
      filterCutoff: state.filterCutoff,
      filterQ: state.filterQ,
      envAttack: state.envAttack,
      envDecay: state.envDecay,
      envSustain: state.envSustain,
      envRelease: state.envRelease,
      spatialX: state.spatialX,
      spatialZ: state.spatialZ,
      spatialElevation: state.spatialElevation,
      masterVolume: state.masterVolume,
      micDrive: state.micDrive,
      micDelay: state.micDelay,
      micFeedback: state.micFeedback,
      micMix: state.micMix,
      seqTempo: state.seqTempo,
      seqTracks: seq.tracks
    };
  }

  function applyState(data){
    if(!data) return;
    state.waveform = data.waveform || 'sine';
    document.querySelectorAll('.wave-btn').forEach(b=>b.classList.toggle('active', b.dataset.wave === state.waveform));
    state.octave = data.octave || 0;
    octValEl.textContent = state.octave;

    if(typeof data.oscDetune === 'number') knobs.oscDetune.setValue(data.oscDetune);
    if(typeof data.oscGlide === 'number') knobs.oscGlide.setValue(data.oscGlide);
    if(typeof data.filterCutoff === 'number') knobs.filterCutoff.setValue(data.filterCutoff);
    if(typeof data.filterQ === 'number') knobs.filterQ.setValue(data.filterQ);
    if(typeof data.envAttack === 'number') knobs.envAttack.setValue(data.envAttack);
    if(typeof data.envDecay === 'number') knobs.envDecay.setValue(data.envDecay);
    if(typeof data.envSustain === 'number') knobs.envSustain.setValue(data.envSustain);
    if(typeof data.envRelease === 'number') knobs.envRelease.setValue(data.envRelease);
    if(typeof data.spatialElevation === 'number') knobs.spatialElevation.setValue(data.spatialElevation);
    if(typeof data.masterVolume === 'number') knobs.masterVolume.setValue(data.masterVolume);
    if(typeof data.micDrive === 'number') knobs.micDrive.setValue(data.micDrive);
    if(typeof data.micDelay === 'number') knobs.micDelay.setValue(data.micDelay);
    if(typeof data.micFeedback === 'number') knobs.micFeedback.setValue(data.micFeedback);
    if(typeof data.micMix === 'number') knobs.micMix.setValue(data.micMix);
    if(typeof data.seqTempo === 'number') knobs.seqTempo.setValue(data.seqTempo);

    if(data.seqTracks){
      SEQ_TRACK_ORDER.forEach(track=>{
        if(!Array.isArray(data.seqTracks[track])) return;
        seq.tracks[track] = data.seqTracks[track].slice(0, SEQ_STEPS);
        while(seq.tracks[track].length < SEQ_STEPS) seq.tracks[track].push(false);
        for(let i=0;i<SEQ_STEPS;i++){
          const cell = document.querySelector('.seq-cell[data-track="'+track+'"][data-step="'+i+'"]');
          if(cell) cell.classList.toggle('on', !!seq.tracks[track][i]);
        }
      });
    }

    setXY(data.spatialX || 0, data.spatialZ || 0);
  }


  async function refreshPresetList(){
    try{
      const res = await storageAPI.list('preset:', false);
      presetListEl.innerHTML = '';
      const keys = (res && res.keys) ? res.keys : [];
      keys.forEach(k=>{
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = k.slice('preset:'.length);
        presetListEl.appendChild(opt);
      });
      if(keys.length === 0){
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = '(no presets saved yet)';
        presetListEl.appendChild(opt);
      }
    }catch(err){
      console.error('refreshPresetList failed:', err);
      presetListEl.innerHTML = '';
      const opt = document.createElement('option');
      opt.disabled = true;
      opt.textContent = '(could not load presets)';
      presetListEl.appendChild(opt);
    }
  }

  document.getElementById('savePreset').addEventListener('click', async ()=>{
    const name = presetNameInput.value.trim();
    if(!name){ presetNoteEl.textContent = 'Enter a name first.'; return; }
    try{
      const result = await storageAPI.set('preset:'+name, JSON.stringify(collectState()), false);
      if(result){
        presetNoteEl.textContent = 'Saved "' + name + '".' + (hasCloudStorage ? '' : ' (session only)');
        presetNameInput.value = '';
        await refreshPresetList();
      } else {
        presetNoteEl.textContent = 'Save failed — storage returned no result.';
      }
    }catch(err){
      console.error('savePreset failed:', err);
      presetNoteEl.textContent = 'Save failed: ' + (err && err.message ? err.message : 'unknown error');
    }
  });

  document.getElementById('loadPreset').addEventListener('click', async ()=>{
    const key = presetListEl.value;
    if(!key){ presetNoteEl.textContent = 'Select a preset first.'; return; }
    try{
      const res = await storageAPI.get(key, false);
      if(res && res.value){
        applyState(JSON.parse(res.value));
        presetNoteEl.textContent = 'Loaded "' + key.slice('preset:'.length) + '".';
      }
    }catch(err){
      console.error('loadPreset failed:', err);
      presetNoteEl.textContent = 'That preset could not be found.';
    }
  });

  document.getElementById('deletePreset').addEventListener('click', async ()=>{
    const key = presetListEl.value;
    if(!key){ presetNoteEl.textContent = 'Select a preset first.'; return; }
    try{
      await storageAPI.delete(key, false);
      presetNoteEl.textContent = 'Deleted.';
      await refreshPresetList();
    }catch(err){
      console.error('deletePreset failed:', err);
      presetNoteEl.textContent = 'Delete failed: ' + (err && err.message ? err.message : 'unknown error');
    }
  });

  refreshPresetList();

  /* ============================================================
     MANUAL TOGGLE
  ============================================================ */
  const docsPanel = document.getElementById('docsPanel');
  document.getElementById('manualBtn').addEventListener('click', ()=>{
    docsPanel.hidden = !docsPanel.hidden;
    if(!docsPanel.hidden) docsPanel.scrollIntoView({behavior:'smooth', block:'start'});
  });

  /* ============================================================
     VISUALIZER — oscilloscope + spectrum, 60fps loop
  ============================================================ */
  const waveCanvas = document.getElementById('waveCanvas');
  const freqCanvas = document.getElementById('freqCanvas');
  const waveCtx = waveCanvas.getContext('2d');
  const freqCtx = freqCanvas.getContext('2d');
  const fpsTag = document.getElementById('fpsTag');

  function sizeCanvases(){
    [waveCanvas, freqCanvas].forEach(c=>{
      const rect = c.getBoundingClientRect();
      c.width = Math.max(1, Math.round(rect.width));
      c.height = Math.max(1, Math.round(rect.height));
    });
  }
  window.addEventListener('resize', sizeCanvases);
  sizeCanvases();

  const scopeGreen = '#4dff9e';
  const lineColor = '#34393e';

  let lastFpsT = performance.now(), frameCount = 0;

  function drawWave(){
    const w = waveCanvas.width, h = waveCanvas.height;
    waveCtx.fillStyle = '#15181a';
    waveCtx.fillRect(0,0,w,h);
    waveCtx.strokeStyle = lineColor;
    waveCtx.lineWidth = 1;
    waveCtx.beginPath(); waveCtx.moveTo(0,h/2); waveCtx.lineTo(w,h/2); waveCtx.stroke();

    if(!analyser){ return; }
    analyser.getByteTimeDomainData(waveData);
    waveCtx.beginPath();
    waveCtx.strokeStyle = scopeGreen;
    waveCtx.lineWidth = 2;
    const slice = w / waveData.length;
    let x = 0;
    for(let i=0;i<waveData.length;i++){
      const v = waveData[i] / 128.0;
      const y = v * h/2;
      if(i===0) waveCtx.moveTo(x,y); else waveCtx.lineTo(x,y);
      x += slice;
    }
    waveCtx.stroke();
  }

  function drawFreq(){
    const w = freqCanvas.width, h = freqCanvas.height;
    freqCtx.fillStyle = '#15181a';
    freqCtx.fillRect(0,0,w,h);
    if(!analyser){ return; }
    analyser.getByteFrequencyData(freqData);
    const bars = 48;
    const step = Math.floor(freqData.length / bars);
    const barW = w / bars;
    for(let i=0;i<bars;i++){
      let sum = 0;
      for(let j=0;j<step;j++) sum += freqData[i*step+j];
      const avg = sum/step;
      const bh = (avg/255) * h;
      const hueMix = avg/255;
      freqCtx.fillStyle = hueMix > 0.75 ? '#f5a623' : scopeGreen;
      freqCtx.fillRect(i*barW+1, h-bh, barW-2, bh);
    }
  }

  function loop(now){
    requestAnimationFrame(loop);
    drawWave();
    drawFreq();
    frameCount++;
    if(now - lastFpsT >= 500){
      const fps = Math.round((frameCount*1000)/(now-lastFpsT));
      fpsTag.textContent = fps + ' FPS';
      frameCount = 0; lastFpsT = now;
    }
  }
  requestAnimationFrame(loop);

  updatePowerUI();