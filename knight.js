let n = 8; // board size : n x n
if (process.argv.length > 2 && !isNaN(process.argv[2]))
    n = parseInt(process.argv[2]);

const board = new Array(n).fill(0).map(() => Array(n).fill(0));

let moveTo = { row: 0, col: 0 }; // starting square
if (process.argv.length > 4 && !isNaN(process.argv[3]) && !isNaN(process.argv[4])) {
    const row = parseInt(process.argv[3]);
    const col = parseInt(process.argv[4])
    if (row >= 0 && row <= (n - 1) && col >= 0 && col <= (n - 1))
        moveTo = { row: row, col: col }
    else
        console.log(`invalid start square (${row}, ${col})`)
}

let depth = 1;

const done = new AbortController();
const sigDone = done.signal;

knight(board, moveTo, 1)
    .then((b) => {
        console.table(b)
    })
    .catch((e) => {
        console.error(e)
    })

function knight(board, moveTo, moveNo) {
    return new Promise((resolve, reject) => {
        const { row, col } = moveTo;
        board[row][col] = moveNo;

        if (moveNo > depth) {
            // console.log('Depth: ', moveNo);
            // console.table(board);
            depth = moveNo;
        }

        if (moveNo === (n * n)) {
            resolve(board);
            done.abort();
        }

        if (sigDone?.aborted === true) return;

        const tries = [];
        let nextMoves = [];

        [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]
            .forEach((x) => {
                let nextTo = { ...moveTo };
                nextTo.row += x[0];
                nextTo.col += x[1];

                if (nextTo.row >= 0 && nextTo.col >= 0
                    && nextTo.row <= (n - 1) && nextTo.col <= (n - 1)
                    && board[nextTo.row][nextTo.col] === 0) {
                    const moves = findMoves(nextTo, board);
                    nextMoves.push({ move: nextTo, nextMoves: moves })
                }
            })

        nextMoves.sort((a, b) => (a.nextMoves.length - b.nextMoves.length))

        let moves = nextMoves.map(m => m.move)
        moves.forEach((m) => {
            tries.push(knight(clone2D(board), m, moveNo + 1));
        })

        Promise.race(tries)
            .then((b) => {
                resolve(b);
            })
            .catch((e) => {
                reject(e);
            })
    })
}

function findMoves(fromPos, board) {
    const moves = [];

    [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]
        .forEach((x) => {
            let nextTo = { ...fromPos };
            nextTo.row += x[0];
            nextTo.col += x[1];

            if (nextTo.row >= 0 && nextTo.col >= 0
                && nextTo.row <= (n - 1) && nextTo.col <= (n - 1)
                && board[nextTo.row][nextTo.col] === 0)
                moves.push(nextTo);
        })

    return moves;
}

function clone2D(a) {
    return a.map(o => [...o]);
}