import "./App.css";
import Main from './main/Main'
import logo from "./brandlogo.png";

function App() {
  return (
    <div className="App" style={{ background: "#28527a" }}>
      <img src={logo} alt={"brand-logo"} style={{width: 150, height: 30, marginTop: 25}} />
      <h1 style={{ color: "#fff" }}>Hello WebGl</h1>
    <Main />
    </div>
  );
}

export default App;

