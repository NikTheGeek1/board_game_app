import './App.css';
import LandingPage from './components/LandingPage/LandingPage';
import WelcomePlayer from './components/WelcomePlayer/WelcomePlayer';
import MultiRemote from './components/MultiRemote/MultiRemote';
import GameBox from './containers/GameBox/GameBox';
import { initSocket } from './socket.io/socket';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
initSocket();

function App() {

  return (
    <Router>
      <Switch>

        <Route path="/" exact>
          <LandingPage />
        </Route>

        <Route path="/welcome">
          <WelcomePlayer />
        </Route>

        <Route path="/multi-remote">
          <MultiRemote />
        </Route>

        <Route path="/single-player">
          <GameBox type="single" />
        </Route>

        <Route path="/play-locally">
          <GameBox type="locally" />
        </Route>

        <Route path="/play-remotely">
          <GameBox type="remotely" />
        </Route>

      </Switch>
    </Router>
  );
}

export default App;

