export const BOOKING_STATUS = {
    REQUESTED: 'Requested',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In-progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// Strict state transitions
export const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        Requested: ['Confirmed', 'Cancelled'],
        Confirmed: ['In-progress', 'Cancelled'],
        'In-progress': ['Completed'],
        Completed: [],
        Cancelled: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
};

