export const BOOKING_STATUS = {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// Validate status transitions
export const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        Requested: ['Accepted', 'Rejected', 'Cancelled'],
        Accepted: ['Completed', 'Cancelled'],
        Rejected: [],
        Completed: [],
        Cancelled: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
};
