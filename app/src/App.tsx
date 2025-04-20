import "./App.css";
import Game from "./components/Game";

function App() {
  return (
    <div className="App">
      <h1>High-Tech Quest</h1>
      <div style={{ width: "1280px", height: "720px", margin: "0 auto" }}>
        <Game />
      </div>
    </div>
  );
}

export default App;
