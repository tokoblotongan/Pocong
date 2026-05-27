class SceneGame extends Phaser.Scene {
    constructor() {
        super('SceneGame');
    }

    preload() {
        // Background Jawa
        this.load.image('bg', 'assets/images/background-candi.jpg');
        this.load.image('ground', 'assets/images/tanah-jawa.png');
        
        // Karakter
        this.load.spritesheet('pocong', 'assets/images/pocong.png', { frameWidth: 64, frameHeight: 64 });
        
        // Papan Nisan (ganti pipa)
        this.load.image('nisan', 'assets/images/papan_nisan.png');
        
        // Collectible
        this.load.image('jamuan', 'assets/images/klepon.png');
        
        // Sound (opsional)
        this.load.audio('bgm', 'assets/audio/gamelan-loop.mp3');
    }

    create() {
        this.add.image(400, 300, 'bg');
        
        // Platform
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();
        
        // Player Pocong
        this.player = this.physics.add.sprite(100, 400, 'pocong');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        
        this.physics.add.collider(this.player, this.platforms);
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Animasi Pocong (lompat khas)
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('pocong', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-550); // lompat tinggi khas pocong
        }
    }
}
