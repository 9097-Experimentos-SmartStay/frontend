import { RoomApi } from "../infrastructure/room-api";


const roomApi = new RoomApi();

const useRoomStore = defineStore('room', () => {
    const rooms = ref([]);
    const errors = ref([]);
    const roomsLoaded = ref(false);
    const roomsCount = computed(() => roomsLoaded ? rooms.value.length : 0);

    function fetchRooms() {
        return roomApi.getRooms().then(response => {
            rooms.value = RoomAssembler.toEntitiesFromResponse(response);
            roomsLoaded.value = true;
            console.log(roomsLoaded.value);
            console.log(rooms.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }


    function getCategoryById(id) {
        let idNum = parseInt(id);
        return categories.value.find(category => category["id"] === idNum);
    }

    function addRoom(room) {
        roomApi.createRoom(room).then(response => {
            const resource = response.data;
            const newRoom = RoomAssembler.toEntityFromResource(resource);
            rooms.value.push(newRoom);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateRoom(room) {
        roomApi.updateRoom(room).then(response => {
            const resource = response.data;
            const updatedRoom = RoomAssembler.toEntityFromResource(resource);
            const index = rooms.value.findIndex(r => r['id'] === updatedRoom.id);
            if (index !== -1) rooms.value[index] = updatedRoom;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteRoom(id) {
        roomApi.deleteRoom(id).then(() => {
            const index = rooms.value.findIndex(r => r['id'] === id);
            if (index !== -1) rooms.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }
    return {
        rooms,
        roomsCount,
        roomsLoaded,
        errors
    }

   }); 

export default useRoomStore;