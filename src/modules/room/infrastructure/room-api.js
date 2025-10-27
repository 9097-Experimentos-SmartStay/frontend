const roomsEndpointPath = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;

export class RoomApi extends BaseApi {
    #roomsEndpoint;

    constructor() {
        super();
        this.#roomsEndpoint = new BaseEndpoint(this, roomsEndpointPath);
    }

    getRooms() {
        return this.#roomsEndpoint.getAll();
    }

    getRoomById(id) {
        return this.#roomsEndpoint.getById(id);
    }

    createRoom(resource) {
        return this.#roomsEndpoint.create(resource);
    }

    updateRoom(resource) {
        return this.#roomsEndpoint.update(resource.id, resource);
    }

    deleteRoom(id) {
        return this.#roomsEndpoint.delete(id);
    }
}