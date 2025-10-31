// src/modules/property/application/room-service.js

export class RoomService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async getRoomList() {
        return await this.roomRepository.getAll();
    }

    async getRoomDetails(roomId) {
        return await this.roomRepository.getById(roomId);
    }

    async createRoom(roomData) {
        if (!roomData.name || !roomData.number) {
            throw new Error("Room name and number are required");
        }
        console.log("Service: Creating new room:", roomData);
        return await this.roomRepository.add(roomData);
    }

    async updateRoom(roomId, roomData) {
        console.log(`Service: Updating room ${roomId}`, roomData);
        return await this.roomRepository.update(roomId, roomData);
    }

    async removeRoom(roomId) {
        console.log(`Service: Deleting room ${roomId}`);
        await this.roomRepository.delete(roomId);
    }

    async markAsCleaning(roomId) {
        const updatedRoom = await this.roomRepository.update(roomId, { status: 'cleaning' });
        console.log(`🧹 Room ${roomId} marked as cleaning.`);
        return updatedRoom;
    }

    async markAsAvailable(roomId) {
        const updatedRoom = await this.roomRepository.update(roomId, { status: 'available' });
        console.log(`✅ Room ${roomId} marked as available.`);
        return updatedRoom;
    }

    async getRoomsPendingCleaning() {
        const rooms = await this.roomRepository.getAll();
        return rooms.filter(r => r.status === 'Por limpiar' || r.status === 'Revisión pendiente' || r.status === 'cleaning');
    }
}
