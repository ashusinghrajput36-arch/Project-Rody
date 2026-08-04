// ===================================================================================
// I. CONFIGURATION & STATE
// ===================================================================================

const canvas = document.getElementById('trafficCanvas');
const ctx = canvas.getContext('2d');

// State Config
let horizontalCars = [];
let verticalCars = [];
let vehicleCounter = 0;
let isGreenLight = true; // Represents horizontal green light
let isAdaptiveMode = false;
let isCrossroadMode = false;
let isTimerMode = false;
let lastTime = performance.now();
let lastHSpawnTime = 0;
let greenLightStartTime = 0;
let lastVSpawnTime = 0;
let lastSignalChangeTime = 0;
let currentWeather = 'clear';
let weatherParticles = [];
let arePersonalitiesEnabled = false;

// Analytics Data
let analyticsData = {
    totalSpawned: 0,
    totalExited: 0,
    simulationStartTime: 0,
};

// Simulation Parameters
let config = {
    hInflow: 40,
    vInflow: 30,
    maxSpeed: 120,  // pixels per second
    roadWidth: 70
};

const weatherConfig = {
    clear: { speedModifier: 1.0, brakingModifier: 1.0, color: '#020617' },
    rain: { speedModifier: 0.8, brakingModifier: 1.2, color: '#182338' },
    snow: { speedModifier: 0.6, brakingModifier: 1.5, color: '#334155' }
};

const driverPersonalities = {
    normal: { speedMultiplier: 1.0, followMultiplier: 1.0 },
    aggressive: { speedMultiplier: 1.2, followMultiplier: 0.7 },
    cautious: { speedMultiplier: 0.8, followMultiplier: 1.5 }
};
const personalityTypes = Object.keys(driverPersonalities);

const carColors = ['#38bdf8', '#34d399', '#facc15', '#f43f5e', '#a855f7'];


// ===================================================================================
// II. VEHICLE INFORMATION & CLASS
// ===================================================================================

class Vehicle {
    constructor(x, y, speed, color, licensePlate, direction = 'horizontal', personality = 'normal') {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.targetSpeed = speed;
        this.color = color;
        this.licensePlate = licensePlate; // RC Detail: Unique identifier
        this.personality = personality;
        this.direction = direction;
        this.width = 28;
        this.height = 14;
    }

    update(leader, isRed, stopLine, dt) {
        let isStopping = false;
        const stopX = stopLine.x;
        const stopY = stopLine.y;

        const personality = driverPersonalities[this.personality];
        const safeDistance = this.width * 1.5 * weatherConfig[currentWeather].brakingModifier * personality.followMultiplier;

        if (this.direction === 'horizontal') {
            if (isRed && (stopX - this.x) > 0 && (stopX - this.x) < 80) isStopping = true;
            if (leader && (leader.x - this.x - this.width) < safeDistance) isStopping = true;
        } else { // Vertical
            if (isRed && (stopY - this.y) > 0 && (stopY - this.y) < 80) isStopping = true;
            if (leader && (leader.y - this.y - this.width) < safeDistance) isStopping = true;
        }

        // Rule 2: Follow the leader
        // Determine target speed
        this.targetSpeed = isStopping ? 0 : config.maxSpeed * weatherConfig[currentWeather].speedModifier * personality.speedMultiplier;

        // Smoothly adjust speed and position
        this.speed += (this.targetSpeed - this.speed) * 0.1;

        if (this.direction === 'horizontal') {
            this.x += this.speed * dt;
        } else {
            this.y += this.speed * dt;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === 'vertical') {
            ctx.rotate(Math.PI / 2);
        }
        this.drawBody(ctx);
        ctx.restore();
    }

    drawBody(context) {
        // Reverted to simple 2D rectangle
        context.fillStyle = this.color;
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}


// ===================================================================================
// III. ROAD SIMULATION ENGINE
// ===================================================================================

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawRoads() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rw = config.roadWidth;

    // Background based on weather
    ctx.fillStyle = weatherConfig[currentWeather].color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road Surfaces
    ctx.fillStyle = '#0f172a';
    if (isCrossroadMode) {
        // Vertical Road
        ctx.fillRect(cx - rw / 2, 0, rw, canvas.height);
    }
    // Horizontal Road
    ctx.fillRect(0, cy - rw / 2, canvas.width, rw);

