function randomize() {

	var chosen = [];
	var cards = [
		{
			name: "Bamboozle",
			type: "skill"
		},
		{
			name: "Brawler",
			type: "skill"
		},
		{
			name: "Flanking",
			type: "skill"
		},
		{
			name: "Frenzy",
			type: "skill"
		},
		{
			name: "Holy Aura",
			type: "skill"
		},
		{
			name: "Armor of Mist",
			type: "loot"
		},
		{
			name: "Elixir of Life",
			type: "loot"
		},
		{
			name: "Lightning Daggers",
			type: "loot"
		},
		{
			name: "Shining Blade",
			type: "loot"
		},
		{
			name: "Blessed Smite",
			type: "attack"
		},
		{
			name: "Fireball",
			type: "attack"
		},
		{
			name: "Leading Strike",
			type: "attack"
		},
		{
			name: "Spear Volley",
			type: "attack"
		},
		{
			name: "Thieving Strike",
			type: "attack"
		},
		{
			name: "Wild Charge",
			type: "attack"
		},
		{
			name: "Heal",
			type: "action"
		},
		{
			name: "Prophecy",
			type: "action"
		},
		{
			name: "Resurrect",
			type: "action"
		},
		{
			name: "Revitalize",
			type: "action"
		},
		{
			name: "Rousing Speech",
			type: "action"
		}
	];
	var monsters = ['Demons', 'Drow', 'Fire Dragons', 'Glacien', 'Necromancers', 'Storm Lords'];
	
	for(var i = 0; i < 8; i++) {
		var random = Math.floor(Math.random() * cards.length);
		chosen.push(cards[random]);
		cards.splice(random, 1);
	}
	chosen = chosen.sort(function(a, b) {
		if(a.type === b.type) {
			if(a.name > b.name) return 1;
			if(a.name == b.name) return 0;
			return -1;
		}
		else {
			if(a.type > b.type) return 1;
			if(a.type == b.type) return 0;
			return -1;
		}
	});
	
	$('.container').empty();
	$('.container').append('<div class="type">monster</div><div class="name">' + monsters[Math.floor(Math.random() * monsters.length)] + '</div>');
	for(var i = 0; i < chosen.length; i++) {
		$('.container').append('<div class="type">' + chosen[i].type + '</div><div class="name">' + chosen[i].name + '</div>');
	}
	
}

$(function() {
	randomize();
	
	$('button').click(randomize);
});
