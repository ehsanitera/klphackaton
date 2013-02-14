(function (env) {
    env.addEventListener("load", function () {
    	var score = 0;
        var Q = Quintus().
            include('Sprites, Anim, Scenes, Input, 2D, Touch, UI').
            setup({maximize: true}).
            controls(true).
            touch();

        var interval = setInterval(function() {
            score = score+1;
            Q.stageScene('hud', 1);
            if(score === 120) {
                Q.stageScene('endGame',1);
                Q.stage(0).pause();
                clearInterval(interval);
            }
        },1000);

        Q.animations('Mario', {
            run_right: {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
                rate: 1 / 8
            },
            run_left: {
                frames: [8, 9, 10, 12, 13, 14, 15],
                rate: 1 / 8
            },
            stand_right: {
                frames: [0],
                loop: false
            },
            stand_left: {
                frames: [8],
                loop: false
            },
            run_up: {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
                rate: 1 / 8
            },
            run_down: {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
                rate: 1 / 8
            }

        });
        var lastDir = "right";
        Q.Sprite.extend('Mario', {
            init: function (p) {
                this._super(p, {
                    sprite: 'Mario',
                    sheet: 'BabyMario',
                    gravity: 0,
                    stepDistance: 18
                });
                this.add('2d, stepControls, animation');
                this.on('hit.sprite', function (collision) {

                });
            },
            step: function (dt) {
                if (this.p.stepping) {
                    if(this.p.origX < this.p.destX){
                        this.play("run_right");
                        lastDir = "right";
                    }
                    else if(this.p.origX > this.p.destX){
                        this.play("run_left");
                        lastDir="left";
                    }
                    if(this.p.origY !== this.p.destY){
                        this.play("run_" + lastDir);
                    }
                } else{
                    this.play("stand_" + lastDir);

                }

            }
        });
        
        Q.Sprite.extend('Question', {
            init: function(p) {
                this._super(p, {
                    sprite: 'Question',
                    sheet: 'Question',
                    gravity: 0
                });
                this.add('2d');
                this.on('hit.sprite', function(collision) {
                    if (collision.obj.isA('Mario')) {
	                    this.destroy();	
                    	Q.stageScene('showQuestion', 1, {
                    		questionText: "Hva heter onkelen til Donald Duck?", 
                    		alternativeA: "Onkel Skrue", 
                    		alternativeB: "Fetter Anton", 
                    		correctAnswer: "A"
                    	});
                    }
                });
            }
        });
        
        
		Q.scene('showQuestion', function(stage) {
			var container = stage.insert(new Q.UI.Container({
				x : Q.width / 2,
				y : Q.height / 2,
				fill : "rgba(0,0,0,0.5)"
			}));
			
			var question = container.insert(new Q.UI.Text({
				x : 0,
				y : 0,
				color: "white",
				size: 16,
				label : stage.options.questionText
			}));
			
			var buttonA = container.insert(new Q.UI.Button({
				x : 0,
				y : question.p.h + 20,
				fontColor: "white",
				font: "800 16px arial",
				fill : "#CCCCCC",
				label : stage.options.alternativeA
			}));
			
			var buttonB = container.insert(new Q.UI.Button({
				x : 0,
				y : question.p.h + 10 + buttonA.p.h + 20,
				fontColor: "white",
				font: "800 16px arial",
				fill : "#CCCCCC",
				label : stage.options.alternativeB
			}));
			
			buttonA.on("click", function() {
				console.log("buttonA clicked, correct answer", stage.options.correctAnswer);
			});
			
			buttonB.on("click", function() {
				console.log("buttonB clicked, correct answer", stage.options.correctAnswer);
			});

			container.fit(20);
		});        

        Q.scene('level', function (stage) {
            stage.collisionLayer(new Q.TileLayer({
                dataAsset: 'level.json',
                sheet: 'Tiles',
                tileW: 16,
                tileH: 16
            }));
            stage.insert(new Q.Question({x: 248, y:380 }));
            stage.insert(new Q.Question({x: 198, y:190 }));
            stage.insert(new Q.Question({x: 248, y:470 }));
            var hero = stage.insert(new Q.Mario({ x: 10, y: 620 }));
            stage.add('viewport').follow(hero);
        });

        Q.scene('hud', function(stage) {
            var pensionLbl = stage.insert(new Q.UI.Text({
                x: Q.width / 2,
                y:20,
                align: 'center',
                family: 'Monospace',
                size: 16,
                label: score.toString()
            }));
        });

        Q.scene('endGame', function(stage) {
            stage.insert(
                new Q.UI.Text({
                    x:Q.width/2,
                    y:Q.height/2,
                    family: 'Monospace',
                    size: 24,
                    label: 'Dun dun dun...Game over!'
                }))
        });

        Q.load('sprites.png, sprites.json, level.json', function () {
            Q.compileSheets('sprites.png', 'sprites.json');
            Q.state.reset({ score: 0 });

            Q.stageScene('level');
            Q.stageScene('hud', 1)
        });


    });
}(window));
