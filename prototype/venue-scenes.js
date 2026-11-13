import * as THREE from './vendor/three.module.min.js';

function disposeScene(scene, renderer) {
  const resources = new Set();
  scene.traverse(({ geometry, material }) => {
    if (geometry) resources.add(geometry);
    if (material) resources.add(material);
  });
  for (const resource of resources) resource.dispose();
  renderer.clear();
  renderer.dispose();
}

function makeDome() {
  const dome = new THREE.Group();
  const count = 18;
  const rings = Array.from({ length: 5 }, (_, band) => {
    const latitude = band * Math.PI / 10;
    return Array.from({ length: count }, (_, index) => {
      const angle = (index + (band % 2) * .5) * 2 * Math.PI / count;
      return new THREE.Vector3(Math.cos(angle) * Math.cos(latitude) * 1.7,
        Math.sin(latitude) * 1.58, Math.sin(angle) * Math.cos(latitude) * 1.7);
    });
  });
  const faces = [];
  const struts = [];
  const apex = new THREE.Vector3(0, 1.58, 0);
  for (const [band, ring] of rings.entries()) {
    const nextRing = rings[band + 1];
    for (let index = 0; index < count; index++) {
      const next = (index + 1) % count;
      const offset = (index + (band % 2 ? 1 : 0)) % count;
      const a = ring[index];
      const b = ring[next];
      const c = nextRing?.[offset] ?? apex;
      struts.push([a, b], [a, c]);
      faces.push(...a, ...b, ...c);
      if (nextRing) {
        const d = nextRing[(offset + 1) % count];
        struts.push([b, c]);
        faces.push(...b, ...d, ...c);
      }
    }
  }

  const panels = new THREE.BufferGeometry();
  panels.setAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
  panels.computeVertexNormals();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xc6d8d0, metalness: .16, roughness: .23,
    transparent: true, opacity: .29, depthWrite: false, side: THREE.DoubleSide });
  const shell = new THREE.Mesh(panels, glass);
  shell.renderOrder = 2;
  dome.add(shell);

  const supports = new THREE.InstancedMesh(new THREE.CylinderGeometry(.009, .009, 1, 7),
    new THREE.MeshStandardMaterial({ color: 0xd1ac80, metalness: .4, roughness: .38 }), struts.length);
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const pose = new THREE.Object3D();
  struts.forEach(([a, b], index) => {
    direction.subVectors(b, a);
    pose.position.copy(a).lerp(b, .5);
    pose.scale.y = direction.length();
    pose.quaternion.setFromUnitVectors(up, direction.normalize());
    pose.updateMatrix();
    supports.setMatrixAt(index, pose.matrix);
  });
  dome.add(supports);

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.74, 1.74, .11, 72),
    new THREE.MeshStandardMaterial({ color: 0x62493b, roughness: .75 }));
  floor.position.y = -.055;
  dome.add(floor);

  const entrance = new THREE.Shape();
  entrance.moveTo(-.3, 0);
  entrance.lineTo(-.3, .54);
  entrance.quadraticCurveTo(-.3, .83, 0, .83);
  entrance.quadraticCurveTo(.3, .83, .3, .54);
  entrance.lineTo(.3, 0);
  const door = new THREE.Mesh(new THREE.ShapeGeometry(entrance),
    new THREE.MeshStandardMaterial({ color: 0x332921, side: THREE.DoubleSide }));
  door.position.z = 1.72;
  const arch = new THREE.CatmullRomCurve3(entrance.getPoints(12).map(({ x, y }) => new THREE.Vector3(x, y, 1.73)));
  const trim = new THREE.Mesh(new THREE.TubeGeometry(arch, 48, .022, 8), supports.material);
  dome.add(door, trim);

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcf92 }));
  lamp.position.set(0, 1.16, 0);
  const ambientLamp = new THREE.PointLight(0xffaf66, 7, 4);
  ambientLamp.position.copy(lamp.position);
  dome.add(lamp, ambientLamp);
  return dome;
}

