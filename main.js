import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import gsap from 'gsap'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { VRMLLoader } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 9;

const canvas = document.querySelector('.orbit')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const radius = 1.3;
const segments = 64;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]

const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/moonlit_golf_4k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

const Textures = ['/csilla/color.png', '/earth/map.jpg', '/venus/map.jpg', '/volcanic/color.png'];

const spheres = new THREE.Group()
const startTexture = new THREE.TextureLoader().load('/csilla/start.png');
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({
  map: startTexture,
  side: THREE.BackSide,
});
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

const planetMeshes = [];
for (let i = 0; i < 4; i++) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial();
  const sphere = new THREE.Mesh(geometry, material);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(Textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  material.map = texture;

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = 4.5 * Math.cos(angle);
  sphere.position.z = 4.5 * Math.sin(angle);

  planetMeshes.push(sphere);
  spheres.add(sphere);
}
spheres.rotation.x = 0.25;
spheres.position.y = -0.18;
scene.add(spheres)

let currentPlanetIndex = 0;
const totalPlanets = 4;
let isAnimating = false;

const handleKeyPress = (event) => {
  if (event.key === 'ArrowUp' && !isAnimating) {
    navigateToNextPlanet();
  }
  if (event.key === 'ArrowDown' && !isAnimating) {
    navigateToPreviousPlanet();
  }
};

const navigateToNextPlanet = () => {
  isAnimating = true;
  
  currentPlanetIndex = (currentPlanetIndex + 1) % totalPlanets;
  
  gsap.to(spheres.rotation, {
    y: `+=${Math.PI / 2}`,
    duration: 2,
    ease: "expo.easeInOut",
    onComplete: () => {
      isAnimating = false;
    }
  });
  
  updateHeadings('up');
};

const navigateToPreviousPlanet = () => {
  isAnimating = true;
  
  currentPlanetIndex = (currentPlanetIndex - 1 + totalPlanets) % totalPlanets;
  
  gsap.to(spheres.rotation, {
    y: `-=${Math.PI / 2}`,
    duration: 2,
    ease: "expo.easeInOut",
    onComplete: () => {
      isAnimating = false;
    }
  });
  
  updateHeadings('down');
};

const updateHeadings = (direction) => {
  const headings = document.querySelectorAll('.heading');
  
  if (headings.length === 0) return;
  
  if (direction === 'up') {
    gsap.to(headings, {
      duration: 1,
      y: `-=100%`,
      ease: "power2.inOut"
    });
    
    if (currentPlanetIndex === 0) {
      gsap.to(headings, {
        duration: 1,
        y: '0%',
        ease: "power2.inOut",
        delay: 1
      });
    }
  } else if (direction === 'down') {
    if (currentPlanetIndex === 3) {
      gsap.to(headings, {
        duration: 1,
        y: '-300%',
        ease: "power2.inOut"
      });
    } else {
      gsap.to(headings, {
        duration: 1,
        y: `+=100%`,
        ease: "power2.inOut"
      });
    }
  }
};

window.addEventListener('keydown', handleKeyPress);

const animate = () => {
  planetMeshes.forEach((planet, index) => {
    const rotationSpeed = 0.002 + (index * 0.001);
    planet.rotation.y += rotationSpeed;
    planet.rotation.x += rotationSpeed * 0.3;
  });
  
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})