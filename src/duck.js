import * as THREE from 'three';

export function createDuck(color = 0xffe600) {
  const duckGroup = new THREE.Group();

  // Yellow duck material
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const beakMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 }); // Orange beak
  const ringMat = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark ring
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1, 0.7, 1.2); // Elongated slightly
  body.castShadow = true;
  duckGroup.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 0.12, 0.08); // Forward and up
  head.castShadow = true;
  duckGroup.add(head);

  // Beak
  const beakGeo = new THREE.ConeGeometry(0.03, 0.08, 16);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.1, 0.18);
  beak.rotation.x = Math.PI / 2;
  beak.castShadow = true;
  duckGroup.add(beak);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.04, 0.14, 0.14);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.04, 0.14, 0.14);
  duckGroup.add(leftEye, rightEye);

  // Hook Ring (on top of head)
  const ringGeo = new THREE.TorusGeometry(0.03, 0.006, 8, 16);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, 0.22, 0.08);
  duckGroup.add(ring);

  // Save the ring position relative to the duck for collision
  duckGroup.userData = {
    ringPosition: new THREE.Vector3(0, 0.22, 0.08),
    ringRadius: 0.03,
    state: 'floating', // or 'caught'
    speed: Math.random() * 0.2 + 0.1,
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 1.0 + 0.3, // distance from pool center
    points: 10
  };

  return duckGroup;
}
