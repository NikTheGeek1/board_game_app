import './GameBox.css';
import Header from '../../components/Header/Header';
import CheckerBoard from '../../components/CheckerBoard/CheckerBoard';
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard';
import { useState } from 'react';

/*
    Rendering the checkerboard depending on whether 
    is a remote or local game.
*/

const GameBox = ({ type }) => {
    const [userScores, setUserScores] = useState({});
    const [resetState, setResetState] = useState("");
    const [playerStats, setPlayerStats] = useState({});
    const [readyToPlay, setReadyToPlay] = useState(false);


    return (
        <main className="main-container">
            <Header type={type} setResetState={setResetState} />
            <CheckerBoard
                setPlayerStats={setPlayerStats}
                resetState={resetState}
                setResetState={setResetState}
                type={type}
                onSetUserScores={setUserScores}
                setReadyToPlay={setReadyToPlay}
                readyToPlay={readyToPlay}
            />
            <ScoreBoard userScores={userScores} playerStats={playerStats} readyToPlay={readyToPlay} />
        </main>
    );
};

export default GameBox;