/**
 * Interactive WebGL Hover Effect for Images
 * Inspired by: https://tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/
 * Uses Three.js for WebGL and displacement mapping
 */

class ImageHoverEffect {
  constructor(imageElement, options = {}) {
    this.imageElement = imageElement;
    this.container = imageElement.closest('.img-wrapper-threejs') || imageElement.parentElement;
    
       // Configuration
    this.intensity = options.intensity || 0.5;
    this.speed = options.speed || 0.05;
    this.displacement = options.displacement || 0.3;

    // State
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.isHovering = false;
    
    this.init();
  }

  init() {
    // Create Three.js scene
    this.scene = new THREE.Scene();
    
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 1;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    
    // Insert canvas before image
    this.container.style.position = 'relative';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.container.insertBefore(this.renderer.domElement, this.imageElement);
    
    // Load image texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.imageElement.src);
    
    // Create geometry and material
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDisplacement: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        uniform float uDisplacement;
        uniform vec2 uMouse;
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          
          // Create radial displacement from mouse position
          vec2 mouseDir = uv - uMouse;
          float distance = length(mouseDir);
          float strength = smoothstep(0.8, 0.0, distance);
          
          // Displace vertices
          pos.z += sin(distance * 10.0 - uDisplacement * 3.0) * strength * uDisplacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        
        uniform sampler2D uTexture;
        uniform float uDisplacement;
        uniform vec2 uMouse;
        
        void main() {
          vec2 mouseDir = vUv - uMouse;
          float distance = length(mouseDir);
          float strength = smoothstep(0.8, 0.0, distance);
          
          // Create distortion effect
          vec2 distort = normalize(mouseDir) * sin(distance * 10.0 - uDisplacement * 3.0) * strength * 0.05;
          vec2 uv = vUv + distort;
          
          gl_FragColor = texture2D(uTexture, uv);
        }
      `,
      transparent: true
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    
    // Event listeners
    this.container.addEventListener('mouseenter', () => this.onHover());
    this.container.addEventListener('mouseleave', () => this.onLeave());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
  }

  onHover() {
    this.isHovering = true;
  }

  onLeave() {
    this.isHovering = false;
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.targetMouse.x = (event.clientX - rect.left) / this.width;
    this.targetMouse.y = 1 - (event.clientY - rect.top) / this.height;
  }

  onWindowResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    
    // Smooth mouse following
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * this.speed;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * this.speed;
    
    // Update uniforms
    const material = this.mesh.material;
    material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    
    if (this.isHovering) {
      material.uniforms.uDisplacement.value += 0.05;
    } else {
      material.uniforms.uDisplacement.value *= 0.95;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', () => this.onWindowResize());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const livsImage = document.querySelector('img.js-image[src*="livs_scanner"]');
  if (livsImage) {
    new ImageHoverEffect(livsImage, {
      intensity: 0.02,
      speed: 0.012,
      displacement: 0.52
    });
  }
});

// Export for manual use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageHoverEffect;
}
