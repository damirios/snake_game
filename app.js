// создаю канвас ===================================================================
const canvas = document.createElement("canvas");
canvas.classList.add('canvas');
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;
document.body.appendChild(canvas);

class Segment {
    x;
    y;
    head;

    constructor({x, y}, head = null) {
        this.x = x;
        this.y = y;
        this.head = head;
    }
}

class Snake {
    head;
    tail;
    segments;
    direction;
    speed;
    
    constructor() {
        this.head = new Segment({x: 16, y: 0});
        const body = new Segment({x: 16, y: 0}, this.head);
        this.tail = new Segment({x: 0, y: 0}, body);
        this.segments = [this.head, body, this.tail];
        this.direction = 'right';
        this.speed = 16;
    }

    removeLastSegment() {
        this.segments.pop();
    }

    createNewHead(newHead) {
        this.head.head = newHead;
        this.head = newHead;
        this.segments.unshift(newHead);
    }

    setDirection(direction) {
        this.direction = direction;
    }

    moveSnake(modifier, isAppleEaten = false) {
        const moveDistance = Math.floor(this.speed * modifier);
        let newHead;
        if (this.direction === 'up') { 
            newHead = new Segment({x: this.head.x % canvas.width, y: (canvas.height + this.head.y - moveDistance) % canvas.height});
        } else if (this.direction === 'down') {
            newHead = new Segment({x: this.head.x % canvas.width, y: (this.head.y + moveDistance) % canvas.height});
        } else if (this.direction === 'right') {
            newHead = new Segment({x: (this.head.x + moveDistance) % canvas.width, y: this.head.y % canvas.height});
        } else if (this.direction === 'left') {
            newHead = new Segment({x: (canvas.width + this.head.x - moveDistance) % canvas.width, y: this.head.y % canvas.height});
        }

        this.createNewHead(newHead);
        if (!isAppleEaten) {
            this.removeLastSegment();
        }
    }
}

class Apple {
    x;
    y;

    constructor({x, y}) {
        this.x = x;
        this.y = y;
    }

    changePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}

function ObstacleCreator({direction, length, x, y}) {
    return {
        x, y, direction, length
    }
}

// цикл обновления ==================================================================
function update(snake, apple) {
    let isAppleEaten = false;
    if (snake.head.x === apple.x && snake.head.y === apple.y) {
        isAppleEaten = true;
    }
    snake.moveSnake(1, isAppleEaten);
    
    if (isAppleEaten) {
        setAppleIntoNewPosition(apple);
    }
};

// отрисовка ========================================================================
function render(snake) {
    ctx.clearRect(1, 1, canvas.width - 1, canvas.height - 1);
    renderBorder();
    renderObstacles(obstacles);
    const segments = snake.segments;
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        renderSegment(segment, i === 0);
    }

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(apple.x + 8, apple.y + 8, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(apple.x + 14, apple.y + 2, 4, 0, 1.2 * Math.PI);
    ctx.fill();
};

function renderBorder() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, 1);
    ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height);
    ctx.fillRect(canvas.width - 1, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, 1, canvas.height);
}

function renderSegment(segment, eyes) {
    ctx.fillStyle = "green";
    ctx.fillRect(segment.x + 1, segment.y + 1, 15, 15);
    ctx.fillStyle = "blue";
    ctx.fillRect(segment.x, segment.y, 16, 1);
    ctx.fillRect(segment.x, segment.y + 16, 16, 1);
    ctx.fillRect(segment.x, segment.y, 1, 16);
    ctx.fillRect(segment.x + 16, segment.y, 1, 16);

    if (eyes) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(segment.x + 8, segment.y + 8, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function renderObstacles(obstacles) {
    for (let obstacle of obstacles) {
        const width = obstacle.direction === 'horizontal' ? obstacle.length * 16 : 16;
        const height = obstacle.direction === 'vertical' ? obstacle.length * 16 : 16;
        ctx.fillStyle = "grey";
        ctx.fillRect(obstacle.x, obstacle.y, width, height);
        ctx.fillStyle = "black";
        ctx.fillRect(obstacle.x, obstacle.y, 1, height);
        ctx.fillRect(obstacle.x + width, obstacle.y, 1, height);
        ctx.fillRect(obstacle.x, obstacle.y, width, 1);
        ctx.fillRect(obstacle.x, obstacle.y + height, width, 1);
    }
}

// игровой цикл =====================================================================
const main = function () {
	const now = Date.now();
	const delta = now - then;

    if (delta > 120) {
        update(snake, apple);
        render(snake);
        then = now;
    }

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// начальный запуск =================================================================
const snake = new Snake();
const apple = new Apple({x: 64, y: 64});
const obstacles = createObstacles();
let then = Date.now() - 200;
main();

addEventListener("keydown", function (e) {
    changeSnakeDirection(e.keyCode);
}, false);

// вспомогательные функции ==========================================================
function changeSnakeDirection(keyCode) {
    if (keyCode === 38 && snake.direction !== 'down') {
        snake.setDirection('up');
    } else if (keyCode === 40 && snake.direction !== 'up') {
        snake.setDirection('down');
    } else if (keyCode === 37 && snake.direction !== 'right') {
        snake.setDirection('left');
    } else if (keyCode === 39 && snake.direction !== 'left') {
        snake.setDirection('right');
    }
}

function createObstacles() {
    const N = 7;
    const minLen = 3;
    const maxLen = 20;
    const obstacles = [];
    for (let i = 0; i < N; i++) {
        const len = minLen + Math.floor(Math.random() * (maxLen - minLen));
        const direction = Math.random() > 0.5 ? 'vertical' : 'horizontal';
        const x = Math.floor( (Math.random() * (canvas.width - (direction === 'horizontal' ? len : 0))) / 16 ) * 16;
        const y = Math.floor( (Math.random() * (canvas.height - (direction === 'vertical' ? len : 0))) / 16 ) * 16;
        obstacles.push(ObstacleCreator({direction, length: len, x, y}));
    }

    return obstacles;
}

function getNewPosition() {
    return {
        randomX: 16 + Math.floor(Math.random() * (canvas.width - 16) / 16) * 16,
        randomY: 16 + Math.floor(Math.random() * (canvas.height - 16) / 16) * 16
    }
}

function isInObstacle(x, y, obstacles) {
    for (let obstacle of obstacles) {
        if ( (obstacle.direction === 'horizontal' && obstacle.y === y && x >= obstacle.x && x <= obstacle.x + obstacle.length * 16) ||
        (obstacle.direction === 'vertical' && obstacle.x === x && y >= obstacle.y && y <= obstacle.y + obstacle.length * 16) ) {
            return true;
        }
    }

    return false;
}

function isInSnake(x, y) {
    for (let segment of snake.segments) {
        if ( segment.y === y && segment.x === x ) {
            console.log('in snake!');
            return true;
        }
    }

    return false;
} 

function setAppleIntoNewPosition(apple) {
    const {randomX, randomY} = getNewPosition();
    if (isInObstacle(randomX, randomY, obstacles) || isInSnake(randomX, randomY)) {
        setAppleIntoNewPosition(apple);
    } else {
        apple.changePosition(randomX, randomY);
    }
}