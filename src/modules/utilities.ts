// TYPES:
enum gender {
    male = 'Male',
    female = 'female'
}

const createElem = (tagName: string, ...classNames: string[]): HTMLElement => {
    const elem = document.createElement(tagName);
    elem.className = classNames.join(' ');
    return elem;
}

export class Glob {
    public objects: Creature[];
    public container: HTMLElement;

    constructor(container: HTMLElement | null) {
        this.objects = [];
        if (!(container instanceof HTMLElement)) {
            throw new Error("World is not found");
        }
        this.container = container;
    }

    public addObject(object: Creature) {
        this.objects.push(object);
    }

    run() {
        setInterval(() => {
            this.objects.forEach((obj) => obj.move());
            this.checkCollisions(); // Check for collisions after each move
        }, 10); // Update every 10ms
    }

    checkCollisions() {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const obj1 = this.objects[i];
                const obj2 = this.objects[j];

                const dx = obj1.x + obj1.size / 2 - (obj2.x + obj2.size / 2);
                const dy = obj1.y + obj1.size / 2 - (obj2.y + obj2.size / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check if the distance is less than the sum of their radii
                if (distance < (obj1.size + obj2.size) / 2) {
                    console.log(`Collision detected between object ${i} and object ${j}`);
                    this.handleCollision(obj1, obj2);
                }
            }
        }
    }

    handleCollision(obj1: Creature, obj2: Creature) {
        // Vector between centers
        const dx = obj2.x + obj2.size / 2 - (obj1.x + obj1.size / 2);
        const dy = obj2.y + obj2.size / 2 - (obj1.y + obj1.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance === 0) return; // Prevent division by zero
    
        // Normal and tangent vectors
        const nx = dx / distance;
        const ny = dy / distance;
    
        const tx = -ny;
        const ty = nx;
    
        // Dot product of velocities with normal and tangent vectors
        const v1n = obj1.speed * Math.cos(obj1.angle * Math.PI / 180) * nx +
                    obj1.speed * Math.sin(obj1.angle * Math.PI / 180) * ny;
        const v1t = obj1.speed * Math.cos(obj1.angle * Math.PI / 180) * tx +
                    obj1.speed * Math.sin(obj1.angle * Math.PI / 180) * ty;
    
        const v2n = obj2.speed * Math.cos(obj2.angle * Math.PI / 180) * nx +
                    obj2.speed * Math.sin(obj2.angle * Math.PI / 180) * ny;
        const v2t = obj2.speed * Math.cos(obj2.angle * Math.PI / 180) * tx +
                    obj2.speed * Math.sin(obj2.angle * Math.PI / 180) * ty;
    
        // Swap normal velocities (elastic collision)
        const newV1n = v2n;
        const newV2n = v1n;
    
        // Tangential velocities remain unchanged
        const newV1t = v1t;
        const newV2t = v2t;
    
        // Recalculate velocities
        const newVx1 = newV1n * nx + newV1t * tx;
        const newVy1 = newV1n * ny + newV1t * ty;
    
        const newVx2 = newV2n * nx + newV2t * tx;
        const newVy2 = newV2n * ny + newV2t * ty;
    
        obj1.speed = Math.sqrt(newVx1 ** 2 + newVy1 ** 2);
        obj1.angle = Math.atan2(newVy1, newVx1) * (180 / Math.PI);
    
        obj2.speed = Math.sqrt(newVx2 ** 2 + newVy2 ** 2);
        obj2.angle = Math.atan2(newVy2, newVx2) * (180 / Math.PI);
    
        // Resolve overlap
        const overlap = (obj1.size + obj2.size) / 2 - distance;
        obj1.x -= (overlap / 2) * nx;
        obj1.y -= (overlap / 2) * ny;
    
        obj2.x += (overlap / 2) * nx;
        obj2.y += (overlap / 2) * ny;
    
        // Ensure positions stay within boundaries
        obj1.checkWorldBoundaries(obj1.x, obj1.y);
        obj2.checkWorldBoundaries(obj2.x, obj2.y);
    
        // Update positions visually
        obj1.updatePos(obj1.x, obj1.y);
        obj2.updatePos(obj2.x, obj2.y);
    }
    
    
}

export class Creature {
    public elem: HTMLElement;
    public glob: Glob;
    public x: number = 15;
    public y: number = 15;
    public color: string = 'red';
    public type: gender;
    public size: number = 15;
    public speed: number = 4;
    public angle: number = 15;

    constructor(glob: Glob) {
        this.elem = createElem('div', 'creature');
        this.elem.style.position = 'absolute';
        this.elem.style.backgroundColor = this.color;
        this.elem.style.height = this.size + 'px';
        this.elem.style.width = this.size + 'px';
        this.elem.style.borderRadius = '100%';
        this.glob = glob;
        this.elem.style.left = this.x + 'px';
        this.elem.style.bottom = this.y + 'px';
        this.type = gender.male; // To-do: Randomize or conditional
        this.glob.container.appendChild(this.elem);
    }

    checkWorldBoundaries(posX: number, posY: number) {
        let height = this.glob.container.offsetHeight;
        let width = this.glob.container.offsetWidth;
        if (posY + this.size >= height) {
            this.angle = 360 - this.angle;
        }
        if (posX + this.size >= width) {
            this.angle = 180 - this.angle;
        }
        if (posY <= 0) {
            this.angle = 360 - this.angle;
        }
        if (posX <= 0) {
            this.angle = 180 - this.angle;
        }
    }

    updatePos(newX: number, newY: number) {
        this.x = newX;
        this.y = newY;
        this.elem.style.left = this.x + 'px';
        this.elem.style.bottom = this.y + 'px';
    }

    move() {
        const radians = (this.angle * Math.PI) / 180;
        const xIncrement = this.speed * Math.cos(radians);
        const yIncrement = this.speed * Math.sin(radians);
        const newX = this.x + xIncrement;
        const newY = this.y + yIncrement;
        this.checkWorldBoundaries(newX, newY);
        this.updatePos(newX, newY);
    }
}
