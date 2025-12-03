// src/bounded-contexts/payments/presentation/composables/usePayments.js
import { ref, onMounted } from 'vue';
import { PaymentService } from '../../application/payment-service.js';

export function usePayments() {
    const payments = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const service = new PaymentService();

    const fetchPayments = async () => {
        loading.value = true;
        error.value = null;
        try {
            payments.value = await service.getAllPayments();
        } catch (err) {
            error.value = err.message || 'Error fetching payments';
            console.error('Error fetching payments:', err);
        } finally {
            loading.value = false;
        }
    };

    const getPaymentById = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            return await service.getPaymentById(id);
        } catch (err) {
            error.value = err.message || 'Error fetching payment';
            console.error('Error fetching payment:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getPaymentsByBooking = async (bookingId) => {
        loading.value = true;
        error.value = null;
        try {
            payments.value = await service.getPaymentsByBooking(bookingId);
        } catch (err) {
            error.value = err.message || 'Error fetching payments by booking';
            console.error('Error fetching payments by booking:', err);
        } finally {
            loading.value = false;
        }
    };

    const createPayment = async (data) => {
        loading.value = true;
        error.value = null;
        try {
            const newPayment = await service.createPayment(data);
            await fetchPayments(); // Refresh list
            return newPayment;
        } catch (err) {
            error.value = err.message || 'Error creating payment';
            console.error('Error creating payment:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const processPayment = async (id, invoiceNumber = null) => {
        loading.value = true;
        error.value = null;
        try {
            const payment = await service.processPayment(id, invoiceNumber);
            await fetchPayments(); // Refresh list
            return payment;
        } catch (err) {
            error.value = err.message || 'Error processing payment';
            console.error('Error processing payment:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const failPayment = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const payment = await service.failPayment(id);
            await fetchPayments(); // Refresh list
            return payment;
        } catch (err) {
            error.value = err.message || 'Error failing payment';
            console.error('Error failing payment:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        fetchPayments();
    });

    return {
        payments,
        loading,
        error,
        fetchPayments,
        getPaymentById,
        getPaymentsByBooking,
        createPayment,
        processPayment,
        failPayment
    };
}

