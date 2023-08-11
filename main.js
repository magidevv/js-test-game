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
camera.position.set(2, 2, 5); // Позиція камери
camera.lookAt(1, 3, 0); // Камера спрямована на центр сцени

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

// Завантаження доріжки
const loader = new GLTFLoader();

let trackModel, bodyModel;

loader.load("static/TrackFloor.glb", (gltf) => {
  trackModel = gltf.scene;
  trackModel.scale.set(1, 1, 3);
  scene.add(trackModel);

  // Позиціонування доріжки
  trackModel.position.set(0, -1, 0);

  // Позиціонування чоловічка на центрі доріжки
  bodyModel.position.set(0, 0.5, 0); // Припустимо, що тіло на висоті 0.5
});

loader.load("static/Stickman.glb", (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(0.6, 0.6, 0.6);
  bodyModel.rotation.y = Math.PI; // Поворот тіла на 180 градусів (за ось Y)
  scene.add(bodyModel);
});

// Оновлення сцени та рендеринг
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
