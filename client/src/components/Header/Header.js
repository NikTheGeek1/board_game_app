import './Header.css';
import Title from '../Title/Title';
import ResetBox from '../ResetBox/ResetBox';



const Header = ({ type, setResetState }) => {

    return (
        <section className="header-section">
            {type === 'locally' || 'single' && <ResetBox setResetState={setResetState} />}
        </section>
    );
};

export default Header;