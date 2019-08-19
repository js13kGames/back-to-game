/** Variables */
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let events = {
    click: [],
    mouseMove: [],
    keyDown: []
};
let gameDraw;
let animationFrame;
let ctxStyle = {
    fillStyle: "white",
    strokeStyle: "white",
    font: "50px Arial",
    textAlign: "center",
    textBaseline: "middle"
};

/** Canvas Config */
canvas.width = 1024;
canvas.height = 768;

/** Context Config */
ctx.lineWidth = 2;

/** Game Config */
let current = "intro";
let instances = {};

/** Events */
let addClick = event => events.click.push(event);
canvas.addEventListener("click", event => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    events.click.forEach(e => e(event, x, y));
});

let addMouseMove = event => events.mouseMove.push(event);
canvas.addEventListener("mousemove", event => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    events.mouseMove.forEach(e => e(event, x, y));
});

let addKeyDown = event => events.keyDown.push(event);
document.addEventListener("keydown", event => {
    events.keyDown.forEach(e => e(event));
});

/** Draw Functions */
let tempStyleAction = (callback, newStyles) => {
    if(newStyles) styles(newStyles);
    callback();
    if(newStyles) styles(ctxStyle);
};

let clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

let styles = ({fillStyle, strokeStyle, font, textAlign, textBaseline}) => {
    if(fillStyle) ctx.fillStyle = fillStyle;
    if(strokeStyle) ctx.strokeStyle = strokeStyle;
    if(font) ctx.font = font;
    if(textAlign) ctx.textAlign = textAlign;
    if(textBaseline) ctx.textBaseline = textBaseline;
};

let line = (x1, y1, x2, y2, styles) => {
    tempStyleAction(() => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }, styles);
};

let splitLine = (x1, y1, x2, y2, spacing, styles) => {
    tempStyleAction(() => {
        let x = x1;
        let y = y1;

        let spacingX = (x2 - x1) / spacing;
        let spacingY = (y2 - y1) / spacing;

        ctx.beginPath();

        while(x < x2 || y < y2){
            ctx.moveTo(x, y);
            x += spacingX;
            y += spacingY;
            ctx.lineTo(x, y);
            x += spacingX;
            y += spacingY;
        }

        ctx.stroke();
    }, styles);
};

let drawText = (type, text, x, y, styles) => {
    tempStyleAction(() => ctx[type](text, x, y), styles);
};
let fillText = (text, x, y, styles) => drawText("fillText", text, x, y, styles);
let strokeText = (text, x, y, styles) => drawText("strokeText", text, x, y, styles);

let fillTextBlock = (texts, x, y, spacing, styles) => {
    tempStyleAction(() => {
        for(let i = 0; i < texts.length; i++)
            ctx.fillText(texts[i], x, y + spacing*i);
    }, styles);
};

let drawRect = (type, x, y, width, height, styles) => {
    tempStyleAction(() => ctx[type](x, y, width, height), styles);
};
let fillRect = (x, y, width, height, styles) => drawRect("fillRect", x, y, width, height, styles);
let strokeRect = (x, y, width, height, styles) => drawRect("strokeRect", x, y, width, height, styles);

let drawCircle = (type, x, y, radius, startAngle = 0, endAngle = 2*Math.PI, styles) => {
    tempStyleAction(() => {
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx[type]();
    }, styles);
};
let fillCircle = (x, y, radius, startAngle, endAngle, styles) => drawCircle("fill", x, y, radius, startAngle, endAngle, styles);
let strokeCircle = (x, y, radius, startAngle, endAngle, styles) => drawCircle("stroke", x, y, radius, startAngle, endAngle, styles);

/** Game Functions */
let start = () => {
    clearCanvas();
    gameDraw();
    animationFrame = requestAnimationFrame(start);
};

let next = (name, state) => {
    instances[current].stop();
    current = name;
    instances[current].start(state);
};

export default {
    canvas: {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    },
    current,
    instances,
    player: {
        name: "",
        life: 100,
        damage: 25
    },
    events: {
        addClick,
        addMouseMove,
        addKeyDown
    },
    draw: {
        styles,
        line,
        splitLine,
        fillText,
        strokeText,
        fillTextBlock,
        fillRect,
        strokeRect,
        fillCircle,
        strokeCircle
    },
    start: _gameDraw => {
        styles(ctxStyle);
        gameDraw = _gameDraw;
        start();
    },
    stop: () => {
        cancelAnimationFrame(animationFrame);
        events = {
            click: [],
            mouseMove: [],
            keyDown: []
        };
        gameDraw = null;
        clearCanvas();
    },
    next,
    gameOver: win => {
        if(!win) {
            next("gameover", win);
            return;
        }
        
        switch(current){
            case "intro":
                next("pong");
            break;
            case "pong":
                next("tictactoe");
            break;
            case "tictactoe":
                next("gameover", win);
            break;
        }
    }
};