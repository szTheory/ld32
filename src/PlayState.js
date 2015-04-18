var PlayState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function PlayState() {
        State.call(this);
        this.assets = [
            { name: 'assets/gfx/enemy1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/player.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blockage1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/not-road1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/not-road2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-in1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-in2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-out1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-out2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-in1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-in2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-out1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-out2.png', type: 'img', callback: pixelize },
        ]
    };

    PlayState.prototype = Object.create(State.prototype);

    PlayState.prototype.getAssets = function() {
        return this.assets;
    };

    PlayState.prototype.onStart = function(game) {
        var self = this;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 32,
            fgColor: 'white',
        });
        this.courseTranslation = new THREE.Object3D();
        this.scene2d.add(this.courseTranslation);

        this.player = new Player(game);
        this.player.addTo(this.courseTranslation);
        this.enemy = new Enemy(game, this.player);
        this.enemy.addTo(this.courseTranslation);

        this.grid = new Grid(game, 9, this.courseTranslation);

        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;

        if (!game.songStarted) {
            //game.loader.get("audio/ld31").loop(true).play();
            game.songStarted = true;
        }
    };

    PlayState.prototype.calculateScore = function() {
        return 100;
    }

    PlayState.prototype.updateScore = function(dt) {
        var score = this.calculateScore()
        // attach properties like a jerk
        if( ( !this.scoreObject ) || (this.scoreObject && this.scoreObject.score != score ) ) {
            if(this.scoreObject) {
                this.scene2d.remove(this.scoreObject);
            }
            this.scoreObject = TextRenderer.render(this.font, "Score: " + score );
            this.scoreObject.score = score;
            this.scoreObject.position.x = 0; // this.cx*2;
            this.scoreObject.position.y = 0; // this.cy*2;
            this.scoreObject.position.z = 4;
            this.scene2d.add(this.scoreObject);
        }
        if( !this.speedo || this.speedo.speed != this.player.velocity.y ) {
            if(this.speedo){
                this.scene2d.remove(this.speedo);
            }
            var speed = this.player.velocity.y;
            this.speedo = TextRenderer.render(this.font, "Speed: " + speed + "/" + this.player.maxY);
            this.speedo.speed = speed;
            this.speedo.position.x = 0;
            this.speedo.position.y = 100;
            this.speedo.position.z = 4;
            this.scene2d.add(this.speedo);
        }
    }

    PlayState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);
        var self = this;
        var step = this.player.velocity.y * dt / 1000;
        this.courseTranslation.position.y += step;

        this.player.update(game, dt);
        this.enemy.update(game, dt);
        this.grid.update(game, dt, step);
        this.updateScore(dt);
    }

    PlayState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    PlayState.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
    };

    PlayState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return PlayState;
}).call(this);