export function createDome(canvas, dialog, motion) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
  const dome = makeDome();
  const key = new THREE.DirectionalLight(0xffead6, 3);
  key.position.set(3, 5, 4);
  scene.add(dome, key, new THREE.HemisphereLight(0xd2ece9, 0x5b3c2c, 2));
  const listeners = new AbortController();
  let frame = 0;
  let target = -.36;
  let drag;
  dome.rotation.y = target;

  function render() {
    frame = 0;
    dome.rotation.y = motion.matches ? target : THREE.MathUtils.lerp(dome.rotation.y, target, .18);
    renderer.render(scene, camera);
    if (Math.abs(target - dome.rotation.y) > .002) frame = requestAnimationFrame(render);
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    camera.aspect = width / height;
    const distance = Math.max(5.6, 6.8 / camera.aspect);
    camera.position.set(distance * .35, distance * .42, distance * .94);
    camera.lookAt(0, .62, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  });
  resize.observe(canvas);

  for (const button of dialog.querySelectorAll('[data-turn]')) {
    button.addEventListener('click', () => {
      target += Number(button.dataset.turn) * Math.PI / 6;
      requestRender();
    }, { signal: listeners.signal });
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { x: event.clientX, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  }, { signal: listeners.signal });
  canvas.addEventListener('pointermove', (event) => {
    if (drag?.id !== event.pointerId) return;
    target += (event.clientX - drag.x) * .012;
    drag.x = event.clientX;
    requestRender();
  }, { signal: listeners.signal });
  canvas.addEventListener('lostpointercapture', () => {
    drag = undefined;
    canvas.classList.remove('is-dragging');
  }, { signal: listeners.signal });

  return { dispose() {
    listeners.abort();
    resize.disconnect();
    cancelAnimationFrame(frame);
    disposeScene(scene, renderer);
  } };
}

export function createStageLights(canvas, stage) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, .1, 50);
  camera.position.z = 20;
  const image = stage.querySelector('.feature-image');
  const imageWidth = Number(image.getAttribute('width'));
  const imageHeight = Number(image.getAttribute('height'));
  const geometry = new THREE.ConeGeometry(1, 1, 32, 1, true);
  geometry.translate(0, -.5, 0);
  const beams = [
    { x: .669, y: .463, color: 0xffc791, angle: -.52 },
    { x: .73, y: .463, color: 0xe2c1ff, angle: .12 },
    { x: .786, y: .468, color: 0xffdba9, angle: .57 },
  ].map((light) => {
    const material = new THREE.ShaderMaterial({
      uniforms: { tint: { value: new THREE.Color(light.color).convertLinearToSRGB() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying float distanceAlong; varying vec3 viewNormal;
        void main() {
          distanceAlong = -position.y;
          viewNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 tint; varying float distanceAlong; varying vec3 viewNormal;
        void main() {
          float edge = pow(abs(normalize(viewNormal).z), 2.5);
          float fade = smoothstep(0.0, 0.075, distanceAlong) * (1.0 - smoothstep(0.05, 0.96, distanceAlong));
          gl_FragColor = vec4(tint, edge * fade * 0.34);
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return { ...light, mesh };
  });

  let visible = true;
  let frame = 0;
  function render() {
    frame = 0;
    const box = stage.getBoundingClientRect();
    const photo = image.getBoundingClientRect();
    const height = canvas.clientHeight;
    const imageScale = Math.max(photo.width / imageWidth, photo.height / imageHeight);
    const objectPosition = parseFloat(getComputedStyle(image).objectPosition) / 100;
    const imageLeft = photo.left - box.left + (photo.width - imageWidth * imageScale) * objectPosition;
    const imageTop = photo.top - box.top + (photo.height - imageHeight * imageScale) * .5;
    const progress = THREE.MathUtils.clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1);
    for (const [index, { x, y, angle, mesh }] of beams.entries()) {
      mesh.position.set(imageLeft + imageWidth * imageScale * x, height - imageTop - imageHeight * imageScale * y, 0);
      mesh.scale.set(height * .115, height * .56, 4);
      mesh.rotation.z = angle + Math.sin(progress * Math.PI * 1.9 + index * 1.25) * .52;
    }
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (visible && !frame) frame = requestAnimationFrame(render);
  }

  const resize = new ResizeObserver(() => {
    camera.right = canvas.clientWidth;
    camera.top = canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    requestRender();
  });
  resize.observe(canvas);
  window.addEventListener('scroll', requestRender, { passive: true });

  return {
    setVisible(value) {
      visible = value;
      if (visible) requestRender();
      else { cancelAnimationFrame(frame); frame = 0; }
    },
    dispose() {
      resize.disconnect();
      window.removeEventListener('scroll', requestRender);
      cancelAnimationFrame(frame);
      disposeScene(scene, renderer);
    },
  };
}
