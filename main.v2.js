import * as THREE from './js/three.module.js';
import * as BufferGeometryUtils from './js/BufferGeometryUtils.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';

const scene = new THREE.Scene();

let astroModel = null;
let mixer = null;
let clock = new THREE.Clock();
let animationDuration = 0;
let currentTime = 0;

const loader = new GLTFLoader();
loader.load('./assets/models/astro.glb',
	(gltf) => {
		console.log('✅ Model loaded');
		astroModel = gltf.scene;
		scene.add(astroModel);

		if (gltf.animations.length) {
			console.log('✅ Animations found:', gltf.animations.map(a => a.name));

			mixer = new THREE.AnimationMixer(astroModel);
			const clip = THREE.AnimationClip.findByName(gltf.animations, 'chilling');

			if (!clip) {
				console.error('❌ Animation "chilling" not found.');
				return;
			}

			const action = mixer.clipAction(clip);
			action.play();
			action.paused = true;
			animationDuration = clip.duration;
			console.log(`✅ Animation "chilling" loaded. Duration: ${animationDuration}s`);
		} else {
			console.warn('⚠️ No animations found in model');
		}
	},
	undefined,
	(error) => {
		console.error('❌ Error loading model:', error);
	}
);

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
const spaceTexture = new THREE.TextureLoader().load('./assets/textures/background.jpg');
scene.background = spaceTexture;

// === Avatar Cube ===
const promTexture = new THREE.TextureLoader().load('./assets/pictures/promFlick.png');
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
window.addEventListener('scroll', moveCamera);
window.addEventListener('load', () => moveCamera());
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Scroll to control animation ===
function onWheel(event) {
	if (!mixer) return;

	const delta = event.deltaY * 0.001;
	currentTime = THREE.MathUtils.clamp(currentTime + delta, 0, animationDuration);
	mixer.setTime(currentTime);
	console.log(`⏱️ Animation time set to: ${currentTime.toFixed(2)}s`);
}
window.addEventListener('wheel', onWheel);

// === Animation Loop ===
function animate() {
	requestAnimationFrame(animate);

	const delta = clock.getDelta();
	if (mixer) {
		mixer.update(delta); // Needed even with manual time setting
	}

	if (astroModel) {
		astroModel.rotation.y += 0.005;
	}

	torus.rotation.x += 0.01;
	torus.rotation.y += 0.01;
	torus.rotation.z += 0.01;

	renderer.render(scene, camera);
}

animate();
