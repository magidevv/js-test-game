import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Створення сцени
const scene = new THREE.Scene();

// Створення камери
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Додавання рендерера
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Додавання освітлення
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Додавання напрямленого світла
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Завантаження моделей
const loader = new GLTFLoader();

let headModel, bodyModel;

loader.load("static/Brain.glb", (gltf) => {
  headModel = gltf.scene;
  headModel.scale.set(0.1, 0.1, 0.1);
  scene.add(headModel);
});

loader.load("static/Stickman.glb", (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(0.1, 0.1, 0.1);
  scene.add(bodyModel);
});

// Оновлення сцени та рендеринг
function animate() {
  requestAnimationFrame(animate);

  if (headModel && bodyModel) {
    // Позиціонування та орієнтація моделей
    
  }

  renderer.render(scene, camera);
}

animate();
