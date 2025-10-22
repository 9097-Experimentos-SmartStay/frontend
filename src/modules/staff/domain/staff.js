export class Staff {
    constructor(id, name, role, assignedRooms = []) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.assignedRooms = assignedRooms;
    }

    assignRoom(roomNumber) {
        this.assignedRooms.push(roomNumber);
    }

    completeTask(taskId) {
        console.log(`Tarea ${taskId} completada por ${this.name}`);
    }
}
