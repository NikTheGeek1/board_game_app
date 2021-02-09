import './CheckerBoard.css';
import Grid from '../Grid/Grid'
import GridMulti from '../GridMulti/GridMulti';
import GridSingle from '../GridSingle/GridSingle';

const CheckerBoard = ({ type, onSetUserScores, resetState, setResetState, setPlayerStats, setReadyToPlay, readyToPlay }) => {

    let gridJSX;
    if (type === 'locally') {
        setReadyToPlay(true);
        gridJSX = (
            <Grid
                setPlayerStats={setPlayerStats}
                onSetUserScores={onSetUserScores}
                resetState={resetState}
                setResetState={setResetState}
            />
        );
    } else if (type === 'single') {
        setReadyToPlay(true);
        gridJSX = (
            <GridSingle
                setPlayerStats={setPlayerStats}
                onSetUserScores={onSetUserScores}
                resetState={resetState}
                setResetState={setResetState}
            />
        );
    } else {
        gridJSX = (
            <GridMulti
                setReadyToPlay={setReadyToPlay}
                readyToPlay={readyToPlay}
                setPlayerStats={setPlayerStats}
                onSetUserScores={onSetUserScores}
                resetState={resetState}
                setResetState={setResetState}
            />
        );
    }

    return (
        <section className="checker-board-section">
            {gridJSX}
        </section>
    );
};

export default CheckerBoard;