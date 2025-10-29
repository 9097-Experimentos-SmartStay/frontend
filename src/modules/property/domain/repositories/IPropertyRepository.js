// src/modules/property/domain/IPropertyRepository.js

export class IPropertyRepository {
    getRooms() { throw new Error("Not implemented"); }
    getRoomById(roomId) { throw new Error("Not implemented: getRoomById"); } // NUEVO
    addRoom(roomData) { throw new Error("Not implemented: addRoom"); }       // NUEVO
    updateRoom(roomId, roomData) { throw new Error("Not implemented: updateRoom"); } // NUEVO
    deleteRoom(roomId) { throw new Error("Not implemented: deleteRoom"); }   // NUEVO
    getProperties() { throw new Error("Not implemented"); }
    getTasks(assignedTo = null) { throw new Error("Not implemented"); } // Ajustado
    updateTask(taskId, data) { throw new Error("Not implemented"); }

}