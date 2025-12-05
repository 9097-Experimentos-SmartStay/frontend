export class PaymentAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return {
            id: resource.id,
            bookingId: resource.bookingId,
            transactionId: resource.transactionId,
            amount: resource.amount,
            status: resource.status,
            cardNumberMasked: resource.cardNumberMasked,
            paymentDate: new Date(resource.paymentDate)
        };
    }

    static toEntityFromResponse(response) {
        if (!response.data) return null;
        return PaymentAssembler.toEntityFromResource(response.data);
    }
}