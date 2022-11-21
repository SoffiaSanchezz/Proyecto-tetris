// THIS IS FOR THE GAME
class Game {
    // Square length in pixels
    static SQUARE_LENGTH = screen.width > 390 ? 30 : 20;
    static COLUMNS = 40;
    static ROWS = 20;
    static CANVAS_WIDTH = this.SQUARE_LENGTH * this.COLUMNS;
    static CANVAS_HEIGHT = this.SQUARE_LENGTH * this.ROWS;
    static EMPTY_COLOR = "5A6DD2";
    static BORDER_COLOR = "5A6DD2";
    static DELETED_ROW_COLOR = "#FF0000";
    // When a piece collapses with something at its bottom, how many time wait for putting another piece? (in ms)
    static TIMEOUT_LOCK_PUT_NEXT_PIECE = 300;
    // Speed of falling piece (in ms)
    static PIECE_SPEED = 300;
    // Animation time when a row is being deleted
    static DELETE_ROW_ANIMATION = 500;
    // Score to add when a square dissapears (for each square)
    static PER_SQUARE_SCORE = 1;
    static COLORS = [
        "#AC92EB",
        "#4FC1E8",
        "#A0D568",
        "#FFCE54",
        "#ED5564",
    ];
}


//En esta clase se tienen funciones a usar a lo largo del juego como los son: color, sonido.
class Utils {
    static getRandomNumberInRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomColor() {
        return Game.COLORS[Utils.getRandomNumberInRange(0, Game.COLORS.length - 1)];
    }

    static loadSound(src, loop) {
        const sound = document.createElement("audio");
        sound.src = src;
        sound.setAttribute("preload", "auto");
        sound.setAttribute("controls", "none");
        sound.loop = loop || false;
        sound.style.display = "none";
        document.body.appendChild(sound);
        return sound;
    }
}

// Esta clase scontiene las coordenadas en X y Y del juego
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Un tetrominó es una forma geométrica compuesta de cuatro cuadrados iguales, conectados entre sí ortogonalmente, OSEA QUE CADA FIGURA USADA EN EL TETRIS ES UN TETROMINO

class Tetromino {
    constructor(rotations) {
        this.rotations = rotations;
        this.rotationIndex = 0;
        this.points = this.rotations[this.rotationIndex];
        const randomColor = Utils.getRandomColor();
        this.rotations.forEach(points => {
            points.forEach(point => {
                point.color = randomColor;
            });
        });
        this.incrementRotationIndex();
    }

    getPoints() {
        return this.points;
    }

    incrementRotationIndex() {
        if (this.rotations.length <= 0) {
            this.rotationIndex = 0;
        } else {
            if (this.rotationIndex + 1 >= this.rotations.length) {
                this.rotationIndex = 0;
            } else {
                this.rotationIndex++;
            }
        }
    }

    getNextRotation() {
        return this.rotations[this.rotationIndex];
    }

}

//Se crea una instacia donde se pasa el id del elemento de juego que seria "canvas", esto para hacer funcional el boton de reset
const game = new Game("canvas");
document.querySelector("#reset").addEventListener("click", () => {
    game.askUserConfirmResetGame();
});