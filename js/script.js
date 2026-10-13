document.addEventListener('DOMContentLoaded', () =>{//seta de funcão
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const startModel = document.getElementById('start-model');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player- input');
})

/*document.addEventListener('click', () => {
    alert("Voce clicou na pagina!")
}) funciona para dar um aviso na tela*/

    const startModel = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');
//Variaveis de estado
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;
//Recuperação do ultimo nome de usuario utilizado
    const salvedName = localStorage.getItem('mario_jump_player');
    if (salvedName && playerInput) {
        playerInput.value = salvedName;
    }

//Inicio funções
    function startGame(){
        //Limpei loops anteriores se existirem
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
//Resetei as posições visuais
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador' // mostra jogador caso ele não coloque o nome
//Ativa as animações CSS do jogo
        gameBoard.classList.add('running');

        scoreLoop = setInterval(() => {
            if(isPlaying){
                score += 1;
                scoreDisplay.textContent = score;
            }
        }, 100);//A cada 100 milisegundos ele vai ganhar um pontos
//Loop de colisão
        gameLoop = setInterval(checkCollision, 10); //A cada 10 milisegundos ocorre uma verificação se o mario encostou no cano
    }
//Resetar os estilos e posições do Mario e do Cano
    function resetElements(){
//Reseta o cano
        pipe.style.animation = '';
        pipe.style.left = '';

//Reseta o mario
        mario.src = '../assets/mario.gif'; //Saiu da pasta JS e entrou na assets
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove('jump');
        if (jumpTip){
            jumpTip.style.opacity = '1';
        }

    }
//Function serve para que não tenha que recarregar a pagina para ele recaregar

//Execute o pulo do Mario
    function jump(){
        if (!isPlaying) //! significa diferente
        if (mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if(jumpTip){
            jumpTip.style.opacity = '0';
        }
        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
    }
//Verificar a colisão entre o Mario e o Cano
    function checkCollision(){
        if (!isPlaying) return;

        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.repeat('px', '');
//Tolerancia de colisão: quando o cano esta na faixa de contato com o mario
        if(pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
            triggerGameOver(pipePosition, marioPosition);
        }
    }

// Tratar o GameOver
    function triggerGameOver(pipePosition, marioPosition){
        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
//Remove a classe running para as animações
        gameBoard.classList.remove('running')
//Congela o cano na posição exata da colisão
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
//Congela o mario na altura exata e muda para a imagem de game over
    mario.style.animation = 'none';
    mario.style.bottom = `${marioPosition}px`;
    mario.src = '../assets/game-over.png';
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
//Atualização do modal de Game Over
    finalScoreValue.textContent = score;
    saveStatusMsg.textContent = 'Salvando pontuação no banco...';
    saveStatusMsg.style.color = '#ffcc00';

    gameoverModal.classList.add('active');
//Salva a pontuação no banco, com a função criada chamada saveScore
    saveScore(currentPlayer, score);
    }

    function saveScore(playerName, finalScore){
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                    'Content-Type': 'aplication/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success'){
                salveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if(data.ranking){
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else {
                saveStatusMsg.textContent = (data.message || ' Erro ao registrar.');
                salveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição', err);
            saveStatusMsg.textContent = 'Erro ao conectar ao servidor.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }
//Busca no ranking atualizado do banco
    function fetchRanking(){
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.ranking){
                renderRanking(data.ranking);
            }
        })
        .catch(err => console.error('Erro ao buscar o ranking', err));
    }
// Vamos atualiazar a tabela do ranking no HTML
    function renderRanking(list, highlightName = null, highlightScore = null){
        if(!rankingBody) return;
        rankingBody.innerHTML = '';
        if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell"> Nenhuma pontuação gravada ainda. </td></tr>`;
            return;
        }
        let highlightted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if(!highlightted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore){
                tr.classList.add('highligth-current');
                highlightted = true;
            }
            let medal = `$(index + 1)°`;
            if (index === 0) medal = '1°';
            else if (index === 1) medal = '2°';
            else if (index === 2) medal = '3°';

            tr, innerHTML = `
            <td class="ranking-pos">${medal}</td>
            <td><strong>${escapeHTML(item.nome)}</strong></td>
            <td>${parseInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        })
    }

    function escapeHTML(str){
        if(!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            // .replace(/'/g, '&#039;')
    }
//Eventos de controle e interface do jogo
//INICIAR O JOGO (FORMULARIO)
        startForm.addEventListener('submit', (e) => {
            e.preventDefault(); //Impede o recarregamento da pagina

            const nameValue = playerInput.value.trim();
            if(!nameValue) {
                playerInput.focus();
                return;
            }
            currentPlayer = nameValue;
            localStorage.setItem('mario_jump_player', currentPlayer);
            //Fecha a tela e começa o jogo depois de preencher os dados
            startModel.classList.remove('active');
            startGame();
        });
//Botão ver ranking
