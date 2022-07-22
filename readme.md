# Knight's tour solver

## Usage

### `node knight.js [board size rows] [board size cols] [start row] [start col]`
Board Size Rows: Integer, default: 8\
Board Size Cols: Integer, default: 8\
Start Row : Integer (less than board size - 1), default: 0\
Start Col : Integer (less than board size - 1), default: 0

Solutions are found by backtracking and using Warnsdorff's rule (positions with fewest onward moves are tried first and in case of a tie the position with the lowest sum of second level moves is chosen).

If a non-reentrant solution is found, the program prints it out and continues the search. When a reentrant solution is found, the program stops.