import Square from './square-model';


/*
    This class is the 'back-end' grid which holds the logic
    of the 'front-end' Grid component (where game elements are being 
    rendered on the screen).
*/
class GridClass {
    constructor(columns, rows) {
        this.columns = columns;
        this.rows = rows;
        this.gridState = null;
        this.captures = {
            user1: { score: 0, userName: '' },
            user2: { score: 0, userName: '' }
        };
    }

    /*
        Assigns inputted users' name in the 
        captures object.
    */
    addUserNames(user1, user2) {
        this.captures = {
            user1: { score: 0, userName: user1 },
            user2: { score: 0, userName: user2 }
        };
    }

    /*
        Current game score calculator.
    */
    calculateScore() {
        let user1Score = 0;
        let user2Score = 0;
        for (const row of this.gridState) {
            for (const square of row) {
                if (square.piece) {
                    if (square.piece.userTitle === 'user1') {
                        user1Score += 1;
                    } else {
                        user2Score += 1;
                    }
                }
            }
        }
        this.captures['user1'].score = 12 - user1Score;
        this.captures['user2'].score = 12 - user2Score;
    }

    /*
        When it is a user's turn and they selected a piece
        and a valid move, then this function calculates
        the move type (e.g., basic/double/capture) and moves the piece
        to the target location.
    */
    movePiece(targetSquare, selectedPiece) {
        // swapping selected piece from its initial location with the target square location
        const targetSqColumn = targetSquare.location.column;
        const targetSqRow = targetSquare.location.row;
        const selectedPieceColumn = selectedPiece.location.column;
        const selectedPieceRow = selectedPiece.location.row;

        // Deciding if we did a capturing move
        const wasCapturingMove = Math.abs(targetSqColumn - selectedPieceColumn) === 2 && Math.abs(targetSqRow - selectedPieceRow) === 2;

        // Calculates whether or not there is a legal capture move.
        this.shouldCapturePiece(targetSquare, selectedPiece);

        this.gridState[targetSqRow][targetSqColumn].piece = { ...this.gridState[selectedPieceRow][selectedPieceColumn].piece };

        // altering selected (and now moved) piece location to the target square location
        this.gridState[targetSqRow][targetSqColumn].piece.location = targetSquare.location;

        // removing selected piece from initial location
        this.gridState[selectedPieceRow][selectedPieceColumn].piece = false;

        this.callPieceLegalMoves('basic');
        this.callPieceLegalMoves('capturing');

        // Passes back to the 'front-end' the information
        // of whether the move was a basic/double/capturing move. 
        if (wasCapturingMove && this.gridState[targetSqRow][targetSqColumn].piece.capturingLegalMoves.length) {
            return { moveType: 'capturing-double', targetSquare: this.gridState[targetSqRow][targetSqColumn] };
        }
        if (wasCapturingMove) {
            return { moveType: 'capturing', targetSquare: this.gridState[targetSqRow][targetSqColumn] };
        }
        return { moveType: 'basic', targetSquare: this.gridState[targetSqRow][targetSqColumn] }
    }

    movePieceMachine() {
        const selectableSquares = this._getAllSelectableSquares();
        const pickedSquare = this._selectSelectableSquare(selectableSquares);
        const selectedMove = this._selectLegalMoveRandomly(pickedSquare);
        const targetSqColumn = selectedMove.location.column;
        const targetSqRow = selectedMove.location.row;
        const targetSquare = this.gridState[targetSqRow][targetSqColumn];
        const typeOfMove = this.movePiece(targetSquare, pickedSquare.piece);
        if (typeOfMove.moveType == "capturing-double") {
            const pickedSquare2 = typeOfMove.targetSquare;
            const selectedMove2 = this._selectDoubleCapturingMove(pickedSquare2);
            const targetSqColumn2 = selectedMove2.location.column;
            const targetSqRow2 = selectedMove2.location.row;
            const targetSquare2 = this.gridState[targetSqRow2][targetSqColumn2];
            this.movePiece(targetSquare2, pickedSquare2.piece);
        }
        return typeOfMove;
    }

