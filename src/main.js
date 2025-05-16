import './style.css'; // You added this to import your CSS
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function isWebGLAvailable() {
	try {
		const canvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && (
			canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
		));
	} catch (e) {
		return false;
	}
}

if (!isWebGLAvailable()) {
	const warning = document.createElement('div');
	warning.innerText = 'WebGL is not supported on your browser or device.';
	warning.style.cssText = 'color: white; background: red; padding: 1em; font-family: sans-serif;';
	document.body.appendChild(warning);
	throw new Error('WebGL not supported'); // stop script execution
}


// === Scene Setup ===
const scene = new THREE.Scene();

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

// === Objects ===
const torus = new THREE.Mesh(
	new THREE.TorusGeometry(10, 3, 16, 100),
	new THREE.MeshStandardMaterial({ color: 0xff6347 })
);
scene.add(torus);

// === Lighting ===
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers (for development/debugging)
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
const spaceTexture = new THREE.TextureLoader().load('assets/textures/background.jpg');
scene.background = spaceTexture;

// === Avatar Cube ===
const promTexture = new THREE.TextureLoader().load('assets/pictures/promFlick.png');
const meCube = new THREE.Mesh(
	new THREE.BoxGeometry(3, 3, 3),
	new THREE.MeshBasicMaterial({ map: promTexture })
);
meCube.position.set(2, 0, -5);
scene.add(meCube);

// === Scroll-based Camera Movement ===
function moveCamera() {
	const t = document.body.getBoundingClientRect().top;

	meCube.rotation.x += 0.01;
	meCube.rotation.y += 0.01;

	camera.position.z = t * -0.01;
	camera.position.x = t * -0.0002;
	camera.rotation.y = t * -0.0002;
}
document.body.onscroll = moveCamera;

// === Animation Loop ===
function animate() {
	requestAnimationFrame(animate);

	torus.rotation.x += 0.01;
	torus.rotation.y += 0.01;
	torus.rotation.z += 0.01;

	renderer.render(scene, camera);
}
animate();
