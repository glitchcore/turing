// moving
const MOVE = {LEFT: -1, IDLE: 0, RIGHT: 1};

const DATA = [1, 1, 1, 1, '+', 1, 1, '=', 0, 0, 0, 0, 0, 0];

const PROGRAM = [
    {from: {reg: "pad", cell: 0}, to: {reg: "pad", cell: 0}, move: MOVE.RIGHT},
    {from: {reg: "pad", cell: 1}, to: {reg: "drag", cell: 0}, move: MOVE.RIGHT},
    {from: {reg: "pad", cell: '+'}, to: {reg: "pad", cell: '+'}, move: MOVE.RIGHT},
    {from: {reg: "pad", cell: '='}, to: {reg: "finish", cell: '!'}, move: MOVE.IDLE},

    {from: {reg: "drag", cell: 1}, to: {reg: "drag", cell: 1}, move: MOVE.RIGHT},
    {from: {reg: "drag", cell: '+'}, to: {reg: "drag", cell: '+'}, move: MOVE.RIGHT},
    {from: {reg: "drag", cell: '='}, to: {reg: "drag", cell: '='}, move: MOVE.RIGHT},
    {from: {reg: "drag", cell: 0}, to: {reg: "back", cell: 1}, move: MOVE.LEFT},

    {from: {reg: "back", cell: 1}, to: {reg: "back", cell: 1}, move: MOVE.LEFT},
    {from: {reg: "back", cell: '+'}, to: {reg: "back", cell: '+'}, move: MOVE.LEFT},
    {from: {reg: "back", cell: '='}, to: {reg: "back", cell: '='}, move: MOVE.LEFT},
    {from: {reg: "back", cell: 0}, to: {reg: "pad", cell: 0}, move: MOVE.RIGHT}
];

const INIT_STATE = {
    reg: "pad",
    position: 0
}

// tape
function get_cell(position) {
    return DATA[position];
}

function set_cell(position, value) {
    DATA[position] = value;
}

function render(stage, data) {
    DATA.forEach((cell_value, index) => stage.tape.data[index].text.text = cell_value);

    set_tape_position(stage.tape, data.state.position);
    
    stage.tape.text = DATA.join(', ');
    stage.reg.text = data.state.reg;
}

const rectWidth = 80;
const rectHeight = 50;
const rectSpacing = 30;

function set_tape_position(tape, index) {
    console.log(tape.data);
    
    let x = tape.data[index].x;
    tape.x = app.renderer.width / 2 - (index + 0.44) * (rectWidth * 1.03 + rectSpacing / 4);
}

function add_tape_cell(tape, position) {
    const rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(0, 0, rectWidth, rectHeight);
    rect.endFill();

    const text = new PIXI.Text("255", {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "black",
        align: "center",
    });

    text.anchor.set(0.5);

    text.x = rectWidth / 2;
    text.y = rectHeight / 2;

    rect.addChild(text);
    rect.text = text;
    
    if(position === "center") {
        tape.data = {};
        tape.head = rect;
        tape.tail = rect;
        rect.index = 0;
    } else if(position === "head") {
        rect.x = tape.width + rectWidth / 2 - rectSpacing;
        rect.index = tape.head.index + 1;
        tape.head = rect;
    } else if(position === "tail") {
        rect.x = -(tape.width / 2 + rectWidth + rectSpacing);
        rect.index = tape.tail.index - 1;
        tape.tail = rect;
    }

    const index_text = new PIXI.Text(rect.index, {
        fontFamily: "Arial",
        fontSize: 18,
        fill: "white",
        align: "center",
    });

    index_text.anchor.set(0.5);

    index_text.x = rectWidth / 2;
    index_text.y = rectHeight + 12;

    rect.addChild(index_text);

    tape.data[rect.index] = rect;

    tape.addChild(rect);
}

function create_stage(stage) {
    const tape = new PIXI.Container();
    add_tape_cell(tape, "center");
    for(let i = 0; i < DATA.length - 1; i++) {
        add_tape_cell(tape, "head");
    }

    tape.pivot.set(0.5);

    stage.addChild(tape);
    tape.x = app.renderer.width / 2;
    tape.y = app.renderer.height / 2;

    set_tape_position(tape, 2);

    stage.tape = tape;

    {
        const text = new PIXI.Text(" ", {
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
            align: "center",
        });

        // Set the position of the text object to the center of the canvas
        text.anchor.set(0.5);
        text.x = app.renderer.width / 2;
        text.y = app.renderer.height / 2 - 40 * 2;

        // Add the text object to the Pixi.js stage
        stage.addChild(text);
        stage.reg = text;
    }

    {
        const text = new PIXI.Text("\\/", {
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
            align: "center",
        });

        // Set the position of the text object to the center of the canvas
        text.anchor.set(0.5);
        text.x = app.renderer.width / 2;
        text.y = app.renderer.height / 2 - 40;

        // Add the text object to the Pixi.js stage
        stage.addChild(text);
    }
}

function step(stage, state) {
    console.log("state:", state);

    // get cell value
    let cell = get_cell(state.position);

    // find action
    let actions = PROGRAM.filter(x => (x.from.reg == state.reg && x.from.cell == cell));

    if(actions.length == 0) {
        console.log("actions not found, stop");
        render(stage, {state, action: null});
    } else {
        // handle action
        let action = actions[0];

        render(stage, {state, action});

        console.log("action:", action);

        // set new cell value
        DATA[state.position] = action.to.cell;

        let new_state = {
            reg: action.to.reg,
            position: state.position + action.move
        };

        setTimeout(_ => step(stage, new_state), 500);
    }
}

function handle_app(stage) {
    create_stage(stage);

    let init = INIT_STATE;

    step(stage, init);
}