const galaxy = document.getElementById('galaxy');
const spiralStarCount = 350;

function createSpiralStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const sizes = ['star-small', 'star-medium', 'star-large'];
    const weights = [0.7, 0.2, 0.1];
    const rand = Math.random();
    let sizeClass;
    if (rand < weights[0]) sizeClass = sizes[0];
    else if (rand < weights[0] + weights[1]) sizeClass = sizes[1];
    else sizeClass = sizes[2];
    star.classList.add(sizeClass);
    const angle = Math.random() * 360;
    const distance = 300 + Math.random() * 700;
    const spiralRotation = angle + (Math.random() * 720 + 360);
    const delay = Math.random() * 12;
    const duration = 10 + Math.random() * 6;
    star.style.setProperty('--spiral-rotation', `${spiralRotation}deg`);
    star.style.setProperty('--distance', `${distance}px`);
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${duration}s`;
    galaxy.appendChild(star);
    setTimeout(() => {
        star.remove();
        createSpiralStar();
    }, (duration + delay) * 1000);
}
for (let i = 0; i < spiralStarCount; i++) {
    setTimeout(() => createSpiralStar(), i * 50);
}
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", {alpha: true});
let w, h, cx, cy;
let targetZoom = 1;
let currentZoom = 0.25;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const RING_STAR_COUNT = isMobile ? 200 : 400;
const orbitStars = [];
const planets = [];
const nebulae = [];
const shootingStars = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx = innerWidth / 2;
    cy = innerHeight / 2;
}
resize();
addEventListener("resize", resize);
addEventListener("mousemove", e=>{
    targetMouseX = (e.clientX - cx) * 0.03;
    targetMouseY = (e.clientY - cy) * 0.03;
});
addEventListener("touchmove", e=>{
    targetMouseX = (e.touches[0].clientX - cx) * 0.03;
    targetMouseY = (e.touches[0].clientY - cy) * 0.03;
}, {passive: true});
addEventListener("wheel", e=>{
    e.preventDefault();
    targetZoom = Math.max(0.5, Math.min(2, targetZoom + e.deltaY * -0.001));
}, {passive: false});
for(let i=0;i<RING_STAR_COUNT;i++){
    const ring = Math.floor(Math.random() * 8);
    const radius = 150 + ring * 80 + (Math.random()-0.5) * 30;
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.0002 + Math.random()*0.0004) * (650/radius);
    
    const colorRand = Math.random();
    let color = "white";
    if(colorRand > 0.96) color = "#ffddaa";
    else if(colorRand > 0.92) color = "#aaddff";
    
    orbitStars.push({
        radius, angle, speed,
        size: Math.random()<0.9 ? 1 : 1.5,
        alpha:0.5+Math.random()*0.5,
        depth:Math.random(), color,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.02
    });
}
for(let i=0;i<6;i++){
    nebulae.push({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        radius: 100 + Math.random()*140,
        hue: 220 + Math.random()*60,
        alpha: 0.02 + Math.random()*0.03,
        speed: 0.00008 + Math.random()*0.00015,
        angle: Math.random()*Math.PI*2
    });
}
const planetColors = ["#88aaff", "#ffaa88", "#88ffaa"];
for(let i=0;i<3;i++){
    planets.push({
        radius:240+i*150, angle:Math.random()*Math.PI*2,
        speed:0.00012+i*0.00007, size:5+i*2.5,
        color: planetColors[i],
        ringColor: i===1 ? "#ffcc66" : null,
        moonAngle: Math.random()*Math.PI*2, moonSpeed: 0.015
    });
}
class ShootingStar{
    constructor(){
        this.x = Math.random()*w;
        this.y = Math.random()*h*0.4;
        this.angle = 0.3 + Math.random()*0.4;
        this.speed = 8 + Math.random()*12;
        this.length = 40 + Math.random()*80;
        this.alpha = 1;
        this.life = 60;
    }
    update(){
        this.x += Math.cos(this.angle)*this.speed;
        this.y += Math.sin(this.angle)*this.speed;
        this.life--;
        this.alpha = this.life/60;
    }
    draw(){
        ctx.globalAlpha = this.alpha;
        const grad = ctx.createLinearGradient(
            this.x, this.y,
            this.x - Math.cos(this.angle)*this.length,
            this.y - Math.sin(this.angle)*this.length
        );
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle)*this.length, this.y - Math.sin(this.angle)*this.length);
        ctx.stroke();
    }
}
let shootTimer = 0;
function loop(){
    ctx.clearRect(0, 0, w, h);
    currentZoom += (targetZoom - currentZoom)*0.05;
    mouseX += (targetMouseX - mouseX)*0.08;
    mouseY += (targetMouseY - mouseY)*0.08;
    for(const n of nebulae){
        n.angle += n.speed;
        const nx = n.x + Math.cos(n.angle)*50;
        const ny = n.y + Math.sin(n.angle)*50;
        const grad = ctx.createRadialGradient(nx,ny,0,nx,ny,n.radius);
        grad.addColorStop(0, `hsla(${n.hue},80%,50%,${n.alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(nx-n.radius, ny-n.radius, n.radius*2, n.radius*2);
    }
    for(const s of orbitStars){
        s.angle += s.speed;
        s.twinkle += s.twinkleSpeed;
        const twinkleAlpha = s.alpha * (0.7 + Math.sin(s.twinkle)*0.3);
        const x = cx + Math.cos(s.angle)*s.radius*currentZoom + mouseX*s.depth;
        const y = cy + Math.sin(s.angle)*s.radius*currentZoom + mouseY*s.depth;
        ctx.globalAlpha = twinkleAlpha;
        ctx.fillStyle = s.color;
        if(s.size > 1.2){
            ctx.shadowBlur = 3;
            ctx.shadowColor = s.color;
        }
        ctx.fillRect(x-s.size/2, y-s.size/2, s.size, s.size);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha=1;
    for(const p of planets){
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle)*p.radius*currentZoom + mouseX*0.5;
        const y = cy + Math.sin(p.angle)*p.radius*currentZoom + mouseY*0.5;
        if(p.ringColor){
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = p.ringColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x, y, p.size*2.5, p.size*0.8, 0, 0, Math.PI*2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, p.size*1.4, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.moonAngle += p.moonSpeed;
        const mx = x + Math.cos(p.moonAngle)*p.size*3;
        const my = y + Math.sin(p.moonAngle)*p.size*3;
        ctx.beginPath();
        ctx.arc(mx, my, p.size*0.4, 0, Math.PI*2);
        ctx.fillStyle = "#aaa";
        ctx.fill();
    }
    shootTimer++;
    if(shootTimer > 180 && Math.random()<0.02){
        shootTimer = 0;
        shootingStars.push(new ShootingStar());
    }
    for(let i=shootingStars.length-1; i>=0; i--){
        const s = shootingStars[i];
        s.update();
        s.draw();
        if(s.life<=0) shootingStars.splice(i,1);
    }
    requestAnimationFrame(loop);
}
loop();
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
