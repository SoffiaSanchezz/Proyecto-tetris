

// Esto es para el juego!!!

class Game {
    // Longitud de los cuadrados en pixels
    static SQUARE_LENGTH = screen.width > 420 ? 40 : 20;
    // aqui se definen el numero de columnas dentro del juego
    static COLUMNS = 10;
    // aqui se definen el numero de filas dentro del juego
    static ROWS = 15;

    //AQUI SE DEFINEN LAS DIMENSIONES DEL CANVAS, ANCHO Y ALTO
    static CANVAS_WIDTH = this.SQUARE_LENGTH * this.COLUMNS;
    static CANVAS_HEIGHT = this.SQUARE_LENGTH * this.ROWS;

    //Aquí se define el color del cuadro y borde del mismo dentro en el juego
    static EMPTY_COLOR = "#622edf";
    static BORDER_COLOR = "#622edf";

    //Cuando se elimina una fila por que esta ya se completo, esta estará de color ROJO!!!
    static DELETED_ROW_COLOR = "#FF0000";

    //El TIMEOUT_LOCK_PUT_NEXT_PIECE aquí se define el tiempo que el usuario tendra para mover la pieza antes de que salga la siguiente (Esto esta en milisegundos(ms))
    static TIMEOUT_LOCK_PUT_NEXT_PIECE = 300;

    //Esto es para definir la velocidad con la que se mueve el tetromino, generalmente dejar este valor igual al de el TIMEOUT_LOCK_PUT_NEXT_PIECE.(Esto esta en milisegundos(ms))
    static PIECE_SPEED = 300;

    // AQUI SE DEFINE EL TIEMPO QUE LA FILA COMPLETADA Y QUE VA A SER ELIMINADA ESTA DE COLOR ROJO (#FF0000).(Esto esta en milisegundos(ms))
    static DELETE_ROW_ANIMATION = 500;

    // Aquí se define el puntaje, cuando se eliminen lo cuadraditos, cada uno de ellos tendra un valor de 1
    static PER_SQUARE_SCORE = 1;

    //Aquí estan contemplado los colores con los que aleatoreamente sandran los tetrominos.
    static COLORS = [
        "#AC92EB",
        "#4FC1E8",
        "#A0D568",
        "#FFCE54",
        "#ED5564",
    ];

    constructor(canvasId) {
        this.canvasId = canvasId;
        this.timeoutFlag = false;
        this.board = [];
        this.existingPieces = [];
        // el X y Y global sirven para saber en donde colocar los tetrominos en el tablero.
        this.globalX = 0;
        this.globalY = 0;
        this.paused = true;
        this.currentFigure = null;
        this.sounds = {};
        this.canPlay = false;
        this.intervalId = null;
        this.init();
    }

    init() {
        this.showWelcome();
        this.initDomElements();
        this.initSounds();
        this.resetGame();
        this.draw();
        this.initControls();
    }

    resetGame() {
        this.score = 0;
        this.sounds.success.currentTime = 0;
        this.sounds.success.pause();
        this.sounds.background.currentTime = 0;
        this.sounds.background.pause();
        this.initBoardAndExistingPieces();
        this.chooseRandomFigure();
        this.restartGlobalXAndY();
        this.syncExistingPiecesWithBoard();
        this.refreshScore();
        this.pauseGame();
    }
    showWelcome() {
        Swal.fire("Bienvenido", `Port casi perfecto del juego de Tetris en JavaScript.
<br>
<strong>Controles:</strong>
<ul class="list-group" style="border:2px solid #622edf">

<li class="list-group-item" style="background-color: #ad92eb83; border= 5px rgba(238, 174, 202, 0.405)"> <kbd style="background-color:#622edf"><b>P<b/></kbd><br>Pausar o reanudar </li>

<li class="list-group-item" style="background-color: #ad92eb83;">
<kbd style="background-color:#622edf">R</kbd><br>Rotar</li>

<kbd style="background-color:#622edf">Flechas de dirección</kbd><br>Mover figura hacia esa dirección</li>
<li class="list-group-item" style="color:#8553f1"><strong>También puedes usar los botones si estás en móvil</strong></li>
</ul>
<br>
<strong style="color:#8553f1">Creado por <a href="https://github.com/SoffiaSanchezz"></a>
<img src="./img/Logos_SS con no.png" alt="Logos_SS" style="width:20%">
</strong>

<strong> y<a href="https://github.com/SoffiaSanchezz"></a>
<img src="./img/LOGO (8).png" alt="logo" style="width:40%">
</strong>
<br>
`);
    }



