(function (env) {
    env.addEventListener("load", function () {
        var score = 0;
        var Q = Quintus({ audioSupported: [ 'mp3', 'wav' ] }).
            include('Audio, Sprites, Anim, Scenes, Input, 2D, Touch, UI').
            setup({maximize: true}).
            controls(true).
            enableSound();

        var interval = setInterval(function () {
            score = score + 1;
            Q.state.inc("score", 1);
            if (score === 120) {
                Q.stageScene('endGame', 1);
                Q.stage(0).pause();
                clearInterval(interval);
            }
        }, 1000);

        Q.input.joypadControls();

        Q.animations('OlaNordmann', {
            run_up: {
                frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                rate: 1 / 15
            },
            run_right: {
                frames: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                rate: 1 / 15
            },
            run_left: {
                frames: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
                rate: 1 / 15
            },
            run_down: {
                frames: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                rate: 1 / 15
            },
            standing: {
                frames: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
                rate: 1 / 15
            }


        });
        Q.Sprite.extend('OlaNordmann', {
            init: function (p) {
                this._super(p, {
                    sprite: 'OlaNordmann',
                    sheet: 'OlaNordmann',
                    gravity: 0,
                    stepDistance: 16
                });
                this.add('2d, stepControls, animation');
            },
            step: function (dt) {
                if (this.p.stepping) {
                    if (this.p.origX < this.p.destX) {
                        this.play("run_right");
                    }
                    else if (this.p.origX > this.p.destX) {
                        this.play("run_left");
                    }
                    if (this.p.origY > this.p.destY) {
                        this.play("run_up");
                    } else if (this.p.origY < this.p.destY) {
                        this.play("run_down");
                    }
                } else {
                    this.play("standing");

                }

            }
        });

        Q.Sprite.extend('Question', {
            init: function (p) {
                this._super(p, {
                    sprite: 'Question',
                    sheet: 'Question',
                    gravity: 0
                });
                this.add('2d');
                this.on('hit.sprite', function (collision) {
                    if (collision.obj.isA('OlaNordmann')) {

                        Q.stageScene('showQuestion', 1, {
                            questionText: "Hva heter onkelen til Donald Duck?",
                            alternativeA: "Onkel Skrue",
                            alternativeB: "Fetter Anton",
                            correctAnswer: "A",
                            q: this
                        });
                    }
                });
            }
        });
        
        Q.Sprite.extend('Finish', {
            init: function(p) {
                this._super(p, {
                    sprite: 'Finish',
                    sheet: 'Finish',
                    gravity: 0
                });
                this.add('2d');
                this.on('hit.sprite', function(collision) {
                    if (collision.obj.isA('OlaNordmann')) {
	                    this.destroy();
	                    collision.obj.p.gravity = -1;
	                    Q.stageScene('endGame',1);
                    }
                });
            }
        });


        Q.scene('showQuestion', function (stage) {
        	Q.play('question.mp3');
            var container = stage.insert(new Q.UI.Container({
                x: Q.width / 2,
                y: Q.height / 2,
                fill: "rgba(0,0,0,0.6)"
            }));

            var question = container.insert(new Q.UI.Text({
                x: 0,
                y: 0,
                color: "white",
                size: 16,
                label: stage.options.questionText
            }));

            var buttonA = container.insert(new Q.UI.Button({
                x: 0,
                y: question.p.h + 20,
                fontColor: "white",
                font: "800 16px arial",
                fill: "#CCCCCC",
                label: stage.options.alternativeA
            }));

            var buttonB = container.insert(new Q.UI.Button({
                x: 0,
                y: question.p.h + 10 + buttonA.p.h + 20,
                fontColor: "white",
                font: "800 16px arial",
                fill: "#CCCCCC",
                label: stage.options.alternativeB
            }));

            buttonA.on("click", function () {
                console.log("buttonA clicked, correct answer", stage.options.correctAnswer);
                stage.options.q.destroy();
            });

            buttonB.on("click", function () {
                console.log("buttonB clicked, correct answer", stage.options.correctAnswer);
                stage.options.q.destroy();
            });

            container.fit(20);
        });

        var findEmptyTiles = function (tiles) {
            var found = [];
            for (var i = 0; i < tiles.length; i++) {
                for (var j = 0; j < tiles[i].length; j++) {
                    if (!tiles[i][j]) {
                        found.push({y: (i * 16), x: (j * 16)})
                    }
                }
            }
            return found;
        }


        Q.scene('level', function (stage) {
            var tileLayer = new Q.TileLayer({
                dataAsset: 'level.json',
                sheet: 'Tiles',
                tileW: 16,
                tileH: 16
            });
            var freeAreas = findEmptyTiles(tileLayer.p.tiles);
            stage.collisionLayer(tileLayer);
            var numQs = 10;
            for (var q = 0; q < numQs; q++) {
                var pos = freeAreas[Math.floor((Math.random() * freeAreas.length - 1) + 1)];
                stage.insert(new Q.Question(pos));
            }
            stage.insert(new Q.Finish({x: 920, y:360 }));
            var hero = stage.insert(new Q.OlaNordmann({ x: 30, y: 820 }));
            stage.add('viewport').follow(hero);
        });

        Q.scene('hud', function(stage) {
            var pensionLbl = stage.insert(new Q.UI.Text({
                x: Q.width / 2,
                y:30,
                align: 'center',
                family: 'Helvetica',
                size: 24,
                color: 'white',
                label: 'Time: ' +score.toString()
            }));
            Q.state.on('change.score', function() {
                pensionLbl.p.label = Q.state.get('score').toString();
            })
        });

        Q.scene('endGame', function(stage) {
            stage.insert(
                new Q.UI.Text({
                    x:Q.width/2,
                    y:Q.height/2,
                    family: 'Helvetica',
                    size: 24,
                    color: 'white',
                    label: 'Game Over!'
                }))
                Q.play('game_over.mp3');
        });

        Q.load('question.mp3, start_sound.mp3, game_over.mp3, sprites.png, sprites.json, level.json', function () {
            Q.compileSheets('sprites.png', 'sprites.json');
            Q.state.reset({ score: 0 });
            Q.play('start_sound.mp3');
            Q.stageScene('level');
            Q.stageScene('hud', 1)
        });

        var questions = [
            {
                questionText: "Hva heter onkelen til Donald Duck?",
                alternativeA: "Onkel Skrue",
                alternativeB: "Fetter Anton",
                correctAnswer: "A"
            },
            {
                questionText: "Hva heter onkelen til Donald Duck?",
                alternativeA: "Onkel Skrue",
                alternativeB: "Fetter Anton",
                correctAnswer: "A"
            },
            {
                questionText: "Hva heter onkelen til Donald Duck?",
                alternativeA: "Onkel Skrue",
                alternativeB: "Fetter Anton",
                correctAnswer: "A"
            },
            {
                questionText: "Hva heter onkelen til Donald Duck?",
                alternativeA: "Onkel Skrue",
                alternativeB: "Fetter Anton",
                correctAnswer: "A"
            },
            {
                questionText: "Hva heter onkelen til Donald Duck?",
                alternativeA: "Onkel Skrue",
                alternativeB: "Fetter Anton",
                correctAnswer: "A"
            }
        ];
    });
}
    (window)
    )
;
