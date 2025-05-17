import * as THREE from './js/three.module.js';
import * as BufferGeometryUtils from './js/BufferGeometryUtils.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';

const scene = new THREE.Scene();

const animatedModels = [];

const loader = new GLTFLoader();
function loadModel(path, position = { x: 0, y: 0, z: 0 }, scale = 1, animate = false) {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();
		loader.load(
			path,
			(gltf) => {
				const model = gltf.scene;
				model.position.set(position.x, position.y, position.z);
				model.scale.set(scale, scale, scale);
				scene.add(model);

				if (animate) {
					animatedModels.push(model);
				}

				resolve(model);
			}
		);
	});
}

loadModel('./public/assets/models/astro.glb', { x: -10, y: 0, z: 30 }, 2.0, true);
loadModel('./public/assets/models/Donut.glb', { x: -13, y: 0, z: 30 }, 20.0, true);
loadModel('./public/assets/models/meCube.glb', { x: 5, y: 0, z: -10 }, 1.0, true);
loadModel('./public/assets/models/Car001.glb', { x: 5, y: 3, z: 100 }, 1.0, false);
loadModel('./public/assets/models/LowPolyInu1.glb', { x: 5, y: 1, z: 5}, 2.5, true);
loadModel('./public/assets/models/ChessScene.glb', { x: -15, y: 1, z: 10 }, 4.0, true);

let computer = null;
loader.load('./public/assets/models/computer.glb', (gltf) => {
	computer = gltf.scene;
	computer.position.set(-10, -3, 30);
	computer.scale.set(3.0, 3.0, 3.0);
	scene.add(computer);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	if (computer) {
		const intersects = raycaster.intersectObject(computer, true);
		if (intersects.length > 0) {
			window.open('https://github.com/JamesHarryT', '_blank');
		}
	}
});


const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.setZ(30);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// === Lighting ===
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
scene.add(
	new THREE.PointLightHelper(pointLight),
	new THREE.GridHelper(200, 50)
);

function addCloud() {
	let cloud = null;
	loader.load('./public/assets/models/cloud.glb', (gltf) => {
		cloud = gltf.scene;
		scene.add(cloud);
		const x = THREE.MathUtils.randFloatSpread(100);
		const y = THREE.MathUtils.randFloat(0, 40);
		const z = THREE.MathUtils.randFloat(-0, -50);
		cloud.position.set(x, y, z);
		cloud.rotation.set(
			0.0,
			THREE.MathUtils.randFloat(0, Math.PI * 2),
			0.0
		);
	});
}

Array(100).fill().forEach(addCloud);


// === Background ===
const spaceTexture = new THREE.TextureLoader().load('./public/assets/textures/skyBG.jpeg');
scene.background = spaceTexture;


const promTexture = new THREE.TextureLoader().load('./public/assets/pictures/promFlick.png');

// === Scroll-based Camera Movement ===
function moveCamera() {
	const t = document.body.getBoundingClientRect().top;

	camera.position.z = t * -0.01;
	camera.position.x = t * -0.0002;
	camera.rotation.y = t * -0.0002;
}
window.addEventListener('scroll', moveCamera);
window.addEventListener('load', () => moveCamera());
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation Loop ===
function animate() {
	requestAnimationFrame(animate);

	animatedModels.forEach((model) => {
		model.rotation.y += 0.02;
	});
	if (computer != null) {
	computer.rotation.y += 0.02;
	}
	renderer.render(scene, camera);
}

animate();
