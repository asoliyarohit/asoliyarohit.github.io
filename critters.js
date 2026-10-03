/* ═══════════════════════════════════════════════════════════
   The helpers: a chipmunk, a quokka and a wallaby.
   Every critter faces right and is built from the same named parts
   (.tail .body .legb .legf .head .arm .eye) so one animation system
   can drive all three. Gradients live in one shared <defs> block.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const DEFS = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="cr-fur-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6b078"/><stop offset=".6" stop-color="#c98443"/><stop offset="1" stop-color="#a9662f"/></linearGradient>
    <linearGradient id="cr-head-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eab57c"/><stop offset="1" stop-color="#c98443"/></linearGradient>
    <linearGradient id="cr-tail-chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3a863"/><stop offset="1" stop-color="#a45f28"/></linearGradient>
    <clipPath id="cr-clip-chip"><ellipse cx="74" cy="82" rx="38" ry="25"/></clipPath>

    <linearGradient id="cr-fur-q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4a384"/><stop offset="1" stop-color="#94735a"/></linearGradient>
    <linearGradient id="cr-belly-q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6d4b8"/><stop offset="1" stop-color="#cbb28f"/></linearGradient>
    <clipPath id="cr-clip-q"><path d="M42 132 C28 100 44 68 76 64 C106 62 122 90 112 124 C108 142 54 144 42 132 Z"/></clipPath>

    <linearGradient id="cr-fur-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3a97a"/><stop offset="1" stop-color="#a47a4c"/></linearGradient>
    <linearGradient id="cr-belly-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e8d0"/><stop offset="1" stop-color="#dcc6a2"/></linearGradient>
    <clipPath id="cr-clip-w"><path d="M50 172 C40 132 50 94 78 86 C106 82 116 112 110 150 C107 174 60 180 50 172 Z"/></clipPath>
  </defs></svg>`;

  /* ── chipmunk — quick, round, stripy ──────────────────── */
  const CHIP = `
  <svg viewBox="0 0 160 120" aria-hidden="true">
    <ellipse cx="78" cy="115" rx="40" ry="4.5" fill="rgba(0,0,0,.4)"/>
    <g class="tail">
      <path d="M52 94 C18 102 0 68 14 36 C20 20 38 12 46 26 C52 38 46 52 66 66 Z" fill="url(#cr-tail-chip)" stroke="#7a4721" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M20 38 C28 24 42 26 46 36 C50 48 54 58 64 66" fill="none" stroke="#3d2415" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>
      <path d="M13 50 C16 68 30 86 54 91" fill="none" stroke="#f6e8cc" stroke-width="3" stroke-linecap="round" opacity=".9"/>
    </g>
    <g class="body">
      <g class="legb"><ellipse cx="49" cy="98" rx="16" ry="13.5" fill="#b87438" stroke="#7a4721" stroke-width="1.2"/><ellipse cx="42" cy="111" rx="13" ry="5.2" fill="#8f5a2c" stroke="#6c4220" stroke-width="1"/></g>
      <ellipse cx="74" cy="82" rx="38" ry="25" fill="url(#cr-fur-chip)" stroke="#7a4721" stroke-width="1.2"/>
      <g clip-path="url(#cr-clip-chip)">
        <path d="M34 77 C46 52 102 50 114 77" fill="none" stroke="#3d2415" stroke-width="5"/>
        <path d="M32 83 C44 59 104 57 116 83" fill="none" stroke="#f6e8cc" stroke-width="4"/>
        <path d="M32 89 C44 66 104 64 116 89" fill="none" stroke="#3d2415" stroke-width="3.6"/>
        <ellipse cx="84" cy="102" rx="28" ry="11" fill="#fbf1da"/>
      </g>
    </g>
    <g class="legf"><ellipse cx="97" cy="99" rx="11" ry="10" fill="#b87438" stroke="#7a4721" stroke-width="1.2"/><ellipse cx="103" cy="111" rx="11.5" ry="5" fill="#8f5a2c" stroke="#6c4220" stroke-width="1"/></g>
    <g class="head">
      <circle cx="124" cy="39" r="7.5" fill="#b87438" stroke="#7a4721" stroke-width="1"/>
      <circle cx="104" cy="41" r="9.5" fill="#b87438" stroke="#7a4721" stroke-width="1.2"/><circle cx="104.5" cy="42" r="5" fill="#eaa994"/>
      <ellipse cx="115" cy="61" rx="26" ry="22.5" fill="url(#cr-head-chip)" stroke="#7a4721" stroke-width="1.2"/>
      <path d="M97 50 C108 41 128 41 138 49" fill="none" stroke="#f6e8cc" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M95 55 C107 47 129 48 140 57" fill="none" stroke="#3d2415" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="124" cy="75" rx="14.5" ry="10" fill="#fbf1da"/>
      <ellipse cx="115" cy="72" rx="5.5" ry="3.2" fill="#f0a08e" opacity=".5"/>
      <g class="eye"><ellipse cx="125" cy="62" rx="5.4" ry="6.2" fill="#1d1109"/><circle cx="127" cy="59.4" r="2.2" fill="#fff"/><circle cx="123.2" cy="64.6" r="1" fill="#fff" opacity=".75"/></g>
      <ellipse cx="139" cy="67" rx="4.2" ry="3.3" fill="#3b1f14"/><ellipse cx="138.2" cy="65.8" rx="1.4" ry=".9" fill="#fff" opacity=".5"/>
      <path d="M133 74 C136 77.5 140 76.5 142 73" fill="none" stroke="#3b1f14" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M138 70 L153 65 M138 71.5 L154 72 M138 73 L152 79" stroke="#fbf1da" stroke-width=".9" opacity=".55" stroke-linecap="round"/>
    </g>
    <g class="arm"><path d="M104 88 C112 90 118 93 124 95" fill="none" stroke="#b87438" stroke-width="9" stroke-linecap="round"/><circle cx="127" cy="96" r="5.6" fill="#8f5a2c"/><path d="M125 99 v3 M128 99.5 v3 M131 98 l1.5 2.5" stroke="#6c4220" stroke-width="1.1" stroke-linecap="round"/></g>
  </svg>`;

  /* ── quokka — round, soft and always smiling ──────────── */
  const QUOKKA = `
  <svg viewBox="0 0 150 150" aria-hidden="true">
    <ellipse cx="76" cy="146" rx="44" ry="4.5" fill="rgba(0,0,0,.4)"/>
    <g class="tail"><path d="M44 126 C30 134 20 128 17 117 C16 112 22 111 24 116 C27 123 34 124 44 119 Z" fill="#8a694b" stroke="#5e4630" stroke-width="1.1"/></g>
    <g class="body">
      <g class="legb"><ellipse cx="62" cy="128" rx="17" ry="15" fill="#9a7757" stroke="#5e4630" stroke-width="1.2"/><ellipse cx="58" cy="142" rx="17.5" ry="6" fill="#7b5c41" stroke="#4f3b29" stroke-width="1.1"/><path d="M46 143 v3 M52 144.5 v3 M58 145 v3" stroke="#4f3b29" stroke-width="1.1" stroke-linecap="round"/></g>
      <path d="M42 132 C28 100 44 68 76 64 C106 62 122 90 112 124 C108 142 54 144 42 132 Z" fill="url(#cr-fur-q)" stroke="#5e4630" stroke-width="1.3" stroke-linejoin="round"/>
      <g clip-path="url(#cr-clip-q)"><ellipse cx="86" cy="112" rx="24" ry="30" fill="url(#cr-belly-q)"/></g>
    </g>
    <g class="legf"><ellipse cx="94" cy="130" rx="15" ry="13" fill="#a38161" stroke="#5e4630" stroke-width="1.2"/><ellipse cx="97" cy="143" rx="17.5" ry="6" fill="#7b5c41" stroke="#4f3b29" stroke-width="1.1"/><path d="M83 144 v3 M89 145 v3 M95 146 v3" stroke="#4f3b29" stroke-width="1.1" stroke-linecap="round"/></g>
    <g class="head">
      <circle cx="67" cy="33" r="8.2" fill="#8f6d4f" stroke="#5e4630" stroke-width="1.1"/><circle cx="67.4" cy="34" r="4.2" fill="#d9a38f"/>
      <circle cx="96" cy="28" r="8.6" fill="#9a7757" stroke="#5e4630" stroke-width="1.1"/><circle cx="96" cy="29" r="4.4" fill="#e0a995"/>
      <ellipse cx="86" cy="52" rx="31" ry="27" fill="url(#cr-fur-q)" stroke="#5e4630" stroke-width="1.3"/>
      <ellipse cx="107" cy="62" rx="13.5" ry="11" fill="#e2cdb0" stroke="#5e4630" stroke-width="1"/>
      <ellipse cx="90" cy="64" rx="7.5" ry="4.6" fill="#ef9a8a" opacity=".55"/>
      <g class="eye"><ellipse cx="98" cy="46" rx="5.2" ry="6" fill="#1a110b"/><circle cx="100" cy="43.4" r="2.1" fill="#fff"/><circle cx="96.2" cy="48.8" r="1" fill="#fff" opacity=".7"/></g>
      <path d="M90 38 C95 35 101 35.500 105 38.500" fill="none" stroke="#5e4630" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="117.5" cy="56.5" rx="6.4" ry="4.8" fill="#241610"/><ellipse cx="116.2" cy="54.8" rx="2" ry="1.1" fill="#fff" opacity=".55"/>
      <path d="M99 67 C104 74.500 114 74.500 119 67" fill="none" stroke="#3a2416" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M99.500 66.500 C98.200 65.200 96.800 65.400 96.200 66.800 M118.500 66.500 C119.800 65.200 121.200 65.400 121.800 66.800" fill="none" stroke="#3a2416" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M117.500 61.500 L117.500 66" stroke="#3a2416" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="108" cy="64" r=".9" fill="#5e4630" opacity=".5"/><circle cx="113" cy="66" r=".9" fill="#5e4630" opacity=".5"/>
    </g>
    <g class="arm"><path d="M84 86 C93 90 101 94 107 96" fill="none" stroke="#a38161" stroke-width="9" stroke-linecap="round"/><circle cx="110" cy="97" r="5.4" fill="#7b5c41"/><path d="M108 100 v3 M111 100.5 v3 M114 99.5 l1.4 2.6" stroke="#4f3b29" stroke-width="1.1" stroke-linecap="round"/></g>
  </svg>`;

  /* ── wallaby — tall, springy, with a big tail to lean on ── */
  const WALLABY = `
  <svg viewBox="0 0 150 190" aria-hidden="true">
    <ellipse cx="72" cy="186" rx="50" ry="4.5" fill="rgba(0,0,0,.4)"/>
    <g class="tail"><path d="M52 154 C26 160 8 174 6 184 C22 188 44 178 62 164 Z" fill="url(#cr-fur-w)" stroke="#6e4f2e" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 183 C26 181 42 172 58 162" fill="none" stroke="#f4e8d0" stroke-width="2.4" opacity=".7" stroke-linecap="round"/></g>
    <g class="body">
      <g class="legb"><ellipse cx="64" cy="152" rx="22" ry="23" fill="#b58a5c" stroke="#6e4f2e" stroke-width="1.3"/><path d="M48 174 C60 170 96 172 102 177 C108 182 104 185 96 185 L52 185 C44 185 42 178 48 174 Z" fill="#8c673f" stroke="#5a3f24" stroke-width="1.2" stroke-linejoin="round"/><path d="M92 178 l7 5 M86 178 l7 6" stroke="#4a3320" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>
      <path d="M50 172 C40 132 50 94 78 86 C106 82 116 112 110 150 C107 174 60 180 50 172 Z" fill="url(#cr-fur-w)" stroke="#6e4f2e" stroke-width="1.3" stroke-linejoin="round"/>
      <g clip-path="url(#cr-clip-w)"><ellipse cx="88" cy="132" rx="19" ry="42" fill="url(#cr-belly-w)"/></g>
    </g>
    <g class="legf"><ellipse cx="88" cy="158" rx="15" ry="17" fill="#bf946a" stroke="#6e4f2e" stroke-width="1.2"/><path d="M78 176 C86 174 106 175 110 179 C113 183 109 185.5 103 185.5 L80 185.5 C74 185.5 73 179 78 176 Z" fill="#9a734a" stroke="#5a3f24" stroke-width="1.1"/></g>
    <g class="head">
      <g transform="rotate(-14 80 50)"><ellipse cx="80" cy="34" rx="7" ry="19" fill="#b58a5c" stroke="#6e4f2e" stroke-width="1.2"/><ellipse cx="80.5" cy="36" rx="3.6" ry="13" fill="#e6b1a1"/><path d="M74 20 C76 12 84 12 86 20 C84 22 76 22 74 20 Z" fill="#3b2a1c"/></g>
      <g transform="rotate(12 100 50)"><ellipse cx="100" cy="32" rx="6.5" ry="18" fill="#c19669" stroke="#6e4f2e" stroke-width="1.2"/><ellipse cx="100" cy="34" rx="3.2" ry="12.5" fill="#e6b1a1"/><path d="M94 19 C96 12 104 12 106 19 C104 21 96 21 94 19 Z" fill="#3b2a1c"/></g>
      <ellipse cx="91" cy="66" rx="20" ry="21" fill="url(#cr-fur-w)" stroke="#6e4f2e" stroke-width="1.3"/>
      <path d="M96 70 C104 62 118 64 126 72 C130 78 126 86 118 87 C108 88 98 84 96 76 Z" fill="#ecdcbf" stroke="#6e4f2e" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M100 79 C108 88 120 88 126 80" fill="none" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="124" cy="75" rx="5.4" ry="4.4" fill="#2a1c18"/><ellipse cx="122.8" cy="73.6" rx="1.7" ry="1" fill="#fff" opacity=".5"/>
      <path d="M114 84 C118 87.5 123 86.5 125 82.5" fill="none" stroke="#3a2416" stroke-width="1.6" stroke-linecap="round"/>
      <g class="eye"><ellipse cx="102" cy="62" rx="4.4" ry="5.3" fill="#1a110b"/><circle cx="103.8" cy="59.8" r="1.9" fill="#fff"/><circle cx="100.5" cy="64.4" r=".9" fill="#fff" opacity=".7"/></g>
      <path d="M96 55 C100 52.5 106 52.5 109 55" fill="none" stroke="#6e4f2e" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="97" cy="76" rx="5.5" ry="3.4" fill="#eba08f" opacity=".45"/>
    </g>
    <g class="arm"><path d="M86 100 C94 105 101 109 107 111" fill="none" stroke="#bf946a" stroke-width="8" stroke-linecap="round"/><circle cx="110" cy="112" r="4.8" fill="#8c673f"/><path d="M108 115 l-1 3 M111 115.5 v3 M114 114.5 l2 2.4" stroke="#4a3320" stroke-width="1.2" stroke-linecap="round"/></g>
  </svg>`;

  /* viewBox size, where the hand reaches (for gripping the book), body scale */
  window.CRITTERS = {
    chip:    { svg: CHIP,    vb: [160, 120], hand: [127, 96],  scale: 1,   hop: 10, strides: .8, speed: 1,   waddle: 0 },
    quokka:  { svg: QUOKKA,  vb: [150, 150], hand: [110, 97],  scale: 1.06, hop: 6,  strides: .55, speed: .72, waddle: 3.2 },
    wallaby: { svg: WALLABY, vb: [150, 190], hand: [110, 112], scale: 1.14, hop: 30, strides: 2.1, speed: .92, waddle: 0 },
  };
  window.ensureCritterDefs = function () {
    if (!document.getElementById('cr-fur-chip')) document.body.insertAdjacentHTML('afterbegin', DEFS);
  };
})();
