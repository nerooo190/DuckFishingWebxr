import * as THREE from 'three';

export function setupFishingRod(scene, renderer) {
  // We attach the rod to the first available controller
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  // The fishing rod base
  const rodGeo = new THREE.CylinderGeometry(0.01, 0.02, 1.5, 8);
  // Shift pivot point to the handle
  rodGeo.translate(0, 0.75, 0); 
  const rodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // Wood brown
  const rod = new THREE.Mesh(rodGeo, rodMat);
  
  // Point rod forward from the controller
  rod.rotation.x = -Math.PI / 2;
  controller.add(rod);

  // The line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -1, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line); // Line is in world space to dangle

  // The hook (world space, but follows the line)
  const hookGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16, Math.PI * 1.5);
  const hookMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.8 });
  const hook = new THREE.Mesh(hookGeo, hookMat);
  scene.add(hook);

  // The tip of the rod (in local space of the rod)
  const tipPosition = new THREE.Vector3(0, 1.5, 0); 

  return {
    controller,
    rod,
    line,
    hook,
    lineLength: 1.2,
    tipPositionLocal: tipPosition,
    // Add physics state to the hook
    hookVelocity: new THREE.Vector3(),
    hookPosition: new THREE.Vector3()
  };
}

export function updateFishingRod(rodData) {
  const { controller, rod, line, hook, lineLength, tipPositionLocal } = rodData;

  // Get the world position of the tip of the rod
  const tipWorld = tipPositionLocal.clone().applyMatrix4(rod.matrixWorld);

  // Simple physics: the hook wants to hang straight down from the tip
  const targetPosition = tipWorld.clone();
  targetPosition.y -= lineLength;

  // Move hook towards target (simulating some dampening and pendulum)
  rodData.hookVelocity.add(targetPosition.sub(rodData.hookPosition).multiplyScalar(0.05));
  rodData.hookVelocity.multiplyScalar(0.9); // Dampening
  rodData.hookPosition.add(rodData.hookVelocity);

  // Optional: enforce max line length tightly
  const dist = rodData.hookPosition.distanceTo(tipWorld);
  if (dist > lineLength * 1.1) {
    const dir = rodData.hookPosition.clone().sub(tipWorld).normalize();
    rodData.hookPosition.copy(tipWorld).add(dir.multiplyScalar(lineLength * 1.1));
  }

  // Update line geometry points
  line.geometry.setFromPoints([
    tipWorld,
    rodData.hookPosition
  ]);

  // Update hook mesh position
  hook.position.copy(rodData.hookPosition);
  
  // Keep hook oriented somewhat steadily
  hook.lookAt(tipWorld);
  hook.rotation.x += Math.PI / 2;
}
