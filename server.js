const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = [];
let gameState = {
    board: Array(5).fill().map(() => Array(5).fill(null)), // 5x5 grid
    players: {
        A: { pieces: [] },
        B: { pieces: [] }
    },
    currentPlayer: 'A',
    gameOver: false
};

const initializeGame = () => {
    gameState.players.A.pieces = [
        { type: 'P1', position: [0, 0] },
        { type: 'H1', position: [0, 1] },
        { type: 'H2', position: [0, 2] },
        { type: 'P2', position: [0, 3] },
        { type: 'P3', position: [0, 4] }
    ];

    gameState.players.B.pieces = [
        { type: 'P1', position: [4, 0] },
        { type: 'H1', position: [4, 1] },
        { type: 'H2', position: [4, 2] },
        { type: 'P2', position: [4, 3] },
        { type: 'P3', position: [4, 4] }
    ];
};

const validateMove = (player, move) => {
    // Implement move validation logic here
    return true; // For now, assume all moves are valid
};

const applyMove = (player, move) => {
    // Update the game state with the new move
    gameState.currentPlayer = player === 'A' ? 'B' : 'A';
    // Update the board and remove any eliminated pieces
};

const broadcastGameState = () => {
    clients.forEach(client => {
        client.send(JSON.stringify({ type: 'update', state: gameState }));
    });
};

const checkGameOver = () => {
    const piecesA = gameState.players.A.pieces.length;
    const piecesB = gameState.players.B.pieces.length;

    if (piecesA === 0) {
        gameState.gameOver = true;
        broadcastGameOver('B');
    } else if (piecesB === 0) {
        gameState.gameOver = true;
        broadcastGameOver('A');
    }
};

const broadcastGameOver = (winner) => {
    clients.forEach(client => {
        client.send(JSON.stringify({ type: 'gameover', winner }));
    });
};

server.on('connection', (ws) => {
    clients.push(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const valid = validateMove(data.player, data.move);
            if (valid) {
                applyMove(data.player, data.move);
                broadcastGameState();
            } else {
                ws.send(JSON.stringify({ type: 'invalid' }));
            }
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });

    ws.send(JSON.stringify({ type: 'init', state: gameState }));
});

initializeGame();

console.log('WebSocket server started on ws://localhost:8080');
