// создаю канвас
const canvas = document.createElement("canvas");
canvas.classList.add('canvas');
const ctx = canvas.getContext("2d");
canvas.width = 576;
canvas.height = 576;
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

    changePosition() {
        const randomX = Math.floor(Math.random() * (canvas.width - 16) / 16) * 16;
        const randomY = Math.floor(Math.random() * (canvas.height - 16) / 16) * 16;

        this.x = 16 + randomX;
        this.y = 16 + randomY;
    }
}

// цикл обновления
function update(snake, apple) {
    let isAppleEaten = false;
    if (snake.head.x === apple.x && snake.head.y === apple.y) {
        isAppleEaten = true;
    }
    snake.moveSnake(1, isAppleEaten);
    if (isAppleEaten) {
        apple.changePosition();
    }
    
};

// отрисовка
function render(snake) {
    ctx.clearRect(1, 1, canvas.width - 1, canvas.height - 1);
    renderBorder();
    const segments = snake.segments;
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        renderSegment(segment, i === 0);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, 16, 16);
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

// игровой цикл
const main = function () {
	const now = Date.now();
	const delta = now - then;

    if (delta > 80) {
        update(snake, apple);
        render(snake);
        then = now;
    }

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// начальный запуск
const snake = new Snake();
const apple = new Apple({x: 64, y: 64}); 
let then = Date.now() - 200;
main();

addEventListener("keydown", function (e) {
    if (e.keyCode === 38) {
        snake.setDirection('up');
    } else if (e.keyCode === 40) {
        snake.setDirection('down');
    } else if (e.keyCode === 37) {
        snake.setDirection('left');
    } else if (e.keyCode === 39) {
        snake.setDirection('right');
    }
}, false);

// вспомогательные функции
