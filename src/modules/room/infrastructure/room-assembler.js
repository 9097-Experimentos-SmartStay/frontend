import { RoomEntity } from "../domain/model/room-entity";

export class TutorialAssembler {

    static toEntityFromResource(resource) {
        return new RoomEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['rooms'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}