const isPieceSelectedClasses = (currentPiece, selectedPiece) => {
    let pieceClasses = ' ';
    if (currentPiece === selectedPiece) {
        pieceClasses += 'selected-piece ';
    }
    return pieceClasses;
};


const decideColor = piece => {
    if (piece.userTitle === 'user1') {
        return 'user1-piece';
    }
    return 'user2-piece';
};

export const pieceAsJSX = (square, currentPlayer, selectedPiece, selectPieceHandler) => {
    let pieceJSX;
    if (square && square.piece) { // if the square is defined and has a piece on it
        /* 
        These if statements decide on wheather to display a
        piece or not. If yes, when 1) would that piece be
        clickable, 2) would it be selected (defined as an extra css className)
        */
        const piece = square.piece;
        // if piece.userTitle is equals to the player who's playing next
        // in that point, we know that the current piece belongs to 
        // the active player. So we also want to get access to this 
        // piece's legal moves (if any).
        let pieceClasses = 'piece ';
        const colorClass = decideColor(piece);
        pieceClasses += colorClass;
        if (piece.userTitle === currentPlayer && piece.legalMoves.length) {
            const selectedClass = isPieceSelectedClasses(piece, selectedPiece);
            pieceClasses += ' selectable-piece ';
            pieceClasses += selectedClass;
            pieceJSX = <div className={pieceClasses} onClick={() => selectPieceHandler(piece)} > </div>;
        } else {
            pieceJSX = <div className={pieceClasses}> </div>;
        }
    }
    return pieceJSX;
}