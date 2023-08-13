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
camera.position.set(2, 4, 6); // Позиція камери
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

const loader = new GLTFLoader();

let trackModel, bodyModel, mixer, idleAction, runAction;

// Завантаження доріжки
loader.load("static/TrackFloor.glb", (gltf) => {
  trackModel = gltf.scene;
  trackModel.scale.set(1, 1, 4);
  trackModel.position.set(0, 0, 3); // Позиціонування доріжки
  scene.add(trackModel);
});

// Створення матеріалу з помаранчевим коліром
const orangeMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

// Завантаження чоловічка
loader.load("static/Stickman.glb", (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(0.8, 0.8, 0.8);
  bodyModel.traverse((child) => {
    if (child.isMesh) {
      child.material = orangeMaterial; // Встановлення матеріалу на модель
    }
  });
  bodyModel.rotation.y = Math.PI; // Поворот тіла на 180 градусів (за ось Y)
  scene.add(bodyModel);

  // Створення анімаційної системи
  mixer = new THREE.AnimationMixer(bodyModel);

  // Отримання анімацій за індексами
  const animations = gltf.animations;
  idleAction = mixer.clipAction(animations[3]); // Анімація стоїть за індексом 3
  runAction = mixer.clipAction(animations[4]); // Анімація бігу за індексом 4
  idleAction.play(); // Початково відтворюємо анімацію стоїть
});

// Додавання тексту "SWIPE TO START"
const textTexture = new THREE.TextureLoader().load(
  "static/Tutorial_SWIPE TO START.png"
);
const textGeometry = new THREE.PlaneGeometry(3, 0.3); // Розмір площини
const textMaterial = new THREE.MeshBasicMaterial({
  map: textTexture,
  transparent: true,
});
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(1.5, 1.8, 3); // Позиція тексту внизу сцени
textMesh.lookAt(2.5, 4, 9);
scene.add(textMesh);

// Додавання пальця
const fingerTexture = new THREE.TextureLoader().load(
  "static/Tutorial_Hand.png"
);
const fingerGeometry = new THREE.PlaneGeometry(0.6, 0.6); // Розмір площини пальця
const fingerMaterial = new THREE.MeshBasicMaterial({
  map: fingerTexture,
  transparent: true,
});
const fingerMesh = new THREE.Mesh(fingerGeometry, fingerMaterial);
fingerMesh.position.set(1.5, 1.2, 3); // Позиція пальця нижче тексту
fingerMesh.lookAt(2.5, 4, 9);
scene.add(fingerMesh);

// Анімація пальця (рух вліво-право)
let fingerDirection = 1; // Напрямок руху пальця (1 - праворуч, -1 - ліворуч)
const fingerSpeed = 0.03; // Швидкість руху пальця

function animateFinger() {
  fingerMesh.translateX(fingerDirection * fingerSpeed);

  if (fingerMesh.position.x > 2 || fingerMesh.position.x < 1) {
    fingerDirection *= -1; // Зміна напрямку руху на протилежний при досягненні краю
  }
}

// Завантаження моделі мозку
const brainLoader = new GLTFLoader();
const brainModels = [];

// Масив матеріалів для різних кольорів мозків
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xffa500 }), // Оранжевий
  new THREE.MeshStandardMaterial({ color: 0x0000ff }), // Синій
  new THREE.MeshStandardMaterial({ color: 0x800080 }), // Фіолетовий
];

// Змінна для відстеження часу для генерації ігрових предметів
let lastSpawnTime = 0;

// Змінна для відстеження інтервалу генерації ігрових предметів
const spawnInterval = 1000;

// Функція для генерації ігрового предмета
function spawnGameItem() {
  const randomColorIndex = Math.floor(Math.random() * 3); // Випадковий вибір індексу кольору (0, 1 або 2)
  const randomMaterial = materials[randomColorIndex];

  brainLoader.load("static/Brain.glb", (gltf) => {
    const brainModel = gltf.scene;
    brainModel.scale.set(1.5, 1.5, 1.5); // Збільшення мозку
    brainModel.traverse((child) => {
      if (child.isMesh) {
        child.material = randomMaterial; // Застосування вибраного матеріалу
      }
    });

    // Встановлення позиції на доріжці (попереду чоловічка)
    const possibleXPositions = [-3, 0, 3]; // Опції можливих позицій по X
    const randomXIndex = Math.floor(Math.random() * possibleXPositions.length);
    const randomX = possibleXPositions[randomXIndex];
    brainModel.position.set(randomX, 1, -15); // Припустимо, що доріжка починається з -10 по Z

    scene.add(brainModel);
    brainModels.push(brainModel); // Додати мізку в масив для відстеження
  });
}

// Функція для зміни кольору моделі тіла
function changeBodyColor(color) {
  bodyModel.traverse((child) => {
    if (child.isMesh) {
      child.material = color; // Встановлення матеріалу на модель
    }
  });
}

// Перевірка взаємодії між мізками та чоловічком
function checkCollisions() {
  for (let i = brainModels.length - 1; i >= 0; i--) {
    const brainModel = brainModels[i];
    const distance = brainModel.position.distanceTo(bodyModel.position);
    if (distance < 1.05) {
      brainModel.traverse((child) => {
        if (child.isMesh) {
          changeBodyColor(child.material); // Зміна кольору чоловічка
        }
      });

      // Визначте відстань, при якій вважатимете, що мізка досягла чоловічка
      // Видаляйте мізку зі сцени та з масиву
      scene.remove(brainModel);
      brainModels.splice(i, 1);
    }
  }
}

// Змінна для відстеження натискання на екран
let isPressed = false;

// Функція для обробки натискання на екран
function handleScreenPress() {
  if (!isPressed && mixer) {
    isPressed = true;

    // Приховати текст і палець
    textMesh.visible = false;
    fingerMesh.visible = false;

    // Зупинка анімації стоїть
    idleAction.stop();

    // Змінити позицію камери
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 3, 0);

    // Початок анімації бігу
    runAction.play();

    // Очищення сцени від попередніх ігрових предметів
    scene.children.forEach((child) => {
      if (child.isBrainModel) {
        scene.remove(child);
      }
    });
  }
}

// Додати обробник натискання на екран
document.addEventListener("click", handleScreenPress);

// Оновлення сцени та рендеринг
function animate() {
  requestAnimationFrame(animate);

  if (!isPressed) {
    animateFinger(); // Виклик функції анімації пальця, якщо екран не був натиснутий
  }

  // Оновлення анімаційної системи
  if (mixer) {
    mixer.update(0.01);
  }

  // Генерація ігрових предметів з інтервалом
  const currentTime = Date.now();
  if (isPressed && currentTime - lastSpawnTime >= spawnInterval) {
    spawnGameItem();
    lastSpawnTime = currentTime;
  }

  // Оновлення позиції мізок
  for (const brainModel of brainModels) {
    brainModel.position.z += 0.05; // Рух мізки в напрямку до чоловічка
  }

  checkCollisions(); // Перевірка взаємодії між мізками та чоловічком

  renderer.render(scene, camera);
}

animate();
