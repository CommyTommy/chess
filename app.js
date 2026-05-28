// To show that no square is currently selected by default
let selectedSquare = null;

// For Turn order
let currentTurn = 'white';
let playerColor = null;
const castlingRights = {
    whiteKingMoved: false,
    whiteRookLeftMoved: false,
    whiteRookRightMoved: false,
    blackKingMoved: false,
    blackRookLeftMoved: false,
    blackRookRightMoved: false,
};

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

        if(movingPiece === 'K' || movingPiece === 'k') {
            if(Math.abs(col - oldCol) === 2) {
                const rookPiece = (currentTurn === 'white') ? 'R' : 'r';
                if (col === 6) {
                    initialBoard[row][5] = rookPiece
                    initialBoard[row][7] = null;

                    const oldRookSquare = document.querySelector(`[data-row="${row}"][data-col="7"]`);
                    const newRookSquare = document.querySelector(`[data-row="${row}"][data-col="5"]`);
                    
                    oldRookSquare.textContent = '';
                    newRookSquare.textContent = rookPiece;
                } else if (col === 2) {
                    initialBoard[row][3] = rookPiece
                    initialBoard[row][0] = null;

                    const oldRookSquare = document.querySelector(`[data-row="${row}"][data-col="0"]`);
                    const newRookSquare = document.querySelector(`[data-row="${row}"][data-col="3"]`);

                    oldRookSquare.textContent = '';
                    newRookSquare.textContent = rookPiece;
                }
            }
        }

        // Updates the board array (memory)
        initialBoard[row][col] = movingPiece;
        initialBoard[oldRow][oldCol] = null;

        // Updates Piece Icon
        square.textContent = movingPiece;
        selectedSquare.textContent = '';

        if(movingPiece === 'K') {
            castlingRights.whiteKingMoved = true;
        } else if (movingPiece === 'k') {
            castlingRights.blackKingMoved = true;
        } else if (movingPiece === 'R') {
            if (oldRow === 7 && oldCol === 0) {
                castlingRights.whiteRookLeftMoved = true;
            } else if (oldRow === 7 && oldCol === 7) {
                castlingRights.whiteRookRightMoved = true;
            }
        } else if (movingPiece === 'r') {
            if (oldRow === 0 && oldCol === 0) {
                castlingRights.blackRookLeftMoved = true;
            } else if (oldRow === 0 && oldCol === 7) {
                castlingRights.blackRookRightMoved = true;
            }
        }
        // Cleaning up highlights
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
        document.querySelectorAll('.possible-move').forEach(sq => sq.classList.remove('possible-move'));
        
        // Pawn Promotion 
        if(movingPiece === 'P' && row === 0) {
            square.textContent = 'Q';
            initialBoard[row][col] = 'Q';
            console.log("White Pawn got a Promotion")
        } else if (movingPiece === 'p' && row === 7) {
            square.textContent = 'q';
            initialBoard[row][col] = 'q';
            console.log("Black Pawn got a Promotion")
        }

        console.log("Move executed successfully!");
        if (currentTurn === 'white') {
            currentTurn = 'black';
        } else {
            currentTurn = 'white';
        }

        updateCheckHighlight();
        checkForCheckmate();

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

    const clickedColor = (piece === piece.toUpperCase()) ? 'white' : 'black';
    let rawMoves = [];

    // If it doesn't match the current turn, instantly stop everything!
    if (clickedColor !== currentTurn) {
        console.log(`Viewing opponent's ${piece} moves...`);
        
        let opponentRawMoves = [];

        // 1. Gather the moves QUIETLY (false)
        if (piece === 'r' || piece === 'R') {
            opponentRawMoves = showRookMoves(row, col, false);
        } else if (piece === 'n' || piece === 'N') {
            opponentRawMoves = showKnightMoves(row, col, false);
        } else if (piece === 'b' || piece === 'B') {
            opponentRawMoves = showBishopMoves(row, col, false);
        } else if (piece === 'q' || piece === 'Q') {
            opponentRawMoves = showQueenMoves(row, col, false);
        } else if (piece === 'k' || piece === 'K') {
            opponentRawMoves = showKingMoves(row, col, false, true);
        } else if (piece === 'P') {
            opponentRawMoves = showWPawnMoves(row, col, false);
        } else if (piece === 'p') {
            opponentRawMoves = showBPawnMoves(row, col, false);
        }

        // 2. Filter them using the OPPONENT'S color
        const opponentSafeMoves = filterLegalMoves(opponentRawMoves, clickedColor);

        // 3. Highlight only the strictly legal ones
        opponentSafeMoves.forEach(move => {
            const viewSquare = document.querySelector(`[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
            if(viewSquare) viewSquare.classList.add('possible-move');
        });

        // 4. Deselect the piece so we can't accidentally move it!
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
        return;
    }

    if (piece === 'r' || piece === 'R') {
        rawMoves = showRookMoves(row, col, false);
    } else if (piece === 'n' || piece === 'N') {
        rawMoves = showKnightMoves(row, col, false);
    } else if (piece === 'b' || piece === 'B') {
        rawMoves = showBishopMoves(row, col, false);
    } else if (piece === 'q' || piece === 'Q') {
        rawMoves = showQueenMoves(row, col, false);
    } else if (piece === 'k' || piece === 'K') {
        rawMoves = showKingMoves(row, col, false);
    } else if (piece === 'P') {
        rawMoves = showWPawnMoves(row, col, false);
    } else if (piece === 'p') {
        rawMoves = showBPawnMoves(row, col, false);
    }

    const safe = filterLegalMoves(rawMoves, currentTurn);
    safe.forEach(move => {
        const safe = document.querySelector(`[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
        if(safe) safe.classList.add('possible-move');
    });
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
function addPossibleMoves(startRow, startCol, targetSquare, highlightVisual = false) {
    if (!targetSquare) return null;

    const currentPiece = initialBoard[startRow][startCol];
    const targetRow = parseInt(targetSquare.dataset.row);
    const targetCol = parseInt(targetSquare.dataset.col);

    if (isAlly(currentPiece, targetSquare.textContent) === false) {
        // Show Visual
        if (highlightVisual) {
            targetSquare.classList.add('possible-move');
        }

        // Always return the raw data object of the move!
        return {
            piece: currentPiece,
            fromRow: startRow,
            fromCol: startCol,
            toRow: targetRow,
            toCol: targetCol
        };
    }
    return null;
}

function isAlly(currentPiece, targetPiece) {
    if (targetPiece === '') return false;

    const bothWhite = currentPiece === currentPiece.toUpperCase() && targetPiece === targetPiece.toUpperCase();
    const bothBlack = currentPiece === currentPiece.toLowerCase() && targetPiece === targetPiece.toLowerCase();
    return bothWhite || bothBlack;
}

// Potential Moves for Pieces
function showRookMoves(row, col, highlightVisual = false) {
    let moves = [];

    // 1. Scan Right
    for (let c = col + 1; c < 8; c++) {
        const targetSquare = document.querySelector(`[data-row="${row}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[row][c] !== null) break; 
    }

    // 2. Scan Left
    for (let c = col - 1; c >= 0; c--) {
        const targetSquare = document.querySelector(`[data-row="${row}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[row][c] !== null) break; 
    }

    // 3. Scan Down
    for (let r = row + 1; r < 8; r++) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${col}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][col] !== null) break; 
    }

    // 4. Scan Up
    
    for (let r = row - 1; r >= 0; r--) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${col}"]`);        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][col] !== null) break; 
    }
    
    return moves;
}

function showBishopMoves(row, col, highlightVisual = false) {
    let moves = [];
    // 1. Scan Down-Right
    for (let r = row + 1, c = col + 1; c < 8 && r < 8; c++, r++) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][c] !== null) break; 
    }

    // 2. Scan Down-Left
    for (let r = row + 1, c = col - 1; c >= 0 && r < 8; c--, r++) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][c] !== null) break;  
    }

    // 3. Scan Up-Right
    for (let r = row - 1, c = col + 1; c < 8 && r >= 0; c++, r--) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][c] !== null) break; 
        
    }

    // 4. Scan Up-Left
    for (let r = row - 1, c = col - 1; c >= 0 && r >= 0; c--, r--) {
        const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }
        
        if (initialBoard[r][c] !== null) break; 
    }

    return moves;
}

