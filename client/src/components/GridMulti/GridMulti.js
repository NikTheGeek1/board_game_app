import '../Grid/Grid.css';
import { squareColor } from '../../utils/squareColor';
import { rows, columns, squareStyle, rowStyle, gridStyle } from '../../gridSpecs/grid-specs';
import GridClass from '../../models/grid-model';
import { useEffect, useState } from 'react';
import { pieceAsJSX } from '../../utils/pieceAsJSX';
import { getSocket } from '../../socket.io/socket';
import { Prompt, useLocation } from 'react-router-dom';
import useSound from 'use-sound';
import BoardSoundPiece from '../../sounds/selectpiece.mp3';
import BoardSoundMove from '../../sounds/move.mp3';
import BoardSoundWin from '../../sounds/GameWin.mp3';
import BoardSoundCapture from '../../sounds/CaptureOpponent.mp3';
import BoardSoundMultiCapture from '../../sounds/GunSingleCapture.mp3';
import { increaseWinOrLosses } from '../../services/user-services';
import Chat from '../Chat/Chat';

// decide functionality for user2 (should it be same component or different one?)
let gridInstance;
const playerTurns = {
    user1: 'user2',
    user2: 'user1'
};
let ROOM_NAME;
const GridMulti = ({ onSetUserScores, resetState, setResetState, setPlayerStats, setReadyToPlay, readyToPlay }) => {
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [selectedPiece, setSelectedPiece] = useState({});
    const socket = useState(getSocket())[0];
    const [shouldBlockNavigation, setShouldBlockNavigation] = useState(true);
    const [winner, setWinner] = useState({});
    const [room, setRoom] = useState(null);
    const location = useLocation();
    const [playPieceSound] = useSound(BoardSoundPiece);
    const [playMoveSound] = useSound(BoardSoundMove);
    const [playWinSound] = useSound(BoardSoundWin);
    const [playCaptureSound] = useSound(BoardSoundCapture);
    const [playMultiCaptureSound] = useSound(BoardSoundMultiCapture);
    const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState('user1')
    const [thisUser, setThisUser] = useState({});
    const [opponentName, setOpponentName] = useState('');

    useEffect(() => {
        setShouldBlockNavigation(true);
        window.onbeforeunload = function (e) {
            e.preventDefault();
            return "you can not refresh the page";
        };
        const incomingData = location.state;
        gridInstance = new GridClass(rows, columns);
        if (incomingData.user === 'user1') {
            // setPlayerStats({ user1: incomingData.userObj, user2: '' });
            gridInstance.initialiseState();
            socket.emit('send-initial-grid', { grid: gridInstance.gridState, roomName: incomingData.room.name }, room => {
                ROOM_NAME = room.name;
                setRoom(room);
            });
        } else if (incomingData.user === 'user2') {
            setReadyToPlay(true);
            setThisUser({ user: 'user2', userName: incomingData.room.users[1].userName }); // triggers another cycle
            setOpponentName(incomingData.room.users[0].userName);
            gridInstance.createState(incomingData.room.grid);
            setCurrentPlayer(''); // triggers another cycle
            ROOM_NAME = incomingData.room.name;
            setRoom(incomingData.room);
            console.log(incomingData.room, 'GridMulti.js', 'line: ', '55');
            setPlayerStats({ user1: incomingData.room.users[0], user2: incomingData.room.users[1] });
            gridInstance.addUserNames(incomingData.room.users[1].userName, incomingData.room.users[0].userName);
            onSetUserScores({ ...gridInstance.captures });
        }

        socket.on('someone-joined', room => {
            setRoom(room);
            setThisUser({ user: 'user1', userName: room.users[0].userName }); // triggers another cycle
            setOpponentName(room.users[1].userName);
            setCurrentPlayer('user1');
            setPlayerStats({ user1: room.users[0], user2: room.users[1] });
            gridInstance.addUserNames(room.users[1].userName, room.users[0].userName);
            onSetUserScores({ ...gridInstance.captures });
            setReadyToPlay(true);
        });

        socket.on('opponent-moved', ({ room, currentPlayer, currentPlayerSymbolIncoming }) => {
            setCurrentPlayerSymbol(currentPlayerSymbolIncoming);
            gridInstance.createState(room.grid);
            gridInstance.calculateScore();
            playMoveSound();
            onSetUserScores({ ...gridInstance.captures });
            setCurrentPlayer(currentPlayer);
            const usersObj = { user1: room.users[0], user2: room.users[1] };
            if (gridInstance.captures.user1.score === 12 || gridInstance.captures.user2.score === 12) {
                playWinSound();
                setCurrentPlayerSymbol('user1');
                setPlayerStats({ ...usersObj });
                return setWinner(usersObj[playerTurns[currentPlayer]]);
            }
        });

        socket.on('play-again', () => {
            setWinner({});
            gridInstance.initialiseState();
            console.log(currentPlayer, 'GridMulti.js', 'line: ', '84');
            setResetState('false');
            onSetUserScores({ ...gridInstance.captures });
        });

        socket.on('opponent-left', () => {
            setReadyToPlay(false);
            gridInstance = new GridClass(rows, columns);
            gridInstance.initialiseState();
            setCurrentPlayer('user1'); // triggers another cycle
        });

        return () => {
            setReadyToPlay(false);
            window.onbeforeunload = () => { };
            socket.emit('i-am-leaving', ROOM_NAME);
            socket.off('play-again');
            socket.off('someone-left');
            socket.off('opponent-moved');
            socket.off('opponent-left');
            setShouldBlockNavigation(false);
        };
    }, []);

    const selectMoveHandler = targetSquare => {
        const usersObj = { user1: room.users[0], user2: room.users[1] };
        const moveObj = gridInstance.movePiece(targetSquare, selectedPiece);
        onSetUserScores({ ...gridInstance.captures });
        room.grid = gridInstance.gridState;
        gridInstance.calculateScore();
        if (gridInstance.captures.user1.score === 12 || gridInstance.captures.user2.score === 12) {
            usersObj[currentPlayer].wins += 1;
            usersObj[playerTurns[currentPlayer]].losses += 1;
            increaseWinOrLosses(usersObj[currentPlayer].userName, 'wins', usersObj[currentPlayer].wins);
            increaseWinOrLosses(usersObj[playerTurns[currentPlayer]].userName, 'losses', usersObj[playerTurns[currentPlayer]].losses);
            playWinSound();
            setCurrentPlayerSymbol('user1');
            setPlayerStats({ ...usersObj });
            socket.emit('i-moved', { currentPlayer: playerTurns[currentPlayer], room: room, currentPlayerSymbolIncoming: playerTurns[currentPlayerSymbol] });
            return setWinner(usersObj[currentPlayer]);
        }
        if (moveObj.moveType === 'capturing-double') {
            setSelectedPiece(moveObj.targetSquare.piece);
            playMultiCaptureSound();  // Play the board sound after a move is performed
        } else if (moveObj.moveType === 'basic') {
            socket.emit('i-moved', { currentPlayer: playerTurns[currentPlayer], room: room, currentPlayerSymbolIncoming: playerTurns[currentPlayerSymbol] });
            setCurrentPlayerSymbol(playerTurns[currentPlayerSymbol]);
            setSelectedPiece('');
            setCurrentPlayer('');
            playMoveSound();  // Play the board sound after a move is performed
        } else { // single capture
            socket.emit('i-moved', { currentPlayer: playerTurns[currentPlayer], room: room, currentPlayerSymbolIncoming: playerTurns[currentPlayerSymbol] });
            setCurrentPlayerSymbol(playerTurns[currentPlayerSymbol]);
            setSelectedPiece('');
            setCurrentPlayer('');
            playCaptureSound();  // Play the board sound after a move is performed
        }

    };


    const selectPieceHandler = piece => {
        playPieceSound();
        /* 
            This function is being called each time a player
            clicks on one of their pieces. If the clicked piece
            is already selected (the following if statement)
            then we de-select it, otherwise, we select it.
        */
        if (piece === selectedPiece) {
            return setSelectedPiece('');
        }
        setSelectedPiece(piece);
    };

    useEffect(() => {
        gridInstance.initialiseState();
        setResetState('false');
        onSetUserScores({ ...gridInstance.captures });

    }, [resetState]);

    const playAgainHandler = () => {
        socket.emit('i-won', room.name);
        setWinner({});
        if (currentPlayer === 'user1') {
            setCurrentPlayer('user1');
        } else {
            setCurrentPlayer('');
        }
        setResetState('true');
    };
    const gridJSX = rows.map(row => {
        /* 
            This function creates the grid. The grid is a 
            columns.length x rows.length array of jsx divisions.
            To create this grid, we use 2 nested map loops. 
            The inner loop is responsible for the columns (individual squares).
            The outter loop is responsible for the rows.
            For the appearence (e.g., color) of the grid we use CSS.
        */
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

    let JSX = (
        <>
            {/* <div className="waiting-msg">Waiting for another player</div> */}
        </>
    );
    if (readyToPlay) {
        JSX = (
            <>
                <div className="grid" style={gridStyle}>
                    {room &&
                        <div className="user1-name">
                            <p >{room.users[0].userName}</p>
                            <span className="turn-icon-user1" style={{ color: currentPlayerSymbol !== 'user1' && '#b2edfcff' }}>˿</span>
                        </div>
                    }
                    {gridJSX}
                    {!!Object.keys(winner).length && <div className="winner-announcement">
                        🥳 Winner is {winner.userName} 🥳
                        <div className="play-again-btn" onClick={playAgainHandler}>
                            Play again!
                    </div>
                    </div>}
                    {(room && room.users.length === 2) &&
                        <div className="user2-name">
                            <p >{room.users[1].userName}</p>
                            <span className="turn-icon-user2" style={{ color: currentPlayerSymbol !== 'user2' && '#b2edfcff' }}>˿</span>
                        </div>
                    }
                </div>
                <Chat roomName={ROOM_NAME} currentUser={thisUser} opponentName={opponentName}/>
                <Prompt
                    when={shouldBlockNavigation}
                    message='If you leave the game will be cancelled, you sure you wanna leave?'
                />
            </>
        );
    }

    return (JSX);
};

export default GridMulti;