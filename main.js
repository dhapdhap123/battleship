const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width=800;
canvas.height=1000;


const counting = document.getElementById("counting");
const scoreList = document.getElementById("score-list");

let backgroundImage, spaceshipImage, bulletImage, enemyImage, gameOverImage;
let spaceshipX = canvas.width/2 - 24;
let spaceshipY = canvas.height - 48;

let bulletList = [];
function Bullet(){
    this.init = function(){
        this.x = spaceshipX + 16;
        this.y = spaceshipY;
        this.exist = true;
        this.crash = false;

        bulletList.push(this);
    };
    this.update = function(){
        this.y -= 10;
        if (this.y <= 0){
            this.exist = false;
        }
        if (this.crash === true){
            this.exist = false;
        }
    }
}

let enemyList = [];
function Enemy(){
    this.init = function(){
        this.x = Math.floor(Math.random() * 752);
        this.y = 0;
        this.exist = true;
        this.crash = false;

        enemyList.push(this)
    };
    this.update = function(){
        this.y += 3;
        if (this.y >= 1050){
            this.exist = false;
            gameOver();
        }
        if (this.crash === true){
            this.exist = false;
            countingKill();
        }
    }
}

function loadImage(){
    backgroundImage = new Image();
    backgroundImage.src = "images/space1.png";

    spaceshipImage = new Image();
    spaceshipImage.src = "images/myBattleShip.png";

    bulletImage = new Image();
    bulletImage.src = "images/bullet.png";

    enemyImage = new Image();
    enemyImage.src = "images/enemyship.png";
    
    gameOverImage = new Image();
    gameOverImage.src = "images/gameOver.png";

    explosionImage = new Image();
    explosionImage.src = "images/explosion.png";
}

let keysDown = {};
function setupKeyboardListener(){
    document.addEventListener("keydown", function(event){
        keysDown[event.code] = true;
    });
    document.addEventListener("keyup", function(event){
        delete keysDown[event.code]
    });
    updateLocation();
}

function createBullet(event){
    if (event.code === 'Space'){
        let b = new Bullet();
        b.init();
    }
}

function createEnemy(){
    let e = new Enemy();
    e.init();
}

function updateLocation(){
    if ('ArrowLeft' in keysDown) {
        spaceshipX -= 5
    }
    if ('ArrowRight' in keysDown){
        spaceshipX += 5
    }
    if ('ArrowDown' in keysDown){
        spaceshipY += 5
    }
    if ('ArrowUp' in keysDown){
        spaceshipY -= 5
    }
    if (spaceshipX <= 0){
        spaceshipX = 0;
    }
    if (spaceshipX >= canvas.width - 48){
        spaceshipX = canvas.width - 48;
    }
    if (spaceshipY <= 0){
        spaceshipY = 0;
    }
    if (spaceshipY >= canvas.height - 48){
        spaceshipY = canvas.height - 48;
    }
    
    for(let i=0; i<enemyList.length;i++){
        enemyList[i].update();
    }

    for(let k=0; k<bulletList.length;k++){
        bulletList[k].update();
    }

    const idx = bulletList.findIndex(function(item) {return item.exist === false;})
    if (idx >-1) bulletList.splice(idx, 1);

    const kdx = enemyList.findIndex(function(item) {return item.exist === false;})
    if (kdx >-1) enemyList.splice(kdx, 1);

    const cdx = enemyList.findIndex(function(item) {return item.crush === true;})
    if (cdx >-1) enemyList.splice(cdx, 1);

    const ddx = enemyList.findIndex(function(item) {return item.crush === true;})
    if (ddx >-1) enemyList.splice(ddx, 1);
}

function deleter() {
    for (let i=0; i<enemyList.length; i++){ 
        for (let j=0; j<bulletList.length; j++){
            if ((enemyList[i].x < bulletList[j].x) && (bulletList[j].x < enemyList[i].x + 32) && (enemyList[i].y > bulletList[j].y) && (enemyList[i].y < bulletList[j].y + 48)){
                bulletList[j].crash = true;
                enemyList[i].crash = true;
            }
        }
    }
}

function render(){
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY);
    for(let i=0; i<bulletList.length; i++){
        ctx.drawImage(bulletImage, bulletList[i].x, bulletList[i].y);
    }
    for(let i=0; i<enemyList.length; i++){
        ctx.drawImage(enemyImage, enemyList[i].x, enemyList[i].y);
    }
}

function main(){
    updateLocation();
    render();
    requestAnimationFrame(main);
}

let score = 0;
function countingKill(){
    score++;
    counting.innerText = "☠️Kill : "+`${score}`+"☠️";
}

function gameOver(){
    const answer = confirm("Game over! Do you want to record?");
    if (answer){
        storeRecord();
        document.location.reload();
    } else {
        document.location.reload();
    }
}

let rec = [];
const SCORE_KEY = "score";
function storeRecord(){
    console.log(rec);
    
    rec.push(score);

    rec.sort(function(a, b){ return a - b; })
    rec.reverse();

    if (rec.length > 10){
        rec.splice(10, 1);
    }

    localStorage.setItem(SCORE_KEY, JSON.stringify(rec));
}

let listName = 0;
function showRec(parsedScore){
    const li = document.createElement("li");
    const span = document.createElement("span");
    li.id = listName + 1;
    if (li.id == 1){
        span.innerHTML = "<strong>🥇 " + `${parsedScore}` + " kill</strong>";
    } else if (li.id == 2){
        span.innerHTML = "<strong>🥈 " + `${parsedScore}` + " kill</strong>";
    } else if (li.id == 3){
        span.innerHTML = "<strong>🥉 " + `${parsedScore}` + " kill</strong>";
    } else {
        span.innerHTML = `${li.id}. ` + `${parsedScore}` + " kill";
    }
    li.appendChild(span);
    scoreList.appendChild(li);
    console.log(typeof parsedScore);
    console.log(li);
}

loadImage();
main();
setInterval(createEnemy, 2500);
setInterval(deleter, 50);
document.addEventListener("keydown", setupKeyboardListener);
document.addEventListener("keyup", createBullet);

const savedScore = localStorage.getItem(SCORE_KEY);
if (savedScore !== null){
    for (let i=0; i<JSON.parse(savedScore).length; i++){
        const parsedScore = JSON.parse(savedScore)[i];
        rec.push(parsedScore);
        listName = i;
        showRec(parsedScore);
    }
}