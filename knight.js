const knightMoves = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]
    //.sort(() => Math.random() - 0.5);
    //.sort((a, b) => Math.abs(a[0]) - Math.abs(b[0]));
    //.sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
    //.sort((a, b) => Math.abs(a[0]) - Math.abs(b[0]) || Math.abs(a[1]) - Math.abs(b[1]));
    .sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]) || Math.abs(b[1]) - Math.abs(a[1]));

let m = 8; let n = 8; // board size : m x n
if (process.argv.length > 2 && !isNaN(process.argv[2]))
    m = parseInt(process.argv[2]);
if (process.argv.length > 2 && !isNaN(process.argv[3]))
    n = parseInt(process.argv[3]);

let count = 0;

const board = new Array(m).fill(0).map(() => Array(n).fill(0));

let moveTo = { row: 0, col: 0 }; // starting square
if (process.argv.length > 4 && !isNaN(process.argv[4]) && !isNaN(process.argv[5])) {
    const row = parseInt(process.argv[4]);
    const col = parseInt(process.argv[5])
    if (row >= 0 && row <= (m - 1) && col >= 0 && col <= (n - 1))
        moveTo = { row: row, col: col }
    else
        console.log(`invalid start square (${row}, ${col})`)
}

let depth = 1;

const done = new AbortController();
const sigDone = done.signal;

console.time('Total');
knight(board, moveTo, 1)
    .then((b) => {
        console.table(b)
        // console.log(JSON.stringify(b));
        console.timeEnd('Total');
        // const used = process.memoryUsage();
        // for (let key in used) {
        //     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        // }
    })
    .catch((e) => {
        console.error(e)
    })


function knight(board, moveTo, moveNo) {
    return new Promise((resolve, reject) => {

        try {

            const { row, col } = moveTo;
            board[row][col] = moveNo;

            if (moveNo > depth) {
                // console.log('Depth: ', moveNo);
                // console.table(board);
                depth = moveNo;
            }

            if (moveNo === (m * n)) {
                resolve(board);
                done.abort();
            }

            if (sigDone?.aborted === true) return;

            const tries = [];
            const nextMoves = [];

            knightMoves.forEach((x) => {
                let nextTo = { ...moveTo };
                nextTo.row += x[0];
                nextTo.col += x[1];

                if (nextTo.row >= 0 && nextTo.col >= 0
                    && nextTo.row <= (m - 1) && nextTo.col <= (n - 1)
                    && board[nextTo.row][nextTo.col] === 0) {
                    const nextb = clone2D(board);
                    nextb[nextTo.row][nextTo.col] = moveNo + 1
                    const moves = findMoves(nextTo, nextb);
                    let mcount = 0
                    moves.forEach((m) => {
                        const nextb2 = clone2D(nextb);
                        nextb2[m.row][m.col] = moveNo + 2
                        ms = findMoves(m, nextb2);
                        mcount += ms.length;
                    })
                    nextMoves.push({ move: nextTo, count1: moves.length, count2: mcount })
                }
            })

            nextMoves.sort((a, b) => (a.count1 - b.count1 || a.count2 - b.count2))

            const moves = nextMoves.map(m => m.move)
            moves.forEach((m) => {
                tries.push(knight(clone2D(board), m, moveNo + 1));
            })

            if (tries.length === 0) {
                console.log(`nothing left to try at move no: ${moveNo}`)
                reject();
            }

            delete board;
            delete moveTo;
            delete moves;
            delete nextMoves;

            // use --expose_gc
            if (global.gc && ++count > 50) { global.gc(); count = 0 }

            Promise.any(tries)
                .then((b) => {
                    resolve(b);
                })
                .catch((e) => {
                    reject(e);
                })
        }

        catch (err) {
            reject(`failed at move no: ${moveNo} - ${err}`)
        }
    })
}

function findMoves(fromPos, board) {
    const moves = [];

    knightMoves.forEach((x) => {
        let nextTo = { ...fromPos };
        nextTo.row += x[0];
        nextTo.col += x[1];

        if (nextTo.row >= 0 && nextTo.col >= 0
            && nextTo.row <= (m - 1) && nextTo.col <= (n - 1)
            && board[nextTo.row][nextTo.col] === 0)
            moves.push(nextTo);
    })

    return moves;
}

function clone2D(a) {
    return a.map(o => [...o]);
}