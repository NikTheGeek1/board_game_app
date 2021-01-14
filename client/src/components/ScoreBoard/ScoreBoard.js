import './ScoreBoard.css';
import ScoreCounter from '../ScoreCounter/ScoreCounter';
import PlayerStats from '../PlayerStats/PlayerStats';
import Title from '../Title/Title';

const ScoreBoard = ({ userScores, playerStats, readyToPlay }) => {

    let mainJSX = (
        <section className="score-board-section">
            <Title />
            <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </section>
    );
    if (readyToPlay) {
        mainJSX = (
            <section className="score-board-section">
                <PlayerStats playerStats={playerStats} />
                <Title />
                <ScoreCounter userScores={userScores} />
            </section>
        );
    }
    return mainJSX;
};

export default ScoreBoard;