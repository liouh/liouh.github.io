// Instantiate module (one module per app). First parameter is
// the module name, second parameter is where you can pass in an array
// containing any additional configuration objects
var pigRunModule = angular.module('pigRun', ['ngRoute', 'ngCookies']);

//----------------------------------------
// ANGULAR ROUTING
//----------------------------------------

//use the config method to set up routing
pigRunModule.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        template: `<div ng-controller='homeController'>
            <div id='game-home'></div>
            <div class='menu'>
                <h2>Please choose your difficulty level to begin the game</h2>
                <button type='button' ng-click="begin('easy')">Easy</button>
                <button type='button' ng-click="begin('medium')">Medium</button>
                <button type='button' ng-click="begin('hard')">Hard</button>
            </div>
            <div class='glasspane-welcome'>
                <h2>Welcome to Pig Run!</h2>
            </div>
        </div>`
    })
    .when("/play", {
        template: `<div ng-controller='gameController'>
            <div id='game'></div>
            <div class='glasspane-game'>
                <h4 class='time' id='remaining-time'>Time: 60</h4>
                <button ng-click='exit()'>Exit</button>
                <h1 class='countDown' id='count-time'></h1>
                <img alt='ai_running_pig' id='ai-pig' src='./images/ai_pig_with_num.png'/>
                <img alt='running_pig' id='pig' src='./images/pig_with_num.png'/>
                <h2 class='win-lose' id='endMessage'></h2>
                <p id='word' class='hide'></p>
            </div>
            <div class='endGame' id='end'>
                <h2 id='wpm'></h2>
                <h2 id='accuracy'></h2>
                <div class='replay'>
                    <h2>Play Again?</h2>
                    <button type='button' ng-click='restart()'>Yes</button>
                    <button type='button' ng-click='exit()'>Return to menu</button>
                </div>
            </div>
        </div>`
    })
    .otherwise({
        redirectTo: "/"
    });
});

//----------------------------------------
// HOME CONTROLLER
//----------------------------------------
pigRunModule.controller("homeController", function($scope, $location, $cookieStore) {

    $scope.begin = function(level) {
        $cookieStore.put('level', level);
        $scope.level = level;
        $location.path("/play");
    };

});

