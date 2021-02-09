import { useHistory, useLocation } from 'react-router-dom';
import './WelcomePlayer.css';
import Button from '../Button/Button';
import { useState } from 'react';
import UserForm from '../UserForm/UserForm';
import logo from '../../static/img/CheckersHeader.png';
import machineImage from '../../static/img/machine.png';

const WelcomePlayer = () => {
    const [twoPlayers, setTwoPlayers] = useState(false);
    const [readyToPlay, setReadyToPlay] = useState(false);
    const [singlePlayer, setSinglePlayer] = useState(false);

    const history = useHistory();
    const location = useLocation();

    /* 
        This is being triggered when player1 presses the 
        'play locally' button, which in turn brings up the 
        'p1 vs p2' page and waits 2 seconds before going into
        the game.
    */
    const playerTwoCb = (backEndUser) => {
        setReadyToPlay(backEndUser);
        setTimeout(() => {
            history.push('/play-locally', { user1: location.state, user2: backEndUser });
        }, 2000);
    };

    const singlePlayerHandler = () => {
        setSinglePlayer(true);
        setTimeout(() => {
            history.push('/single-player', { user1: location.state });
        }, 2000);
    };

    /* 
        Renders selection buttons (play locally / remotely)
    */
    let buttonsForOneJSX = (
        <>
            <Button title="Single player" onSubmit={singlePlayerHandler} />
            <Button title="Multiplayer (locally)" onSubmit={() => setTwoPlayers(true)} />
            <Button title="Multiplayer (remotely)" onSubmit={() => history.push('/multi-remote', location.state)} />
        </>
    );

    /*
        This renders player's two form when the 
        'play locally' button is pressed.
    */
    let buttonsForTwoJSX;
    if (twoPlayers) {
        buttonsForOneJSX = null;
        buttonsForTwoJSX = (
            <div className="welcome-div-user2">
                <div className="user-form-welcome">
                    <UserForm playerTwoCb={playerTwoCb} />
                </div>
                <span className="OR">OR</span>
                <Button title="Multiplayer (remotely)" onSubmit={() => history.push('/multi-remote', location.state)} />
            </div>
        );
    }

    /*
        Loads the versus screen when the player 2
        has input their name and press 'play'.
    */
    let secondPlayerJSX;
    let VSJSX;
    if (readyToPlay) {
        buttonsForTwoJSX = null;
        VSJSX = <div className="VS">VS</div>;
        secondPlayerJSX = (
            <div className="welcome-div-user1">
                <h1 className="welcome-user-name">{readyToPlay.userName}</h1>
                <div className="trophies">
                    <div className="trophy-icon">🏆</div>
                    <div className="trophy-icon">☠️</div>
                    <div className="user-score-welcome">{readyToPlay.wins}</div>
                    <div className="user-score-welcome">{readyToPlay.losses}</div>
                </div>
            </div>
        );
    };

    let singlePlayerJSX;
    let VSJSXSinglePlayer;
    if (singlePlayer) {
        buttonsForOneJSX = null;
        buttonsForTwoJSX = null;
        VSJSXSinglePlayer = <div className="VS">VS</div>;
        singlePlayerJSX = (
            <div className="welcome-div-user1">
                <h1 className="welcome-user-name">Machine</h1>
                <div className="machine-img-div">
                    <img src={machineImage} alt="" />
                </div>
            </div>
        );
    }

    return (
        <div className="welcome-container">
            <div className="welcome-div" style={{ gridAutoFlow: readyToPlay || singlePlayer ? 'column' : 'row' }}>
                <div className="welcome-div-user1">
                    <h1 className="welcome-user-name">{location.state.userName}</h1>
                    <div className="trophies">
                        <div className="trophy-icon">🏆</div>
                        <div className="trophy-icon">☠️</div>
                        <div className="user-score-welcome">{location.state.wins}</div>
                        <div className="user-score-welcome">{location.state.losses}</div>
                    </div>
                    {buttonsForOneJSX}
                </div>
                {VSJSX}
                {VSJSXSinglePlayer}
                {secondPlayerJSX}
                {singlePlayerJSX}
                {buttonsForTwoJSX}
            </div>
            <img src={logo} className="logo-welcome-page" />
        </div>
    );
};

export default WelcomePlayer;