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

// === Stars ===
function addStar() {
	const star = new THREE.Mesh(
		new THREE.SphereGeometry(0.25, 24, 24),
		new THREE.MeshStandardMaterial({ color: 0xffffff })
	);

	const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
	star.position.set(x, y, z);
	scene.add(star);
}

Array(200).fill().forEach(addStar);

// === Background ===
const spaceTexture = new THREE.TextureLoader().load('./public/assets/textures/background.jpg');
scene.background = spaceTexture;


const promTexture = new THREE.TextureLoader().load('./public/assets/pictures/promFlick.png');
let meCube = null;
loader.load('./public/assets/models/meCube.glb', (gltf) => {
	meCube = gltf.scene;
	meCube.position.set(2, 0, -5);
	scene.add(meCube);
});

// === Scroll-based Camera Movement ===
function moveCamera() {
	const t = document.body.getBoundingClientRect().top;

	meCube.rotation.x += 0.01;
	meCube.rotation.y += 0.01;

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

	renderer.render(scene, camera);
}

animate();