    initControls() {
        document.addEventListener("keydown", (e) => {
            const { code } = e;
            if (!this.canPlay && code !== "KeyP") {
                return;
            }
            switch (code) {
                case "ArrowRight":
                    this.attemptMoveRight();
                    break;
                case "ArrowLeft":
                    this.attemptMoveLeft();
                    break;
                case "ArrowDown":
                    this.attemptMoveDown();
                    break;
                case "KeyR":
                    this.attemptRotate();
                    break;
                case "KeyP":
                    this.pauseOrResumeGame();
                    break;
            }
            this.syncExistingPiecesWithBoard();
        });

        this.$btnDown.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveDown();
        });
        this.$btnRight.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveRight();
        });
        this.$btnLeft.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptMoveLeft();
        });
        this.$btnRotate.addEventListener("click", () => {
            if (!this.canPlay) return;
            this.attemptRotate();
        });
        [this.$btnPause, this.$btnResume].forEach($btn => $btn.addEventListener("click", () => {
            this.pauseOrResumeGame();
        }));
    }

    attemptMoveRight() {
        if (this.figureCanMoveRight()) {
            this.globalX++;
        }
    }

    attemptMoveLeft() {
        if (this.figureCanMoveLeft()) {
            this.globalX--;
        }
    }

    attemptMoveDown() {
        if (this.figureCanMoveDown()) {
            this.globalY++;
        }
    }

    attemptRotate() {
        this.rotateFigure();
    }

    pauseOrResumeGame() {
        if (this.paused) {
            this.resumeGame();
            this.$btnResume.hidden = true;
            this.$btnPause.hidden = false;
        } else {
            this.pauseGame();
            this.$btnResume.hidden = false;
            this.$btnPause.hidden = true;
        }
    }

    pauseGame() {
        this.sounds.background.pause();
        this.paused = true;
        this.canPlay = false;
        clearInterval(this.intervalId);
    }

    resumeGame() {
        this.sounds.background.play();
        this.refreshScore();
        this.paused = false;
        this.canPlay = true;
        this.intervalId = setInterval(this.mainLoop.bind(this), Game.PIECE_SPEED);
    }

