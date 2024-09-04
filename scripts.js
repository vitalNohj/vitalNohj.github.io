const sunset = document.getElementById('sunset');
const sun = document.querySelector('.sun');
const clouds = [];
let birdCount = 0;
const maxBirdCount = 100;

class Cloud {
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('cloud');
        this.size = Math.random() * 100 + 100; // Base size 100-200px
        this.element.style.width = `${this.size * 2}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.top = `${Math.random() * 40}%`;
        this.element.style.zIndex = Math.random() < 0.3 ? '11' : '1';
        this.x = window.innerWidth;
        this.speed = Math.random() * 0.2 + 0.1;
        this.createCloudShape();
        sunset.appendChild(this.element);
        this.startTime = Date.now();
    }

    createCloudShape() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 200 150'); // Changed from '0 0 200 100' to '0 0 200 150'

        const defs = document.createElementNS(svgNS, "defs");
        const grad = document.createElementNS(svgNS, "radialGradient");
        grad.setAttribute('id', `cloudGradient_${Date.now()}`);
        grad.innerHTML = `
            <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.4)" />
        `;
        defs.appendChild(grad);
        svg.appendChild(defs);

        this.group = document.createElementNS(svgNS, "g");
        this.group.setAttribute('fill', `url(#${grad.id})`);

        // Generate main cloud structure
        this.circles = this.generateCloudStructure();

        // Add circles to SVG
        this.circles.forEach(circle => {
            const elem = document.createElementNS(svgNS, "circle");
            elem.setAttribute('cx', circle.cx);
            elem.setAttribute('cy', circle.cy);
            elem.setAttribute('r', circle.r);
            this.group.appendChild(elem);
        });

        // Create bottom curve
        this.path = document.createElementNS(svgNS, "path");
        this.updatePath();
        this.group.appendChild(this.path);

        svg.appendChild(this.group);
        this.element.appendChild(svg);
    }

    generateCloudStructure() {
        const circles = [];
        const numMainCircles = Math.floor(Math.random() * 3) + 3; // 3 to 5 main circles
        let lastX = 0;

        for (let i = 0; i < numMainCircles; i++) {
            const r = Math.random() * 20 + 30; // Radius between 30 and 50
            const cx = lastX + r + Math.random() * 20;
            const cy = 50 + (Math.random() - 0.5) * 30;
            circles.push({ cx, cy, r });
            lastX = cx;

            // Add 1-3 smaller circles around each main circle
            const numSmallCircles = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numSmallCircles; j++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = r * 0.7;
                const smallR = r * (0.3 + Math.random() * 0.3);
                circles.push({
                    cx: cx + Math.cos(angle) * distance,
                    cy: cy + Math.sin(angle) * distance,
                    r: smallR
                });
            }
        }

        // Normalize positions
        const maxX = Math.max(...circles.map(c => c.cx + c.r));
        circles.forEach(c => c.cx = (c.cx / maxX) * 190 + 5);

        return circles;
    }

    updatePath() {
        const points = this.circles.map(c => ({ x: c.cx, y: c.cy + c.r }));
        points.sort((a, b) => a.x - b.x);
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        let path = `M ${firstPoint.x} 150 L ${firstPoint.x} ${firstPoint.y}`;
        for (let i = 1; i < points.length; i++) {
            const midX = (points[i - 1].x + points[i].x) / 2;
            path += ` Q ${midX} ${points[i - 1].y}, ${points[i].x} ${points[i].y}`;
        }
        path += ` L ${lastPoint.x} 150 Z`;

        this.path.setAttribute('d', path);
    }

    move() {
        this.x -= this.speed;
        this.element.style.left = `${this.x}px`;

        // Subtle shape morphing
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        this.circles.forEach((circle, index) => {
            const circleElement = this.group.children[index];
            const radiusVariation = Math.sin(elapsedTime + index) * 2;
            const newRadius = circle.r + radiusVariation;
            circleElement.setAttribute('r', newRadius);

            const posVariation = Math.cos(elapsedTime + index) * 3;
            circleElement.setAttribute('cx', circle.cx + posVariation);
            circleElement.setAttribute('cy', circle.cy + posVariation);
        });

        this.updatePath();

        if (this.x + this.size * 2 < 0) {
            sunset.removeChild(this.element);
            return false;
        }
        return true;
    }
}

function createCloud() {
    clouds.push(new Cloud());
}

function animateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        if (!clouds[i].move()) {
            clouds.splice(i, 1);
        }
    }
    requestAnimationFrame(animateClouds);
}

