import { CommonStore } from "maccheroni";
import favicon from "../../public/favicon.svg";
import "./style.scss";

const store = new CommonStore({
  target: {
    primesMax: 50,
  },
  operators: (builder) => ({
    query: {},
    mutation: {
      increasePrimesMax: builder.mutation<number>((step) => async (state) => {
        state.primesMax += step;
      }),
    },
  }),
});

console.log(store);

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
