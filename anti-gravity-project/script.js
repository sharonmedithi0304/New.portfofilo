let container = document.getElementById("container");
let gravityOn = true;

let boxes = [];
let gravity = 0.6;
let bounceFactor = 0.7;

let ground = window.innerHeight - 60;

let selectedBox = null;
let lastMouseY = 0;
let lastMouseX = 0;
let mouseVelocityY = 0;
let mouseVelocityX = 0;

// create box
function createBox(x, y) {
    let box = document.createElement("div");
    box.classList.add("box");

    let color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    box.style.background = color;

    container.appendChild(box);

    return {
        el: box,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: 0,
        angle: 0,
        rotationSpeed: (Math.random() - 0.5) * 10
    };
}

// initial boxes
for (let i = 0; i < 3; i++) {
    boxes.push(createBox(100 + i * 80, 50));
}

// explosion function
function explode(x, y) {
    boxes.forEach(b => {
        let dx = b.x - x;
        let dy = b.y - y;

        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200 && distance > 0) {
            let force = (200 - distance) / 10;

            b.vx += (dx / distance) * force;
            b.vy += (dy / distance) * force;
        }
    });
}

// spawn + explode (fixed button issue)
document.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") return;

    explode(e.clientX, e.clientY);
    boxes.push(createBox(e.clientX, e.clientY));
});

// select box
document.addEventListener("mousedown", function (e) {
    selectedBox = boxes.find(b => {
        let rect = b.el.getBoundingClientRect();
        return (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );
    });

    lastMouseY = e.clientY;
    lastMouseX = e.clientX;
});

// move box
document.addEventListener("mousemove", function (e) {
    if (selectedBox) {
        mouseVelocityY = e.clientY - lastMouseY;
        mouseVelocityX = e.clientX - lastMouseX;

        lastMouseY = e.clientY;
        lastMouseX = e.clientX;

        selectedBox.y = e.clientY;
        selectedBox.x = e.clientX;

        selectedBox.vx = 0;
        selectedBox.vy = 0;
    }
});

// release (throw)
document.addEventListener("mouseup", function () {
    if (selectedBox) {
        selectedBox.vy = mouseVelocityY;
        selectedBox.vx = mouseVelocityX;
        selectedBox = null;
    }
});

function update() {

    boxes.forEach(b => {

        if (b !== selectedBox) {
            if (gravityOn) {
                b.vy += gravity;
            }

            b.y += b.vy;
            b.x += b.vx;
        }

        // ground
        if (b.y >= ground) {
            b.y = ground;
            b.vy = -b.vy * bounceFactor;
            b.vx *= 0.98;
        }

        // walls
        if (b.x <= 0 || b.x >= window.innerWidth - 60) {
            b.vx = -b.vx * bounceFactor;
        }

        // 🔥 rotation update (THIS is what you asked)
        b.angle += b.rotationSpeed;
        b.el.style.transform = `rotate(${b.angle}deg)`;
    });

    // collisions
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {

            let a = boxes[i];
            let b = boxes[j];

            let dx = a.x - b.x;
            let dy = a.y - b.y;

            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDist = 60;

            if (distance < minDist) {
                let overlap = minDist - distance;

                let angle = Math.atan2(dy, dx);

                let moveX = Math.cos(angle) * overlap / 2;
                let moveY = Math.sin(angle) * overlap / 2;

                a.x += moveX;
                a.y += moveY;

                b.x -= moveX;
                b.y -= moveY;

                let tempVX = a.vx;
                let tempVY = a.vy;

                a.vx = b.vx;
                a.vy = b.vy;

                b.vx = tempVX;
                b.vy = tempVY;
            }
        }
    }

    // apply positions
    boxes.forEach(b => {
        b.el.style.left = b.x + "px";
        b.el.style.top = b.y + "px";
    });

    requestAnimationFrame(update);
}

update();

// UI controls
function toggleGravity() {
    gravityOn = !gravityOn;

    let btn = document.getElementById("gravityBtn");
    btn.innerText = gravityOn ? "Gravity: ON" : "Gravity: OFF";
}

function clearBoxes() {
    boxes.forEach(b => b.el.remove());
    boxes = [];
}