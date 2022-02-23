import p5 from "p5"

class Game {
    start() {
        var sketch = (p: p5) => {
            const x = 10;
            const y = 100;
            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight);
            };

            p.draw = () => {
                p.background(0);
                p.fill(255);
                p.rect(x, y, 50, 70);
            };
        };

        new p5(sketch);
    }
}

export default Game