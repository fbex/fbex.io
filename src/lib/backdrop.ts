import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uIntensity;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-correct, origin at the centre of the screen. Normalising by the
    // *shorter* edge keeps the field the same visual scale in portrait as in
    // landscape — dividing by height alone leaves a phone showing nothing but
    // the dark middle.
    float minSide = min(uResolution.x, uResolution.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / minSide;
    float t = uTime * 0.045;

    vec2 p = uv * 1.65;
    p += 0.26 * uMouse; // the whole field drifts toward the cursor

    // Two rounds of domain warping — this is what turns plain fbm noise into
    // the folded, liquid look. Each round feeds the previous one back in as a
    // coordinate offset.
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p + 2.4 * q + vec2(1.7, 9.2) + t * 1.3),
      fbm(p + 2.4 * q + vec2(8.3, 2.8) - t * 1.1)
    );
    float f = fbm(p + 2.2 * r);

    // A slow ripple radiating out from the pointer.
    float md = length(uv - uMouse);
    f += 0.10 * exp(-md * 2.4) * sin(md * 9.0 - uTime * 0.9);

    vec3 ink     = vec3(0.016, 0.018, 0.040);
    vec3 violet  = vec3(0.300, 0.120, 0.880);
    vec3 cyan    = vec3(0.060, 0.720, 0.880);
    vec3 magenta = vec3(0.950, 0.150, 0.560);

    // The flow is added *onto* ink as light rather than mixed toward full
    // saturation: most of the screen stays near-black and only the crests of
    // the noise pick up colour. Raising glow to a power widens the voids.
    float glow = pow(smoothstep(0.34, 0.92, f), 1.25);

    vec3 tint = mix(violet, cyan, smoothstep(0.48, 1.10, length(r)));
    tint = mix(tint, magenta, smoothstep(0.40, 0.98, q.x + 0.35) * 0.70);

    vec3 col = ink + tint * glow * 1.05;

    // Thin filaments along the ridges of the flow — the only near-white in
    // the frame, which is what keeps it from looking like a soft gradient.
    float ridge = pow(max(1.0 - abs(f - 0.5) * 2.0, 0.0), 10.0);
    col += ridge * vec3(0.42, 0.50, 0.78) * 0.26;

    col += vec3(0.09, 0.06, 0.20) * exp(-md * 3.6);          // cursor glow

    // Distance is measured in half-heights, so keep the radii small enough
    // that a tall viewport doesn't fall entirely inside them.
    float d = length(uv);
    // Hold the middle down so the wordmark always sits on near-black, and
    // let the colour bloom in a ring around it.
    col *= mix(0.34, 1.0, smoothstep(0.02, 0.42, d));
    col *= 1.0 - 0.45 * smoothstep(0.80, 1.70, d);           // vignette
    col += ink;
    // Reinhard-style roll-off: without it the brightest lobes of the flow
    // clip to flat magenta instead of staying readable as light.
    col = col / (1.0 + col * 0.55);
    col *= uIntensity;
    col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;          // dither: no banding

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Mounts the animated WebGL field into `canvas`.
 * Returns a teardown function, or null if WebGL is unavailable — in which
 * case the CSS gradient underneath the canvas stays visible on its own.
 */
export function mountBackdrop(canvas: HTMLCanvasElement): (() => void) | null {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      // Retina is wasted on a soft noise field, and it quadruples the fill
      // cost. 1.5 keeps it crisp enough without the frame-rate hit.
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  // OGL only logs when it cannot get a context, it does not throw — so the
  // try/catch above is not enough on its own.
  const gl = renderer.gl;
  if (!gl) return null;

  gl.clearColor(0.02, 0.023, 0.051, 1);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(1, 1) },
      uMouse: { value: new Vec2(0, 0) },
      uIntensity: { value: 0 },
    },
  });

  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Pointer is tracked in the shader's aspect-corrected space, then eased
  // toward each frame so the field lags the cursor slightly.
  const target = new Vec2(0, 0);
  const current = new Vec2(0, 0);

  const onPointerMove = (event: PointerEvent) => {
    // Must match the shader's normalisation, or the cursor glow drifts away
    // from the actual pointer.
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    target.set(
      (event.clientX - window.innerWidth / 2) / minSide,
      -(event.clientY - window.innerHeight / 2) / minSide
    );
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let frame = 0;
  let running = true;
  const start = performance.now();

  const render = (now: number) => {
    frame = requestAnimationFrame(render);
    const elapsed = (now - start) / 1000;

    current.x += (target.x - current.x) * 0.045;
    current.y += (target.y - current.y) * 0.045;
    program.uniforms.uMouse.value.set(current.x, current.y);

    program.uniforms.uTime.value = elapsed;
    // Ease the whole field up from black over the first ~1.6s.
    program.uniforms.uIntensity.value = Math.min(elapsed / 1.6, 1);

    renderer.render({ scene: mesh });
  };

  if (reduced) {
    // Draw a single fully-lit frame and stop: the colours are still there,
    // nothing moves.
    program.uniforms.uTime.value = 12;
    program.uniforms.uIntensity.value = 1;
    renderer.render({ scene: mesh });
    running = false;
  } else {
    frame = requestAnimationFrame(render);
  }

  // Don't burn GPU on a tab nobody is looking at.
  const onVisibility = () => {
    if (reduced) return;
    if (document.hidden && running) {
      cancelAnimationFrame(frame);
      running = false;
    } else if (!document.hidden && !running) {
      running = true;
      frame = requestAnimationFrame(render);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