//Esto hace cuando los tetrominos lleguen a la superficie hagan parte de esta y no se puedan mover mas.
    moveFigurePointsToExistingPieces() {
        this.canPlay = false;
        for (const point of this.currentFigure.getPoints()) {
            point.x += this.globalX;
            point.y += this.globalY;
            this.existingPieces[point.y][point.x] = {
                taken: true,
                color: point.color,
            }
        }
        this.restartGlobalXAndY();
        this.canPlay = true;
    }

    //Esta función permite determina cual el jugador pierde, entonces por defecto se deja que cuando de arriba hacia abajo falte un cuadradito, el jugador ha perdido.
    playerLoses() {

        for (const point of this.existingPieces[1]) {
            if (point.taken) {
                return true;
            }
        }
        return false;
    }

    // Esto, ayuda a que en el momente que se complete la fila, se elimine la misma y se tomen los puntos
    getPointsToDelete = () => {
        const points = [];
        let y = 0;
        for (const row of this.existingPieces) {
            const isRowFull = row.every(point => point.taken);
            if (isRowFull) {
                points.push(y);
            }
            y++;
        }
        return points;
    }

    changeDeletedRowColor(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.DELETED_ROW_COLOR;
            }
        }
    };

    //Esta función agrega el puntos obtenidos por la/las filas eliminadas
    addScore(rows) {
        this.score += Game.PER_SQUARE_SCORE * Game.COLUMNS * rows.length;
        this.refreshScore();
    }


    removeRowsFromExistingPieces(yCoordinates) {
        for (let y of yCoordinates) {
            for (const point of this.existingPieces[y]) {
                point.color = Game.EMPTY_COLOR;
                point.taken = false;
            }
        }
    }


    verifyAndDeleteFullRows() {
        // Here be dragons
        const yCoordinates = this.getPointsToDelete();
        if (yCoordinates.length <= 0) return;
        this.addScore(yCoordinates);
        this.sounds.success.currentTime = 0;
        this.sounds.success.play();
        this.changeDeletedRowColor(yCoordinates);
        this.canPlay = false;
        setTimeout(() => {
            this.sounds.success.pause();
            this.removeRowsFromExistingPieces(yCoordinates);
            this.syncExistingPiecesWithBoard();
            const invertedCoordinates = Array.from(yCoordinates);
            // Now the coordinates are in descending order
            invertedCoordinates.reverse();

            for (let yCoordinate of invertedCoordinates) {
                for (let y = Game.ROWS - 1; y >= 0; y--) {
                    for (let x = 0; x < this.existingPieces[y].length; x++) {
                        if (y < yCoordinate) {
                            let counter = 0;
                            let auxiliarY = y;
                            while (this.isEmptyPoint(x, auxiliarY + 1) && !this.absolutePointOutOfLimits(x, auxiliarY + 1) && counter < yCoordinates.length) {
                                this.existingPieces[auxiliarY + 1][x] = this.existingPieces[auxiliarY][x];
                                this.existingPieces[auxiliarY][x] = {
                                    color: Game.EMPTY_COLOR,
                                    taken: false,
                                }

                                this.syncExistingPiecesWithBoard();
                                counter++;
                                auxiliarY++;
                            }
                        }
                    }
                }
            }

            this.syncExistingPiecesWithBoard()
            this.canPlay = true;
        }, Game.DELETE_ROW_ANIMATION);
    }

    mainLoop() {
        if (!this.canPlay) {
            return;
        }
        // If figure can move down, move down
        if (this.figureCanMoveDown()) {
            this.globalY++;
        } else {
            // If figure cannot, then we start a timeout because
            // player can move figure to keep it going down
            // for example when the figure collapses with another points but there's remaining
            // space at the left or right and the player moves there so the figure can keep going down
            if (this.timeoutFlag) return;
            this.timeoutFlag = true;
            setTimeout(() => {
                this.timeoutFlag = false;
                // If the time expires, we re-check if figure cannot keep going down. If it can
                // (because player moved it) then we return and keep the loop
                if (this.figureCanMoveDown()) {
                    return;
                }
                // At this point, we know that the figure collapsed either with the floor
                // or with another point. So we move all the figure to the existing pieces array
                this.sounds.tap.currentTime = 0;
                this.sounds.tap.play();
                this.moveFigurePointsToExistingPieces();
                if (this.playerLoses()) {
                    Swal.fire("Juego terminado", "Inténtalo de nuevo");
                    this.sounds.background.pause();
                    this.canPlay = false;
                    this.resetGame();
                    return;
                }
                this.verifyAndDeleteFullRows();
                this.chooseRandomFigure();
                this.syncExistingPiecesWithBoard();
            }, Game.TIMEOUT_LOCK_PUT_NEXT_PIECE);
        }
        this.syncExistingPiecesWithBoard();
    }


    cleanGameBoardAndOverlapExistingPieces() {
        for (let y = 0; y < Game.ROWS; y++) {
            for (let x = 0; x < Game.COLUMNS; x++) {
                this.board[y][x] = {
                    color: Game.EMPTY_COLOR,
                    taken: false,
                };
                // Overlap existing piece if any
                if (this.existingPieces[y][x].taken) {
                    this.board[y][x].color = this.existingPieces[y][x].color;
                }
            }
        }
    }

    overlapCurrentFigureOnGameBoard() {
        if (!this.currentFigure) return;
        for (const point of this.currentFigure.getPoints()) {
            this.board[point.y + this.globalY][point.x + this.globalX].color = point.color;
        }
    }


    syncExistingPiecesWithBoard() {
        this.cleanGameBoardAndOverlapExistingPieces();
        this.overlapCurrentFigureOnGameBoard();
    }


    // ESTA PARTE FUNCIONA, PARA DIBUJAR EL TETROMINO EN CASO QUE SE QUIERA DIBUJAR DE OTRA FORMA, MODIFICAR ESTA PARTE
    draw() {
        let x = 0, y = 0;
        for (const row of this.board) {
            x = 0;
            for (const point of row) {
                this.canvasContext.fillStyle = point.color;
                this.canvasContext.fillRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
                this.canvasContext.restore();
                this.canvasContext.strokeStyle = Game.BORDER_COLOR;
                this.canvasContext.strokeRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
                x += Game.SQUARE_LENGTH;
            }
            y += Game.SQUARE_LENGTH;
        }
        setTimeout(() => {
            requestAnimationFrame(this.draw.bind(this));
        }, 17);
    }

    refreshScore() {
        this.$score.textContent = `Score: ${this.score}`;
    }

    initSounds() {
        this.sounds.background = Utils.loadSound("assets/New Donk City_ Daytime 8 Bit.mp3", true);
        this.sounds.success = Utils.loadSound("assets/success.wav");
        this.sounds.denied = Utils.loadSound("assets/denied.wav");
        this.sounds.tap = Utils.loadSound("assets/tap.wav");
    }

    initDomElements() {
        this.$canvas = document.querySelector("#" + this.canvasId);
        this.$score = document.querySelector("#puntaje");
        this.$btnPause = document.querySelector("#btnPausar");
        this.$btnResume = document.querySelector("#btnIniciar");
        this.$btnRotate = document.querySelector("#btnRotar");
        this.$btnDown = document.querySelector("#btnAbajo");
        this.$btnRight = document.querySelector("#btnDerecha");
        this.$btnLeft = document.querySelector("#btnIzquierda");
        this.$canvas.setAttribute("width", Game.CANVAS_WIDTH + "px");
        this.$canvas.setAttribute("height", Game.CANVAS_HEIGHT + "px");
        this.canvasContext = this.$canvas.getContext("2d");
    }

    chooseRandomFigure() {
        this.currentFigure = this.getRandomFigure();
    }

    restartGlobalXAndY() {
        this.globalX = Math.floor(Game.COLUMNS / 2) - 1;
        this.globalY = 0;
    }


    getRandomFigure() {
        /*
        * Nombres de los tetrominós tomados de: https://www.joe.co.uk/gaming/tetris-block-names-221127
        * Regresamos una nueva instancia en cada ocasión, pues si definiéramos las figuras en constantes o variables, se tomaría la misma
        * referencia en algunas ocasiones
        * */
        switch (Utils.getRandomNumberInRange(1, 7)) {
            case 1:
                /*
                El cuadrado (smashboy)
                **
                **
                */
                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(1, 1)]
                ]);
            case 2:

                /*
                La línea (hero)
                ****
                */
                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3)],
                ]);
            case 3:

                /*
                La L (orange ricky)
                  *
                ***
                */

                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(2, 1), new Point(2, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2)],
                    [new Point(0, 0), new Point(0, 1), new Point(1, 0), new Point(2, 0)],
                    [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(1, 2)],
                ]);
            case 4:

                /*
                La J (blue ricky)
                *
                ***
                */

                return new Tetromino([
                    [new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(2, 1)],
                    [new Point(0, 0), new Point(1, 0), new Point(0, 1), new Point(0, 2)],
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(2, 1)],
                    [new Point(0, 2), new Point(1, 2), new Point(1, 1), new Point(1, 0)],
                ]);
            case 5:
                /*
            La Z (Cleveland Z)
               **
                **
               */

                return new Tetromino([
                    [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(2, 1)],
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(0, 2)],
                ]);
            case 6:

                /*
            La otra Z (Rhode island Z)
                **
               **
               */
                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(2, 0)],
                    [new Point(0, 0), new Point(0, 1), new Point(1, 1), new Point(1, 2)],
                ]);
            case 7:
            default:

                /*
            La T (Teewee)
                *
               ***
               */
                return new Tetromino([
                    [new Point(0, 1), new Point(1, 1), new Point(1, 0), new Point(2, 1)],
                    [new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 1)],
                    [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(1, 1)],
                    [new Point(0, 1), new Point(1, 0), new Point(1, 1), new Point(1, 2)],
                ]);
        }
    }

    initBoardAndExistingPieces() {
        this.board = [];
        this.existingPieces = [];
        for (let y = 0; y < Game.ROWS; y++) {
            this.board.push([]);
            this.existingPieces.push([]);
            for (let x = 0; x < Game.COLUMNS; x++) {
                this.board[y].push({
                    color: Game.EMPTY_COLOR,
                    taken: false,
                });
                this.existingPieces[y].push({
                    taken: false,
                    color: Game.EMPTY_COLOR,
                });
            }
        }
    }

    /**
     *
     * @param point An object that has x and y properties; the coordinates shouldn't be global, but relative to the point
     * @returns {boolean}
     */
    relativePointOutOfLimits(point) {
        const absoluteX = point.x + this.globalX;
        const absoluteY = point.y + this.globalY;
        return this.absolutePointOutOfLimits(absoluteX, absoluteY);
    }

    /**
     * @param absoluteX
     * @param absoluteY
     * @returns {boolean}
     */
    absolutePointOutOfLimits(absoluteX, absoluteY) {
        return absoluteX < 0 || absoluteX > Game.COLUMNS - 1 || absoluteY < 0 || absoluteY > Game.ROWS - 1;
    }

    // It returns true even if the point is not valid (for example if it is out of limit, because it is not the function's responsibility)
    isEmptyPoint(x, y) {
        if (!this.existingPieces[y]) return true;
        if (!this.existingPieces[y][x]) return true;
        if (this.existingPieces[y][x].taken) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Check if a point (in the game board) is valid to put another point there.
     * @param point the point to check, with relative coordinates
     * @param points an array of points that conforms a figure
     */
    isValidPoint(point, points) {
        const emptyPoint = this.isEmptyPoint(this.globalX + point.x, this.globalY + point.y);
        const hasSameCoordinateOfFigurePoint = points.findIndex(p => {
            return p.x === point.x && p.y === point.y;
        }) !== -1;
        const outOfLimits = this.relativePointOutOfLimits(point);
        if ((emptyPoint || hasSameCoordinateOfFigurePoint) && !outOfLimits) {
            return true;
        } else {
            return false;
        }
    }

    figureCanMoveRight() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x + 1, point.y);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanMoveLeft() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x - 1, point.y);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanMoveDown() {
        if (!this.currentFigure) return false;
        for (const point of this.currentFigure.getPoints()) {
            const newPoint = new Point(point.x, point.y + 1);
            if (!this.isValidPoint(newPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }

    figureCanRotate() {
        const newPointsAfterRotate = this.currentFigure.getNextRotation();
        for (const rotatedPoint of newPointsAfterRotate) {
            if (!this.isValidPoint(rotatedPoint, this.currentFigure.getPoints())) {
                return false;
            }
        }
        return true;
    }


    rotateFigure() {
        if (!this.figureCanRotate()) {
            this.sounds.denied.currentTime = 0;
            this.sounds.denied.play();
            return;
        }
        this.currentFigure.points = this.currentFigure.getNextRotation();
        this.currentFigure.incrementRotationIndex();
    }

    async askUserConfirmResetGame() {
        this.pauseGame();
        const result = await Swal.fire({
            title: 'Reiniciar',
            text: "¿Quieres reiniciar el juego?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#fdbf9c',
            cancelButtonColor: '#4A42F3',
            cancelButtonText: 'No',
            confirmButtonText: 'Sí'
        });
        if (result.value) {
            this.resetGame();
        } else {
            this.resumeGame();
        }
    }

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
