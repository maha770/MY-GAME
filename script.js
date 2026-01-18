const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const userScoreEl = document.getElementById('user-score');
const cpuScoreEl = document.getElementById('cpu-score');

let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let difficulty = 'hard'; // القيمة الافتراضية
let scores = { user: 0, cpu: 0 };

const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function setDifficulty(mode) {
    difficulty = mode;
    document.querySelectorAll('.difficulty-modes button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');
    resetGame();
}

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    if (board[index] !== "" || !gameActive) return;

    makeMove(index, "X");
    if (gameActive) {
        statusText.innerText = "الكمبيوتر يفكر...";
        setTimeout(cpuTurn, 600);
    }
}

function cpuTurn() {
    let moveIndex;

    if (difficulty === 'easy') {
        // عشوائي تماماً
        const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        moveIndex = available[Math.floor(Math.random() * available.length)];
    } 
    else if (difficulty === 'medium') {
        // يحاول الفوز أو الصد، وإذا لم يجد يلعب عشوائي
        moveIndex = findBestImmediateMove("O") || findBestImmediateMove("X");
        if (moveIndex === null) {
            const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
            moveIndex = available[Math.floor(Math.random() * available.length)];
        }
    } 
    else {
        // الذكاء الخارق (Minimax)
        moveIndex = minimax(board, "O").index;
    }

    if (moveIndex !== undefined && moveIndex !== null) {
        makeMove(moveIndex, "O");
    }
}

// للمستوى المتوسط: البحث عن حركة فوز أو صد فورية
function findBestImmediateMove(player) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const vals = [board[a], board[b], board[c]];
        if (vals.filter(v => v === player).length === 2 && vals.filter(v => v === "").length === 1) {
            return pattern[vals.indexOf("")];
        }
    }
    return null;
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());
    checkWinner(player);
}

function checkWinner(player) {
    const win = winPatterns.some(p => p.every(i => board[i] === player));

    if (win) {
        statusText.innerText = player === "X" ? "كفو! فزت! 🎉" : "هاردلك! الكمبيوتر فاز 🤖";
        player === "X" ? scores.user++ : scores.cpu++;
        updateUI(player === "X" ? 'theme-win-user' : 'theme-win-cpu');
        gameActive = false;
    } else if (!board.includes("")) {
        statusText.innerText = "تعادل! 🤝";
        gameActive = false;
    }
}

function updateUI(theme) {
    userScoreEl.innerText = scores.user;
    cpuScoreEl.innerText = scores.cpu;
    document.body.className = theme;
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    document.body.className = "";
    statusText.innerText = "دورك (X)";
    cells.forEach(c => { c.innerText = ""; c.className = "cell"; });
}

// خوارزمية Minimax للمستوى الصعب
function minimax(newBoard, player) {
    let avail = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (checkWinSimple(newBoard, "X")) return {score: -10};
    if (checkWinSimple(newBoard, "O")) return {score: 10};
    if (avail.length === 0) return {score: 0};

    let moves = [];
    for (let i = 0; i < avail.length; i++) {
        let move = {index: avail[i]};
        newBoard[avail[i]] = player;
        move.score = minimax(newBoard, player === "O" ? "X" : "O").score;
        newBoard[avail[i]] = "";
        moves.push(move);
    }
    
    let bestMove;
    if (player === "O") {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) { bestScore = moves[i].score; bestMove = i; }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) { bestScore = moves[i].score; bestMove = i; }
        }
    }
    return moves[bestMove];
}

function checkWinSimple(b, p) {
    return winPatterns.some(pattern => pattern.every(i => b[i] === p));
}

document.getElementById('restart').addEventListener('click', resetGame);
cells.forEach(c => c.addEventListener('click', handleCellClick));