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
      vertexShader: `varying float distanceAlong; varying vec3 beamNormal;
        void main() {
          distanceAlong = -position.y;
          beamNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 tint; varying float distanceAlong; varying vec3 beamNormal;
        void main() {
          float edge = pow(abs(normalize(beamNormal).z), 1.45);
          float fade = smoothstep(0.0, 0.075, distanceAlong) * (1.0 - smoothstep(0.05, 0.96, distanceAlong));
          gl_FragColor = vec4(tint, edge * fade * 0.78);
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
      mesh.scale.set(height * .16, height * .7, 4);
      mesh.rotation.z = angle + Math.sin(progress * Math.PI * 2.6 + index * 1.25) * .83;
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

export async function createWoodland(canvas, figure) {
  const image = figure.querySelector('img');
  await image.decode();
  const renderer = new THREE.WebGLRenderer({ canvas, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 5);
  camera.position.z = 1;
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const uniforms = {
    photo: { value: texture },
    crop: { value: new THREE.Vector2(1, 1) },
    progress: { value: .5 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 imageUV;
      void main() {
        imageUV = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `uniform sampler2D photo;
      uniform vec2 crop;
      uniform float progress;
      varying vec2 imageUV;
      void main() {
        vec2 focus = vec2(0.62, 0.48);
        float depth = 0.28 + 0.72 * smoothstep(0.26, 0.72, length((imageUV - focus) * vec2(1.0, 0.9)));
        float scale = 0.94 - 0.10 * progress;
        vec2 uv = (imageUV - focus) * crop * (scale - depth * progress * 0.08) + focus;
        uv += vec2(-0.045, 0.018) * (progress - 0.5) * depth;
        gl_FragColor = texture2D(photo, uv);
        #include <colorspace_fragment>
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  let visible = true;
  let frame = 0;

  function render() {
    frame = 0;
    const box = figure.getBoundingClientRect();
    uniforms.progress.value = THREE.MathUtils.clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1);
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (visible && !frame) frame = requestAnimationFrame(render);
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = figure;
    if (!width || !height) return;
    const ratio = (width / height) / (image.naturalWidth / image.naturalHeight);
    uniforms.crop.value.set(Math.min(1, ratio), Math.min(1, 1 / ratio));
    renderer.setSize(width, height, false);
    render();
    canvas.hidden = false;
  });
  resize.observe(figure);
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
      texture.dispose();
      disposeScene(scene, renderer);
    },
  };
}
