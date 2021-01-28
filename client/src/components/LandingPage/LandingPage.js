import './LandingPage.css';
import UserForm from '../UserForm/UserForm';
import { fetchAll } from '../../services/user-services';
import { useEffect, useState } from 'react';
import logo from '../../static/img/CheckersLogo.png';
import logoReact from '../../static/img/ReactLogoTransparent.png';

const LandingPage = () => {
    const [allUsers, setAllUsers] = useState([]);

    const sortUsersByWins = users => {
        const len = users.length;
        /* 
            Sorting algorithm: this algorithm sorts all the users by score.
            Description: This compares all existing users' score and sorts 
            them in ascending order.
        */
        for (let thisUserIdx = len - 1; thisUserIdx >= 0; thisUserIdx--) {
            for (let otherUserIdx = 1; otherUserIdx <= thisUserIdx; otherUserIdx++) {
                const userScoreThisUser = (users[otherUserIdx - 1].wins - users[otherUserIdx - 1].losses) + (users[otherUserIdx - 1].wins + users[otherUserIdx - 1].losses) * 0.5;
                const userScoreOtherUser = (users[otherUserIdx].wins - users[otherUserIdx].losses) + (users[otherUserIdx].wins + users[otherUserIdx].losses) * 0.5;
                if (userScoreThisUser < userScoreOtherUser) {
                    const temp = users[otherUserIdx - 1];
                    users[otherUserIdx - 1] = users[otherUserIdx];
                    users[otherUserIdx] = temp;
                }
            }
        }
        return users;
    };
    /* 
        Fetching existing users from back-end 
        (only once, at the end of the 1st render)
    */
    useEffect(() => {
        fetchAll()
            .then(users => {
                const sortedUsers = sortUsersByWins(users);
                setAllUsers(sortedUsers);
            });
    }, []);

    /*
        Creates an array with JSX elements. 
        Each JSX element is a row of the leading board.
    */
    const usersJSX = allUsers.map((user, i) => {
        const userScore = (user.wins - user.losses) + (user.wins + user.losses) * 0.5;

        return (
            <div key={user.userName} className={`user-row user-row${i % 2}`}>
                <div className="user-name">{i + 1}. {user.userName}</div>
                <div className="user-score">🏆{user.wins}</div>
                <div className="user-score"> ☠️{user.losses} </div>
                <div className="score-">Score ({userScore.toFixed(2)})</div>
            </div>
        );
    })
    
    return (
        <main className="landing-container">
            <img src={logo} className="logo-landing" />
            <div className="scores-table-container scores-in-remote">
                <h1>Leaderboard</h1>
                <div className="scores-table">
                    {usersJSX}
                </div>
            </div>
            <div className="player1-form">
                <UserForm />
            </div>
            <img className="react-logo" src={logoReact} alt="" />
        </main>
    );
};

export default LandingPage;