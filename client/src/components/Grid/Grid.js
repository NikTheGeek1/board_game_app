import './Grid.css';
import { squareColor } from '../../utils/squareColor';
import { rows, columns, squareStyle, rowStyle, gridStyle } from '../../gridSpecs/grid-specs';
import GridClass from '../../models/grid-model';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import BoardSoundPiece from '../../sounds/selectpiece.mp3';
import BoardSoundMove from '../../sounds/move.mp3';
import BoardSoundWin from '../../sounds/GameWin.mp3';
import BoardSoundCapture from '../../sounds/CaptureOpponent.mp3';
import BoardSoundMultiCapture from '../../sounds/GunSingleCapture.mp3';

import { increaseWinOrLosses } from '../../services/user-services';
import { pieceAsJSX } from '../../utils/pieceAsJSX';
import { useLocation, useHistory } from 'react-router-dom';

/*
    Defines two player objects to be swapped.
*/
const playerTurns = {
    user1: 'user2',
    user2: 'user1'
};
let gridInstance;
const Grid = ({ onSetUserScores, resetState, setResetState, setPlayerStats }) => {
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [selectedPiece, setSelectedPiece] = useState({});
    const [winner, setWinner] = useState({});
    const [playPieceSound] = useSound(BoardSoundPiece);
    const [playMoveSound] = useSound(BoardSoundMove);
    const [playWinSound] = useSound(BoardSoundWin);
    const [playCaptureSound] = useSound(BoardSoundCapture);
    const [playMultiCaptureSound] = useSound(BoardSoundMultiCapture);

    const usersObj = useLocation().state;
    const history = useHistory();

    /*
        This useEffect runs only one. It initialises the
        grid and setting up the user objects (usernames/scores).
    */
    useEffect(() => {
        window.onbeforeunload = (e) => {
            history.push('/play-locally', usersObj);
        };

        gridInstance = new GridClass(rows, columns);
        gridInstance.initialiseState();
        gridInstance.addUserNames(usersObj['user1'].userName, usersObj['user2'].userName);
        setCurrentPlayer('user1'); // triggers another cycle
        setPlayerStats({ ...usersObj });
        return () => window.onbeforeunload = {};
    }, []);


    /*
        This is being triggered each time a player presses
        the reset button; the grid is being re-initialised.
    */
    useEffect(() => {
        gridInstance.initialiseState();
        setCurrentPlayer('user1');
        setResetState('false');
        gridInstance.addUserNames(usersObj['user1'].userName, usersObj['user2'].userName);
        onSetUserScores({ ...gridInstance.captures });
    }, [resetState])

    /*
        Function triggered at the end of the game 
        on 'play again' button press.
    */
    const playAgainHandler = () => {
        setWinner({});
        setResetState('true');
    };

    /*
        After a user has selected a piece and their desired
        destination, this function moves the piece on the 
        square target. It also carries out further instructions
        based on the move type (i.e., basic/double/capture). 
        It also determines if there is a game winner 
        (based on user scores).
    */
    const selectMoveHandler = targetSquare => {
        const moveObj = gridInstance.movePiece(targetSquare, selectedPiece);
        onSetUserScores({ ...gridInstance.captures });
        if (gridInstance.captures.user1.score === 12 || gridInstance.captures.user2.score === 12) {
            usersObj[currentPlayer].wins += 1;
            usersObj[playerTurns[currentPlayer]].losses += 1;
            increaseWinOrLosses(usersObj[currentPlayer].userName, 'wins', usersObj[currentPlayer].wins);
            increaseWinOrLosses(usersObj[playerTurns[currentPlayer]].userName, 'losses', usersObj[playerTurns[currentPlayer]].losses);
            playWinSound();
            setPlayerStats({ ...usersObj });
            return setWinner(usersObj[currentPlayer]);
        }
        if (moveObj.moveType === 'capturing-double') {
            setSelectedPiece(moveObj.targetSquare.piece);
            playMultiCaptureSound();  // Play the board sound after a move is performed
        } else if (moveObj.moveType === 'basic') {
            setSelectedPiece('');
            setCurrentPlayer(playerTurns[currentPlayer]);
            playMoveSound();  // Play the board sound after a move is performed
        } else { // single capture
            setSelectedPiece('');
            setCurrentPlayer(playerTurns[currentPlayer]);
            playCaptureSound();  // Play the board sound after a move is performed
        }
    };

    /* 
        This function is being called each time a player
        clicks on one of their pieces. If the clicked piece
        is already selected (the following if statement)
        then we de-select it, otherwise, we select it.
    */
    const selectPieceHandler = piece => {

        playPieceSound(); // Play the board sound when selecting a piece

        if (piece === selectedPiece) {
            return setSelectedPiece('');
        }
        setSelectedPiece(piece);
    };

    /* 
        This function creates the grid. The grid is a 
        columns.length x rows.length array of jsx divisions.
        To create this grid, we use 2 nested map loops. 
        The inner loop is responsible for the columns (individual squares).
        The outter loop is responsible for the rows.
        For the appearence (e.g., color) of the grid we use CSS.
    */
    const gridJSX = rows.map(row => {
        return (
            <div key={row} className="row-grid" style={rowStyle}>
                {columns.map(column => {
                    // appearence logic goes here (square color / pieces color etc)
                    const sqColorClass = squareColor(row, column);
                    // piece is defined only when gridInstance is defined
                    // when gridInstance is defined, then we get back a square from 
                    // the state of the grid. This square, can either hold a piece
                    // or be null.
                    const square = gridInstance && gridInstance.gridState[row][column];
                    // the following function contains all the logic related to the 
                    // JSX piece component (whether there is a piece, if it is selected and so on)
                    const pieceJSX = pieceAsJSX(square, currentPlayer, selectedPiece, selectPieceHandler);
                    let squareClasses = `square-grid ${sqColorClass}`;
                    let squareJSX = (
                        <div key={column} className={squareClasses} style={squareStyle}>
                            {pieceJSX}
                        </div>
                    );
                    if (Object.keys(selectedPiece).length && selectedPiece.legalMoves.includes(square)) {
                        // if we are here, we know 1) a piece is selected and, 2) THIS square
                        // is a legal move of the selected piece.
                        squareClasses += 'legal-square ';
                        squareJSX = (
                            <div key={column} className={squareClasses} style={squareStyle} onClick={() => selectMoveHandler(square)}>
                                {pieceJSX}
                            </div>
                        );
                    }

                    return (
                        squareJSX
                    );
                })}
            </div>)
    });

    /*
        In the following piece of JSX there is also the logic
        for rendering an arrow indicating the current turn.
    */
    return (
        <>
            <div className="grid" style={gridStyle}>
                <div className="user1-name">
                    <p >{usersObj['user1'].userName}</p>
                    <span className="turn-icon-user1" style={{ color: currentPlayer !== 'user1' && '#b2edfcff' }}>˿</span>
                </div>
                {gridJSX}
                {!!Object.keys(winner).length && <div className="winner-announcement">
                    🥳 {winner.userName} Wins! 🥳
                <div className="play-again-btn" onClick={playAgainHandler}>
                        Play again!
                </div>
                </div>}
                <div className="user2-name">
                    <p >{usersObj['user2'].userName}</p>
                    <span className="turn-icon-user2" style={{ color: currentPlayer !== 'user2' && '#b2edfcff' }}>˿</span>
                </div>
            </div>
        </>
    );
};

export default Grid;