//----------------------------------------
// GAME CONTROLLER
//----------------------------------------
pigRunModule.controller("gameController", function ($scope, $location, $route, $cookieStore) {
    //----------------------------------------
    // PARAGRAPH OPTIONS
    //----------------------------------------
    var option1 = "Scolding is something common in student life. Being a naughty boy, I am always scolded by my parents. But one day I was severely scolded by my English teacher. She in fact teaches well. But that day, I could not resist the temptation that an adventure of Nancy Drew offered. While she was teaching, I was completely engrossed in reading that book. Nancy Drew was caught in the trap laid by some smugglers and it was then when I felt a light tap on my bent head. The teacher had caught me red handed. She scolded me then and there and insulted me in front of the whole class. I was embarrassed. My cheeks burned being guilty conscious. When the class was over, I went to the teacher to apologize. When she saw that I had realized my mistake, she cooled down and then told me in a very kind manner how disheartening it was when she found any student not paying attention. I was genuinely sorry and promised to myself never to commit such a mistake again.";
    var option2 = "Studying is the main source of knowledge. Books are indeed never failing friends of man. For a mature mind, reading is the greatest source of pleasure and solace to distressed minds. The study of good books ennobles us and broadens our outlook. Therefore, the habit of reading should be cultivated. A student should never confine himself to his schoolbooks only. He should not miss the pleasure locked in the classics, poetry, drama, history, philosophy etc. We can derive benefit from other's experiences with the help of books. The various sufferings, endurance and joy described in books enable us to have a closer look at human life. They also inspire us to face the hardships of life courageously. Nowadays there are innumerable books and time is scarce. So we should read only the best and the greatest among them. With the help of books we shall be able to make our thinking mature and our life more meaningful and worthwhile.";
    var option3 = "Recently, an exhibition 'Building A New India' was held in the capital. It was organized by the Ministry of Information and Broadcasting, Government of India. The exhibition was set up in the Triveni Kala Sangam. The chief exhibits were photographs, novels, some sculptures by Indian modern artists presenting Indian cultural inheritance. First of all, I visited the general section of the exhibition where different charts and photographs depicting India's development in various fields were set. Most impressive photographs among these were those showing India's nuclear development. The second section dealt with India's magnificent historical background. I was fascinated by the pictures of Mohanjodaro excavation. Then I saw the most beautiful and colorful section of the exhibition i.e. the cultural section. It consisted of paintings, sculptures, photographs etc. The Rajasthani and Gujarati paintings were very colourful and attractive. This exhibition, inaugurated by the Prime Minister, lasted for a week. It proved to be of great educational value. It brushed up my knowledge about India as my motherland. It enhanced my respect for my great country, India. I would very much appreciate if the Indian government organized some more such exhibitions.";
    var option4 = "A teacher is called builder of the nation. The profession of teaching needs men and women with qualities of head and heart. There are many teachers in our school and a large number of teachers among them are highly qualified. I have great respect for all of them. Yet I have a special liking for Miss Y. Miss Y is a woman of great principles. She is jewel among all the teachers. Almost all the students respect her. She teaches us English. She is quite at home in this subject. She takes keen interest in teaching students. Simple living and high thinking is her motto. She is a woman of sweet temper and is always ready to help in difficulties. She treats us like her own brothers and sisters. She is an ideal teacher. It is these qualities of head and heart that have endeared Miss Y to the students and teachers alike. She is an ideal teacher in real sense of the word. She is the real model to emulate. May she live as long as there is sweet fragrance in the flowers?";
    var option5 = "A hare one day ridiculed the short feet and slow pace of the Tortoise, who replied, laughing: 'Though you be swift as the wind, I will beat you in a race.' The Hare, believing her assertion to be simply impossible, assented to the proposal; and they agreed that the Fox should choose the course and fix the goal. On the day appointed for the race the two started together. The Tortoise never for a moment stopped, but went on with a slow but steady pace straight to the end of the course. The Hare, lying down by the wayside, fell fast asleep. At last waking up, and moving as fast as he could, he saw the Tortoise had reached the goal, and was comfortably dozing after her fatigue. Thus, the moral of the story is: Slow but steady wins the race.";
    var choices = [option1, option2, option3, option4, option5];
    var para;

    //----------------------------------------
    // SET VARIABLES
    //----------------------------------------
    var seconds = 3;
    var gameTimer = 60;
    var gameLength = 60;
    var userWords = [];
    var userErrors = 0;

    //----------------------------------------
    // GROSS WPM & ACCURACY CALCULATION
    // (NO ERROR PENALTY)
    //----------------------------------------
    function calculateGross(charactersTyped) {
        //calculate gross WPM
        var grossWpm = Math.round(((charactersTyped.length / 5) / gameLength) * 60);
        var accuracy = Math.round(((charactersTyped.length - userErrors) / charactersTyped.length) * 100);
        var wpm;
        var acc;
        //determine if player beat the AI & set messages accordingly
        var pigRight = document.getElementById('pig').getBoundingClientRect().right;
        var aiPigRight = document.getElementById('ai-pig').getBoundingClientRect().right;
        if(pigRight >= aiPigRight) {
            document.getElementById('endMessage').innerHTML = 'Congratulations!';
            wpm = "<h2>Your WPM was: <span class='score'>" + grossWpm + "</span></h2>";
        }
        else {
            document.getElementById('endMessage').innerHTML = 'You lost!';
            document.getElementById('endMessage').style.color = '#FF0000';
            wpm = "<h2>Your WPM was: <span class='score-lost'>" + grossWpm + "</span></h2>";
        }
        //do not compute accuracy if WPM was 0
        if(grossWpm === 0) {
            acc = "<h2>Your accuracy was: <span class='score-lost'>not computed</span></h2>";
        }
        else {
            if(accuracy >= 0 && pigRight >= aiPigRight) {
                acc = "<h2>Your accuracy was: <span class='score'>" + accuracy + "%</span></h2>";
            }
            else if(accuracy >= 0 && pigRight < aiPigRight) {
                acc = "<h2>Your accuracy was: <span class='score-lost'>" + accuracy + "%</span></h2>";
            }
        }
        document.getElementById('accuracy').innerHTML = acc;
        document.getElementById('endMessage').className = 'win-lose';
        document.getElementById('wpm').innerHTML = wpm;
        document.getElementById('accuracy').innerHTML = acc;
        document.getElementById('end').className = "";
    }

    //----------------------------------------
    // MOVEMENT FUNCTIONS
    //----------------------------------------
    function startBackground() {
        var x = 0;
        var gameBackground = document.getElementById('game');
        function move() {
            switch($cookieStore.get('level')) {
                case 'easy':
                    x--;
                    break;
                case 'medium':
                    x -= 2;
                    break;
                case 'hard':
                    x -= 3;
                    break;
            }
            gameBackground.style.backgroundPosition = x + "px 0px";
            if(gameTimer >= 0) {
                requestAnimationFrame(move);
            }
            else {
                cancelAnimationFrame(move);
            }
        }
        requestAnimationFrame(move);
    }

    function movePigForwards() {
        var interval = 6;
        var pig = document.getElementById('pig');
        var x = pig.offsetLeft;
        var pigRightPos = pig.getBoundingClientRect().right;
        var y = document.getElementById('game').getBoundingClientRect();
        var gameRight = y.right;
        if(pigRightPos + interval < gameRight && gameTimer > -1) {
            x += interval;
            pig.style.left = x + "px";
        }
    }

    function movePigBackwards() {
        var backInterval;
        //easy is about 35 WPM, medium is around 65 WPM, hard is around 95 WPM
        switch($cookieStore.get('level')) {
            case 'easy':
                backInterval = 1;
                break;
            case 'medium':
                backInterval = 4;
                break;
            case 'hard':
                backInterval = 7;
                break;
        }
        var pig = document.getElementById('pig');
        var x = pig.offsetLeft;
        if(x - backInterval > 0 && gameTimer > -1) {
            x -= backInterval;
            pig.style.left = x + "px";
            $scope.backwards = setTimeout(movePigBackwards, 200);
        }
        else if(gameTimer > -1) {
            $scope.backwards = setTimeout(movePigBackwards, 200);
        }
    }

    function moveAIPigForwards() {
        var interval = 1;
        var aiPig = document.getElementById('ai-pig');
        var x = aiPig.offsetLeft;
        var aiPigRightPos = aiPig.getBoundingClientRect().right;
        var y = document.getElementById('game').getBoundingClientRect();
        var gameRight = y.right;
        if(aiPigRightPos + interval < gameRight - 20 && gameTimer > -1) {
            x += interval;
            aiPig.style.left = x + "px";
            $scope.aiPig = setTimeout(moveAIPigForwards, 125);
        }
    }

    //----------------------------------------
    // GAME TIMER
    //----------------------------------------
    function testDecrement() {
        if(gameTimer > 10) {
            document.getElementById('remaining-time').innerHTML = "Time: " + gameTimer;
            gameTimer--;
            $scope.gameTimer = setTimeout(testDecrement, 1000);
        }
        else if(gameTimer >= 0) {
            document.getElementById('remaining-time').innerHTML = "Time: " + gameTimer;
            document.getElementById('remaining-time').className = "time time-out";
            gameTimer--;
            if(gameTimer === 0 || gameTimer < 0) {
                document.getElementById('word').className = 'hide';
                var charactersTyped = userWords;
                document.getElementById('pig').src = './images/pig_with_num.png';
                document.getElementById('ai-pig').src = './images/ai_pig_with_num.png';
                document.getElementById('pig').className = '';
                document.getElementById('ai-pig').className = '';
                calculateGross(charactersTyped);
                $scope.gameTimer = setTimeout(testDecrement, 0);
            }
            else {
                $scope.gameTimer = setTimeout(testDecrement, 1000);
            }
        }
    }

    //----------------------------------------
    // TRACK KEYS PRESSED
    //----------------------------------------
    function trackTest() {
        var oldWpm;
        var stringWord = para.split("");
        document.getElementById('word').innerHTML = para;
        var index = 0;
        var newWord = '';
        //prevent the delete key from going back one page in the browser
        document.onkeydown = function(e) {
            if(e.which === 8) {
                e.preventDefault();
            }
        };
        document.onkeypress = function(e) {
            var keyCode = e.keyCode;
            var keyString = String.fromCharCode(keyCode);
            //stop the game if the player types so fast he/she gets to the end of the paragraph
            if(index === stringWord.length - 1) {
                gameLength = gameLength - gameTimer;
                gameTimer = 0;

            }
            if(keyString === stringWord[index]) {
                if(userWords.length >= 35) {
                    stringWord.shift();
                    index--;
                }
                for(var i = 0; i < stringWord.length; i++) {
                    if(i <= index) {
                        newWord += "<span class='correct'>" + stringWord[i] + "</span>";
                    }
                    else {
                        if(i === index + 1) {
                            newWord += "<span class='next'>" + stringWord[i] + "</span>";
                        }
                        if(i < stringWord.length - 1) {
                            newWord += stringWord[i + 1];
                        }
                    }
                }
                document.getElementById('word').innerHTML = newWord;
                userWords.push(stringWord[index]);
                //calculate increment WPM to adjust the position of the pig
                if(userWords.length > 5) {
                    var incrementWpm = ((userWords.length / 5) / (60 - gameTimer)) * 60;
                }
                else {
                    movePigForwards();
                }
                if(incrementWpm > 0) {
                    //move the position of the pig if the current WPM is greater
                    //than the wprevious WPM
                    if(oldWpm <= incrementWpm) {
                        movePigForwards();
                    }
                    oldWpm = incrementWpm;
                }
                index++;
                newWord = '';
            }
            else {
                userErrors++;
                for(var j = 0; j < stringWord.length; j++) {
                    if(j < index) {
                        newWord += "<span class='correct'>" + stringWord[j] + "</span>";
                    }
                    else if(j === index) {
                        newWord += "<span class='incorrect'>" + stringWord[j] + "</span>";
                    }
                    else {
                        newWord += stringWord[j];
                    }
                }
                document.getElementById('word').innerHTML = newWord;
                newWord = '';
            }

        };
    }

    //----------------------------------------
    // COUNTDOWN TO GAME START
    //----------------------------------------
    function decrement() {
        //select a random paragraph
        var randNum = Math.floor(Math.random() * choices.length);
        para = choices[randNum];
        if(seconds > 0) {
            document.getElementById('count-time').innerHTML = seconds;
            seconds--;
            $scope.countDown = setTimeout(decrement, 1000);
        }
        else if(seconds === 0) {
            document.getElementById('count-time').innerHTML = "Go!";
            seconds--;
            $scope.countDown = setTimeout(decrement, 1000);
        }
        else {
            document.getElementById('word').className = '';
            document.getElementById('pig').src = "./images/running_with_num.gif";
            document.getElementById('ai-pig').src = "./images/ai_running_with_num.gif";
            document.getElementById('pig').className = "animate-pig";
            document.getElementById('ai-pig').className = "animate-ai";
            document.getElementById('count-time').innerHTML = '';
            trackTest();
            movePigBackwards();
            moveAIPigForwards();
            startBackground();
            $scope.countDown = setTimeout(testDecrement, 1000);
        }
    }

    //as soon as the game controller loads, begin the countdown to start
    setTimeout(decrement(), 0);

    //----------------------------------------
    // SCOPE METHODS
    //----------------------------------------
    $scope.exit = function() {
        clearTimeout($scope.countDown);
        clearTimeout($scope.gameTimer);
        clearTimeout($scope.backwards);
        clearTimeout($scope.aiPig);
        $location.path("/");
    };

    $scope.restart = function() {
        clearTimeout($scope.countDown);
        clearTimeout($scope.gameTimer);
        clearTimeout($scope.backwards);
        clearTimeout($scope.aiPig);
        $route.reload();
    };

});
