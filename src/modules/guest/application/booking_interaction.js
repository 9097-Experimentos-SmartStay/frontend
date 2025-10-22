export const bookingInteraction = {
    bookProperty(propertyId) {
        console.log(`🛏 Reserva creada para propiedad ${propertyId}`);
    },

    cancelBooking(bookingId) {
        console.log(`❌ Reserva ${bookingId} cancelada.`);
    },

    addReview(bookingId, review) {
        console.log(`⭐ Review añadida para reserva ${bookingId}: ${review}`);
    }
};
