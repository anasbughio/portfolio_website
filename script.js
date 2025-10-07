/* script.js
   - AOS init for scroll animations
   - Smooth header navigation
   - Fake contact form submit feedback
   - Simple animated star parallax
   - THREE.js rotating stylized globe
*/

document.addEventListener('DOMContentLoaded', ()=> {
  // Initialize AOS (Animate On Scroll)
  if (window.AOS) {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out-cubic'
    });
  }

  // Smooth scroll for nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Contact form fake submit
  const form = document.getElementById('contactForm');
  if (form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const btn = form.querySelector('.btn');
      const text = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      setTimeout(()=>{
        btn.textContent = 'Sent ✓';
        setTimeout(()=>{
          btn.disabled = false;
          btn.textContent = text;
          form.reset();
        },1400);
      },900);
    });
  }

  /* STARFIELD subtle parallax: move layers slowly on scroll */
  const s1 = document.getElementById('stars');
  const s2 = document.getElementById('stars2');
  const s3 = document.getElementById('stars3');

  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if (s1) s1.style.transform = `translateY(${y * 0.02}px)`;
    if (s2) s2.style.transform = `translateY(${y * 0.04}px)`;
    if (s3) s3.style.transform = `translateY(${y * 0.08}px)`;
  });

  /* THREE.JS Globe (stylized rings) */
  const canvas = document.getElementById('globe');
  if (canvas && window.THREE){
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    cam.position.set(0, 0, 6);

    // soft ambient + rim light
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5,5,5); scene.add(dir);

    // Group containing globe and rings
    const group = new THREE.Group();
    scene.add(group);

    // core sphere (slightly glossy)
    const sphereGeo = new THREE.SphereGeometry(1.6, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0b0b17,
      metalness: 0.2,
      roughness: 0.35,
      emissive: 0x0a1220,
      emissiveIntensity: 0.6
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // layered glowing rings (to mimic sliced globe)
    const rings = [];
    const ringColors = [0x8b6cff, 0x3be3c7, 0x66d1ff, 0xcfc6ff];
    for (let i=0;i<9;i++){
      const r = 1.8 - i*0.16;
      const geo = new THREE.TorusGeometry(r, 0.03 + (i%2)*0.01, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: ringColors[i % ringColors.length],
        opacity: 0.08 + (i%2)*0.05,
        transparent: true
      });
      const tor = new THREE.Mesh(geo, mat);
      tor.rotation.x = Math.PI/2;
      tor.rotation.z = Math.random()*Math.PI;
      tor.userData.speed = 0.002 + (i*0.0008);
      group.add(tor);
      rings.push(tor);
    }

    // small floating bits
    for (let i=0;i<30;i++){
      const smallGeo = new THREE.SphereGeometry(0.02 + Math.random()*0.04, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: ringColors[i%ringColors.length], opacity:0.9, transparent:true });
      const m = new THREE.Mesh(smallGeo, mat);
      const phi = Math.random()*Math.PI*2;
      const th = Math.random()*Math.PI;
      const rad = 1.9 + Math.random()*0.4;
      m.position.set(Math.cos(phi)*Math.sin(th)*rad, Math.cos(th)*rad*0.6, Math.sin(phi)*Math.sin(th)*rad);
      group.add(m);
    }

    // handle resize
    function resizeRendererToDisplaySize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== Math.floor(width * window.devicePixelRatio) || canvas.height !== Math.floor(height * window.devicePixelRatio);
      if (needResize) {
        renderer.setSize(width, height, false);
        cam.aspect = width / height;
        cam.updateProjectionMatrix();
      }
    }

    // animate
    let last = 0;
    function animate(t) {
      const dt = (t - last) * 0.001;
      last = t;
      // slow rotation
      group.rotation.y += 0.12 * dt;
      // rings spin independent
      rings.forEach((r,i)=>{
        r.rotation.z += r.userData.speed * 2;
      });
      // subtle bob
      group.position.y = Math.sin(t * 0.0012) * 0.04;
      resizeRendererToDisplaySize();
      renderer.render(scene, cam);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // keep pixel ratio and size on window resize
    window.addEventListener('resize', ()=> {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      cam.aspect = canvas.clientWidth / canvas.clientHeight;
      cam.updateProjectionMatrix();
    });
  }

});