function createRay() {
    const ray = document.createElement('div');
    ray.classList.add('ray');
    const angle = Math.random() * 180 - 90;
    ray.style.transform = `rotate(${angle}deg)`;
    ray.style.height = '200px';
    sunset.appendChild(ray);

    let length = 200;
    let growing = true;
    let swayAngle = angle;
    let swayDirection = Math.random() < 0.5 ? -1 : 1;

    function animateRay() {
        if (growing) {
            length += 0.5;
            if (length > 300) growing = false;
        } else {
            length -= 0.5;
            if (length < 200) growing = true;
        }

        swayAngle += 0.05 * swayDirection;
        if (Math.abs(swayAngle - angle) > 5) {
            swayDirection *= -1;
        }

        ray.style.height = `${length}px`;
        ray.style.transform = `rotate(${swayAngle}deg)`;
        requestAnimationFrame(animateRay);
    }
    animateRay();
}

function createBird(direction = 'right', isInFlock = false) {
    const bird = document.createElement('div');
    bird.classList.add('bird');
    bird.style.top = `${Math.random() * 60 + 10}%`;
    bird.style.left = direction === 'right' ? '-20px' : 'calc(100% + 20px)';
    bird.style.zIndex = Math.random() < 0.3 ? '7' : '1';

    sunset.appendChild(bird);

    let position = direction === 'right' ? -20 : window.innerWidth + 20;
    let flapInterval = Math.random() * 3000;
    let lastFlapTime = Date.now();
    let isFlapped = false;

    function animateBird() {
        position += direction === 'right' ? 0.5 : -0.5;
        bird.style.left = `${position}px`;

        if (Date.now() - lastFlapTime > flapInterval) {
            isFlapped = !isFlapped;
            bird.style.clipPath = isFlapped
                ? 'polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 70%, 20% 30%)'
                : 'polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 60%, 20% 30%)';
            lastFlapTime = Date.now();
            flapInterval = Math.random() * 6000 + 2000;
        }

        if ((direction === 'right' && position > window.innerWidth + 20) ||
            (direction === 'left' && position < -20)) {
            sunset.removeChild(bird);
        } else {
            requestAnimationFrame(animateBird);
        }
    }
    animateBird();

    if (!isInFlock && Math.random() < 0.2) {
        for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
            setTimeout(() => createBird(direction, true), Math.random() * 1000);
        }
    }
}

function spawnBird() {
    if (!(birdCount > maxBirdCount)) {
        const direction = Math.random() < 0.5 ? 'right' : 'left';
        createBird(direction);
    }
    setTimeout(spawnBird, Math.random() * 10000 + 5000);
}

function animateSun() {
    let sunPosition = -40;
    function moveSun() {
        sunPosition += 0.05;
        sun.style.bottom = `${sunPosition}px`;
        sunset.style.background = `linear-gradient(0deg,
                    hsl(${15 - sunPosition / 2}, 100%, ${60 + sunPosition / 4}%),
                    hsl(${30 - sunPosition / 2}, 100%, ${70 + sunPosition / 4}%),
                    hsl(${45 - sunPosition / 2}, 100%, ${80 + sunPosition / 4}%),
                    hsl(${190 - sunPosition / 2}, 50%, ${50 + sunPosition / 4}%))`;
        if (sunPosition < 100) {
            requestAnimationFrame(moveSun);
        }
    }
    moveSun();
}

const numRays = 30;
// Initialize
for (let i = 0; i < numRays; i++) {
    createRay();
}
animateSun();
setInterval(createCloud, 3000);
animateClouds();
spawnBird();

// Responsive design
window.addEventListener('resize', () => {
    document.querySelectorAll('.cloud, .ray, .bird').forEach(el => el.remove());
    clouds.length = 0;
    birdCount = 0;
    for (let i = 0; i < 20; i++) {
        createRay();
    }
    spawnBird();
});

// The following is the old script code that worked relatively well
// const sunset = document.getElementById('sunset');
// const sun = document.querySelector('.sun');

// function createCloud() {
//     const cloud = document.createElement('div');
//     cloud.classList.add('cloud');
//     const size = Math.random() * 100 + 50;
//     cloud.style.width = `${size}px`;
//     cloud.style.height = `${size * 0.6}px`;
//     cloud.style.top = `${Math.random() * 40}%`;
//     cloud.style.right = '-100px';
//     cloud.style.filter = `blur(${Math.random() * 3 + 1}px)`;

//     // Create irregular shape
//     const blobPath = `M${Math.random() * 30 + 35},${Math.random() * 20 + 40}
//                               Q${Math.random() * 40 + 30},${Math.random() * 20 + 20} ${Math.random() * 30 + 60},${Math.random() * 20 + 40}
//                               T${Math.random() * 30 + 90},${Math.random() * 20 + 40}
//                               T${Math.random() * 30 + 60},${Math.random() * 20 + 60}
//                               T${Math.random() * 30 + 30},${Math.random() * 20 + 60} Z`;
//     cloud.style.clipPath = `path('${blobPath}')`;

