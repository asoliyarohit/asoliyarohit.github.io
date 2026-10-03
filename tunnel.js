/* The code tunnel — a full-screen fragment shader.
   Columns of falling glyphs stream out of a dark core; scroll drives how deep you are.
   Glyphs come from a canvas atlas (katakana, digits, symbols) sampled in log-polar space,
   so the characters shrink toward the vanishing point and point down the tube. */
(function () {
  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime, uDepth, uVel, uMode; uniform vec2 uMouse;
  uniform sampler2D uAtlas;
  const float PI = 3.14159265;
  float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  float glow(float d, float w){ return exp(-d * d / (w * w)); }

  /* one layer of falling code: N columns around the tube */
  vec3 rain(float ang, float lr, float r, float N, float R, float seed, float speed, float trail){
    float cf = ang * N, cid = floor(cf);
    float hc = h21(vec2(cid, seed));
    float live = step(.32, hc);                                   /* some columns are empty */
    float y = lr * R + hc * 40. - uTime * (.7 + hc * .9) * speed - uDepth * 1.9;
    float rid = floor(y);
    float L = trail * (.7 + .6 * h21(vec2(cid, seed + 3.)));       /* trail length in rows */
    float p = fract(y / L);                                         /* 0 = tail, 1 = head (outermost) */
    float body = pow(p, 3.2);
    float head = smoothstep(.93, 1., p);
    float tick = floor(uTime * (1.2 + hc * 3.));
    float gi = floor(h21(vec2(cid * 1.7 + seed, rid + tick * .37)) * 64.);
    vec2 cell = vec2(mod(gi, 8.), floor(gi / 8.));
    vec2 f = vec2(fract(cf), fract(y));
    f.x = (f.x - .5) * 1.18 + .5;                                   /* a little letter-spacing */
    float ink = 0.;
    if (f.x > 0. && f.x < 1.) ink = texture2D(uAtlas, (cell + vec2(f.x, 1. - f.y)) / 8.).r;
    float fade = smoothstep(.055, .26, r) * (1. - .45 * smoothstep(.95, 1.7, r));
    float w = ink * live * (body * .85 + head * 1.4) * fade;
    vec3 green = vec3(0., 1., .26), pale = vec3(.78, 1., .84), deep = vec3(0., .55, .14);
    return mix(deep, green, smoothstep(.15, .7, p)) * w + pale * head * ink * live * fade;
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
    uv -= uMouse * vec2(.03, .026);
    float r = length(uv) + 1e-4, a = atan(uv.y, uv.x), lr = log(r);
    float ang = a / (2. * PI);

    vec3 col = vec3(.004, .018, .010) + vec3(0., .05, .018) * exp(-r * 3.);

    float speed = 1. + uVel * 2.4;
    col += rain(ang, lr, r, 64., 10.2, 1., speed, 14.) * 1.05;
    col += rain(ang, lr, r, 120., 19., 9., speed * 1.3, 18.) * .45;

    /* fine radial light threads */
    float N = 90., t = ang * N, id = floor(t), f = abs(fract(t) - .5) * 2.;
    float hh = h21(vec2(id, 5.));
    float z = lr * 2.2 - uTime * (.5 + uVel * 2.) * .3 - uDepth * 1.6 + hh * 29.;
    float s = fract(z * .5);
    float line = smoothstep(.12 + .08 * r, 0., f) * step(.7, hh) * smoothstep(0., .02, s) * pow(1. - smoothstep(.02, .3 + uVel, s), 2.);
    col += vec3(0., 1., .3) * line * smoothstep(.07, .3, r) * .3;

    /* rings: each swells and passes you as you scroll */
    float ringSum = 0., halo = 0.;
    for (int i = 0; i < 6; i++) {
      float d = uDepth - float(i);
      float R = .42 * exp(1.18 * d);
      float life = smoothstep(-4.2, -2.2, d) * (1. - smoothstep(.55, 1.15, d));
      float w = .0024 + .006 * clamp(R, 0., 1.4);
      ringSum += glow(r - R, w) * life;
      halo += glow(r - R, w * 12.) * life * .12;
    }
    col += vec3(.1, 1., .38) * ringSum * .8 + vec3(0., .55, .16) * halo;

    col *= 1. - uMode * .8;                                          /* fade the code out behind text */

    /* the core: a clean black hole with a thin ring */
    float coreR = .07 + .003 * sin(uTime * .8);
    col *= smoothstep(coreR - .004, coreR + .004, r);
    col += vec3(.1, 1., .38) * glow(r - coreR, .0032) * .9 * (1. - uMode * .3) + vec3(0., .6, .18) * glow(r - coreR, .04) * .1;
    vec2 orb = coreR * 1.55 * vec2(cos(uTime * .55), sin(uTime * .55));
    col += vec3(.8, 1., .86) * glow(length(uv - orb) - .009, .003) * .9 * (1. - uMode * .3);

    col *= 1. - .5 * smoothstep(.55, 1.25, r);                       /* vignette */
    col += (h21(gl_FragCoord.xy + fract(uTime) * 91.) - .5) * .012;  /* grain */
    gl_FragColor = vec4(col, 1.);
  }`;

  /* ── glyph atlas: 8×8 cells, white on black ─────────────── */
  function buildAtlas() {
    const S = 512, C = S / 8, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const g = cv.getContext('2d', { willReadFrequently: true });
    const kata = Array.from({ length: 56 }, (_, i) => String.fromCharCode(0xFF66 + i)).join('');   /* half-width katakana */
    const safe = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ<>/{}[]=+*#$%:;|';
    const fonts = '"MS Gothic","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic",monospace';
    const draw = (ch, i, font) => {
      g.save(); g.beginPath(); g.rect((i % 8) * C, Math.floor(i / 8) * C, C, C); g.clip();
      g.fillStyle = '#fff'; g.font = `700 ${Math.round(C * .82)}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(ch, (i % 8) * C + C / 2, Math.floor(i / 8) * C + C / 2 + C * .04); g.restore();
    };
    /* does this device have katakana, or does it draw "missing glyph" boxes? */
    g.clearRect(0, 0, S, S); draw(String.fromCharCode(0xFF71), 0, fonts); draw('', 1, fonts);
    const px = i => g.getImageData((i % 8) * C, 0, C, C).data;
    const A = px(0), B = px(1); let same = 0; for (let k = 3; k < A.length; k += 4) if (Math.abs(A[k] - B[k]) < 24) same++;
    const hasKana = same < A.length / 4 * .985;
    g.clearRect(0, 0, S, S); g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    const set = hasKana ? (kata + safe) : (safe + '0123456789ABCDEF<>/{}[]=+*');
    for (let i = 0; i < 64; i++) draw(set[i % set.length], i, hasKana ? fonts : 'monospace');
    return cv;
  }

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

    const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildAtlas());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const U = n => gl.getUniformLocation(prog, n), u = { res: U('uRes'), time: U('uTime'), depth: U('uDepth'), vel: U('uVel'), mouse: U('uMouse'), mode: U('uMode') };
    gl.uniform1i(U('uAtlas'), 0);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const scale = opts.scale || (coarse ? .6 : .9);
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
