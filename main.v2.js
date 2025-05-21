import * as THREE from './js/three.module.js';
import * as BufferGeometryUtils from './js/BufferGeometryUtils.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';

const scene = new THREE.Scene();

const animatedModels = [];

const loader = new GLTFLoader();
function loadModel(path, position = { x: 0, y: 0, z: 0 }, scale = 1, animate = false) {
	return new Promise((resolve, reject) => {
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

loadModel('./public/assets/models/Donut.glb', { x: -10, y: 3, z: 65 }, 20.0, true);
loadModel('./public/assets/models/meCube.glb', { x: 5, y: 0, z: -10 }, 1.0, true);
loadModel('./public/assets/models/LowPolyInu1.glb', { x: 5, y: 1, z: 5}, 4.0, true);
loadModel('./public/assets/models/ChessScene.glb', { x: 1, y: -2, z: 25 }, 4.0, true);

let astro = null;
let astroAnimation = false;
loader.load('./public/assets/models/astro.glb', (gltf) => {
	astro = gltf.scene;
	astro.position.set(-10, 0, 60);
	astro.scale.set(4.0, 4.0, 4.0);
	scene.add(astro);
});
let computer = null;
loader.load('./public/assets/models/computer.glb', (gltf) => {
	computer = gltf.scene;
	computer.position.set(-55, -55, 110);
	computer.scale.set(8.0, 8.0, 8.0);
	scene.add(computer);
});
let car = null;
loader.load('./public/assets/models/Car001.glb', (gltf) => {
	car = gltf.scene;
	car.position.set(-20, -1, 35);
	car.scale.set(5.0, 5.0, 5.0);
	scene.add(car);
});
let youtube = null;
loader.load('./public/assets/models/youtubeLogo.glb', (gltf) => {
	youtube = gltf.scene;
	youtube.position.set(-30, -10, 75);
	youtube.rotation.y += THREE.MathUtils.degToRad(90);
	youtube.scale.set(4.0, 4.0, 4.0);
	scene.add(youtube);
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
	if (car) {
		const intersects = raycaster.intersectObject(car, true);
		if (intersects.length > 0) {
			car.rotation.y += THREE.MathUtils.degToRad(90);
		}
	}
	if (astro) {
		const intersects = raycaster.intersectObject(astro, true);
		if (intersects.length > 0) {
			astroAnimation = true;
		}
	}
	if (youtube) {
		const intersects = raycaster.intersectObject(youtube, true);
		if (intersects.length > 0) {
			window.open('https://www.youtube.com/@crabdancer3248', '_blank');
		}
	}
});


const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

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

function addCloud() {
	let cloud = null;
	loader.load('./public/assets/models/cloud.glb', (gltf) => {
		cloud = gltf.scene;
		scene.add(cloud);
		const x = THREE.MathUtils.randFloatSpread(200);
		const y = THREE.MathUtils.randFloat(5, 40);
		const z = THREE.MathUtils.randFloatSpread(200);
		cloud.position.set(x, y, z);
		cloud.rotation.set(
			0.0,
			THREE.MathUtils.randFloat(0, Math.PI * 2),
			0.0
		);
	});
}

Array(50).fill().forEach(addCloud);


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

let up = true;

function animate() {
	requestAnimationFrame(animate);

	animatedModels.forEach((model) => {
		model.rotation.y += 0.02;
	});
	if (computer != null) {
	computer.rotation.y += 0.05;
	}
	if (astroAnimation == true && astro != null) {
		astro.position.y += 0.2;
		astro.position.x -= 0.5;
		astro.rotation.y += 0.3;
		astro.rotation.x += 0.3;
		if (astro.position.y >= 50.0) {
			scene.remove(astro);
			astro = null;
		}
	}
	if (youtube != null) {
		if (youtube.position.y >= -5) {
			up = false;
		} else if (youtube.position.y <= -15) {
			up = true;
		}

		if (up) {
			youtube.position.y += 0.1;
			const scale = youtube.scale.x + 0.05;
			youtube.scale.set(scale, scale, scale);
		} else {
			youtube.position.y -= 0.1;
			const scale = youtube.scale.x - 0.05;
			youtube.scale.set(scale, scale, scale);
		}
	}
	renderer.render(scene, camera);
}

animate();
