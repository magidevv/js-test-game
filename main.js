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

// Додавання тексту "SWIPE TO START"
const textTexture = new THREE.TextureLoader().load('static/Tutorial_SWIPE TO START.png');
const textGeometry = new THREE.PlaneGeometry(3, 0.3);  // Розмір площини
const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(1, 1, 1);  // Позиція тексту внизу сцени
textMesh.lookAt(2, 0, 6);
scene.add(textMesh);

// Додавання пальця
const fingerTexture = new THREE.TextureLoader().load('static/Tutorial_Hand.png');
const fingerGeometry = new THREE.PlaneGeometry(0.5, 0.5);  // Розмір площини пальця
const fingerMaterial = new THREE.MeshBasicMaterial({ map: fingerTexture, transparent: true });
const fingerMesh = new THREE.Mesh(fingerGeometry, fingerMaterial);
fingerMesh.position.set(1, 0.5, 1);  // Позиція пальця нижче тексту
fingerMesh.lookAt(2, 0, 6);
scene.add(fingerMesh);

// Анімація пальця (рух вліво-право)
let fingerDirection = 1;  // Напрямок руху пальця (1 - праворуч, -1 - ліворуч)
const fingerSpeed = 0.03;  // Швидкість руху пальця

function animateFinger() {
  fingerMesh.translateX(fingerDirection * fingerSpeed);
  
  if (fingerMesh.position.x > 1.5 || fingerMesh.position.x < 0.5) {
    fingerDirection *= -1;  // Зміна напрямку руху на протилежний при досягненні краю
  }
}

// Оновлення сцени та рендеринг
function animate() {
  requestAnimationFrame(animate);
  animateFinger();  // Виклик функції анімації пальця
  renderer.render(scene, camera);
}

animate();
