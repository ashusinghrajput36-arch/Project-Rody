// ===================================================================================
// I. CONFIGURATION & STATE
// ===================================================================================

const canvas = document.getElementById('multilaneCanvas');
const ctx = canvas.getContext('2d');

// State Config
let cars = [];
let vehicleCounter = 0;
let lastTime = performance.now();
let lastSpawnTime = 0;
let overtakeCount = 0;
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
    inflowRate: 40, // cars per minute
    maxSpeed: 120,  // pixels per second
    roadWidth: 70,  // Total width of the road area
    numLanes: 2,    // Number of lanes in one direction
    laneWidth: 0,   // Calculated based on roadWidth and numLanes
    overtakeThreshold: 50 // Distance to leader before considering overtake
};

const weatherConfig = {
    clear: { speedModifier: 1.0, brakingModifier: 1.0, color: '#020617' },
    rain: { speedModifier: 0.8, brakingModifier: 1.2, color: '#182338' },
    snow: { speedModifier: 0.6, brakingModifier: 1.5, color: '#334155' }
};

const driverPersonalities = {
    normal: { speedMultiplier: 1.0, followMultiplier: 1.0, overtakeUrgency: 0.9 },
    aggressive: { speedMultiplier: 1.2, followMultiplier: 0.7, overtakeUrgency: 0.7 },
    cautious: { speedMultiplier: 0.8, followMultiplier: 1.5, overtakeUrgency: 1.0 }
};
const personalityTypes = Object.keys(driverPersonalities);

const carColors = ['#38bdf8', '#34d399', '#facc15', '#f43f5e', '#a855f7'];

// ===================================================================================
// II. VEHICLE INFORMATION & CLASS
// ===================================================================================

class Vehicle {
    constructor(x, y, speed, color, licensePlate, lane, personality = 'normal') {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.targetSpeed = speed;
        this.color = color;
        this.personality = personality;
        this.licensePlate = licensePlate;
        this.lane = lane; // Current lane index (0 to config.numLanes - 1)
        this.targetLaneY = this.calculateLaneCenterY(lane); // Y-coordinate for the center of its current lane
        this.width = 28;
        this.height = 14;
        this.isChangingLane = false;
        this.laneChangeDirection = 0; // 1 for right, -1 for left
        this.laneChangeProgress = 0; // 0 to 1 for smooth transition
    }

    calculateLaneCenterY(laneIndex) {
        const cy = canvas.height / 2;
        const roadTop = cy - config.roadWidth / 2;
        return roadTop + (laneIndex * config.laneWidth) + (config.laneWidth / 2);
    }

    update(allVehicles, dt) {
        let isBlocked = false;
        let leader = null;

        const personality = driverPersonalities[this.personality];
        const safeDistance = config.overtakeThreshold * weatherConfig[currentWeather].brakingModifier * personality.followMultiplier;

        // Find leader in current lane
        const vehiclesInCurrentLane = allVehicles.filter(car => car.lane === this.lane && car.x > this.x);
        if (vehiclesInCurrentLane.length > 0) {
            leader = vehiclesInCurrentLane.reduce((prev, curr) => (prev.x < curr.x ? prev : curr));
            const gap = leader.x - this.x - this.width;
            if (gap < safeDistance) {
                isBlocked = true;
                this.targetSpeed = leader.speed; // Match leader's speed
            }
        }

        // If not blocked, accelerate to max speed
        if (!isBlocked) {
            this.targetSpeed = config.maxSpeed * weatherConfig[currentWeather].speedModifier * personality.speedMultiplier;
        }

        // Overtaking Logic (simplified)
        if (isBlocked && this.speed < (config.maxSpeed * personality.overtakeUrgency) && !this.isChangingLane) {
            // Try to change to the right lane
            const targetLane = this.lane + 1;
            if (targetLane < config.numLanes) {
                // Check if target lane is clear
                const isTargetLaneClear = this.checkLaneClearance(allVehicles, targetLane);
                if (isTargetLaneClear) {
                    this.initiateLaneChange(targetLane, 1);
                    overtakeCount++;
                }
            }
        }

        // Smoothly adjust speed
        this.speed += (this.targetSpeed - this.speed) * 0.1;
        this.x += this.speed * dt;

        // Handle lane change movement
        if (this.isChangingLane) {
            this.laneChangeProgress += dt * 2; // Speed of lane change
            if (this.laneChangeProgress >= 1) {
                this.y = this.targetLaneY;
                this.lane = this.targetLane;
                this.isChangingLane = false;
                this.laneChangeProgress = 0;
                this.laneChangeDirection = 0;
            } else {
                const startY = this.calculateLaneCenterY(this.lane - this.laneChangeDirection); // Y before starting change
                this.y = startY + (this.targetLaneY - startY) * this.laneChangeProgress;
            }
        }
    }

    initiateLaneChange(targetLaneIndex, direction) {
        this.isChangingLane = true;
        this.targetLane = targetLaneIndex;
        this.laneChangeDirection = direction;
        this.targetLaneY = this.calculateLaneCenterY(targetLaneIndex);
        this.laneChangeProgress = 0;
    }

    checkLaneClearance(allVehicles, targetLaneIndex) {
        // Check for cars in the target lane that would collide during a lane change
        const checkDistance = this.width * 3; // Look a few car lengths ahead and behind
        const vehiclesInTargetLane = allVehicles.filter(car => car.lane === targetLaneIndex);

        for (const otherCar of vehiclesInTargetLane) {
            // Check if otherCar is within the critical zone for lane change
            if (
                (otherCar.x > this.x - checkDistance && otherCar.x < this.x + this.width + checkDistance) ||
                (otherCar.x + otherCar.width > this.x - checkDistance && otherCar.x + otherCar.width < this.x + this.width + checkDistance)
            ) {
                return false; // Lane is not clear
            }
        }
        return true; // Lane appears clear
    }

