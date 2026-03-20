import * as THREE from 'three';

export function createEnvironment(scene) {
  // Create the funfair stall
  const stallGroup = new THREE.Group();
  
  // Stall Base/Counter (where the pool is)
  const counterGeo = new THREE.BoxGeometry(4, 0.8, 3);
  const counterMat = new THREE.MeshLambertMaterial({ color: 0xdd2222 }); // Red counter
  const counter = new THREE.Mesh(counterGeo, counterMat);
  counter.position.set(0, 0.4, -1);
  counter.castShadow = true;
  counter.receiveShadow = true;
  stallGroup.add(counter);

  // Water Pool (Cutout in the counter)
  const poolGeo = new THREE.BoxGeometry(3.5, 0.1, 2.5);
  const poolMat = new THREE.MeshLambertMaterial({ 
    color: 0x00aaff, 
    transparent: true, 
    opacity: 0.8 
  });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.position.set(0, 0.81, -1);
  pool.receiveShadow = true;
  stallGroup.add(pool);

  // Stall Columns
  const columnGeo = new THREE.CylinderGeometry(0.05, 0.05, 3);
  const columnMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White columns
  
  const col1 = new THREE.Mesh(columnGeo, columnMat);
  col1.position.set(-1.8, 1.5, -2.3);
  const col2 = new THREE.Mesh(columnGeo, columnMat);
  col2.position.set(1.8, 1.5, -2.3);
  const col3 = new THREE.Mesh(columnGeo, columnMat);
  col3.position.set(-1.8, 1.5, 0.3);
  const col4 = new THREE.Mesh(columnGeo, columnMat);
  col4.position.set(1.8, 1.5, 0.3);
  
  stallGroup.add(col1, col2, col3, col4);

  // Stall Roof
  const roofGeo = new THREE.ConeGeometry(3, 1.5, 4);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 }); // Yellow roof
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 3.2, -1);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  stallGroup.add(roof);

  // Banner
  const bannerGeo = new THREE.PlaneGeometry(3.6, 0.6);
  // Textures will be mapped here. We use basic material for now.
  
  // Generating a text canvas for the banner since we didn't generate image
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ENTENANGELN', 512, 128);
  
  const bannerTex = new THREE.CanvasTexture(canvas);
  const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 2.5, 0.31);
  stallGroup.add(banner);

  scene.add(stallGroup);
}
