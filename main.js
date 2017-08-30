// minA: harvest, upgrade, repair, 5, 21, 58dbc41a8283ff5308a3e86a
// minB: harvest, repair, 42, 11, 58dbc41a8283ff5308a3e868
// carA: carry, 5, 22, 35, 13, 599edfd8a185177ec3d4ad02, 59a0365562b5f6147e933927
// carB: carry, 41, 11, 37, 13, 59a1fe362ad55b4b1432ab45, 59a0365562b5f6147e933927
// carC: carry, 37, 14, 38, 14, 59a0365562b5f6147e933927
// carD: carry, 38, 14, 39, 13, 39, 14
// upA: upgrade, 39, 13, 39, 14
// tmpA: dismantle, build, 40, 11, 59a0365562b5f6147e933927, 59a6439ae0ef6f26bff919a9, 599e4ae3838eeb669627a03b, 599e24d33c57a50e570525af

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
	var roomASpawnA = Game.getObjectById('599cf27cc29e4d5b236724cf')
	
	//////////////////////////////
	
	var minAPart = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
	var minALoc = new RoomPosition(5, 21, roomAName);
	var minASource = Game.getObjectById('58dbc41a8283ff5308a3e86a');
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
							creep.harvest(minASource);
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
	
	var carAPart = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	var carALocA = new RoomPosition(5, 22, roomAName);
	var carALocB = new RoomPosition(35, 13, roomAName);
	var carASource = Game.getObjectById('599edfd8a185177ec3d4ad02');
	var carASink = Game.getObjectById('59a0365562b5f6147e933927');
	// console.log(carALocA.findPathTo(carALocB, {ignoreCreeps: true}).length + 5); // 54
	var carATravelTime = 54;
	
	for (var i = 1; i <= 2; i++) {
		var name = 'carA_' + i;
		var creep = Game.creeps[name];
		if (typeof creep == 'undefined') {
			if (typeof roomASpawnA.createCreep(carAPart, name) == 'string') {
				console.log('Spawn:', name);
			}
		} else if (!creep.spawning) {
			if (creep.pos.isEqualTo(carALocA) && creep.ticksToLive < carATravelTime) {
				creep.transfer(carASource, RESOURCE_ENERGY);
				creep.suicide();
			} else {
				if (creep.carry.energy == creep.carryCapacity) {
					if (creep.pos.isEqualTo(carALocB)) {
						creep.transfer(carASink, RESOURCE_ENERGY);
					} else {
						creep.moveTo(carALocB, {visualizePathStyle: {opacity: .7}});
					}
				} else {
					if (creep.pos.isEqualTo(carALocA)) {
						var targets = carALocA.findInRange(FIND_DROPPED_RESOURCES, 1);
						if (targets.length > 0) {
							creep.pickup(targets[0]);
						} else {
							creep.withdraw(carASource, RESOURCE_ENERGY);
						}
					} else {
						creep.moveTo(carALocA, {visualizePathStyle: {opacity: .7}});
					}
				}
			}
		}
	}
	
	//////////////////////////////
	
	var carBPart = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]; // <= 300
	var carBLocA = new RoomPosition(41, 11, roomAName);
	var carBLocB = new RoomPosition(37, 13, roomAName);
	var carBSource = Game.getObjectById('59a1fe362ad55b4b1432ab45');
	var carBSink = Game.getObjectById('59a0365562b5f6147e933927');
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
						var targets = roomA.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_TOWER && s.energy + creep.carry.energy <= s.energyCapacity) || ((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy < s.energyCapacity)});
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
						if (creep.pos.isEqualTo(carBLocB)) {
							creep.transfer(carBSink, RESOURCE_ENERGY);
						} else {
							creep.moveTo(carBLocB, {visualizePathStyle: {opacity: .7}});
						}
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
	
	var carCPart = [CARRY, MOVE]; // <= 300
	var carCLocA = new RoomPosition(37, 14, roomAName);
	var carCLocB = new RoomPosition(38, 14, roomAName);
	var carCSource = Game.getObjectById('59a0365562b5f6147e933927');
	// console.log(roomASpawnA.pos.findPathTo(carCLocA, {ignoreCreeps: true}).length + carCPart.length * 3); // 8
	var carCPreTime = 8;
	
	var ticksToLive = 0;
	for (var i = 1; i <= 2; i++) {
		var name = 'carC_' + i;
		var creep = Game.creeps[name];
		if (typeof creep != 'undefined') {
			if (creep.spawning) {
				ticksToLive = carCPreTime;
			} else {
				if (creep.ticksToLive > ticksToLive) {
					ticksToLive = creep.ticksToLive;
				}
				if (creep.pos.isEqualTo(carCLocA)) {
					var pickup = false;
					if (creep.carry.energy < creep.carryCapacity) {
						var targets = carCLocA.findInRange(FIND_DROPPED_RESOURCES, 1);
						if (targets.length > 0) {
							creep.pickup(targets[0]);
							pickup = true;
						}
					}
					if (!pickup) {
						if (creep.carry.energy == 0) {
							creep.withdraw(carCSource, RESOURCE_ENERGY);
						} else {
							var target = undefined;
							for (var j = 1; j <= 2; j++) {
								var preTargetName = 'carD_' + j;
								var preTarget = Game.creeps[preTargetName];
								if (typeof preTarget != 'undefined' && preTarget.pos.isEqualTo(carCLocB) && preTarget.carry.energy < preTarget.carryCapacity) {
									target = preTarget;
									break;
								}
							}
							if (typeof target == 'undefined') {
								if (creep.carry.energy < creep.carryCapacity) {
									creep.withdraw(carCSource, RESOURCE_ENERGY);
								}
							} else {
								creep.transfer(target, RESOURCE_ENERGY);
							}
						}
					}
				} else {
					creep.moveTo(carCLocA, {visualizePathStyle: {opacity: .7}});
				}
			}
		}
	}
	if (ticksToLive < carCPreTime) {
		for (var i = 1; i <= 2; i++) {
			var name = 'carC_' + i;
			if (typeof Game.creeps[name] == 'undefined') {
				if (typeof roomASpawnA.createCreep(carCPart, name) == 'string') {
					console.log('Spawn:', name);
				}
				break;
			}
		}
	}
	
	//////////////////////////////
	
	var carDPart = [CARRY, MOVE]; // <= 300
	var carDLocA = new RoomPosition(38, 14, roomAName);
	var carDLocB = [new RoomPosition(39, 13, roomAName), new RoomPosition(39, 14, roomAName)];
	// console.log(roomASpawnA.pos.findPathTo(carDLocA, {ignoreCreeps: true}).length + carDPart.length * 3); // 8
	var carDPreTime = 8;
	
	var ticksToLive = 0;
	for (var i = 1; i <= 2; i++) {
		var name = 'carD_' + i;
		var creep = Game.creeps[name];
		if (typeof creep != 'undefined') {
			if (creep.spawning) {
				ticksToLive = carDPreTime;
			} else {
				if (creep.ticksToLive > ticksToLive) {
					ticksToLive = creep.ticksToLive;
				}
				if (creep.pos.isEqualTo(carDLocA)) {
					var pickup = false;
					if (creep.carry.energy < creep.carryCapacity) {
						var targets = carDLocA.findInRange(FIND_DROPPED_RESOURCES, 1);
						if (targets.length > 0) {
							creep.pickup(targets[0]);
							pickup = true;
						}
					}
					if (!pickup && creep.carry.energy > 0) {
						var target = undefined;
						for (var jj = 0; jj < 2; jj++) {
							for (var j = 1; j <= 2; j++) {
								var preTargetName = 'upA' + jj + '_' + j;
								var preTarget = Game.creeps[preTargetName];
								if (typeof preTarget != 'undefined' && preTarget.pos.isEqualTo(carDLocB[jj]) && preTarget.carry.energy < preTarget.carryCapacity) {
									if (typeof target == 'undefined' || preTarget.carry.energy < target.carry.energy) {
										target = preTarget;
									}
									break;
								}
							}
						}
						if (typeof target != 'undefined') {
							creep.transfer(target, RESOURCE_ENERGY);
						}
					}
				} else {
					creep.moveTo(carDLocA, {visualizePathStyle: {opacity: .7}});
				}
			}
		}
	}
	if (ticksToLive < carDPreTime) {
		for (var i = 1; i <= 2; i++) {
			var name = 'carD_' + i;
			if (typeof Game.creeps[name] == 'undefined') {
				if (typeof roomASpawnA.createCreep(carDPart, name) == 'string') {
					console.log('Spawn:', name);
				}
				break;
			}
		}
	}
	
	//////////////////////////////
	
	var upAPart = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
	var upALoc = [new RoomPosition(39, 13, roomAName), new RoomPosition(39, 14, roomAName)];
	var upASink = roomA.controller;
	// console.log(roomASpawnA.pos.findPathTo(upALoc[0], {ignoreCreeps: true}).length * 3 + upAPart.length * 3); // 42
	// console.log(roomASpawnA.pos.findPathTo(upALoc[1], {ignoreCreeps: true}).length * 3 + upAPart.length * 3); // 45
	var upAPreTime = [42, 45];
	
	for (var ii = 0; ii < 2; ii++) {
		var ticksToLive = 0;
		for (var i = 1; i <= 2; i++) {
			var name = 'upA' + ii + '_' + i;
			var creep = Game.creeps[name];
			if (typeof creep != 'undefined') {
				if (creep.spawning) {
					ticksToLive = upAPreTime[ii];
				} else {
					if (creep.ticksToLive > ticksToLive) {
						ticksToLive = creep.ticksToLive;
					}
					if (creep.pos.isEqualTo(upALoc[ii])) {
						creep.upgradeController(upASink);
					} else {
						creep.moveTo(upALoc[ii], {visualizePathStyle: {opacity: .7}});
					}
				}
			}
		}
		if (ticksToLive < upAPreTime[ii]) {
			for (var i = 1; i <= 2; i++) {
				var name = 'upA' + ii + '_' + i;
				if (typeof Game.creeps[name] == 'undefined') {
					if (typeof roomASpawnA.createCreep(upAPart, name) == 'string') {
						console.log('Spawn:', name);
					}
					break;
				}
			}
		}
	}
	
	//////////////////////////////
	
	if (true) {
		var tmpAPart = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
		var tmpALoc = new RoomPosition(40, 11, roomAName);
		var tmpASink = Game.getObjectById('59a0365562b5f6147e933927');
		var tmpATarget = Game.getObjectById('59a6439ae0ef6f26bff919a9');
		var tmpATargetsA = roomA.find(FIND_STRUCTURES, {filter: (s) => (s.id == '599e4ae3838eeb669627a03b' || s.id == '599e24d33c57a50e570525af')});
		var tmpATargetsB = roomA.find(FIND_CONSTRUCTION_SITES, {filter: (s) => (s.pos.x > 20)});
		
		for (var i = 1; i <= 2; i++) {
			var name = 'tmpA_' + i;
			var creep = Game.creeps[name];
			if (typeof creep == 'undefined') {
				if (tmpATargetsA.length > 0 || tmpATargetsB.length > 0) {
					if (typeof roomASpawnA.createCreep(tmpAPart, name) == 'string') {
						console.log('Spawn:', name);
					}
				}
			} else {
				if (tmpATarget !== null && creep.carry.energy < creep.carryCapacity && typeof creep.memory.building == 'undefined') {
					creep.moveTo(tmpATarget, {visualizePathStyle: {opacity: .7}});
					creep.pickup(tmpATarget);
					continue;
				}
				if (tmpATargetsA.length > 0) {
					if (creep.carry.energy == creep.carryCapacity) {
						if (creep.transfer(tmpASink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(tmpASink, {visualizePathStyle: {opacity: .7}});
						}
					} else {
						if (creep.dismantle(tmpATargetsA[0]) == ERR_NOT_IN_RANGE) {
							creep.moveTo(tmpATargetsA[0], {visualizePathStyle: {opacity: .7}});
						}
					}
				} else if (tmpATargetsB.length > 0) {
					if (typeof creep.memory.building == 'undefined') {
						if (creep.carry.energy == creep.carryCapacity) {
							creep.memory.building = true;
						}
					} else {
						if (creep.carry.energy == 0) {
							delete creep.memory.building;
						}
					}
					if (creep.memory.building) {
						if (creep.build(tmpATargetsB[0]) == ERR_NOT_IN_RANGE) {
							creep.moveTo(tmpATargetsB[0], {visualizePathStyle: {opacity: .7}});
						}
					} else {
						if (creep.withdraw(tmpASink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(tmpASink, {visualizePathStyle: {opacity: .7}});
						}
					}
				} else {
					if (creep.pos.isEqualTo(tmpALoc)) {
						roomASpawnA.recycleCreep(creep);
					} else {
						creep.moveTo(tmpALoc, {visualizePathStyle: {opacity: .7}});
					}
				}
			}
		}
	}
	
	//////////////////////////////
	
	towers = roomA.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
	for (var i = 0; i < towers.length; i++) {
		var tower = towers[i];
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile !== null) {
			tower.attack(closestHostile);
		} else {
			var closestWounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});
			if (closestWounded !== null) {
				tower.heal(closestWounded);
			} else {
				var targets = roomA.find(FIND_STRUCTURES, {filter: (s) => s.hits + 800 <= s.hitsMax && s.structureType != STRUCTURE_WALL});
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
