// CHARACTERS

class Effect {
  constructor({ delay = 0, duration = 1 }) {
    this.delay = delay;
    this.duration = duration;
  }
}

class ArmorEffect extends Effect {
  reduceDmg = 2;

  constructor({ delay = 0, duration = 1 } = {}) {
    super({ delay, duration });
  }
}

class ShieldEffect extends Effect {
  constructor({ delay = 1, duration = 1 } = {}) {
    super({ delay, duration });
  }
}

class Character {
  static All = [];

  status = "playing";

  characterName = "Paysan";

  effects = [];

  constructor(hp, dmg, mana, spellManaCost = 0) {
    this.hp = hp;
    this.dmg = dmg;
    this.mana = mana;
    this.spellManaCost = spellManaCost;

    Character.All.push(this);
  }

  hasEnoughMana() {
    return this.spellManaCost < this.mana;
  }

  addEffect(effect) {
    this.effects.push(effect);
  }

  takeDamage(damagePoint) {
    const hasShield = !!this.effects.find((effect) => {
      return effect instanceof ShieldEffect && effect.delay === 0;
    });

    if (hasShield) {
      damagePoint = 0;
      console.log(
        "Ton personnage a un bouclier! Il ne prendra pas de dégât ce tour-ci!"
      );
    } else {
      this.effects.forEach((effect) => {
        if (effect instanceof ArmorEffect && effect.delay === 0) {
          damagePoint = damagePoint - effect.reduceDmg;
        }
      });
    }

    if (damagePoint < 0) {
      damagePoint = 0;
    }

    this.hp = this.hp - damagePoint;

    console.log("Voir l'état de la victime:");
    console.log(this);

    if (this.hp <= 0) {
      this.hp = 0;
      this.status = "looser";
    }

    return this.hp;
  }

  dealDamage(victim) {
    victim.takeDamage(this.dmg);
  }

  isAlive = () => this.status === "playing";

  generateText = () => {
    return `
------------------- ${
      this.isAlive() ? "En vie, Champion !" : "LLOOOOOOOOOSSSEEEEEEERRR"
    } -------------------<br />
Classe : ${this.characterName}<br/>
Caractéristiques :<br />
- Points de Dégats : ${this.dmg}<br />
- Points de vies restants : ${this.hp}<br />
- Points de mana restants : ${this.mana}<br />

Super attaque : ${this.superAttackDescr || "-"}
`;
  };
}

class Fighter extends Character {
  characterName = "Guerrier";

  superAttackDescr =
    "Super attaque: 5 points de dommage à la victime + 2 points de dégât en moins à chaque attaque d'un adversaire (sur ce tour) - perte de 20 mana.";

  constructor(hp = 12, dmg = 4, mana = 40, spellManaCost = 20) {
    super(hp, dmg, mana);
  }

  manaAttack(victim) {
    victim.takeDamage(5);

    this.mana = this.mana - this.spellManaCost;

    this.addEffect(new ArmorEffect());
    //Jusqu'au prochain tour, chaque coup reçu lui infligera 2 dégâts de moins.
  }
}

class Paladin extends Character {
  static maxHp = 16;

  characterName = "Paladin";

  constructor(hp = Paladin.maxHp, dmg = 3, mana = 160, spellManaCost = 40) {
    super(hp, dmg, mana);
  }

  manaAttack(victim) {
    victim.takeDamage(4);

    this.hp = this.hp + 5;

    if (this.hp > Paladin.maxHp) {
      this.hp = Paladin.maxHp;
    }

    this.mana = this.mana - this.spellManaCost;
  }
}

class Berzerker extends Character {
  static maxHp = 8;

  characterName = "Berzerker";

  constructor(hp = Berzerker.maxHp, dmg = 4, mana = 0, spellManaCost = 0) {
    super(hp, dmg, mana);
  }

  manaAttack(victim) {
    this.dmg = this.dmg + 1;

    victim.takeDamage(this.dmg);

    this.hp = this.hp - 1;
  }
}

class Monk extends Character {
  static maxHp = 8;