    // This function decides whether the player did a capturing move.
    shouldCapturePiece(targetSquare, selectedPiece) {
        const selectedPieceColumn = selectedPiece.location.column;
        const selectedPieceRow = selectedPiece.location.row;
        const tgLoc = targetSquare.location;
        const slcPieceLoc = selectedPiece.location;
        const wasCapturingMove = Math.abs(tgLoc.column - slcPieceLoc.column) === 2 && Math.abs(tgLoc.row - slcPieceLoc.row) === 2;
        if (wasCapturingMove) {
            const victor = selectedPiece.userTitle;
            this.captures[victor].score += 1;
            // if we did a capturing move, remove opponent
            // getting neighbours of target square
            const targSqNeighbours = targetSquare.getNeighbourSquares(this.gridState);
            const selectedPieceNeighbours = this.gridState[selectedPieceRow][selectedPieceColumn].getNeighbourSquares(this.gridState);
            const opponentSq = targSqNeighbours.filter(tgNeigh => selectedPieceNeighbours.includes(tgNeigh))[0];
            // remove that opponent
            this.gridState[opponentSq.location.row][opponentSq.location.column].piece = false;
        }
    }
    /*
        After the grid is being passed around from client to server via socket.io,
        this function ensures that the grid has its correct form/state.
    */
    createState(grid) {
        const gridState = this.rows.map(row => {
            return this.columns.map(column => {
                // decide if that square (i.e., combination column, row) has a piece
                if (grid[row][column].piece) {
                    return new Square({ row, column }, true, grid[row][column].piece.userTitle);
                } else {
                    return new Square({ row, column }, false);
                }
            });
        });
        this.gridState = gridState;
        // after we have initialised the grid, we set the legal moves
        // for each and every piece.
        this.callPieceLegalMoves('basic');
        this.callPieceLegalMoves('capturing');
    }

    /* 
        This function initialises the state of the grid. The initial state
        is when all the pieces are on their appropriate squares.
    */
    initialiseState() {
        const grid = this.rows.map(row => {
            return this.columns.map(column => {
                // decide if that square (i.e., combination column, row) has a piece
                if (this._hasPieceInitialState({ row, column })) {
                    return new Square({ row, column }, true);
                } else {
                    return new Square({ row, column }, false);
                }
            });
        });
        this.gridState = grid;
        this.captures.user1.score = 0;
        this.captures.user2.score = 0;
        // after we have initialised the grid, we set the legal moves
        // for each and every piece.
        this.callPieceLegalMoves('basic');
        this.callPieceLegalMoves('capturing');
    }

    /* 
        Helper function to help us put the pieces on the correct square.
        There are two different patterns with regards to how the pieces display on the screen.
        These following if statements are responsible for these patterns.
    */
    _hasPieceInitialState(location) {
        if ((location.column % 2 !== 0) && (location.row % 2 === 0) && (location.row < 3 || location.row > 4)) {
            return true;
        }
        if ((location.column % 2 === 0) && (location.row % 2 !== 0) && (location.row < 3 || location.row > 4)) {
            return true;
        }
        return false;
    }

    /* 
        This function has just two for loops
        which sole purpose is to extract out
        one square at a time (iteration).
        Then, if the square has a piece on it,
        we invoking the setPieceLaglMoves function
        which sets the piece's legal moves.
    */

    _getAllSelectableSquares() {
        const selectableSquares = [];
        for (const row of this.gridState) {
            for (const square of row) {
                if (square.piece && square.piece.userTitle == "user2" && square.piece.legalMoves.length) {
                    selectableSquares.push(square);
                }
            }
        }
        return selectableSquares;
    }

    _selectSelectableSquare(selectableSquares) {
        const pieceIdx = Math.floor(Math.random() * selectableSquares.length);
        return selectableSquares[pieceIdx];
    }

    _selectLegalMoveRandomly(square) {
        const moveIdx = Math.floor(Math.random() * square.piece.legalMoves.length);
        return square.piece.legalMoves[moveIdx];
    }

    _selectDoubleCapturingMove(square) {
        const moveIdx = Math.floor(Math.random() * square.piece.capturingLegalMoves.length);
        return square.piece.capturingLegalMoves[moveIdx];
    }

    callPieceLegalMoves(typeOfMove) {
        for (const row of this.gridState) {
            for (const square of row) {
                if (square.piece) {
                    if (typeOfMove === 'basic') {
                        square.setPieceBasicLegalMoves(this.gridState);
                    } else {
                        square.setPieceCapturingLegalMoves(this.gridState);
                        square.mergeLegalMoves();
                    }
                }
            }
        }
    }
};



export default GridClass;