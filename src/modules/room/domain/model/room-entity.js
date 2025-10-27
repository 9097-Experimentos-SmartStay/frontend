export class RoomEntity {
    constructor({
        id = null,
        name = '',
        description = '',
        price = 0,
        tv = false,
        internet = false,
        air_conditioning = false,
        breakfast_included = false,
        available = true,
        type = '',
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.tv = tv;
        this.internet = internet;
        this.air_conditioning = air_conditioning;
        this.breakfast_included = breakfast_included;
        this.available = available;
        this.type = type;
    }
}

