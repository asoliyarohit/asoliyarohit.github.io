/* The singularity tunnel — a full-screen fragment shader.
   Scroll drives how deep you are: rings expand past you, light streaks race out
   of a dark core, stardust streams by. No libraries; one draw call. */
(function () {
  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime, uDepth, uVel, uMode; uniform vec2 uMouse;
  const float PI = 3.14159265;
  float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  float glow(float d, float w){ return exp(-d * d / (w * w)); }

  void main(){
    vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
    uv -= uMouse * vec2(.035, .03);
    float r = length(uv) + 1e-4, a = atan(uv.y, uv.x), lr = log(r);
    float ang = a / (2. * PI);

    /* palette: amber + a little cool blue, on deep space */
    vec3 amber = vec3(1., .43, .12), hot = vec3(1., .86, .62), ice = vec3(.42, .62, 1.);
    vec3 col = vec3(.008, .010, .022) + vec3(.05, .022, .01) * exp(-r * 2.6);

    /* ── light streaks racing out of the core ─────────────────── */
    float speed = .55 + uVel * 2.2;
    float z = lr * 2.2 - uTime * speed * .35 - uDepth * 1.6;
    for (int k = 0; k < 2; k++) {
      float N = k == 0 ? 72. : 140.;
      float t = ang * N, id = floor(t), f = abs(fract(t) - .5) * 2.;
      float hh = h21(vec2(id, float(k) * 7.));
      float on = step(.55, hh);
      float zz = z * (k == 0 ? 1. : 1.7) + hh * 31.;
      float s = fract(zz * .5);
      float len = .35 + uVel * 1.4;
      float head = smoothstep(0., .015, s) * pow(1. - smoothstep(.015, len, s), 2.2);
      float line = smoothstep(.20 + .13 * r, 0., f);
      float fade = smoothstep(.07, .30, r) * (1. - .55 * smoothstep(.9, 1.6, r));
      vec3 c = mix(amber, ice, step(.78, h21(vec2(id, 3.))));
      col += c * on * head * line * fade * (k == 0 ? 1.15 : .6);
    }

    /* ── stardust drifting outward (log-polar cells) ──────────── */
    for (int k = 0; k < 3; k++) {
      float dens = 14. + float(k) * 16.;
      vec2 g = vec2(ang * dens, lr * dens * .55 - uTime * (.10 + float(k) * .05) * (1. + uVel * 3.) - uDepth * (.7 + float(k) * .3));
      vec2 id = floor(g), f = fract(g) - .5;
      vec2 o = vec2(h21(id), h21(id + 17.3)) - .5;
      float d = length((f - o * .7) * vec2(1., 1. + uVel * 5.));
      float tw = .55 + .45 * sin(uTime * (1. + h21(id) * 3.) + h21(id + 4.) * 6.);
      float size = .035 + .05 * h21(id + 9.);
      float star = smoothstep(size, 0., d) * step(.55, h21(id + 2.)) * tw;
      col += mix(vec3(.75, .85, 1.), hot, h21(id + 5.)) * star * smoothstep(.06, .4, r) * (.75 - float(k) * .17);
    }

    /* ── rings: each one swells and passes you as you scroll ──── */
    float ringSum = 0.;
    for (int i = 0; i < 6; i++) {
      float d = uDepth - float(i);                       /* where this ring is on its journey */
      float R = .42 * exp(1.18 * d);
      float life = smoothstep(-4.2, -2.2, d) * (1. - smoothstep(.55, 1.15, d));
      float w = .0032 + .010 * clamp(R, 0., 1.4);
      float body = glow(r - R, w) * 1.2 + glow(r - R, w * 7.) * .22 + glow(r - R, w * 26.) * .05;
      float spark = .75 + .25 * sin(a * 3. + uTime * .4 + float(i));
      ringSum += body * life * spark;
    }
    col += mix(amber, hot, .35) * ringSum;
    /* hair-line chromatic fringe on the lead ring */
    col.b += ringSum * .12;

    /* ── the core ─────────────────────────────────────────────── */
    float coreR = .088 + .004 * sin(uTime * .8);
    col *= smoothstep(coreR - .012, coreR + .01, r) * .93 + .07;
    col += amber * glow(r - coreR, .006) * .55 + amber * glow(r - coreR, .04) * .18;
    vec2 orb = coreR * 1.18 * vec2(cos(uTime * .55), sin(uTime * .55));
    col += hot * glow(length(uv - orb) - .011, .0035) * .9;

    /* soft vignette + film grain */
    col *= 1. - .55 * smoothstep(.45, 1.15, r);
    col += (h21(gl_FragCoord.xy + fract(uTime) * 91.) - .5) * .018;
    col *= mix(1., .55, uMode);                         /* dim when a window sits on top */
    gl_FragColor = vec4(col, 1.);
  }`;

  window.initTunnel = function (canvas, opts = {}) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n), u = { res: U('uRes'), time: U('uTime'), depth: U('uDepth'), vel: U('uVel'), mouse: U('uMouse'), mode: U('uMode') };

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const scale = opts.scale || (coarse ? .6 : .85);
    const st = { depth: 0, target: 0, vel: 0, time: 0, mx: 0, my: 0, tx: 0, ty: 0, mode: 0, tmode: 0, last: performance.now(), raf: 0, run: true };
    const fit = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5) * scale, w = Math.max(2, Math.round(canvas.clientWidth * d)), h = Math.max(2, Math.round(canvas.clientHeight * d));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const draw = () => {
      fit();
      gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform1f(u.time, st.time); gl.uniform1f(u.depth, st.depth);
      gl.uniform1f(u.vel, st.vel); gl.uniform2f(u.mouse, st.mx, st.my); gl.uniform1f(u.mode, st.mode);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tick = now => {
      const dt = Math.min(.05, (now - st.last) / 1000); st.last = now;
      if (st.run) {
        if (!reduced) st.time += dt;
        const prev = st.depth; st.depth += (st.target - st.depth) * (1 - Math.exp(-dt * 3.2));
        const v = Math.abs(st.depth - prev) / Math.max(dt, 1e-3);
        st.vel += (Math.min(v * .45, 1.2) - st.vel) * (1 - Math.exp(-dt * 5));
        st.mx += (st.tx - st.mx) * (1 - Math.exp(-dt * 3)); st.my += (st.ty - st.my) * (1 - Math.exp(-dt * 3));
        st.mode += (st.tmode - st.mode) * (1 - Math.exp(-dt * 4));
        draw();
      }
      st.raf = requestAnimationFrame(tick);
    };
    addEventListener('pointermove', e => { st.tx = (e.clientX / innerWidth - .5) * 2; st.ty = -(e.clientY / innerHeight - .5) * 2; }, { passive: true });
    document.addEventListener('visibilitychange', () => { st.run = !document.hidden; st.last = performance.now(); });
    draw(); st.raf = requestAnimationFrame(tick);
    return {
      setDepth(d, instant) { st.target = d; if (instant) st.depth = d; },
      setMode(m) { st.tmode = m; },
      renderOnce() { draw(); },
      state: st,
    };
  };
})();