  characterName = "Monk";

  constructor(hp = Monk.maxHp, dmg = 2, mana = 200, spellManaCost = 25) {
    super(hp, dmg, mana);
  }

  manaAttack() {
    this.hp = this.hp + 8;
    this.mana = this.mana - this.spellManaCost;
  }
}

class Assassin extends Character {
  static maxHp = 6;

  characterName = "Assassin";

  constructor(hp = Assassin.maxHp, dmg = 6, mana = 20, spellManaCost = 20) {
    super(hp, dmg, mana);
  }

  manaAttack(victim) {
    victime.takeDamage(7);
    this.addEffect(new ShieldEffect());
    this.mana = this.mana - this.spellManaCost;
  }
}

// GAME

class Game {
  characters = Character.All;
  players = [];
  currentTurn = null;
  gameStatus = "pending";
  nbTurnLeft = 10;

  constructor(nbTurnLeft = 10) {
    this.nbTurnLeft = nbTurnLeft;
    console.log(this);
  }

  addPlayer = (name, character) => {
    this.players.push({ name, character });

    const playerCards = document.getElementById("player-cards-wrapper");
    const playerDiv = document.createElement("div");

    playerDiv.innerHTML = character.generateText();
    playerDiv.classList.add("player-card");

    playerCards.appendChild(playerDiv);
  };

  updatePlayerCards() {
    const playerCards = document.getElementById("player-cards-wrapper");

    Array.from(playerCards.children).forEach((playerCard, idx) => {
      playerCard.innerHTML = this.players[idx].character.generateText();
    });
  }

  start = () => {
    this.gameStatus = "ongoing";
    const htmlNbTurnLeft = document.getElementById("nbTurnLeft");
    htmlNbTurnLeft.innerHTML = `${this.nbTurnLeft}`;

    this.currentTurn = new Turn(this);
    this.currentTurn.play();
  };

  newTurn() {
    console.log(">>>>> NOUVEAU TOUR");

    this.nbTurnLeft = this.nbTurnLeft - 1;
    const htmlNbTurnLeft = document.getElementById("nbTurnLeft");
    htmlNbTurnLeft.innerHTML = `${this.nbTurnLeft}`;

    const nbPlayerLeft = this.players.filter((p) =>
      p.character.isAlive()
    ).length;

    console.log("Combien de joueurs doivent jouer ce tour-ci?");
    console.log(nbPlayerLeft);

    if (nbPlayerLeft <= 1 || this.nbTurnLeft <= 0) {
      game.end();
    } else {
      console.log(">>>>> Début de la phase de jeu");

      console.log(`Il reste ${this.nbTurnLeft} tours`);

      this.currentTurn = new Turn(this);
      this.currentTurn.play();
    }
  }

  end() {
    let winners = this.players.filter((p) => p.character.isAlive());

    console.log("Sont en vie :", winners);
  }
}

class Turn {
  currentPlayerIdx = 0;

  game = null;

  availableEnnemiesOfTheCurrentPlayer = [];

  selectedVictim = null;

  constructor(game) {
    this.game = game;
    this.number = this.game.nbTurnLeft;
    this.players = this.game.players.filter((player) =>
      player.character.isAlive()
    );
  }

  endTurn = () => {
    // display
    // ? remove event listeners
    const simpleAttackBtn = document.getElementById("simpleAttack");
    simpleAttackBtn.removeEventListener("click", this.simpleAttackListener);
    const manaAttackBtn = document.getElementById("manaAttack");
    manaAttackBtn.removeEventListener("click", this.manaAttackListener);
    console.log("Attention, prochain tour");

    this.players.forEach((player) => {
      player.character.effects = player.character.effects.filter((effect) => {
        effect.duration = effect.duration - 1;

        return effect.duration > 0;
      });
    });

    game.newTurn();
  };

  checkManaAttack = () => {
    const manaAttackBtnEl = document.getElementById("manaAttack");

    // manaAttackBtn est disable si... (l'inverse (!) de tout ce qu'il y a après =)
    manaAttackBtnEl.disabled =
      !this.players[this.currentPlayerIdx].character.hasEnoughMana();
  };

