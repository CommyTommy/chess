// To show that no square is currently selected by default
let selectedSquare = null;

// For Turn order
let currentTurn = 'white';
let playerColor = null;

// Initialize the chess board
const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// get the html element 'chessboard' so we can add classes and elements to it
const element = document.getElementById("chessboard");

// A loop to create the 64 Div elements so we didnt have to manually write them in HTML
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');

        square.dataset.row = i;
        square.dataset.col = j;
        square.addEventListener('click', handleSquareClick);
        square.textContent = initialBoard[i][j] || '';
        element.appendChild(square);
    }
}

function selectPlayerColor(isWhite) {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('chessboard').style.display = 'grid';
    if (isWhite) {
        playerColor = 'white';
        console.log("You are playing as white.");
    } else {
        playerColor = 'black';
        console.log("You are playing as black.");
    }
}

// Reads when a square is clicked and then set the selected square and add the 'selected' class
function handleSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row); 
    const col = parseInt(square.dataset.col);

    if (currentTurn === 'white') {
        console.log("White's turn!");
    } else if (currentTurn !== 'white') {
        console.log("Black's turn!");
    }

    // Move execution
    if (selectedSquare !== null && square.classList.contains('possible-move')) {
        const piece = selectedSquare.textContent;
        const pieceColor = (piece === piece.toUpperCase()) ? 'white' : 'black';
        if (pieceColor !== currentTurn) {
            console.log("You cannot move your opponent's piece!");
            return;
        } 

        const oldRow = parseInt(selectedSquare.dataset.row);
        const oldCol = parseInt(selectedSquare.dataset.col);
        const movingPiece = selectedSquare.textContent;

        // Updates the board array (memory)
        initialBoard[row][col] = movingPiece;
        initialBoard[oldRow][oldCol] = null;

        // Updates Piece Icon
        square.textContent = movingPiece;
        selectedSquare.textContent = '';

        // Cleaning up highlights
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
        document.querySelectorAll('.possible-move').forEach(sq => sq.classList.remove('possible-move'));
        
        console.log("Move executed successfully!");
        if (currentTurn === 'white') {
            currentTurn = 'black';
        } else {
            currentTurn = 'white';
        }
        return; // Stops the function completely so we don't accidentally re-select this square!
    }

    // If Selected Square is not a possible move
    const oldMoves = document.querySelectorAll('.possible-move');

    if(selectedSquare != null) {
        selectedSquare.classList.remove('selected');
    }

    oldMoves.forEach(square => {
        square.classList.remove('possible-move');
    });

    selectedSquare = square;
    selectedSquare.classList.add('selected');
    console.log(`Square clicked: row ${row}, col ${col}`);

    const piece = selectedSquare.textContent;
    if (piece === '') {
        console.log("You selected an empty square.");
        return;
    }

    console.log(`You selected a piece: ${piece}. Calculating moves...`);
    if (piece === 'r' || piece === 'R') {
        showRookMoves(row, col);
    } else if (piece === 'n' || piece === 'N') {
        showKnightMoves(row, col);
    } else if (piece === 'b' || piece === 'B') {
        showBishopMoves(row, col);
    } else if (piece === 'q' || piece === 'Q') {
        showQueenMoves(row, col);
    } else if (piece === 'k' || piece === 'K') {
        showKingMoves(row, col);
    } else if (piece === 'P') {
        showWPawnMoves(row, col);
    } else if (piece === 'p') {
        showBPawnMoves(row, col);
    }
}

// If the user clicks outside of the chess board itll deselect the currently selected square
document.addEventListener('click', function(event) {
    if (!event.target.classList.contains('square')) {
        if (selectedSquare !== null) {
            // 1. Clear the main selection highlight
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
            
            // 2. Clear all the ghost move highlights too!
            const oldMoves = document.querySelectorAll('.possible-move');
            oldMoves.forEach(square => {
                square.classList.remove('possible-move');
            });

            console.log("Clicked outside! Cleared selection and possible moves.");
        }
    }
});

// Helper functions to help possible moves for pieces
function addPossibleMoves(targetSquare) {
    if (!targetSquare) return;

    if(isAlly(selectedSquare.textContent, targetSquare.textContent) === false) {
        if (targetSquare) targetSquare.classList.add('possible-move');
    }
}
function isAlly(currentPiece, targetPiece) {
    if (targetPiece === '') return false;

    const bothWhite = currentPiece === currentPiece.toUpperCase() && targetPiece === targetPiece.toUpperCase();
    const bothBlack = currentPiece === currentPiece.toLowerCase() && targetPiece === targetPiece.toLowerCase();
    return bothWhite || bothBlack;
}

