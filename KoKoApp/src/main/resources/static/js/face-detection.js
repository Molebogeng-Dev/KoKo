// === KOKO FACE DETECTION ===
// Loaded as an ES module (the only file in this project that needs
// import syntax) because MediaPipe's tasks-vision package ships as one.
// The rest of the codebase never imports from here directly - everything
// talks through the single window.KokoFaceDetection object at the bottom.
//
// This does FACE DETECTION only (is there a face, roughly where are the
// eyes/nose/mouth) - not face RECOGNITION (whose face is it). Recognition
// is separate, later backend work for delivery verification.
//
// ASSET HOSTING: both the WASM runtime and the model file are served
// from our own Cloudflare R2 bucket, not Google's/jsDelivr's CDN. Two
// reasons, both specifically because KoKo targets low-bandwidth users:
//   1. One less third-party origin to connect to (extra DNS + TLS
//      handshake), which costs more on high-latency mobile connections
//      than it looks like on a fast one.
//   2. R2 has zero egress fees, so serving this to every new sign-up
//      costs nothing regardless of volume - unlike bandwidth from a
//      typical host.
//
// LOAD TIMING: this used to start downloading on every single page
// load, site-wide, whether or not someone ever opened Sign Up. Now it
// only starts once the Sign Up modal is actually opened (see the
// MutationObserver at the bottom) - still early enough that Steps 1-2
// (30-60+ seconds of real typing) give it a head start before anyone
// reaches the camera step, without taxing everyone who never signs up.

// assets bucket from the setup steps is live.
const STATIC_ASSETS_BASE_URL = ""; //${face-library-url}

import {
  FaceLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let faceLandmarker = null;
let loadStarted = false;
let detecting = false;
let animationFrameId = null;
let readyPromise = null;

function initFaceLandmarker() {
  if (loadStarted) return readyPromise;
  loadStarted = true;

  readyPromise = (async function () {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      STATIC_ASSETS_BASE_URL + "/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: STATIC_ASSETS_BASE_URL + "/models/face_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numFaces: 1
    });
  })().catch(function (err) {
    console.error("Face detection failed to load:", err);
  });

  return readyPromise;
}

/**
 * Call this as early as it's reasonable to - right now that's the
 * moment the Sign Up modal opens (see the observer below), not on
 * page load and not only when Step 3 is reached. Safe to call more
 * than once; only the first call actually starts anything.
 **/
function preload() {
  initFaceLandmarker();
}

/**
 * Begins a live detection loop against the given <video> element,
 * calling onFaceStatusChange(hasFace) on every frame once the model is
 * ready. hasFace is a plain boolean - true means FaceLandmarker found a
 * face, which inherently means it located eyes/nose/mouth/jaw as part
 * of its landmark mesh. A non-face image simply produces zero landmarks,
 * which is what makes this an effective gate.
 **/
function start(videoElement, onFaceStatusChange) {
  detecting = true;
  const ready = initFaceLandmarker(); // no-op if preload() already ran

  function detectFrame() {
    if (!detecting) return;

    if (faceLandmarker && videoElement.readyState >= 2) {
      const result = faceLandmarker.detectForVideo(videoElement, performance.now());
      const hasFace = !!(result.faceLandmarks && result.faceLandmarks.length > 0);
      onFaceStatusChange(hasFace);
    }

    animationFrameId = requestAnimationFrame(detectFrame);
  }

  ready.then(function () {
    if (detecting) detectFrame();
  });
}

function stop() {
  detecting = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function isReady() {
  return faceLandmarker !== null;
}

function isLoading() {
  return loadStarted && !isReady();
}

window.KokoFaceDetection = {
  preload: preload,
  start: start,
  stop: stop,
  isReady: isReady,
  isLoading: isLoading
};

// Starts the download the moment the Sign Up panel becomes visible,
// rather than on page load. Guarded so it only ever fires once.
(function () {
  const panelRegister = document.getElementById("panel-register");
  if (!panelRegister) return;

  const observer = new MutationObserver(function () {
    if (panelRegister.classList.contains("active")) {
      preload();
      observer.disconnect();
    }
  });

  observer.observe(panelRegister, { attributes: true, attributeFilter: ["class"] });
})();