function showQueenMoves(row, col, highlightVisual = false) {
    const bishopMoves = showBishopMoves(row, col, highlightVisual);
    const rookMoves = showRookMoves(row, col, highlightVisual);
    return bishopMoves.concat(rookMoves);
}

function showKingMoves(row, col, highlightVisual = false, checkCastling = true) {
    let moves = [];

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && (r !== row || c !== col)) {
                const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
                // Pass our new parameters into the helper
                const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                
                if (moveData) {
                    moves.push(moveData); // Save the data object!
                }
            }
        }
    }

    const piece = initialBoard[row][col];

    if(checkCastling) {
        if(piece === "K") {
            if(castlingRights.whiteKingMoved === false) {
                if(!isKingInCheck('white')) {
                    if(castlingRights.whiteRookLeftMoved === false) {
                        if(initialBoard[7][1] === null && initialBoard[7][2] === null && initialBoard[7][3] === null) {
                            const targetSquare = document.querySelector(`[data-row="7"][data-col="2"]`);
                            
                            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                            
                            if (moveData) {
                                moves.push(moveData);
                            }
                        }
                    }
                    if(castlingRights.whiteRookRightMoved === false) {
                        if(initialBoard[7][6] === null && initialBoard[7][5] === null) {
                            const targetSquare = document.querySelector(`[data-row="7"][data-col="6"]`);
                            
                            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                            
                            if (moveData) {
                                moves.push(moveData);
                            }
                        }
                    }
                }
            }
        }
        else if(piece === "k") {
            if(castlingRights.blackKingMoved === false) {
                if(!isKingInCheck('black')) {
                    if(castlingRights.blackRookLeftMoved === false) {
                        if(initialBoard[0][1] === null && initialBoard[0][2] === null && initialBoard[0][3] === null) {
                            const targetSquare = document.querySelector(`[data-row="0"][data-col="2"]`);
                            
                            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                            
                            if (moveData) {
                                moves.push(moveData);
                            }
                        }
                    }
                    if(castlingRights.blackRookRightMoved === false) {
                        if(initialBoard[0][6] === null && initialBoard[0][5] === null) {
                            const targetSquare = document.querySelector(`[data-row="0"][data-col="6"]`);
                            
                            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                            
                            if (moveData) {
                                moves.push(moveData);
                            }
                        }
                    }
                }
                
            }
        }
    }
    
    return moves;
}