// Potential Moves for Pieces
function showRookMoves(row, col) {
    // 1. Scan Right
    for (let c = col + 1; c < 8; c++) {
        addPossibleMoves(document.querySelector(`[data-row="${row}"][data-col="${c}"]`));
        if (initialBoard[row][c] !== null) break; 
    }

    // 2. Scan Left
    for (let c = col - 1; c >= 0; c--) {
        addPossibleMoves(document.querySelector(`[data-row="${row}"][data-col="${c}"]`));
        if (initialBoard[row][c] !== null) break; 
    }

    // 3. Scan Down
    for (let r = row + 1; r < 8; r++) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${col}"]`));
        if (initialBoard[r][col] !== null) break; 
    }

    // 4. Scan Up
    for (let r = row - 1; r >= 0; r--) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${col}"]`));
        if (initialBoard[r][col] !== null) break; 
    }
    
}

function showBishopMoves(row, col) {
    // 1. Scan Down-Right
    for (let r = row + 1, c = col + 1; c < 8 && r < 8; c++, r++) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${c}"]`));
        if (initialBoard[r][c] !== null) break; 
    }

    // 2. Scan Down-Left
    for (let r = row + 1, c = col - 1; c >= 0 && r < 8; c--, r++) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${c}"]`));
        if (initialBoard[r][c] !== null) break; 
    }

    // 3. Scan Up-Right
    for (let r = row - 1, c = col + 1; c < 8 && r >= 0; c++, r--) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${c}"]`));
        if (initialBoard[r][c] !== null) break; 
        
    }

    // 4. Scan Up-Left
    for (let r = row - 1, c = col - 1; c >= 0 && r >= 0; c--, r--) {
        addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${c}"]`));
        if (initialBoard[r][c] !== null) break; 
    }
}

function showQueenMoves(row, col) {
    showBishopMoves(row, col);
    showRookMoves(row, col);
}

function showKingMoves(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && (r !== row || c !== col)) {
                addPossibleMoves(document.querySelector(`[data-row="${r}"][data-col="${c}"]`));
            }
        }
    }
}

function showWPawnMoves(row, col) {
    // Rule 1 & 2: Moving 1 square forward (must be empty!)
    const oneStepRow = row - 1;
    if (oneStepRow >= 0 && initialBoard[oneStepRow][col] === null) {
        addPossibleMoves(document.querySelector(`[data-row="${oneStepRow}"][data-col="${col}"]`));
        
        // Rule 1 Continued: Double step from starting row (row 6)
        // We only check this if the first step was also empty!
        const twoStepRow = row - 2;
        if (row === 6 && initialBoard[twoStepRow][col] === null) {
            addPossibleMoves(document.querySelector(`[data-row="${twoStepRow}"][data-col="${col}"]`));
        }
    }

    // Rule 3: Diagonal Captures (Left and Right)
    // A White pawn captures on row - 1, and columns col - 1 or col + 1
    const targetRow = row - 1;
    const diagonalCols = [col - 1, col + 1];

    diagonalCols.forEach(targetCol => {
        if (targetRow >= 0 && targetCol >= 0 && targetCol < 8) {
            const pieceOnSquare = initialBoard[targetRow][targetCol];
            // If there is a piece here, and it's lowercase (Black's piece), we can capture it!
            if (pieceOnSquare !== null && pieceOnSquare === pieceOnSquare.toLowerCase()) {
                addPossibleMoves(document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`));
            }
        }
    });
}

function showBPawnMoves(row, col) {
    // Rule 1 & 2: Moving 1 square forward (must be empty!)
    const oneStepRow = row + 1;
    if (oneStepRow >= 0 && initialBoard[oneStepRow][col] === null) {
        addPossibleMoves(document.querySelector(`[data-row="${oneStepRow}"][data-col="${col}"]`));
        
        // Rule 1 Continued: Double step from starting row (row 6)
        // We only check this if the first step was also empty!
        const twoStepRow = row + 2;
        if (row === 1 && initialBoard[twoStepRow][col] === null) {
            addPossibleMoves(document.querySelector(`[data-row="${twoStepRow}"][data-col="${col}"]`));
        }
    }

    // Rule 3: Diagonal Captures (Left and Right)
    // A Black pawn captures on row + 1, and columns col - 1 or col + 1
    const targetRow = row + 1;
    const diagonalCols = [col + 1, col - 1];

    diagonalCols.forEach(targetCol => {
        if (targetRow >= 0 && targetCol >= 0 && targetCol < 8) {
            const pieceOnSquare = initialBoard[targetRow][targetCol];
            // If there is a piece here, and it's lowercase (Black's piece), we can capture it!
            if (pieceOnSquare !== null && pieceOnSquare === pieceOnSquare.toUpperCase()) {
                addPossibleMoves(document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`));
            }
        }
    });
}

function showKnightMoves(row, col) {
    // The 8 unique [rowOffset, colOffset] combinations a Knight can make
    const moves = [
        [-2, 1], [-2, -1], [2, 1], [2, -1],
        [-1, 2], [1, 2], [-1, -2], [1, -2]
    ];

    moves.forEach(move => {
        const targetRow = row + move[0];
        const targetCol = col + move[1];

        // CRITICAL CHECK: Make sure the Knight isn't trying to leap off the 8x8 grid!
        if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
            const targetSquare = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
            addPossibleMoves(targetSquare);
        }
    });
}
