import "./style.scss";

export function App() {
  const maccheroni = (
    <a href="https://github.com/lubricode/maccheroni.git" target="_blank">
      lubricode/maccheroni
    </a>
  );

  return <h1>{maccheroni} client up and running 🚀</h1>;
}

document.body.prepend(<App />);
