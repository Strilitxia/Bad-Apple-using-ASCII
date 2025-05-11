(async () => {
  const FPS = 12;
  const FRAME_DURATION = 1000 / FPS; // 80ms per frame

  // Fetch the RLE-compressed frames.json
  const res = await fetch('frames.json');
  const framesRLE = await res.json();
  console.log('Loaded', framesRLE.length, 'frames');

  // RLE Decoder Function
  function decodeRLE(s) {
    let out = '', num = '', i = 0;
    while (i < s.length) {
      if (/\d/.test(s[i])) {
        num += s[i++];
      } else {
        const count = num ? parseInt(num, 10) : 1;
        out += s[i].repeat(count);
        num = '';
        i++;
      }
    }
    return out;
  }

  // Pre-decode all frames to reduce work during playback
  console.log('Decoding frames...');
  const frames = framesRLE.map(frame => frame.map(decodeRLE));
  console.log('Decoded all frames.');

  // Set up screen elements
  const screen = document.getElementById('screen');
  const rows = [];
  for (let y = 0; y < frames[0].length; y++) {
    const line = document.createElement('div');
    screen.appendChild(line);
    rows.push(line);
  }

  // Audio Setup
  const audio = document.getElementById('audio');
  let isPlaying = false;
  let lastFrameIndex = -1;

  function renderFrame(frameIndex) {
    if (frameIndex === lastFrameIndex) return; // Skip if already rendered
    lastFrameIndex = frameIndex;

    const frame = frames[frameIndex];
    for (let y = 0; y < frame.length; y++) {
      rows[y].textContent = frame[y];
    }
  }

  function playbackLoop() {
    if (!isPlaying) return;

    const currentTime = audio.currentTime;
    const frameIndex = Math.floor(currentTime * FPS) % frames.length;

    renderFrame(frameIndex);
    requestAnimationFrame(playbackLoop);
  }

  // Start playback when audio starts
  audio.addEventListener('play', () => {
    isPlaying = true;
    playbackLoop();
  });

  // Stop playback when audio pauses
  audio.addEventListener('pause', () => {
    isPlaying = false;
  });

  // Start playback
  audio.play();
})();
