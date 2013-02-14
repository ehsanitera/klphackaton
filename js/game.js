(function (env) {
    env.addEventListener("load", function() {
        var Q = Quintus().
                include('Sprites, Anim, Scenes, Input, 2D, Touch, UI').
                setup({maximize: true}).
                controls().
                touch();

        Q.animations('Mario', {
            run_right: {
                frames: [0,1,2,3,4,5,6,7],
                rate: 1/8
            },
            run_left: {
                frames: [8,9,10,12,13,14,15],
                rate: 1/8
            },
            stand_right: {
                frames: [0],
                loop: false
            },
            stand_left: {
                frames: [8],
                loop: false
            }
        });

        Q.Sprite.extend('Mario',{
            init: function(p) {
                this._super(p, {
                    sprite: 'Mario',
                    sheet: 'BabyMario'
                });
                this.add('2d, platformerControls, animation');
                this.on('hit.sprite', function(collision) {

                });
            },
            step: function(dt) {
                if (this.p.vx > 0) this.play('run_right')
                else if (this.p.vx < 0) this.play('run_left')
                else this.play('stand_'  + this.p.direction);
            }
        });

        Q.scene('level',function(stage){
            stage.collisionLayer(new Q.TileLayer({
                dataAsset: 'level.json',
                sheet: 'Tiles',
                tileW: 16,
                tileH: 16
            }));

            var hero = stage.insert(new Q.Mario({ x: 182, y: 150 }));
            stage.add('viewport').follow(hero);
        });

        Q.scene('hud', function(stage) {
            var score = 0;
            var pensionLbl = stage.insert(new Q.UI.Text({
                x: Q.width / 2,
                y:20,
                align: 'center',
                family: 'Monospace',
                size: 16,
                label: score.toString()
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
                    family: 'Monospace',
                    size: 24,
                    label: 'Velkommen til pensjonisttilværelsen!\nDu fikk '+ Q.state.get('score') +' i pensjon.'
                }))
        });

        Q.load('sprites.png, sprites.json, level.json', function() {
            Q.compileSheets('sprites.png', 'sprites.json');
            Q.state.reset({ score: 0 });

            Q.stageScene('level');
            Q.stageScene('hud', 1)
        });


    });
}(window));