//     sunset.appendChild(cloud);

//     let position = window.innerWidth;
//     function moveCloud() {
//         position -= 0.2;
//         cloud.style.right = `${-position}px`;
//         if (position < -100) {
//             sunset.removeChild(cloud);
//         } else {
//             requestAnimationFrame(moveCloud);
//         }
//     }
//     moveCloud();
// }

// function createRay() {
//     const ray = document.createElement('div');
//     ray.classList.add('ray');
//     const angle = Math.random() * 180 - 90;
//     ray.style.transform = `rotate(${angle}deg)`;
//     ray.style.height = '200px';
//     sunset.appendChild(ray);

//     let length = 200;
//     let growing = true;
//     let swayAngle = angle;
//     let swayDirection = Math.random() < 0.5 ? -1 : 1;

//     function animateRay() {
//         if (growing) {
//             length += 0.5;
//             if (length > 300) growing = false;
//         } else {
//             length -= 0.5;
//             if (length < 200) growing = true;
//         }

//         swayAngle += 0.05 * swayDirection;
//         if (Math.abs(swayAngle - angle) > 5) {
//             swayDirection *= -1;
//         }

//         ray.style.height = `${length}px`;
//         ray.style.transform = `rotate(${swayAngle}deg)`;
//         requestAnimationFrame(animateRay);
//     }
//     animateRay();
// }

// function createBird(direction = 'right', isInFlock = false) {
//     const bird = document.createElement('div');
//     bird.classList.add('bird');
//     bird.style.top = `${Math.random() * 60 + 10}%`;
//     bird.style.left = direction === 'right' ? '-20px' : 'calc(100% + 20px)';
//     sunset.appendChild(bird);

//     let position = direction === 'right' ? -20 : window.innerWidth + 20;
//     let flapInterval = Math.random() * 3000; // 2 to 8 seconds
//     let lastFlapTime = Date.now();
//     let isFlapped = false;

//     function animateBird() {
//         position += direction === 'right' ? 0.5 : -0.5;
//         bird.style.left = `${position}px`;

//         // Flap wings
//         if (Date.now() - lastFlapTime > flapInterval) {
//             isFlapped = !isFlapped;
//             bird.style.clipPath = isFlapped
//                 ? 'polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 70%, 20% 30%)'
//                 : 'polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 60%, 20% 30%)';
//             lastFlapTime = Date.now();
//             flapInterval = Math.random() * 6000 + 2000; // New random interval
//         }

//         if ((direction === 'right' && position > window.innerWidth + 20) ||
//             (direction === 'left' && position < -20)) {
//             sunset.removeChild(bird);
//         } else {
//             requestAnimationFrame(animateBird);
//         }
//     }
//     animateBird();

//     // Spawn flock
//     if (!isInFlock && Math.random() < 0.2) { // 20% chance to spawn a flock
//         for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) { // 2 to 6 additional birds
//             setTimeout(() => createBird(direction, true), Math.random() * 1000);
//         }
//     }
// }

// function spawnBird() {
//     const direction = Math.random() < 0.5 ? 'right' : 'left';
//     createBird(direction);
//     setTimeout(spawnBird, Math.random() * 10000 + 5000); // Spawn every 5 to 15 seconds
// }

// function animateSun() {
//     let sunPosition = -40;
//     function moveSun() {
//         sunPosition += 0.05;
//         sun.style.bottom = `${sunPosition}px`;
//         sunset.style.background = `linear-gradient(0deg,
//                     hsl(${15 - sunPosition / 2}, 100%, ${60 + sunPosition / 4}%),
//                     hsl(${30 - sunPosition / 2}, 100%, ${70 + sunPosition / 4}%),
//                     hsl(${45 - sunPosition / 2}, 100%, ${80 + sunPosition / 4}%),
//                     hsl(${190 - sunPosition / 2}, 50%, ${50 + sunPosition / 4}%))`;
//         if (sunPosition < 100) {
//             requestAnimationFrame(moveSun);
//         }
//     }
//     moveSun();
// }

// // Initialize
// for (let i = 0; i < 20; i++) {
//     createRay();
// }
// animateSun();
// setInterval(createCloud, 3000); // Create a new cloud every 3 seconds
// spawnBird(); // Start spawning birds

// // Responsive design
// window.addEventListener('resize', () => {
//     // Clear existing elements
//     document.querySelectorAll('.cloud, .ray, .bird').forEach(el => el.remove());

//     // Reinitialize
//     for (let i = 0; i < 20; i++) {
//         createRay();
//     }
//     spawnBird();
// });


