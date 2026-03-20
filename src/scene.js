import * as THREE from 'three';

export function setupScene(scene, camera, renderer) {
  // We can add XR controller setup here or in a separate file
  
  // Create a base floor just in case
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x33aa33 }); // Grass color
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}
