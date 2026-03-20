import { createDuck } from './duck.js';
import { setupFishingRod, updateFishingRod } from './fishingRod.js';
import * as THREE from 'three';

let ducks = [];
let rodData;
let score = 0;
let scoreCanvas, scoreCtx, scoreTex, scoreMat;

export function initGameLoop(scene, renderer) {
  // Pool center is at (0, 0.81, -1) from environment.js
  const poolCenter = new THREE.Vector3(0, 0.81, -1);

  // Spawn ducks
  const colors = [0xffe600, 0xff0000, 0x00ff00, 0xee00ee, 0x00ffff];
  for (let i = 0; i < 15; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duck = createDuck(color);
    
    // Position them based on initial angle/radius
    const dMode = duck.userData;
    duck.position.set(
      poolCenter.x + Math.cos(dMode.angle) * dMode.radius,
      poolCenter.y,
      poolCenter.z + Math.sin(dMode.angle) * dMode.radius
    );
    duck.rotation.y = -dMode.angle;
    
    scene.add(duck);
    ducks.push(duck);
  }

  // 3D Score Board
  scoreCanvas = document.createElement('canvas');
  scoreCanvas.width = 512;
  scoreCanvas.height = 256;
  scoreCtx = scoreCanvas.getContext('2d');
  scoreTex = new THREE.CanvasTexture(scoreCanvas);
  scoreMat = new THREE.MeshBasicMaterial({ map: scoreTex, transparent: true });
  
  const scoreBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), scoreMat);
  scoreBoard.position.set(0, 1.8, -2);
  scene.add(scoreBoard);

  updateScore(0);

  rodData = setupFishingRod(scene, renderer);

  return {
    update: () => updatePhase(scene, poolCenter)
  };
}

function updateScore(pts) {
  score += pts;
  scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  scoreCtx.fillStyle = 'rgba(0,0,0,0.5)';
  scoreCtx.fillRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  scoreCtx.fillStyle = 'white';
  scoreCtx.font = 'bold 80px sans-serif';
  scoreCtx.textAlign = 'center';
  scoreCtx.textBaseline = 'middle';
  scoreCtx.fillText(`Score: ${score}`, 256, 128);
  scoreTex.needsUpdate = true;
  
  // Also update standard HTML if playing without headset
  const el = document.getElementById('score-value');
  if (el) el.innerText = score.toString();
}

function updatePhase(scene, poolCenter) {
  // 1. Update Rod & Hook
  updateFishingRod(rodData);
  const hookPos = rodData.hookPosition;

  // 2. Update Ducks
  const time = performance.now() * 0.001;
  const poolRadiusMax = 1.4; // Max distance from center
  const floatHeight = poolCenter.y;

  ducks.forEach((duck, index) => {
    const data = duck.userData;

    if (data.state === 'floating') {
      // Move in a circle
      data.angle += data.speed * 0.01;
      
      const targetX = poolCenter.x + Math.cos(data.angle) * data.radius;
      const targetZ = poolCenter.z + Math.sin(data.angle) * data.radius;
      
      duck.position.x = targetX;
      duck.position.z = targetZ;
      duck.position.y = floatHeight + Math.sin(time * 2 + index) * 0.02; // Bobbing
      
      // Face forward along path
      duck.rotation.y = -data.angle + Math.PI;

      // 3. Collision Check
      // Calculate ring center world position
      const ringOffsetLocal = data.ringPosition.clone();
      const ringWorldPos = ringOffsetLocal.applyMatrix4(duck.matrixWorld);
      
      // Calculate dist from hook to ring center
      // Since ring has radius ringRadius, hook center should be within ringRadius of ring center
      const dist = hookPos.distanceTo(ringWorldPos);
      if (dist < data.ringRadius + 0.04) { // Threshold
        // Caught!
        data.state = 'caught';
        updateScore(data.points);
      }
    } else if (data.state === 'caught') {
      // Follow the hook
      duck.position.copy(hookPos);
      duck.position.y -= data.ringPosition.y; // Hang down slightly
      
      // Dangle a bit
      duck.rotation.x = Math.sin(time * 5) * 0.1;
      duck.rotation.z = Math.cos(time * 4) * 0.1;

      if (!data.caughtTime) {
        data.caughtTime = time;
      }
      
      // Recycle after 2 seconds
      if (time - data.caughtTime > 2) {
        data.state = 'floating';
        data.angle = Math.random() * Math.PI * 2;
        data.caughtTime = null;
        
        // Reset position to back of pool
        duck.position.set(
          poolCenter.x + Math.cos(data.angle) * data.radius,
          poolCenter.y,
          poolCenter.z + Math.sin(data.angle) * data.radius
        );
      }
    }
  });
}