function showWPawnMoves(row, col, highlightVisual = false) {
    let moves = [];

    // Rule 1 & 2: Moving 1 square forward (must be empty!)
    const oneStepRow = row - 1;
    if (oneStepRow >= 0 && initialBoard[oneStepRow][col] === null) {
        const targetSquare = document.querySelector(`[data-row="${oneStepRow}"][data-col="${col}"]`);

        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }        

        // Rule 1 Continued: Double step from starting row (row 6)
        // We only check this if the first step was also empty!
        const twoStepRow = row - 2;
        if (row === 6 && initialBoard[twoStepRow][col] === null) {
            const targetSquare = document.querySelector(`[data-row="${twoStepRow}"][data-col="${col}"]`);
            // Pass our new parameters into the helper
            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
            
            if (moveData) {
                moves.push(moveData); // Save the data object!
            }  
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
                const targetSquare = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

                // Pass our new parameters into the helper
                const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                
                if (moveData) {
                    moves.push(moveData); // Save the data object!
                }  
            }
        }
    });

    return moves;
}

function showBPawnMoves(row, col, highlightVisual = false) {

    let moves = [];

    // Rule 1 & 2: Moving 1 square forward (must be empty!)
    const oneStepRow = row + 1;
    if (oneStepRow >= 0 && initialBoard[oneStepRow][col] === null) {
        const targetSquare = document.querySelector(`[data-row="${oneStepRow}"][data-col="${col}"]`);

        // Pass our new parameters into the helper
        const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
        
        if (moveData) {
            moves.push(moveData); // Save the data object!
        }   
        
        // Rule 1 Continued: Double step from starting row (row 6)
        // We only check this if the first step was also empty!
        const twoStepRow = row + 2;
        if (row === 1 && initialBoard[twoStepRow][col] === null) {
            const targetSquare = document.querySelector(`[data-row="${twoStepRow}"][data-col="${col}"]`);
            // Pass our new parameters into the helper
            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
            
            if (moveData) {
                moves.push(moveData); // Save the data object!
            }  
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
                const targetSquare = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

                // Pass our new parameters into the helper
                const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
                
                if (moveData) {
                    moves.push(moveData); // Save the data object!
                }  
            }
        }
    });

    return moves;
}

function showKnightMoves(row, col, highlightVisual = false) {

    let moves = [];

    // The 8 unique [rowOffset, colOffset] combinations a Knight can make
    const knightPatterns = [
        [-2, 1], [-2, -1], [2, 1], [2, -1],
        [-1, 2], [1, 2], [-1, -2], [1, -2]
    ];

    knightPatterns.forEach(move => {
        const targetRow = row + move[0];
        const targetCol = col + move[1];

        // CRITICAL CHECK: Make sure the Knight isn't trying to leap off the 8x8 grid!
        if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
            const targetSquare = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

            // Pass our new parameters into the helper
            const moveData = addPossibleMoves(row, col, targetSquare, highlightVisual);
            
            if (moveData) {
                moves.push(moveData); // Save the data object!
            }   
        }
    });

    return moves;
}

