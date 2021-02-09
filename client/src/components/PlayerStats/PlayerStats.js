import './PlayerStats.css';

const playerStats = ({ playerStats}) => {


    let playerStatsJSX;
    if (playerStats && Object.keys(playerStats).length) {
        const user1Score = (playerStats.user1.wins - playerStats.user1.losses) + (playerStats.user1.wins + playerStats.user1.losses) * 0.5;
        const user2Score = playerStats.user2 ? (playerStats.user2.wins - playerStats.user2.losses) + (playerStats.user2.wins + playerStats.user2.losses) * 0.5 : 0;

        playerStatsJSX = (
            <>
                <div>Record (wins/losses)</div>
                <div className="hr"> </div>
                <div className="score-name">
                    <div>{playerStats.user1.userName}:</div>
                    <div>{user1Score.toFixed(2)}</div>
                </div>
                <div className="score-name">
                    <div>{playerStats.user2 ? playerStats.user2.userName : 'Machine'}:</div>
                    <div>{user2Score.toFixed(2)}</div>
                </div>

            </>
        );
    }

    return (
        <div className="player-stats">
            {playerStatsJSX}
        </div>
    );
};

export default playerStats;