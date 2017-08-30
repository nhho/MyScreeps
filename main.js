// minA: harvest, upgrade, repair, build, 5, 21, 58dbc41a8283ff5308a3e86a, 599edfd8a185177ec3d4ad02
// minB: harvest, repair, 42, 11, 58dbc41a8283ff5308a3e868
// carB: carry, 41, 11, 59a1fe362ad55b4b1432ab45
// tmpA: build, 37, 13, 37, 14, 38, 13

// TODO: rm extra road
// TODO: rmb move path ?
// TODO: linker (lv5) tower (lv5)
// TODO: fully automized startup

module.exports.loop = function () {
	for (var name in Memory.creeps)
		if (typeof Game.creeps[name] == 'undefined') {
			delete Memory.creeps[name];
			console.log('Clear:', name);
		}
	
	var roomAName = 'W15S98';
	var roomA = Game.rooms[roomAName];
	var roomASpawnA = Game.getObjectById('599cf27cc29e4d5b236724cf');
	var roomAGraveLoc = new RoomPosition(40, 11, roomAName);
	var roomATowers = [Game.getObjectById('59a671f4a06b59410e1add2f'), Game.getObjectById('59a6a78573262b03cd6403ae')];
	var roomALink = [Game.getObjectById('59a697fe534852116064a5e1'), Game.getObjectById('59a648f455f98d733d6c11bd')];
	
	//////////////////////////////
	
	var minAPart = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
	var minALoc = new RoomPosition(5, 21, roomAName);
	var minASource = Game.getObjectById('58dbc41a8283ff5308a3e86a');
	var minAStorage = Game.getObjectById('599edfd8a185177ec3d4ad02');
	// console.log(roomASpawnA.pos.findPathTo(minALoc, {ignoreCreeps: true}).length + minAPart.length * 3); // 84
	var minAPreTime = 84;
	
	var ticksToLive = 0;
	for (var i = 1; i <= 2; i++) {
		var name = 'minA_' + i;
		var creep = Game.creeps[name];
		if (typeof creep != 'undefined') {
			if (creep.spawning) {
				ticksToLive = minAPreTime;
			} else {
				var creepWorkPart = creep.getActiveBodyparts(WORK);
				if (creep.ticksToLive > ticksToLive) {
					ticksToLive = creep.ticksToLive;
				}
				if (creep.pos.isEqualTo(minALoc)) {
					var target = undefined;
					if (creep.carry.energy >= creepWorkPart) {
						var targets = minALoc.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.hits + creepWorkPart * 100 <= s.hitsMax && s.structureType != STRUCTURE_WALL});
						for (var j = 0; j < targets.length; j++) {
							if (typeof target == 'undefined' || targets[j].hits * target.hitsMax < target.hits * targets[j].hitsMax) {
								target = targets[j];
							}
						}
					}
					if (typeof target == 'undefined') {
						var build = false;
						if (creep.carry.energy >= creepWorkPart * 5) {
							var targets = minALoc.findInRange(FIND_CONSTRUCTION_SITES, 3);
							if (targets.length > 0) {
								creep.build(targets[0]);
								build = true;
							}
						}
						if (!build) {
							var take = false;
							if (creep.carry.energy == 0 && roomALink[1].energy < roomALink[1].energyCapacity) {
								var targets = minALoc.findInRange(FIND_DROPPED_RESOURCES, 1);
								if (targets.length > 0) {
									creep.pickup(targets[0]);
									take = true;
								} else if (minAStorage.store.energy > 0) {
									creep.withdraw(minAStorage, RESOURCE_ENERGY);
									take = true;
								}
							}
							if (!take) {
								var transfer = false;
								if (creep.carry.energy + creepWorkPart * 2 > creep.carryCapacity || minASource.energy == 0) {
									if (roomATowers[1].energy + creep.carry.energy <= roomATowers[1].energyCapacity) {
										creep.transfer(roomATowers[1], RESOURCE_ENERGY);
										transfer = true;
									} else if (roomALink[1].energy < roomALink[1].energyCapacity) {
										creep.transfer(roomALink[1], RESOURCE_ENERGY);
										transfer = true;
									}
								}
								if (!transfer) {
									creep.harvest(minASource);
								}
							}
						}
					} else {
						creep.repair(target);
					}
				} else {
					creep.moveTo(minALoc, {visualizePathStyle: {opacity: .7}});
				}
			}
		}
	}
	if (ticksToLive < minAPreTime) {
		for (var i = 1; i <= 2; i++) {
			var name = 'minA_' + i;
			if (typeof Game.creeps[name] == 'undefined') {
				if (typeof roomASpawnA.createCreep(minAPart, name) == 'string') {
					console.log('Spawn:', name);
				}
				break;
			}
		}
	}
	
	//////////////////////////////
	
	var minBPart = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
	var minBLoc = new RoomPosition(42, 11, roomAName);
	var minBSource = Game.getObjectById('58dbc41a8283ff5308a3e868');
	var minBSink = roomA.controller;
	// console.log(roomASpawnA.pos.findPathTo(minBLoc, {ignoreCreeps: true}).length * 3 + minBPart.length * 3); // 33
	var minBPreTime = 33;
	
	var ticksToLive = 0;
	for (var i = 1; i <= 2; i++) {
		var name = 'minB_' + i;
		var creep = Game.creeps[name];
		if (typeof creep != 'undefined') {
			if (creep.spawning) {
				ticksToLive = minBPreTime;
			} else {
				var creepWorkPart = creep.getActiveBodyparts(WORK);
				if (creep.ticksToLive > ticksToLive) {
					ticksToLive = creep.ticksToLive;
				}
				if (creep.pos.isEqualTo(minBLoc)) {
					var target = undefined;
					if (creep.carry.energy >= creepWorkPart) {
						if (minBSink.ticksToDowngrade * 2 < CONTROLLER_DOWNGRADE[minBSink.level]) {
							creep.upgradeController(minBSink);
						} else {
							var targets = minBLoc.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.hits + creepWorkPart * 100 <= s.hitsMax && s.structureType != STRUCTURE_WALL});
							for (var j = 0; j < targets.length; j++) {
								if (typeof target == 'undefined' || targets[j].hits * target.hitsMax < target.hits * targets[j].hitsMax) {
									target = targets[j];
								}
							}
						}
					}
					if (typeof target == 'undefined') {
						creep.harvest(minBSource);
					} else {
						creep.repair(target);
					}
				} else {
					creep.moveTo(minBLoc, {visualizePathStyle: {opacity: .7}});
				}
			}
		}
	}
	if (ticksToLive < minBPreTime) {
		for (var i = 1; i <= 2; i++) {
			var name = 'minB_' + i;
			if (typeof Game.creeps[name] == 'undefined') {
				if (typeof roomASpawnA.createCreep(minBPart, name) == 'string') {
					console.log('Spawn:', name);
				}
				break;
			}
		}
	}
	
	//////////////////////////////
	
	var carBPart = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]; // <= 300
	var carBLocA = new RoomPosition(41, 11, roomAName);
	// var carBLocB = new RoomPosition(37, 13, roomAName);
	var carBSource = Game.getObjectById('59a1fe362ad55b4b1432ab45');
	// var carBSink = Game.getObjectById('59a0365562b5f6147e933927');
	var carBTravelTime = 20;
	
	// for (var i = 1; i <= 1; i++) {
	var i = 1;
	{
		var name = 'carB_' + i;
		var creep = Game.creeps[name];
		if (typeof creep == 'undefined') {
			if (typeof roomASpawnA.createCreep(carBPart, name) == 'string') {
				console.log('Spawn:', name);
			}
		} else if (!creep.spawning) {
			if (creep.pos.isEqualTo(carBLocA) && creep.ticksToLive < carBTravelTime) {
				creep.transfer(carBSource, RESOURCE_ENERGY);
				creep.suicide();
			} else {
				if (creep.memory.transferring === true) {
					if (creep.carry.energy == 0) {
						delete creep.memory.transferring;
					}
				} else {
					if (creep.carry.energy == creep.carryCapacity) {
						creep.memory.transferring = true;
					}
				}
				if (creep.memory.transferring === true) {
					if (typeof creep.memory.target == 'undefined') {
						var targets = roomA.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_TOWER && s.energy + creep.carry.energy <= s.energyCapacity && s.pos.x >= 35) || ((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy < s.energyCapacity)});
						var bestPenalty;
						for (var j = 0; j < targets.length; j++) {
							var penalty = Math.max(Math.abs(creep.pos.x - targets[j].pos.x), Math.abs(creep.pos.y - targets[j].pos.y));
							if (targets[j].structureType == STRUCTURE_TOWER)
								penalty += 100000;
							if (typeof creep.memory.target == 'undefined' || penalty < bestPenalty) {
								creep.memory.target = targets[j].id;
								bestPenalty = penalty;
							}
						}
					}
					if (typeof creep.memory.target == 'undefined') {
						/*
						if (creep.pos.isEqualTo(carBLocB)) {
							creep.transfer(carBSink, RESOURCE_ENERGY);
						} else {
							creep.moveTo(carBLocB, {visualizePathStyle: {opacity: .7}});
						}
						*/
						creep.moveTo(carBLocA, {visualizePathStyle: {opacity: .7}});
					} else {
						var target = Game.getObjectById(creep.memory.target);
						var ret = creep.transfer(target, RESOURCE_ENERGY);
						if (ret == OK || ret == ERR_FULL) {
							delete creep.memory.target;
						} else if (ret == ERR_NOT_IN_RANGE) {
							creep.moveTo(target, {visualizePathStyle: {opacity: .7}});
						}
					}
				} else {
					if (creep.pos.isEqualTo(carBLocA)) {
						var targets = carBLocA.findInRange(FIND_DROPPED_RESOURCES, 1);
						if (targets.length > 0) {
							creep.pickup(targets[0]);
						} else {
							creep.withdraw(carBSource, RESOURCE_ENERGY);
						}
					} else {
						creep.moveTo(carBLocA, {visualizePathStyle: {opacity: .7}});
					}
				}
			}
		}
	}
	
	//////////////////////////////
	
	var tmpAPart = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
	var tmpALocA = [new RoomPosition(37, 13, roomAName), new RoomPosition(37, 14, roomAName)];
	var tmpALocB = new RoomPosition(38, 13, roomAName);
	var targets = roomA.lookForAt(LOOK_CONSTRUCTION_SITES, tmpALocB);
	
	for (var i = 0; i < 2; i++) {
		var name = 'tmpA_' + i;
		var creep = Game.creeps[name];
		if (typeof creep == 'undefined') {
			if (targets.length > 0)	 {
				if (typeof roomASpawnA.createCreep(tmpAPart, name) == 'string') {
					console.log('Spawn:', name);
				}
			}
		} else {
			if (targets.length > 0)	 {
				if (creep.pos.isEqualTo(tmpALocA[i])) {
					if (creep.carry.energy == 0) {
						var sources = tmpALocA[i].findInRange(FIND_DROPPED_RESOURCES, 1);
						if (sources.length > 0) {
							creep.pickup(sources[0]);
						}
					} else {
						creep.build(targets[0]);
					}
				} else {
					creep.moveTo(tmpALocA[i], {visualizePathStyle: {opacity: .7}});
				}
			} else {
				if (creep.pos.isEqualTo(roomAGraveLoc)) {
					roomASpawnA.recycleCreep(creep);
				} else {
					creep.moveTo(roomAGraveLoc, {visualizePathStyle: {opacity: .7}});
				}
			}
		}
	}
	
	//////////////////////////////
	
	var tmpBPart = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE];
	var tmpBLocA = [new RoomPosition(37, 13, roomAName), new RoomPosition(37, 14, roomAName)];
	var tmpBLocB = new RoomPosition(38, 13, roomAName);
	var targets = roomA.lookForAt(LOOK_STRUCTURES, tmpBLocB);
	
	console.log(targets.length);
	
	//////////////////////////////
	
	for (var i = 0; i < roomATowers.length; i++) {
		var tower = roomATowers[i];
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile !== null) {
			tower.attack(closestHostile);
		} else {
			var closestWounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});
			if (closestWounded !== null) {
				tower.heal(closestWounded);
			} else {
				var targets = roomA.find(FIND_STRUCTURES, {filter: (s) => s.hits + 800 <= s.hitsMax && s.structureType != STRUCTURE_WALL && (s.pos.x < 25) == (tower.pos.x < 25)});
				var target = undefined;
				for (var j = 0; j < targets.length; j++) {
					if (!minALoc.inRangeTo(targets[j].pos, 3) && !minBLoc.inRangeTo(targets[j].pos, 3)) {
						// new RoomVisual(roomAName).circle(targets[j].pos.x, targets[j].pos.y);
						if (typeof target == 'undefined' || targets[j].hits * target.hitsMax < target.hits * targets[j].hitsMax) {
							target = targets[j];
						}
					}
				}
				if (typeof target != 'undefined') {
					tower.repair(target);
				}
			}
		}
	}
	
	//////////////////////////////
	
	if (roomALink[1].energy == roomALink[1].energyCapacity && roomALink[0].energy + roomALink[1].energy * 0.97 <= roomALink[0].energyCapacity) {
		roomALink[1].transferEnergy(roomALink[0]);
	}
	
	//////////////////////////////
		
	var line = 0, cnt = 0;
	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		new RoomVisual().text(++cnt + '. [' + name + '] ' + creep.ticksToLive + ' (' + creep.pos.x + ', ' + creep.pos.y + ', ' + creep.pos.roomName + ')', 1, ++line, {align: 'left'});
	}
	new RoomVisual().text(Game.cpu.getUsed() + ' / ' + Game.cpu.tickLimit + ' (' + Game.cpu.bucket + ')', 1, ++line, {align: 'left'});
	for (var name in Game.rooms) {
		var room = Game.rooms[name];
		if (typeof room.controller != 'undefined') {
			new RoomVisual(name).text(name + ': lv' + room.controller.level + ' ' + room.controller.ticksToDowngrade + ' / ' + CONTROLLER_DOWNGRADE[room.controller.level], 1, line + 1, {align: 'left'});
		}
	}
};