    // Stop Lines & Signals
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 4;

    const hStopX = cx - rw / 2 - 15;
    const vStopY = cy - rw / 2 - 15;

    // Horizontal Stop Line
    ctx.beginPath();
    ctx.moveTo(hStopX, cy);
    ctx.lineTo(hStopX, cy + rw / 2);
    ctx.stroke();

    // Horizontal Signal
    ctx.fillStyle = isGreenLight ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(hStopX, cy - rw / 2 - 15, 8, 0, Math.PI * 2);
    ctx.fill();

    if (isCrossroadMode) {
        // Vertical Stop Line
        ctx.beginPath();
        ctx.moveTo(cx, vStopY);
        ctx.lineTo(cx + rw / 2, vStopY);
        ctx.stroke();

        // Vertical Signal
        ctx.fillStyle = !isGreenLight ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(cx + rw / 2 + 15, vStopY, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    return { hStopX, vStopY };
}

function updateWeather() {
    if (currentWeather === 'clear') {
        weatherParticles = [];
        return;
    }

    // Add new particles
    for (let i = 0; i < 5; i++) {
        weatherParticles.push({
            x: Math.random() * canvas.width,
            y: -10,
            length: currentWeather === 'rain' ? Math.random() * 15 + 5 : 2,
            speed: currentWeather === 'rain' ? Math.random() * 5 + 5 : Math.random() * 1 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }

    // Update and draw particles
    for (let i = weatherParticles.length - 1; i >= 0; i--) {
        let p = weatherParticles[i];
        p.y += p.speed;
        if (p.y > canvas.height) {
            weatherParticles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = '#cbd5e1'; // Light color for rain/snow
            ctx.fillRect(p.x, p.y, currentWeather === 'rain' ? 1 : 2, p.length);
            ctx.globalAlpha = 1.0;
        }
    }
}

function gameLoop(now) {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    const { hStopX, vStopY } = drawRoads();

    // --- Vehicle Spawning ---
    const hLaneY = canvas.height / 2 + config.roadWidth / 4;
    const vLaneX = canvas.width / 2 + config.roadWidth / 4;

    const hSpawnInterval = 60 / config.hInflow;
    if ((now - lastHSpawnTime) / 1000 > hSpawnInterval) {
        vehicleCounter++;
        analyticsData.totalSpawned++;
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        const personality = arePersonalitiesEnabled ? personalityTypes[Math.floor(Math.random() * personalityTypes.length)] : 'normal';
        horizontalCars.push(new Vehicle(-30, hLaneY, config.maxSpeed, color, `H${vehicleCounter}`, 'horizontal', personality));
        lastHSpawnTime = now;
    }

    if (isCrossroadMode) {
        const vSpawnInterval = 60 / config.vInflow;
        if ((now - lastVSpawnTime) / 1000 > vSpawnInterval) {
            analyticsData.totalSpawned++;
            vehicleCounter++;
            const color = carColors[Math.floor(Math.random() * carColors.length)];
            const personality = arePersonalitiesEnabled ? personalityTypes[Math.floor(Math.random() * personalityTypes.length)] : 'normal';
            verticalCars.push(new Vehicle(vLaneX, -30, config.maxSpeed, color, `V${vehicleCounter}`, 'vertical', personality));
            lastVSpawnTime = now;
        }
    }

    // --- Vehicle Updating & Drawing ---
    let queueCount = 0;
    horizontalCars.forEach((car, index) => {
        let leader = horizontalCars[index - 1] || null;
        car.update(leader, !isGreenLight, { x: hStopX }, dt);
        car.draw(ctx);
        if (car.speed < 5 && car.x < hStopX) {
            queueCount++;
        }
    });

    verticalCars.forEach((car, index) => {
        let leader = verticalCars[index - 1] || null;
        // Vertical cars stop if the horizontal light is green
        car.update(leader, isGreenLight, { y: vStopY }, dt);
        car.draw(ctx);
        // You could add a vertical queue count here if needed
    });

    // --- Cleanup ---
    horizontalCars = horizontalCars.filter(car => {
        if (car.x < canvas.width + 50) return true;
        analyticsData.totalExited++;
        return false;
    });
    verticalCars = verticalCars.filter(car => {
        if (car.y < canvas.height + 50) return true;
        analyticsData.totalExited++;
        return false;
    });

    // Dynamic user interface 
    document.getElementById('carCount').innerText = horizontalCars.length + verticalCars.length;
    document.getElementById('metricQueue').innerText = `${queueCount} cars`;

    updateWeather();

    // Adaptive Signal Logic
    if (isAdaptiveMode && !isCrossroadMode) {
        // Condition to turn the light GREEN:
        // If the light is red and the queue is getting long.
        if (!isGreenLight && queueCount >= 5) {
            toggleLight();
        }
        // Condition to turn the light RED:
        // If the light is green, the queue is empty, and it has been green for a minimum duration.
        else if (isGreenLight && queueCount === 0 && (now - greenLightStartTime) > 8000) { // 8-second minimum green time
            toggleLight();
        }
    }
    
    // Timer Mode Logic
    if (isTimerMode) {
        const timerInterval = document.getElementById('timerIntervalInput').value * 1000;
        const elapsedTime = now - lastSignalChangeTime;
        if (elapsedTime > timerInterval) {
            toggleLight();
        } else {
            // Update countdown display
            const remainingTime = (timerInterval - elapsedTime) / 1000;
            document.getElementById('timerCountdown').innerText = `(${remainingTime.toFixed(1)}s)`;
        }
    }

    // Update Flow Status metric
    const statusEl = document.getElementById('metricStatus');
    if (queueCount > 10) {
        statusEl.textContent = 'Heavy';
        statusEl.className = 'metric-value status-heavy';
    } else {
        statusEl.textContent = 'Fluid';
        statusEl.className = 'metric-value status-fluid';
    }

    updateAnalyticsDashboard(now, queueCount, statusEl.textContent);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ===================================================================================
// IV. UI CONTROLS & EVENT LISTENERS
// ===================================================================================
function initializeControls() {
    // Set initial slider values
    document.getElementById('inflowSlider').value = config.hInflow;
    document.getElementById('speedSlider').value = config.maxSpeed;

    // Set initial button state for weather
    setWeather(currentWeather);

    toggleLight();
    toggleLight(); // Call twice to set initial state without toggling
}

// user interfaceListeners
document.getElementById('inflowSlider').addEventListener('input', (e) => {
    config.hInflow = Number(e.target.value);
    config.vInflow = Number(e.target.value) * 0.75; // Vertical is a bit less busy
    document.getElementById('inflowVal').innerText = e.target.value;
});
document.getElementById('speedSlider').addEventListener('input', (e) => {
    config.maxSpeed = Number(e.target.value);
    document.getElementById('speedVal').innerText = e.target.value;
});
const toggleBtn = document.getElementById('toggleLightBtn');
function toggleLight() {
    isGreenLight = !isGreenLight;
    if (isGreenLight) {
        lastSignalChangeTime = performance.now();
        greenLightStartTime = performance.now();
        if (isCrossroadMode) {
            toggleBtn.innerHTML = 'H-Signal: <span style="color: #34d399;">GREEN</span>';
        } else {
            toggleBtn.innerText = 'Manual Signal: GREEN';
        }
    } else {
        lastSignalChangeTime = performance.now();
        if (isCrossroadMode) {
            toggleBtn.innerHTML = 'H-Signal: <span style="color: #fb7185;">RED</span>';
        } else {
            toggleBtn.innerText = 'Manual Signal: RED';
        }
    }}
toggleBtn.addEventListener('click', toggleLight);
canvas.addEventListener('click', () => {
    if (!isAdaptiveMode) { // Only allow manual canvas clicks if adaptive mode is off
        toggleLight();
    }
});

const adaptiveBtn = document.getElementById('adaptiveModeBtn');
adaptiveBtn.addEventListener('click', () => {
    isAdaptiveMode = !isAdaptiveMode;
    if (isAdaptiveMode) {
        adaptiveBtn.className = 'btn btn-emerald w-full';
        adaptiveBtn.innerText = 'Adaptive Mode: ACTIVE';
        toggleBtn.disabled = true;
        timerModeBtn.disabled = true;
    } else {
        adaptiveBtn.className = 'btn btn-sky w-full';
        adaptiveBtn.innerText = 'Activate Adaptive Mode';
        toggleBtn.disabled = false;
        timerModeBtn.disabled = false;
    }
});

const crossroadToggleBtn = document.getElementById('crossroadToggleBtn');
crossroadToggleBtn.addEventListener('click', () => {
    isCrossroadMode = !isCrossroadMode;
    document.body.classList.toggle('crossroad-mode', isCrossroadMode);
    
    // Reset simulation state
    horizontalCars = [];
    verticalCars = [];
    isTimerMode = false; // Always start crossroad with timer mode off
    isAdaptiveMode = false;

    document.getElementById('appSubtitle').innerText = isCrossroadMode ? 'Crossroad Simulation' : 'Single Road Simulation';
    initializeControls(); // Re-initialize controls for the new mode
});

const timerModeBtn = document.getElementById('timerModeBtn');
timerModeBtn.addEventListener('click', () => {
    isTimerMode = !isTimerMode;
    if (isTimerMode) {
        timerModeBtn.className = 'btn btn-emerald';
        document.getElementById('timerModeText').innerText = 'Timer Mode: Active';
        toggleBtn.disabled = true;
        adaptiveBtn.disabled = true;
        lastSignalChangeTime = performance.now(); // Start timer immediately
    } else {
        timerModeBtn.className = 'btn btn-sky';
        document.getElementById('timerModeText').innerText = 'Activate Timer Mode';
        document.getElementById('timerCountdown').innerText = ''; // Clear countdown
        toggleBtn.disabled = false;
        adaptiveBtn.disabled = false;
    }
});

function setWeather(weather) {
    currentWeather = weather;
    document.querySelectorAll('.weather-btn').forEach(btn => btn.classList.remove('active'));
    if (weather === 'clear') document.getElementById('weatherClear').classList.add('active');
    if (weather === 'rain') document.getElementById('weatherRain').classList.add('active');
    if (weather === 'snow') document.getElementById('weatherSnow').classList.add('active');
}

document.getElementById('weatherClear').addEventListener('click', () => setWeather('clear'));
document.getElementById('weatherRain').addEventListener('click', () => setWeather('rain'));
document.getElementById('weatherSnow').addEventListener('click', () => setWeather('snow'));

const personalitiesBtn = document.getElementById('personalitiesBtn');
personalitiesBtn.addEventListener('click', () => {
    arePersonalitiesEnabled = !arePersonalitiesEnabled;
    if (arePersonalitiesEnabled) {
        personalitiesBtn.className = 'btn btn-emerald w-full';
        personalitiesBtn.innerText = 'Personalities: ON';
    } else {
        personalitiesBtn.className = 'btn btn-sky w-full';
        personalitiesBtn.innerText = 'Personalities: OFF';
    }
});

// Analytics Dashboard Functions
function updateAnalyticsDashboard(now, currentQueue, currentFlowStatus) {
    if (analyticsData.simulationStartTime === 0) {
        analyticsData.simulationStartTime = now;
    }
    const uptimeSeconds = Math.floor((now - analyticsData.simulationStartTime) / 1000);
    analyticsData.currentUptime = uptimeSeconds;

    document.getElementById('analyticSpawned').innerText = analyticsData.totalSpawned;
    document.getElementById('analyticExited').innerText = analyticsData.totalExited;
    document.getElementById('analyticUptime').innerText = `${uptimeSeconds}s`;
    document.getElementById('analyticQueue').innerText = `${currentQueue} cars`;
    document.getElementById('analyticFlowStatus').innerText = currentFlowStatus;

    // Calculate throughput rate (cars per minute)
    let throughputRate = 0;
    if (uptimeSeconds > 0) {
        throughputRate = (analyticsData.totalExited / uptimeSeconds) * 60;
    }
    document.getElementById('analyticThroughput').innerText = `${throughputRate.toFixed(1)} cars/min`;
}

function openAnalyticsModal() {
    document.getElementById('analyticsModal').classList.remove('hidden');
}

function closeAnalyticsModal() {
    document.getElementById('analyticsModal').classList.add('hidden');
}

function resetAnalytics() {
    analyticsData = {
        totalSpawned: 0,
        totalExited: 0,
        simulationStartTime: 0,
        currentUptime: 0,
    };
    // Also reset simulation if needed, or just analytics
    horizontalCars = [];
    verticalCars = [];
    vehicleCounter = 0;
    lastHSpawnTime = 0;
    lastVSpawnTime = 0;
}

document.getElementById('analyticsBtn').addEventListener('click', openAnalyticsModal);

// Initialize controls on page load
initializeControls();