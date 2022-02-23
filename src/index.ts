import Game from "./game";

declare global {
    interface Window { Game: typeof Game; }
}

window.Game = Game