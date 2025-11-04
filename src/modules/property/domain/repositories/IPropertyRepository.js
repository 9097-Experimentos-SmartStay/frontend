// src/modules/property/domain/IPropertyRepository.js

export class IPropertyRepository {
    getRooms(propertyId = null) { throw new Error("Not implemented"); } // This line was modified with propertyId parameter as optional if the function don't do anything, erase it.
    getRoomById(roomId) { throw new Error("Not implemented: getRoomById"); } // NUEVO
    addRoom(roomData) { throw new Error("Not implemented: addRoom"); }       // NUEVO
    updateRoom(roomId, roomData) { throw new Error("Not implemented: updateRoom"); } // NUEVO
    deleteRoom(roomId) { throw new Error("Not implemented: deleteRoom"); }   // NUEVO
    getProperties() { throw new Error("Not implemented"); }
    getTasks(assignedTo = null) { throw new Error("Not implemented"); } // Ajustado
    updateTask(taskId, data) { throw new Error("Not implemented"); }
    addTask(taskData) { throw new Error("Not implemented: addTask"); }
    deleteTask(taskId) { throw new Error("Not implemented: deleteTask"); }
    getAllProperties() {throw new Error("Not implemented: getAllProperties");}
    getPropertyById(propertyId) {throw new Error("Not implemented: getPropertyById");}
    createProperty(propertyData) {throw new Error("Not implemented: createProperty");}
    updateProperty(propertyId, propertyData) {throw new Error("Not implemented: updateProperty");}
    deleteProperty(propertyId) {throw new Error("Not implemented: deleteProperty");}

}