    draw(ctx) {
        // Reverted to simple 2D rectangle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

// ===================================================================================
// III. ROAD SIMULATION ENGINE
// ===================================================================================

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    config.laneWidth = config.roadWidth / config.numLanes;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawRoads() {
    const cy = canvas.height / 2;
    const roadTop = cy - config.roadWidth / 2;

    // Background based on weather
    ctx.fillStyle = weatherConfig[currentWeather].color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road Surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, roadTop, canvas.width, config.roadWidth);

    // Lane Dividers
    ctx.strokeStyle = '#475569'; // Grey for lane lines
    ctx.lineWidth = 2;
    for (let i = 1; i < config.numLanes; i++) {
        const laneDividerY = roadTop + (i * config.laneWidth);
        ctx.beginPath();
        ctx.setLineDash([10, 10]); // Dashed line
        ctx.moveTo(0, laneDividerY);
        ctx.lineTo(canvas.width, laneDividerY);
        ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash
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

    drawRoads();

    // --- Vehicle Spawning ---
    const spawnInterval = 60 / config.inflowRate;
    if ((now - lastSpawnTime) / 1000 > spawnInterval) {
        vehicleCounter++;
        analyticsData.totalSpawned++;
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        const personality = arePersonalitiesEnabled ? personalityTypes[Math.floor(Math.random() * personalityTypes.length)] : 'normal';
        const randomLane = Math.floor(Math.random() * config.numLanes);
        const spawnY = new Vehicle(0, 0, 0, '', '', randomLane).calculateLaneCenterY(randomLane); // Calculate Y for the lane
        cars.push(new Vehicle(-30, spawnY, config.maxSpeed, color, `ML-${vehicleCounter}`, randomLane, personality));
        lastSpawnTime = now;
    }

    // --- Vehicle Updating & Drawing ---
    // Sort cars by x-position to correctly find leaders
    cars.sort((a, b) => a.x - b.x);

    cars.forEach(car => {
        car.update(cars, dt); // Pass all cars for lane checking
        car.draw(ctx);
    });

    // --- Cleanup ---
    cars = cars.filter(car => {
        if (car.x < canvas.width + 50) return true;
        analyticsData.totalExited++;
        return false;
    });

    // Dynamic user interface
    document.getElementById('carCount').innerText = cars.length;
    document.getElementById('metricTotalVehicles').innerText = cars.length;
    document.getElementById('metricOvertakes').innerText = overtakeCount;

    updateAnalyticsDashboard(now, cars.length, overtakeCount);

    updateWeather();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ===================================================================================
// IV. UI CONTROLS & EVENT LISTENERS
// ===================================================================================
function initializeControls() {
    document.getElementById('inflowSlider').value = config.inflowRate;
    document.getElementById('inflowVal').innerText = config.inflowRate;
    document.getElementById('speedSlider').value = config.maxSpeed;
    document.getElementById('speedVal').innerText = config.maxSpeed;
    document.getElementById('numLanesSlider').value = config.numLanes;
    document.getElementById('numLanesVal').innerText = config.numLanes;
    document.getElementById('overtakeThresholdSlider').value = config.overtakeThreshold;
    document.getElementById('overtakeThresholdVal').innerText = config.overtakeThreshold;
    
    config.laneWidth = config.roadWidth / config.numLanes; // Recalculate on init
}

// user interfaceListeners
document.getElementById('inflowSlider').addEventListener('input', (e) => {
    config.inflowRate = Number(e.target.value);
    document.getElementById('inflowVal').innerText = e.target.value;
});
document.getElementById('speedSlider').addEventListener('input', (e) => {
    config.maxSpeed = Number(e.target.value);
    document.getElementById('speedVal').innerText = e.target.value;
});
document.getElementById('numLanesSlider').addEventListener('input', (e) => {
    config.numLanes = Number(e.target.value);
    config.laneWidth = config.roadWidth / config.numLanes; // Update lane width
    document.getElementById('numLanesVal').innerText = e.target.value;
    // Clear cars and restart for new lane count
    cars = [];
    vehicleCounter = 0;
    overtakeCount = 0;
});
document.getElementById('overtakeThresholdSlider').addEventListener('input', (e) => {
    config.overtakeThreshold = Number(e.target.value);
    document.getElementById('overtakeThresholdVal').innerText = e.target.value;
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
function updateAnalyticsDashboard(now, currentVehicles, currentOvertakes) {
    if (analyticsData.simulationStartTime === 0) {
        analyticsData.simulationStartTime = now;
    }
    const uptimeSeconds = Math.floor((now - analyticsData.simulationStartTime) / 1000);
    analyticsData.currentUptime = uptimeSeconds;

    document.getElementById('analyticSpawned').innerText = analyticsData.totalSpawned;
    document.getElementById('analyticExited').innerText = analyticsData.totalExited;
    document.getElementById('analyticUptime').innerText = `${uptimeSeconds}s`;
    document.getElementById('analyticCurrentVehicles').innerText = currentVehicles;
    document.getElementById('analyticOvertakes').innerText = currentOvertakes;

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
    cars = []; // Reset cars in multi-lane sim
    vehicleCounter = 0;
    overtakeCount = 0;
}

document.getElementById('analyticsBtn').addEventListener('click', openAnalyticsModal);

// Initialize controls on page load
initializeControls();