function getAllValidMoves(color, highlightVisual = false, skipCastling = false) {
    let allMoves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = initialBoard[r][c];
            if (piece === null) continue;

            const pieceColor = (piece === piece.toUpperCase()) ? 'white' : 'black';

            if (pieceColor === color) {
                if (piece === 'r' || piece === 'R') {
                    allMoves = allMoves.concat(showRookMoves(r, c, highlightVisual));
                } else if (piece === 'n' || piece === 'N') {
                    allMoves = allMoves.concat(showKnightMoves(r, c, highlightVisual));
                } else if (piece === 'b' || piece === 'B') {
                    allMoves = allMoves.concat(showBishopMoves(r, c, highlightVisual));
                } else if (piece === 'q' || piece === 'Q') {
                    allMoves = allMoves.concat(showQueenMoves(r, c, highlightVisual));
                } else if (piece === 'k' || piece === 'K') {
                    allMoves = allMoves.concat(showKingMoves(r, c, highlightVisual, !skipCastling));
                } else if (piece === 'P') {
                    allMoves = allMoves.concat(showWPawnMoves(r, c, highlightVisual));
                } else if (piece === 'p') {
                    allMoves = allMoves.concat(showBPawnMoves(r, c, highlightVisual));
                }
            }
        }
    }
    return allMoves;
}

function isKingInCheck(color) {
    let kingRow = -1;
    let kingCol = -1;

    const kingLetter = (color === 'white') ? 'K' : 'k';

    for(let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if(initialBoard[r][c] === kingLetter) {
                kingCol = c;
                kingRow = r;
                break;
            }
        }
    }

    const opponentColor = (color === 'white') ? 'black' : 'white';
    const opponentMoves = getAllValidMoves(opponentColor, false, true);

    for (let i = 0; i < opponentMoves.length; i++) {
        const move = opponentMoves[i];
        if (move.toRow === kingRow && move.toCol === kingCol) {
            return true; // The King is under attack!
        }
    }

    return false; // The King is safe!
}

function filterLegalMoves(pseudoLegalMoves, color) {
    let strictlyLegalMoves = [];

    // Loop through every single move the piece wants to make
    pseudoLegalMoves.forEach(move => {
        
        // 1. Save whatever piece is currently sitting on the target square 
        // (so we can put it back later if it was an enemy we temporarily captured!)
        const originalTargetPiece = initialBoard[move.toRow][move.toCol];

        // ==========================================
        // 2. MAKE THE FAKE MOVE (Time travel forward)
        // ==========================================
        // CHALLENGE A: Write the array logic here!
        // You need to place 'move.piece' at [move.toRow][move.toCol],
        // and set the [move.fromRow][move.fromCol] to null.
        initialBoard[move.toRow][move.toCol] = move.piece;
        initialBoard[move.fromRow][move.fromCol] = null;
        
        

        // 3. Look around: Is our King safe in this reality?
        const isSafe = !isKingInCheck(color); // Notice the '!' - it means "NOT in check"

        // ==========================================
        // 4. UNDO THE FAKE MOVE (Time travel backward)
        // ==========================================
        // CHALLENGE B: Write the array logic here!
        // You need to put 'move.piece' back at [move.fromRow][move.fromCol],
        // and put 'originalTargetPiece' back at [move.toRow][move.toCol].
        initialBoard[move.fromRow][move.fromCol] = move.piece;
        initialBoard[move.toRow][move.toCol] = originalTargetPiece;
        

        // 5. The Verdict
        if (isSafe) {
            strictlyLegalMoves.push(move);
        }
    });

    return strictlyLegalMoves;
}

function updateCheckHighlight() {
    const oldcheck = document.querySelectorAll('.check');
    oldcheck.forEach(square => {
        square.classList.remove('check');
    });

    if(isKingInCheck(currentTurn)) {
        let kingCol = -1;
        let kingRow = -1;
        const kingLetter = (currentTurn === 'white') ? 'K' : 'k';

        for(let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if(initialBoard[r][c] === kingLetter) {
                    kingCol = c;
                    kingRow = r;
                    break;
                }
            }
        }

        const kingSquare = document.querySelector(`[data-row="${kingRow}"][data-col="${kingCol}"]`);
        kingSquare.classList.add('check');
    }
}

function checkForCheckmate() {
    const legalMoves = getAllValidMoves(currentTurn, false);
    const filteredMoves = filterLegalMoves(legalMoves, currentTurn);

    if (filteredMoves.length === 0) {
        // Grab your new HTML elements
        const modal = document.getElementById('game-over-modal');
        const winnerText = document.getElementById('winner-text');

        if(isKingInCheck(currentTurn)) {
            // Update the text to say who won
            const winningTeam = currentTurn === 'white' ? 'Black' : 'White';
            winnerText.textContent = `Checkmate! ${winningTeam} wins!`;
        } else {
            // Or declare a draw
            winnerText.textContent = "Stalemate! It's a draw!";
        }
        
        // Remove the 'hidden' class to make the overlay appear!
        modal.classList.remove('hidden');
    }
}

function restartGame() {
    location.reload()
}