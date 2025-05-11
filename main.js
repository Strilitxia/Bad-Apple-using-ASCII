(async () => {
  const FPS = 12;

  const playButton = document.getElementById('playButton');
  const audio = document.getElementById('audio');
  const screen = document.getElementById('screen');

  playButton.addEventListener('click', () => {
    audio.play();
  });

  console.log('Loading frames.json...');
  
  try {
    const response = await fetch('frames.json'); // Ensure frames.json is in the root directory
    const framesRLE = await response.json();
    console.log('Frames loaded:', framesRLE.length);

    // Decode RLE
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

    const frames = framesRLE.map(frame => frame.map(decodeRLE));

    // Create screen elements
    const rows = [];
    for (let y = 0; y < frames[0].length; y++) {
      const line = document.createElement('div');
      screen.appendChild(line);
      rows.push(line);
    }

    let isPlaying = false;
    let lastFrameIndex = -1;

    function renderFrame(frameIndex) {
      if (frameIndex === lastFrameIndex) return;
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

    audio.addEventListener('play', () => {
      isPlaying = true;
      playbackLoop();
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
    });

  } catch (err) {
    console.error('Error loading frames.json:', err);
  }
})();
