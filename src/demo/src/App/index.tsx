import favicon from "../../public/favicon.svg";
import "./style.scss";

export function App() {
  const anchor = (
    <a href="https://github.com/lubricode/maccheroni.git" target="_blank">
      lubricode/maccheroni
    </a>
  );

  return (
    <h1>
      <img src={favicon} /> {anchor} client up and running 🚀
    </h1>
  );
}