  nextPlayer = () => {
    this.game.updatePlayerCards();
    // si plus de joueur
    if (this.players.length <= this.currentPlayerIdx + 1) {
      this.endTurn();
      console.log("Le tour s'arrête.");
    } else {
      console.log("Le jeu continue.");

      this.currentPlayerIdx = this.currentPlayerIdx + 1;
      const htmlNamePlayer = document.getElementById("name-player");
      htmlNamePlayer.innerHTML = `${this.players[this.currentPlayerIdx].name}`;
      if (!this.players[this.currentPlayerIdx].character.isAlive()) {
        console.log("On passe un joueur qui n'est pas en status 'playing'");
        this.nextPlayer();
      } else {
        console.log(
          "Au tour du joueur",
          this.players[this.currentPlayerIdx].name
        );
        this.listAvailableEnnemies();
        this.selectedVictim = null;

        this.checkManaAttack();
      }
    }
  };

  listAvailableEnnemies = () => {
    const ennemiesListEl = document.getElementById("selected-victim");

    Array.from(ennemiesListEl.children).forEach((option, idx) => {
      if (idx !== 0) {
        option.remove();
      }
    });

    this.availableEnnemiesOfTheCurrentPlayer = this.players.filter(
      (player, idx) =>
        player.character.isAlive() && idx !== this.currentPlayerIdx
    );

    // changer le select avec cette liste
    // UI.updateEnnemyList(this.availableEnnemiesOfTheCurrentPlayer)

    this.availableEnnemiesOfTheCurrentPlayer.forEach((ennemy, idx) => {
      const optionEl = document.createElement("option");

      optionEl.value = idx;
      optionEl.innerText = `${ennemy.name} - ${ennemy.character.characterName}`;

      ennemiesListEl.appendChild(optionEl);
    });

    ennemiesListEl.value = "";

    ennemiesListEl.addEventListener("change", (event) => {
      this.selectedVictim =
        this.availableEnnemiesOfTheCurrentPlayer[
          Number(event.target.value)
        ].character;
    });
  };

  simpleAttackListener = () => {
    console.log("this.currentPlayerIdx", this.currentPlayerIdx);
    console.log("a choisi l'attaque SIMPLE.");

    this.players[this.currentPlayerIdx].character.dealDamage(
      this.selectedVictim
    );
    this.nextPlayer();
  };

  manaAttackListener = () => {
    console.log("this.currentPlayerIdx", this.currentPlayerIdx);
    console.log(" a choisi l'attaque MANA.");

    this.players[this.currentPlayerIdx].character.manaAttack(
      this.selectedVictim
    );
    this.nextPlayer();
  };

  play() {
    this.players.forEach((player) => {
      player.character.effects.forEach((effect) => {
        if (effect.delay > 0) {
          effect.delay = effect.delay - 1;
        }
      });
    });

    //player is "playing" = verified in nextPlayer()
    const simpleAttackBtn = document.getElementById("simpleAttack");
    const manaAttackBtn = document.getElementById("manaAttack");

    const htmlNamePlayer = document.getElementById("name-player");
    htmlNamePlayer.innerHTML = `${this.players[this.currentPlayerIdx].name}`;

    console.log("Au tour de " + this.players[this.currentPlayerIdx].name);

    simpleAttackBtn.addEventListener("click", this.simpleAttackListener);
    manaAttackBtn.addEventListener("click", this.manaAttackListener);

    this.listAvailableEnnemies();
    this.checkManaAttack();
  }
}

//  PERFORM

const game = new Game();

const fighter = new Fighter();
const berzerk = new Berzerker();
const paladin = new Paladin();
const monk = new Monk();
const assassin = new Assassin();

// fighter.mana = 5;

game.addPlayer("David", fighter);
game.addPlayer("Ophélie", paladin);
game.addPlayer("Kitty", berzerk);
game.addPlayer("Papouche", monk);
game.addPlayer("Palipalapapuche", assassin);

game.start();
