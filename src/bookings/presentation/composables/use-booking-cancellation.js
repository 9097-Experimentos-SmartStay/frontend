import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useBookingStore } from '../../application/booking.store.js';
import { failureMessageKey } from '@/shared/presentation/utils/failure-message.js';

/**
 * Cancellation with the policy of §8.4 (guest: own bookings, US-51; staff: bookings of the hotel, US-07 scenario 4):
 * a confirmation dialog that says whether the booking was paid (its payment becomes Refunded), then the request.
 * The page must render <pv-confirm-dialog /> and <pv-toast />.
 * @returns {{confirmCancel: (booking: import('../../domain/model/booking.entity.js').Booking, onDone?: Function) => void}}
 */
export function useBookingCancellation() {
    const { t } = useI18n();
    const confirm = useConfirm();
    const toast = useToast();
    const bookingStore = useBookingStore();

    function confirmCancel(booking, onDone = () => {}) {
        confirm.require({
            header: t('bookingCancellation.header', { code: booking.reference }),
            message: booking.isConfirmed() ? t('bookingCancellation.messagePaid') : t('bookingCancellation.message'),
            icon: 'pi pi-exclamation-triangle',
            acceptProps: { label: t('bookingCancellation.accept'), severity: 'danger' },
            rejectProps: { label: t('bookingCancellation.keep'), severity: 'secondary', outlined: true },
            accept: async () => {
                try {
                    const cancelled = await bookingStore.cancelBooking(booking.id);
                    toast.add({
                        severity: 'success',
                        summary: t('common.success'),
                        detail: cancelled?.isRefunded ? t('bookingCancellation.doneRefund', { code: booking.reference }) : t('bookingCancellation.done', { code: booking.reference }),
                        life: 5000,
                    });
                    onDone(cancelled);
                } catch (failure) {
                    toast.add({
                        severity: 'error',
                        summary: t('common.error'),
                        detail: t(failureMessageKey(failure, {
                            checkInDayReached: 'bookingCancellation.checkInDayReachedError',
                            notChangeable: 'bookingCancellation.notCancellable',
                            notFound: 'bookings.notFound',
                        })),
                        life: 6000,
                    });
                }
            },
        });
    }

    return { confirmCancel };
}
