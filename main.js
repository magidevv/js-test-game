import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import brainModel from "./static/Brain.glb";
import stickmanModel from "./static/Stickman.glb";
import trackFloorModel from "./static/TrackFloor.glb";
import tutorialHandImg from "./static/Tutorial_Hand.png";
import tutorialSwipeToStartImg from "./static/Tutorial_SWIPE TO START.png";

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 4, 6);
camera.lookAt(1, 3, 0);

// Add the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const loader = new GLTFLoader();

let trackModel, bodyModel, mixer, idleAction, runAction;

// Load the track
loader.load(trackFloorModel, (gltf) => {
  trackModel = gltf.scene;
  trackModel.scale.set(1, 1, 4);
  trackModel.position.set(0, 0, 3);
  scene.add(trackModel);
});

// Create an orange material
const orangeMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

// Load the stickman model
loader.load(stickmanModel, (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(0.8, 0.8, 0.8);
  bodyModel.traverse((child) => {
    if (child.isMesh) {
      child.material = orangeMaterial; // Set material on the model
    }
  });
  bodyModel.rotation.y = Math.PI; // Rotate the body by 180 degrees (around the Y axis)
  scene.add(bodyModel);

  // Create an animation mixer
  mixer = new THREE.AnimationMixer(bodyModel);

  // Get animations by index
  const animations = gltf.animations;
  idleAction = mixer.clipAction(animations[3]); // "Idle" animation at index 3
  runAction = mixer.clipAction(animations[4]); // "Run" animation at index 4
  idleAction.play(); // Initially play the "Idle" animation
});

// Add the "SWIPE TO START" text
const textTexture = new THREE.TextureLoader().load(tutorialSwipeToStartImg);
const textGeometry = new THREE.PlaneGeometry(3, 0.3); // Plane size
const textMaterial = new THREE.MeshBasicMaterial({
  map: textTexture,
  transparent: true,
});
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(1.5, 1.8, 3); // Text position at the bottom of the scene
textMesh.lookAt(2.5, 4, 9);
scene.add(textMesh);

// Add the finger
const fingerTexture = new THREE.TextureLoader().load(tutorialHandImg);
const fingerGeometry = new THREE.PlaneGeometry(0.6, 0.6);
const fingerMaterial = new THREE.MeshBasicMaterial({
  map: fingerTexture,
  transparent: true,
});
const fingerMesh = new THREE.Mesh(fingerGeometry, fingerMaterial);
fingerMesh.position.set(1.5, 1.2, 3); // Finger position below the text
fingerMesh.lookAt(2.5, 4, 9);
scene.add(fingerMesh);

// Finger animation (left-right movement)
let fingerDirection = 1; // Finger movement direction (1 - right, -1 - left)
const fingerSpeed = 0.03; // Finger movement speed

function animateFinger() {
  fingerMesh.translateX(fingerDirection * fingerSpeed);

  if (fingerMesh.position.x > 2 || fingerMesh.position.x < 1) {
    fingerDirection *= -1; // Change movement direction upon reaching the edge
  }
}

// Load brain models
const brainLoader = new GLTFLoader();
const brainModels = [];

// Array of materials for different brain colors
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xffa500 }), // Orange
  new THREE.MeshStandardMaterial({ color: 0x0000ff }), // Blue
  new THREE.MeshStandardMaterial({ color: 0x800080 }), // Purple
];

// Variables to track brain spawning time and interval
let lastSpawnTime = 0;
const spawnInterval = 1000;

// Function to spawn brains
function spawnBrains() {
  const availablePositions = [-3, 0, 3];
  const randomPositions = [];

  // Select 2 random positions
  while (randomPositions.length < 2) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const randomPosition = availablePositions[randomIndex];

    if (!randomPositions.includes(randomPosition)) {
      randomPositions.push(randomPosition);
    }
  }

  const randomColorIndex = Math.floor(Math.random() * 3);
  const randomMaterial = materials[randomColorIndex];

  for (const randomX of randomPositions) {
    brainLoader.load(brainModel, (gltf) => {
      const brainModel = gltf.scene;
      brainModel.scale.set(1.5, 1.5, 1.5);
      brainModel.traverse((child) => {
        if (child.isMesh) {
          child.material = randomMaterial;
        }
      });

      const yPos = 1;
      const zPos = -15;

      const xPos = randomX;
      brainModel.position.set(xPos, yPos, zPos);

      scene.add(brainModel);
      brainModels.push(brainModel);
    });
  }
}

// Function to change body model color
function changeBodyColor(color) {
  bodyModel.traverse((child) => {
    if (child.isMesh) {
      child.material = color;
    }
  });
}

// Check collisions between brains and the stickman
function checkCollisions() {
  for (let i = brainModels.length - 1; i >= 0; i--) {
    const brainModel = brainModels[i];
    const distance = brainModel.position.distanceTo(bodyModel.position);
    if (distance < 1.1) {
      brainModel.traverse((child) => {
        if (child.isMesh) {
          changeBodyColor(child.material);
        }
      });

      scene.remove(brainModel);
      brainModels.splice(i, 1);
    }
  }
}

let isPressed = false; // Track screen press

// Handle screen press
function handleScreenPress() {
  if (!isPressed && mixer) {
    isPressed = true;

    textMesh.visible = false;
    fingerMesh.visible = false;

    idleAction.stop();

    camera.position.set(0, 5, 5);
    camera.lookAt(0, 3, 0);

    runAction.play();

    scene.children.forEach((child) => {
      if (child.isBrainModel) {
        scene.remove(child);
      }
    });
  }
}

document.addEventListener("click", handleScreenPress);

let isSwiping = false;
let previousCursorX = 0;
let currentCursorX = 0;

const laneWidth = 3;
let currentLane = 0;

// Handle mouse button down event
document.addEventListener("mousedown", (event) => {
  isSwiping = true;
  previousCursorX = event.clientX;
  currentCursorX = event.clientX;
});

// Handle mouse button up event
document.addEventListener("mouseup", () => {
  if (isSwiping) {
    const deltaX = currentCursorX - previousCursorX;

    const newLane = currentLane + Math.sign(deltaX);
    const clampedLane = Math.max(-1, Math.min(1, newLane));

    if (clampedLane !== currentLane) {
      bodyModel.position.x = 0;
      bodyModel.position.x = clampedLane * laneWidth;
      currentLane = clampedLane;
    }

    isSwiping = false;
  }

  previousCursorX = 0;
  currentCursorX = 0;
});

// Handle cursor movement
document.addEventListener("mousemove", (event) => {
  if (isSwiping) {
    currentCursorX = event.clientX;
  }
});

// Update scene and rendering
function animate() {
  requestAnimationFrame(animate);

  if (!isPressed) {
    animateFinger();
  }

  if (mixer) {
    mixer.update(0.01);
  }

  const currentTime = Date.now();
  if (isPressed && currentTime - lastSpawnTime >= spawnInterval) {
    spawnBrains();

    lastSpawnTime = currentTime;
  }

  for (const brainModel of brainModels) {
    brainModel.position.z += 0.05;
  }

  checkCollisions();

  renderer.render(scene, camera);
}

animate();
